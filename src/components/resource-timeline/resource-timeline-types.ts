import type { ReactNode } from 'react';

export interface ResourceTimelineResource {
    id: string;
    name: string;
    data?: Record<string, unknown>;
}

export interface ResourceTimelineEvent {
    id: string;
    resourceId: string;
    start: Date | string;
    end: Date | string;
    title: string;
    color?: string;
    textColor?: string;
    draggable?: boolean;
    resizable?: boolean;
    data?: Record<string, unknown>;
}

export interface ResourceTimelineMarker {
    id?: string;
    date: Date | string;
    label?: string;
    color?: string;
}

export interface ResourceTimelineEventChangeEvent {
    item: ResourceTimelineEvent;
    start: Date;
    end: Date;
    resourceId: string;
    previousResourceId: string;
}

export interface ResourceTimelineEventClickEvent {
    item: ResourceTimelineEvent;
    event: React.MouseEvent | React.KeyboardEvent;
}

export interface ResourceTimelineDropEvent {
    resourceId: string;
    date: Date;
    dataTransfer: DataTransfer;
}

export interface ResourceTimelineProps {
    resources: ResourceTimelineResource[];
    events: ResourceTimelineEvent[];
    startDate: Date | string;
    endDate: Date | string;
    dayWidth?: number;
    laneHeight?: number;
    resourceWidth?: number | string;
    height?: number | string;
    markers?: ResourceTimelineMarker[];
    readOnly?: boolean;
    allowResourceChange?: boolean;
    showToday?: boolean;
    isNonWorkingDay?: (date: Date, resourceId: string) => boolean;
    resourceTemplate?: (resource: ResourceTimelineResource) => ReactNode;
    eventTemplate?: (item: ResourceTimelineEvent, width: number) => ReactNode;
    dayCellTemplate?: (resource: ResourceTimelineResource, date: Date) => ReactNode;
    dayCellHeight?: number;
    emptyMessage?: ReactNode;
    className?: string;
    ariaLabel?: string;
    onEventChange?: (event: ResourceTimelineEventChangeEvent) => void;
    onEventClick?: (event: ResourceTimelineEventClickEvent) => void;
    onEventDoubleClick?: (event: ResourceTimelineEventClickEvent) => void;
    onExternalDrop?: (event: ResourceTimelineDropEvent) => void;
}

export interface PlacedEvent {
    item: ResourceTimelineEvent;
    startIndex: number;
    endIndex: number;
    lane: number;
}

export type DragMode = 'move' | 'resize-start' | 'resize-end';

export interface DragState {
    eventId: string;
    mode: DragMode;
    startX: number;
    deltaX: number;
    sourceResourceId: string;
    targetResourceId: string;
    moved: boolean;
}
