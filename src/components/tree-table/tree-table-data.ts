import type { TreeTableColumn, TreeTableFilterMode, TreeTableKey, TreeTableRowData } from './tree-table-types';
import {
    addToStats,
    type AggregateStats,
    emptyStats,
    getCellValue,
    mergeStats,
    readPath,
    resolveStats,
} from './tree-table-utils';

export interface LazyChildrenState<T extends TreeTableRowData> {
    status: 'loading' | 'loaded' | 'error';
    rows: T[];
    hasMore: boolean;
}

export interface TreeAccess<T extends TreeTableRowData> {
    getKey: (row: T) => TreeTableKey;
    getChildren: (row: T, key: TreeTableKey) => T[] | undefined;
}

export interface TreeSource<T extends TreeTableRowData> {
    roots: T[];
    staticChildren: (row: T, key: TreeTableKey) => T[] | undefined;
}

export interface FlatRow<T extends TreeTableRowData> {
    kind: 'row';
    key: TreeTableKey;
    row: T;
    level: number;
    parentIndex: number;
    parentKey: TreeTableKey | null;
    posInSet: number;
    setSize: number;
    isLast: boolean;
    hasChildren: boolean;
    expanded: boolean;
    loading: boolean;
}

export interface FlatStatus {
    kind: 'loading' | 'more' | 'error' | 'end';
    key: string;
    parentKey: TreeTableKey | null;
    level: number;
    parentIndex: number;
    isLast: boolean;
}

export type FlatItem<T extends TreeTableRowData> = FlatRow<T> | FlatStatus;

export interface FilterResult {
    include: Set<TreeTableKey>;
    expand: Set<TreeTableKey>;
    matchCount: number;
}

export interface FlattenOptions<T extends TreeTableRowData> {
    roots: T[];
    access: TreeAccess<T>;
    lazy: Map<TreeTableKey, LazyChildrenState<T>>;
    canLoad: boolean;
    hasChildrenFn?: (row: T) => boolean;
    isExpanded: (key: TreeTableKey) => boolean;
    include: Set<TreeTableKey> | null;
    sortRows: (rows: T[]) => T[];
    rootLoading: boolean;
}

export interface FlattenResult<T extends TreeTableRowData> {
    items: FlatItem<T>[];
    pending: FlatRow<T>[];
}

const emptyRows: never[] = [];

export const buildTreeSource = <T extends TreeTableRowData>(
    data: T[],
    getKey: (row: T) => TreeTableKey,
    childrenField: string,
    getChildren: ((row: T) => T[] | null | undefined) | undefined,
    getParent: ((row: T) => TreeTableKey | null) | null,
    lazyEnabled: boolean,
): TreeSource<T> => {
    if (getParent) {
        const keys = new Set<TreeTableKey>();
        for (let i = 0; i < data.length; i += 1) keys.add(getKey(data[i]));
        const childMap = new Map<TreeTableKey, T[]>();
        const roots: T[] = [];
        for (let i = 0; i < data.length; i += 1) {
            const row = data[i];
            const parent = getParent(row);
            if (parent === null || parent === getKey(row) || !keys.has(parent)) {
                roots.push(row);
                continue;
            }
            const bucket = childMap.get(parent);
            if (bucket) bucket.push(row);
            else childMap.set(parent, [row]);
        }
        return {
            roots,
            staticChildren: (_row, key) => childMap.get(key) ?? (lazyEnabled ? undefined : emptyRows),
        };
    }
    if (getChildren) {
        return {
            roots: data,
            staticChildren: (row) => {
                const children = getChildren(row);
                return Array.isArray(children) ? children : undefined;
            },
        };
    }
    return {
        roots: data,
        staticChildren: (row) => {
            const children = readPath(row, childrenField);
            return Array.isArray(children) ? (children as T[]) : undefined;
        },
    };
};

interface FilterFrame<T> {
    rows: T[];
    index: number;
    key: TreeTableKey | null;
    selfMatch: boolean;
    ancestorMatch: boolean;
    hit: boolean;
}

