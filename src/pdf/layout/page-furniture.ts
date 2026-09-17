import type { ColorInput } from '../core/color';
import type { PdfDocument } from '../core/pdf-document';
import type { HorizontalAlign } from '../core/document-types';

export interface RunningTextSlot {
    text: string | ((pageNumber: number, pageCount: number) => string);
    align?: HorizontalAlign;
    font?: string;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
    color?: ColorInput;
}

export interface RunningBandOptions {
    slots: RunningTextSlot[];
    offset?: number;
    ruleColor?: ColorInput;
    ruleWidth?: number;
    ruleGap?: number;
    startPage?: number;
    endPage?: number;
}

const resolveSlotText = (slot: RunningTextSlot, pageNumber: number, pageCount: number): string =>
    typeof slot.text === 'function' ? slot.text(pageNumber, pageCount) : slot.text;

function drawSlots(
    doc: PdfDocument,
    slots: RunningTextSlot[],
    baselineY: number,
    pageNumber: number,
    pageCount: number,
): void {
    const margin = doc.margin;
    const usableWidth = doc.pageWidth - margin.left - margin.right;

    for (const slot of slots) {
        const text = resolveSlotText(slot, pageNumber, pageCount);
        if (!text) continue;

        doc.drawText(text, margin.left, baselineY, {
            align: slot.align ?? 'left',
            maxWidth: usableWidth,
            font: slot.font,
            fontSize: slot.fontSize ?? 9,
            bold: slot.bold,
            italic: slot.italic,
            color: slot.color ?? '#6b7280',
            baseline: 'top',
        });
    }
}

export function applyHeaderBand(doc: PdfDocument, options: RunningBandOptions): void {
    const startPage = options.startPage ?? 0;
    const endPage = options.endPage ?? doc.pageCount - 1;
    const originalPage = doc.currentPageIndex;

    for (let index = startPage; index <= endPage; index += 1) {
        doc.goToPage(index);

        const margin = doc.margin;
        const baselineY = options.offset ?? Math.max(margin.top - 24, 8);
        drawSlots(doc, options.slots, baselineY, index + 1, doc.pageCount);

        if (options.ruleWidth && options.ruleColor) {
            const ruleY = baselineY + (options.ruleGap ?? 14);
            doc.drawLine(margin.left, ruleY, doc.pageWidth - margin.right, ruleY, {
                strokeColor: options.ruleColor,
                lineWidth: options.ruleWidth,
            });
        }
    }

    doc.goToPage(originalPage);
}

export function applyFooterBand(doc: PdfDocument, options: RunningBandOptions): void {
    const startPage = options.startPage ?? 0;
    const endPage = options.endPage ?? doc.pageCount - 1;
    const originalPage = doc.currentPageIndex;

    for (let index = startPage; index <= endPage; index += 1) {
        doc.goToPage(index);

        const margin = doc.margin;
        const baselineY = options.offset ?? doc.pageHeight - margin.bottom + 12;

        if (options.ruleWidth && options.ruleColor) {
            const ruleY = baselineY - (options.ruleGap ?? 6);
            doc.drawLine(margin.left, ruleY, doc.pageWidth - margin.right, ruleY, {
                strokeColor: options.ruleColor,
                lineWidth: options.ruleWidth,
            });
        }

        drawSlots(doc, options.slots, baselineY, index + 1, doc.pageCount);
    }

    doc.goToPage(originalPage);
}

export interface WatermarkOptions {
    text: string;
    color?: ColorInput;
    fontSize?: number;
    opacity?: number;
    rotation?: number;
    font?: string;
    bold?: boolean;
}

export function applyWatermark(doc: PdfDocument, options: WatermarkOptions): void {
    const originalPage = doc.currentPageIndex;

    for (let index = 0; index < doc.pageCount; index += 1) {
        doc.goToPage(index);

        const fontSize = options.fontSize ?? 64;
        const width = doc.measureText(options.text, { fontSize, font: options.font, bold: options.bold ?? true });

        const centerX = doc.pageWidth / 2;
        const centerY = doc.pageHeight / 2;
        const rotation = options.rotation ?? 45;
        const radians = (rotation * Math.PI) / 180;

        const originX = centerX - (width / 2) * Math.cos(radians);
        const originY = centerY + (width / 2) * Math.sin(radians);

        doc.drawText(options.text, originX, originY, {
            fontSize,
            font: options.font,
            bold: options.bold ?? true,
            color: options.color ?? '#94a3b8',
            opacity: options.opacity ?? 0.16,
            rotation,
        });
    }

    doc.goToPage(originalPage);
}

export function stampPageNumbers(
    doc: PdfDocument,
    format: (pageNumber: number, pageCount: number) => string = (page, total) => `Page ${page} of ${total}`,
    options: { align?: HorizontalAlign; color?: ColorInput; fontSize?: number } = {},
): void {
    applyFooterBand(doc, {
        slots: [
            {
                text: format,
                align: options.align ?? 'right',
                color: options.color ?? '#6b7280',
                fontSize: options.fontSize ?? 9,
            },
        ],
    });
}
