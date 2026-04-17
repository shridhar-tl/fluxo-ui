export interface PdfExportOptions {
    title?: string;
    orientation?: 'portrait' | 'landscape';
    margin?: number;
    scale?: number;
    filename?: string;
    pageSetup?: import('../report-definition-types').PageSetup;
}

const pageSizesInPt: Record<string, { width: number; height: number }> = {
    A3: { width: 841.89, height: 1190.55 },
    A4: { width: 595.28, height: 841.89 },
    A5: { width: 419.53, height: 595.28 },
    Letter: { width: 612, height: 792 },
    Legal: { width: 612, height: 1008 },
};

const mmToPt = 72 / 25.4;
const ptToPx = 96 / 72;

function resolvePageDimensions(options: PdfExportOptions): {
    pageWidth: number;
    pageHeight: number;
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
} {
    const ps = options.pageSetup;
    if (!ps) {
        const orientation = options.orientation ?? 'portrait';
        const margin = options.margin ?? 20;
        const pageWidth = orientation === 'portrait' ? 595.28 : 841.89;
        const pageHeight = orientation === 'portrait' ? 841.89 : 595.28;
        return { pageWidth, pageHeight, marginTop: margin, marginRight: margin, marginBottom: margin, marginLeft: margin };
    }

    let w: number;
    let h: number;
    if (ps.size === 'custom') {
        w = (ps.customWidth ?? 210) * mmToPt;
        h = (ps.customHeight ?? 297) * mmToPt;
    } else {
        const size = pageSizesInPt[ps.size] ?? pageSizesInPt.A4;
        w = size.width;
        h = size.height;
    }

    if (ps.orientation === 'landscape') {
        [w, h] = [h, w];
    }

    return {
        pageWidth: w,
        pageHeight: h,
        marginTop: (ps.marginTop ?? 10) * mmToPt,
        marginRight: (ps.marginRight ?? 10) * mmToPt,
        marginBottom: (ps.marginBottom ?? 10) * mmToPt,
        marginLeft: (ps.marginLeft ?? 10) * mmToPt,
    };
}

export async function exportReportToPdf(
    element: HTMLElement,
    options: PdfExportOptions = {},
): Promise<Blob> {
    const {
        title = 'Report',
        scale = 2,
    } = options;

    const html2canvas = await loadHtml2Canvas();
    if (!html2canvas) {
        throw new Error('html2canvas is required for PDF export. Install it with: npm install html2canvas');
    }

    const dims = resolvePageDimensions(options);
    const contentWidthPt = dims.pageWidth - dims.marginLeft - dims.marginRight;
    const contentHeightPt = dims.pageHeight - dims.marginTop - dims.marginBottom;
    const captureWidthPx = Math.round(contentWidthPt * ptToPx);

    const clone = element.cloneNode(true) as HTMLElement;

    clone.querySelectorAll('.eui-rv-table-toolbar, .eui-rv-toolbar, .eui-rv-loading-bar, .eui-rv-ds-errors, .eui-rb-viewer-shimmer').forEach((el) => el.remove());

    const sourceCanvases = element.querySelectorAll('canvas');
    const clonedCanvases = clone.querySelectorAll('canvas');
    sourceCanvases.forEach((src, i) => {
        const dest = clonedCanvases[i];
        if (!dest) return;
        try {
            const img = document.createElement('img');
            img.src = src.toDataURL();
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.display = 'block';
            dest.replaceWith(img);
        } catch {
            // cross-origin canvas
        }
    });

    clone.style.cssText = `
        width: ${captureWidthPx}px !important;
        max-width: ${captureWidthPx}px !important;
        min-width: ${captureWidthPx}px !important;
        height: auto !important;
        overflow: visible !important;
        padding: 0 !important;
        margin: 0 !important;
        flex: none !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 12px !important;
        position: absolute !important;
        left: -99999px !important;
        top: 0 !important;
    `;

    document.body.appendChild(clone);
    await new Promise((r) => requestAnimationFrame(r));

    const canvas = await html2canvas(clone, {
        scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: captureWidthPx,
        height: clone.scrollHeight,
    });

    document.body.removeChild(clone);

    const pageCanvases: HTMLCanvasElement[] = [];
    const pageHeightInCanvasPx = Math.round((contentHeightPt / contentWidthPt) * canvas.width);

    for (let i = 0; ; i++) {
        const sourceY = i * pageHeightInCanvasPx;
        if (sourceY >= canvas.height) break;
        const sourceH = Math.min(pageHeightInCanvasPx, canvas.height - sourceY);
        if (sourceH <= 0) break;

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceH;
        const ctx = pageCanvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceH, 0, 0, canvas.width, sourceH);
        pageCanvases.push(pageCanvas);
    }

    if (pageCanvases.length === 0) {
        const fallback = document.createElement('canvas');
        fallback.width = canvas.width;
        fallback.height = canvas.height || 1;
        const ctx = fallback.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, fallback.width, fallback.height);
        ctx.drawImage(canvas, 0, 0);
        pageCanvases.push(fallback);
    }

    return buildPdf(title, pageCanvases, dims);
}

