import type {
    DerivedTransform,
    DerivedTransformFlatten,
    DerivedTransformGroup,
    DerivedTransformJoin,
    DerivedTransformPivot,
    DerivedTransformUnion,
    DerivedTransformUnpivot,
    DerivedTransformWindow,
    SortKey,
} from '../report-definition-types';
import type { Dataset } from '../report-builder-types';
import { aggregate, compareValues, compositeKey, getValue, isBlankKey, setField, valueKey } from './value-utils';
import type { Row } from './value-utils';

export interface TransformRuntime {
    evaluate: (expression: string, currentRow?: Row) => Promise<unknown>;
    getDataset: (datasourceId: string) => Dataset | undefined;
    getDatasourceName: (datasourceId: string) => string;
}

function isTruthy(value: unknown): boolean {
    return value !== false && value !== 0 && value !== null && value !== undefined && value !== '';
}

function requireDataset(runtime: TransformRuntime, id: string, transformLabel: string): Dataset {
    if (!id) throw new Error(`${transformLabel}: choose a datasource.`);
    const ds = runtime.getDataset(id);
    if (!ds) throw new Error(`${transformLabel}: datasource "${runtime.getDatasourceName(id)}" has no data.`);
    return ds;
}

async function evaluateAll(runtime: TransformRuntime, expression: string, rows: Row[]): Promise<unknown[]> {
    return Promise.all(rows.map((row) => runtime.evaluate(expression, row)));
}

export async function sortRows(rows: Row[], keys: SortKey[], runtime: TransformRuntime): Promise<Row[]> {
    const activeKeys = keys.filter((k) => k.expression.trim());
    if (activeKeys.length === 0) return rows;
    const keyValues = await Promise.all(activeKeys.map((k) => evaluateAll(runtime, k.expression, rows)));
    const indexes = rows.map((_, i) => i);
    indexes.sort((a, b) => {
        for (let k = 0; k < activeKeys.length; k++) {
            const cmp = compareValues(keyValues[k][a], keyValues[k][b], activeKeys[k].direction);
            if (cmp !== 0) return cmp;
        }
        return a - b;
    });
    return indexes.map((i) => rows[i]);
}

function applyFlatten(rows: Row[], t: DerivedTransformFlatten): Row[] {
    if (!t.childField) return rows;
    const result: Row[] = [];
    for (const row of rows) {
        const children = getValue(row, t.childField);
        const parent: Row = { ...row };
        delete parent[t.childField];
        if (Array.isArray(children) && children.length > 0) {
            for (const child of children) {
                if (child !== null && typeof child === 'object' && !Array.isArray(child)) {
                    const merged: Row = { ...parent };
                    for (const [k, v] of Object.entries(child as Row)) {
                        setField(merged, t.childPrefix ? `${t.childPrefix}${k}` : k, v);
                    }
                    result.push(merged);
                } else {
                    const merged: Row = { ...parent };
                    setField(merged, t.childPrefix ? `${t.childPrefix}value` : t.childField, child);
                    result.push(merged);
                }
            }
        } else if (t.keepEmpty !== false) {
            result.push(parent);
        }
    }
    return result;
}

async function applyGroup(rows: Row[], t: DerivedTransformGroup, runtime: TransformRuntime): Promise<Row[]> {
    const keyDefs = t.keys.filter((k) => k.name.trim() && k.expression.trim());
    const keyValues = await Promise.all(keyDefs.map((k) => evaluateAll(runtime, k.expression, rows)));
    const buckets = new Map<string, { keys: unknown[]; rows: Row[]; indexes: number[] }>();
    rows.forEach((row, i) => {
        const keys = keyDefs.map((_, k) => keyValues[k][i]);
        const id = compositeKey(keys);
        let bucket = buckets.get(id);
        if (!bucket) {
            bucket = { keys, rows: [], indexes: [] };
            buckets.set(id, bucket);
        }
        bucket.rows.push(row);
        bucket.indexes.push(i);
    });

    const aggDefs = t.aggregates.filter((a) => a.name.trim());
    const aggValues = await Promise.all(aggDefs.map((a) => (a.expression?.trim() ? evaluateAll(runtime, a.expression, rows) : Promise.resolve(rows.map(() => 1)))));

    if (keyDefs.length === 0 && buckets.size === 0) buckets.set('', { keys: [], rows: [], indexes: [] });

    const result: Row[] = [];
    for (const bucket of buckets.values()) {
        const out: Row = {};
        keyDefs.forEach((k, idx) => setField(out, k.name.trim(), bucket.keys[idx]));
        aggDefs.forEach((a, idx) => {
            setField(out, a.name.trim(), aggregate(a.fn, bucket.indexes.map((i) => aggValues[idx][i])));
        });
        if (t.rowsField?.trim()) setField(out, t.rowsField.trim(), bucket.rows);
        result.push(out);
    }
    return result;
}

