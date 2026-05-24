import classNames from 'classnames';
import { CSSProperties, ElementType, KeyboardEvent as ReactKeyboardEvent, ReactNode, Ref, useCallback, useId, useMemo, useRef, useState } from 'react';
import Draggable, { DraggableRenderProps } from './Draggable';
import Droppable, { DropIndicator, DroppableRenderProps } from './Droppable';
import type { DragItem, DropOrientation, DropResult } from './core/types';
import '../eui-base.scss';
import './drag-drop.scss';

export type SortableOrientation = DropOrientation;

export interface SortableChangeEvent {
    source?: DragItem;
    target?: DropResult;
    removed?: { index: number; id?: string | number };
    reason: 'reorder' | 'insert' | 'remove' | 'keyboard';
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

    keyboardReorder?: boolean;
    itemAriaLabel?: (item: T, index: number) => string;

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
        keyboardReorder = true,
        itemAriaLabel,
    } = props;

    const renderItem = children || props.itemTemplate;
    if (!renderItem) throw new Error('Sortable: children render function is required');

    const accept = useMemo(() => {
        if (!acceptFromProps) return itemType;
        if (!Array.isArray(acceptFromProps)) return [acceptFromProps, itemType];
        return [...acceptFromProps, itemType];
    }, [acceptFromProps, itemType]);

    const containerId = useId();
    const containerRef = useRef<HTMLElement>(null);
    const [grabbedIndex, setGrabbedIndex] = useState<number | null>(null);
    const grabOriginRef = useRef<{ originalIndex: number; currentIndex: number } | null>(null);
    const [announcement, setAnnouncement] = useState('');

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

    const focusSlotByIndex = useCallback((index: number) => {
        const root = containerRef.current;
        if (!root) return;
        const slot = root.querySelector<HTMLElement>(`[data-eui-sortable-slot="${index}"]`);
        slot?.focus();
    }, []);

    const moveItemKeyboard = useCallback((from: number, to: number) => {
        const current = propsRef.current;
        const next = [...current.items];
        if (from < 0 || from >= next.length || to < 0 || to >= next.length) return;
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        current.onChange(next, current.args, { reason: 'keyboard' });
    }, []);

    const handleContainerKeyDown = useCallback(
        (e: ReactKeyboardEvent<HTMLElement>) => {
            if (!keyboardReorder) return;
            const target = e.target as HTMLElement;
            const slot = target.closest('[data-eui-sortable-slot]') as HTMLElement | null;
            if (!slot || !containerRef.current?.contains(slot)) return;
            const idxAttr = slot.getAttribute('data-eui-sortable-slot');
            const idx = idxAttr !== null ? parseInt(idxAttr, 10) : -1;
            if (idx < 0) return;

            const total = propsRef.current.items.length;
            const isVertical = (propsRef.current.orientation ?? 'vertical') === 'vertical';
            const decreaseKeys = isVertical ? ['ArrowUp'] : ['ArrowLeft'];
            const increaseKeys = isVertical ? ['ArrowDown'] : ['ArrowRight'];

            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (grabbedIndex === null) {
                    setGrabbedIndex(idx);
                    grabOriginRef.current = { originalIndex: idx, currentIndex: idx };
                    setAnnouncement(`Item ${idx + 1} of ${total} grabbed. Use arrow keys to move, Enter to drop, Escape to cancel.`);
                } else {
                    const finalIdx = grabOriginRef.current?.currentIndex ?? idx;
                    setGrabbedIndex(null);
                    grabOriginRef.current = null;
                    setAnnouncement(`Dropped at position ${finalIdx + 1} of ${total}.`);
                    requestAnimationFrame(() => focusSlotByIndex(finalIdx));
                }
                return;
            }

            if (e.key === 'Escape' && grabbedIndex !== null) {
                e.preventDefault();
                const origin = grabOriginRef.current;
                if (origin && origin.currentIndex !== origin.originalIndex) {
                    moveItemKeyboard(origin.currentIndex, origin.originalIndex);
                }
                const restoreIndex = origin?.originalIndex ?? idx;
                setGrabbedIndex(null);
                grabOriginRef.current = null;
                setAnnouncement('Move cancelled. Item returned to original position.');
                requestAnimationFrame(() => focusSlotByIndex(restoreIndex));
                return;
            }

            if (grabbedIndex !== null && (decreaseKeys.includes(e.key) || increaseKeys.includes(e.key))) {
                e.preventDefault();
                const dir = decreaseKeys.includes(e.key) ? -1 : 1;
                const origin = grabOriginRef.current;
                if (!origin) return;
                const nextIdx = Math.min(Math.max(origin.currentIndex + dir, 0), total - 1);
                if (nextIdx === origin.currentIndex) return;
                moveItemKeyboard(origin.currentIndex, nextIdx);
                grabOriginRef.current = { ...origin, currentIndex: nextIdx };
                setAnnouncement(`Moved to position ${nextIdx + 1} of ${total}.`);
                requestAnimationFrame(() => focusSlotByIndex(nextIdx));
                return;
            }

            if (grabbedIndex === null && (e.key === 'Home' || e.key === 'End')) {
                e.preventDefault();
                const targetIdx = e.key === 'Home' ? 0 : total - 1;
                focusSlotByIndex(targetIdx);
            }
        },
        [keyboardReorder, grabbedIndex, focusSlotByIndex, moveItemKeyboard],
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
        <Component
            ref={containerRef as Ref<HTMLElement>}
            className={containerClass}
            style={containerStyle}
            role={keyboardReorder ? 'listbox' : undefined}
            aria-label={keyboardReorder ? 'Sortable list. Use arrow keys to navigate, Space or Enter to grab, then arrow keys to move.' : undefined}
            aria-orientation={keyboardReorder ? orientation : undefined}
            onKeyDown={keyboardReorder ? handleContainerKeyDown : undefined}
        >
            {items.map((item, i) => {
                const isGrabbed = grabbedIndex === i;
                const ariaLabel = itemAriaLabel ? itemAriaLabel(item, i) : `Item ${i + 1} of ${items.length}`;
                const itemKey = (getItemId(item, i) as string | number | undefined) ?? i;

                const slotDomProps = keyboardReorder
                    ? {
                          tabIndex: 0,
                          role: 'option',
                          'aria-selected': isGrabbed,
                          'aria-roledescription': 'draggable',
                          'aria-label': `${ariaLabel}${isGrabbed ? ' (grabbed)' : ''}`,
                          'aria-grabbed': isGrabbed,
                          'data-eui-sortable-slot': i,
                      }
                    : undefined;

                return (
                    <Droppable
                        key={itemKey}
                        containerId={containerId}
                        index={i}
                        accept={accept}
                        onDrop={handleItemDropped}
                        args={args}
                        orientation={orientation}
                        dropIndicator={dropIndicator}
                        dropPosition="auto"
                        edgeThreshold={10}
                        className={classNames('eui-sortable-item', {
                            'eui-sortable-slot': keyboardReorder,
                            'eui-sortable-item-grabbed': isGrabbed,
                        })}
                        canDrop={itemCanDrop ? (src) => itemCanDrop(src, i) : undefined}
                        domProps={slotDomProps}
                    >
                        {provideDropRef
                            ? (droppable) => renderDraggable(item, i, droppable)
                            : renderDraggable(item, i)}
                    </Droppable>
                );
            })}
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
            {keyboardReorder && (
                <div
                    className="eui-sortable-sr-only"
                    aria-live="polite"
                    aria-atomic="true"
                    role="status"
                >
                    {announcement}
                </div>
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
