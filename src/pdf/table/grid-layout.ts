import type { PdfDocument } from '../core/pdf-document';
import { type StyleLayers, baseCellStyle } from './grid-presets';
import {
    borderWidthFor,
    extractRowCells,
    formatCellValue,
    mergeCellStyle,
    normalizeCell,
    resolvePadding,
    splitCellText,
} from './grid-model';
import type {
    CellStyle,
    ColumnDefinition,
    GridSection,
    ResolvedCell,
    ResolvedColumn,
    ResolvedRow,
    RowDefinition,
} from './table-types';
import { solveColumnWidths } from './width-solver';

export interface LayoutInput {
    doc: PdfDocument;
    columns: ColumnDefinition[];
    head: RowDefinition[];
    body: RowDefinition[];
    foot: RowDefinition[];
    layers: StyleLayers;
    availableWidth: number;
    minRowHeight: number;
}

export interface LayoutResult {
    columns: ResolvedColumn[];
    headRows: ResolvedRow[];
    bodyRows: ResolvedRow[];
    footRows: ResolvedRow[];
    totalWidth: number;
    overflow: number;
}

const measureText = (doc: PdfDocument, text: string, style: CellStyle): number =>
    doc.measureText(text, { font: style.font, fontSize: style.fontSize, bold: style.bold, italic: style.italic });

const longestWord = (doc: PdfDocument, lines: string[], style: CellStyle): number => {
    let widest = 0;
    for (const line of lines) {
        for (const word of line.split(/[^\S ]+/)) {
            if (word.length === 0) continue;
            widest = Math.max(widest, measureText(doc, word, style));
        }
    }
    return widest;
};

function resolveCellStyle(
    layers: StyleLayers,
    column: ColumnDefinition | null,
    section: GridSection,
    isStripe: boolean,
    inlineStyle: Partial<CellStyle>,
): CellStyle {
    const sectionOverride =
        section === 'header' ? column?.headerStyle : section === 'footer' ? column?.footerStyle : undefined;

    return mergeCellStyle(
        baseCellStyle,
        layers.forSection(section, isStripe),
        column ? layers.forColumn(column.key) : undefined,
        column?.style,
        sectionOverride,
        inlineStyle,
    ) as CellStyle;
}

function buildRows(input: LayoutInput, rows: RowDefinition[], section: GridSection): ResolvedRow[] {
    const { doc, layers } = input;
    const occupied = new Map<string, boolean>();

    return rows.map((row, rowIndex) => {
        const rawCells = extractRowCells(row, input.columns);
        const cells = new Map<number, ResolvedCell>();

        let columnCursor = 0;

        for (let position = 0; position < rawCells.length; position += 1) {
            while (occupied.get(`${rowIndex}:${columnCursor}`)) {
                columnCursor += 1;
            }

            const definition = rawCells[position];
            if (definition === undefined && !Array.isArray(row)) {
                columnCursor += 1;
                continue;
            }

            const normalized = normalizeCell(definition ?? null);
            const column = input.columns[columnCursor] ?? null;
            const isStripe = section === 'body' && rowIndex % 2 === 1;
            const style = resolveCellStyle(layers, column, section, isStripe, normalized.style);

            const rawText = formatCellValue(normalized.value, column, rowIndex, section);
            const lines = splitCellText(rawText);
            const padding = resolvePadding(style);

            const contentWidth = Math.max(...lines.map((line) => measureText(doc, line, style)), 0);
            const wordWidth = longestWord(doc, lines, style);

            const cell: ResolvedCell = {
                text: lines,
                style,
                section,
                colSpan: normalized.colSpan,
                rowSpan: normalized.rowSpan,
                href: normalized.href,
                rowIndex,
                columnIndex: columnCursor,
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                spannedHeight: 0,
                contentWidth: contentWidth + padding.left + padding.right,
                longestWordWidth: wordWidth + padding.left + padding.right,
                naturalHeight: 0,
            };

            cells.set(columnCursor, cell);

            for (let spanRow = 0; spanRow < normalized.rowSpan; spanRow += 1) {
                for (let spanColumn = 0; spanColumn < normalized.colSpan; spanColumn += 1) {
                    if (spanRow === 0 && spanColumn === 0) continue;
                    occupied.set(`${rowIndex + spanRow}:${columnCursor + spanColumn}`, true);
                }
            }

            columnCursor += normalized.colSpan;
        }

        return { cells, section, index: rowIndex, height: 0, spansPages: false };
    });
}

function accumulateColumnMetrics(rows: ResolvedRow[], columns: ResolvedColumn[]): void {
    for (const row of rows) {
        for (const [index, cell] of row.cells) {
            if (cell.colSpan !== 1) continue;
            const column = columns[index];
            if (!column) continue;

            column.naturalWidth = Math.max(column.naturalWidth, cell.contentWidth);
            column.readableWidth = Math.max(column.readableWidth, cell.longestWordWidth);
            column.minWidth = Math.max(column.minWidth, Math.min(cell.longestWordWidth, cell.contentWidth));
        }
    }
}

