import { Store } from '../types';

export interface UndoRedoStateProps {
    canUndo: boolean;
    canRedo: boolean;
}

export interface UndoRedoStore<T> extends Store<T> {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    clearHistory: () => void;
}

export const undoRedoMiddleware =
    <T>(maxHistorySize: number = 50) =>
    (store: Store<T>): UndoRedoStore<T> => {
        let history: T[] = [];
        let currentIndex = -1;
        let isUndoRedo = false;
        let _canUndo = false;
        let _canRedo = false;

        const updateFlags = () => {
            _canUndo = currentIndex > 0;
            _canRedo = currentIndex < history.length - 1;
        };

        const saveToHistory = (state: T) => {
            if (isUndoRedo) return;

            history = history.slice(0, currentIndex + 1);
            history.push(JSON.parse(JSON.stringify(state)));

            if (history.length > maxHistorySize) {
                history = history.slice(1);
            } else {
                currentIndex++;
            }

            updateFlags();
        };

        store.on('init', saveToHistory);
        store.on('change', saveToHistory);

        const undo = () => {
            if (currentIndex > 0) {
                currentIndex--;
                isUndoRedo = true;
                updateFlags();
                store.setState(
                    history[currentIndex],
                    () => {
                        isUndoRedo = false;
                    },
                    true
                );
            }
        };

        const redo = () => {
            if (currentIndex < history.length - 1) {
                currentIndex++;
                isUndoRedo = true;
                updateFlags();
                store.setState(
                    history[currentIndex],
                    () => {
                        isUndoRedo = false;
                    },
                    true
                );
            }
        };

        const clearHistory = () => {
            history = [];
            currentIndex = -1;
            updateFlags();
        };

        const originalGetState = store.getState;
        store.getState = (includeChanges?: boolean) => {
            const state = originalGetState(includeChanges);
            const result = state as any;
            result.canUndo = _canUndo;
            result.canRedo = _canRedo;
            return result;
        };

        return {
            ...store,
            undo,
            redo,
            get canUndo() {
                return _canUndo;
            },
            get canRedo() {
                return _canRedo;
            },
            clearHistory,
        };
    };
