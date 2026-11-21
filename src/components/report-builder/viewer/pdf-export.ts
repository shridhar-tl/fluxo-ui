import { PdfDocument } from '../../../pdf/core/pdf-document';
import { stampPageNumbers } from '../../../pdf/layout/page-furniture';
import { toBlob } from '../../../pdf/output/document-output';
import { extractTable } from '../../../pdf/html/table-extractor';
import { drawGrid } from '../../../pdf/table/draw-grid';
import type { PageSetup } from '../report-definition-types';

export interface PdfExportOptions {
    title?: string;
    orientation?: 'portrait' | 'landscape';
    /** Page margin in points, used when no page setup is given. */
    margin?: number;
    filename?: string;
    pageSetup?: PageSetup;
    /** Prints "Page n of m" at the bottom of every page. Defaults to true. */
    pageNumbers?: boolean;
}

interface Box {
    left: number;
    top: number;
    width: number;
    height: number;
}

type Leaf =
    | { kind: 'table'; box: Box; element: HTMLTableElement }
    | { kind: 'image'; box: Box; dataUrl: string }
    | { kind: 'text'; box: Box; element: HTMLElement; text: string }
    | { kind: 'rule'; box: Box; color: string };

interface Placement {
    x: number;
    width: number;
}

const pxToPt = 72 / 96;
const mmToPt = 72 / 25.4;
const excludedSelector = '.eui-rv-table-toolbar, .eui-rv-toolbar, .eui-rv-loading-bar, .eui-rv-ds-errors, .eui-rb-viewer-shimmer, .eui-rv-export-exclude, button, input, select, textarea';
const blockDisplays = new Set(['block', 'flex', 'grid', 'table', 'list-item', 'flow-root', 'table-row-group', 'table-row', 'table-cell']);
const minGraphicSize = 24;
const imageTimeoutMs = 8000;
const minRowGap = 4;
const maxRowGap = 18;
const fullWidthRatio = 0.85;

const pageSizes: Record<string, string> = { A3: 'a3', A4: 'a4', A5: 'a5', Letter: 'letter', Legal: 'legal' };

function createDocument(options: PdfExportOptions): PdfDocument {
    const ps = options.pageSetup;
    const metadata = { title: options.title ?? 'Report' };
    if (!ps) {
        return new PdfDocument({ format: 'a4', orientation: options.orientation ?? 'portrait', margin: options.margin ?? 28, metadata });
    }
    const format: string | [number, number] =
        ps.size === 'custom' ? [(ps.customWidth ?? 210) * mmToPt, (ps.customHeight ?? 297) * mmToPt] : (pageSizes[ps.size] ?? 'a4');
    return new PdfDocument({
        format,
        orientation: ps.orientation ?? 'portrait',
        margin: {
            top: (ps.marginTop ?? 10) * mmToPt,
            right: (ps.marginRight ?? 10) * mmToPt,
            bottom: (ps.marginBottom ?? 10) * mmToPt,
            left: (ps.marginLeft ?? 10) * mmToPt,
        },
        metadata,
    });
}

function nextFrame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/** Resolves once the element has stopped changing (e.g. async cell expressions settled), or after the timeout. */
export function waitForStableContent(element: HTMLElement, quietMs = 250, timeoutMs = 6000): Promise<void> {
    return new Promise((resolve) => {
        let quietTimer = 0;
        const finish = () => {
            observer.disconnect();
            window.clearTimeout(quietTimer);
            window.clearTimeout(hardTimer);
            resolve();
        };
        const observer = new MutationObserver(() => {
            window.clearTimeout(quietTimer);
            quietTimer = window.setTimeout(finish, quietMs);
        });
        observer.observe(element, { subtree: true, childList: true, characterData: true, attributes: true });
        quietTimer = window.setTimeout(finish, quietMs);
        const hardTimer = window.setTimeout(finish, timeoutMs);
    });
}

