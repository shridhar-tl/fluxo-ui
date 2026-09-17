import { normalizeEdgeInsets } from '../core/geometry';
import type {
    CellDefinition,
    CellSpec,
    CellStyle,
    CellValue,
    ColumnDefinition,
    GridSection,
    RowDefinition,
} from './table-types';

const isCellSpec = (value: CellDefinition): value is CellSpec =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

export function cellValueToText(value: CellValue): string {
    if (value === null || value === undefined) return '';
    return String(value);
}

export function splitCellText(value: string): string[] {
    return value.split(/\r\n|\r|\n/);
}

export interface NormalizedCell {
    value: CellValue;
    colSpan: number;
    rowSpan: number;
    style: Partial<CellStyle>;
    href?: string;
}

export function normalizeCell(definition: CellDefinition): NormalizedCell {
    if (isCellSpec(definition)) {
        return {
            value: definition.value ?? null,
            colSpan: Math.max(1, Math.floor(definition.colSpan ?? 1)),
            rowSpan: Math.max(1, Math.floor(definition.rowSpan ?? 1)),
            style: definition.style ?? {},
            href: definition.href,
        };
    }

    return { value: definition, colSpan: 1, rowSpan: 1, style: {} };
}

export function inferColumns(
    explicit: ColumnDefinition[] | undefined,
    head: RowDefinition[],
    body: RowDefinition[],
    foot: RowDefinition[],
): ColumnDefinition[] {
    if (explicit && explicit.length > 0) return explicit;

    const firstObjectRow = [...body, ...head, ...foot].find(
        (row): row is Record<string, CellDefinition> => !Array.isArray(row) && typeof row === 'object',
    );

    if (firstObjectRow) {
        return Object.keys(firstObjectRow).map((key) => ({ key }));
    }

    let widest = 0;
    for (const row of [...head, ...body, ...foot]) {
        if (Array.isArray(row)) {
            let span = 0;
            for (const cell of row) {
                span += normalizeCell(cell).colSpan;
            }
            widest = Math.max(widest, span);
        }
    }

    const headerRow = head.find((row): row is CellDefinition[] => Array.isArray(row));

    return Array.from({ length: widest }, (_unused, index) => ({
        key: index,
        header: headerRow ? normalizeCell(headerRow[index] ?? null).value : undefined,
    }));
}

export function extractRowCells(row: RowDefinition, columns: ColumnDefinition[]): (CellDefinition | undefined)[] {
    if (Array.isArray(row)) return row;
    return columns.map((column) => row[column.key as string]);
}

export function buildSectionRows(
    rows: RowDefinition[] | undefined,
    columns: ColumnDefinition[],
    derive?: (column: ColumnDefinition) => CellValue,
): RowDefinition[] {
    if (rows && rows.length > 0) return rows;

    if (derive) {
        const derived = columns.map((column) => derive(column));
        const hasContent = derived.some((value) => value !== undefined && value !== null && value !== '');
        if (hasContent) return [derived];
    }

    return [];
}

export function mergeCellStyle(...layers: (Partial<CellStyle> | undefined)[]): Partial<CellStyle> {
    const result: Partial<CellStyle> = {};
    for (const layer of layers) {
        if (!layer) continue;
        Object.assign(result, layer);
    }
    return result;
}

export function resolvePadding(style: CellStyle): { top: number; right: number; bottom: number; left: number } {
    return normalizeEdgeInsets(style.padding, 0);
}

export function borderWidthFor(style: CellStyle, side: 'top' | 'right' | 'bottom' | 'left'): number {
    const width = style.borderWidth;
    if (typeof width === 'number') return width;
    return width?.[side] ?? 0;
}

export function formatCellValue(
    value: CellValue,
    column: ColumnDefinition | null,
    rowIndex: number,
    section: GridSection,
): string {
    if (column?.format && section === 'body') {
        return column.format(value, rowIndex);
    }
    return cellValueToText(value);
}
