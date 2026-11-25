import type React from 'react';

export type TreeTableKey = string | number;

export type TreeTableRowData = object;

export type TreeTableSize = 'sm' | 'md' | 'lg';

export type TreeTableGridLines = 'none' | 'horizontal' | 'vertical' | 'both';

export type TreeTableSelectionMode = 'none' | 'single' | 'multiple' | 'checkbox';

export type TreeTableFilterMode = 'lenient' | 'strict';

export type TreeTableAlign = 'left' | 'center' | 'right';

export type TreeTableFrozen = 'left' | 'right';

export type TreeTableSortDirection = 'asc' | 'desc';

export type TreeTableBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type TreeTableAggregate = 'sum' | 'avg' | 'min' | 'max' | 'count';

export type TreeTableDropPosition = 'before' | 'after' | 'inside';

export interface TreeTableSort {
    key: string;
    direction: TreeTableSortDirection;
}

export interface TreeTableRowContext<T extends TreeTableRowData> {
    row: T;
    rowKey: TreeTableKey;
    rowIndex: number;
    level: number;
    parentKey: TreeTableKey | null;
    hasChildren: boolean;
    expanded: boolean;
    loading: boolean;
    selected: boolean;
    disabled: boolean;
    toggle: () => void;
}

export interface TreeTableCellContext<T extends TreeTableRowData> extends TreeTableRowContext<T> {
    value: unknown;
    aggregated: boolean;
    column: TreeTableColumn<T>;
    filterText: string;
}

export interface TreeTableHeaderContext<T extends TreeTableRowData> {
    column: TreeTableColumn<T>;
    sortDirection: TreeTableSortDirection | null;
    sortIndex: number;
}

export interface TreeTableFooterContext<T extends TreeTableRowData> {
    column: TreeTableColumn<T>;
    rows: T[];
    aggregate: number | null;
}

export interface TreeTableFilterContext<T extends TreeTableRowData> {
    column: TreeTableColumn<T>;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    ariaLabel: string;
}

export interface TreeTableEditorContext<T extends TreeTableRowData> {
    row: T;
    rowKey: TreeTableKey;
    column: TreeTableColumn<T>;
    value: unknown;
    error: string | null;
    commit: (value: unknown) => void;
    cancel: () => void;
    ariaLabel: string;
}

export interface TreeTableCellEditEvent<T extends TreeTableRowData> {
    row: T;
    rowKey: TreeTableKey;
    column: TreeTableColumn<T>;
    field: string;
    value: unknown;
    previousValue: unknown;
}

export interface TreeTableRowMoveEvent<T extends TreeTableRowData> {
    row: T;
    rowKey: TreeTableKey;
    target: T;
    targetKey: TreeTableKey;
    position: TreeTableDropPosition;
}

export interface TreeTableExpandEvent<T extends TreeTableRowData> {
    row: T | null;
    rowKey: TreeTableKey | null;
    expanded: boolean;
}

export interface TreeTableSelectionEvent<T extends TreeTableRowData> {
    row: T | null;
    rowKey: TreeTableKey | null;
    selected: boolean;
}

export interface TreeTableCellClickEvent<T extends TreeTableRowData> {
    row: T;
    rowKey: TreeTableKey;
    column: TreeTableColumn<T>;
    value: unknown;
}

export interface TreeTableChildrenPage<T extends TreeTableRowData> {
    rows: T[];
    hasMore?: boolean;
}

export interface TreeTableLoadChildrenContext {
    offset: number;
    signal: AbortSignal;
}

export type TreeTableLoadChildren<T extends TreeTableRowData> = (
    row: T,
    context: TreeTableLoadChildrenContext,
) => Promise<T[] | TreeTableChildrenPage<T>>;

export interface TreeTableColumn<T extends TreeTableRowData> {
    key: string;
    field?: string;
    title?: React.ReactNode;
    headerAriaLabel?: string;
    group?: string;
    width?: number | string;
    minWidth?: number;
    maxWidth?: number;
    align?: TreeTableAlign;
    headerAlign?: TreeTableAlign;
    frozen?: TreeTableFrozen;
    hidden?: boolean;
    hideBelow?: TreeTableBreakpoint;
    sortable?: boolean;
    sortFn?: (a: T, b: T) => number;
    resizable?: boolean;
    reorderable?: boolean;
    filterable?: boolean;
    filterFn?: (value: unknown, row: T, filterValue: string) => boolean;
    filterPlaceholder?: string;
    globalFilter?: boolean;
    ellipsis?: boolean;
    wrap?: boolean;
    showTitle?: boolean;
    valueGetter?: (row: T) => unknown;
    format?: (value: unknown, row: T) => string;
    aggregate?: TreeTableAggregate | ((rows: T[], values: unknown[]) => number | null);
    aggregateParents?: boolean;
    editable?: boolean | ((row: T) => boolean);
    validate?: (value: unknown, row: T) => string | null;
    parseValue?: (input: string, row: T) => unknown;
    className?: string;
    headerClassName?: string;
    cellClassName?: string | ((row: T) => string | undefined);
    cell?: (context: TreeTableCellContext<T>) => React.ReactNode;
    header?: (context: TreeTableHeaderContext<T>) => React.ReactNode;
    footer?: React.ReactNode | ((context: TreeTableFooterContext<T>) => React.ReactNode);
    filter?: (context: TreeTableFilterContext<T>) => React.ReactNode;
    editor?: (context: TreeTableEditorContext<T>) => React.ReactNode;
}

