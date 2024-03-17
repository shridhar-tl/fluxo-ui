import { Store } from '../types';

export const devToolsMiddleware = <T>(store: Store<T>): Store<T> => {
    if (typeof window !== 'undefined' && (window as any).__ETHER_DEVTOOLS__) {
        const devTools = (window as any).__ETHER_DEVTOOLS__;

        const originalSetState = store.setState;

        store.setState = (stateOrUpdater: any, afterApplyOrReplace?: any, replace?: boolean) => {
            const prevState = store.getState();
            const result = originalSetState(stateOrUpdater, afterApplyOrReplace, replace!);
            const nextState = store.getState();

            devTools.send({
                type: 'STATE_CHANGE',
                payload: { prevState, nextState },
            });

            return result;
        };

        store.on('init', (state) => {
            devTools.send({
                type: 'INIT',
                payload: { state },
            });
        });

        store.on('change', (state, { previous }) => {
            devTools.send({
                type: 'CHANGE',
                payload: { state, previous },
            });
        });
    }

    return store;
};

// Persistence middleware
export const persistMiddleware =
    <T>(storage: 'local' | 'session' | Storage = 'local', key: string = 'fluxo-store') =>
    (store: Store<T>): Store<T> => {
        const storageObj = typeof storage === 'string' ? (storage === 'local' ? localStorage : sessionStorage) : storage;

        try {
            const saved = storageObj.getItem(key);
            if (saved) {
                const parsedState = JSON.parse(saved);
                store.setState(parsedState, true);
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
        }

        store.on('change', (state) => {
            try {
                storageObj.setItem(key, JSON.stringify(state));
            } catch (error) {
                console.error('Error saving to storage:', error);
            }
        });

        return store;
    };

// Logger middleware for debugging
export const loggerMiddleware =
    <T>(predicate?: (state: T, previous?: T) => boolean) =>
    (store: Store<T>): Store<T> => {
        store.on('init', (state) => {
            if (!predicate || predicate(state)) {
                console.group('🚀 Store Initialized');
                console.log('State:', state);
                console.groupEnd();
            }
        });

        store.on('change', (state, { previous }) => {
            if (!predicate || predicate(state, previous)) {
                console.group('🔄 State Changed');
                console.log('Previous:', previous);
                console.log('Current:', state);
                console.groupEnd();
            }
        });

        return store;
    };
