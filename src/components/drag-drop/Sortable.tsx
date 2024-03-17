import classNames from 'classnames';
import { ElementType, ReactNode, useCallback, useId, useMemo, useRef } from 'react';
import Draggable, { DraggableRenderProps, DragItem, DropResult } from './Draggable';
import Droppable, { DroppableRenderProps } from './Droppable';

export interface SortableChangeEvent {
    source?: DragItem;
    target?: DropResult;
    removed?: { index: number; id?: string | number };
}

export interface SortableProps<T = any> {
    /**
     * Array of items to render
     */
    items: T[];

    /**
     * Type(s) of external draggable items this sortable accepts
     */
    accept?: string | string[];

    /**
     * Default item type for items within this sortable
     * @default 'any'
     */
    itemType?: string;

    /**
     * Property name on items to get their type (for mixed item types)
     */
    itemTypeProp?: string;

    /**
     * Additional arguments passed to callbacks
     */
    args?: any;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Whether items can be removed by dragging to another container
     * @default true
     */
    allowRemove?: boolean;

    /**
     * Whether to show a placeholder drop zone at the end
     * @default false
     */
    showPlaceholder?: boolean;

    /**
     * Custom placeholder content
     */
    placeholder?: ReactNode;

    /**
     * HTML tag name for the container element
     * @default 'div'
     */
    as?: ElementType;

    /**
     * Pass drop ref to children render function
     * @default false
     */
    provideDropRef?: boolean;

    /**
     * Pass drag ref to children render function
     * @default false
     */
    provideDragRef?: boolean;

    /**
     * Callback when items are reordered or changed
     */
    onChange: (items: T[], args?: any, event?: SortableChangeEvent) => void;

    /**
     * Callback when an external item is dropped
     */
    onDrop?: (source: DragItem, target: DropResult, args?: any) => void;

    /**
     * Callback when an item is removed (dragged out)
     */
    onRemove?: (removed: { index: number; id?: string | number }, dropResult: DropResult | null) => void;

    /**
     * Render function for each item
     */
    children: (
        item: T,
        index: number,
        refs: {
            draggable?: DraggableRenderProps;
            droppable?: DroppableRenderProps;
        },
    ) => ReactNode;

    /**
     * @deprecated Use `children` instead
     */
    itemTemplate?: (
        item: T,
        index: number,
        refs: {
            draggable?: DraggableRenderProps;
            droppable?: DroppableRenderProps;
        },
    ) => ReactNode;
}

function Sortable<T = any>(props: SortableProps<T>) {
    const propsRef = useRef(props);
    propsRef.current = props;

    const {
        items,
        accept: acceptFromProps,
        itemType = 'any',
        itemTypeProp,
        className,
        provideDropRef,
        provideDragRef,
        showPlaceholder,
        placeholder,
        as: Component = 'div',
        allowRemove = true,
        children,
        args,
    } = props;

    // Use children or fall back to deprecated itemTemplate
    const renderItem = children || props.itemTemplate;

    // Combine accepted types with default item type
    const accept = useMemo(() => {
        if (!acceptFromProps) {
            return itemType;
        }

        if (!Array.isArray(acceptFromProps)) {
            return [acceptFromProps, itemType];
        }

        return [...acceptFromProps, itemType];
    }, [acceptFromProps, itemType]);

    const containerId = useId();

    const handleItemRemoved = useCallback((removed: { index: number; id?: string | number }, dropResult: DropResult | null) => {
        const { onRemove, items, onChange, args } = propsRef.current;

        if (onRemove) {
            onRemove(removed, dropResult);
            return;
        }

        const newItems = [...items];
        newItems.splice(removed.index, 1);

        onChange(newItems, args, { removed });
    }, []);

    const handleItemDropped = useCallback(
        (source: DragItem, target: DropResult) => {
            const { items, onChange, onDrop, args, itemType } = propsRef.current;

            // Ensure target has item reference
            if (!target.item) {
                target.item = items[target.index];
            }

            // If item is from external container and has different type or custom drop handler, delegate to onDrop
            if (source.containerId !== containerId && (onDrop || source.itemType !== itemType)) {
                onDrop?.(source, target, args);
                return;
            }

            const newItems = [...items];

            // Remove from original position if reordering within same container
            if (source.containerId === target.containerId) {
                newItems.splice(source.index, 1);
            }

            // Insert at new position
            newItems.splice(target.index, 0, source.item);

            onChange(newItems, args, { source, target });
        },
        [containerId],
    );

    const renderDraggable = useCallback(
        (item: T, index: number, droppable?: DroppableRenderProps) => {
            const dragItemType = (itemTypeProp && (item as any)[itemTypeProp]) || itemType;

            return (
                <Draggable
                    containerId={containerId}
                    index={index}
                    item={item}
                    args={args}
                    itemType={dragItemType}
                    onRemove={allowRemove ? handleItemRemoved : undefined}
                >
                    {provideDragRef
                        ? (draggable) => renderItem(item, index, { draggable, droppable })
                        : renderItem(item, index, { droppable })}
                </Draggable>
            );
        },
        [containerId, itemTypeProp, itemType, args, allowRemove, handleItemRemoved, provideDragRef, renderItem],
    );

    return (
        <Component className={classNames('eui-sortable', className)}>
            {items.map((item, i) => (
                <Droppable key={i} containerId={containerId} index={i} accept={accept} onDrop={handleItemDropped} args={args}>
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
                >
                    {placeholder}
                </Droppable>
            )}
        </Component>
    );
}

export default Sortable;
