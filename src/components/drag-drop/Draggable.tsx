import classNames from 'classnames';
import React, { ReactNode, useEffect } from 'react';
import { useDrag, DragSourceMonitor, useDragDropManager } from 'react-dnd';

export interface DragItem {
    index: number;
    item: any;
    itemType: string;
    id?: string | number;
    containerId: string;
    args?: any;
}

export type DndRefCallback<T = HTMLElement> = ((node: T | null) => any) | null;

export interface DraggableRenderProps<T = HTMLElement> {
    isDragging: boolean;
    canDrag: boolean;
    dragRef: DndRefCallback<T>;
    handlerId: string | symbol | null;
}

export interface DropResult {
    index: number;
    id?: string | number;
    containerId: string;
    args?: any;
    item?: any;
}

export interface DraggableProps<T = HTMLElement> {
    /**
     * Unique identifier for the container this draggable belongs to
     */
    containerId: string;

    /**
     * Index of the item in the container
     */
    index: number;

    /**
     * Optional unique identifier for the item
     */
    id?: string | number;

    /**
     * The actual item data being dragged
     */
    item: any;

    /**
     * Type of the draggable item (used for drop validation)
     * @default 'any'
     */
    itemType?: string;

    /**
     * Additional arguments to pass along with drag data
     */
    args?: any;

    /**
     * Test ID for testing purposes
     */
    testId?: string;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Extra CSS classes applied only while the item is being dragged
     */
    draggingClassName?: string;

    /**
     * Hide the default browser drag preview (uses an empty image).
     * Useful when rendering a custom drag overlay.
     * @default false
     */
    hideDefaultPreview?: boolean;

    /**
     * Whether the item can be dragged
     * @default true
     */
    canDrag?: boolean;

    /**
     * Callback when item is removed from its original container (dropped elsewhere)
     */
    onRemove?: (source: { index: number; id?: string | number }, dropResult: DropResult | null) => void;

    /**
     * Callback when drag starts
     */
    onDragStart?: (item: DragItem, monitor: DragSourceMonitor) => void;

    /**
     * Callback when drag ends
     */
    onDragEnd?: (item: DragItem | undefined, monitor: DragSourceMonitor) => void;

    /**
     * Children can be ReactNode or render prop function
     */
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
        children,
        onRemove,
        onDragStart,
        onDragEnd,
        className,
        draggingClassName,
        hideDefaultPreview = false,
        canDrag: canDragProp = true,
    } = props;

    const [{ canDrag, isDragging, handlerId }, dragRef, dragPreviewRef] = useDrag<DragItem, DropResult, { canDrag: boolean; isDragging: boolean; handlerId: string | symbol | null }>(
        () => ({
            type: itemType,
            canDrag: canDragProp,
            item: (monitor) => {
                const dragItem: DragItem = { index, item, itemType, id, containerId, args };
                onDragStart?.(dragItem, monitor);
                return dragItem;
            },
            end: (draggedItem, monitor) => {
                onDragEnd?.(draggedItem, monitor);

                if (!onRemove || !monitor.didDrop()) {
                    return;
                }

                const dropResult = monitor.getDropResult<DropResult>();
                if (dropResult?.containerId !== containerId) {
                    onRemove({ index, id }, dropResult);
                }
            },
            collect: (monitor) => ({
                canDrag: monitor.canDrag(),
                isDragging: monitor.isDragging(),
                handlerId: monitor.getHandlerId(),
            }),
        }),
        [onRemove, onDragStart, onDragEnd, index, id, item, containerId, itemType, args, canDragProp]
    );

    const dragDropManager = useDragDropManager();

    useEffect(() => {
        if (!hideDefaultPreview || !dragPreviewRef) {
            return;
        }
        const backend = dragDropManager.getBackend() as unknown as { __isHtml5?: boolean };
        if (typeof window === 'undefined' || !('Image' in window)) {
            return;
        }
        const emptyImg = new Image();
        emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
        dragPreviewRef(emptyImg, { captureDraggingState: true });
        void backend;
    }, [hideDefaultPreview, dragPreviewRef, dragDropManager]);

    if (typeof children === 'function') {
        return <>{children({ isDragging, canDrag, dragRef, handlerId })}</>;
    }

    const elClassName = classNames('eui-draggable', className, {
        'eui-draggable-enabled': canDrag,
        'eui-draggable-dragging': isDragging,
        [draggingClassName || '']: isDragging && !!draggingClassName,
    });

    return (
        <div ref={dragRef as DndRefCallback<HTMLDivElement>} className={elClassName} data-testid={testId}>
            {children}
        </div>
    );
}

export default React.memo(Draggable);