function prefixRow(row: Row, prefix: string | undefined): Row {
    if (!prefix) return row;
    const out: Row = {};
    for (const [k, v] of Object.entries(row)) setField(out, `${prefix}${k}`, v);
    return out;
}

function applyJoin(rows: Row[], t: DerivedTransformJoin, runtime: TransformRuntime): Row[] {
    const right = requireDataset(runtime, t.datasourceId, 'Join');
    const conditions = t.on.filter((c) => c.left.trim() && c.right.trim());
    if (conditions.length === 0) throw new Error('Join: add at least one matching field pair.');

    const index = new Map<string, Row[]>();
    for (const r of right.rows) {
        const values = conditions.map((c) => getValue(r, c.right));
        if (isBlankKey(values)) continue;
        const key = compositeKey(values);
        const list = index.get(key);
        if (list) list.push(r);
        else index.set(key, [r]);
    }

    const findMatches = (row: Row): Row[] | undefined => {
        const values = conditions.map((c) => getValue(row, c.left));
        return isBlankKey(values) ? undefined : index.get(compositeKey(values));
    };

    if (t.mode === 'nest') {
        const nestAs = t.nestAs?.trim() || runtime.getDatasourceName(t.datasourceId);
        const out: Row[] = [];
        for (const row of rows) {
            const matches = findMatches(row) ?? [];
            if (t.joinType === 'inner' && matches.length === 0) continue;
            out.push({ ...row, [nestAs]: matches });
        }
        return out;
    }

    const matchedRight = new Set<Row>();
    const rightFieldNames = new Set<string>();
    for (const r of right.rows) for (const k of Object.keys(r)) rightFieldNames.add(k);
    const emptyRight: Row = {};
    for (const k of rightFieldNames) setField(emptyRight, t.prefix ? `${t.prefix}${k}` : k, null);

    const out: Row[] = [];
    let leftFieldNames: string[] | null = null;
    for (const row of rows) {
        const matches = findMatches(row);
        if (matches && matches.length > 0) {
            for (const m of matches) {
                matchedRight.add(m);
                out.push({ ...row, ...prefixRow(m, t.prefix) });
            }
        } else if (t.joinType === 'left' || t.joinType === 'full') {
            out.push({ ...row, ...emptyRight });
        }
    }

    if (t.joinType === 'right' || t.joinType === 'full') {
        for (const m of right.rows) {
            if (matchedRight.has(m)) continue;
            if (!leftFieldNames) {
                const names = new Set<string>();
                for (const r of rows) for (const k of Object.keys(r)) names.add(k);
                leftFieldNames = Array.from(names);
            }
            const emptyLeft: Row = {};
            for (const k of leftFieldNames) setField(emptyLeft, k, null);
            out.push({ ...emptyLeft, ...prefixRow(m, t.prefix) });
        }
    }
    return out;
}

function applyUnion(rows: Row[], t: DerivedTransformUnion, runtime: TransformRuntime, sourceName: string): Row[] {
    const tag = t.sourceField?.trim();
    const out: Row[] = tag ? rows.map((r) => ({ ...r, [tag]: sourceName })) : [...rows];
    for (const id of t.datasourceIds) {
        const ds = requireDataset(runtime, id, 'Append');
        const name = runtime.getDatasourceName(id);
        for (const r of ds.rows) out.push(tag ? { ...r, [tag]: name } : r);
    }
    return out;
}