export const computeFilter = <T extends TreeTableRowData>(
    roots: T[],
    access: TreeAccess<T>,
    matches: (row: T) => boolean,
    mode: TreeTableFilterMode,
): FilterResult => {
    const include = new Set<TreeTableKey>();
    const expand = new Set<TreeTableKey>();
    const visited = new Set<TreeTableKey>();
    let matchCount = 0;
    const stack: FilterFrame<T>[] = [{ rows: roots, index: 0, key: null, selfMatch: false, ancestorMatch: false, hit: false }];
    while (stack.length) {
        const frame = stack[stack.length - 1];
        if (frame.index < frame.rows.length) {
            const row = frame.rows[frame.index];
            frame.index += 1;
            const key = access.getKey(row);
            if (visited.has(key)) continue;
            visited.add(key);
            const selfMatch = matches(row);
            if (selfMatch) matchCount += 1;
            stack.push({
                rows: access.getChildren(row, key) ?? emptyRows,
                index: 0,
                key,
                selfMatch,
                ancestorMatch: frame.ancestorMatch || frame.selfMatch,
                hit: false,
            });
            continue;
        }
        stack.pop();
        if (frame.key === null) continue;
        const nodeHit = frame.selfMatch || frame.hit;
        if (nodeHit || (mode === 'lenient' && frame.ancestorMatch)) include.add(frame.key);
        if (frame.hit) expand.add(frame.key);
        const parent = stack[stack.length - 1];
        if (parent && nodeHit) parent.hit = true;
    }
    return { include, expand, matchCount };
};

interface FlattenFrame<T> {
    rows: T[];
    index: number;
    level: number;
    parentIndex: number;
    parentKey: TreeTableKey | null;
    tail: FlatStatus | null;
}

const createStatus = (
    kind: FlatStatus['kind'],
    parentKey: TreeTableKey | null,
    level: number,
    parentIndex: number,
): FlatStatus => ({
    kind,
    key: `${kind}:${parentKey === null ? '' : `${typeof parentKey}:${parentKey}`}`,
    parentKey,
    level,
    parentIndex,
    isLast: true,
});

export const flattenTree = <T extends TreeTableRowData>(options: FlattenOptions<T>): FlattenResult<T> => {
    const { roots, access, lazy, canLoad, hasChildrenFn, isExpanded, include, sortRows, rootLoading } = options;
    const items: FlatItem<T>[] = [];
    const pending: FlatRow<T>[] = [];
    const seen = new Set<TreeTableKey>();
    const prepare = (rows: T[]): T[] => {
        const sorted = sortRows(rows);
        if (!include) return sorted;
        return sorted.filter((row) => include.has(access.getKey(row)));
    };
    const stack: FlattenFrame<T>[] = [
        {
            rows: prepare(roots),
            index: 0,
            level: 0,
            parentIndex: -1,
            parentKey: null,
            tail: rootLoading ? createStatus('end', null, 0, -1) : null,
        },
    ];
    while (stack.length) {
        const frame = stack[stack.length - 1];
        if (frame.index >= frame.rows.length) {
            if (frame.tail) items.push(frame.tail);
            stack.pop();
            continue;
        }
        const position = frame.index;
        const row = frame.rows[position];
        frame.index += 1;
        const key = access.getKey(row);
        if (seen.has(key)) continue;
        seen.add(key);
        const lazyState = lazy.get(key);
        const known = lazyState ? lazyState.rows : access.getChildren(row, key);
        const declaredLeaf = hasChildrenFn ? !hasChildrenFn(row) : false;
        let hasChildren: boolean;
        if (declaredLeaf && !lazyState) hasChildren = false;
        else if (lazyState) hasChildren = lazyState.status !== 'loaded' || lazyState.hasMore || countIncluded(lazyState.rows, include, access) > 0;
        else if (known) hasChildren = countIncluded(known, include, access) > 0;
        else hasChildren = canLoad;
        const expanded = hasChildren && isExpanded(key);
        const item: FlatRow<T> = {
            kind: 'row',
            key,
            row,
            level: frame.level,
            parentIndex: frame.parentIndex,
            parentKey: frame.parentKey,
            posInSet: position + 1,
            setSize: frame.rows.length,
            isLast: position === frame.rows.length - 1 && !frame.tail,
            hasChildren,
            expanded,
            loading: lazyState?.status === 'loading',
        };
        items.push(item);
        if (!expanded) continue;
        const index = items.length - 1;
        const level = frame.level + 1;
        if (!lazyState && !known) {
            pending.push(item);
            stack.push({ rows: emptyRows, index: 0, level, parentIndex: index, parentKey: key, tail: createStatus('loading', key, level, index) });
            continue;
        }
        let tail: FlatStatus | null = null;
        if (lazyState?.status === 'loading') tail = createStatus('loading', key, level, index);
        else if (lazyState?.status === 'error') tail = createStatus('error', key, level, index);
        else if (lazyState?.hasMore) tail = createStatus('more', key, level, index);
        const children = prepare(known ?? emptyRows);
        if (children.length || tail) stack.push({ rows: children, index: 0, level, parentIndex: index, parentKey: key, tail });
    }
    return { items, pending };
};

