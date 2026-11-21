import type { ListItem } from '../../../../types';
import type { AggregateFunction, DerivedTransform, DerivedTransformType, WindowFunction } from '../../report-definition-types';

export interface TransformCatalogEntry {
    type: DerivedTransformType;
    label: string;
    description: string;
    create: () => DerivedTransform;
}

export const transformCatalog: TransformCatalogEntry[] = [
    { type: 'filter', label: 'Filter rows', description: 'Keep only the rows matching a condition.', create: () => ({ type: 'filter', expression: '' }) },
    { type: 'computed', label: 'Add computed columns', description: 'Add or replace columns using expressions.', create: () => ({ type: 'computed', columns: [{ name: '', expression: '' }] }) },
    { type: 'pick', label: 'Select / rename fields', description: 'Keep only some fields, optionally renaming them.', create: () => ({ type: 'pick', fields: [{ source: '' }] }) },
    { type: 'sort', label: 'Sort', description: 'Order rows by one or more keys.', create: () => ({ type: 'sort', keys: [{ expression: '', direction: 'asc' }] }) },
    { type: 'group', label: 'Group & aggregate', description: 'Summarise rows per group with sum, count, average and more.', create: () => ({ type: 'group', keys: [{ name: '', expression: '' }], aggregates: [{ name: 'count', fn: 'count' }] }) },
    { type: 'join', label: 'Join datasource', description: 'Combine rows with another datasource on matching fields.', create: () => ({ type: 'join', datasourceId: '', joinType: 'left', on: [{ left: '', right: '' }], mode: 'merge' }) },
    { type: 'union', label: 'Append datasources', description: 'Stack the rows of other datasources below these rows.', create: () => ({ type: 'union', datasourceIds: [] }) },
    { type: 'flatten', label: 'Flatten nested list', description: 'Expand a nested array field into one row per item.', create: () => ({ type: 'flatten', childField: '', keepEmpty: true }) },
    { type: 'distinct', label: 'Remove duplicates', description: 'Keep unique rows, optionally by selected fields.', create: () => ({ type: 'distinct', fields: [] }) },
    { type: 'limit', label: 'Top N / paging', description: 'Skip rows and keep a maximum number of rows.', create: () => ({ type: 'limit', offset: 0, count: 10 }) },
    { type: 'pivot', label: 'Pivot', description: 'Turn the values of a field into columns.', create: () => ({ type: 'pivot', rowFields: [], columnField: '', aggregation: 'count' }) },
    { type: 'unpivot', label: 'Unpivot', description: 'Turn columns into name / value rows.', create: () => ({ type: 'unpivot', fields: [], nameField: 'name', valueField: 'value' }) },
    { type: 'window', label: 'Running totals & ranking', description: 'Row numbers, ranks, running sums, percent of total, previous / next values.', create: () => ({ type: 'window', partitionBy: [], orderBy: [], columns: [{ name: 'rowNumber', fn: 'rowNumber' }] }) },
];

export const transformLabels: Record<DerivedTransformType, string> = Object.fromEntries(
    transformCatalog.map((t) => [t.type, t.label]),
) as Record<DerivedTransformType, string>;

export const transformTypeOptions: ListItem[] = transformCatalog.map((t) => ({ value: t.type, label: t.label }));

export const aggregateOptions: ListItem[] = [
    { value: 'count', label: 'Count' },
    { value: 'countDistinct', label: 'Count distinct' },
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'median', label: 'Median' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' },
    { value: 'first', label: 'First' },
    { value: 'last', label: 'Last' },
    { value: 'concat', label: 'Concatenate' },
    { value: 'list', label: 'Unique list' },
] satisfies Array<{ value: AggregateFunction; label: string }>;

export const windowOptions: ListItem[] = [
    { value: 'rowNumber', label: 'Row number' },
    { value: 'rank', label: 'Rank' },
    { value: 'denseRank', label: 'Dense rank' },
    { value: 'runningSum', label: 'Running sum' },
    { value: 'runningCount', label: 'Running count' },
    { value: 'runningAvg', label: 'Running average' },
    { value: 'percentOfTotal', label: 'Percent of total' },
    { value: 'previous', label: 'Previous row value' },
    { value: 'next', label: 'Next row value' },
] satisfies Array<{ value: WindowFunction; label: string }>;

export const windowFunctionsWithField: WindowFunction[] = ['runningSum', 'runningCount', 'runningAvg', 'percentOfTotal', 'previous', 'next'];

export const joinTypeOptions: ListItem[] = [
    { value: 'inner', label: 'Inner — only matching rows' },
    { value: 'left', label: 'Left — all rows of this datasource' },
    { value: 'right', label: 'Right — all rows of the other datasource' },
    { value: 'full', label: 'Full — all rows of both' },
];

export const joinModeOptions: ListItem[] = [
    { value: 'merge', label: 'Merge fields into each row' },
    { value: 'nest', label: 'Nest matches as a list field' },
];
