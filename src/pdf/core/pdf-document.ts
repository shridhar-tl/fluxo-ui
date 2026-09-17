import {
    ContentStream,
    type Matrix,
    ellipsePath,
    multiplyMatrix,
    roundedRectanglePath,
    rotationMatrix,
    translationMatrix,
} from '../graphics/content-stream';
import { type DecodedImage, type ImageSource, decodeImage } from '../graphics/image-data';
import { embedImage } from '../graphics/image-embedder';
import { encodeWinAnsi } from '../text/encoding';
import {
    FontRegistry,
    type RegisteredFont,
    fontAscent,
    measureTextWidth,
} from '../text/font-registry';
import { wrapText } from '../text/line-breaker';
import { ByteWriter } from './byte-writer';
import { type ColorInput, type RgbaColor, parseColor } from './color';
import { deflateCompress } from './deflate-encoder';
import type {
    DocumentMetadata,
    DocumentOptions,
    HorizontalAlign,
    ImageOptions,
    LinkOptions,
    OutlineEntry,
    PageOptions,
    ShapeStyle,
    TextOptions,
} from './document-types';
import {
    type EdgeInsets,
    type LengthUnit,
    type PageOrientation,
    type Size,
    fromPoints,
    normalizeEdgeInsets,
    resolvePageSize,
    unitScale,
} from './geometry';
import {
    PdfArray,
    PdfDict,
    PdfName,
    PdfObjectStore,
    type PdfRef,
    PdfStream,
    PdfString,
    pdfTextString,
    writeIndirectObject,
} from './objects';

interface PageState {
    size: Size;
    margin: EdgeInsets;
    stream: ContentStream;
    annotations: PdfDict[];
}

interface ImageResource {
    ref: PdfRef;
    resourceName: string;
    width: number;
    height: number;
}

interface AlphaResource {
    resourceName: string;
    fillAlpha: number;
    strokeAlpha: number;
}

const defaultProducer = 'FluxoUI PDF';

export class PdfDocument {
    private readonly pages: PageState[] = [];
    private readonly fonts = new FontRegistry();
    private readonly images = new Map<string, ImageResource>();
    private readonly alphaStates = new Map<string, AlphaResource>();
    private readonly outlines: OutlineEntry[] = [];
    private readonly pendingImages: {
        key: string;
        decoded: DecodedImage;
        embed: (store: PdfObjectStore, decoded: DecodedImage, target: PdfRef) => void;
    }[] = [];

    private pageIndex = -1;
    private imageCounter = 0;
    private alphaCounter = 0;

    readonly unit: LengthUnit;
    readonly scale: number;

    private readonly defaultSize: Size;
    private readonly defaultOrientation: PageOrientation;
    private readonly defaultMargin: EdgeInsets;
    private readonly metadata: DocumentMetadata;
    private readonly compress: boolean;
    private readonly lineHeightFactor: number;
    private readonly language?: string;
    private readonly displayTitleInWindow: boolean;

    private currentFont: RegisteredFont;
    private currentFontSize: number;
    private currentFillColor: RgbaColor = { r: 0, g: 0, b: 0, a: 1 };
    private currentStrokeColor: RgbaColor = { r: 0, g: 0, b: 0, a: 1 };
    private currentLineWidth = 1;

    constructor(options: DocumentOptions = {}) {
        this.unit = options.unit ?? 'pt';
        this.scale = unitScale(this.unit);
        this.defaultOrientation = options.orientation ?? 'portrait';
        this.defaultSize = resolvePageSize(options.format ?? 'a4', this.unit, this.defaultOrientation);
        this.defaultMargin = normalizeEdgeInsets(options.margin, fromPoints(40, this.unit));
        this.metadata = { producer: defaultProducer, creationDate: new Date(), ...options.metadata };
        this.compress = options.compress !== false;
        this.lineHeightFactor = options.lineHeightFactor ?? 1.15;
        this.language = options.language;
        this.displayTitleInWindow = options.displayTitleInWindow ?? true;

        this.currentFont = this.fonts.resolve({ family: options.defaultFont ?? 'Helvetica' });
        this.currentFontSize = options.defaultFontSize ?? 11;

        this.addPage();
    }

    private get page(): PageState {
        const page = this.pages[this.pageIndex];
        if (!page) throw new Error('The document has no active page.');
        return page;
    }

    private get stream(): ContentStream {
        return this.page.stream;
    }