function themeVariableNames(): Set<string> {
    const names = new Set<string>();
    const rootStyle = getComputedStyle(document.documentElement);
    for (let i = 0; i < rootStyle.length; i++) {
        if (rootStyle[i].startsWith('--')) names.add(rootStyle[i]);
    }
    const visit = (rules: CSSRuleList) => {
        for (const rule of Array.from(rules)) {
            if (rule instanceof CSSStyleRule) {
                for (let i = 0; i < rule.style.length; i++) {
                    if (rule.style[i].startsWith('--')) names.add(rule.style[i]);
                }
            } else if (rule instanceof CSSGroupingRule) {
                visit(rule.cssRules);
            }
        }
    };
    for (const sheet of Array.from(document.styleSheets)) {
        try {
            visit(sheet.cssRules);
        } catch {
            continue;
        }
    }
    return names;
}

/** Root (light theme) values of every CSS variable, so the export reads well on white paper even when the app uses a dark theme. */
function lightThemeDeclarations(): string {
    const rootStyle = getComputedStyle(document.documentElement);
    const declarations: string[] = [];
    for (const name of themeVariableNames()) {
        const value = rootStyle.getPropertyValue(name).trim();
        if (value) declarations.push(`${name}: ${value};`);
    }
    return declarations.join(' ');
}

function isVisible(el: Element): boolean {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

function boxOf(el: Element, origin: DOMRect): Box {
    const rect = el.getBoundingClientRect();
    return { left: rect.left - origin.left, top: rect.top - origin.top, width: rect.width, height: rect.height };
}

function isBlock(el: Element): boolean {
    return blockDisplays.has(getComputedStyle(el).display);
}

function isGraphic(el: Element): boolean {
    if (el instanceof HTMLCanvasElement || el instanceof HTMLImageElement) return true;
    if (el instanceof SVGSVGElement) {
        const rect = el.getBoundingClientRect();
        return rect.width >= minGraphicSize && rect.height >= minGraphicSize;
    }
    return false;
}

function hasBlockContent(el: Element): boolean {
    return Array.from(el.children).some((child) => child instanceof HTMLTableElement || isGraphic(child) || (isBlock(child) && isVisible(child)) || hasBlockContent(child));
}

function ruleColor(el: HTMLElement): string | null {
    if (el.tagName === 'HR') return getComputedStyle(el).borderTopColor || '#e5e7eb';
    if ((el.textContent ?? '').trim() || el.children.length > 0) return null;
    const cs = getComputedStyle(el);
    if (el.getBoundingClientRect().height > 6) return null;
    if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') return cs.borderTopColor;
    return cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent' ? cs.backgroundColor : null;
}

function loadImage(src: string, crossOrigin: boolean): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
        const img = new Image();
        if (crossOrigin) img.crossOrigin = 'anonymous';
        const timer = window.setTimeout(() => resolve(null), imageTimeoutMs);
        img.onload = () => {
            window.clearTimeout(timer);
            resolve(img);
        };
        img.onerror = () => {
            window.clearTimeout(timer);
            resolve(null);
        };
        img.src = src;
    });
}

function drawableToPng(source: CanvasImageSource, width: number, height: number): string | null {
    const canvas = document.createElement('canvas');
    const scale = Math.min(3, Math.max(1, window.devicePixelRatio || 1) * 1.5);
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    try {
        return canvas.toDataURL('image/png');
    } catch {
        return null;
    }
}

function isCrossOrigin(src: string): boolean {
    try {
        return new URL(src, window.location.href).origin !== window.location.origin;
    } catch {
        return false;
    }
}

async function fetchAsObjectUrl(src: string): Promise<string | null> {
    for (const credentials of ['include', 'omit'] as const) {
        try {
            const response = await fetch(src, { credentials, mode: 'cors', signal: AbortSignal.timeout(imageTimeoutMs) });
            if (!response.ok) continue;
            const blob = await response.blob();
            return blob.type.startsWith('image/') ? URL.createObjectURL(blob) : null;
        } catch {
            continue;
        }
    }
    return null;
}

