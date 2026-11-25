import type {
    TreeTableAggregate,
    TreeTableColumn,
    TreeTableKey,
    TreeTableLabels,
    TreeTableRowData,
    TreeTableSort,
} from './tree-table-types';

const forbiddenSegments = new Set(['__proto__', 'prototype', 'constructor']);
const hasOwn = Object.prototype.hasOwnProperty;
const csvInjectionPattern = /^[=+\-@\t\r|%]/;
const collator = typeof Intl !== 'undefined' ? new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }) : null;

export const defaultLabels: TreeTableLabels = {
    expand: 'Expand row',
    collapse: 'Collapse row',
    loading: 'Loading…',
    loadingMore: 'Loading more rows…',
    loadMore: 'Load more',
    loadError: 'Could not load rows.',
    retry: 'Retry',
    noRows: 'No rows to display',
    selectAll: 'Select all rows',
    selectRow: 'Select row',
    filterPlaceholder: 'Filter…',
    filterBy: 'Filter by',
    sortAscending: 'sorted ascending',
    sortDescending: 'sorted descending',
    sortNone: 'not sorted',
    resizeColumn: 'Resize column',
    rowsSelected: 'rows selected',
    rowsCount: 'rows',
    childrenLoaded: 'child rows loaded',
    editCell: 'Edit',
    dragRow: 'Drag to move row',
    rowMoved: 'Row moved',
};

export const readPath = (source: unknown, path: string): unknown => {
    if (source === null || source === undefined || !path) return undefined;
    if (path.indexOf('.') === -1) {
        if (forbiddenSegments.has(path)) return undefined;
        return hasOwn.call(source, path) ? (source as Record<string, unknown>)[path] : undefined;
    }
    let current: unknown = source;
    const segments = path.split('.');
    for (let i = 0; i < segments.length; i += 1) {
        const segment = segments[i];
        if (current === null || current === undefined || typeof current !== 'object') return undefined;
        if (forbiddenSegments.has(segment) || !hasOwn.call(current, segment)) return undefined;
        current = (current as Record<string, unknown>)[segment];
    }
    return current;
};

export const createKeyGetter = <T extends TreeTableRowData>(
    rowKey: string | ((row: T) => TreeTableKey),
): ((row: T) => TreeTableKey) => {
    if (typeof rowKey === 'function') return rowKey;
    return (row: T) => {
        const value = readPath(row, rowKey);
        return typeof value === 'number' ? value : String(value);
    };
};

export const createParentGetter = <T extends TreeTableRowData>(
    parentKey: string | ((row: T) => TreeTableKey | null | undefined),
): ((row: T) => TreeTableKey | null) => {
    if (typeof parentKey === 'function') {
        return (row: T) => {
            const value = parentKey(row);
            return value === undefined || value === null || value === '' ? null : value;
        };
    }
    return (row: T) => {
        const value = readPath(row, parentKey);
        if (value === undefined || value === null || value === '') return null;
        return typeof value === 'number' ? value : String(value);
    };
};

export const getCellValue = <T extends TreeTableRowData>(row: T, column: TreeTableColumn<T>): unknown => {
    if (column.valueGetter) return column.valueGetter(row);
    return readPath(row, column.field ?? column.key);
};

export const valueToText = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
    if (typeof value === 'boolean' || typeof value === 'bigint') return String(value);
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toLocaleString();
    if (Array.isArray(value)) return value.map(valueToText).filter(Boolean).join(', ');
    return '';
};

export const getCellText = <T extends TreeTableRowData>(row: T, column: TreeTableColumn<T>, value?: unknown): string => {
    const raw = value === undefined ? getCellValue(row, column) : value;
    if (column.format) return column.format(raw, row);
    return valueToText(raw);
};

const rankOf = (value: unknown): number => {
    if (value === null || value === undefined || value === '') return 2;
    if (typeof value === 'number' && Number.isNaN(value)) return 2;
    return 0;
};

