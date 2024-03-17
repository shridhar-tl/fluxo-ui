import { Store } from '../types';

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
