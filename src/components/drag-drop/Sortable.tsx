import classNames from 'classnames';
import { CSSProperties, ElementType, ReactNode, useCallback, useId, useMemo, useRef } from 'react';
import Draggable, { DraggableRenderProps } from './Draggable';
import Droppable, { DropIndicator, DroppableRenderProps } from './Droppable';
import type { DragItem, DropOrientation, DropResult } from './core/types';

export type SortableOrientation = DropOrientation;

export interface SortableChangeEvent {
    source?: DragItem;
    target?: DropResult;
    removed?: { index: number; id?: string | number };
    reason: 'reorder' | 'insert' | 'remove';
}

export interface SortableProps<T = unknown> {
    items: T[];
    accept?: string | string[];
    itemType?: string;
    itemTypeProp?: string;
    idProp?: string;
    args?: unknown;
    className?: string;
    orientation?: SortableOrientation;
    dropIndicator?: DropIndicator;
    gap?: string;
    style?: CSSProperties;
    as?: ElementType;

    allowRemove?: boolean;
    showPlaceholder?: boolean;
    placeholder?: ReactNode;
    emptyHint?: ReactNode;

    dragHandleProp?: string;
    canDragItem?: (item: T, index: number) => boolean;
    canDropItem?: (source: DragItem, index: number) => boolean;

    provideDragRef?: boolean;
    provideDropRef?: boolean;

    onChange: (items: T[], args?: unknown, event?: SortableChangeEvent) => void;
    onDrop?: (source: DragItem, target: DropResult, args?: unknown) => void;
    onRemove?: (removed: { index: number; id?: string | number }, result: DropResult | null) => void;

    children: (item: T, index: number, refs: { draggable?: DraggableRenderProps; droppable?: DroppableRenderProps }) => ReactNode;

    /** @deprecated use children */
    itemTemplate?: (item: T, index: number, refs: { draggable?: DraggableRenderProps; droppable?: DroppableRenderProps }) => ReactNode;
}