async function imageToPng(img: HTMLImageElement, box: Box): Promise<string | null> {
    const src = img.currentSrc || img.src;
    if (!src) return null;
    const crossOrigin = isCrossOrigin(src);
    const loaded = await loadImage(src, crossOrigin);
    const direct = loaded ? drawableToPng(loaded, box.width, box.height) : null;
    if (direct || !crossOrigin) return direct;
    const objectUrl = await fetchAsObjectUrl(src);
    if (!objectUrl) return null;
    try {
        const fetched = await loadImage(objectUrl, false);
        return fetched ? drawableToPng(fetched, box.width, box.height) : null;
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

const inlinedSvgProperties = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-dasharray', 'stop-color', 'stop-opacity', 'opacity', 'font-family', 'font-size', 'font-weight', 'text-anchor', 'dominant-baseline'];

async function svgToPng(svg: SVGSVGElement, box: Box): Promise<string | null> {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const sourceNodes = [svg, ...Array.from(svg.querySelectorAll('*'))];
    const cloneNodes = [clone, ...Array.from(clone.querySelectorAll('*'))];
    sourceNodes.forEach((node, i) => {
        const target = cloneNodes[i];
        if (!(target instanceof SVGElement)) return;
        const cs = getComputedStyle(node);
        for (const prop of inlinedSvgProperties) {
            const value = cs.getPropertyValue(prop);
            if (value) target.style.setProperty(prop, value);
        }
        if (node === svg) target.style.setProperty('color', cs.color);
    });
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(box.width));
    clone.setAttribute('height', String(box.height));
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }));
    try {
        const img = await loadImage(url, false);
        return img ? drawableToPng(img, box.width, box.height) : null;
    } finally {
        URL.revokeObjectURL(url);
    }
}

async function graphicToPng(el: Element, box: Box): Promise<string | null> {
    if (el instanceof HTMLCanvasElement) return drawableToPng(el, box.width, box.height);
    if (el instanceof HTMLImageElement) return imageToPng(el, box);
    if (el instanceof SVGSVGElement) return svgToPng(el, box);
    return null;
}

/** Collects the printable blocks of the report in document order: tables, graphics, text and separators. */
async function collectLeaves(root: HTMLElement): Promise<Leaf[]> {
    const origin = root.getBoundingClientRect();
    const leaves: Leaf[] = [];

    const visit = async (el: Element): Promise<void> => {
        if (el.matches(excludedSelector) || !isVisible(el)) return;
        const box = boxOf(el, origin);
        if (el instanceof HTMLTableElement) {
            leaves.push({ kind: 'table', box, element: el });
            return;
        }
        if (isGraphic(el)) {
            const dataUrl = await graphicToPng(el, box);
            if (dataUrl) leaves.push({ kind: 'image', box, dataUrl });
            return;
        }
        if (!(el instanceof HTMLElement)) return;
        const color = ruleColor(el);
        if (color) {
            leaves.push({ kind: 'rule', box, color });
            return;
        }
        if (!hasBlockContent(el)) {
            const text = el.innerText.trim();
            if (text) leaves.push({ kind: 'text', box, element: el, text });
            return;
        }
        for (const child of Array.from(el.children)) await visit(child);
    };

    for (const child of Array.from(root.children)) await visit(child);
    return leaves;
}

/** Groups blocks that sit next to each other (e.g. in columns) into rows. */
function groupRows(leaves: Leaf[]): Leaf[][] {
    const sorted = [...leaves].sort((a, b) => a.box.top - b.box.top || a.box.left - b.box.left);
    const rows: Array<{ bottom: number; items: Leaf[] }> = [];
    for (const leaf of sorted) {
        const current = rows[rows.length - 1];
        if (current && leaf.box.top < current.bottom - 1) {
            current.items.push(leaf);
            current.bottom = Math.max(current.bottom, leaf.box.top + leaf.box.height);
        } else {
            rows.push({ bottom: leaf.box.top + leaf.box.height, items: [leaf] });
        }
    }
    return rows.map((r) => r.items.sort((a, b) => a.box.left - b.box.left));
}

