export type DndAxis = 'x' | 'y' | 'both';

export type DropIndicator = 'highlight' | 'line' | 'none';

export type DropOrientation = 'vertical' | 'horizontal';

export type DropPosition = 'before' | 'after' | 'inside';

export type DropEffect = 'move' | 'copy' | 'link' | 'none';

export type DragPath = 'html5' | 'pointer';

export interface DragItem {
    index: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: any;
    itemType: string;
    id?: string | number;
    containerId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args?: any;
}

export interface DropResult {
    index: number;
    id?: string | number;
    containerId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item?: any;
    position?: DropPosition;
}

export interface ClientPoint {
    x: number;
    y: number;
}

export interface ActiveDrag {
    id: symbol;
    path: DragPath;
    item: DragItem;
    sourceNode: HTMLElement | null;
    sourceRect: DOMRect | null;
    startPoint: ClientPoint;
    currentPoint: ClientPoint;
    offsetWithinSource: ClientPoint;
    dropResult: DropResult | null;
    didDrop: boolean;
    files?: FileList | null;
    dataTransfer?: DataTransfer | null;
}

export interface DropNodeSpec {
    id: string;
    containerId: string;
    index: number;
    node: HTMLElement;
    accept: string | string[];
    greedy: boolean;
    orientation: DropOrientation;
    dropPosition: DropPosition | 'auto';
    edgeThreshold: number;
    acceptFiles: boolean;
    dropEffect: DropEffect;
    canDrop: (item: DragItem) => boolean;
    onDragEnter?: (item: DragItem, point: ClientPoint) => void;
    onDragLeave?: (item: DragItem) => void;
    onHover?: (item: DragItem, point: ClientPoint, position: DropPosition | undefined) => void;
    onDrop?: (item: DragItem, result: DropResult) => void;
    getArgs?: () => unknown;
    getId?: () => string | number | undefined;
    getIndex?: () => number;
}

export interface DragSourceSpec {
    containerId: string;
    index: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: any;
    itemType: string;
    id?: string | number;
    args?: unknown;
    canDrag: boolean;
    delay: number;
    axis: DndAxis;
    disableNativeDrag: boolean;
    dragPreview: 'default' | 'none' | HTMLElement | ((item: DragItem) => HTMLElement | null);
    dragPreviewOffset?: ClientPoint;
    dragHandle?: HTMLElement | null;
    dragData?: Record<string, string>;
    onDragStart?: (item: DragItem) => void;
    onDragging?: (point: ClientPoint) => void;
    onDragEnd?: (item: DragItem, didDrop: boolean, result: DropResult | null) => void;
    onRemove?: (source: { index: number; id?: string | number }, result: DropResult | null) => void;
}

export type Unsubscribe = () => void;
