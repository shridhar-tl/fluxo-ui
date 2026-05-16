import cn from 'classnames';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react';
import './VirtualList.scss';

type VirtualListVariant = 'plain' | 'divided' | 'card';

interface VirtualListProps<T> {
    items: T[];
    itemHeight?: number | ((index: number, item: T) => number);
    renderItem: (item: T, index: number) => React.ReactNode;
    keyExtractor?: (item: T, index: number) => React.Key;
    overscan?: number;
    height?: string | number;
    estimatedItemHeight?: number;
    variant?: VirtualListVariant;
    emptyState?: React.ReactNode;
    onEndReached?: () => void;
    endReachedThreshold?: number;
    className?: string;
    ariaLabel?: string;
}

interface VirtualListHandle {
    scrollToIndex: (index: number, options?: { behavior?: ScrollBehavior; align?: 'start' | 'center' | 'end' }) => void;
    scrollToOffset: (offset: number, behavior?: ScrollBehavior) => void;
    getScrollOffset: () => number;
}

const DEFAULT_ESTIMATED = 56;
const DEFAULT_OVERSCAN = 4;

function VirtualListInner<T>(
    {
        items,
        itemHeight,
        renderItem,
        keyExtractor,
        overscan = DEFAULT_OVERSCAN,
        height = '100%',
        estimatedItemHeight = DEFAULT_ESTIMATED,
        variant = 'plain',
        emptyState,
        onEndReached,
        endReachedThreshold = 200,
        className,
        ariaLabel,
    }: VirtualListProps<T>,
    ref: React.Ref<VirtualListHandle>,
) {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const measuredHeightsRef = useRef<Map<number, number>>(new Map());
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState<number>(0);
    const onEndReachedRef = useRef(onEndReached);
    onEndReachedRef.current = onEndReached;
    const lastEndFiredAtRef = useRef<number>(-1);

    const isFixed = typeof itemHeight === 'number';

    const getEstimatedHeight = useCallback(
        (idx: number, item: T) => {
            if (typeof itemHeight === 'number') return itemHeight;
            if (typeof itemHeight === 'function') return itemHeight(idx, item);
            return estimatedItemHeight;
        },
        [itemHeight, estimatedItemHeight],
    );

    const positions = useMemo(() => {
        const offsets: number[] = new Array(items.length);
        const heights: number[] = new Array(items.length);
        let acc = 0;
        for (let i = 0; i < items.length; i += 1) {
            const measured = measuredHeightsRef.current.get(i);
            const h = measured ?? getEstimatedHeight(i, items[i]);
            offsets[i] = acc;
            heights[i] = h;
            acc += h;
        }
        return { offsets, heights, total: acc };
    }, [items, getEstimatedHeight]);

    const findStartIndex = useCallback(
        (top: number) => {
            const { offsets } = positions;
            let lo = 0;
            let hi = offsets.length - 1;
            let result = 0;
            while (lo <= hi) {
                const mid = (lo + hi) >> 1;
                if (offsets[mid] <= top) {
                    result = mid;
                    lo = mid + 1;
                } else {
                    hi = mid - 1;
                }
            }
            return result;
        },
        [positions],
    );

    const { startIndex, endIndex, padTop } = useMemo(() => {
        if (items.length === 0) return { startIndex: 0, endIndex: -1, padTop: 0 };
        const start = Math.max(findStartIndex(scrollTop) - overscan, 0);
        const viewportBottom = scrollTop + containerHeight;
        let end = start;
        const { offsets, heights } = positions;
        while (end < items.length && offsets[end] + heights[end] < viewportBottom) {
            end += 1;
        }
        end = Math.min(end + overscan, items.length - 1);
        return {
            startIndex: start,
            endIndex: end,
            padTop: positions.offsets[start] ?? 0,
        };
    }, [items.length, findStartIndex, scrollTop, containerHeight, overscan, positions]);

    const handleScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            const top = e.currentTarget.scrollTop;
            setScrollTop(top);
            if (!onEndReachedRef.current) return;
            const distanceFromBottom = positions.total - top - containerHeight;
            if (distanceFromBottom <= endReachedThreshold) {
                if (lastEndFiredAtRef.current !== items.length) {
                    lastEndFiredAtRef.current = items.length;
                    onEndReachedRef.current();
                }
            } else {
                lastEndFiredAtRef.current = -1;
            }
        },
        [positions.total, containerHeight, endReachedThreshold, items.length],
    );

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            setContainerHeight(el.clientHeight);
        });
        ro.observe(el);
        setContainerHeight(el.clientHeight);
        return () => ro.disconnect();
    }, []);

    useImperativeHandle(
        ref,
        () => ({
            scrollToIndex: (index, options) => {
                const el = scrollerRef.current;
                if (!el) return;
                const align = options?.align ?? 'start';
                const offset = positions.offsets[index] ?? 0;
                const itemH = positions.heights[index] ?? estimatedItemHeight;
                let top = offset;
                if (align === 'center') {
                    top = offset - (containerHeight - itemH) / 2;
                } else if (align === 'end') {
                    top = offset - (containerHeight - itemH);
                }
                el.scrollTo({ top: Math.max(top, 0), behavior: options?.behavior ?? 'auto' });
            },
            scrollToOffset: (offset, behavior) => {
                scrollerRef.current?.scrollTo({ top: offset, behavior: behavior ?? 'auto' });
            },
            getScrollOffset: () => scrollerRef.current?.scrollTop ?? 0,
        }),
        [positions, containerHeight, estimatedItemHeight],
    );

    const heightStyle: React.CSSProperties = {
        height: typeof height === 'number' ? `${height}px` : height,
    };

    if (items.length === 0 && emptyState !== undefined) {
        return (
            <div
                ref={scrollerRef}
                className={cn('eui-virtual-list', `eui-virtual-list-variant-${variant}`, className, 'eui-virtual-list-empty')}
                style={heightStyle}
                role="list"
                aria-label={ariaLabel}
            >
                {emptyState}
            </div>
        );
    }

    const visible: React.ReactNode[] = [];
    for (let i = startIndex; i <= endIndex; i += 1) {
        const item = items[i];
        if (item === undefined) continue;
        const itemH = positions.heights[i];
        const key = keyExtractor ? keyExtractor(item, i) : i;
        visible.push(
            <div
                key={key}
                className="eui-virtual-list-item"
                style={{
                    height: isFixed ? `${itemH}px` : undefined,
                    minHeight: !isFixed ? `${itemH}px` : undefined,
                }}
                role="listitem"
                data-index={i}
            >
                {renderItem(item, i)}
            </div>,
        );
    }

    return (
        <div
            ref={scrollerRef}
            className={cn('eui-virtual-list', `eui-virtual-list-variant-${variant}`, className)}
            style={heightStyle}
            onScroll={handleScroll}
            role="list"
            aria-label={ariaLabel}
        >
            <div className="eui-virtual-list-inner" style={{ height: `${positions.total}px` }}>
                <div className="eui-virtual-list-window" style={{ transform: `translateY(${padTop}px)` }}>
                    {visible}
                </div>
            </div>
        </div>
    );
}

const VirtualList = forwardRef(VirtualListInner) as <T>(
    props: VirtualListProps<T> & { ref?: React.Ref<VirtualListHandle> },
) => ReturnType<typeof VirtualListInner>;

export { VirtualList };
export type { VirtualListProps, VirtualListHandle, VirtualListVariant };