export async function downloadReportPdf(
    element: HTMLElement,
    options: PdfExportOptions = {},
): Promise<void> {
    const filename = options.filename ?? `${options.title ?? 'report'}.pdf`;
    const blob = await exportReportToPdf(element, options);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export function printReport(element: HTMLElement, title?: string, pageSetup?: import('../report-definition-types').PageSetup): void {
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
        if (pageSetup.size === 'custom' && pageSetup.customWidth && pageSetup.customHeight) {
            pageSize = `${pageSetup.customWidth}mm ${pageSetup.customHeight}mm`;
        } else {
            pageSize = pageSetup.size;
        }
    }

    const marginTop = pageSetup?.marginTop ?? 10;
    const marginRight = pageSetup?.marginRight ?? 10;
    const marginBottom = pageSetup?.marginBottom ?? 10;
    const marginLeft = pageSetup?.marginLeft ?? 10;

    const cloned = element.cloneNode(true) as HTMLElement;
    cloned.style.overflow = 'visible';
    cloned.style.height = 'auto';
    cloned.style.maxHeight = 'none';
    cloned.style.padding = '0';
    cloned.style.margin = '0';
    cloned.style.maxWidth = 'none';

    const sourceCanvases = element.querySelectorAll('canvas');
    const clonedCanvases = cloned.querySelectorAll('canvas');
    sourceCanvases.forEach((src, i) => {
        const dest = clonedCanvases[i];
        if (!dest) return;
        try {
            const img = document.createElement('img');
            img.src = src.toDataURL();
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.display = 'block';
            dest.replaceWith(img);
        } catch {
            // cross-origin canvas
        }
    });

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:0;height:0;border:none;';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!iframeDoc) {
        document.body.removeChild(iframe);
        return;
    }

    iframeDoc.open();
    iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title ?? 'Report'}</title>
            <style>
                ${styles}
                @page {
                    size: ${pageSize} ${orientation};
                    margin: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .eui-rv-toolbar,
                    .eui-rv-side-panel,
                    .eui-rv-loading-bar,
                    .eui-rv-ds-errors,
                    .eui-rb-viewer-shimmer,
                    .eui-rv-table-toolbar {
                        display: none !important;
                    }
                    table { break-inside: auto; }
                    thead { display: table-header-group; }
                    tr { break-inside: avoid; break-after: auto; }
                    [role='img'] { break-inside: avoid; }
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    color: #1a1a1a;
                }
            </style>
        </head>
        <body class="${document.body.className}">
        </body>
        </html>
    `);
    iframeDoc.close();
    iframeDoc.body.appendChild(iframeDoc.adoptNode(cloned));

    const cleanup = () => {
        try { document.body.removeChild(iframe); } catch { /* already removed */ }
    };

    iframe.contentWindow?.addEventListener('afterprint', cleanup);

    setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(cleanup, 2000);
    }, 200);
}

async function loadHtml2Canvas(): Promise<typeof import('html2canvas').default | null> {
    try {
        const mod = await import('html2canvas');
        return mod.default;
    } catch {
        return null;
    }
}

function buildPdf(
    title: string,
    pageCanvases: HTMLCanvasElement[],
    dims: { pageWidth: number; pageHeight: number; marginTop: number; marginRight: number; marginBottom: number; marginLeft: number },
): Blob {
    const contentWidth = dims.pageWidth - dims.marginLeft - dims.marginRight;
    const enc = new TextEncoder();
    const parts: (Uint8Array | string)[] = [];
    const objOffsets: number[] = [];
    let byteOffset = 0;

    const writeStr = (s: string) => {
        parts.push(s);
        byteOffset += enc.encode(s).length;
    };

    const writeBytes = (b: Uint8Array) => {
        parts.push(b);
        byteOffset += b.length;
    };

    const startObj = (num: number) => {
        objOffsets[num] = byteOffset;
        writeStr(`${num} 0 obj\n`);
    };

    const endObj = () => {
        writeStr('endobj\n');
    };

    writeStr('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

    const imgObjStart = 3;
    const pageCount = pageCanvases.length;

    startObj(1);
    writeStr(`<< /Type /Catalog /Pages 2 0 R >>\n`);
    endObj();

    const pageObjStart = imgObjStart + pageCount * 2;
    const pageRefs = Array.from({ length: pageCount }, (_, i) => `${pageObjStart + i} 0 R`).join(' ');
    startObj(2);
    writeStr(`<< /Type /Pages /Kids [${pageRefs}] /Count ${pageCount} >>\n`);
    endObj();

    const imgJpegData: Uint8Array[] = [];
    for (let i = 0; i < pageCount; i++) {
        const pc = pageCanvases[i];
        const jpegDataUrl = pc.toDataURL('image/jpeg', 0.92);
        const base64 = jpegDataUrl.split(',')[1];
        const binaryStr = atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let j = 0; j < binaryStr.length; j++) {
            bytes[j] = binaryStr.charCodeAt(j);
        }
        imgJpegData.push(bytes);
    }

    for (let i = 0; i < pageCount; i++) {
        const imgObjNum = imgObjStart + i * 2;
        const streamObjNum = imgObjStart + i * 2 + 1;
        const pc = pageCanvases[i];
        const jpegBytes = imgJpegData[i];

        startObj(imgObjNum);
        writeStr(`<< /Type /XObject /Subtype /Image /Width ${pc.width} /Height ${pc.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\n`);
        writeStr('stream\n');
        writeBytes(jpegBytes);
        writeStr('\nendstream\n');
        endObj();

        const drawH = (pc.height / pc.width) * contentWidth;
        const drawY = dims.pageHeight - dims.marginTop - drawH;
        const streamText = `q\n${contentWidth.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${dims.marginLeft.toFixed(2)} ${drawY.toFixed(2)} cm\n/Img${i} Do\nQ\n`;
        const streamBytes = enc.encode(streamText);

        startObj(streamObjNum);
        writeStr(`<< /Length ${streamBytes.length} >>\nstream\n`);
        writeBytes(streamBytes);
        writeStr('\nendstream\n');
        endObj();
    }

    for (let i = 0; i < pageCount; i++) {
        const pageObjNum = pageObjStart + i;
        const imgObjNum = imgObjStart + i * 2;
        const streamObjNum = imgObjStart + i * 2 + 1;

        startObj(pageObjNum);
        writeStr(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${dims.pageWidth.toFixed(2)} ${dims.pageHeight.toFixed(2)}] /Contents ${streamObjNum} 0 R /Resources << /XObject << /Img${i} ${imgObjNum} 0 R >> >> >>\n`);
        endObj();
    }

    const totalObjs = pageObjStart + pageCount;
    const xrefOffset = byteOffset;

    writeStr(`xref\n0 ${totalObjs + 1}\n`);
    writeStr('0000000000 65535 f \n');
    for (let i = 1; i <= totalObjs; i++) {
        const off = objOffsets[i] ?? 0;
        writeStr(`${String(off).padStart(10, '0')} 00000 n \n`);
    }

    writeStr(`trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R /Info << /Title (${escPdf(title)}) >> >>\n`);
    writeStr(`startxref\n${xrefOffset}\n%%EOF\n`);

    const blobParts = parts.map((p) => (typeof p === 'string' ? enc.encode(p) : p));
    return new Blob(blobParts as unknown as BlobPart[], { type: 'application/pdf' });
}

function escPdf(str: string): string {
    return str.replace(/[()\\]/g, '\\$&');
}