export interface TreeTableLabels {
    expand: string;
    collapse: string;
    loading: string;
    loadingMore: string;
    loadMore: string;
    loadError: string;
    retry: string;
    noRows: string;
    selectAll: string;
    selectRow: string;
    filterPlaceholder: string;
    filterBy: string;
    sortAscending: string;
    sortDescending: string;
    sortNone: string;
    resizeColumn: string;
    rowsSelected: string;
    rowsCount: string;
    childrenLoaded: string;
    editCell: string;
    dragRow: string;
    rowMoved: string;
}

export interface TreeTableCsvOptions {
    includeHidden?: boolean;
    onlySelected?: boolean;
    allRows?: boolean;
    delimiter?: string;
    includeLevel?: boolean;
    levelHeader?: string;
}

export interface TreeTableHandle<T extends TreeTableRowData> {
    expandAll: () => void;
    collapseAll: () => void;
    expandToLevel: (level: number) => void;
    expandRow: (key: TreeTableKey) => void;
    collapseRow: (key: TreeTableKey) => void;
    toggleRow: (key: TreeTableKey) => void;
    revealRow: (key: TreeTableKey) => void;
    scrollToRow: (key: TreeTableKey, align?: 'start' | 'center' | 'end' | 'auto') => void;
    scrollToIndex: (index: number, align?: 'start' | 'center' | 'end' | 'auto') => void;
    scrollToTop: () => void;
    focusRow: (key: TreeTableKey) => void;
    reloadChildren: (key: TreeTableKey) => void;
    getRow: (key: TreeTableKey) => T | undefined;
    getVisibleRows: () => T[];
    getSelectedRows: () => T[];
    selectAll: () => void;
    clearSelection: () => void;
    clearFilters: () => void;
    toCsv: (options?: TreeTableCsvOptions) => string;
}

export interface TreeTableProps<T extends TreeTableRowData> {
    data: T[];
    columns: TreeTableColumn<T>[];
    rowKey?: string | ((row: T) => TreeTableKey);
    childrenField?: string;
    getChildren?: (row: T) => T[] | null | undefined;
    parentKey?: string | ((row: T) => TreeTableKey | null | undefined);
    hasChildren?: (row: T) => boolean;
    loadChildren?: TreeTableLoadChildren<T>;
    expandedKeys?: ReadonlySet<TreeTableKey>;
    defaultExpandedKeys?: Iterable<TreeTableKey>;
    defaultExpandAll?: boolean;
    defaultExpandLevel?: number;
    onExpandedChange?: (keys: Set<TreeTableKey>, event: TreeTableExpandEvent<T>) => void;
    expandOnRowClick?: boolean;
    expanderColumn?: string;
    selectionMode?: TreeTableSelectionMode;
    selectedKeys?: ReadonlySet<TreeTableKey>;
    defaultSelectedKeys?: Iterable<TreeTableKey>;
    onSelectionChange?: (keys: Set<TreeTableKey>, event: TreeTableSelectionEvent<T>) => void;
    propagateSelection?: boolean;
    showSelectAll?: boolean;
    isRowSelectable?: (row: T) => boolean;
    isRowDisabled?: (row: T) => boolean;
    sort?: TreeTableSort[];
    defaultSort?: TreeTableSort[];
    onSortChange?: (sort: TreeTableSort[]) => void;
    multiSort?: boolean;
    manualSort?: boolean;
    filterText?: string;
    filters?: Record<string, string>;
    defaultFilters?: Record<string, string>;
    onFiltersChange?: (filters: Record<string, string>) => void;
    showFilterRow?: boolean;
    filterMode?: TreeTableFilterMode;
    filterDebounce?: number;
    manualFilter?: boolean;
    highlightMatches?: boolean;
    size?: TreeTableSize;
    rowHeight?: number | ((row: T, level: number) => number);
    height?: number | string;
    overscan?: number;
    indent?: number;
    showGuides?: boolean;
    gridLines?: TreeTableGridLines;
    striped?: boolean;
    hoverable?: boolean;
    resizableColumns?: boolean;
    onColumnResize?: (key: string, width: number) => void;
    reorderableColumns?: boolean;
    columnOrder?: string[];
    onColumnOrderChange?: (order: string[]) => void;
    rowReorder?: boolean;
    canMoveRow?: (event: TreeTableRowMoveEvent<T>) => boolean;
    onRowMove?: (event: TreeTableRowMoveEvent<T>) => void;
    onCellEdit?: (event: TreeTableCellEditEvent<T>) => void;
    rowIcon?: (row: T, context: { expanded: boolean; hasChildren: boolean; level: number }) => React.ReactNode;
    expandIcon?: React.ReactNode;
    collapseIcon?: React.ReactNode;
    rowClassName?: (row: T, context: TreeTableRowContext<T>) => string | undefined;
    rowLabel?: (row: T) => string;
    onRowClick?: (row: T, event: React.MouseEvent<HTMLDivElement>) => void;
    onRowDoubleClick?: (row: T, event: React.MouseEvent<HTMLDivElement>) => void;
    onRowContextMenu?: (row: T, event: React.MouseEvent<HTMLDivElement>) => void;
    onCellClick?: (event: TreeTableCellClickEvent<T>, nativeEvent: React.MouseEvent<HTMLDivElement>) => void;
    onEndReached?: () => void;
    hasMore?: boolean;
    loadingMore?: boolean;
    endReachedThreshold?: number;
    loading?: boolean;
    skeletonRows?: number;
    emptyMessage?: React.ReactNode;
    showFooter?: boolean;
    caption?: React.ReactNode;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
    labels?: Partial<TreeTableLabels>;
    id?: string;
    className?: string;
    style?: React.CSSProperties;
}
