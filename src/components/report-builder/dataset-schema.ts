import type { DatasetField } from './report-builder-types';

const SAMPLE_SIZE = 5;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2})?)?/;

function classifyScalar(value: unknown): DatasetField['type'] {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    if (typeof value === 'string') {
        if (ISO_DATE_RE.test(value)) return 'date';
        return 'string';
    }
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'string';
}

/** Reconcile two types observed for the same field. Promote conflicts to `string`. */
function unifyType(a: DatasetField['type'], b: DatasetField['type']): DatasetField['type'] {
    if (a === b) return a;
    // numeric + date stays as the more specific type; everything else falls back to string
    if ((a === 'number' && b === 'string') || (a === 'string' && b === 'number')) return 'string';
    if ((a === 'date' && b === 'string') || (a === 'string' && b === 'date')) return 'date';
    return 'string';
}

/**
 * Infer the field schema of an array of row-shaped objects by sampling up to the first
 * {@link SAMPLE_SIZE} rows. Handles scalar types, ISO-style date strings, nested objects,
 * and arrays of objects (recursively introspecting the nested shape).
 *
 * Keeping the sample small is deliberate — the explorer calls this on every config change
 * and the builder should stay snappy even if the underlying dataset is large.
 */
export function inferFieldsFromRows(rows: unknown[]): DatasetField[] {
    if (!Array.isArray(rows) || rows.length === 0) return [];

    const sample = rows.slice(0, SAMPLE_SIZE);
    const hasObjectRows = sample.some((r) => r !== null && typeof r === 'object' && !Array.isArray(r));
    if (!hasObjectRows) {
        // Array of scalars — model it as a single `value` field.
        const type = sample.reduce<DatasetField['type']>((acc, v, i) => {
            const cur = classifyScalar(v);
            return i === 0 ? cur : unifyType(acc, cur);
        }, 'string');
        return [{ name: 'value', type }];
    }

    const observed = new Map<string, { type: DatasetField['type']; nestedSamples: unknown[] }>();
    for (const row of sample) {
        if (row === null || typeof row !== 'object' || Array.isArray(row)) continue;
        for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
            if (value === null || value === undefined) {
                if (!observed.has(key)) observed.set(key, { type: 'string', nestedSamples: [] });
                continue;
            }
            const type = classifyScalar(value);
            const existing = observed.get(key);
            if (!existing) {
                observed.set(key, { type, nestedSamples: [value] });
            } else {
                existing.type = unifyType(existing.type, type);
                if (existing.nestedSamples.length < SAMPLE_SIZE) existing.nestedSamples.push(value);
            }
        }
    }

    const out: DatasetField[] = [];
    for (const [name, info] of observed) {
        if (info.type === 'array') {
            const merged: unknown[] = [];
            for (const item of info.nestedSamples) {
                if (Array.isArray(item)) merged.push(...item.slice(0, SAMPLE_SIZE));
                if (merged.length >= SAMPLE_SIZE) break;
            }
            const children = inferFieldsFromRows(merged);
            out.push({ name, type: 'array', children: children.length > 0 ? children : undefined });
            continue;
        }
        if (info.type === 'object') {
            // Wrap sample objects into a single-row array so the recursion produces fields.
            const syntheticRows = info.nestedSamples.filter((v): v is Record<string, unknown> =>
                v !== null && typeof v === 'object' && !Array.isArray(v));
            const children = inferFieldsFromRows(syntheticRows);
            out.push({ name, type: 'object', children: children.length > 0 ? children : undefined });
            continue;
        }
        out.push({ name, type: info.type });
    }
    return out;
}

/**
 * Parse a JSON payload that is expected to be either a top-level array or a single object,
 * normalising both shapes into an array of row-shaped values. Returns an empty array on
 * malformed input — the caller decides whether to surface an error.
 */
export function parseJsonRows(raw: string | undefined): Record<string, unknown>[] {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as Record<string, unknown>[];
        if (parsed && typeof parsed === 'object') return [parsed as Record<string, unknown>];
        return [];
    } catch {
        return [];
    }
}
