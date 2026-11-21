import { safeGetByPath } from '../expression/expression-parser';
import type { AggregateFunction, DatasetField, DatasetFieldType, SortDirection } from '../report-definition-types';

export type Row = Record<string, unknown>;

export function getValue(row: unknown, path: string): unknown {
    if (!path) return undefined;
    if (row !== null && typeof row === 'object' && Object.prototype.hasOwnProperty.call(row, path)) {
        return (row as Row)[path];
    }
    const value = safeGetByPath(row, path);
    return value === null ? null : value;
}

/** Assigns a data-driven key as an own property, so a key such as `__proto__` cannot replace the row's prototype. */
export function setField(row: Row, key: string, value: unknown): void {
    if (key === '__proto__') {
        Object.defineProperty(row, key, { value, enumerable: true, writable: true, configurable: true });
    } else {
        row[key] = value;
    }
}

export function isBlankKey(values: unknown[]): boolean {
    return values.some((v) => v === null || v === undefined || v === '');
}

function toComparable(value: unknown): number | string | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

export function compareValues(a: unknown, b: unknown, direction: SortDirection = 'asc'): number {
    const av = toComparable(a);
    const bv = toComparable(b);
    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;
    let result: number;
    if (typeof av === 'number' && typeof bv === 'number') result = av - bv;
    else result = collator.compare(String(av), String(bv));
    return direction === 'desc' ? -result : result;
}

export function valueKey(value: unknown): string {
    if (value === undefined) return 'u';
    if (value === null) return 'n';
    if (value instanceof Date) return `d:${value.getTime()}`;
    if (typeof value === 'object') return `o:${JSON.stringify(value)}`;
    return `${typeof value}:${String(value)}`;
}

export function compositeKey(values: unknown[]): string {
    return values.map(valueKey).join('\u0001');
}

function toNumbers(values: unknown[]): number[] {
    const out: number[] = [];
    for (const v of values) {
        if (v === null || v === undefined || v === '') continue;
        const n = typeof v === 'number' ? v : Number(v);
        if (Number.isFinite(n)) out.push(n);
    }
    return out;
}

export function aggregate(fn: AggregateFunction, values: unknown[]): unknown {
    switch (fn) {
        case 'count':
            return values.filter((v) => v !== null && v !== undefined).length;
        case 'countDistinct':
            return new Set(values.filter((v) => v !== null && v !== undefined).map(valueKey)).size;
        case 'sum':
            return toNumbers(values).reduce((a, b) => a + b, 0);
        case 'avg': {
            const nums = toNumbers(values);
            return nums.length === 0 ? null : nums.reduce((a, b) => a + b, 0) / nums.length;
        }
        case 'median': {
            const nums = toNumbers(values).sort((a, b) => a - b);
            if (nums.length === 0) return null;
            const mid = Math.floor(nums.length / 2);
            return nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];
        }
        case 'min':
        case 'max': {
            let best: unknown = null;
            for (const v of values) {
                if (v === null || v === undefined || v === '') continue;
                if (best === null) {
                    best = v;
                    continue;
                }
                const cmp = compareValues(v, best);
                if ((fn === 'min' && cmp < 0) || (fn === 'max' && cmp > 0)) best = v;
            }
            return best;
        }
        case 'first':
            return values.find((v) => v !== null && v !== undefined) ?? null;
        case 'last': {
            for (let i = values.length - 1; i >= 0; i--) {
                if (values[i] !== null && values[i] !== undefined) return values[i];
            }
            return null;
        }
        case 'concat':
            return values.filter((v) => v !== null && v !== undefined && v !== '').map(String).join(', ');
        case 'list': {
            const seen = new Set<string>();
            const out: unknown[] = [];
            for (const v of values) {
                if (v === null || v === undefined) continue;
                const k = valueKey(v);
                if (seen.has(k)) continue;
                seen.add(k);
                out.push(v);
            }
            return out;
        }
        default:
            return null;
    }
}

export function aggregateResultType(fn: AggregateFunction, sourceType: DatasetFieldType | undefined): DatasetFieldType {
    switch (fn) {
        case 'count':
        case 'countDistinct':
        case 'sum':
        case 'avg':
        case 'median':
            return 'number';
        case 'concat':
            return 'string';
        case 'list':
            return 'array';
        default:
            return sourceType ?? 'string';
    }
}

export function findField(fields: DatasetField[], path: string): DatasetField | undefined {
    const direct = fields.find((f) => f.name === path);
    if (direct) return direct;
    const parts = path.split('.');
    let list: DatasetField[] | undefined = fields;
    let found: DatasetField | undefined;
    for (const part of parts) {
        found = list?.find((f) => f.name === part);
        if (!found) return undefined;
        list = found.children;
    }
    return found;
}

export function flattenFieldPaths(fields: DatasetField[], prefix = '', depth = 0): Array<{ path: string; field: DatasetField }> {
    const out: Array<{ path: string; field: DatasetField }> = [];
    for (const f of fields) {
        const path = prefix ? `${prefix}.${f.name}` : f.name;
        out.push({ path, field: f });
        if (f.type === 'object' && f.children && depth < 4) {
            out.push(...flattenFieldPaths(f.children, path, depth + 1));
        }
    }
    return out;
}

export function classifyValue(value: unknown): DatasetFieldType {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'string';
}
