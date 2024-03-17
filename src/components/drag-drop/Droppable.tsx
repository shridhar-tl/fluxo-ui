import classNames from 'classnames';
import { ReactNode } from 'react';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import { DragItem, DropResult } from './Draggable';

export type DndRefCallback<T = HTMLElement> = ((node: T | null) => any) | null;

export interface DroppableRenderProps<T = HTMLElement> {
    dropRef: DndRefCallback<T>;
    canDrop: boolean;
    isOver: boolean;
    isOverCurrent: boolean;
}

export interface DroppableProps<T = HTMLElement> {
    /**
     * Unique identifier for the container
     */
    containerId: string;

    /**
     * Index position within the container
     */
    index: number;

    /**
     * Optional unique identifier
     */
    id?: string | number;

    /**
     * Additional arguments to pass to drop handler
     */
    args?: any;

    /**
     * Type(s) of draggable items this droppable accepts
     * @default 'any'
     */
    accept?: string | string[];

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Test ID for testing purposes
     */
    testId?: string;

    /**
     * Whether dropping is currently allowed
     * @default true
     */
    canDrop?: boolean | ((item: DragItem, monitor: DropTargetMonitor) => boolean);

    /**
     * Callback when an item is dropped
     */
    onDrop?: (source: DragItem, target: DropResult) => void;

    /**
     * Callback when a draggable item hovers over this droppable
     */
    onHover?: (item: DragItem, monitor: DropTargetMonitor) => void;

    /**
     * Children can be ReactNode or render prop function
     */
    children: ReactNode | ((props: DroppableRenderProps<T>) => ReactNode);
}

function Droppable<T extends HTMLElement = HTMLElement>(props: DroppableProps<T>) {
    const {
        containerId,
        index,
        args,
        id,
        children,
        accept = 'any',
        className,
        testId,
        onDrop,
        onHover,
        canDrop: canDropProp = true,
    } = props;

    const [{ canDrop, isOver, isOverCurrent }, dropRef] = useDrop<DragItem, DropResult, { canDrop: boolean; isOver: boolean; isOverCurrent: boolean }>(
        () => ({
            accept,
            canDrop: (item, monitor) => {
                if (typeof canDropProp === 'function') {
                    return canDropProp(item, monitor);
                }
                return canDropProp;
            },
            drop: (source, monitor) => {
                // Don't handle drop if it was already handled by a nested droppable
                if (monitor.didDrop()) {
                    return undefined;
                }

                const target: DropResult = { index, args, id, containerId };
                onDrop?.(source, target);

                return target;
            },
            hover: (item, monitor) => {
                onHover?.(item, monitor);
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                isOverCurrent: monitor.isOver({ shallow: true }),
                canDrop: monitor.canDrop(),
            }),
        }),
        [onDrop, onHover, index, args, id, containerId, accept, canDropProp]
    );

    if (typeof children === 'function') {
        return <>{children({ dropRef, canDrop, isOver, isOverCurrent })}</>;
    }

    const elClassName = classNames('eui-droppable', className, {
        'eui-droppable-allowed': canDrop,
        'eui-droppable-denied': !canDrop,
        'eui-droppable-hover': isOver,
        'eui-droppable-hover-current': isOverCurrent,
    });

    return (
        <div ref={dropRef as DndRefCallback<HTMLDivElement>} className={elClassName} data-testid={testId}>
            {children}
        </div>
    );
}

export default Droppable;
