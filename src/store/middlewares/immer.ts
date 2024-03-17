import { SetStateFunction, Store } from '../types';

export const immerMiddleware = <T>(store: Store<T>): Store<T> => {
    // This would require immer to be installed
    // import { produce } from 'immer';

    const originalSetState = store.setState;

    const setState: SetStateFunction<T> = (stateOrUpdater: any, afterApplyOrReplace?: any, replace?: boolean) => {
        if (typeof stateOrUpdater === 'function') {
            const updater = (currentState: T) => {
                // return produce(currentState, stateOrUpdater);
                return stateOrUpdater(currentState); // Fallback without immer
            };
            return originalSetState(updater, afterApplyOrReplace, replace!);
        }

        return originalSetState(stateOrUpdater, afterApplyOrReplace, replace!);
    };

    return {
        ...store,
        setState,
    };
};
