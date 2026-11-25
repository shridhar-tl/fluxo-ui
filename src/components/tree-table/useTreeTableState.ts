import { useCallback, useEffect, useRef, useState } from 'react';

import type { LazyChildrenState } from './tree-table-data';
import type { TreeTableKey, TreeTableLoadChildren, TreeTableRowData } from './tree-table-types';

export const useControllableState = <V>(controlled: V | undefined, initial: () => V) => {
    const [internal, setInternal] = useState<V>(initial);
    const isControlled = controlled !== undefined;
    const value = isControlled ? controlled : internal;
    const valueRef = useRef(value);
    useEffect(() => {
        valueRef.current = value;
    }, [value]);
    const set = useCallback((next: V) => {
        valueRef.current = next;
        setInternal(next);
    }, []);
    return [value, set, valueRef] as const;
};

export const useLatest = <V>(value: V) => {
    const ref = useRef(value);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref;
};

const coarseQuery = '(pointer: coarse)';

export const useCoarsePointer = (): boolean => {
    const [coarse, setCoarse] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(coarseQuery).matches);
    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
        const query = window.matchMedia(coarseQuery);
        const handler = (event: MediaQueryListEvent) => setCoarse(event.matches);
        query.addEventListener('change', handler);
        return () => query.removeEventListener('change', handler);
    }, []);
    return coarse;
};

export const useElementSize = <E extends HTMLElement>() => {
    const [element, setElement] = useState<E | null>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        if (!element) return;
        const update = () => {
            const width = element.clientWidth;
            const height = element.clientHeight;
            setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
        };
        if (typeof ResizeObserver === 'undefined') {
            const frame = requestAnimationFrame(update);
            window.addEventListener('resize', update);
            return () => {
                cancelAnimationFrame(frame);
                window.removeEventListener('resize', update);
            };
        }
        const observer = new ResizeObserver(update);
        observer.observe(element);
        return () => observer.disconnect();
    }, [element]);
    return [setElement, size] as const;
};

export const useLazyChildren = <T extends TreeTableRowData>(
    loadChildren: TreeTableLoadChildren<T> | undefined,
    onLoaded: (parentKey: TreeTableKey, rows: T[]) => void,
) => {
    const [store] = useState(() => new Map<TreeTableKey, LazyChildrenState<T>>());
    const [controllers] = useState(() => new Map<TreeTableKey, AbortController>());
    const loaderRef = useLatest(loadChildren);
    const onLoadedRef = useLatest(onLoaded);
    const [version, setVersion] = useState(0);

    useEffect(
        () => () => {
            controllers.forEach((controller, key) => {
                controller.abort();
                if (store.get(key)?.status === 'loading') store.delete(key);
            });
            controllers.clear();
        },
        [controllers, store],
    );

    const bump = useCallback(() => setVersion((value) => value + 1), []);

    const load = useCallback(
        (row: T, key: TreeTableKey, append: boolean) => {
            const loader = loaderRef.current;
            if (!loader) return;
            const existing = store.get(key);
            if (existing?.status === 'loading' && controllers.has(key)) return;
            controllers.get(key)?.abort();
            const controller = new AbortController();
            controllers.set(key, controller);
            const previous = append && existing ? existing.rows : [];
            store.set(key, { status: 'loading', rows: previous, hasMore: existing?.hasMore ?? false });
            bump();
            let request: Promise<T[] | { rows: T[]; hasMore?: boolean }>;
            try {
                request = Promise.resolve(loader(row, { offset: previous.length, signal: controller.signal }));
            } catch (error) {
                request = Promise.reject(error);
            }
            request
                .then((result) => {
                    if (controller.signal.aborted) return;
                    const page = Array.isArray(result)
                        ? { rows: result, hasMore: false }
                        : { rows: Array.isArray(result?.rows) ? result.rows : [], hasMore: Boolean(result?.hasMore) };
                    store.set(key, { status: 'loaded', rows: previous.concat(page.rows), hasMore: page.hasMore && page.rows.length > 0 });
                    onLoadedRef.current(key, page.rows);
                    bump();
                })
                .catch(() => {
                    if (controller.signal.aborted) return;
                    store.set(key, { status: 'error', rows: previous, hasMore: existing?.hasMore ?? false });
                    bump();
                })
                .finally(() => {
                    if (controllers.get(key) === controller) controllers.delete(key);
                });
        },
        [loaderRef, onLoadedRef, store, controllers, bump],
    );

    const reset = useCallback(
        (key: TreeTableKey) => {
            controllers.get(key)?.abort();
            controllers.delete(key);
            if (store.delete(key)) bump();
        },
        [controllers, store, bump],
    );

    return { store, version, load, reset };
};