function textStyle(el: HTMLElement) {
    const cs = getComputedStyle(el);
    const weight = parseInt(cs.fontWeight, 10);
    const align = cs.textAlign === 'center' || cs.textAlign === 'right' || cs.textAlign === 'justify' ? cs.textAlign : 'left';
    return {
        fontSize: (parseFloat(cs.fontSize) || 13) * pxToPt,
        bold: cs.fontWeight === 'bold' || (Number.isFinite(weight) && weight >= 600),
        italic: cs.fontStyle === 'italic',
        color: cs.color,
        align: align as 'left' | 'center' | 'right' | 'justify',
    };
}

class ReportPdfLayout {
    private y: number;

    constructor(
        private readonly doc: PdfDocument,
        private readonly rootWidth: number,
    ) {
        this.y = doc.margin.top;
    }

    private get scale(): number {
        return this.doc.contentWidth / Math.max(1, this.rootWidth);
    }

    private get remaining(): number {
        return this.doc.pageHeight - this.doc.margin.bottom - this.y;
    }

    private placement(box: Box): Placement {
        if (box.width >= this.rootWidth * fullWidthRatio) return { x: this.doc.margin.left, width: this.doc.contentWidth };
        const x = this.doc.margin.left + Math.max(0, box.left) * this.scale;
        return { x, width: Math.min(box.width * this.scale, this.doc.pageWidth - this.doc.margin.right - x) };
    }

    private newPage(): void {
        this.doc.addPage();
        this.y = this.doc.margin.top;
    }

    private measure(leaf: Leaf, width: number): number {
        switch (leaf.kind) {
            case 'text': {
                const style = textStyle(leaf.element);
                return this.doc.splitText(leaf.text, width, style).length * this.doc.getLineHeight(style.fontSize);
            }
            case 'image':
                return (leaf.box.height / leaf.box.width) * width;
            case 'rule':
                return 2;
            case 'table':
                return leaf.box.height * this.scale;
        }
    }

    private drawAt(leaf: Leaf, place: Placement, y: number, height: number): number {
        switch (leaf.kind) {
            case 'text':
                return this.doc.drawTextBlock(leaf.text, place.x, y, place.width, textStyle(leaf.element)).height;
            case 'image':
                this.doc.drawImage(leaf.dataUrl, { x: place.x, y, width: place.width, height });
                return height;
            case 'rule':
                this.doc.drawLine(place.x, y + 1, place.x + place.width, y + 1, { strokeColor: leaf.color, lineWidth: 0.75 });
                return 2;
            case 'table':
                return this.drawTable(leaf.element, place, y) - y;
        }
    }

    private drawTable(element: HTMLTableElement, place: Placement, y: number): number {
        const extracted = extractTable(element, { inheritStyles: true });
        const result = drawGrid(this.doc, {
            startY: y,
            margin: {
                top: this.doc.margin.top,
                bottom: this.doc.margin.bottom,
                left: place.x,
                right: this.doc.pageWidth - place.x - place.width,
            },
            width: 'full',
            overflowColumns: 'shrink',
            repeat: { header: 'everyPage', footer: 'lastPage' },
            columns: extracted.columns,
            head: extracted.head,
            body: extracted.body,
            foot: extracted.foot,
        });
        return result.finalY;
    }

