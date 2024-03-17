import { Store } from '../types';

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
