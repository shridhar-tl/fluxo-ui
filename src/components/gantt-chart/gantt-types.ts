import { JSX, ReactNode } from 'react';

export type GanttViewMode = 'day' | 'week' | 'month' | 'quarter' | 'year';

export type DependencyType = 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';

export type TaskType = 'task' | 'milestone' | 'group';

export interface GanttTask {
    id: string;
    name: string;
    start: Date | string;
    end: Date | string;
    progress?: number;
    type?: TaskType;
    color?: string;
    textColor?: string;
    dependencies?: GanttDependency[];
    children?: GanttTask[];
    collapsed?: boolean;
    assignee?: string;
    tooltip?: ReactNode | ((task: GanttTask) => ReactNode);
    data?: Record<string, unknown>;
    draggable?: boolean;
    resizable?: boolean;
}

export interface GanttDependency {
    targetId: string;
    type?: DependencyType;
    color?: string;
}

export interface GanttColumn {
    field: string;
    headerText: string;
    width?: number | string;
    minWidth?: number;
    template?: (props: GanttColumnTemplateProps) => JSX.Element;
    sortable?: boolean;
    align?: 'left' | 'center' | 'right';
}

export interface GanttColumnTemplateProps {
    value: unknown;
    task: GanttTask;
    column: GanttColumn;
    depth: number;
}

export interface GanttMarker {
    id?: string;
    date: Date | string;
    label?: string;
    color?: string;
    cssClass?: string;
}

export interface GanttDateCell {
    date: Date;
    dateStr: string;
    dayNum: number;
    dayName: string;
    monthName: string;
    year: number;
    isWeekend: boolean;
    isHoliday: boolean;
    isToday: boolean;
    columnIndex: number;
}

export interface GanttWeekGroup {
    label: string;
    span: number;
}

export interface GanttTaskBarInfo {
    task: GanttTask;
    flatIndex: number;
    depth: number;
    left: number;
    width: number;
    startCol: number;
    endCol: number;
    isGroup: boolean;
    isMilestone: boolean;
    parentId?: string;
}

export interface GanttDragState {
    type: 'move' | 'resize-start' | 'resize-end' | 'create';
    taskBarInfo?: GanttTaskBarInfo;
    startX: number;
    currentX: number;
    startCol: number;
    currentCol: number;
    originalLeft: number;
    originalWidth: number;
}

export interface GanttTaskChangeEvent {
    task: GanttTask;
    originalTask: GanttTask;
    start: Date;
    end: Date;
}

export interface GanttTaskClickEvent {
    task: GanttTask;
    event: React.MouseEvent;
}

export interface GanttTaskCreateEvent {
    start: Date;
    end: Date;
    parentTask?: GanttTask;
}

export interface GanttProps {
    tasks: GanttTask[];
    columns?: GanttColumn[];
    viewMode?: GanttViewMode;
    startDate?: Date | string;
    endDate?: Date | string;
    height?: number | string;
    rowHeight?: number;
    columnWidth?: number;
    fieldsPanelWidth?: number | string;
    showFieldsPanel?: boolean;
    showToday?: boolean;
    showWeekends?: boolean;
    showGrid?: boolean;
    showDependencies?: boolean;
    showProgress?: boolean;
    showTooltip?: boolean;
    markers?: GanttMarker[];
    isHoliday?: (date: Date) => boolean;
    allowTaskDrag?: boolean;
    allowTaskResize?: boolean;
    allowTaskCreate?: boolean;
    allowSort?: boolean;
    readOnly?: boolean;
    locale?: string;
    todayColor?: string;
    weekendColor?: string;
    holidayColor?: string;
    className?: string;
    taskBarTemplate?: (props: TaskBarTemplateProps) => JSX.Element;
    tooltipTemplate?: (task: GanttTask) => ReactNode;
    onTaskChange?: (event: GanttTaskChangeEvent) => void;
    onTaskClick?: (event: GanttTaskClickEvent) => void;
    onTaskDoubleClick?: (event: GanttTaskClickEvent) => void;
    onTaskCreate?: (event: GanttTaskCreateEvent) => void;
    onViewModeChange?: (mode: GanttViewMode) => void;
    onScroll?: (scrollLeft: number, scrollTop: number) => void;
    onExpandToggle?: (task: GanttTask, expanded: boolean) => void;
}

export interface TaskBarTemplateProps {
    task: GanttTask;
    width: number;
    isGroup: boolean;
    isMilestone: boolean;
}

export interface FlatTask {
    task: GanttTask;
    depth: number;
    index: number;
    parentId?: string;
    hasChildren: boolean;
    isCollapsed: boolean;
    isVisible: boolean;
}

export interface GanttContextValue {
    viewMode: GanttViewMode;
    dateCells: GanttDateCell[];
    weekGroups: GanttWeekGroup[];
    flatTasks: FlatTask[];
    columnWidth: number;
    rowHeight: number;
    totalWidth: number;
    totalHeight: number;
    startDate: Date;
    endDate: Date;
    showProgress: boolean;
    showDependencies: boolean;
    showTooltip: boolean;
    allowTaskDrag: boolean;
    allowTaskResize: boolean;
    allowTaskCreate: boolean;
    readOnly: boolean;
    todayColumnIndex: number;
    collapsedIds: Set<string>;
    toggleCollapse: (taskId: string) => void;
    getTaskBarInfo: (task: GanttTask) => GanttTaskBarInfo | null;
    taskBarTemplate?: (props: TaskBarTemplateProps) => JSX.Element;
    tooltipTemplate?: (task: GanttTask) => ReactNode;
    onTaskChange?: (event: GanttTaskChangeEvent) => void;
    onTaskClick?: (event: GanttTaskClickEvent) => void;
    onTaskDoubleClick?: (event: GanttTaskClickEvent) => void;
    onTaskCreate?: (event: GanttTaskCreateEvent) => void;
    onExpandToggle?: (task: GanttTask, expanded: boolean) => void;
    markers: GanttMarker[];
    weekendColor: string;
    holidayColor: string;
    todayColor: string;
    isHoliday: (date: Date) => boolean;
}
