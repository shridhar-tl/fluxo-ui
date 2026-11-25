import { useCallback, useMemo, useRef } from 'react';

import { collectDescendants, createCheckResolver, type FlatItem, type FlatRow, type TreeAccess, walkTree } from './tree-table-data';
import type { TreeTableKey, TreeTableRowData, TreeTableSelectionEvent, TreeTableSelectionMode } from './tree-table-types';
import { useControllableState, useLatest } from './useTreeTableState';

interface SelectionOptions<T extends TreeTableRowData> {
    mode: TreeTableSelectionMode;
    selectedKeys: ReadonlySet<TreeTableKey> | undefined;
    defaultSelectedKeys: Iterable<TreeTableKey> | undefined;
    onSelectionChange: ((keys: Set<TreeTableKey>, event: TreeTableSelectionEvent<T>) => void) | undefined;
    propagate: boolean;
    access: TreeAccess<T>;
    roots: T[];
    include: Set<TreeTableKey> | null;
    isSelectable: (row: T) => boolean;
}

export interface SelectionModifiers {
    shift: boolean;
    toggle: boolean;
}

export const useTreeTableSelection = <T extends TreeTableRowData>({
    mode,
    selectedKeys,
    defaultSelectedKeys,
    onSelectionChange,
    propagate,
    access,
    roots,
    include,
    isSelectable,
}: SelectionOptions<T>) => {
    const [selected, setSelected, selectedRef] = useControllableState<ReadonlySet<TreeTableKey>>(
        selectedKeys,
        () => new Set(defaultSelectedKeys ?? []),
    );
    const anchorRef = useRef<number>(-1);
    const changeRef = useLatest(onSelectionChange);

    const hierarchical = mode === 'checkbox' && propagate;

    const resolver = useMemo(
        () => (hierarchical ? createCheckResolver(access, selected, isSelectable) : null),
        [hierarchical, access, selected, isSelectable],
    );

    const commit = useCallback(
        (next: Set<TreeTableKey>, row: T | null, key: TreeTableKey | null, isSelected: boolean) => {
            setSelected(next);
            changeRef.current?.(new Set(next), { row, rowKey: key, selected: isSelected });
        },
        [setSelected, changeRef],
    );

    const syncAncestors = useCallback(
        (next: Set<TreeTableKey>, item: FlatRow<T>, items: FlatItem<T>[]) => {
            const nextResolver = createCheckResolver(access, next, isSelectable);
            let parentIndex = item.parentIndex;
            while (parentIndex >= 0) {
                const parent = items[parentIndex];
                if (parent.kind !== 'row') break;
                if (nextResolver(parent.row) === 'all') next.add(parent.key);
                else next.delete(parent.key);
                parentIndex = parent.parentIndex;
            }
        },
        [access, isSelectable],
    );

    const isRowChecked = useCallback(
        (row: T, key: TreeTableKey): 'all' | 'some' | 'none' => {
            if (resolver) return resolver(row);
            return selected.has(key) ? 'all' : 'none';
        },
        [resolver, selected],
    );

    const toggleChecked = useCallback(
        (item: FlatRow<T>, index: number, items: FlatItem<T>[]) => {
            if (!isSelectable(item.row)) return;
            const current = isRowChecked(item.row, item.key);
            const check = current !== 'all';
            const next = new Set(selectedRef.current);
            const apply = (row: T, key: TreeTableKey) => {
                if (!isSelectable(row)) return;
                if (check) next.add(key);
                else next.delete(key);
            };
            apply(item.row, item.key);
            if (hierarchical) {
                collectDescendants(item.row, access, apply);
                syncAncestors(next, item, items);
            }
            anchorRef.current = index;
            commit(next, item.row, item.key, check);
        },
        [isSelectable, isRowChecked, selectedRef, hierarchical, access, syncAncestors, commit],
    );

    const selectRow = useCallback(
        (item: FlatRow<T>, index: number, items: FlatItem<T>[], modifiers: SelectionModifiers) => {
            if (mode === 'none' || !isSelectable(item.row)) return;
            if (mode === 'checkbox') {
                toggleChecked(item, index, items);
                return;
            }
            const current = selectedRef.current;
            if (mode === 'single') {
                const isSelected = current.has(item.key);
                if (isSelected && !modifiers.toggle) return;
                commit(isSelected ? new Set() : new Set([item.key]), item.row, item.key, !isSelected);
                anchorRef.current = index;
                return;
            }
            if (modifiers.shift && anchorRef.current >= 0) {
                const from = Math.min(anchorRef.current, index);
                const to = Math.max(anchorRef.current, index);
                const next = modifiers.toggle ? new Set(current) : new Set<TreeTableKey>();
                for (let i = from; i <= to; i += 1) {
                    const entry = items[i];
                    if (entry && entry.kind === 'row' && isSelectable(entry.row)) next.add(entry.key);
                }
                commit(next, item.row, item.key, true);
                return;
            }
            anchorRef.current = index;
            if (modifiers.toggle) {
                const next = new Set(current);
                const isSelected = next.has(item.key);
                if (isSelected) next.delete(item.key);
                else next.add(item.key);
                commit(next, item.row, item.key, !isSelected);
                return;
            }
            commit(new Set([item.key]), item.row, item.key, true);
        },
        [mode, isSelectable, toggleChecked, selectedRef, commit],
    );

    const extendTo = useCallback(
        (from: number, item: FlatRow<T>, index: number, items: FlatItem<T>[]) => {
            if (anchorRef.current < 0) anchorRef.current = from;
            selectRow(item, index, items, { shift: true, toggle: false });
        },
        [selectRow],
    );

    const selectAll = useCallback(() => {
        if (mode !== 'multiple' && mode !== 'checkbox') return;
        const next = new Set<TreeTableKey>();
        walkTree(roots, access, (row, key) => {
            if (include && !include.has(key)) return false;
            if (isSelectable(row)) next.add(key);
            return undefined;
        });
        commit(next, null, null, true);
    }, [mode, roots, access, include, isSelectable, commit]);

    const clearSelection = useCallback(() => {
        commit(new Set(), null, null, false);
    }, [commit]);

    const addKeys = useCallback(
        (parentKey: TreeTableKey, rows: T[]) => {
            if (!hierarchical || !selectedRef.current.has(parentKey) || !rows.length) return;
            const next = new Set(selectedRef.current);
            walkTree(rows, access, (row, key) => {
                if (isSelectable(row)) next.add(key);
            });
            setSelected(next);
            changeRef.current?.(new Set(next), { row: null, rowKey: parentKey, selected: true });
        },
        [hierarchical, selectedRef, access, isSelectable, setSelected, changeRef],
    );

    return useMemo(
        () => ({ selected, isRowChecked, selectRow, extendTo, toggleChecked, selectAll, clearSelection, addKeys }),
        [selected, isRowChecked, selectRow, extendTo, toggleChecked, selectAll, clearSelection, addKeys],
    );
};
