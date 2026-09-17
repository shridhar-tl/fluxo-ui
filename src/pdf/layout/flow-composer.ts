import type { ColorInput } from '../core/color';
import type { TextOptions } from '../core/document-types';
import type { PdfDocument } from '../core/pdf-document';
import { drawGrid } from '../table/draw-grid';
import type { GridOptions, GridResult } from '../table/table-types';

export interface FlowOptions {
    startY?: number;
    gap?: number;
}

export class FlowComposer {
    private cursor: number;
    private readonly gap: number;

    constructor(
        private readonly doc: PdfDocument,
        options: FlowOptions = {},
    ) {
        this.cursor = options.startY ?? doc.margin.top;
        this.gap = options.gap ?? 8;
    }

    get y(): number {
        return this.cursor;
    }

    get remainingHeight(): number {
        return this.doc.pageHeight - this.doc.margin.bottom - this.cursor;
    }

    get width(): number {
        return this.doc.contentWidth;
    }

    moveTo(y: number): this {
        this.cursor = y;
        return this;
    }

    advance(amount: number): this {
        this.cursor += amount;
        return this;
    }

    ensureSpace(required: number): this {
        if (required > this.remainingHeight) {
            this.doc.addPage();
            this.cursor = this.doc.margin.top;
        }
        return this;
    }

    breakPage(): this {
        this.doc.addPage();
        this.cursor = this.doc.margin.top;
        return this;
    }

    heading(text: string, options: TextOptions & { spacingAfter?: number } = {}): this {
        const fontSize = options.fontSize ?? 16;
        const lineHeight = this.doc.getLineHeight(fontSize, options.lineHeightFactor);

        this.ensureSpace(lineHeight * 2);

        const block = this.doc.drawTextBlock(text, this.doc.margin.left, this.cursor, this.width, {
            ...options,
            fontSize,
            bold: options.bold ?? true,
        });

        this.cursor += block.height + (options.spacingAfter ?? this.gap);
        return this;
    }

    paragraph(text: string, options: TextOptions & { spacingAfter?: number } = {}): this {
        const fontSize = options.fontSize ?? 10;
        const lineHeight = this.doc.getLineHeight(fontSize, options.lineHeightFactor);
        const lines = this.doc.splitText(text, this.width, { ...options, fontSize });

        let remaining = [...lines];

        while (remaining.length > 0) {
            const fitCount = Math.max(1, Math.floor(this.remainingHeight / lineHeight));

            if (fitCount < 1 || this.remainingHeight < lineHeight) {
                this.breakPage();
                continue;
            }

            const slice = remaining.slice(0, fitCount);
            this.doc.drawText(slice.join('\n'), this.doc.margin.left, this.cursor, {
                ...options,
                fontSize,
                baseline: 'top',
                maxWidth: this.width,
            });

            this.cursor += slice.length * lineHeight;
            remaining = remaining.slice(fitCount);

            if (remaining.length > 0) this.breakPage();
        }

        this.cursor += options.spacingAfter ?? this.gap;
        return this;
    }

    spacer(height: number): this {
        this.cursor += height;
        return this;
    }

    rule(options: { color?: ColorInput; width?: number; spacingAfter?: number } = {}): this {
        this.ensureSpace(4);

        this.doc.drawLine(this.doc.margin.left, this.cursor, this.doc.pageWidth - this.doc.margin.right, this.cursor, {
            strokeColor: options.color ?? '#e2e8f0',
            lineWidth: options.width ?? 0.75,
        });

        this.cursor += options.spacingAfter ?? this.gap;
        return this;
    }

    grid(options: GridOptions & { spacingAfter?: number }): GridResult {
        const result = drawGrid(this.doc, { ...options, startY: this.cursor });
        this.cursor = result.finalY + (options.spacingAfter ?? this.gap);
        return result;
    }

    custom(render: (doc: PdfDocument, y: number, width: number) => number, spacingAfter?: number): this {
        const consumed = render(this.doc, this.cursor, this.width);
        this.cursor += consumed + (spacingAfter ?? this.gap);
        return this;
    }
}

export function createFlow(doc: PdfDocument, options: FlowOptions = {}): FlowComposer {
    return new FlowComposer(doc, options);
}
