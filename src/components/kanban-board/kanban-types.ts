import { ReactNode } from 'react';

export type KanbanCardId = string | number;
export type KanbanColumnId = string | number;

export interface KanbanCardData {
    id: KanbanCardId;
    title: string;
    description?: string;
    columnId: KanbanColumnId;
    order: number;
    priority?: KanbanPriority;
    labels?: KanbanLabel[];
    assignee?: KanbanAssignee;
    assignees?: KanbanAssignee[];
    dueDate?: Date | string;
    coverImage?: string;
    progress?: number;
    subtaskCount?: number;
    subtaskCompleted?: number;
    commentCount?: number;
    attachmentCount?: number;
    blocked?: boolean;
    color?: string;
    [key: string]: any;
}

export interface KanbanColumnData {
    id: KanbanColumnId;
    title: string;
    color?: string;
    icon?: ReactNode;
    limit?: number;
    collapsed?: boolean;
    locked?: boolean;
    [key: string]: any;
}

export type KanbanPriority = 'critical' | 'high' | 'medium' | 'low' | 'none';

export interface KanbanLabel {
    id: string;
    text: string;
    color: string;
}

export interface KanbanAssignee {
    id: string;
    name: string;
    avatar?: string;
}

export interface KanbanCardMoveEvent {
    cardId: KanbanCardId;
    card: KanbanCardData;
    fromColumnId: KanbanColumnId;
    toColumnId: KanbanColumnId;
    fromIndex: number;
    toIndex: number;
}

export interface KanbanCardReorderEvent {
    columnId: KanbanColumnId;
    cards: KanbanCardData[];
}

export interface KanbanColumnReorderEvent {
    columns: KanbanColumnData[];
}

export interface KanbanCardClickEvent {
    card: KanbanCardData;
    column: KanbanColumnData;
    event: React.MouseEvent;
}

export interface KanbanCardCreateEvent {
    columnId: KanbanColumnId;
    title: string;
}

export interface KanbanCardDeleteEvent {
    card: KanbanCardData;
    columnId: KanbanColumnId;
}

export interface KanbanColumnCreateEvent {
    title: string;
}

export interface KanbanColumnDeleteEvent {
    column: KanbanColumnData;
}

export interface KanbanColumnUpdateEvent {
    column: KanbanColumnData;
    field: string;
    value: any;
}

export interface KanbanSearchFilter {
    query?: string;
    priority?: KanbanPriority[];
    labels?: string[];
    assignees?: string[];
}

export type KanbanLayout = 'horizontal' | 'vertical';
export type KanbanCardSize = 'compact' | 'default' | 'detailed';

export interface KanbanBoardProps {
    columns: KanbanColumnData[];
    cards: KanbanCardData[];

    layout?: KanbanLayout;
    cardSize?: KanbanCardSize;
    className?: string;
    columnWidth?: number | string;
    columnMinHeight?: number | string;
    maxColumnHeight?: number | string;

    draggable?: boolean;
    columnDraggable?: boolean;
    allowAddCard?: boolean;
    allowAddColumn?: boolean;
    allowDeleteCard?: boolean;
    allowDeleteColumn?: boolean;
    allowEditColumn?: boolean;
    allowCollapse?: boolean;
    showCardCount?: boolean;
    showColumnLimit?: boolean;
    showSearch?: boolean;
    virtualScroll?: boolean;
    stickyColumnHeaders?: boolean;

    cardTemplate?: (card: KanbanCardData, column: KanbanColumnData) => ReactNode;
    columnHeaderTemplate?: (column: KanbanColumnData, cardCount: number) => ReactNode;
    columnFooterTemplate?: (column: KanbanColumnData, cards: KanbanCardData[]) => ReactNode;
    emptyColumnTemplate?: (column: KanbanColumnData) => ReactNode;
    cardActionsTemplate?: (card: KanbanCardData, column: KanbanColumnData) => ReactNode;

    onCardMove?: (event: KanbanCardMoveEvent) => void;
    onCardReorder?: (event: KanbanCardReorderEvent) => void;
    onCardClick?: (event: KanbanCardClickEvent) => void;
    onCardDoubleClick?: (event: KanbanCardClickEvent) => void;
    onCardCreate?: (event: KanbanCardCreateEvent) => void;
    onCardDelete?: (event: KanbanCardDeleteEvent) => void;
    onColumnReorder?: (event: KanbanColumnReorderEvent) => void;
    onColumnCreate?: (event: KanbanColumnCreateEvent) => void;
    onColumnDelete?: (event: KanbanColumnDeleteEvent) => void;
    onColumnUpdate?: (event: KanbanColumnUpdateEvent) => void;
    onColumnCollapse?: (columnId: KanbanColumnId, collapsed: boolean) => void;
    onSearchChange?: (filter: KanbanSearchFilter) => void;
}

export interface KanbanColumnProps {
    column: KanbanColumnData;
    cards: KanbanCardData[];
    index: number;
    isCollapsed: boolean;
}

export interface KanbanCardProps {
    card: KanbanCardData;
    column: KanbanColumnData;
    index: number;
}

export interface KanbanContextValue {
    props: KanbanBoardProps;
    collapsedColumns: Set<KanbanColumnId>;
    toggleCollapse: (columnId: KanbanColumnId) => void;
    searchFilter: KanbanSearchFilter;
    setSearchFilter: (filter: KanbanSearchFilter) => void;
    editingColumnId: KanbanColumnId | null;
    setEditingColumnId: (id: KanbanColumnId | null) => void;
}