    private drawSingle(leaf: Leaf): void {
        const place = this.placement(leaf.box);
        if (leaf.kind === 'table') {
            if (this.remaining < this.doc.getLineHeight(10) * 3) this.newPage();
            this.y = this.drawTable(leaf.element, place, this.y);
            return;
        }
        if (leaf.kind === 'text') {
            this.drawFlowingText(leaf, place);
            return;
        }
        let height = this.measure(leaf, place.width);
        const maxHeight = this.doc.contentHeight;
        let width = place.width;
        if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }
        if (height > this.remaining) this.newPage();
        this.y += this.drawAt(leaf, { x: place.x, width }, this.y, height);
    }

    private drawFlowingText(leaf: Extract<Leaf, { kind: 'text' }>, place: Placement): void {
        const style = textStyle(leaf.element);
        const lineHeight = this.doc.getLineHeight(style.fontSize);
        let lines = this.doc.splitText(leaf.text, place.width, style);
        while (lines.length > 0) {
            if (this.remaining < lineHeight) this.newPage();
            const fit = Math.max(1, Math.floor(this.remaining / lineHeight));
            const slice = lines.slice(0, fit);
            this.doc.drawText(slice.join('\n'), place.x, this.y, { ...style, baseline: 'top', maxWidth: place.width });
            this.y += slice.length * lineHeight;
            lines = lines.slice(fit);
            if (lines.length > 0) this.newPage();
        }
    }

    private drawRow(row: Leaf[]): void {
        const placements = row.map((leaf) => this.placement(leaf.box));
        const heights = row.map((leaf, i) => this.measure(leaf, placements[i].width));
        const rowHeight = Math.max(...heights);
        if (rowHeight > this.doc.contentHeight) {
            row.forEach((leaf) => this.drawSingle(leaf));
            return;
        }
        if (rowHeight > this.remaining) this.newPage();
        const top = this.y;
        let bottom = top;
        row.forEach((leaf, i) => {
            bottom = Math.max(bottom, top + this.drawAt(leaf, placements[i], top, heights[i]));
        });
        this.y = bottom;
    }

    render(rows: Leaf[][]): void {
        let previousBottom: number | null = null;
        for (const row of rows) {
            const top = Math.min(...row.map((l) => l.box.top));
            if (previousBottom !== null) {
                const gap = Math.min(maxRowGap, Math.max(minRowGap, (top - previousBottom) * this.scale));
                if (this.remaining > gap) this.y += gap;
            }
            if (row.length === 1) this.drawSingle(row[0]);
            else this.drawRow(row);
            previousBottom = Math.max(...row.map((l) => l.box.top + l.box.height));
        }
    }
}

/**
 * Builds a PDF of the rendered report with the fluxo PDF toolkit: tables become paged grids with repeated
 * headers, charts and images are embedded, text keeps its size and color, and side-by-side blocks keep their columns.
 */
export async function exportReportToPdf(element: HTMLElement, options: PdfExportOptions = {}): Promise<Blob> {
    const previousStyle = element.getAttribute('style');
    element.setAttribute('style', `${previousStyle ?? ''}; ${lightThemeDeclarations()} background: #ffffff; color-scheme: light;`);
    try {
        await nextFrame();
        await nextFrame();
        const doc = createDocument(options);
        const leaves = await collectLeaves(element);
        new ReportPdfLayout(doc, element.getBoundingClientRect().width).render(groupRows(leaves));
        if (options.pageNumbers !== false) stampPageNumbers(doc);
        return toBlob(doc.build());
    } finally {
        if (previousStyle === null) element.removeAttribute('style');
        else element.setAttribute('style', previousStyle);
    }
}

