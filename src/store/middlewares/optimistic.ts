import { SetStateFunction, Store } from '../types';

export interface OptimisticOptions<T> {
    commit: (nextState: T, prevState: T) => Promise<void> | void;
    onRollback?: (prevState: T, nextState: T, error: unknown) => void;
    onCommit?: (committedState: T) => void;
    rollbackStrategy?: 'snapshot' | 'replay';
}

export interface OptimisticStore<T> extends Store<T> {
    optimistic: SetStateFunction<T>;
    isPending: () => boolean;
    pendingCount: () => number;
}

export function optimisticMiddleware<T>(options: OptimisticOptions<T>) {
    return (store: Store<T>): OptimisticStore<T> => {
        let pending = 0;
        const strategy = options.rollbackStrategy ?? 'snapshot';

        const optimistic: SetStateFunction<T> = (stateOrUpdater: any, param2?: any, param3?: any) => {
            const previousSnapshot = strategy === 'snapshot' ? structuredClone(store.getState()) : null;

            let afterApply: ((state: T) => void) | undefined;
            let replace = false;
            if (typeof param2 === 'function') {
                afterApply = param2;
                replace = param3 === true;
            } else if (typeof param2 === 'boolean') {
                replace = param2;
            }

            pending++;

            store.setState(
                stateOrUpdater,
                (committedState: T) => {
                    afterApply?.(committedState);
                    const prev = previousSnapshot ?? committedState;
                    Promise.resolve()
                        .then(() => options.commit(committedState, prev as T))
                        .then(() => {
                            options.onCommit?.(committedState);
                        })
                        .catch((error) => {
                            if (strategy === 'snapshot' && previousSnapshot) {
                                store.setState(previousSnapshot as any, true);
                            }
                            options.onRollback?.(prev as T, committedState, error);
                        })
                        .finally(() => {
                            pending--;
                        });
                },
                replace
            );
        };

        return {
            ...store,
            optimistic,
            isPending: () => pending > 0,
            pendingCount: () => pending,
        };
    };
}