const countIncluded = <T extends TreeTableRowData>(rows: T[], include: Set<TreeTableKey> | null, access: TreeAccess<T>): number => {
    if (!include) return rows.length;
    for (let i = 0; i < rows.length; i += 1) {
        if (include.has(access.getKey(rows[i]))) return 1;
    }
    return 0;
};

export const walkTree = <T extends TreeTableRowData>(
    roots: T[],
    access: TreeAccess<T>,
    visit: (row: T, key: TreeTableKey, level: number) => boolean | void,
): void => {
    const visited = new Set<TreeTableKey>();
    const stack: { rows: T[]; index: number; level: number }[] = [{ rows: roots, index: 0, level: 0 }];
    while (stack.length) {
        const frame = stack[stack.length - 1];
        if (frame.index >= frame.rows.length) {
            stack.pop();
            continue;
        }
        const row = frame.rows[frame.index];
        frame.index += 1;
        const key = access.getKey(row);
        if (visited.has(key)) continue;
        visited.add(key);
        if (visit(row, key, frame.level) === false) continue;
        const children = access.getChildren(row, key);
        if (children && children.length) stack.push({ rows: children, index: 0, level: frame.level + 1 });
    }
};

export const collectDescendants = <T extends TreeTableRowData>(
    row: T,
    access: TreeAccess<T>,
    visit: (child: T, key: TreeTableKey) => void,
): void => {
    const children = access.getChildren(row, access.getKey(row));
    if (!children || !children.length) return;
    walkTree(children, access, (child, key) => {
        visit(child, key);
    });
};

export type CheckState = 'all' | 'some' | 'none';

interface CheckFrame<T> {
    row: T;
    key: TreeTableKey;
    children: T[];
    index: number;
    all: boolean;
    some: boolean;
    counted: number;
}

export const createCheckResolver = <T extends TreeTableRowData>(
    access: TreeAccess<T>,
    selected: ReadonlySet<TreeTableKey>,
    isSelectable: (row: T) => boolean,
) => {
    const cache = new Map<TreeTableKey, CheckState>();
    const leafState = (row: T, key: TreeTableKey): CheckState => (isSelectable(row) && selected.has(key) ? 'all' : 'none');
    return (row: T): CheckState => {
        const rootKey = access.getKey(row);
        const cached = cache.get(rootKey);
        if (cached) return cached;
        const onPath = new Set<TreeTableKey>([rootKey]);
        const stack: CheckFrame<T>[] = [
            { row, key: rootKey, children: access.getChildren(row, rootKey) ?? emptyRows, index: 0, all: true, some: false, counted: 0 },
        ];
        while (stack.length) {
            const frame = stack[stack.length - 1];
            if (frame.index < frame.children.length) {
                const child = frame.children[frame.index];
                frame.index += 1;
                const childKey = access.getKey(child);
                if (onPath.has(childKey)) continue;
                const known = cache.get(childKey);
                if (known) {
                    applyChild(frame, child, known, isSelectable);
                    continue;
                }
                const grandChildren = access.getChildren(child, childKey);
                if (!grandChildren || !grandChildren.length) {
                    const state = leafState(child, childKey);
                    cache.set(childKey, state);
                    applyChild(frame, child, state, isSelectable);
                    continue;
                }
                onPath.add(childKey);
                stack.push({ row: child, key: childKey, children: grandChildren, index: 0, all: true, some: false, counted: 0 });
                continue;
            }
            stack.pop();
            onPath.delete(frame.key);
            const state: CheckState = frame.counted === 0 ? leafState(frame.row, frame.key) : frame.all ? 'all' : frame.some ? 'some' : 'none';
            cache.set(frame.key, state);
            const parent = stack[stack.length - 1];
            if (parent) applyChild(parent, frame.row, state, isSelectable);
        }
        return cache.get(rootKey) ?? 'none';
    };
};

