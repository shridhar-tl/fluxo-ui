import { Store } from '../types';

export const debounceMiddleware =
    <T>(delay: number = 300) =>
    (store: Store<T>): Store<T> => {
        let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
        let pendingChanges: Partial<T> | null = null;
        let latestAfterApply: ((state: T) => void) | undefined;
        let latestReplace: boolean | undefined;

        const originalSetState = store.setState;

        store.setState = (stateOrUpdater: any, param2?: any, param3?: any) => {
            const changes = typeof stateOrUpdater === 'function' ? stateOrUpdater(store.getState()) : stateOrUpdater;

            let afterApply: ((state: T) => void) | undefined;
            let replace = false;
            if (typeof param2 === 'function') {
                afterApply = param2;
                replace = param3 || false;
            } else if (typeof param2 === 'boolean') {
                replace = param2;
            }

            if (replace) {
                pendingChanges = changes;
            } else {
                pendingChanges = pendingChanges ? { ...pendingChanges, ...changes } : changes;
            }
            latestAfterApply = afterApply;
            latestReplace = replace;

            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }

            debounceTimeout = setTimeout(() => {
                if (pendingChanges) {
                    originalSetState(pendingChanges, latestAfterApply, latestReplace);
                    pendingChanges = null;
                    latestAfterApply = undefined;
                    latestReplace = undefined;
                }
                debounceTimeout = null;
            }, delay);
        };

        return store;
    };
