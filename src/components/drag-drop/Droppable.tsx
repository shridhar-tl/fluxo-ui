import classNames from 'classnames';
import { CSSProperties, HTMLAttributes, ReactNode, useMemo } from 'react';
import { useDrop } from './hooks/useDrop';
import type { DragItem, DropPosition, DropResult } from './core/types';
import '../eui-base.scss';
import './drag-drop.scss';

export type DropIndicator = 'highlight' | 'line' | 'none';
export type DropOrientation = 'vertical' | 'horizontal';

export type DndRefCallback<T = HTMLElement> = ((node: T | null) => void) | null;

export interface DroppableRenderProps<T = HTMLElement> {
    dropRef: DndRefCallback<T>;
    canDrop: boolean;
    isOver: boolean;
    isOverCurrent: boolean;
    position: DropPosition | undefined;
}

export interface DroppableProps<T = HTMLElement> {
    containerId: string;
    index: number;
    id?: string | number;
    args?: unknown;
    accept?: string | string[];
    className?: string;
    style?: CSSProperties;

    dropIndicator?: DropIndicator;
    linePosition?: 'start' | 'end';
    orientation?: DropOrientation;

    dropPosition?: DropPosition | 'auto';
    edgeThreshold?: number;
    acceptFiles?: boolean;
    greedy?: boolean;
    dropEffect?: 'move' | 'copy' | 'link' | 'none';

    testId?: string;
    canDrop?: boolean | ((item: DragItem) => boolean);

    onDrop?: (source: DragItem, target: DropResult) => void;
    onDragEnter?: (item: DragItem) => void;
    onDragLeave?: (item: DragItem) => void;
    onHover?: (item: DragItem, position: DropPosition | undefined) => void;

    domProps?: HTMLAttributes<HTMLDivElement> & Record<`data-${string}`, string | number | boolean | undefined>;

    children: ReactNode | ((props: DroppableRenderProps<T>) => ReactNode);
}

function Droppable<T extends HTMLElement = HTMLElement>(props: DroppableProps<T>) {
    const {
        containerId,
        index,
        id,
        args,
        accept = 'any',
        className,
        style,
        dropIndicator = 'highlight',
        linePosition = 'start',
        orientation = 'vertical',
        dropPosition = 'inside',
        edgeThreshold = 8,
        acceptFiles = false,
        greedy = true,
        dropEffect = 'move',
        testId,
        canDrop: canDropProp,
        onDrop,
        onDragEnter,
        onDragLeave,
        onHover,
        domProps,
        children,
    } = props;

    const drop = useDrop({
        containerId,
        index,
        id,
        args,
        accept,
        greedy,
        orientation,
        dropPosition,
        edgeThreshold,
        acceptFiles,
        dropEffect,
        canDrop: canDropProp,
        onDragEnter,
        onDragLeave,
        onHover,
        onDrop,
    });

    const { dropRef, isOver, isOverCurrent, canDrop, position } = drop;

    const elClassName = useMemo(
        () =>
            classNames('eui-droppable', className, {
                'eui-droppable-allowed': canDrop,
                'eui-droppable-denied': !canDrop && isOver,
                'eui-droppable-hover': isOver,
                'eui-droppable-hover-current': isOverCurrent,
                'eui-droppable-indicator-highlight': dropIndicator === 'highlight',
                'eui-droppable-indicator-line': dropIndicator === 'line',
                'eui-droppable-line-bottom':
                    (dropIndicator === 'line' && linePosition === 'end') ||
                    (dropIndicator === 'line' && dropPosition === 'auto' && position === 'after'),
                'eui-droppable-line-top':
                    dropIndicator === 'line' && dropPosition === 'auto' && position === 'before',
                'eui-droppable-horizontal': dropIndicator === 'line' && orientation === 'horizontal',
            }),
        [className, canDrop, isOver, isOverCurrent, dropIndicator, linePosition, orientation, dropPosition, position],
    );

    if (typeof children === 'function') {
        return <>{(children as (p: DroppableRenderProps<T>) => ReactNode)({ dropRef: dropRef as DndRefCallback<T>, canDrop, isOver, isOverCurrent, position })}</>;
    }

    return (
        <div
            {...domProps}
            ref={dropRef as DndRefCallback<HTMLDivElement>}
            className={classNames(elClassName, domProps?.className)}
            style={{ ...domProps?.style, ...style }}
            data-testid={testId}
        >
            {children}
        </div>
    );
}

export default Droppable;