const applyChild = <T extends TreeTableRowData>(frame: CheckFrame<T>, child: T, state: CheckState, isSelectable: (row: T) => boolean) => {
    if (!isSelectable(child) && state === 'none') return;
    frame.counted += 1;
    if (state !== 'all') frame.all = false;
    if (state !== 'none') frame.some = true;
};

interface StatsFrame<T> {
    row: T;
    children: T[] | undefined;
    index: number;
    acc: AggregateStats;
}

export const createAggregator = <T extends TreeTableRowData>(access: TreeAccess<T>) => {
    const statsCache = new Map<string, WeakMap<object, AggregateStats>>();
    const customCache = new Map<string, WeakMap<object, number | null>>();

    const cacheFor = (column: TreeTableColumn<T>) => {
        let map = statsCache.get(column.key);
        if (!map) {
            map = new WeakMap();
            statsCache.set(column.key, map);
        }
        return map;
    };

    const statsFor = (row: T, column: TreeTableColumn<T>): AggregateStats => {
        const cache = cacheFor(column);
        const hit = cache.get(row);
        if (hit) return hit;
        const onPath = new Set<object>([row]);
        const stack: StatsFrame<T>[] = [{ row, children: access.getChildren(row, access.getKey(row)), index: 0, acc: emptyStats() }];
        while (stack.length) {
            const frame = stack[stack.length - 1];
            if (frame.children && frame.index < frame.children.length) {
                const child = frame.children[frame.index];
                frame.index += 1;
                if (onPath.has(child)) continue;
                const cached = cache.get(child);
                if (cached) {
                    mergeStats(frame.acc, cached);
                    continue;
                }
                onPath.add(child);
                stack.push({ row: child, children: access.getChildren(child, access.getKey(child)), index: 0, acc: emptyStats() });
                continue;
            }
            if (!frame.children || !frame.children.length) addToStats(frame.acc, getCellValue(frame.row, column));
            cache.set(frame.row, frame.acc);
            onPath.delete(frame.row);
            stack.pop();
            const parent = stack[stack.length - 1];
            if (parent) mergeStats(parent.acc, frame.acc);
        }
        return cache.get(row) ?? emptyStats();
    };

    const collectLeaves = (roots: T[]): T[] => {
        const leaves: T[] = [];
        walkTree(roots, access, (row, key) => {
            const children = access.getChildren(row, key);
            if (!children || !children.length) leaves.push(row);
        });
        return leaves;
    };

    const customFor = (rows: T[], column: TreeTableColumn<T>, cacheRow: T | null): number | null => {
        const aggregate = column.aggregate;
        if (typeof aggregate !== 'function') return null;
        let map = customCache.get(column.key);
        if (!map) {
            map = new WeakMap();
            customCache.set(column.key, map);
        }
        if (cacheRow && map.has(cacheRow)) return map.get(cacheRow) ?? null;
        const leaves = collectLeaves(rows);
        const result = aggregate(leaves, leaves.map((leaf) => getCellValue(leaf, column)));
        if (cacheRow) map.set(cacheRow, result);
        return result;
    };

    const forRow = (row: T, column: TreeTableColumn<T>): number | null => {
        if (!column.aggregate) return null;
        if (typeof column.aggregate === 'function') return customFor([row], column, row);
        return resolveStats(column.aggregate, statsFor(row, column));
    };

    const forRows = (rows: T[], column: TreeTableColumn<T>): number | null => {
        if (!column.aggregate) return null;
        if (typeof column.aggregate === 'function') return customFor(rows, column, null);
        const total = emptyStats();
        for (let i = 0; i < rows.length; i += 1) mergeStats(total, statsFor(rows[i], column));
        return resolveStats(column.aggregate, total);
    };

    return { forRow, forRows };
};

export const guideSignature = <T extends TreeTableRowData>(items: FlatItem<T>[], index: number): string => {
    const item = items[index];
    if (!item || item.level === 0) return '';
    const flags: string[] = new Array(item.level);
    let parentIndex = item.parentIndex;
    let level = item.level - 1;
    while (parentIndex >= 0 && level >= 0) {
        const parent = items[parentIndex];
        flags[level] = parent.isLast ? '0' : '1';
        parentIndex = parent.parentIndex;
        level -= 1;
    }
    return flags.join('');
};
