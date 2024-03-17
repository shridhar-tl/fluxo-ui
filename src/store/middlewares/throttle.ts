import { Store } from '../types';

export const throttleMiddleware =
    <T>(delay: number = 100) =>
    (store: Store<T>): Store<T> => {
        let lastFireTime = 0;
        let trailingTimeout: ReturnType<typeof setTimeout> | null = null;
        let pendingChanges: Partial<T> | null = null;
        let latestAfterApply: ((state: T) => void) | undefined;
        let latestReplace: boolean | undefined;

        const originalSetState = store.setState;

        const flush = () => {
            if (pendingChanges) {
                lastFireTime = Date.now();
                originalSetState(pendingChanges, latestAfterApply, latestReplace);
                pendingChanges = null;
                latestAfterApply = undefined;
                latestReplace = undefined;
            }
        };

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

            const now = Date.now();
            const elapsed = now - lastFireTime;

            if (elapsed >= delay) {
                flush();
            } else {
                if (trailingTimeout) clearTimeout(trailingTimeout);
                trailingTimeout = setTimeout(() => {
                    flush();
                    trailingTimeout = null;
                }, delay - elapsed);
            }
        };

        return store;
    };
