import { Listener, Middleware, PropertyPath, SetStateFunction, Store } from '../types';
import { create } from './state';

const SLICE_BRAND = Symbol('fluxo-ui/slice');
const PARENT_BRAND = Symbol('fluxo-ui/combined');

export interface Slice<T> extends Store<T> {
    readonly sliceName: string;
}

interface InternalSlice<T> extends Slice<T> {
    __adopt(parent: Store<any>, name: string): void;
    __getSeed(): T;
}

interface PendingListenerEntry<T> {
    standaloneUnsub: (() => void) | null;
    parentUnsub: (() => void) | null;
    listener: Listener<T>;
    path?: string;
    isGlobal: boolean;
}

type SlicesShape = Record<string, Slice<any>>;

type CombinedState<S extends SlicesShape> = {
    [K in keyof S]: S[K] extends Slice<infer U> ? U : never;
};

export interface CombinedStore<S extends SlicesShape> extends Store<CombinedState<S>> {
    readonly slices: S;
}

export function createSlice<T extends object | Array<any>>(name: string, initializer: () => T, middlewares: Middleware<T>[] = []): Slice<T> {
    if (!name || typeof name !== 'string') {
        throw new Error('createSlice: name must be a non-empty string');
    }
    if (name.includes('.') || name.includes(',')) {
        throw new Error(`createSlice: name "${name}" must not contain '.' or ',' characters`);
    }

    const standaloneStore = create<T>(initializer, middlewares);

    let parent: Store<any> | null = null;
    let parentName = '';

    const activeListeners = new Set<PendingListenerEntry<T>>();

    let cachedLocalState: T | null = null;
    let cacheValid = false;

    const getLocal = (): T => {
        if (!parent) return standaloneStore.getState();
        if (cacheValid && cachedLocalState !== null) return cachedLocalState;
        const full = parent.getState();
        cachedLocalState = (full as any)[parentName] as T;
        cacheValid = true;
        return cachedLocalState;
    };

    const wrapListener = (listener: Listener<T>): Listener<any> => {
        return async (_fullState, ctx) => {
            cacheValid = false;
            await listener(getLocal(), {
                setState: setState as any,
                previous: ctx.previous ? (ctx.previous as any)[parentName] : undefined,
            });
        };
    };

    const subscribeOnParent = (entry: PendingListenerEntry<T>) => {
        const wrapped = wrapListener(entry.listener);
        if (entry.isGlobal) {
            entry.parentUnsub = parent!.on('change', parentName, wrapped);
        } else {
            const fullPath = entry.path!.split(',').map((p) => `${parentName}.${p.trim()}`).join(',');
            entry.parentUnsub = parent!.on('change', fullPath, wrapped);
        }
    };

    const setState: SetStateFunction<T> = ((stateOrUpdater: any, param2?: any, param3?: any) => {
        if (!parent) {
            standaloneStore.setState(stateOrUpdater, param2, param3);
            return;
        }

        let afterApply: ((state: T) => void) | undefined;
        let replace = false;

        if (typeof param2 === 'function') {
            afterApply = param2;
            replace = param3 === true;
        } else if (typeof param2 === 'boolean') {
            replace = param2;
        }

        const wrappedUpdater = (fullState: any) => {
            const sliceState = fullState[parentName];
            const patch = typeof stateOrUpdater === 'function' ? stateOrUpdater(sliceState) : stateOrUpdater;
            if (replace) {
                return { [parentName]: patch };
            }
            return { [parentName]: { ...sliceState, ...patch } };
        };

        if (afterApply) {
            const wrappedAfter = (full: any) => afterApply!(full[parentName]);
            parent.setState(wrappedUpdater as any, wrappedAfter as any);
        } else {
            parent.setState(wrappedUpdater as any);
        }
    }) as SetStateFunction<T>;

    const getState = (includeChanges?: boolean): T => {
        if (!parent) return standaloneStore.getState(includeChanges);
        if (includeChanges) {
            const full = parent.getState(true);
            return (full as any)[parentName] as T;
        }
        return getLocal();
    };

    const registerChangeListener = (entry: PendingListenerEntry<T>): (() => void) => {
        activeListeners.add(entry);

        if (parent) {
            subscribeOnParent(entry);
        } else {
            entry.standaloneUnsub = entry.isGlobal
                ? standaloneStore.on('change', entry.listener)
                : standaloneStore.on('change', entry.path!, entry.listener);
        }

        return () => {
            activeListeners.delete(entry);
            entry.standaloneUnsub?.();
            entry.parentUnsub?.();
            entry.standaloneUnsub = null;
            entry.parentUnsub = null;
        };
    };

    const on = (event: any, ...args: any[]): (() => void) => {
        if (event === 'init') {
            return standaloneStore.on('init', args[0]);
        }
        if (event === 'change') {
            if (args.length === 1) {
                return registerChangeListener({
                    listener: args[0] as Listener<T>,
                    isGlobal: true,
                    standaloneUnsub: null,
                    parentUnsub: null,
                });
            }
            return registerChangeListener({
                listener: args[1] as Listener<T>,
                path: args[0] as PropertyPath,
                isGlobal: false,
                standaloneUnsub: null,
                parentUnsub: null,
            });
        }
        return () => {};
    };

    const reset = () => {
        if (!parent) {
            standaloneStore.reset();
            return;
        }
        const fresh = initializer();
        (setState as any)(fresh, true);
    };

    const compute = <R>(propName: string, computeFn: (state: T) => R | Promise<R>, dependencies: string[]) => {
        if (!parent) {
            standaloneStore.compute(propName, computeFn, dependencies);
            return;
        }
        const fullDeps = dependencies.map((d) => `${parentName}.${d}`);
        parent.compute(propName, (full: any) => computeFn(full[parentName] as T), fullDeps);
    };

    const clearComputed = (propName: string) => {
        if (!parent) {
            standaloneStore.clearComputed(propName);
            return;
        }
        parent.clearComputed(propName);
    };

    const clearAllComputed = () => {
        if (!parent) {
            standaloneStore.clearAllComputed();
            return;
        }
        parent.clearAllComputed();
    };

    const slice: InternalSlice<T> = {
        getState,
        setState,
        on,
        reset,
        compute,
        clearComputed,
        clearAllComputed,
        sliceName: name,
        __getSeed() {
            return standaloneStore.getState();
        },
        __adopt(p: Store<any>, adoptedName: string) {
            if (parent) {
                throw new Error(`Slice "${name}" is already adopted by a combined store. A slice can only be adopted once.`);
            }
            parent = p;
            parentName = adoptedName;
            cacheValid = false;

            for (const entry of activeListeners) {
                entry.standaloneUnsub?.();
                entry.standaloneUnsub = null;
                subscribeOnParent(entry);
            }

            const bumpers = (p as any).__sliceTickBumpers as Array<() => void> | undefined;
            const bumpFn = () => {
                cacheValid = false;
            };
            if (bumpers) {
                bumpers.push(bumpFn);
            } else {
                (p as any).__sliceTickBumpers = [bumpFn];
            }
        },
    };

    Object.defineProperty(slice, SLICE_BRAND, { value: true, enumerable: false });

    return slice;
}

