import { Store } from '../types';

export const validationMiddleware =
    <T>(validator: (state: T) => Record<string, string> | undefined, onValidationError?: (errors: Record<string, string>) => void) =>
    (store: Store<T>): Store<T> => {
        const originalSetState = store.setState;

        store.setState = (stateOrUpdater: any, afterApplyOrReplace?: any, replace?: boolean) => {
            const tempState =
                typeof stateOrUpdater === 'function'
                    ? { ...store.getState(), ...stateOrUpdater(store.getState()) }
                    : { ...store.getState(), ...stateOrUpdater };

            const errors = validator(tempState);
            if (errors && Object.keys(errors).length > 0) {
                if (onValidationError) {
                    onValidationError(errors);
                }
                return;
            }

            return originalSetState(stateOrUpdater, afterApplyOrReplace, replace!);
        };

        return store;
    };