    private toPt(value: number): number {
        return value * this.scale;
    }

    private toUserUnits(value: number): number {
        return value / this.scale;
    }

    private deviceY(userY: number): number {
        return this.page.size.height - this.toPt(userY);
    }

    get pageCount(): number {
        return this.pages.length;
    }

    get currentPageIndex(): number {
        return this.pageIndex;
    }

    get pageWidth(): number {
        return this.toUserUnits(this.page.size.width);
    }

    get pageHeight(): number {
        return this.toUserUnits(this.page.size.height);
    }

    get margin(): EdgeInsets {
        return { ...this.page.margin };
    }

    get contentWidth(): number {
        return this.pageWidth - this.page.margin.left - this.page.margin.right;
    }

    get contentHeight(): number {
        return this.pageHeight - this.page.margin.top - this.page.margin.bottom;
    }

    addPage(options: PageOptions = {}): this {
        const orientation = options.orientation ?? this.defaultOrientation;
        const size = options.format
            ? resolvePageSize(options.format, this.unit, orientation)
            : options.orientation
              ? resolvePageSize({ width: this.toUserUnits(this.defaultSize.width), height: this.toUserUnits(this.defaultSize.height) }, this.unit, orientation)
              : { ...this.defaultSize };

        this.pages.push({
            size,
            margin: options.margin ? normalizeEdgeInsets(options.margin) : { ...this.defaultMargin },
            stream: new ContentStream(),
            annotations: [],
        });

        this.pageIndex = this.pages.length - 1;
        this.applyBaselineState();
        return this;
    }

    goToPage(index: number): this {
        if (index < 0 || index >= this.pages.length) {
            throw new Error(`Page index ${index} is out of range (document has ${this.pages.length} pages).`);
        }
        this.pageIndex = index;
        return this;
    }

    insertPage(index: number, options: PageOptions = {}): this {
        this.addPage(options);
        const created = this.pages.pop();
        if (created) {
            this.pages.splice(index, 0, created);
            this.pageIndex = index;
        }
        return this;
    }

    removePage(index: number): this {
        if (this.pages.length <= 1) throw new Error('A document must retain at least one page.');
        this.pages.splice(index, 1);
        if (this.pageIndex >= this.pages.length) this.pageIndex = this.pages.length - 1;
        return this;
    }

    private applyBaselineState(): void {
        this.stream.setFillColor(this.currentFillColor);
        this.stream.setStrokeColor(this.currentStrokeColor);
        this.stream.setLineWidth(this.toPt(this.currentLineWidth));
    }

    setFont(family: string, options: { bold?: boolean; italic?: boolean; size?: number } = {}): this {
        this.currentFont = this.fonts.resolve({ family, bold: options.bold, italic: options.italic });
        if (options.size !== undefined) this.currentFontSize = options.size;
        return this;
    }

    setFontSize(size: number): this {
        this.currentFontSize = size;
        return this;
    }

    getFontSize(): number {
        return this.currentFontSize;
    }

    setFillColor(color: ColorInput): this {
        const parsed = parseColor(color);
        if (parsed) {
            this.currentFillColor = parsed;
            this.stream.setFillColor(parsed);
        }
        return this;
    }

    setStrokeColor(color: ColorInput): this {
        const parsed = parseColor(color);
        if (parsed) {
            this.currentStrokeColor = parsed;
            this.stream.setStrokeColor(parsed);
        }
        return this;
    }

    setLineWidth(width: number): this {
        this.currentLineWidth = width;
        this.stream.setLineWidth(this.toPt(width));
        return this;
    }

    private resolveAlphaState(fillAlpha: number, strokeAlpha: number): string | null {
        if (fillAlpha >= 1 && strokeAlpha >= 1) return null;

        const key = `${fillAlpha.toFixed(3)}:${strokeAlpha.toFixed(3)}`;
        const existing = this.alphaStates.get(key);
        if (existing) return existing.resourceName;

        this.alphaCounter += 1;
        const resourceName = `GS${this.alphaCounter}`;
        this.alphaStates.set(key, { resourceName, fillAlpha, strokeAlpha });
        return resourceName;
    }

