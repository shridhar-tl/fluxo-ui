import type { AggregateFunction, BuiltInAggregateFunction, ColumnNode, PivotConfig, PivotField, PivotFilter, PivotNode, PivotPlugin, PivotSort } from './pivot-table-types';

type DataRow = Record<string, unknown>;

export const getNestedValue = (obj: DataRow, path: string): unknown => {
    return path.split('.').reduce((acc: unknown, part) => {
        if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[part];
        return undefined;
    }, obj);
};

export const setNestedValue = (obj: DataRow, path: string, value: unknown): DataRow => {
    const parts = path.split('.');
    const result = { ...obj };
    let current: Record<string, unknown> = result;

    for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = { ...(current[parts[i]] as Record<string, unknown> || {}) };
        current = current[parts[i]] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
    return result;
};

const matchesFilter = (row: DataRow, filter: PivotFilter): boolean => {
    const val = getNestedValue(row, filter.field);
    switch (filter.operator) {
        case 'eq': return val === filter.value;
        case 'neq': return val !== filter.value;
        case 'gt': return Number(val) > Number(filter.value);
        case 'gte': return Number(val) >= Number(filter.value);
        case 'lt': return Number(val) < Number(filter.value);
        case 'lte': return Number(val) <= Number(filter.value);
        case 'contains': return String(val).toLowerCase().includes(String(filter.value).toLowerCase());
        case 'in': return Array.isArray(filter.value) && (filter.value as (string | number)[]).includes(val as string | number);
        case 'notIn': return Array.isArray(filter.value) && !(filter.value as (string | number)[]).includes(val as string | number);
        case 'between': {
            const [min, max] = filter.value as [number, number];
            const num = Number(val);
            return num >= min && num <= max;
        }
        case 'isEmpty': return val === null || val === undefined || val === '';
        case 'isNotEmpty': return val !== null && val !== undefined && val !== '';
        default: return true;
    }
};

const builtInAggregate = (values: number[], fn: BuiltInAggregateFunction): number | string => {
    if (values.length === 0) return 0;

    switch (fn) {
        case 'sum': return values.reduce((a, b) => a + b, 0);
        case 'average': return values.reduce((a, b) => a + b, 0) / values.length;
        case 'count': return values.length;
        case 'min': return Math.min(...values);
        case 'max': return Math.max(...values);
        case 'product': return values.reduce((a, b) => a * b, 1);
        case 'median': {
            const sorted = [...values].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        }
        case 'first': return values[0];
        case 'last': return values[values.length - 1];
        case 'distinct': return [...new Set(values)].length;
        case 'distinctCount': return [...new Set(values)].length;
        case 'variance': {
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            return values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
        }
        case 'stddev': {
            const m = values.reduce((a, b) => a + b, 0) / values.length;
            const v = values.reduce((sum, val) => sum + (val - m) ** 2, 0) / values.length;
            return Math.sqrt(v);
        }
        case 'range': return Math.max(...values) - Math.min(...values);
        case 'percentile90': {
            const s = [...values].sort((a, b) => a - b);
            const idx = Math.ceil(0.9 * s.length) - 1;
            return s[Math.max(0, idx)];
        }
        default: return values.reduce((a, b) => a + b, 0);
    }
};

const builtInFunctions: Set<string> = new Set([
    'sum', 'average', 'count', 'min', 'max', 'product', 'distinct', 'distinctCount',
    'median', 'first', 'last', 'variance', 'stddev', 'range', 'percentile90',
]);

export const aggregate = (
    values: unknown[],
    fn: AggregateFunction,
    allRows: DataRow[],
    plugins: PivotPlugin[],
    disabledFunctions: string[],
): number | string => {
    if (disabledFunctions.includes(fn)) return 0;

    for (const plugin of plugins) {
        if (plugin.aggregateFunctions) {
            const customFn = plugin.aggregateFunctions.find((cf) => cf.name === fn);
            if (customFn) {
                return customFn.fn(values, allRows);
            }
        }
    }

    if (builtInFunctions.has(fn)) {
        return builtInAggregate(values.map(Number), fn as BuiltInAggregateFunction);
    }

    return values.map(Number).reduce((a, b) => a + b, 0);
};

