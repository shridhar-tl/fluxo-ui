//src\store\types.ts
export type Listener<T> = (state: T, context: ListenerContext<T>) => void | Promise<void>;
export type AsyncListener<T> = (state: T, context: ListenerContext<T>) => Promise<void>;

export interface ListenerContext<T> {
    setState: SetStateFunction<T>;
    previous?: T;
}

/*export type SetStateFunction<T> = {
    (newState: Partial<T>): void;
    (newState: Partial<T>, afterApply?: (state: T) => void): void;
    (newState: Partial<T>, replace?: boolean): void;
    (newState: Partial<T>, afterApply?: (state: T) => void, replace?: boolean): void;
    (updater: (state: T) => Partial<T>): void;
    (updater: (state: T) => Partial<T>, afterApply?: (state: T) => void): void;
    (updater: (state: T) => Partial<T>, replace?: boolean): void;
    (updater: (state: T) => Partial<T>, afterApply?: (state: T) => void, replace?: boolean): void;
};*/

export type SetStateFunction<T> = {
    (stateOrUpdater: Partial<T> | ((state: T) => Partial<T>)): void;
    (stateOrUpdater: Partial<T> | ((state: T) => Partial<T>), afterApply?: (state: T) => void): void;
    (stateOrUpdater: Partial<T> | ((state: T) => Partial<T>), replace?: boolean): void;
    (stateOrUpdater: Partial<T> | ((state: T) => Partial<T>), afterApply?: (state: T) => void, replace?: boolean): void;
};

export type PropertyPath = string;

export interface Subscription {
    unsubscribe: () => void;
}

export interface Store<T> {
    getState(includeChanges?: boolean): T;
    setState: SetStateFunction<T>;
    on(event: 'init' | 'change', listener: Listener<T>): () => void;
    on(event: 'change', properties: PropertyPath, listener: Listener<T>): () => void;
    reset(): void;
    compute<R>(propName: string, computeFn: (state: T) => R | Promise<R>, dependencies: string[]): void;
    clearComputed(propName: string): void;
    clearAllComputed(): void;
}

export interface ChangeOptions<T> {
    previous?: T;
    changes: string[];
    setState: SetStateFunction<T>;
    setError: (errors: (Partial<Record<keyof T, string | object>> & Record<string, object>) | undefined | false) => void;
}

export interface PageOptions {
    page?: number;
    count?: number;
    sortBy?: string[] | ((a: any, b: any) => -1 | 0 | 1);
    setTotalCount: (count: number) => void;
}

export type ItemLoadBehavior = 'stale' | 'swr' | 'new' | number | [number, boolean];

export interface ModelConfig<T> {
    createWithDefaults?: (id: any) => T;
    selectId?: (state: T) => any;
    nextId?: () => any;
    loadTimeout?: number;
    loadItem?: (id: any) => Promise<T>;
    itemLoadBehavior?: ItemLoadBehavior;
    loadItems?: (options: PageOptions) => Promise<T[]>;
    sortHandledBy?: 'store' | 'server';
    paginationHandledBy?: 'store' | 'server';
    onCreate?: (data: T, options: ChangeOptions<T>) => Promise<void>;
    onUpdate?: (data: T, options: ChangeOptions<T>) => Promise<void>;
    onDelete?: (data: T) => Promise<void>;
    transform?: (state: T) => Partial<T>;
    transformBehavior?: 'before_validate' | 'after_validate' | 'change' | 'save';
    persist?: boolean | 'local' | 'session' | ((store: T) => void);
    loadFromPersist?: () => T | undefined;
    validate?: (state: T) => (Partial<Record<keyof T, string | object>> & Record<string, object>) | undefined | false;
    validateBehavior?: 'change' | 'save';
    saveOnChange?: boolean;
    computedProperties?: Record<string, ComputedPropertyConfig<T>>;
}

export interface ModelStore<T> extends Store<T> {
    id: any;
    isStale: boolean;
    isLoading: boolean;
    isSaving: boolean;
    isDeleting: boolean;
    save(): Promise<void>;
    delete(): Promise<void>;
    destroy(): void;
    refresh(): Promise<void>;
}

export interface ListState<T> {
    isLoading: boolean;
    items: T[];
    page: number;
    itemsPerPage: number;
    totalCount: number;
    sortBy: string[];
}

export interface ModelFactory<T> {
    create(initialState: Partial<T>): ModelStore<T>;
    get(id: any): ModelStore<T> | undefined;
    list(options?: { itemsPerPage?: number; page?: number; sortBy?: string | string[] | ((a: T, b: T) => -1 | 0 | 1) }): ListState<T>;
}

export type Middleware<T> = (store: Store<T>) => Store<T>;

export interface ComputedPropertyConfig<T> {
    compute: (state: T) => any;
    dependencies: string[];
}

export interface BatchedSetStateCall<T> {
    stateOrUpdater: Partial<T> | ((state: T) => Partial<T>);
    afterApply?: (state: T) => void;
    replace?: boolean;
}