export function combineSlices<S extends SlicesShape>(slices: S, middlewares: Middleware<CombinedState<S>>[] = []): CombinedStore<S> {
    const sliceEntries = Object.entries(slices) as [string, InternalSlice<any>][];

    for (const [key, s] of sliceEntries) {
        if (!(s as any)[SLICE_BRAND]) {
            throw new Error(`combineSlices: value at key "${key}" is not a Slice produced by createSlice()`);
        }
    }

    const initial = () => {
        const state: any = {};
        for (const [key, s] of sliceEntries) state[key] = s.__getSeed();
        return state as CombinedState<S>;
    };

    const parent = create<CombinedState<S>>(initial, middlewares);

    Object.defineProperty(parent, PARENT_BRAND, { value: true, enumerable: false });

    parent.on('change', () => {
        const bumpers = (parent as any).__sliceTickBumpers as Array<() => void> | undefined;
        if (bumpers) for (const fn of bumpers) fn();
    });

    for (const [key, s] of sliceEntries) s.__adopt(parent, key);

    const combined = parent as unknown as CombinedStore<S>;
    (combined as any).slices = slices;
    return combined;
}

export function isSlice<T = any>(value: unknown): value is Slice<T> {
    return !!(value && typeof value === 'object' && (value as any)[SLICE_BRAND] === true);
}

export function isCombinedStore<S extends SlicesShape = SlicesShape>(value: unknown): value is CombinedStore<S> {
    return !!(value && typeof value === 'object' && (value as any)[PARENT_BRAND] === true);
}
