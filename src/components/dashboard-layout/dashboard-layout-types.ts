import type React from 'react';
import type { SVGIcon } from '../../assets/icons';

export type DashboardBreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface DashboardBreakpoint {
    key: DashboardBreakpointKey | string;
    minWidth: number;
    columns: number;
    label?: string;
}

export interface WidgetLayout {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    static?: boolean;
}

export type DashboardLayouts = Partial<Record<DashboardBreakpointKey | string, WidgetLayout[]>>;

export interface WidgetSettingsContext {
    widgetId: string;
    closeSettings: () => void;
}

export interface DashboardWidget {
    id: string;
    title: string;
    icon?: SVGIcon;
    description?: string;
    category?: string;
    chrome?: 'card' | 'plain' | 'borderless' | 'sunken';
    headerActions?: React.ReactNode;
    renderSettings?: (ctx: WidgetSettingsContext) => React.ReactNode;
    onRefresh?: () => void | Promise<void>;
    loading?: boolean;
    error?: string | null;
    lastUpdated?: Date | string | number;
    badge?: React.ReactNode;
    defaultCollapsed?: boolean;
    hidden?: boolean;
    canDrag?: boolean;
    canResize?: boolean;
    canRemove?: boolean;
    canCollapse?: boolean;
    canMaximize?: boolean;
    children: React.ReactNode;
}

export interface DashboardLayoutPreset {
    id: string;
    name: string;
    layouts: DashboardLayouts;
    hiddenIds?: string[];
    description?: string;
}

export interface DashboardLayoutState {
    layouts: DashboardLayouts;
    hiddenIds: string[];
    collapsedIds: string[];
    maximizedId: string | null;
    activePresetId?: string | null;
}

export interface DashboardLayoutChangePayload {
    state: DashboardLayoutState;
    reason:
        | 'drag'
        | 'resize'
        | 'add'
        | 'remove'
        | 'collapse'
        | 'expand'
        | 'maximize'
        | 'restore'
        | 'reset'
        | 'preset'
        | 'breakpoint';
}

export interface DashboardLayoutProps {
    widgets: DashboardWidget[];
    layouts?: DashboardLayouts;
    defaultLayouts?: DashboardLayouts;
    onLayoutChange?: (payload: DashboardLayoutChangePayload) => void;

    breakpoints?: DashboardBreakpoint[];
    rowHeight?: number;
    margin?: [number, number];
    containerPadding?: [number, number];
    minWidgetWidth?: number;
    minWidgetHeight?: number;

    editMode?: boolean;
    defaultEditMode?: boolean;
    onEditModeChange?: (editing: boolean) => void;

    persistKey?: string;
    presets?: DashboardLayoutPreset[];
    onPresetChange?: (preset: DashboardLayoutPreset | null) => void;

    showToolbar?: boolean;
    toolbarTitle?: string;
    toolbarSlotStart?: React.ReactNode;
    toolbarSlotEnd?: React.ReactNode;
    addWidgetLabel?: string;

    compactType?: 'vertical' | 'horizontal' | null;
    allowOverlap?: boolean;

    emptyState?: React.ReactNode;
    locale?: Partial<DashboardLayoutLocale>;

    className?: string;
    style?: React.CSSProperties;
    widgetClassName?: string;
}

export interface DashboardLayoutLocale {
    editLayout: string;
    doneEditing: string;
    addWidget: string;
    resetLayout: string;
    presets: string;
    savePreset: string;
    noPresets: string;
    hiddenWidgets: string;
    showWidget: string;
    hideWidget: string;
    removeWidget: string;
    collapse: string;
    expand: string;
    maximize: string;
    restore: string;
    refresh: string;
    settings: string;
    closeSettings: string;
    dragHandle: string;
    emptyDashboard: string;
    addWidgetPrompt: string;
    addAll: string;
    lastUpdated: string;
}

export const defaultBreakpoints: DashboardBreakpoint[] = [
    { key: 'xl', minWidth: 1536, columns: 12, label: 'Wide' },
    { key: 'lg', minWidth: 1200, columns: 12, label: 'Desktop' },
    { key: 'md', minWidth: 900, columns: 10, label: 'Laptop' },
    { key: 'sm', minWidth: 600, columns: 6, label: 'Tablet' },
    { key: 'xs', minWidth: 0, columns: 2, label: 'Mobile' },
];