    private applyShapeStyle(style: ShapeStyle): { hasFill: boolean; hasStroke: boolean } {
        const fill = parseColor(style.fillColor ?? null);
        const stroke = parseColor(style.strokeColor ?? null);

        const fillAlpha = style.fillOpacity ?? style.opacity ?? (fill ? fill.a : 1);
        const strokeAlpha = style.strokeOpacity ?? style.opacity ?? (stroke ? stroke.a : 1);

        const alphaState = this.resolveAlphaState(fillAlpha, strokeAlpha);
        if (alphaState) this.stream.setExtGraphicsState(alphaState);

        if (fill) this.stream.setFillColor(fill);
        if (stroke) this.stream.setStrokeColor(stroke);
        if (style.lineWidth !== undefined) this.stream.setLineWidth(this.toPt(style.lineWidth));
        if (style.lineCap) this.stream.setLineCap(style.lineCap);
        if (style.lineJoin) this.stream.setLineJoin(style.lineJoin);
        if (style.dashPattern) {
            this.stream.setDashPattern(
                style.dashPattern.map((value) => this.toPt(value)),
                this.toPt(style.dashPhase ?? 0),
            );
        }

        return { hasFill: fill !== null && fillAlpha > 0, hasStroke: stroke !== null && strokeAlpha > 0 };
    }

    private paintModeFor(hasFill: boolean, hasStroke: boolean): 'fill' | 'stroke' | 'fillStroke' | 'none' {
        if (hasFill && hasStroke) return 'fillStroke';
        if (hasFill) return 'fill';
        if (hasStroke) return 'stroke';
        return 'none';
    }

    drawRectangle(x: number, y: number, width: number, height: number, style: ShapeStyle & { radius?: number } = {}): this {
        this.stream.saveState();
        const { hasFill, hasStroke } = this.applyShapeStyle(style);

        const deviceX = this.toPt(x);
        const deviceWidth = this.toPt(width);
        const deviceHeight = this.toPt(height);
        const deviceY = this.deviceY(y) - deviceHeight;

        if (style.radius && style.radius > 0) {
            roundedRectanglePath(this.stream, deviceX, deviceY, deviceWidth, deviceHeight, this.toPt(style.radius));
        } else {
            this.stream.rectangle(deviceX, deviceY, deviceWidth, deviceHeight);
        }

        this.stream.paint(this.paintModeFor(hasFill, hasStroke));
        this.stream.restoreState();
        return this;
    }

    drawLine(x1: number, y1: number, x2: number, y2: number, style: ShapeStyle = {}): this {
        this.stream.saveState();
        const resolved: ShapeStyle = { strokeColor: style.strokeColor ?? this.currentStrokeColor, ...style };
        this.applyShapeStyle(resolved);

        this.stream.moveTo(this.toPt(x1), this.deviceY(y1));
        this.stream.lineTo(this.toPt(x2), this.deviceY(y2));
        this.stream.paint('stroke');
        this.stream.restoreState();
        return this;
    }

    drawCircle(centerX: number, centerY: number, radius: number, style: ShapeStyle = {}): this {
        return this.drawEllipse(centerX, centerY, radius, radius, style);
    }

    drawEllipse(centerX: number, centerY: number, radiusX: number, radiusY: number, style: ShapeStyle = {}): this {
        this.stream.saveState();
        const { hasFill, hasStroke } = this.applyShapeStyle(style);

        ellipsePath(this.stream, this.toPt(centerX), this.deviceY(centerY), this.toPt(radiusX), this.toPt(radiusY));
        this.stream.paint(this.paintModeFor(hasFill, hasStroke));
        this.stream.restoreState();
        return this;
    }

    drawPolygon(points: { x: number; y: number }[], style: ShapeStyle & { close?: boolean } = {}): this {
        if (points.length < 2) return this;

        this.stream.saveState();
        const { hasFill, hasStroke } = this.applyShapeStyle(style);

        this.stream.moveTo(this.toPt(points[0].x), this.deviceY(points[0].y));
        for (let index = 1; index < points.length; index += 1) {
            this.stream.lineTo(this.toPt(points[index].x), this.deviceY(points[index].y));
        }
        if (style.close !== false) this.stream.closePath();

        this.stream.paint(this.paintModeFor(hasFill, hasStroke));
        this.stream.restoreState();
        return this;
    }

    drawPath(builder: (path: PathBuilder) => void, style: ShapeStyle = {}): this {
        this.stream.saveState();
        const { hasFill, hasStroke } = this.applyShapeStyle(style);

        builder(new PathBuilder(this.stream, (value) => this.toPt(value), (value) => this.deviceY(value)));
        this.stream.paint(this.paintModeFor(hasFill, hasStroke));
        this.stream.restoreState();
        return this;
    }

