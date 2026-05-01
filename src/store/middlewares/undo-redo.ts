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
    beginGroup: (label?: string) => void;
    endGroup: () => void;
}

export interface UndoRedoOptions {
    maxHistorySize?: number;
    paths?: string[];
    coalesceMs?: number;
    maxBytes?: number;
}

const getByPath = (obj: any, path: string): any => {
    const segments = path.split('.');
    let cur = obj;
    for (const seg of segments) {
        if (cur == null) return undefined;
        cur = cur[seg];
    }
    return cur;
};

const setByPath = (obj: any, path: string, value: any) => {
    const segments = path.split('.');
    let cur = obj;
    for (let i = 0; i < segments.length - 1; i++) {
        const seg = segments[i];
        if (cur[seg] == null || typeof cur[seg] !== 'object') cur[seg] = {};
        cur = cur[seg];
    }
    cur[segments[segments.length - 1]] = value;
};

const projectState = (state: any, paths?: string[]): any => {
    if (!paths || paths.length === 0) return JSON.parse(JSON.stringify(state));
    const out: any = {};
    for (const p of paths) {
        setByPath(out, p, getByPath(state, p));
    }
    return JSON.parse(JSON.stringify(out));
};

const mergeProjection = (current: any, projection: any, paths?: string[]): any => {
    if (!paths || paths.length === 0) return projection;
    const merged = JSON.parse(JSON.stringify(current));
    for (const p of paths) {
        setByPath(merged, p, getByPath(projection, p));
    }
    return merged;
};

const byteLengthOf = (value: any): number => {
    try {
        return JSON.stringify(value).length;
    } catch {
        return 0;
    }
};

export function undoRedoMiddleware<T>(options: UndoRedoOptions = {}) {
    const opts = options;
    const maxHistorySize = opts.maxHistorySize ?? 50;
    const paths = opts.paths;
    const coalesceMs = opts.coalesceMs ?? 0;
    const maxBytes = opts.maxBytes ?? 0;

    return (store: Store<T>): UndoRedoStore<T> => {
        let history: any[] = [];
        let currentIndex = -1;
        let totalBytes = 0;
        let isUndoRedo = false;
        let _canUndo = false;
        let _canRedo = false;
        let lastSaveTime = 0;
        let groupDepth = 0;

        const updateFlags = () => {
            _canUndo = currentIndex > 0;
            _canRedo = currentIndex < history.length - 1;
        };

        const evictByCount = () => {
            while (history.length > maxHistorySize) {
                const removed = history.shift();
                totalBytes -= byteLengthOf(removed);
                currentIndex = Math.max(currentIndex - 1, 0);
            }
        };

        const evictByBytes = () => {
            if (maxBytes <= 0) return;
            while (totalBytes > maxBytes && history.length > 1) {
                const removed = history.shift();
                totalBytes -= byteLengthOf(removed);
                currentIndex = Math.max(currentIndex - 1, 0);
            }
        };

        const replaceTop = (snapshot: any) => {
            if (currentIndex < 0) return;
            const old = history[currentIndex];
            totalBytes -= byteLengthOf(old);
            history[currentIndex] = snapshot;
            totalBytes += byteLengthOf(snapshot);
            evictByBytes();
        };

        const pushSnapshot = (snapshot: any) => {
            history = history.slice(0, currentIndex + 1);
            history.push(snapshot);
            totalBytes += byteLengthOf(snapshot);
            currentIndex++;
            evictByCount();
            evictByBytes();
            updateFlags();
        };

        const saveToHistory = (state: T) => {
            if (isUndoRedo) return;
            const snapshot = projectState(state, paths);
            const now = Date.now();

            if (groupDepth > 0 && currentIndex >= 0) {
                replaceTop(snapshot);
                updateFlags();
                lastSaveTime = now;
                return;
            }

            if (
                coalesceMs > 0 &&
                currentIndex >= 0 &&
                now - lastSaveTime < coalesceMs &&
                history.length > 1
            ) {
                replaceTop(snapshot);
                updateFlags();
                lastSaveTime = now;
                return;
            }

            pushSnapshot(snapshot);
            lastSaveTime = now;
        };

        store.on('init', saveToHistory);
        store.on('change', saveToHistory);

        const apply = (snapshot: any) => {
            isUndoRedo = true;
            updateFlags();
            const next = paths && paths.length ? mergeProjection(store.getState(), snapshot, paths) : snapshot;
            store.setState(
                next,
                () => {
                    isUndoRedo = false;
                },
                true
            );
        };

        const undo = () => {
            if (currentIndex > 0) {
                currentIndex--;
                apply(history[currentIndex]);
            }
        };

        const redo = () => {
            if (currentIndex < history.length - 1) {
                currentIndex++;
                apply(history[currentIndex]);
            }
        };

        const clearHistory = () => {
            history = [];
            currentIndex = -1;
            totalBytes = 0;
            updateFlags();
        };

        const beginGroup = () => {
            groupDepth++;
        };

        const endGroup = () => {
            if (groupDepth > 0) groupDepth--;
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
            beginGroup,
            endGroup,
        };
    };
}
