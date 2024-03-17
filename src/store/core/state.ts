//src\store\core\state.ts
import { BatchedSetStateCall, Listener, ListenerContext, Middleware, SetStateFunction, Store } from '../types';

interface ComputedProperty<T, R> {
    name: string;
    computeFn: (state: T) => R | Promise<R>;
    dependencies: string[];
    cachedValue?: R;
    isStale: boolean;
    isAsync: boolean;
    isLoading: boolean;
    activePromiseId: number;
}

const getChangedPaths = (oldObj: any, newObj: any, prefix = ''): string[] => {
    const paths: string[] = [];
    const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

    for (const key of allKeys) {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        const oldVal = oldObj?.[key];
        const newVal = newObj?.[key];

        if (oldVal !== newVal) {
            paths.push(fullPath);

            if (typeof oldVal === 'object' && oldVal !== null && typeof newVal === 'object' && newVal !== null) {
                paths.push(...getChangedPaths(oldVal, newVal, fullPath));
            }
        }
    }

    return paths;
};

const matchesPropertyPath = (changePath: string, targetPath: string): boolean => {
    if (changePath === targetPath) return true;

    if (changePath.startsWith(targetPath + '.')) return true;
    if (targetPath.startsWith(changePath + '.')) return true;

    return false;
};

export function create<T extends object | Array<any>>(initializer: () => T, middlewares: Middleware<T>[] = []): Store<T> {
    let currentState = initializer();
    let batchedCalls: BatchedSetStateCall<T>[] = [];
    let isBatching = false;
    let pendingState: T | null = null;

    const initListeners = new Set<Listener<T>>();
    const changeListeners = new Map<string, Set<Listener<T>>>();
    const globalChangeListeners = new Set<Listener<T>>();
    const computedProperties = new Map<string, ComputedProperty<T, any>>();

    const setState: SetStateFunction<T> = (stateOrUpdater: any, param2?: any, param3?: any) => {
        let afterApply: ((state: T) => void) | undefined;
        let replace = false;

        if (typeof param2 === 'function') {
            afterApply = param2;
            replace = param3 || false;
        } else if (typeof param2 === 'boolean') {
            replace = param2;
        }

        batchedCalls.push({ stateOrUpdater, afterApply, replace });

        if (!isBatching) {
            isBatching = true;
            queueMicrotask(() => {
                processBatch();
            });
        }
    };

    const processBatch = () => {
        if (batchedCalls.length === 0) {
            isBatching = false;
            pendingState = null;
            return;
        }

        const previousState = currentState;
        let workingState = structuredClone(currentState);
        const allChangedPaths = new Set<string>();
        const afterCallbacks: ((state: T) => void)[] = [];

        for (const call of batchedCalls) {
            let newState: Partial<T>;

            if (typeof call.stateOrUpdater === 'function') {
                newState = call.stateOrUpdater(workingState);
            } else {
                newState = call.stateOrUpdater;
            }

            if (call.replace) {
                const changedPaths = getChangedPaths(workingState, newState as T);
                changedPaths.forEach((path) => allChangedPaths.add(path));
                workingState = newState as T;
            } else {
                const changedPaths = getChangedPaths(workingState, { ...workingState, ...newState });
                changedPaths.forEach((path) => allChangedPaths.add(path));
                Object.assign(workingState, newState);
            }

            if (call.afterApply) {
                afterCallbacks.push(call.afterApply);
            }
        }

        currentState = workingState;
        batchedCalls = [];
        isBatching = false;
        pendingState = null;

        markComputedStale(Array.from(allChangedPaths));

        if (allChangedPaths.size > 0) {
            notifyListeners('change', Array.from(allChangedPaths), previousState);
        }

        for (const callback of afterCallbacks) {
            callback(currentState);
        }
    };

    const triggerAsyncCompute = (propName: string) => {
        const computed = computedProperties.get(propName);
        if (!computed || !computed.isAsync) return;

        computed.isLoading = true;
        const promiseId = ++asyncPromiseCounter;
        computed.activePromiseId = promiseId;

        const result = computed.computeFn(currentState);
        if (result instanceof Promise) {
            result
                .then((value) => {
                    if (computed.activePromiseId !== promiseId) return;
                    computed.cachedValue = value;
                    computed.isStale = false;
                    computed.isLoading = false;
                    const previousState = structuredClone(currentState);
                    notifyListeners('change', [propName, `${propName}Loading`], previousState);
                })
                .catch((error) => {
                    if (computed.activePromiseId !== promiseId) return;
                    computed.isLoading = false;
                    console.error(`Error computing async property '${propName}':`, error);
                    const previousState = structuredClone(currentState);
                    notifyListeners('change', [`${propName}Loading`], previousState);
                });
        }
    };

    const markComputedStale = (changedPaths: string[]) => {
        for (const [propName, computed] of computedProperties) {
            if (computed.dependencies.some((dep) => changedPaths.some((changed) => matchesPropertyPath(changed, dep)))) {
                computed.isStale = true;
                if (computed.isAsync) {
                    triggerAsyncCompute(propName);
                }
            }
        }
    };

    const getState = (includeChanges = false): T => {
        let baseState = currentState;

        if (includeChanges && batchedCalls.length > 0) {
            if (!pendingState) {
                pendingState = structuredClone(currentState);

                for (const call of batchedCalls) {
                    let newState: Partial<T>;

                    if (typeof call.stateOrUpdater === 'function') {
                        newState = call.stateOrUpdater(pendingState);
                    } else {
                        newState = call.stateOrUpdater;
                    }

                    if (call.replace) {
                        pendingState = newState as T;
                    } else {
                        Object.assign(pendingState, newState);
                    }
                }
            }
            baseState = pendingState;
        }

        const result = structuredClone(baseState) as any;

        for (const [propName, computed] of computedProperties) {
            if (computed.isAsync) {
                result[propName] = computed.cachedValue;
                result[`${propName}Loading`] = computed.isLoading;
            } else {
                if (computed.isStale || computed.cachedValue === undefined) {
                    try {
                        computed.cachedValue = computed.computeFn(baseState) as any;
                        computed.isStale = false;
                    } catch (error) {
                        console.error(`Error computing property '${propName}':`, error);
                        computed.cachedValue = undefined;
                    }
                }
                result[propName] = computed.cachedValue;
            }
        }

        return result;
    };

    let cachedNotifyState: T | null = null;

    const resolveNotifyState = (): T => {
        if (!cachedNotifyState) {
            cachedNotifyState = store.getState();
        }
        return cachedNotifyState;
    };

    const notifyListeners = async (event: 'init' | 'change', changes?: string[], previous?: T) => {
        cachedNotifyState = null;

        const context: ListenerContext<T> = {
            setState,
            previous,
        };

        if (event === 'init') {
            for (const listener of initListeners) {
                try {
                    await listener(resolveNotifyState(), context);
                } catch (error) {
                    console.error('Error in init listener:', error);
                }
            }
        } else if (event === 'change') {
            for (const listener of globalChangeListeners) {
                try {
                    cachedNotifyState = null;
                    await listener(resolveNotifyState(), context);
                } catch (error) {
                    console.error('Error in change listener:', error);
                }
            }

            if (changes) {
                for (const [path, listeners] of changeListeners) {
                    const pathProperties = path.split(',').map((p) => p.trim());
                    const hasMatchingChange = pathProperties.some((prop) =>
                        changes.some((change) => matchesPropertyPath(change, prop) || matchesPropertyPath(prop, change))
                    );

                    if (hasMatchingChange) {
                        for (const listener of listeners) {
                            try {
                                await listener(resolveNotifyState(), context);
                            } catch (error) {
                                console.error('Error in property change listener:', error);
                            }
                        }
                    }
                }
            }
        }

        cachedNotifyState = null;
    };

    const on = (event: string, ...args: any[]): (() => void) => {
        if (event === 'init') {
            const listener = args[0] as Listener<T>;
            initListeners.add(listener);
            return () => initListeners.delete(listener);
        } else if (event === 'change') {
            if (args.length === 1) {
                const listener = args[0] as Listener<T>;
                globalChangeListeners.add(listener);
                return () => globalChangeListeners.delete(listener);
            } else {
                const properties = args[0] as string;
                const listener = args[1] as Listener<T>;

                if (!changeListeners.has(properties)) {
                    changeListeners.set(properties, new Set());
                }
                changeListeners.get(properties)!.add(listener);

                return () => {
                    const listeners = changeListeners.get(properties);
                    if (listeners) {
                        listeners.delete(listener);
                        if (listeners.size === 0) {
                            changeListeners.delete(properties);
                        }
                    }
                };
            }
        }
        return () => {};
    };

    const reset = () => {
        const previousState = structuredClone(currentState);
        currentState = initializer();
        batchedCalls = [];
        isBatching = false;
        pendingState = null;

        for (const [, computed] of computedProperties) {
            computed.isStale = true;
            computed.cachedValue = undefined;
        }

        const changedPaths = getChangedPaths(previousState, currentState);

        notifyListeners('init');
        notifyListeners('change', changedPaths, previousState);
    };

    let asyncPromiseCounter = 0;

    const compute = <R>(propName: string, computeFn: (state: T) => R | Promise<R>, dependencies: string[]) => {
        const testResult = computeFn(currentState);
        const isAsync = testResult instanceof Promise;

        if (isAsync) {
            testResult.catch(() => {});
        }

        computedProperties.set(propName, {
            name: propName,
            computeFn,
            dependencies,
            isStale: true,
            isAsync,
            isLoading: false,
            activePromiseId: 0,
        });

        if (isAsync) {
            triggerAsyncCompute(propName);
        }
    };

    const clearComputed = (propName: string) => {
        computedProperties.delete(propName);
    };

    const clearAllComputed = () => {
        computedProperties.clear();
    };

    let store: Store<T> = {
        getState,
        setState,
        on,
        reset,
        compute,
        clearComputed,
        clearAllComputed,
    };

    for (const middleware of middlewares) {
        store = middleware(store);
    }

    queueMicrotask(() => notifyListeners('init'));

    return store;
}