    private resolveFontFor(options: TextOptions): RegisteredFont {
        if (options.font || options.bold !== undefined || options.italic !== undefined) {
            return this.fonts.resolve({
                family: options.font ?? this.currentFont.postScriptName,
                bold: options.bold,
                italic: options.italic,
            });
        }
        return this.currentFont;
    }

    measureText(text: string, options: TextOptions = {}): number {
        const font = this.resolveFontFor(options);
        const fontSize = options.fontSize ?? this.currentFontSize;

        return this.toUserUnits(
            measureTextWidth(font, text, {
                fontSize,
                characterSpacing: this.toPt(options.characterSpacing ?? 0),
                wordSpacing: this.toPt(options.wordSpacing ?? 0),
            }),
        );
    }

    splitText(text: string, maxWidth: number, options: TextOptions = {}): string[] {
        const font = this.resolveFontFor(options);
        const fontSize = options.fontSize ?? this.currentFontSize;

        return wrapText(font, text, {
            fontSize,
            maxWidth: this.toPt(maxWidth),
            characterSpacing: this.toPt(options.characterSpacing ?? 0),
            wordSpacing: this.toPt(options.wordSpacing ?? 0),
            maxLines: options.maxLines,
            ellipsis: options.ellipsis,
        }).map((line) => line.text);
    }

    getLineHeight(fontSize?: number, factor?: number): number {
        const size = fontSize ?? this.currentFontSize;
        return this.toUserUnits(size * (factor ?? this.lineHeightFactor));
    }

    drawText(text: string, x: number, y: number, options: TextOptions = {}): this {
        const font = this.resolveFontFor(options);
        const fontSize = options.fontSize ?? this.currentFontSize;
        const align: HorizontalAlign = options.align ?? 'left';
        const lineHeightPt = fontSize * (options.lineHeightFactor ?? this.lineHeightFactor);

        const characterSpacingPt = this.toPt(options.characterSpacing ?? 0);
        const wordSpacingPt = this.toPt(options.wordSpacing ?? 0);

        const maxWidthPt = options.maxWidth !== undefined ? this.toPt(options.maxWidth) : Number.POSITIVE_INFINITY;
        const lines =
            options.maxWidth !== undefined || options.maxLines !== undefined
                ? wrapText(font, text, {
                      fontSize,
                      maxWidth: maxWidthPt,
                      characterSpacing: characterSpacingPt,
                      wordSpacing: wordSpacingPt,
                      maxLines: options.maxLines,
                      ellipsis: options.ellipsis,
                  })
                : text.split(/\r\n|\r|\n/).map((line) => ({
                      text: line,
                      width: measureTextWidth(font, line, {
                          fontSize,
                          characterSpacing: characterSpacingPt,
                          wordSpacing: wordSpacingPt,
                      }),
                      truncated: false,
                  }));

        const color = parseColor(options.color ?? this.currentFillColor) ?? this.currentFillColor;
        const opacity = options.opacity ?? color.a;

        this.stream.saveState();

        const alphaState = this.resolveAlphaState(opacity, opacity);
        if (alphaState) this.stream.setExtGraphicsState(alphaState);

        this.stream.setFillColor(color);
        this.stream.setStrokeColor(color);

        const baselineOffset = this.baselineOffsetFor(options.baseline, font, fontSize);
        const originX = this.toPt(x);
        const originY = this.deviceY(y) - baselineOffset;

        const rotation = options.rotation ?? 0;
        let transform: Matrix | null = null;
        if (rotation !== 0) {
            transform = multiplyMatrix(rotationMatrix(rotation), translationMatrix(originX, originY));
        }

        this.stream.beginText();
        this.stream.setFont(font.resourceName, fontSize);
        if (characterSpacingPt !== 0) this.stream.setCharacterSpacing(characterSpacingPt);
        if (wordSpacingPt !== 0) this.stream.setWordSpacing(wordSpacingPt);
        if (options.renderMode) this.stream.setTextRenderMode(options.renderMode);

        const referenceWidth = maxWidthPt === Number.POSITIVE_INFINITY ? Math.max(...lines.map((line) => line.width), 0) : maxWidthPt;
        const anchorShift =
            options.anchor === 'point' ? (align === 'right' ? -referenceWidth : align === 'center' ? -referenceWidth / 2 : 0) : 0;

        lines.forEach((line, index) => {
            const offsetX = anchorShift + this.alignmentOffset(align, line.width, referenceWidth);
            const lineY = -index * lineHeightPt;

            if (transform) {
                const lineMatrix = multiplyMatrix(translationMatrix(offsetX, lineY), transform);
                this.stream.setTextMatrix(lineMatrix);
            } else {
                this.stream.setTextMatrix(translationMatrix(originX + offsetX, originY + lineY));
            }

            this.stream.showText(encodeWinAnsi(line.text));
        });

        this.stream.endText();

        if (options.underline || options.strikeThrough) {
            this.drawTextDecorations(
                lines,
                font,
                fontSize,
                originX + anchorShift,
                originY,
                lineHeightPt,
                align,
                referenceWidth,
                options,
            );
        }

        this.stream.restoreState();
        return this;
    }

