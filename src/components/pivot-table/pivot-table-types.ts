import type React from 'react';

export type BuiltInAggregateFunction = 'sum' | 'average' | 'count' | 'min' | 'max' | 'product' | 'distinct' | 'distinctCount' | 'median' | 'first' | 'last' | 'variance' | 'stddev' | 'range' | 'percentile90';

export type AggregateFunction = BuiltInAggregateFunction | string;

export type SortDirection = 'asc' | 'desc' | 'none';

export type FieldDataType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'custom';

export type PivotZone = 'rows' | 'columns' | 'values' | 'filters' | 'available';

export interface CustomAggregatePlugin {
    name: string;
    label: string;
    fn: (values: unknown[], allRows: Record<string, unknown>[]) => number | string;
    description?: string;
}

export interface FieldDefinition {
    field: string;
    label: string;
    dataType?: FieldDataType;
    editable?: boolean;
    editor?: React.ComponentType<CellEditorProps>;
    template?: React.ComponentType<CellTemplateProps> | ((value: unknown, row: Record<string, unknown>) => React.ReactNode);
    format?: (value: number | string) => string;
    sortable?: boolean;
    filterable?: boolean;
    width?: string | number;
    aggregatable?: boolean;
    defaultAggregateFunction?: AggregateFunction;
    allowedAggregateFunctions?: AggregateFunction[];
    validators?: Array<(value: unknown) => string | null>;
}

export interface CellEditorProps {
    value: unknown;
    field: string;
    row: Record<string, unknown>;
    onChange: (value: unknown) => void;
    onCommit: () => void;
    onCancel: () => void;
}

export interface CellTemplateProps {
    value: unknown;
    field: string;
    row: Record<string, unknown>;
    formattedValue: string;
}

export interface PivotField {
    field: string;
    label: string;
    aggregateFunction?: AggregateFunction;
    format?: (value: number | string) => string;
    sortable?: boolean;
    width?: string | number;
    template?: React.ComponentType<CellTemplateProps> | ((value: unknown, row: Record<string, unknown>) => React.ReactNode);
}

export interface PivotConfig {
    rows: string[];
    columns: string[];
    values: PivotField[];
    filters?: PivotFilter[];
}

export interface PivotFilter {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'notIn' | 'between' | 'isEmpty' | 'isNotEmpty';
    value: unknown;
}

export interface PivotSort {
    field: string;
    direction: SortDirection;
}

export type EditMode = 'inline' | 'popover' | 'icon' | 'click' | 'doubleClick';

export interface EditConfig {
    mode?: EditMode;
    showEditIcon?: boolean;
    editIconPosition?: 'left' | 'right';
    commitOnBlur?: boolean;
    commitOnEnter?: boolean;
    cancelOnEscape?: boolean;
    selectAllOnFocus?: boolean;
    popoverWidth?: string | number;
    highlightOnEdit?: boolean;
    showConfirmCancel?: boolean;
}

export interface PivotPermissions {
    allowDragDrop?: boolean;
    allowAddRows?: boolean;
    allowAddColumns?: boolean;
    allowAddValues?: boolean;
    allowAddFilters?: boolean;
    allowRemoveFields?: boolean;
    allowChangeAggregation?: boolean;
    allowSort?: boolean;
    allowFilter?: boolean;
    allowEdit?: boolean;
    allowExport?: boolean;
    allowExpandCollapse?: boolean;
    allowConfigPanel?: boolean;
    editableFields?: string[];
    readOnlyFields?: string[];
}

export interface PivotPlugin {
    name: string;
    aggregateFunctions?: CustomAggregatePlugin[];
    cellRenderers?: Record<string, React.ComponentType<CellTemplateProps>>;
    cellEditors?: Record<string, React.ComponentType<CellEditorProps>>;
    onBeforeAggregate?: (rows: Record<string, unknown>[], field: string) => Record<string, unknown>[];
    onAfterAggregate?: (result: number | string, field: string, fn: string) => number | string;
    onBeforeEdit?: (row: Record<string, unknown>, field: string, newValue: unknown) => unknown;
    onAfterEdit?: (row: Record<string, unknown>, field: string, newValue: unknown) => void;
    onConfigChange?: (config: PivotConfig) => PivotConfig;
}

export interface PivotTableProps<T extends Record<string, unknown> = Record<string, unknown>> {
    data: T[];
    config: PivotConfig;
    fieldDefinitions?: FieldDefinition[];
    onConfigChange?: (config: PivotConfig) => void;
    onDataChange?: (data: T[], rowIndex: number, field: string, newValue: unknown) => void;

    defaultExpandedRows?: string[];
    expandAll?: boolean;
    showGrandTotal?: boolean;
    showSubTotals?: boolean;
    showColumnTotals?: boolean;
    sortable?: boolean;
    striped?: boolean;
    bordered?: boolean;
    compact?: boolean;
    className?: string;
    emptyMessage?: string;
    maxDepth?: number;

    showToolbar?: boolean;
    showConfigPanel?: boolean;
    configPanelPosition?: 'left' | 'right' | 'top';
    configPanelCollapsible?: boolean;

    permissions?: PivotPermissions;
    plugins?: PivotPlugin[];
    disabledFunctions?: BuiltInAggregateFunction[];

    editable?: boolean;
    editConfig?: EditConfig;
    onCellEdit?: (row: T, field: string, oldValue: unknown, newValue: unknown) => boolean | void;

    exportable?: boolean;
    onExport?: (format: 'csv' | 'json') => void;

    headerTemplate?: (field: string, label: string) => React.ReactNode;
    rowHeaderTemplate?: (label: string, depth: number, node: PivotNode) => React.ReactNode;
    cellTemplate?: React.ComponentType<CellTemplateProps> | ((value: unknown, row: Record<string, unknown>) => React.ReactNode);

    loading?: boolean;
    height?: string | number;
}

export interface PivotNode {
    key: string;
    label: string;
    depth: number;
    values: Record<string, Record<string, number | string>>;
    children: PivotNode[];
    isLeaf: boolean;
    rowCount: number;
    sourceRows?: Record<string, unknown>[];
}

export interface ColumnNode {
    key: string;
    label: string;
    children: ColumnNode[];
    isLeaf: boolean;
    span: number;
}

export interface DragItem {
    field: string;
    label: string;
    sourceZone: PivotZone;
    aggregateFunction?: AggregateFunction;
}
