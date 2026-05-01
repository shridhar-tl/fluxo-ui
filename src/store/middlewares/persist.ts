import { Store } from '../types';

export interface AsyncStorageAdapter {
    getItem(key: string): Promise<string | null> | string | null;
    setItem(key: string, value: string): Promise<void> | void;
    removeItem(key: string): Promise<void> | void;
}

export type PersistStorageOption = 'local' | 'session' | Storage | AsyncStorageAdapter;

export interface PersistMigration<T = any> {
    (oldState: any, oldVersion: number): T;
}

export interface PersistOptions<T> {
    storage?: PersistStorageOption;
    key?: string;
    include?: Array<keyof T | string>;
    exclude?: Array<keyof T | string>;
    version?: number;
    migrate?: PersistMigration<T>;
    debounceMs?: number;
    serialize?: (state: any) => string;
    deserialize?: (raw: string) => any;
    onError?: (error: unknown, phase: 'load' | 'save' | 'migrate') => void;
}

interface StoredEnvelope {
    __v?: number;
    state: any;
}

const isNativeStorage = (s: any): s is Storage =>
    typeof s === 'object' && s !== null && typeof s.getItem === 'function' && typeof s.length === 'number' && typeof s.key === 'function';

const resolveStorage = (opt: PersistStorageOption): AsyncStorageAdapter => {
    if (typeof opt === 'string') {
        const native = opt === 'local' ? localStorage : sessionStorage;
        return {
            getItem: (k) => native.getItem(k),
            setItem: (k, v) => native.setItem(k, v),
            removeItem: (k) => native.removeItem(k),
        };
    }
    if (isNativeStorage(opt)) {
        return {
            getItem: (k) => opt.getItem(k),
            setItem: (k, v) => opt.setItem(k, v),
            removeItem: (k) => opt.removeItem(k),
        };
    }
    return opt as AsyncStorageAdapter;
};

const pickByPaths = (state: any, paths: Array<string>, mode: 'include' | 'exclude'): any => {
    if (!state || typeof state !== 'object') return state;

    if (mode === 'include') {
        const out: any = Array.isArray(state) ? [] : {};
        for (const path of paths) {
            const segments = String(path).split('.');
            let src = state;
            let dst = out;
            for (let i = 0; i < segments.length; i++) {
                const seg = segments[i];
                if (src === undefined || src === null) break;
                if (i === segments.length - 1) {
                    dst[seg] = src[seg];
                } else {
                    if (dst[seg] === undefined) dst[seg] = {};
                    dst = dst[seg];
                    src = src[seg];
                }
            }
        }
        return out;
    }

    const cloned = JSON.parse(JSON.stringify(state));
    for (const path of paths) {
        const segments = String(path).split('.');
        let cur = cloned;
        for (let i = 0; i < segments.length - 1; i++) {
            if (cur === undefined || cur === null) break;
            cur = cur[segments[i]];
        }
        if (cur && typeof cur === 'object') {
            delete cur[segments[segments.length - 1]];
        }
    }
    return cloned;
};

export function persistMiddleware<T>(opts: PersistOptions<T> = {}) {
    return (store: Store<T>): Store<T> => {
        const adapter = resolveStorage(opts.storage ?? 'local');
        const key = opts.key ?? 'fluxo-store';
        const include = opts.include?.map(String);
        const exclude = opts.exclude?.map(String);
        const targetVersion = opts.version ?? 0;
        const debounceMs = opts.debounceMs ?? 0;
        const serialize = opts.serialize ?? JSON.stringify;
        const deserialize = opts.deserialize ?? JSON.parse;
        const onError = opts.onError ?? ((err, phase) => console.error(`persistMiddleware [${phase}]:`, err));

        const filterState = (state: any): any => {
            if (include && include.length) return pickByPaths(state, include, 'include');
            if (exclude && exclude.length) return pickByPaths(state, exclude, 'exclude');
            return state;
        };

        const loadAndApply = async () => {
            try {
                const raw = await adapter.getItem(key);
                if (raw == null) return;
                const parsed = deserialize(raw) as StoredEnvelope;
                const storedVersion = typeof parsed?.__v === 'number' ? parsed.__v : 0;
                let nextState = parsed?.state ?? parsed;

                if (storedVersion !== targetVersion) {
                    if (opts.migrate) {
                        try {
                            nextState = opts.migrate(nextState, storedVersion);
                        } catch (err) {
                            onError(err, 'migrate');
                            return;
                        }
                    } else {
                        return;
                    }
                }
                store.setState((current) => ({ ...(current as any), ...nextState }) as Partial<T>);
            } catch (err) {
                onError(err, 'load');
            }
        };

        void loadAndApply();

        let writeTimer: ReturnType<typeof setTimeout> | null = null;
        let lastSerialized: string | null = null;

        const persist = (state: T) => {
            try {
                const filtered = filterState(state);
                const envelope: StoredEnvelope = { __v: targetVersion, state: filtered };
                const serialized = serialize(envelope);
                if (serialized === lastSerialized) return;
                lastSerialized = serialized;
                const result = adapter.setItem(key, serialized);
                if (result instanceof Promise) result.catch((e) => onError(e, 'save'));
            } catch (err) {
                onError(err, 'save');
            }
        };

        store.on('change', (state) => {
            if (debounceMs > 0) {
                if (writeTimer) clearTimeout(writeTimer);
                writeTimer = setTimeout(() => {
                    persist(state);
                    writeTimer = null;
                }, debounceMs);
            } else {
                persist(state);
            }
        });

        return store;
    };
}