function spreadSpannedColumns(rows: ResolvedRow[], columns: ResolvedColumn[]): void {
    for (const row of rows) {
        for (const [index, cell] of row.cells) {
            if (cell.colSpan <= 1) continue;

            const spanned = columns.slice(index, index + cell.colSpan);
            if (spanned.length === 0) continue;

            const currentTotal = spanned.reduce((sum, column) => sum + column.naturalWidth, 0);
            if (currentTotal >= cell.contentWidth) continue;

            const deficit = cell.contentWidth - currentTotal;
            const share = deficit / spanned.length;
            for (const column of spanned) {
                column.naturalWidth += share;
            }
        }
    }
}

function assignCellGeometry(rows: ResolvedRow[], columns: ResolvedColumn[], doc: PdfDocument, minRowHeight: number): void {
    const pendingRowSpans = new Map<string, { cell: ResolvedCell; startRow: number }>();

    for (const row of rows) {
        let rowHeight = minRowHeight;

        for (const [index, cell] of row.cells) {
            const spanned = columns.slice(index, index + cell.colSpan);
            cell.width = spanned.reduce((sum, column) => sum + column.width, 0);

            const padding = resolvePadding(cell.style);
            const innerWidth = Math.max(cell.width - padding.left - padding.right, 1);

            const wrapped =
                cell.style.overflow === 'clip'
                    ? cell.text
                    : cell.text.flatMap((line) =>
                          doc.splitText(line, innerWidth, {
                              font: cell.style.font,
                              fontSize: cell.style.fontSize,
                              bold: cell.style.bold,
                              italic: cell.style.italic,
                              maxLines: cell.style.overflow === 'ellipsis' ? (cell.style.maxLines ?? 1) : cell.style.maxLines,
                              ellipsis: '…',
                          }),
                      );

            cell.text = wrapped;

            const lineHeight = doc.getLineHeight(cell.style.fontSize, cell.style.lineHeightFactor);
            cell.naturalHeight = Math.max(
                wrapped.length * lineHeight + padding.top + padding.bottom,
                cell.style.minHeight,
            );

            if (cell.rowSpan === 1) {
                rowHeight = Math.max(rowHeight, cell.naturalHeight);
            } else {
                pendingRowSpans.set(`${row.index}:${index}`, { cell, startRow: row.index });
            }
        }

        row.height = rowHeight;
    }

    for (const [, pending] of pendingRowSpans) {
        const { cell, startRow } = pending;
        const covered = rows.slice(startRow, startRow + cell.rowSpan);
        const availableHeight = covered.reduce((sum, row) => sum + row.height, 0);

        if (availableHeight < cell.naturalHeight && covered.length > 0) {
            const deficit = (cell.naturalHeight - availableHeight) / covered.length;
            for (const row of covered) {
                row.height += deficit;
            }
        }
    }

    for (const [, pending] of pendingRowSpans) {
        const { cell, startRow } = pending;
        const covered = rows.slice(startRow, startRow + cell.rowSpan);
        cell.spannedHeight = covered.reduce((sum, row) => sum + row.height, 0);
    }
}

export function layoutGrid(input: LayoutInput): LayoutResult {
    const columns: ResolvedColumn[] = input.columns.map((definition, index) => ({
        key: definition.key,
        index,
        definition,
        width: 0,
        naturalWidth: 0,
        minWidth: 0,
        readableWidth: 0,
    }));

    const headRows = buildRows(input, input.head, 'header');
    const bodyRows = buildRows(input, input.body, 'body');
    const footRows = buildRows(input, input.foot, 'footer');
    const allRows = [...headRows, ...bodyRows, ...footRows];

    accumulateColumnMetrics(allRows, columns);
    spreadSpannedColumns(allRows, columns);

    for (const column of columns) {
        if (column.naturalWidth === 0) {
            column.naturalWidth = column.definition?.minWidth ?? 20;
        }
        if (column.minWidth === 0) {
            column.minWidth = Math.min(column.naturalWidth, column.definition?.minWidth ?? 12);
        }
    }

    const solved = solveColumnWidths(columns, input.availableWidth);
    columns.forEach((column, index) => {
        column.width = solved.widths[index];
    });

    assignCellGeometry(allRows, columns, input.doc, input.minRowHeight);

    return {
        columns,
        headRows,
        bodyRows,
        footRows,
        totalWidth: columns.reduce((sum, column) => sum + column.width, 0),
        overflow: solved.overflow,
    };
}

export function cellBorderWidth(cell: ResolvedCell, side: 'top' | 'right' | 'bottom' | 'left'): number {
    return borderWidthFor(cell.style, side);
}
