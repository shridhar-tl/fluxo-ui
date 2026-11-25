import type React from 'react';

import type {
    TreeTableColumn,
    TreeTableDropPosition,
    TreeTableKey,
    TreeTableLabels,
    TreeTableRowContext,
    TreeTableRowData,
    TreeTableSelectionMode,
} from './tree-table-types';
import type { ResolvedColumn } from './useTreeTableColumns';

export type RowCheckState = 'all' | 'some' | 'none';

export interface RowHandlers {
    toggle: (index: number) => void;
    select: (index: number, event: React.MouseEvent | React.KeyboardEvent) => void;
    check: (index: number) => void;
    rowClick: (index: number, event: React.MouseEvent<HTMLDivElement>) => void;
    rowDoubleClick: (index: number, event: React.MouseEvent<HTMLDivElement>) => void;
    rowContextMenu: (index: number, event: React.MouseEvent<HTMLDivElement>) => void;
    cellClick: (index: number, columnIndex: number, event: React.MouseEvent<HTMLDivElement>) => void;
    cellDoubleClick: (index: number, columnIndex: number) => void;
    focusCell: (index: number, columnIndex: number) => void;
    loadMore: (index: number) => void;
    retry: (index: number) => void;
    dragStart: (index: number, event: React.DragEvent<HTMLDivElement>) => void;
    dragOver: (index: number, event: React.DragEvent<HTMLDivElement>) => void;
    dragLeave: (index: number, event: React.DragEvent<HTMLDivElement>) => void;
    drop: (index: number, event: React.DragEvent<HTMLDivElement>) => void;
    dragEnd: () => void;
    commitEdit: (index: number, columnKey: string, value: unknown) => void;
    cancelEdit: () => void;
}

export interface RowConfig<T extends TreeTableRowData> {
    columns: ResolvedColumn<T>[];
    expanderKey: string;
    indent: number;
    showGuides: boolean;
    selectionMode: TreeTableSelectionMode;
    rowReorder: boolean;
    labels: TreeTableLabels;
    filterText: string;
    highlightTerms: Map<string, string[]>;
    highlightMatches: boolean;
    headerRowCount: number;
    rowIcon?: (row: T, context: { expanded: boolean; hasChildren: boolean; level: number }) => React.ReactNode;
    expandIcon?: React.ReactNode;
    collapseIcon?: React.ReactNode;
    rowClassName?: (row: T, context: TreeTableRowContext<T>) => string | undefined;
    rowLabel?: (row: T) => string;
    isRowDisabled: (row: T) => boolean;
    isRowSelectable: (row: T) => boolean;
    isCellEditable: (column: TreeTableColumn<T>, row: T) => boolean;
    aggregate: (row: T, column: TreeTableColumn<T>) => number | null;
    handlers: RowHandlers;
}

export interface EditingCell {
    key: TreeTableKey;
    columnKey: string;
    error: string | null;
}

export interface DropTarget {
    index: number;
    position: TreeTableDropPosition;
}