export const compareValues = (a: unknown, b: unknown): number => {
    const rankA = rankOf(a);
    const rankB = rankOf(b);
    if (rankA || rankB) return rankA - rankB;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
    if (typeof a === 'boolean' && typeof b === 'boolean') return a === b ? 0 : a ? -1 : 1;
    const textA = valueToText(a);
    const textB = valueToText(b);
    if (collator) return collator.compare(textA, textB);
    return textA < textB ? -1 : textA > textB ? 1 : 0;
};

export const createComparator = <T extends TreeTableRowData>(
    sort: TreeTableSort[],
    columnsByKey: Map<string, TreeTableColumn<T>>,
): ((a: T, b: T) => number) | null => {
    const parts = sort
        .map((entry) => ({ column: columnsByKey.get(entry.key), factor: entry.direction === 'desc' ? -1 : 1 }))
        .filter((entry): entry is { column: TreeTableColumn<T>; factor: number } => Boolean(entry.column));
    if (!parts.length) return null;
    return (a: T, b: T) => {
        for (let i = 0; i < parts.length; i += 1) {
            const { column, factor } = parts[i];
            if (column.sortFn) {
                const custom = column.sortFn(a, b) * factor;
                if (custom !== 0) return custom;
                continue;
            }
            const valueA = getCellValue(a, column);
            const valueB = getCellValue(b, column);
            const rankA = rankOf(valueA);
            const rankB = rankOf(valueB);
            if (rankA || rankB) {
                if (rankA !== rankB) return rankA - rankB;
                continue;
            }
            const result = compareValues(valueA, valueB) * factor;
            if (result !== 0) return result;
        }
        return 0;
    };
};

export const nextSortState = (current: TreeTableSort[], key: string, additive: boolean): TreeTableSort[] => {
    const existing = current.find((entry) => entry.key === key);
    const nextDirection = !existing ? 'asc' : existing.direction === 'asc' ? 'desc' : null;
    if (!additive) return nextDirection ? [{ key, direction: nextDirection }] : [];
    const others = current.filter((entry) => entry.key !== key);
    if (!nextDirection) return others;
    if (existing) return current.map((entry) => (entry.key === key ? { key, direction: nextDirection } : entry));
    return [...others, { key, direction: nextDirection }];
};

export interface AggregateStats {
    sum: number;
    count: number;
    min: number;
    max: number;
}

export const emptyStats = (): AggregateStats => ({ sum: 0, count: 0, min: Infinity, max: -Infinity });

export const mergeStats = (target: AggregateStats, source: AggregateStats): void => {
    target.sum += source.sum;
    target.count += source.count;
    if (source.min < target.min) target.min = source.min;
    if (source.max > target.max) target.max = source.max;
};

export const addToStats = (target: AggregateStats, value: unknown): void => {
    const numeric = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
    if (!Number.isFinite(numeric)) return;
    target.sum += numeric;
    target.count += 1;
    if (numeric < target.min) target.min = numeric;
    if (numeric > target.max) target.max = numeric;
};

export const resolveStats = (kind: TreeTableAggregate, stats: AggregateStats): number | null => {
    if (kind === 'count') return stats.count;
    if (!stats.count) return null;
    if (kind === 'sum') return stats.sum;
    if (kind === 'avg') return stats.sum / stats.count;
    if (kind === 'min') return stats.min;
    return stats.max;
};

const escapeCsvCell = (text: string, delimiter: string): string => {
    const guarded = csvInjectionPattern.test(text) ? `'${text}` : text;
    if (guarded.includes(delimiter) || /["\r\n]/.test(guarded)) return `"${guarded.replace(/"/g, '""')}"`;
    return guarded;
};

export const buildCsv = (rows: string[][], delimiter: string): string =>
    rows.map((cells) => cells.map((cell) => escapeCsvCell(cell, delimiter)).join(delimiter)).join('\r\n');

export const formatAggregate = (value: number | null): string => {
    if (value === null || !Number.isFinite(value)) return '';
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

export const toCssSize = (value: number | string | undefined): string | undefined =>
    typeof value === 'number' ? `${value}px` : value;

export const sanitizeIdPart = (value: TreeTableKey): string => String(value).replace(/[^a-zA-Z0-9_-]/g, '_');