    private baselineOffsetFor(
        baseline: TextOptions['baseline'],
        font: RegisteredFont,
        fontSize: number,
    ): number {
        if (baseline === 'top') return fontAscent(font, fontSize);
        if (baseline === 'middle') return fontAscent(font, fontSize) / 2;
        if (baseline === 'bottom') return 0;
        return 0;
    }

    private alignmentOffset(align: HorizontalAlign, lineWidth: number, referenceWidth: number): number {
        if (align === 'center') return (referenceWidth - lineWidth) / 2;
        if (align === 'right') return referenceWidth - lineWidth;
        return 0;
    }

    private drawTextDecorations(
        lines: { text: string; width: number }[],
        font: RegisteredFont,
        fontSize: number,
        originX: number,
        originY: number,
        lineHeightPt: number,
        align: HorizontalAlign,
        referenceWidth: number,
        options: TextOptions,
    ): void {
        const thickness = Math.max(0.4, fontSize / 18);
        this.stream.setLineWidth(thickness);

        lines.forEach((line, index) => {
            if (line.text.length === 0) return;
            const offsetX = this.alignmentOffset(align, line.width, referenceWidth);
            const lineY = originY - index * lineHeightPt;
            const startX = originX + offsetX;

            if (options.underline) {
                const underlineY = lineY - fontSize * 0.12;
                this.stream.moveTo(startX, underlineY);
                this.stream.lineTo(startX + line.width, underlineY);
                this.stream.paint('stroke');
            }

            if (options.strikeThrough) {
                const strikeY = lineY + (font.metrics.capHeight / 1000) * fontSize * 0.32;
                this.stream.moveTo(startX, strikeY);
                this.stream.lineTo(startX + line.width, strikeY);
                this.stream.paint('stroke');
            }
        });
    }

    drawTextBlock(
        text: string,
        x: number,
        y: number,
        width: number,
        options: TextOptions = {},
    ): { height: number; lineCount: number } {
        const fontSize = options.fontSize ?? this.currentFontSize;
        const lineHeight = this.getLineHeight(fontSize, options.lineHeightFactor);
        const lines = this.splitText(text, width, options);

        this.drawText(text, x, y, { ...options, maxWidth: width, baseline: options.baseline ?? 'top' });

        return { height: lines.length * lineHeight, lineCount: lines.length };
    }

    private registerImage(source: ImageSource): ImageResource {
        const key = typeof source === 'string' ? source : `binary:${source.byteLength}:${this.imageCounter}`;
        const existing = this.images.get(key);
        if (existing) return existing;

        const decoded = decodeImage(source);
        this.imageCounter += 1;

        const resource: ImageResource = {
            ref: { id: -1, generation: 0 } as PdfRef,
            resourceName: `Im${this.imageCounter}`,
            width: decoded.width,
            height: decoded.height,
        };

        this.images.set(key, resource);
        this.pendingImages.push({ key, decoded, embed: embedImage });
        return resource;
    }

