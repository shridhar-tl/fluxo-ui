import type { DocumentOptions } from '../core/document-types';
import { PdfDocument } from '../core/pdf-document';
import { savePdf } from '../output/document-output';
import { drawGrid } from '../table/draw-grid';
import type { GridOptions, GridResult } from '../table/table-types';
import { type ExtractOptions, extractTable } from './table-extractor';

export interface TableExportOptions {
    document?: DocumentOptions;
    extract?: ExtractOptions;
    grid?: Omit<GridOptions, 'columns' | 'head' | 'body' | 'foot'>;
    title?: string;
    titleStyle?: { fontSize?: number; color?: string; bold?: boolean };
    fileName?: string;
}

export function buildPdfFromTable(
    source: HTMLTableElement | string,
    options: TableExportOptions = {},
): { doc: PdfDocument; result: GridResult } {
    const extracted = extractTable(source, options.extract);

    const doc = new PdfDocument({
        format: 'a4',
        orientation: extracted.columns.length > 6 ? 'landscape' : 'portrait',
        ...options.document,
    });

    let startY = options.grid?.startY ?? doc.margin.top;

    if (options.title) {
        const fontSize = options.titleStyle?.fontSize ?? 16;
        doc.drawTextBlock(options.title, doc.margin.left, startY, doc.contentWidth, {
            fontSize,
            bold: options.titleStyle?.bold ?? true,
            color: options.titleStyle?.color ?? '#0f172a',
        });
        startY += doc.getLineHeight(fontSize) + 10;
    }

    const result = drawGrid(doc, {
        ...options.grid,
        startY,
        columns: extracted.columns,
        head: extracted.head,
        body: extracted.body,
        foot: extracted.foot,
    });

    return { doc, result };
}

export function exportTableToPdf(source: HTMLTableElement | string, options: TableExportOptions = {}): PdfDocument {
    const { doc } = buildPdfFromTable(source, options);
    savePdf(doc.build(), options.fileName ?? 'table.pdf');
    return doc;
}