const computeAggregates = (
    rows: DataRow[],
    valueFields: PivotField[],
    columnField: string | undefined,
    plugins: PivotPlugin[],
    disabledFunctions: string[],
): Record<string, Record<string, number | string>> => {
    const result: Record<string, Record<string, number | string>> = {};

    for (const vf of valueFields) {
        const fn = vf.aggregateFunction || 'sum';
        const fieldKey = `${vf.field}_${fn}`;

        let processedRows = rows;
        for (const plugin of plugins) {
            if (plugin.onBeforeAggregate) {
                processedRows = plugin.onBeforeAggregate(processedRows, vf.field);
            }
        }

        if (columnField) {
            const grouped = new Map<string, unknown[]>();
            grouped.set('__total__', []);

            for (const row of processedRows) {
                const colVal = String(getNestedValue(row, columnField) ?? '');
                const rawVal = getNestedValue(row, vf.field);
                if (!grouped.has(colVal)) grouped.set(colVal, []);
                grouped.get(colVal)!.push(rawVal);
                grouped.get('__total__')!.push(rawVal);
            }

            result[fieldKey] = {};
            for (const [colKey, vals] of grouped) {
                let aggResult = aggregate(vals, fn, processedRows, plugins, disabledFunctions);
                for (const plugin of plugins) {
                    if (plugin.onAfterAggregate) {
                        aggResult = plugin.onAfterAggregate(aggResult, vf.field, fn);
                    }
                }
                result[fieldKey][colKey] = aggResult;
            }
        } else {
            const vals = processedRows.map((r) => getNestedValue(r, vf.field));
            let aggResult = aggregate(vals, fn, processedRows, plugins, disabledFunctions);
            for (const plugin of plugins) {
                if (plugin.onAfterAggregate) {
                    aggResult = plugin.onAfterAggregate(aggResult, vf.field, fn);
                }
            }
            result[fieldKey] = { __total__: aggResult };
        }
    }

    return result;
};

export const buildPivotTree = (
    data: DataRow[],
    config: PivotConfig,
    plugins: PivotPlugin[] = [],
    disabledFunctions: string[] = [],
): PivotNode => {
    let filteredData = data;
    if (config.filters) {
        filteredData = data.filter((row) =>
            config.filters!.every((f) => matchesFilter(row, f)),
        );
    }

    const columnField = config.columns.length > 0 ? config.columns[0] : undefined;

    const buildNode = (
        rows: DataRow[],
        rowFields: string[],
        depth: number,
        parentKey: string,
    ): PivotNode => {
        if (rowFields.length === 0 || rows.length === 0) {
            return {
                key: parentKey || '__root__',
                label: parentKey ? parentKey.split('||').pop()! : 'Grand Total',
                depth,
                values: computeAggregates(rows, config.values, columnField, plugins, disabledFunctions),
                children: [],
                isLeaf: true,
                rowCount: rows.length,
                sourceRows: rows,
            };
        }

        const [currentField, ...remainingFields] = rowFields;
        const groupMap = new Map<string, DataRow[]>();

        for (const row of rows) {
            const key = String(getNestedValue(row, currentField) ?? '(empty)');
            if (!groupMap.has(key)) groupMap.set(key, []);
            groupMap.get(key)!.push(row);
        }

        const children: PivotNode[] = [];
        for (const [groupKey, groupRows] of groupMap) {
            const nodeKey = parentKey ? `${parentKey}||${groupKey}` : groupKey;
            children.push(buildNode(groupRows, remainingFields, depth + 1, nodeKey));
        }

        return {
            key: parentKey || '__root__',
            label: parentKey ? parentKey.split('||').pop()! : 'Grand Total',
            depth,
            values: computeAggregates(rows, config.values, columnField, plugins, disabledFunctions),
            children,
            isLeaf: false,
            rowCount: rows.length,
            sourceRows: rows,
        };
    };

    return buildNode(filteredData, config.rows, 0, '');
};

export const buildColumnTree = (
    data: DataRow[],
    config: PivotConfig,
): { columns: ColumnNode[]; leafColumns: string[] } => {
    if (config.columns.length === 0) {
        const leaves = config.values.map((vf) => ({
            key: `${vf.field}_${vf.aggregateFunction || 'sum'}`,
            label: vf.label,
            children: [],
            isLeaf: true,
            span: 1,
        }));
        return { columns: leaves, leafColumns: leaves.map((l) => l.key) };
    }

    const columnField = config.columns[0];
    const uniqueValues = [...new Set(data.map((r) => String(getNestedValue(r, columnField) ?? '(empty)')))].sort();

    const columns: ColumnNode[] = uniqueValues.map((colVal) => {
        const children = config.values.map((vf) => ({
            key: `${vf.field}_${vf.aggregateFunction || 'sum'}__${colVal}`,
            label: vf.label,
            children: [],
            isLeaf: true,
            span: 1,
        }));

        return {
            key: colVal,
            label: colVal,
            children,
            isLeaf: false,
            span: children.length,
        };
    });

    if (config.values.length > 0) {
        const totalChildren = config.values.map((vf) => ({
            key: `${vf.field}_${vf.aggregateFunction || 'sum'}__total`,
            label: `Total ${vf.label}`,
            children: [],
            isLeaf: true,
            span: 1,
        }));

        columns.push({
            key: '__total__',
            label: 'Total',
            children: totalChildren,
            isLeaf: false,
            span: totalChildren.length,
        });
    }

    const leafColumns: string[] = [];
    const collectLeaves = (nodes: ColumnNode[]) => {
        for (const n of nodes) {
            if (n.isLeaf) leafColumns.push(n.key);
            else collectLeaves(n.children);
        }
    };
    collectLeaves(columns);

    return { columns, leafColumns };
};