function applyDistinct(rows: Row[], fields: string[]): Row[] {
    const active = fields.filter((f) => f.trim());
    const seen = new Set<string>();
    const out: Row[] = [];
    for (const row of rows) {
        const key = active.length > 0 ? compositeKey(active.map((f) => getValue(row, f))) : valueKey(row);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(active.length > 0 ? Object.fromEntries(active.map((f) => [f, getValue(row, f)])) : row);
    }
    return out;
}

function applyPivot(rows: Row[], t: DerivedTransformPivot): Row[] {
    if (!t.columnField) throw new Error('Pivot: choose the field whose values become columns.');
    const rowFields = t.rowFields.filter((f) => f.trim());
    const columns: string[] = [];
    const columnSet = new Set<string>();
    const buckets = new Map<string, { keys: unknown[]; cells: Map<string, unknown[]> }>();
    for (const row of rows) {
        const keys = rowFields.map((f) => getValue(row, f));
        const id = compositeKey(keys);
        let bucket = buckets.get(id);
        if (!bucket) {
            bucket = { keys, cells: new Map() };
            buckets.set(id, bucket);
        }
        const colValue = getValue(row, t.columnField);
        const colName = `${t.columnPrefix ?? ''}${colValue === null || colValue === undefined || colValue === '' ? '(blank)' : String(colValue)}`;
        if (!columnSet.has(colName)) {
            columnSet.add(colName);
            columns.push(colName);
        }
        const cell = bucket.cells.get(colName);
        const value = t.valueField ? getValue(row, t.valueField) : 1;
        if (cell) cell.push(value);
        else bucket.cells.set(colName, [value]);
    }
    columns.sort((a, b) => compareValues(a, b));
    const out: Row[] = [];
    for (const bucket of buckets.values()) {
        const r: Row = {};
        rowFields.forEach((f, i) => setField(r, f, bucket.keys[i]));
        for (const col of columns) {
            const values = bucket.cells.get(col);
            setField(r, col, values ? aggregate(t.aggregation, values) : null);
        }
        out.push(r);
    }
    return out;
}

function applyUnpivot(rows: Row[], t: DerivedTransformUnpivot): Row[] {
    const fields = new Set(t.fields.filter((f) => f.trim()));
    if (fields.size === 0) return rows;
    const nameField = t.nameField.trim() || 'name';
    const valueField = t.valueField.trim() || 'value';
    const out: Row[] = [];
    for (const row of rows) {
        const base: Row = {};
        for (const [k, v] of Object.entries(row)) {
            if (!fields.has(k)) setField(base, k, v);
        }
        for (const f of fields) {
            const r: Row = { ...base };
            setField(r, nameField, f);
            setField(r, valueField, getValue(row, f));
            out.push(r);
        }
    }
    return out;
}