function Sortable<T = unknown>(props: SortableProps<T>) {
    const propsRef = useRef(props);
    propsRef.current = props;

    const {
        items,
        accept: acceptFromProps,
        itemType = 'any',
        itemTypeProp,
        idProp,
        className,
        provideDropRef,
        provideDragRef,
        showPlaceholder,
        placeholder,
        emptyHint,
        as: Component = 'div',
        allowRemove = false,
        orientation = 'vertical',
        dropIndicator = 'line',
        gap = '0.5rem',
        style,
        children,
        args,
        canDragItem,
        canDropItem,
    } = props;

    const renderItem = children || props.itemTemplate;
    if (!renderItem) throw new Error('Sortable: children render function is required');

    const accept = useMemo(() => {
        if (!acceptFromProps) return itemType;
        if (!Array.isArray(acceptFromProps)) return [acceptFromProps, itemType];
        return [...acceptFromProps, itemType];
    }, [acceptFromProps, itemType]);

    const containerId = useId();

    const getItemId = useCallback(
        (item: T, index: number): string | number | undefined => {
            if (idProp) {
                const val = (item as Record<string, unknown>)[idProp];
                if (typeof val === 'string' || typeof val === 'number') return val;
            }
            return index;
        },
        [idProp],
    );

    const handleItemRemoved = useCallback((removed: { index: number; id?: string | number }, dropResult: DropResult | null) => {
        const current = propsRef.current;
        if (current.onRemove) {
            current.onRemove(removed, dropResult);
            return;
        }
        const next = [...current.items];
        const idx = typeof removed.id !== 'undefined' ? next.findIndex((it, i) => getItemIdSafe(it, i, current.idProp) === removed.id) : removed.index;
        if (idx < 0) return;
        next.splice(idx, 1);
        current.onChange(next, current.args, { removed, reason: 'remove' });
    }, []);

    const handleItemDropped = useCallback(
        (source: DragItem, target: DropResult) => {
            const current = propsRef.current;
            const { items: currentItems, onChange, onDrop, args: currentArgs, itemType: currentItemType } = current;

            if (!target.item) {
                target.item = currentItems[target.index] as unknown;
            }

            if (source.containerId !== containerId && (onDrop || source.itemType !== currentItemType)) {
                onDrop?.(source, target, currentArgs);
                return;
            }

            const nextItems = [...currentItems];
            let insertIndex = target.index;
            if (source.containerId === target.containerId) {
                if (source.index < insertIndex) insertIndex -= 1;
                nextItems.splice(source.index, 1);
            }
            nextItems.splice(insertIndex, 0, source.item as T);

            onChange(nextItems, currentArgs, {
                source,
                target,
                reason: source.containerId === target.containerId ? 'reorder' : 'insert',
            });
        },
        [containerId],
    );

    const containerStyle = useMemo<CSSProperties>(
        () => ({ '--eui-sortable-gap': gap, ...style } as CSSProperties),
        [gap, style],
    );

    const containerClass = classNames('eui-sortable', className, {
        'eui-sortable-horizontal': orientation === 'horizontal',
    });

    const renderDraggable = (item: T, index: number, droppable?: DroppableRenderProps) => {
        const dragItemType = (itemTypeProp && (item as Record<string, unknown>)[itemTypeProp]) || itemType;
        const itemId = getItemId(item, index);
        const allowedToDrag = canDragItem ? canDragItem(item, index) : true;
        return (
            <Draggable
                containerId={containerId}
                index={index}
                id={itemId}
                item={item}
                args={args}
                itemType={typeof dragItemType === 'string' ? dragItemType : itemType}
                canDrag={allowedToDrag}
                onRemove={allowRemove ? handleItemRemoved : undefined}
            >
                {provideDragRef
                    ? (draggable) => renderItem(item, index, { draggable, droppable })
                    : renderItem(item, index, { droppable })}
            </Draggable>
        );
    };

    const itemCanDrop = canDropItem ? (src: DragItem, index: number) => canDropItem(src, index) : undefined;

    return (
        <Component className={containerClass} style={containerStyle}>
            {items.map((item, i) => (
                <Droppable
                    key={(getItemId(item, i) as string | number | undefined) ?? i}
                    containerId={containerId}
                    index={i}
                    accept={accept}
                    onDrop={handleItemDropped}
                    args={args}
                    orientation={orientation}
                    dropIndicator={dropIndicator}
                    dropPosition="auto"
                    edgeThreshold={10}
                    className="eui-sortable-item"
                    canDrop={itemCanDrop ? (src) => itemCanDrop(src, i) : undefined}
                >
                    {provideDropRef ? (droppable) => renderDraggable(item, i, droppable) : renderDraggable(item, i)}
                </Droppable>
            ))}
            {(showPlaceholder || placeholder) && (
                <Droppable
                    containerId={containerId}
                    className="eui-drop-placeholder"
                    args={args}
                    index={items?.length || 0}
                    accept={accept}
                    onDrop={handleItemDropped}
                    dropIndicator="highlight"
                >
                    {placeholder}
                </Droppable>
            )}
            {items.length === 0 && !showPlaceholder && !placeholder && (
                <Droppable
                    containerId={containerId}
                    className="eui-sortable-empty-slot"
                    args={args}
                    index={0}
                    accept={accept}
                    onDrop={handleItemDropped}
                    dropIndicator="highlight"
                >
                    <div className="eui-sortable-empty-hint">{emptyHint ?? 'Drop here'}</div>
                </Droppable>
            )}
        </Component>
    );
}

function getItemIdSafe<T>(item: T, index: number, idProp?: string): string | number | undefined {
    if (idProp) {
        const val = (item as Record<string, unknown>)[idProp];
        if (typeof val === 'string' || typeof val === 'number') return val;
    }
    return index;
}

export default Sortable;