export async function downloadReportPdf(element: HTMLElement, options: PdfExportOptions = {}): Promise<void> {
    const filename = options.filename ?? `${options.title ?? 'report'}.pdf`;
    const blob = await exportReportToPdf(element, options);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function bodyClassForExport(): string {
    return document.body.className
        .split(/\s+/)
        .filter((c) => c && c !== 'mode-dark')
        .concat('mode-light')
        .join(' ');
}

function replaceCanvases(source: HTMLElement, clone: HTMLElement): void {
    const sourceCanvases = source.querySelectorAll('canvas');
    const clonedCanvases = clone.querySelectorAll('canvas');
    sourceCanvases.forEach((src, i) => {
        const dest = clonedCanvases[i];
        if (!dest) return;
        let dataUrl: string;
        try {
            dataUrl = src.toDataURL('image/png');
        } catch {
            return;
        }
        const rect = src.getBoundingClientRect();
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = src.getAttribute('aria-label') ?? '';
        img.style.display = 'block';
        img.style.maxWidth = '100%';
        img.style.width = rect.width > 0 ? `${rect.width}px` : '100%';
        img.style.height = rect.height > 0 ? `${rect.height}px` : 'auto';
        dest.replaceWith(img);
    });
}

function expandScrollContainers(root: HTMLElement): void {
    const scrolls = (v: string) => v === 'auto' || v === 'scroll';
    for (const el of [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]) {
        const cs = getComputedStyle(el);
        if (!scrolls(cs.overflowX) && !scrolls(cs.overflowY)) continue;
        el.style.overflow = 'visible';
        el.style.maxHeight = 'none';
        el.style.height = 'auto';
    }
}

function waitForImages(root: HTMLElement): Promise<void> {
    const pending = Array.from(root.querySelectorAll('img')).filter((img) => !img.complete);
    return Promise.all(
        pending.map(
            (img) =>
                new Promise<void>((resolve) => {
                    const timer = window.setTimeout(resolve, imageTimeoutMs);
                    const done = () => {
                        window.clearTimeout(timer);
                        resolve();
                    };
                    img.addEventListener('load', done, { once: true });
                    img.addEventListener('error', done, { once: true });
                }),
        ),
    ).then(() => undefined);
}

export async function printReport(element: HTMLElement, title?: string, pageSetup?: PageSetup): Promise<void> {
    const styles = Array.from(document.styleSheets)
        .map((sheet) => {
            try {
                return Array.from(sheet.cssRules).map((r) => r.cssText).join('\n');
            } catch {
                return '';
            }
        })
        .join('\n');

    const orientation = pageSetup?.orientation ?? 'portrait';
    let pageSize = 'A4';
    if (pageSetup) {
        pageSize = pageSetup.size === 'custom' && pageSetup.customWidth && pageSetup.customHeight ? `${pageSetup.customWidth}mm ${pageSetup.customHeight}mm` : pageSetup.size;
    }

    const cloned = element.cloneNode(true) as HTMLElement;
    cloned.querySelectorAll(excludedSelector).forEach((el) => el.remove());
    replaceCanvases(element, cloned);
    cloned.style.overflow = 'visible';
    cloned.style.height = 'auto';
    cloned.style.maxHeight = 'none';
    cloned.style.padding = '0';
    cloned.style.margin = '0';
    cloned.style.maxWidth = 'none';
    cloned.querySelectorAll('img').forEach((img) => {
        img.loading = 'eager';
    });

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:1024px;height:768px;border:none;';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!iframeDoc) {
        iframe.remove();
        throw new Error('The browser blocked the print preview.');
    }

    iframeDoc.open();
    iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${escapeHtml(title ?? 'Report')}</title>
            <style>
                ${styles}
                @page {
                    size: ${pageSize} ${orientation};
                    margin: ${pageSetup?.marginTop ?? 10}mm ${pageSetup?.marginRight ?? 10}mm ${pageSetup?.marginBottom ?? 10}mm ${pageSetup?.marginLeft ?? 10}mm;
                }
                html, body { background: #ffffff; color-scheme: light; }
                body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                table { break-inside: auto; }
                thead { display: table-header-group; }
                tfoot { display: table-footer-group; }
                tr, img, svg, figure, [role='img'], .eui-rv-repeater-item, .eui-rv-keep-together { break-inside: avoid; }
                h1, h2, h3, h4, h5, h6, .eui-rv-tab-export-title { break-after: avoid; }
            </style>
        </head>
        <body class="${escapeHtml(bodyClassForExport())}" style="${escapeHtml(lightThemeDeclarations())}">
        </body>
        </html>
    `);
    iframeDoc.close();
    const adopted = iframeDoc.adoptNode(cloned);
    iframeDoc.body.appendChild(adopted);
    expandScrollContainers(adopted);
    await waitForImages(adopted);

    const cleanup = () => iframe.remove();
    iframe.contentWindow?.addEventListener('afterprint', cleanup);
    await nextFrame();
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    window.setTimeout(cleanup, 60000);
}