    drawImage(source: ImageSource, options: ImageOptions): this {
        const image = this.registerImage(source);

        const aspectRatio = image.width / image.height;
        let width: number;
        let height: number;

        if (options.width === undefined && options.height === undefined) {
            width = this.toUserUnits(image.width);
            height = this.toUserUnits(image.height);
        } else if (options.width === undefined) {
            height = options.height as number;
            width = height * aspectRatio;
        } else if (options.height === undefined) {
            width = options.width;
            height = width / aspectRatio;
        } else {
            width = options.width;
            height = options.height;
        }

        if (options.fit === 'contain' || options.fit === 'cover') {
            const boxRatio = width / height;
            const scaleToFit = options.fit === 'contain' ? boxRatio > aspectRatio : boxRatio < aspectRatio;
            if (scaleToFit) {
                width = height * aspectRatio;
            } else {
                height = width / aspectRatio;
            }
        }

        this.stream.saveState();

        const alphaState = this.resolveAlphaState(options.opacity ?? 1, options.opacity ?? 1);
        if (alphaState) this.stream.setExtGraphicsState(alphaState);

        const deviceWidth = this.toPt(width);
        const deviceHeight = this.toPt(height);
        const deviceX = this.toPt(options.x);
        const deviceY = this.deviceY(options.y) - deviceHeight;

        const placement: Matrix = { a: deviceWidth, b: 0, c: 0, d: deviceHeight, e: deviceX, f: deviceY };

        if (options.rotation) {
            const centered = multiplyMatrix(
                translationMatrix(-deviceWidth / 2, -deviceHeight / 2),
                multiplyMatrix(rotationMatrix(options.rotation), translationMatrix(deviceWidth / 2, deviceHeight / 2)),
            );
            this.stream.applyMatrix(multiplyMatrix(centered, translationMatrix(deviceX, deviceY)));
            this.stream.applyMatrix({ a: deviceWidth, b: 0, c: 0, d: deviceHeight, e: 0, f: 0 });
        } else {
            this.stream.applyMatrix(placement);
        }

        this.stream.drawXObject(image.resourceName);
        this.stream.restoreState();
        return this;
    }

    getImageSize(source: ImageSource): { width: number; height: number } {
        const decoded = decodeImage(source);
        return { width: this.toUserUnits(decoded.width), height: this.toUserUnits(decoded.height) };
    }

    addLink(x: number, y: number, width: number, height: number, options: LinkOptions): this {
        const deviceHeight = this.toPt(height);
        const rectangle = new PdfArray([
            this.toPt(x),
            this.deviceY(y) - deviceHeight,
            this.toPt(x + width),
            this.deviceY(y),
        ]);

        const annotation = new PdfDict({
            Type: new PdfName('Annot'),
            Subtype: new PdfName('Link'),
            Rect: rectangle,
            Border: new PdfArray([0, 0, 0]),
        });

        if (options.tooltip) annotation.set('Contents', pdfTextString(options.tooltip));

        if (options.url) {
            const safeUrl = sanitizeUrl(options.url);
            if (safeUrl) {
                annotation.set(
                    'A',
                    new PdfDict({ Type: new PdfName('Action'), S: new PdfName('URI'), URI: new PdfString(safeUrl) }),
                );
                this.page.annotations.push(annotation);
            }
            return this;
        }

        if (options.pageIndex !== undefined) {
            annotation.set('__targetPage', options.pageIndex);
            this.page.annotations.push(annotation);
        }

        return this;
    }

    addOutline(entry: OutlineEntry): this {
        this.outlines.push(entry);
        return this;
    }

    getOutlines(): OutlineEntry[] {
        return this.outlines;
    }

    private buildPageContent(page: PageState): Uint8Array {
        const source = page.stream.toString();
        const bytes = new Uint8Array(source.length);
        for (let index = 0; index < source.length; index += 1) {
            bytes[index] = source.charCodeAt(index) & 0xff;
        }
        return bytes;
    }

    private buildOutlineTree(store: PdfObjectStore, pageRefs: PdfRef[], parentRef: PdfRef, entries: OutlineEntry[]): { first: PdfRef; last: PdfRef; count: number } | null {
        if (entries.length === 0) return null;

        const refs = entries.map(() => store.allocate());
        let totalCount = entries.length;

        entries.forEach((entry, index) => {
            const targetPage = pageRefs[Math.min(Math.max(entry.pageIndex, 0), pageRefs.length - 1)];
            const page = this.pages[Math.min(Math.max(entry.pageIndex, 0), this.pages.length - 1)];
            const destinationY = entry.y === undefined ? page.size.height : page.size.height - this.toPt(entry.y);

            const dict = new PdfDict({
                Title: pdfTextString(entry.title),
                Parent: parentRef,
                Dest: new PdfArray([targetPage, new PdfName('XYZ'), null, destinationY, null]),
            });

            if (index > 0) dict.set('Prev', refs[index - 1]);
            if (index < refs.length - 1) dict.set('Next', refs[index + 1]);

            store.assign(refs[index], dict);

            if (entry.children && entry.children.length > 0) {
                const childResult = this.buildOutlineTree(store, pageRefs, refs[index], entry.children);
                if (childResult) {
                    dict.set('First', childResult.first);
                    dict.set('Last', childResult.last);
                    dict.set('Count', childResult.count);
                    totalCount += childResult.count;
                }
            }
        });

        return { first: refs[0], last: refs[refs.length - 1], count: totalCount };
    }