async function applyWindow(rows: Row[], t: DerivedTransformWindow, runtime: TransformRuntime): Promise<Row[]> {
    const columns = t.columns.filter((c) => c.name.trim());
    if (columns.length === 0) return rows;
    const partitionFields = t.partitionBy.filter((f) => f.trim());
    const partitions = new Map<string, number[]>();
    rows.forEach((row, i) => {
        const key = compositeKey(partitionFields.map((f) => getValue(row, f)));
        const list = partitions.get(key);
        if (list) list.push(i);
        else partitions.set(key, [i]);
    });

    const activeOrder = t.orderBy.filter((k) => k.expression.trim());
    const orderValues = await Promise.all(activeOrder.map((k) => evaluateAll(runtime, k.expression, rows)));
    const sameOrder = (a: number, b: number) => orderValues.every((vals) => compareValues(vals[a], vals[b]) === 0);
    const output: Row[] = rows.map((row) => ({ ...row }));

    for (const indexes of partitions.values()) {
        const ordered = [...indexes].sort((a, b) => {
            for (let k = 0; k < activeOrder.length; k++) {
                const cmp = compareValues(orderValues[k][a], orderValues[k][b], activeOrder[k].direction);
                if (cmp !== 0) return cmp;
            }
            return a - b;
        });
        for (const col of columns) {
            const name = col.name.trim();
            const field = col.field ?? '';
            let running = 0;
            let count = 0;
            let rank = 0;
            let denseRank = 0;
            const total = col.fn === 'percentOfTotal'
                ? ordered.reduce((acc, idx) => acc + (Number(getValue(rows[idx], field)) || 0), 0)
                : 0;
            ordered.forEach((rowIndex, i) => {
                const value = col.field ? getValue(rows[rowIndex], col.field) : undefined;
                const numeric = Number(value);
                const isNumber = value !== null && value !== undefined && value !== '' && Number.isFinite(numeric);
                let result: unknown = null;
                switch (col.fn) {
                    case 'rowNumber':
                        result = i + 1;
                        break;
                    case 'rank':
                        if (i === 0 || !sameOrder(rowIndex, ordered[i - 1])) rank = i + 1;
                        result = rank;
                        break;
                    case 'denseRank':
                        if (i === 0 || !sameOrder(rowIndex, ordered[i - 1])) denseRank += 1;
                        result = denseRank;
                        break;
                    case 'runningSum':
                        if (isNumber) running += numeric;
                        result = running;
                        break;
                    case 'runningCount':
                        if (value !== null && value !== undefined) count += 1;
                        result = col.field ? count : i + 1;
                        break;
                    case 'runningAvg':
                        if (isNumber) {
                            running += numeric;
                            count += 1;
                        }
                        result = count === 0 ? null : running / count;
                        break;
                    case 'percentOfTotal':
                        result = total === 0 || !isNumber ? 0 : (numeric / total) * 100;
                        break;
                    case 'previous':
                        result = i > 0 ? getValue(rows[ordered[i - 1]], field) : null;
                        break;
                    case 'next':
                        result = i < ordered.length - 1 ? getValue(rows[ordered[i + 1]], field) : null;
                        break;
                    default:
                        break;
                }
                setField(output[rowIndex], name, result);
            });
        }
    }
    return output;
}

export async function applyTransform(
    transform: DerivedTransform,
    rows: Row[],
    runtime: TransformRuntime,
    sourceName: string,
): Promise<Row[]> {
    switch (transform.type) {
        case 'flatten':
            return applyFlatten(rows, transform);
        case 'pick': {
            const fields = transform.fields.filter((f) => f.source.trim());
            if (fields.length === 0) return rows;
            return rows.map((row) => {
                const picked: Row = {};
                for (const { source, alias } of fields) setField(picked, alias?.trim() || source, getValue(row, source));
                return picked;
            });
        }
        case 'filter': {
            if (!transform.expression.trim()) return rows;
            const results = await evaluateAll(runtime, transform.expression, rows);
            return rows.filter((_, i) => isTruthy(results[i]));
        }
        case 'computed': {
            let current = rows;
            for (const col of transform.columns) {
                if (!col.name.trim() || !col.expression.trim()) continue;
                const values = await evaluateAll(runtime, col.expression, current);
                const name = col.name.trim();
                current = current.map((row, i) => {
                    const next: Row = { ...row };
                    setField(next, name, values[i]);
                    return next;
                });
            }
            return current;
        }
        case 'sort':
            return sortRows(rows, transform.keys, runtime);
        case 'group':
            return applyGroup(rows, transform, runtime);
        case 'join':
            return applyJoin(rows, transform, runtime);
        case 'union':
            return applyUnion(rows, transform, runtime, sourceName);
        case 'distinct':
            return applyDistinct(rows, transform.fields);
        case 'limit': {
            const offset = Math.max(0, Math.floor(transform.offset ?? 0));
            const count = transform.count && transform.count > 0 ? Math.floor(transform.count) : undefined;
            return rows.slice(offset, count !== undefined ? offset + count : undefined);
        }
        case 'pivot':
            return applyPivot(rows, transform);
        case 'unpivot':
            return applyUnpivot(rows, transform);
        case 'window':
            return applyWindow(rows, transform, runtime);
        default:
            return rows;
    }
}
