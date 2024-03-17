//src\store\factory\react-hooks.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { ListState, ModelFactory, ModelStore, Store } from '../types';

type Selector<T, R> = (state: T) => R;
type EqualityFn<T> = (a: T, b: T) => boolean;

const shallowEqual = <T>(a: T, b: T): boolean => {
    if (Object.is(a, b)) return true;

    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
        return false;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, key) || !Object.is((a as any)[key], (b as any)[key])) {
            return false;
        }
    }

    return true;
};

const strictEqual = <T>(a: T, b: T): boolean => Object.is(a, b);

function useStore<T, R>(store: Store<T>, selector?: Selector<T, R>, equalityFn?: EqualityFn<R> | boolean): T | R {
    const [state, setState] = useState(() => {
        const currentState = store.getState();
        return selector ? selector(currentState) : currentState;
    });

    const selectorRef = useRef(selector);
    const equalityRef = useRef<EqualityFn<T>>(strictEqual);
    const stateRef = useRef(state);

    selectorRef.current = selector;
    equalityRef.current = equalityFn === true ? shallowEqual : (equalityFn as any) || strictEqual;

    useEffect(() => {
        const unsubscribe = store.on('change', (newState) => {
            const newSelectedState = selectorRef.current ? selectorRef.current(newState) : newState;

            if (!equalityRef.current(stateRef.current as any, newSelectedState as any)) {
                stateRef.current = newSelectedState as any;
                setState(newSelectedState as any);
            }
        });

        return unsubscribe;
    }, [store]);

    return state;
}

export function createHook<T, S = T>(store: Store<T>) {
    function hook(): S;
    function hook<R>(selector: Selector<S, R>, equalityFn?: EqualityFn<R> | boolean): R;
    function hook<R>(selector?: Selector<S, R>, equalityFn?: EqualityFn<R> | boolean): S | R {
        return useStore(store as unknown as Store<S>, selector as any, equalityFn);
    }
    return hook;
}

type ModelStoreState<T> = T & {
    id: any;
    isStale: boolean;
    isLoading: boolean;
    isSaving: boolean;
    isDeleting: boolean;
};

function useModelStore<T>(modelStore: ModelStore<T>): ModelStoreState<T>;
function useModelStore<T, R>(modelStore: ModelStore<T>, selector: Selector<ModelStoreState<T>, R>): R;
function useModelStore<T, R>(modelStore: ModelStore<T>, selector: Selector<ModelStoreState<T>, R>, shallowCompare?: boolean): R;
function useModelStore<T, R>(
    modelStore: ModelStore<T>,
    selector?: Selector<ModelStoreState<T>, R>,
    shallowCompare?: boolean
): ModelStoreState<T> | R {
    const getExtendedState = useCallback(
        (): ModelStoreState<T> => ({
            ...modelStore.getState(),
            id: modelStore.id,
            isStale: modelStore.isStale,
            isLoading: modelStore.isLoading,
            isSaving: modelStore.isSaving,
            isDeleting: modelStore.isDeleting,
        }),
        [modelStore]
    );

    const [state, setState] = useState(() => {
        const extendedState = getExtendedState();
        return selector ? selector(extendedState) : extendedState;
    });

    const selectorRef = useRef(selector);
    const equalityRef = useRef(shallowCompare ? shallowEqual : strictEqual);
    const stateRef = useRef(state);
    const forceUpdateRef = useRef(0);

    selectorRef.current = selector;

    useEffect(() => {
        const updateState = () => {
            const extendedState = getExtendedState();
            const newSelectedState = selectorRef.current ? selectorRef.current(extendedState) : extendedState;

            if (!equalityRef.current(stateRef.current as any, newSelectedState as any)) {
                stateRef.current = newSelectedState as any;
                setState(newSelectedState as any);
            }
        };

        const unsubscribe = modelStore.on('change', updateState);

        const interval = setInterval(() => {
            forceUpdateRef.current += 1;
            updateState();
        }, 100);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, [modelStore, getExtendedState]);

    return state;
}

export function createItemHook<T>(modelStore: ModelStore<T>) {
    return function <R>(selector?: Selector<ModelStoreState<T>, R>, shallowCompare?: boolean): ModelStoreState<T> | R {
        return useModelStore(modelStore, selector as any, shallowCompare);
    };
}

function useListStore<T, R>(factory: ModelFactory<T>, selector?: Selector<ListState<T>, R>, shallowCompare?: boolean): ListState<T> | R {
    const [state, setState] = useState(() => {
        const listState = factory.list();
        return selector ? selector(listState) : listState;
    });

    const selectorRef = useRef(selector);
    const equalityRef = useRef(shallowCompare ? shallowEqual : strictEqual);
    const stateRef = useRef(state);
    const forceUpdateRef = useRef(0);

    selectorRef.current = selector;

    useEffect(() => {
        const updateState = () => {
            const listState = factory.list();
            const newSelectedState = selectorRef.current ? selectorRef.current(listState) : listState;

            if (!equalityRef.current(stateRef.current as any, newSelectedState as any)) {
                stateRef.current = newSelectedState as any;
                setState(newSelectedState as any);
            }
        };

        const interval = setInterval(() => {
            forceUpdateRef.current += 1;
            updateState();
        }, 100);

        updateState();

        return () => clearInterval(interval);
    }, [factory]);

    return state;
}

export function createListHook<T>(factory: ModelFactory<T>) {
    return function <R>(selector?: Selector<ListState<T>, R>, shallowCompare?: boolean): ListState<T> | R {
        return useListStore(factory, selector as any, shallowCompare);
    };
}

export function createModelHook<T>(factory: ModelFactory<T>) {
    return function <R>(id: any, selector?: Selector<ModelStoreState<T>, R>, shallowCompare?: boolean): ModelStoreState<T> | R {
        const store = factory.get(id);
        if (!store) {
            throw new Error(`Store with id ${id} not found`);
        }
        return useModelStore(store, selector as any, shallowCompare);
    };
}

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