    private formatPdfDate(date: Date): string {
        const pad = (value: number): string => String(value).padStart(2, '0');
        const offsetMinutes = -date.getTimezoneOffset();
        const sign = offsetMinutes >= 0 ? '+' : '-';
        const absolute = Math.abs(offsetMinutes);

        return `D:${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}${sign}${pad(Math.floor(absolute / 60))}'${pad(absolute % 60)}'`;
    }

    build(): Uint8Array {
        const store = new PdfObjectStore();

        const catalogRef = store.allocate();
        const pagesRef = store.allocate();
        const pageRefs = this.pages.map(() => store.allocate());

        const imageEntries = [...this.images.entries()];
        imageEntries.forEach(([, resource]) => {
            const ref = store.allocate();
            (resource as { ref: PdfRef }).ref = ref;
        });

        this.pendingImages.forEach(({ key, decoded, embed }) => {
            const resource = this.images.get(key);
            if (resource) embed(store, decoded, resource.ref);
        });

        const fontRefs = new Map<string, PdfRef>();
        for (const font of this.fonts.all()) {
            const fontDict = new PdfDict({
                Type: new PdfName('Font'),
                Subtype: new PdfName('Type1'),
                BaseFont: new PdfName(font.postScriptName),
                Encoding: new PdfName('WinAnsiEncoding'),
            });
            fontRefs.set(font.resourceName, store.add(fontDict));
        }

        const fontResources = new PdfDict();
        for (const [resourceName, ref] of fontRefs) {
            fontResources.set(resourceName, ref);
        }

        const xObjectResources = new PdfDict();
        for (const [, resource] of imageEntries) {
            xObjectResources.set(resource.resourceName, resource.ref);
        }

        const extGStateResources = new PdfDict();
        for (const [, state] of this.alphaStates) {
            const stateDict = new PdfDict({
                Type: new PdfName('ExtGState'),
                ca: state.fillAlpha,
                CA: state.strokeAlpha,
            });
            extGStateResources.set(state.resourceName, store.add(stateDict));
        }

        const resources = new PdfDict({
            ProcSet: new PdfArray([new PdfName('PDF'), new PdfName('Text'), new PdfName('ImageB'), new PdfName('ImageC')]),
            Font: fontResources,
        });
        if (imageEntries.length > 0) resources.set('XObject', xObjectResources);
        if (this.alphaStates.size > 0) resources.set('ExtGState', extGStateResources);

        const resourcesRef = store.add(resources);

        this.pages.forEach((page, index) => {
            const rawContent = this.buildPageContent(page);
            const contentBytes = this.compress ? deflateCompress(rawContent) : rawContent;

            const contentDict = new PdfDict();
            if (this.compress) contentDict.set('Filter', new PdfName('FlateDecode'));
            const contentRef = store.add(new PdfStream(contentDict, contentBytes));

            const pageDict = new PdfDict({
                Type: new PdfName('Page'),
                Parent: pagesRef,
                MediaBox: new PdfArray([0, 0, page.size.width, page.size.height]),
                Resources: resourcesRef,
                Contents: contentRef,
            });

            if (page.annotations.length > 0) {
                const annotationRefs = page.annotations.map((annotation) => {
                    const targetPage = annotation.get('__targetPage');
                    if (typeof targetPage === 'number') {
                        annotation.entries.delete('__targetPage');
                        const destinationRef = pageRefs[Math.min(Math.max(targetPage, 0), pageRefs.length - 1)];
                        annotation.set(
                            'Dest',
                            new PdfArray([destinationRef, new PdfName('XYZ'), null, this.pages[index].size.height, null]),
                        );
                    }
                    return store.add(annotation);
                });
                pageDict.set('Annots', new PdfArray(annotationRefs));
            }

            store.assign(pageRefs[index], pageDict);
        });

        store.assign(
            pagesRef,
            new PdfDict({
                Type: new PdfName('Pages'),
                Kids: new PdfArray(pageRefs),
                Count: this.pages.length,
            }),
        );

        const catalog = new PdfDict({
            Type: new PdfName('Catalog'),
            Pages: pagesRef,
        });

        if (this.language) catalog.set('Lang', pdfTextString(this.language));
        if (this.displayTitleInWindow && this.metadata.title) {
            catalog.set('ViewerPreferences', new PdfDict({ DisplayDocTitle: true }));
        }

        if (this.outlines.length > 0) {
            const outlineRootRef = store.allocate();
            const tree = this.buildOutlineTree(store, pageRefs, outlineRootRef, this.outlines);
            if (tree) {
                store.assign(
                    outlineRootRef,
                    new PdfDict({
                        Type: new PdfName('Outlines'),
                        First: tree.first,
                        Last: tree.last,
                        Count: tree.count,
                    }),
                );
                catalog.set('Outlines', outlineRootRef);
                catalog.set('PageMode', new PdfName('UseOutlines'));
            }
        }

        store.assign(catalogRef, catalog);

        const info = new PdfDict();
        if (this.metadata.title) info.set('Title', pdfTextString(this.metadata.title));
        if (this.metadata.author) info.set('Author', pdfTextString(this.metadata.author));
        if (this.metadata.subject) info.set('Subject', pdfTextString(this.metadata.subject));
        if (this.metadata.keywords) {
            const keywords = Array.isArray(this.metadata.keywords)
                ? this.metadata.keywords.join(', ')
                : this.metadata.keywords;
            info.set('Keywords', pdfTextString(keywords));
        }
        if (this.metadata.creator) info.set('Creator', pdfTextString(this.metadata.creator));
        info.set('Producer', pdfTextString(this.metadata.producer ?? defaultProducer));
        if (this.metadata.creationDate) {
            info.set('CreationDate', new PdfString(this.formatPdfDate(this.metadata.creationDate)));
        }
        if (this.metadata.modificationDate) {
            info.set('ModDate', new PdfString(this.formatPdfDate(this.metadata.modificationDate)));
        }
        const infoRef = store.add(info);

        return serializeDocument(store, catalogRef, infoRef);
    }
}

