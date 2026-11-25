import React, { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from 'react';

import cn from 'classnames';

import { SkeletonLine } from '../shimmer';
import '../eui-base.scss';
import './TreeTable.scss';
import {
    buildTreeSource,
    computeFilter,
    createAggregator,
    type FlatItem,
    type FlatRow,
    flattenTree,
    guideSignature,
    type TreeAccess,
    walkTree,
} from './tree-table-data';
import type { DropTarget, EditingCell, RowCheckState, RowConfig, RowHandlers } from './tree-table-internal';
import type {
    TreeTableColumn,
    TreeTableCsvOptions,
    TreeTableDropPosition,
    TreeTableHandle,
    TreeTableKey,
    TreeTableProps,
    TreeTableRowData,
    TreeTableRowMoveEvent,
    TreeTableSort,
} from './tree-table-types';
import {
    buildCsv,
    createComparator,
    createKeyGetter,
    createParentGetter,
    defaultLabels,
    getCellText,
    getCellValue,
    nextSortState,
    toCssSize,
} from './tree-table-utils';
import { TreeTableFooter } from './TreeTableFooter';
import { TreeTableHeader } from './TreeTableHeader';
import { TreeTableRow } from './TreeTableRow';
import { TreeTableStatusRow } from './TreeTableStatusRow';
import { useTreeTableColumns } from './useTreeTableColumns';
import { type KeyboardMoveDirection, useTreeTableKeyboard } from './useTreeTableKeyboard';
import { useTreeTableSelection } from './useTreeTableSelection';
import { useCoarsePointer, useControllableState, useElementSize, useLatest, useLazyChildren } from './useTreeTableState';
import { type ScrollAlign, useRowOffsets, useTreeTableVirtual } from './useTreeTableVirtual';

const sizeHeights = { sm: 32, md: 40, lg: 48 } as const;
const touchMinHeight = 44;
const emptyFilters: Record<string, string> = {};
const alwaysTrue = () => true;
const alwaysFalse = () => false;

const createSorter = <T extends TreeTableRowData>(comparator: ((a: T, b: T) => number) | null) => {
    if (!comparator) return (rows: T[]) => rows;
    const cache = new WeakMap<T[], T[]>();
    return (rows: T[]) => {
        if (rows.length < 2) return rows;
        const cached = cache.get(rows);
        if (cached) return cached;
        const sorted = rows.slice().sort(comparator);
        cache.set(rows, sorted);
        return sorted;
    };
};

const createKeyIndex = <T extends TreeTableRowData>(items: FlatItem<T>[]) => {
    let map: Map<TreeTableKey, number> | null = null;
    return (key: TreeTableKey): number => {
        if (!map) {
            map = new Map();
            for (let i = 0; i < items.length; i += 1) map.set(items[i].key, i);
        }
        return map.get(key) ?? -1;
    };
};

const itemKey = <T extends TreeTableRowData>(item: FlatItem<T>): TreeTableKey => item.key;

const isWithin = <T extends TreeTableRowData>(items: FlatItem<T>[], ancestorIndex: number, index: number): boolean => {
    let parent = items[index]?.parentIndex ?? -1;
    while (parent >= 0) {
        if (parent === ancestorIndex) return true;
        parent = items[parent].parentIndex;
    }
    return false;
};

const findSibling = <T extends TreeTableRowData>(items: FlatItem<T>[], index: number, direction: 1 | -1): number => {
    const origin = items[index];
    for (let i = index + direction; i >= 0 && i < items.length; i += direction) {
        const candidate = items[i];
        if (candidate.level < origin.level) return -1;
        if (candidate.level === origin.level && candidate.parentIndex === origin.parentIndex) return candidate.kind === 'row' ? i : -1;
    }
    return -1;
};

function TreeTableInner<T extends TreeTableRowData>(props: TreeTableProps<T>, ref: React.Ref<TreeTableHandle<T>>) {
    const {
        data,
        columns,
        rowKey = 'id',
        childrenField = 'children',
        parentKey,
        loadChildren,
        expandedKeys,
        defaultExpandedKeys,
        defaultExpandAll = false,
        defaultExpandLevel,
        expandOnRowClick = false,
        expanderColumn,
        selectionMode = 'none',
        selectedKeys,
        defaultSelectedKeys,
        onSelectionChange,
        propagateSelection = true,
        showSelectAll = true,
        sort: sortProp,
        defaultSort,
        multiSort = true,
        manualSort = false,
        filterText = '',
        filters: filtersProp,
        defaultFilters,
        showFilterRow = false,
        filterMode = 'lenient',
        filterDebounce = 250,
        manualFilter = false,
        highlightMatches = true,
        size = 'md',
        rowHeight,
        height = 480,
        overscan = 6,
        indent = 20,
        showGuides = false,
        gridLines = 'horizontal',
        striped = false,
        hoverable = true,
        resizableColumns = false,
        reorderableColumns = false,
        columnOrder,
        rowReorder = false,
        rowIcon,
        expandIcon,
        collapseIcon,
        rowClassName,
        hasMore = false,
        loadingMore = false,
        endReachedThreshold = 10,
        loading = false,
        skeletonRows = 8,
        emptyMessage,
        showFooter,
        caption,
        ariaLabel,
        ariaLabelledBy,
        ariaDescribedBy,
        labels: labelOverrides,
        id,
        className,
        style,
    } = props;

    const { getChildren: getChildrenFn, hasChildren: hasChildrenFn, isRowSelectable: isRowSelectableFn, isRowDisabled: isRowDisabledFn, rowLabel: rowLabelFn } = props;
    const rowHeightFn = typeof rowHeight === 'function' ? rowHeight : undefined;
    const latestRef = useLatest(props);

    const labels = useMemo(() => ({ ...defaultLabels, ...labelOverrides }), [labelOverrides]);
    const generatedId = useId();
    const captionId = `${generatedId}-caption`;
    const instructionsId = `${generatedId}-help`;

    const getKey = useMemo(() => createKeyGetter<T>(rowKey), [rowKey]);
    const getParent = useMemo(() => (parentKey ? createParentGetter<T>(parentKey) : null), [parentKey]);
    const lazyEnabled = Boolean(loadChildren);

    const source = useMemo(
        () => buildTreeSource(data ?? [], getKey, childrenField, getChildrenFn, getParent, lazyEnabled),
        [data, getKey, childrenField, getChildrenFn, getParent, lazyEnabled],
    );

    const isDisabled = useMemo(() => isRowDisabledFn ?? alwaysFalse, [isRowDisabledFn]);
    const isSelectable = useMemo(() => {
        const selectable = isRowSelectableFn ?? alwaysTrue;
        return (row: T) => !isDisabled(row) && selectable(row);
    }, [isRowSelectableFn, isDisabled]);

    const [announcement, setAnnouncement] = useState({ message: '', nonce: 0 });
    const announce = useCallback((message: string) => {
        setAnnouncement((previous) => ({ message, nonce: previous.nonce + 1 }));
    }, []);

    const addKeysRef = useRef<(parentKey: TreeTableKey, rows: T[]) => void>(() => undefined);
    const handleChildrenLoaded = useCallback(
        (parent: TreeTableKey, rows: T[]) => {
            addKeysRef.current(parent, rows);
            announce(`${rows.length} ${labels.childrenLoaded}`);
        },
        [announce, labels.childrenLoaded],
    );
    const { store: lazyStore, version: lazyVersion, load: loadLazy, reset: resetLazy } = useLazyChildren<T>(loadChildren, handleChildrenLoaded);

    const access = useMemo<TreeAccess<T>>(() => {
        void lazyVersion;
        return {
            getKey,
            getChildren: (row, key) => {
                const state = lazyStore.get(key);
                return state ? state.rows : source.staticChildren(row, key);
            },
        };
    }, [getKey, source, lazyStore, lazyVersion]);

    const columnsByKey = useMemo(() => new Map(columns.map((column) => [column.key, column])), [columns]);

    const [sort, setSort] = useControllableState<TreeTableSort[]>(sortProp, () => defaultSort ?? []);
    const comparator = useMemo(() => (manualSort ? null : createComparator(sort, columnsByKey)), [manualSort, sort, columnsByKey]);
    const sortRows = useMemo(() => createSorter<T>(comparator), [comparator]);

    const [filters, setFilters, filtersRef] = useControllableState<Record<string, string>>(filtersProp, () => defaultFilters ?? emptyFilters);
    const globalTerm = filterText.trim();
    const activeFilters = useMemo(
        () =>
            Object.entries(filters)
                .map(([key, value]) => ({ column: columnsByKey.get(key), value: (value ?? '').trim() }))
                .filter((entry): entry is { column: TreeTableColumn<T>; value: string } => Boolean(entry.column) && entry.value !== ''),
        [filters, columnsByKey],
    );

    const matcher = useMemo(() => {
        if (manualFilter || (!globalTerm && !activeFilters.length)) return null;
        const globalLower = globalTerm.toLowerCase();
        const globalColumns = columns.filter((column) => column.globalFilter !== false && !column.hidden);
        const columnTests = activeFilters.map(({ column, value }) => ({ column, value, lower: value.toLowerCase() }));
        return (row: T) => {
            for (let i = 0; i < columnTests.length; i += 1) {
                const { column, value, lower } = columnTests[i];
                const cellValue = getCellValue(row, column);
                if (column.filterFn) {
                    if (!column.filterFn(cellValue, row, value)) return false;
                } else if (!getCellText(row, column, cellValue).toLowerCase().includes(lower)) {
                    return false;
                }
            }
            if (!globalLower) return true;
            for (let i = 0; i < globalColumns.length; i += 1) {
                if (getCellText(row, globalColumns[i]).toLowerCase().includes(globalLower)) return true;
            }
            return false;
        };
    }, [manualFilter, globalTerm, activeFilters, columns]);

    const filterResult = useMemo(() => (matcher ? computeFilter(source.roots, access, matcher, filterMode) : null), [matcher, source.roots, access, filterMode]);
    const include = filterResult?.include ?? null;

    const highlightTerms = useMemo(() => {
        const map = new Map<string, string[]>();
        if (manualFilter) return map;
        columns.forEach((column) => {
            const terms: string[] = [];
            if (globalTerm && column.globalFilter !== false) terms.push(globalTerm);
            const own = (filters[column.key] ?? '').trim();
            if (own && !column.filterFn) terms.push(own);
            if (terms.length) map.set(column.key, terms);
        });
        return map;
    }, [manualFilter, columns, globalTerm, filters]);

    const [expanded, setExpandedState] = useControllableState<ReadonlySet<TreeTableKey>>(expandedKeys, () => {
        const initial = new Set<TreeTableKey>(defaultExpandedKeys ?? []);
        if (defaultExpandAll || defaultExpandLevel !== undefined) {
            const maxLevel = defaultExpandAll ? Infinity : defaultExpandLevel ?? 0;
            const staticAccess: TreeAccess<T> = { getKey, getChildren: source.staticChildren };
            walkTree(source.roots, staticAccess, (row, key, level) => {
                if (level >= maxLevel) return false;
                const children = source.staticChildren(row, key);
                if (children && children.length) initial.add(key);
                return undefined;
            });
        }
        return initial;
    });

    const [filterCollapsed, setFilterCollapsed] = useState<{ owner: unknown; keys: Set<TreeTableKey> }>({ owner: null, keys: new Set() });
    const collapsedWhileFiltering = filterCollapsed.owner === filterResult ? filterCollapsed.keys : null;

    const isExpanded = useCallback(
        (key: TreeTableKey) => {
            if (filterResult && filterResult.expand.has(key) && !collapsedWhileFiltering?.has(key)) return true;
            return expanded.has(key);
        },
        [filterResult, collapsedWhileFiltering, expanded],
    );

    const flat = useMemo(
        () =>
            flattenTree({
                roots: source.roots,
                access,
                lazy: lazyStore,
                canLoad: lazyEnabled,
                hasChildrenFn,
                isExpanded,
                include,
                sortRows,
                rootLoading: loadingMore,
            }),
        [source.roots, access, lazyStore, lazyEnabled, hasChildrenFn, isExpanded, include, sortRows, loadingMore],
    );
    const items = flat.items;
    const itemsRef = useLatest(items);

    useEffect(() => {
        flat.pending.forEach((entry) => loadLazy(entry.row, entry.key, false));
    }, [flat.pending, loadLazy]);

    const indexOfKey = useMemo(() => createKeyIndex(items), [items]);

    const selection = useTreeTableSelection<T>({
        mode: selectionMode,
        selectedKeys,
        defaultSelectedKeys,
        onSelectionChange,
        propagate: propagateSelection,
        access,
        roots: source.roots,
        include,
        isSelectable,
    });
    useEffect(() => {
        addKeysRef.current = selection.addKeys;
    }, [selection.addKeys]);
    const { selected } = selection;

    const totalSelectable = useMemo(() => {
        if (selectionMode !== 'multiple' && selectionMode !== 'checkbox') return 0;
        let count = 0;
        walkTree(source.roots, access, (row, key) => {
            if (include && !include.has(key)) return false;
            if (isSelectable(row)) count += 1;
            return undefined;
        });
        return count;
    }, [selectionMode, source.roots, access, include, isSelectable]);

    const coarse = useCoarsePointer();
    const baseHeight = typeof rowHeight === 'number' ? rowHeight : sizeHeights[size];
    const fixedHeight = coarse ? Math.max(baseHeight, touchMinHeight) : baseHeight;
    const heightAt = useMemo(() => {
        if (!rowHeightFn) return null;
        return (index: number) => {
            const item = items[index];
            if (!item || item.kind !== 'row') return fixedHeight;
            const value = rowHeightFn(item.row, item.level);
            return coarse ? Math.max(value, touchMinHeight) : value;
        };
    }, [rowHeightFn, items, fixedHeight, coarse]);
    const offsets = useRowOffsets(items.length, fixedHeight, heightAt);

    const [setScrollerElement, scrollerSize] = useElementSize<HTMLDivElement>();
    const [setHeadElement, headSize] = useElementSize<HTMLDivElement>();
    const [setFootElement, footSize] = useElementSize<HTMLDivElement>();
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const bodyRef = useRef<HTMLDivElement | null>(null);
    const assignScroller = useCallback(
        (element: HTMLDivElement | null) => {
            scrollerRef.current = element;
            setScrollerElement(element);
        },
        [setScrollerElement],
    );

    const [scrollTop, setScrollTop] = useState(0);
    const frameRef = useRef(0);
    const handleScroll = useCallback(() => {
        if (frameRef.current) return;
        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = 0;
            const element = scrollerRef.current;
            if (element) setScrollTop(element.scrollTop);
        });
    }, []);
    useEffect(
        () => () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        },
        [],
    );

    const bodyViewport = Math.max(scrollerSize.height - headSize.height - footSize.height, fixedHeight);
    const virtual = useTreeTableVirtual(items.length, fixedHeight, offsets, bodyViewport, scrollTop, overscan);
    const virtualRef = useLatest(virtual);

    const endFiredRef = useRef(-1);
    useEffect(() => {
        if (!hasMore || loadingMore || loading) return;
        if (virtual.end < items.length - 1 - endReachedThreshold) return;
        if (endFiredRef.current === items.length) return;
        endFiredRef.current = items.length;
        latestRef.current.onEndReached?.();
    }, [hasMore, loadingMore, loading, virtual.end, items.length, endReachedThreshold, latestRef]);

    const [order, setOrder] = useControllableState<string[] | null>(columnOrder, () => null);
    const [widths, setWidths] = useState<Record<string, number>>({});
    const layout = useTreeTableColumns(columns, order, widths, scrollerSize.width);
    const expanderKey = layout.columns.some((entry) => entry.key === expanderColumn) ? (expanderColumn as string) : layout.columns[0]?.key ?? '';
    const columnCount = layout.columns.length;

    const [focus, setFocus] = useState<{ key: TreeTableKey | null; column: number }>({ key: null, column: -1 });
    const pendingFocusRef = useRef(false);
    const [editing, setEditing] = useState<EditingCell | null>(null);
    const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
    const dragIndexRef = useRef<number>(-1);

    const scrollToIndex = useCallback((index: number, align: ScrollAlign = 'auto') => {
        const element = scrollerRef.current;
        const last = itemsRef.current.length - 1;
        if (!element || index < 0 || last < 0) return;
        const target = virtualRef.current.targetScrollTop(Math.min(index, last), align, element.scrollTop);
        if (Math.abs(target - element.scrollTop) > 0.5) {
            element.scrollTop = target;
            setScrollTop(element.scrollTop);
        }
    }, [itemsRef, virtualRef]);

    const moveFocus = useCallback(
        (index: number, column: number) => {
            const item = itemsRef.current[index];
            if (!item) return;
            const nextColumn = item.kind === 'row' ? Math.min(column, columnCount - 1) : -1;
            pendingFocusRef.current = true;
            setFocus({ key: item.key, column: nextColumn });
            scrollToIndex(index);
        },
        [columnCount, itemsRef, scrollToIndex],
    );

    const focusIndex = focus.key === null ? -1 : indexOfKey(focus.key);
    const focusIndexRef = useLatest(focusIndex);
    const focusRendered = focusIndex >= virtual.start && focusIndex <= virtual.end;

    useEffect(() => {
        if (!pendingFocusRef.current || focusIndex < 0) return;
        const body = bodyRef.current;
        if (!body) return;
        const rowElement = body.querySelector<HTMLElement>(`[data-tt-index="${focusIndex}"]`);
        if (!rowElement) return;
        const target = focus.column >= 0 ? rowElement.querySelector<HTMLElement>(`[data-tt-col="${focus.column}"]`) ?? rowElement : rowElement;
        pendingFocusRef.current = false;
        target.focus({ preventScroll: true });
        if (focus.column >= 0 && !target.classList.contains('eui-tree-table-cell-frozen')) target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }, [focus, focusIndex, virtual.start, virtual.end, editing]);

    const emitExpanded = useCallback(
        (next: Set<TreeTableKey>, row: T, key: TreeTableKey, isOpen: boolean) => {
            setExpandedState(next);
            latestRef.current.onExpandedChange?.(new Set(next), { row, rowKey: key, expanded: isOpen });
        },
        [latestRef, setExpandedState],
    );

    const setRowExpanded = useCallback(
        (item: FlatRow<T>, open: boolean) => {
            if (!item.hasChildren && open) return;
            const next = new Set(expanded);
            if (filterResult) {
                const keys = new Set(collapsedWhileFiltering ?? []);
                if (open) keys.delete(item.key);
                else keys.add(item.key);
                setFilterCollapsed({ owner: filterResult, keys });
            }
            if (open) next.add(item.key);
            else next.delete(item.key);
            emitExpanded(next, item.row, item.key, open);
        },
        [expanded, filterResult, collapsedWhileFiltering, emitExpanded],
    );

    const toggleIndex = useCallback(
        (index: number) => {
            const currentItems = itemsRef.current;
            const item = currentItems[index];
            if (!item || item.kind !== 'row' || !item.hasChildren) return;
            const focused = focusIndexRef.current;
            if (item.expanded && focused > index && isWithin(currentItems, index, focused)) {
                pendingFocusRef.current = true;
                setFocus({ key: item.key, column: -1 });
            }
            setRowExpanded(item, !item.expanded);
        },
        [focusIndexRef, itemsRef, setRowExpanded],
    );

    const expandKeys = useCallback(
        (predicate: (row: T, key: TreeTableKey, level: number) => boolean, mode: 'replace' | 'merge') => {
            const next = mode === 'merge' ? new Set(expanded) : new Set<TreeTableKey>();
            walkTree(source.roots, access, (row, key, level) => {
                const children = access.getChildren(row, key);
                if (!children || !children.length) return false;
                if (!predicate(row, key, level)) return false;
                next.add(key);
                return undefined;
            });
            setFilterCollapsed({ owner: filterResult, keys: new Set() });
            setExpandedState(next);
            latestRef.current.onExpandedChange?.(new Set(next), { row: null, rowKey: null, expanded: true });
        },
        [expanded, source.roots, access, filterResult, setExpandedState, latestRef],
    );

    const collapseAll = useCallback(() => {
        setFilterCollapsed({ owner: filterResult, keys: new Set(filterResult?.expand ?? []) });
        setExpandedState(new Set());
        latestRef.current.onExpandedChange?.(new Set(), { row: null, rowKey: null, expanded: false });
    }, [filterResult, latestRef, setExpandedState]);

    const expandSiblings = useCallback(
        (index: number) => {
            const currentItems = itemsRef.current;
            const origin = currentItems[index];
            if (!origin) return;
            const next = new Set(expanded);
            for (let i = 0; i < currentItems.length; i += 1) {
                const candidate = currentItems[i];
                if (candidate.kind === 'row' && candidate.parentIndex === origin.parentIndex && candidate.hasChildren) next.add(candidate.key);
            }
            if (origin.kind === 'row') emitExpanded(next, origin.row, origin.key, true);
        },
        [itemsRef, expanded, emitExpanded],
    );

    const selectIndex = useCallback(
        (index: number, event: React.MouseEvent | React.KeyboardEvent) => {
            const item = itemsRef.current[index];
            if (!item || item.kind !== 'row') return;
            selection.selectRow(item, index, itemsRef.current, { shift: event.shiftKey, toggle: event.ctrlKey || event.metaKey || 'key' in event });
        },
        [itemsRef, selection],
    );

    const extendSelection = useCallback(
        (from: number, to: number) => {
            const item = itemsRef.current[to];
            if (!item || item.kind !== 'row') return;
            selection.extendTo(from, item, to, itemsRef.current);
        },
        [itemsRef, selection],
    );

    const isCellEditable = useCallback(
        (column: TreeTableColumn<T>, row: T) => {
            if (!latestRef.current.onCellEdit || isDisabled(row)) return false;
            if (typeof column.editable === 'function') return column.editable(row);
            return Boolean(column.editable);
        },
        [isDisabled, latestRef],
    );

    const startEdit = useCallback(
        (index: number, columnIndex: number): boolean => {
            const item = itemsRef.current[index];
            const entry = layout.columns[columnIndex];
            if (!item || item.kind !== 'row' || !entry || !isCellEditable(entry.column, item.row)) return false;
            setEditing({ key: item.key, columnKey: entry.key, error: null });
            return true;
        },
        [itemsRef, layout.columns, isCellEditable],
    );

    const aggregator = useMemo(() => createAggregator(access), [access]);

    const emitMove = useCallback(
        (sourceIndex: number, targetIndex: number, position: TreeTableDropPosition): boolean => {
            const currentItems = itemsRef.current;
            const sourceItem = currentItems[sourceIndex];
            const targetItem = currentItems[targetIndex];
            if (!sourceItem || !targetItem || sourceItem.kind !== 'row' || targetItem.kind !== 'row') return false;
            if (sourceIndex === targetIndex || isWithin(currentItems, sourceIndex, targetIndex)) return false;
            if (isDisabled(sourceItem.row)) return false;
            const event: TreeTableRowMoveEvent<T> = { row: sourceItem.row, rowKey: sourceItem.key, target: targetItem.row, targetKey: targetItem.key, position };
            const { canMoveRow, onRowMove } = latestRef.current;
            if (canMoveRow && !canMoveRow(event)) return false;
            onRowMove?.(event);
            announce(labels.rowMoved);
            return true;
        },
        [itemsRef, isDisabled, latestRef, announce, labels.rowMoved],
    );

    const moveRowByKeyboard = useCallback(
        (index: number, direction: KeyboardMoveDirection) => {
            const currentItems = itemsRef.current;
            const item = currentItems[index];
            if (!item || item.kind !== 'row') return;
            if (direction === 'up') {
                const sibling = findSibling(currentItems, index, -1);
                if (sibling >= 0) emitMove(index, sibling, 'before');
            } else if (direction === 'down') {
                const sibling = findSibling(currentItems, index, 1);
                if (sibling >= 0) emitMove(index, sibling, 'after');
            } else if (direction === 'in') {
                const sibling = findSibling(currentItems, index, -1);
                if (sibling >= 0) emitMove(index, sibling, 'inside');
            } else if (item.parentIndex >= 0) {
                emitMove(index, item.parentIndex, 'after');
            }
            pendingFocusRef.current = true;
            setFocus({ key: item.key, column: -1 });
        },
        [emitMove, itemsRef],
    );

    const handlers = useMemo<RowHandlers>(
        () => ({
            toggle: toggleIndex,
            select: selectIndex,
            check: (index) => {
                const item = itemsRef.current[index];
                if (item && item.kind === 'row') selection.toggleChecked(item, index, itemsRef.current);
            },
            rowClick: (index, event) => {
                const item = itemsRef.current[index];
                if (!item || item.kind !== 'row') return;
                const current = latestRef.current;
                if (!isDisabled(item.row)) {
                    if (selectionMode === 'single' || selectionMode === 'multiple') {
                        selection.selectRow(item, index, itemsRef.current, { shift: event.shiftKey, toggle: event.ctrlKey || event.metaKey });
                    }
                    if (expandOnRowClick && item.hasChildren) toggleIndex(index);
                }
                current.onRowClick?.(item.row, event);
            },
            rowDoubleClick: (index, event) => {
                const item = itemsRef.current[index];
                if (item && item.kind === 'row') latestRef.current.onRowDoubleClick?.(item.row, event);
            },
            rowContextMenu: (index, event) => {
                const item = itemsRef.current[index];
                if (item && item.kind === 'row') latestRef.current.onRowContextMenu?.(item.row, event);
            },
            cellClick: (index, columnIndex, event) => {
                const item = itemsRef.current[index];
                const entry = layout.columns[columnIndex];
                if (!item || item.kind !== 'row' || !entry) return;
                latestRef.current.onCellClick?.({ row: item.row, rowKey: item.key, column: entry.column, value: getCellValue(item.row, entry.column) }, event);
            },
            cellDoubleClick: (index, columnIndex) => {
                if (startEdit(index, columnIndex)) setFocus({ key: itemsRef.current[index].key, column: columnIndex });
            },
            focusCell: moveFocus,
            loadMore: (index) => {
                const item = itemsRef.current[index];
                if (!item || item.kind !== 'more' || item.parentIndex < 0) return;
                const parent = itemsRef.current[item.parentIndex];
                if (parent.kind === 'row') loadLazy(parent.row, parent.key, true);
            },
            retry: (index) => {
                const item = itemsRef.current[index];
                if (!item || item.parentIndex < 0) return;
                const parent = itemsRef.current[item.parentIndex];
                if (parent.kind !== 'row') return;
                const state = lazyStore.get(parent.key);
                loadLazy(parent.row, parent.key, Boolean(state && state.rows.length));
            },
            dragStart: (index, event) => {
                const item = itemsRef.current[index];
                if (!item || item.kind !== 'row' || isDisabled(item.row)) {
                    event.preventDefault();
                    return;
                }
                dragIndexRef.current = index;
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', '');
            },
            dragOver: (index, event) => {
                const sourceIndex = dragIndexRef.current;
                if (sourceIndex < 0) return;
                const currentItems = itemsRef.current;
                if (sourceIndex === index || isWithin(currentItems, sourceIndex, index) || currentItems[index]?.kind !== 'row') {
                    setDropTarget(null);
                    return;
                }
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                const rect = event.currentTarget.getBoundingClientRect();
                const ratio = (event.clientY - rect.top) / Math.max(rect.height, 1);
                const position: TreeTableDropPosition = ratio < 0.25 ? 'before' : ratio > 0.75 ? 'after' : 'inside';
                setDropTarget((previous) => (previous && previous.index === index && previous.position === position ? previous : { index, position }));
            },
            dragLeave: (index, event) => {
                if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                setDropTarget((previous) => (previous && previous.index === index ? null : previous));
            },
            drop: (index, event) => {
                const sourceIndex = dragIndexRef.current;
                event.preventDefault();
                setDropTarget((previous) => {
                    if (previous && previous.index === index && sourceIndex >= 0) emitMove(sourceIndex, index, previous.position);
                    return null;
                });
                dragIndexRef.current = -1;
            },
            dragEnd: () => {
                dragIndexRef.current = -1;
                setDropTarget(null);
            },
            commitEdit: (index, columnKey, value) => {
                const item = itemsRef.current[index];
                const column = columnsByKey.get(columnKey);
                if (!item || item.kind !== 'row' || !column) return;
                const error = column.validate ? column.validate(value, item.row) : null;
                if (error) {
                    setEditing({ key: item.key, columnKey, error });
                    return;
                }
                const previousValue = getCellValue(item.row, column);
                setEditing(null);
                pendingFocusRef.current = true;
                if (previousValue !== value) {
                    latestRef.current.onCellEdit?.({ row: item.row, rowKey: item.key, column, field: column.field ?? column.key, value, previousValue });
                }
            },
            cancelEdit: () => {
                pendingFocusRef.current = true;
                setEditing(null);
            },
        }),
        [toggleIndex, selectIndex, moveFocus, itemsRef, selection, latestRef, isDisabled, selectionMode, expandOnRowClick, layout.columns, startEdit, loadLazy, lazyStore, emitMove, columnsByKey],
    );

    const handleKeyDown = useTreeTableKeyboard<T>({
        items,
        columnCount,
        rowsPerPage: virtual.rowsPerPage,
        selectionMode,
        rowReorder,
        moveFocus,
        toggle: toggleIndex,
        select: selectIndex,
        extendSelection,
        selectAll: selection.selectAll,
        expandSiblings,
        startEdit: (index, column) => {
            if (!startEdit(index, column)) return false;
            setFocus({ key: itemsRef.current[index].key, column });
            return true;
        },
        activateStatus: (index) => {
            const item = itemsRef.current[index];
            if (!item) return;
            if (item.kind === 'more') handlers.loadMore(index);
            if (item.kind === 'error') handlers.retry(index);
        },
        moveRow: moveRowByKeyboard,
        activateRow: (index) => {
            const item = itemsRef.current[index];
            if (!item || item.kind !== 'row') return;
            if (item.hasChildren) toggleIndex(index);
            else if (selectionMode === 'single' || selectionMode === 'multiple') selection.selectRow(item, index, itemsRef.current, { shift: false, toggle: false });
        },
    });

    const handleFocusCapture = useCallback(
        (event: React.FocusEvent<HTMLDivElement>) => {
            const target = event.target as HTMLElement;
            const rowElement = target.closest<HTMLElement>('[data-tt-index]');
            if (!rowElement || !bodyRef.current?.contains(rowElement)) return;
            const index = Number(rowElement.getAttribute('data-tt-index'));
            const item = itemsRef.current[index];
            if (!item) return;
            const cell = target.closest<HTMLElement>('[data-tt-col]');
            const column = cell && rowElement.contains(cell) ? Number(cell.getAttribute('data-tt-col')) : -1;
            setFocus((previous) => (previous.key === item.key && previous.column === column ? previous : { key: item.key, column }));
        },
        [itemsRef],
    );

    const handleScrollerFocus = useCallback(
        (event: React.FocusEvent<HTMLDivElement>) => {
            if (event.target !== event.currentTarget || !itemsRef.current.length) return;
            const fallback = focusIndex >= 0 ? focusIndex : virtualRef.current.start;
            moveFocus(Math.min(fallback, itemsRef.current.length - 1), focusIndex >= 0 ? focus.column : -1);
        },
        [itemsRef, focusIndex, virtualRef, moveFocus, focus.column],
    );

    const handleSort = useCallback(
        (key: string, additive: boolean) => {
            const next = nextSortState(sort, key, multiSort && additive);
            setSort(next);
            latestRef.current.onSortChange?.(next);
            const entry = next.find((item) => item.key === key);
            const column = columnsByKey.get(key);
            const name = column && typeof column.title === 'string' ? column.title : column?.headerAriaLabel ?? key;
            announce(`${name} ${entry ? (entry.direction === 'asc' ? labels.sortAscending : labels.sortDescending) : labels.sortNone}`);
        },
        [sort, multiSort, setSort, latestRef, columnsByKey, announce, labels.sortAscending, labels.sortDescending, labels.sortNone],
    );

    const handleFilterChange = useCallback(
        (key: string, value: string) => {
            const next = { ...filtersRef.current, [key]: value };
            if (!value) delete next[key];
            setFilters(next);
            latestRef.current.onFiltersChange?.(next);
        },
        [filtersRef, latestRef, setFilters],
    );

    const handleResize = useCallback((key: string, width: number) => {
        setWidths((previous) => (previous[key] === width ? previous : { ...previous, [key]: width }));
    }, []);

    const handleResizeEnd = useCallback((key: string, width: number) => {
        latestRef.current.onColumnResize?.(key, width);
    }, [latestRef]);

    const currentOrder = useMemo(() => layout.columns.map((entry) => entry.key), [layout.columns]);

    const applyOrder = useCallback(
        (next: string[]) => {
            const hiddenKeys = columns.map((column) => column.key).filter((key) => !next.includes(key));
            const full = [...next, ...hiddenKeys];
            setOrder(full);
            latestRef.current.onColumnOrderChange?.(full);
        },
        [columns, latestRef, setOrder],
    );

    const handleReorder = useCallback(
        (sourceKey: string, targetKey: string, after: boolean) => {
            const next = currentOrder.filter((key) => key !== sourceKey);
            const targetIndex = next.indexOf(targetKey);
            if (targetIndex < 0) return;
            next.splice(after ? targetIndex + 1 : targetIndex, 0, sourceKey);
            applyOrder(next);
        },
        [currentOrder, applyOrder],
    );

    const handleMoveColumn = useCallback(
        (key: string, direction: -1 | 1) => {
            const index = currentOrder.indexOf(key);
            const target = index + direction;
            const targetEntry = layout.columns[target];
            if (index < 0 || !targetEntry || targetEntry.frozen) return;
            const next = currentOrder.slice();
            next.splice(index, 1);
            next.splice(target, 0, key);
            applyOrder(next);
        },
        [currentOrder, layout.columns, applyOrder],
    );

    const headerSelectState: RowCheckState = selected.size === 0 ? 'none' : totalSelectable > 0 && selected.size >= totalSelectable ? 'all' : 'some';
    const selectAllConfig = useMemo(
        () =>
            showSelectAll && (selectionMode === 'checkbox' || selectionMode === 'multiple')
                ? {
                      state: headerSelectState,
                      onToggle: () => (headerSelectState === 'all' ? selection.clearSelection() : selection.selectAll()),
                  }
                : null,
        [showSelectAll, selectionMode, headerSelectState, selection],
    );

    const aggregateRow = useCallback((row: T, column: TreeTableColumn<T>) => aggregator.forRow(row, column), [aggregator]);
    const aggregateRows = useCallback((rows: T[], column: TreeTableColumn<T>) => aggregator.forRows(rows, column), [aggregator]);

    const groupRows = layout.groups ? 1 : 0;
    const headerRowCount = groupRows + 1 + (showFilterRow ? 1 : 0);
    const footerVisible = showFooter ?? columns.some((column) => column.footer !== undefined);

    const config = useMemo<RowConfig<T>>(
        () => ({
            columns: layout.columns,
            expanderKey,
            indent,
            showGuides,
            selectionMode,
            rowReorder,
            labels,
            filterText: globalTerm,
            highlightTerms,
            highlightMatches,
            headerRowCount,
            rowIcon,
            expandIcon,
            collapseIcon,
            rowClassName,
            rowLabel: rowLabelFn,
            isRowDisabled: isDisabled,
            isRowSelectable: isSelectable,
            isCellEditable,
            aggregate: aggregateRow,
            handlers,
        }),
        [
            layout.columns,
            expanderKey,
            indent,
            showGuides,
            selectionMode,
            rowReorder,
            labels,
            globalTerm,
            highlightTerms,
            highlightMatches,
            headerRowCount,
            rowIcon,
            expandIcon,
            collapseIcon,
            rowClassName,
            rowLabelFn,
            isDisabled,
            isSelectable,
            isCellEditable,
            aggregateRow,
            handlers,
        ],
    );

    useImperativeHandle(
        ref,
        (): TreeTableHandle<T> => {
            const findRow = (key: TreeTableKey): T | undefined => {
                let found: T | undefined;
                walkTree(source.roots, access, (row, rowKeyValue) => {
                    if (found) return false;
                    if (rowKeyValue === key) found = row;
                    return undefined;
                });
                return found;
            };
            const ancestorsOf = (key: TreeTableKey): TreeTableKey[] | null => {
                const path: TreeTableKey[] = [];
                let result: TreeTableKey[] | null = null;
                walkTree(source.roots, access, (_row, rowKeyValue, level) => {
                    if (result) return false;
                    path.length = level;
                    if (rowKeyValue === key) {
                        result = path.slice();
                        return false;
                    }
                    path.push(rowKeyValue);
                    return undefined;
                });
                return result;
            };
            const reveal = (key: TreeTableKey) => {
                const ancestors = ancestorsOf(key);
                if (!ancestors || !ancestors.length) return;
                const next = new Set(expanded);
                ancestors.forEach((ancestor) => next.add(ancestor));
                setExpandedState(next);
                const row = findRow(key);
                if (row) latestRef.current.onExpandedChange?.(new Set(next), { row, rowKey: key, expanded: true });
            };
            const changeRow = (key: TreeTableKey, open: boolean | null) => {
                const index = indexOfKey(key);
                const item = itemsRef.current[index];
                if (item && item.kind === 'row') {
                    setRowExpanded(item, open === null ? !item.expanded : open);
                    return;
                }
                const row = findRow(key);
                if (!row || open === false) return;
                const next = new Set(expanded);
                next.add(key);
                emitExpanded(next, row, key, true);
            };
            const visibleRows = () => itemsRef.current.filter((item): item is FlatRow<T> => item.kind === 'row');
            return {
                expandAll: () => expandKeys(alwaysTrue, 'replace'),
                collapseAll,
                expandToLevel: (level: number) => expandKeys((_row, _key, rowLevel) => rowLevel < level, 'replace'),
                expandRow: (key) => changeRow(key, true),
                collapseRow: (key) => changeRow(key, false),
                toggleRow: (key) => changeRow(key, null),
                revealRow: reveal,
                scrollToRow: (key, align = 'auto') => scrollToIndex(indexOfKey(key), align),
                scrollToIndex,
                scrollToTop: () => scrollToIndex(0, 'start'),
                focusRow: (key) => {
                    const index = indexOfKey(key);
                    if (index >= 0) moveFocus(index, -1);
                },
                reloadChildren: (key) => {
                    const row = findRow(key);
                    resetLazy(key);
                    if (row && expanded.has(key)) loadLazy(row, key, false);
                },
                getRow: findRow,
                getVisibleRows: () => visibleRows().map((item) => item.row),
                getSelectedRows: () => {
                    const rows: T[] = [];
                    walkTree(source.roots, access, (row, key) => {
                        if (selected.has(key)) rows.push(row);
                    });
                    return rows;
                },
                selectAll: selection.selectAll,
                clearSelection: selection.clearSelection,
                clearFilters: () => {
                    setFilters(emptyFilters);
                    latestRef.current.onFiltersChange?.({});
                },
                toCsv: (options: TreeTableCsvOptions = {}) => {
                    const { includeHidden = false, onlySelected = false, allRows = false, delimiter = ',', includeLevel = true, levelHeader = 'Level' } = options;
                    const exportColumns = includeHidden ? columns : layout.columns.map((entry) => entry.column);
                    const header = exportColumns.map((column) => (typeof column.title === 'string' ? column.title : column.headerAriaLabel ?? column.key));
                    const lines: string[][] = [includeLevel ? [levelHeader, ...header] : header];
                    const pushRow = (row: T, key: TreeTableKey, level: number) => {
                        if (onlySelected && !selected.has(key)) return;
                        const cells = exportColumns.map((column) => getCellText(row, column));
                        lines.push(includeLevel ? [String(level + 1), ...cells] : cells);
                    };
                    if (allRows) {
                        walkTree(source.roots, access, (row, key, level) => {
                            if (include && !include.has(key)) return false;
                            pushRow(row, key, level);
                            return undefined;
                        });
                    } else {
                        visibleRows().forEach((item) => pushRow(item.row, item.key, item.level));
                    }
                    return buildCsv(lines, delimiter);
                },
            };
        },
        [collapseAll, scrollToIndex, selection.selectAll, selection.clearSelection, source.roots, access, expanded, setExpandedState, latestRef, indexOfKey, itemsRef, emitExpanded, setRowExpanded, expandKeys, moveFocus, resetLazy, loadLazy, selected, setFilters, columns, layout.columns, include],
    );

    const rendered: React.ReactNode[] = [];
    if (!loading) {
        for (let index = virtual.start; index <= virtual.end; index += 1) {
            const item = items[index];
            if (!item) continue;
            const height = virtual.heightOf(index);
            const isFocused = focusIndex === index;
            if (item.kind === 'row') {
                const isEditingRow = editing && editing.key === item.key ? editing : null;
                rendered.push(
                    <TreeTableRow<T>
                        key={`r:${typeof item.key}:${item.key}`}
                        item={item}
                        index={index}
                        height={height}
                        guides={showGuides ? guideSignature(items, index) : ''}
                        selected={selected.has(item.key)}
                        checkState={selectionMode === 'checkbox' ? selection.isRowChecked(item.row, item.key) : 'none'}
                        focusColumn={isFocused ? focus.column : -2}
                        tabbable={isFocused || (focusIndex < 0 && index === virtual.start)}
                        editing={isEditingRow}
                        dropPosition={dropTarget && dropTarget.index === index ? dropTarget.position : null}
                        config={config}
                    />,
                );
            } else {
                rendered.push(
                    <TreeTableStatusRow
                        key={`s:${itemKey(item)}`}
                        item={item}
                        index={index}
                        height={height}
                        indent={indent}
                        columnCount={columnCount}
                        headerRowCount={headerRowCount}
                        tabbable={isFocused || (focusIndex < 0 && index === virtual.start)}
                        focused={isFocused}
                        labels={labels}
                        handlers={handlers}
                    />,
                );
            }
        }
    }

    const skeleton = loading
        ? Array.from({ length: Math.max(1, skeletonRows) }, (_, index) => (
              <div key={index} role="row" className="eui-tree-table-row eui-tree-table-skeleton-row" style={{ height: fixedHeight }} aria-hidden="true">
                  {layout.columns.map((entry) => (
                      <div key={entry.key} className="eui-tree-table-cell" style={entry.stickyStyle}>
                          <SkeletonLine width={`${55 + ((index * 17 + entry.index * 23) % 40)}%`} />
                      </div>
                  ))}
              </div>
          ))
        : null;

    const isEmpty = !loading && items.length === 0;
    const labelledBy = ariaLabelledBy ?? (caption ? captionId : undefined);
    const describedBy = cn(ariaDescribedBy, instructionsId) || undefined;
    const scrollerFocusable = !loading && items.length > 0 && focusIndex >= 0 && !focusRendered;
    const rootStyle = { ...style, '--eui-tt-cols': layout.template || '1fr', '--eui-tt-indent': `${indent}px` } as React.CSSProperties;

    return (
        <div
            id={id}
            className={cn(
                'eui-tree-table',
                `eui-tree-table-${size}`,
                `eui-tree-table-lines-${gridLines}`,
                {
                    'eui-tree-table-striped': striped,
                    'eui-tree-table-hoverable': hoverable,
                    'eui-tree-table-selectable': selectionMode === 'single' || selectionMode === 'multiple',
                    'eui-tree-table-clickable': Boolean(props.onRowClick) || expandOnRowClick,
                    'eui-tree-table-guides': showGuides,
                },
                className,
            )}
            style={rootStyle}
        >
            {caption && (
                <div id={captionId} className="eui-tree-table-caption">
                    {caption}
                </div>
            )}
            <span id={instructionsId} className="eui-tree-table-sr-only">
                {rowReorder
                    ? 'Use arrow keys to navigate, Space to select, Enter to expand or edit, Alt plus arrow keys to move rows.'
                    : 'Use arrow keys to navigate, Space to select, Enter to expand or edit.'}
            </span>
            <div
                ref={assignScroller}
                role="treegrid"
                className="eui-tree-table-scroller"
                style={{ height: toCssSize(height) }}
                aria-label={labelledBy ? undefined : ariaLabel}
                aria-labelledby={labelledBy}
                aria-describedby={describedBy}
                aria-rowcount={loading ? -1 : headerRowCount + items.length + (footerVisible ? 1 : 0)}
                aria-colcount={columnCount}
                aria-multiselectable={selectionMode === 'multiple' || selectionMode === 'checkbox' ? true : undefined}
                aria-busy={loading || loadingMore || undefined}
                tabIndex={scrollerFocusable ? 0 : -1}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                onFocus={handleScrollerFocus}
                onFocusCapture={handleFocusCapture}
            >
                <div className="eui-tree-table-canvas" role="presentation" style={{ minWidth: layout.minWidth }}>
                    <div ref={setHeadElement} role="rowgroup" className="eui-tree-table-head">
                        <TreeTableHeader<T>
                            layout={layout}
                            expanderKey={expanderKey}
                            sort={sort}
                            labels={labels}
                            resizable={resizableColumns}
                            reorderable={reorderableColumns}
                            showFilterRow={showFilterRow}
                            filters={filters}
                            filterDebounce={filterDebounce}
                            selectAll={selectAllConfig}
                            onSort={handleSort}
                            onResize={handleResize}
                            onResizeEnd={handleResizeEnd}
                            onReorder={handleReorder}
                            onMoveColumn={handleMoveColumn}
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                    <div ref={bodyRef} role="rowgroup" className="eui-tree-table-body" style={{ height: loading || isEmpty ? undefined : virtual.bodyHeight }}>
                        {loading ? (
                            skeleton
                        ) : isEmpty ? (
                            <div role="row" className="eui-tree-table-row eui-tree-table-empty-row" aria-rowindex={headerRowCount + 1}>
                                <div role="gridcell" aria-colspan={columnCount} className="eui-tree-table-empty">
                                    {emptyMessage ?? labels.noRows}
                                </div>
                            </div>
                        ) : (
                            <div role="presentation" className="eui-tree-table-window" style={{ transform: `translateY(${virtual.windowTop}px)` }}>
                                {rendered}
                            </div>
                        )}
                    </div>
                    {footerVisible && (
                        <div ref={setFootElement} role="rowgroup" className="eui-tree-table-foot">
                            <TreeTableFooter<T> layout={layout} roots={source.roots} rowIndex={headerRowCount + items.length + 1} aggregate={aggregateRows} />
                        </div>
                    )}
                </div>
            </div>
            <div className="eui-tree-table-sr-only" role="status" aria-live="polite" aria-atomic="true">
                <span key={announcement.nonce}>{announcement.message}</span>
            </div>
            <div className="eui-tree-table-sr-only" aria-live="polite" aria-atomic="true">
                {(selectionMode === 'multiple' || selectionMode === 'checkbox') && selected.size > 0 ? `${selected.size} ${labels.rowsSelected}` : ''}
            </div>
            <div className="eui-tree-table-sr-only" aria-live="polite" aria-atomic="true">
                {filterResult ? `${filterResult.include.size} ${labels.rowsCount}` : ''}
            </div>
        </div>
    );
}

export const TreeTable = forwardRef(TreeTableInner) as <T extends TreeTableRowData>(
    props: TreeTableProps<T> & { ref?: React.Ref<TreeTableHandle<T>> },
) => React.ReactElement;
