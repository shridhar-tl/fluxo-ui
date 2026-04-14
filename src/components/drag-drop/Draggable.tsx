import classNames from 'classnames';
import React, { CSSProperties, ReactNode, RefObject, useMemo } from 'react';
import { useDrag } from './hooks/useDrag';
import type { DragItem as CoreDragItem, DropResult as CoreDropResult } from './core/types';

export type DragItem = CoreDragItem;
export type DropResult = CoreDropResult;

export type DndRefCallback<T = HTMLElement> = ((node: T | null) => void) | null;

export interface DraggableRenderProps<T = HTMLElement> {
    isDragging: boolean;
    canDrag: boolean;
    dragRef: DndRefCallback<T>;
    handlerId: string;
}

export type DragPreviewProp =
    | 'default'
    | 'none'
    | HTMLElement
    | ((item: DragItem) => HTMLElement | null);

export interface DraggableProps<T = HTMLElement> {
    containerId: string;
    index: number;
    id?: string | number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: any;
    itemType?: string;
    args?: unknown;
    testId?: string;
    className?: string;
    draggingClassName?: string;
    style?: CSSProperties;

    canDrag?: boolean;
    delay?: number;
    axis?: 'x' | 'y' | 'both';
    disableNativeDrag?: boolean;
    dragHandle?: RefObject<HTMLElement | null>;
    dragPreview?: DragPreviewProp;
    dragPreviewOffset?: { x: number; y: number };
    dragData?: Record<string, string>;

    hideDefaultPreview?: boolean;

    onDragStart?: (item: DragItem) => void;
    onDragging?: (point: { x: number; y: number }) => void;
    onDragEnd?: (item: DragItem, didDrop: boolean, result: DropResult | null) => void;
    onRemove?: (source: { index: number; id?: string | number }, result: DropResult | null) => void;

    children: ReactNode | ((props: DraggableRenderProps<T>) => ReactNode);
}

function Draggable<T extends HTMLElement = HTMLElement>(props: DraggableProps<T>) {
    const {
        containerId,
        index,
        id,
        item,
        itemType = 'any',
        args,
        testId,
        className,
        draggingClassName,
        style,
        canDrag: canDragProp = true,
        delay = 0,
        axis = 'both',
        disableNativeDrag = false,
        dragHandle,
        dragPreview,
        hideDefaultPreview = false,
        dragData,
        onDragStart,
        onDragging,
        onDragEnd,
        onRemove,
        children,
    } = props;

    const resolvedPreview: DragPreviewProp = dragPreview ?? (hideDefaultPreview ? 'none' : 'default');

    const { dragRef, isDragging, canDrag, handlerId } = useDrag({
        containerId,
        index,
        item,
        itemType,
        id,
        args,
        canDrag: canDragProp,
        delay,
        axis,
        disableNativeDrag,
        dragPreview: resolvedPreview,
        dragHandle: dragHandle?.current ?? null,
        dragData,
        onDragStart,
        onDragging,
        onDragEnd,
        onRemove,
    });

    const elClassName = useMemo(
        () =>
            classNames('eui-draggable', className, {
                'eui-draggable-enabled': canDrag,
                'eui-draggable-dragging': isDragging,
                [draggingClassName || '']: isDragging && !!draggingClassName,
            }),
        [className, canDrag, isDragging, draggingClassName],
    );

    if (typeof children === 'function') {
        return <>{(children as (p: DraggableRenderProps<T>) => ReactNode)({ isDragging, canDrag, dragRef: dragRef as DndRefCallback<T>, handlerId })}</>;
    }

    return (
        <div
            ref={dragRef as DndRefCallback<HTMLDivElement>}
            className={elClassName}
            style={style}
            data-testid={testId}
            data-drag-handler={handlerId}
        >
            {children}
        </div>
    );
}

export default React.memo(Draggable) as typeof Draggable;