export class PathBuilder {
    constructor(
        private readonly stream: ContentStream,
        private readonly toPoint: (value: number) => number,
        private readonly toDeviceY: (value: number) => number,
    ) {}

    moveTo(x: number, y: number): this {
        this.stream.moveTo(this.toPoint(x), this.toDeviceY(y));
        return this;
    }

    lineTo(x: number, y: number): this {
        this.stream.lineTo(this.toPoint(x), this.toDeviceY(y));
        return this;
    }

    curveTo(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): this {
        this.stream.curveTo(
            this.toPoint(x1),
            this.toDeviceY(y1),
            this.toPoint(x2),
            this.toDeviceY(y2),
            this.toPoint(x3),
            this.toDeviceY(y3),
        );
        return this;
    }

    close(): this {
        this.stream.closePath();
        return this;
    }
}

const allowedLinkProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:']);

export function sanitizeUrl(url: string): string | null {
    const trimmed = url.trim();
    if (trimmed.length === 0) return null;

    const protocolMatch = trimmed.match(/^([a-z][a-z0-9+.-]*):/i);
    if (!protocolMatch) return trimmed;

    const protocol = `${protocolMatch[1].toLowerCase()}:`;
    return allowedLinkProtocols.has(protocol) ? trimmed : null;
}

function serializeDocument(store: PdfObjectStore, catalogRef: PdfRef, infoRef: PdfRef): Uint8Array {
    const writer = new ByteWriter();

    writer.push('%PDF-1.7\n');
    writer.push('%\xE2\xE3\xCF\xD3\n');

    const offsets: number[] = [];

    for (const entry of store.entries()) {
        offsets[entry.id] = writer.offset;
        writeIndirectObject(writer, entry);
    }

    const xrefOffset = writer.offset;
    const objectCount = store.size + 1;

    writer.push('xref\n');
    writer.push(`0 ${objectCount}\n`);
    writer.push('0000000000 65535 f \n');

    for (let id = 1; id <= store.size; id += 1) {
        const offset = offsets[id] ?? 0;
        writer.push(`${String(offset).padStart(10, '0')} 00000 n \n`);
    }

    writer.push('trailer\n');
    writer.push(`<</Size ${objectCount} /Root ${catalogRef.id} 0 R /Info ${infoRef.id} 0 R>>\n`);
    writer.push('startxref\n');
    writer.push(`${xrefOffset}\n`);
    writer.push('%%EOF\n');

    return writer.toBytes();
}