export const getCellValue = (
    node: PivotNode,
    leafColumnKey: string,
    valueFields: PivotField[],
): { raw: number | string; formatted: string } => {
    const parts = leafColumnKey.split('__');
    const fieldAgg = parts[0];
    const colKey = parts.length > 1 ? parts.slice(1).join('__') : '__total__';
    const actualColKey = colKey === 'total' ? '__total__' : colKey;

    const aggValues = node.values[fieldAgg];
    if (!aggValues) return { raw: '', formatted: '' };

    const raw = aggValues[actualColKey];
    if (raw === undefined || raw === null) return { raw: '', formatted: '' };

    const vf = valueFields.find((v) => `${v.field}_${v.aggregateFunction || 'sum'}` === fieldAgg);
    if (vf?.format) return { raw, formatted: vf.format(typeof raw === 'number' ? raw : Number(raw)) };

    if (typeof raw === 'number') {
        return { raw, formatted: Number.isInteger(raw) ? String(raw) : raw.toFixed(2) };
    }

    return { raw, formatted: String(raw) };
};

export const sortPivotNodes = (nodes: PivotNode[], sort: PivotSort | null): PivotNode[] => {
    if (!sort || sort.direction === 'none') return nodes;

    return [...nodes].sort((a, b) => {
        if (sort.field === '__label__') {
            return sort.direction === 'asc'
                ? a.label.localeCompare(b.label)
                : b.label.localeCompare(a.label);
        }

        const aVal = a.values[sort.field]?.['__total__'] ?? 0;
        const bVal = b.values[sort.field]?.['__total__'] ?? 0;

        const numA = typeof aVal === 'number' ? aVal : Number(aVal);
        const numB = typeof bVal === 'number' ? bVal : Number(bVal);

        if (!isNaN(numA) && !isNaN(numB)) {
            return sort.direction === 'asc' ? numA - numB : numB - numA;
        }

        return sort.direction === 'asc'
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal));
    });
};

export const getAvailableAggregateFunctions = (
    plugins: PivotPlugin[],
    disabledFunctions: string[],
): Array<{ name: string; label: string; description?: string }> => {
    const builtIns: Array<{ name: string; label: string; description: string }> = [
        { name: 'sum', label: 'Sum', description: 'Add all values' },
        { name: 'average', label: 'Average', description: 'Arithmetic mean' },
        { name: 'count', label: 'Count', description: 'Number of values' },
        { name: 'min', label: 'Min', description: 'Smallest value' },
        { name: 'max', label: 'Max', description: 'Largest value' },
        { name: 'product', label: 'Product', description: 'Multiply all values' },
        { name: 'median', label: 'Median', description: 'Middle value' },
        { name: 'distinct', label: 'Distinct', description: 'Unique values count' },
        { name: 'distinctCount', label: 'Distinct Count', description: 'Unique values count' },
        { name: 'first', label: 'First', description: 'First value' },
        { name: 'last', label: 'Last', description: 'Last value' },
        { name: 'variance', label: 'Variance', description: 'Statistical variance' },
        { name: 'stddev', label: 'Std Dev', description: 'Standard deviation' },
        { name: 'range', label: 'Range', description: 'Max minus Min' },
        { name: 'percentile90', label: 'P90', description: '90th percentile' },
    ];

    const available = builtIns.filter((f) => !disabledFunctions.includes(f.name));

    for (const plugin of plugins) {
        if (plugin.aggregateFunctions) {
            for (const fn of plugin.aggregateFunctions) {
                available.push({ name: fn.name, label: fn.label, description: fn.description || '' });
            }
        }
    }

    return available;
};

export const detectFieldType = (data: DataRow[], field: string): 'string' | 'number' | 'boolean' | 'date' | 'object' => {
    for (const row of data.slice(0, 20)) {
        const val = getNestedValue(row, field);
        if (val === null || val === undefined) continue;
        if (typeof val === 'boolean') return 'boolean';
        if (typeof val === 'number') return 'number';
        if (typeof val === 'object') return 'object';
        if (typeof val === 'string') {
            if (!isNaN(Date.parse(val)) && val.length > 6) return 'date';
            return 'string';
        }
    }
    return 'string';
};

export const getAllFields = (data: DataRow[]): string[] => {
    const fieldSet = new Set<string>();
    for (const row of data.slice(0, 50)) {
        for (const key of Object.keys(row)) {
            fieldSet.add(key);
        }
    }
    return [...fieldSet].sort();
};
