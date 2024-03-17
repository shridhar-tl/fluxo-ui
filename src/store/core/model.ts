import { ChangeOptions, ListState, ModelConfig, ModelFactory, ModelStore, PageOptions } from '../types';
import { create } from './state';

export function createModel<T extends object | Array<any>>(config: ModelConfig<T>): ModelFactory<T> {
    const stores = new Map<any, ModelStore<T>>();
    const loadingPromises = new Map<any, Promise<T>>();
    let listState: ListState<T> = {
        isLoading: false,
        items: [],
        page: 1,
        itemsPerPage: 10,
        totalCount: 0,
        sortBy: [],
    };
    let listLoading = false;

    const getItemId = (item: T): any => {
        if (config.selectId) {
            return config.selectId(item);
        }
        return (item as any).id || config.nextId?.();
    };

    const loadFromPersist = (): T | undefined => {
        if (config.loadFromPersist) {
            return config.loadFromPersist();
        }

        if (config.persist === 'local' || config.persist === true) {
            try {
                const stored = localStorage.getItem('model-store');
                return stored ? JSON.parse(stored) : undefined;
            } catch {
                return;
            }
        }

        if (config.persist === 'session') {
            try {
                const stored = sessionStorage.getItem('model-store');
                return stored ? JSON.parse(stored) : undefined;
            } catch {
                return;
            }
        }

        return;
    };

    const persistData = (data: T) => {
        if (typeof config.persist === 'function') {
            config.persist(data);
        } else if (config.persist === 'local' || config.persist === true) {
            try {
                localStorage.setItem('model-store', JSON.stringify(data));
            } catch (error) {
                console.error('Failed to persist to localStorage:', error);
            }
        } else if (config.persist === 'session') {
            try {
                sessionStorage.setItem('model-store', JSON.stringify(data));
            } catch (error) {
                console.error('Failed to persist to sessionStorage:', error);
            }
        }
    };

    const createStore = (initialState: Partial<T>, id?: any): ModelStore<T> => {
        const storeId = id || getItemId(initialState as T) || config.nextId?.();
        let errors: (Partial<Record<keyof T, string | object>> & Record<string, object>) | undefined = {};

        const defaultState = config.createWithDefaults?.(storeId) || ({} as T);
        const persistedState = loadFromPersist() || undefined;
        const fullInitialState = { ...defaultState, ...persistedState, ...initialState } as T;

        const store = create(() => fullInitialState);

        if (config.computedProperties) {
            for (const [propName, propConfig] of Object.entries(config.computedProperties)) {
                store.compute(propName, propConfig.compute, propConfig.dependencies);
            }
        }

        const setError = (newErrors: (Partial<Record<keyof T, string | object>> & Record<string, object>) | undefined | false) => {
            if (!newErrors) {
                errors = undefined;
            } else {
                errors = { ...newErrors };
            }
        };

        const validate = (): boolean => {
            if (!config.validate) return true;

            const validationResult = config.validate(store.getState());
            if (validationResult) {
                errors = validationResult;
                return false;
            }
            errors = {};
            return true;
        };

        const applyTransform = (state: T): T => {
            if (!config.transform) return state;
            return { ...state, ...config.transform(state) };
        };

        const save = async (): Promise<void> => {
            const modelStore = stores.get(storeId) as ModelStore<T>;
            if (!modelStore || modelStore.isSaving) return;

            (modelStore as any)._isSaving = true;

            try {
                let currentState = store.getState();

                if (config.transformBehavior === 'before_validate') {
                    currentState = applyTransform(currentState);
                    store.setState(currentState, true);
                }

                if (config.validateBehavior === 'save' && !validate()) {
                    throw new Error('Validation failed: ' + JSON.stringify(errors));
                }

                if (config.transformBehavior === 'after_validate') {
                    currentState = applyTransform(currentState);
                    store.setState(currentState, true);
                }

                if (config.transformBehavior === 'save') {
                    currentState = applyTransform(currentState);
                    store.setState(currentState, true);
                }

                const finalState = store.getState();
                const changeOptions: ChangeOptions<T> = {
                    changes: Object.keys(finalState),
                    setState: store.setState,
                    setError,
                };

                const hasId = getItemId(finalState);
                if (hasId && config.onUpdate) {
                    await config.onUpdate(finalState, changeOptions);
                } else if (config.onCreate) {
                    await config.onCreate(finalState, changeOptions);
                }

                (modelStore as any)._isStale = false;

                if (config.persist) {
                    persistData(finalState);
                }
            } finally {
                (modelStore as any)._isSaving = false;
            }
        };

        const deleteItem = async (): Promise<void> => {
            const modelStore = stores.get(storeId) as ModelStore<T>;
            if (!modelStore || modelStore.isDeleting || !config.onDelete) {
                throw new Error('Delete operation not supported');
            }

            (modelStore as any)._isDeleting = true;
            try {
                await config.onDelete(store.getState());
                destroy();
            } finally {
                (modelStore as any)._isDeleting = false;
            }
        };

        const destroy = () => {
            stores.delete(storeId);
        };

        const refresh = async (): Promise<void> => {
            if (!config.loadItem) return;

            const modelStore = stores.get(storeId) as ModelStore<T>;
            if (!modelStore) return;

            (modelStore as any)._isLoading = true;
            try {
                const freshData = await config.loadItem(storeId);
                store.setState(freshData, true);
                (modelStore as any)._isStale = false;
            } finally {
                (modelStore as any)._isLoading = false;
            }
        };

        if (config.saveOnChange) {
            let saveTimeout: any;
            store.on('change', () => {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    save().catch(console.error);
                }, 500);
            });
        }

        if (config.validateBehavior === 'change') {
            store.on('change', () => {
                validate();
            });
        }

        if (config.transformBehavior === 'change') {
            store.on('change', (state) => {
                const transformed = applyTransform(state);
                if (JSON.stringify(transformed) !== JSON.stringify(state)) {
                    store.setState(transformed, true);
                }
            });
        }

        const modelStore: ModelStore<T> = {
            ...store,
            id: storeId,
            get isStale() {
                return (this as any)._isStale !== undefined ? (this as any)._isStale : true;
            },
            get isLoading() {
                return (this as any)._isLoading || false;
            },
            get isSaving() {
                return (this as any)._isSaving || false;
            },
            get isDeleting() {
                return (this as any)._isDeleting || false;
            },
            save,
            delete: deleteItem,
            destroy,
            refresh,
        };

        (modelStore as any)._isStale = true;
        (modelStore as any)._isLoading = false;
        (modelStore as any)._isSaving = false;
        (modelStore as any)._isDeleting = false;

        return modelStore;
    };

    const shouldFetchFromServer = (behavior: typeof config.itemLoadBehavior): boolean => {
        if (!behavior || behavior === 'stale') return false;
        if (behavior === 'new') return true;
        if (behavior === 'swr') return true;
        if (typeof behavior === 'number') return true;
        if (Array.isArray(behavior)) return true;
        return false;
    };

    const factory: ModelFactory<T> = {
        create(initialState: Partial<T>): ModelStore<T> {
            const store = createStore(initialState);
            stores.set(store.id, store);
            return store;
        },

        get(id: any): ModelStore<T> | undefined {
            let store = stores.get(id);

            if (!store && config.loadItem) {
                store = createStore({}, id);
                stores.set(id, store);

                const shouldLoad = shouldFetchFromServer(config.itemLoadBehavior);

                if (shouldLoad) {
                    if (!loadingPromises.has(id)) {
                        (store as any)._isLoading = true;

                        const timeoutMs = config.loadTimeout || 5000;
                        const loadPromise = Promise.race([
                            config.loadItem(id),
                            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Load timeout')), timeoutMs)),
                        ]);

                        const handleLoad = loadPromise
                            .then((data) => {
                                if (stores.has(id)) {
                                    const existingStore = stores.get(id)!;
                                    existingStore.setState(data, true);
                                    (existingStore as any)._isStale = false;
                                    (existingStore as any)._isLoading = false;
                                }
                                loadingPromises.delete(id);
                                return data;
                            })
                            .catch((error) => {
                                if (stores.has(id)) {
                                    (stores.get(id)! as any)._isLoading = false;
                                }
                                loadingPromises.delete(id);
                                console.error('Failed to load item:', error);
                                throw error;
                            });

                        loadingPromises.set(id, handleLoad);
                    }
                }
            } else if (!store) {
                store = createStore({}, id);
                stores.set(id, store);
            }

            return store;
        },

        list(options = {}): ListState<T> {
            const { itemsPerPage = 10, page = 1, sortBy } = options;

            if (config.loadItems) {
                if (config.paginationHandledBy === 'server' || config.sortHandledBy === 'server') {
                    if (!listLoading) {
                        listLoading = true;
                        listState.isLoading = true;

                        const sortArray = typeof sortBy === 'function' ? [] : Array.isArray(sortBy) ? sortBy : sortBy ? [sortBy] : [];

                        const pageOptions: PageOptions = {
                            page,
                            count: itemsPerPage,
                            sortBy: sortArray,
                            setTotalCount: (count) => {
                                listState.totalCount = count;
                            },
                        };

                        config
                            .loadItems(pageOptions)
                            .then((items) => {
                                listState = {
                                    ...listState,
                                    items,
                                    page,
                                    itemsPerPage,
                                    sortBy: sortArray,
                                    isLoading: false,
                                };
                                listLoading = false;
                            })
                            .catch((error) => {
                                listState.isLoading = false;
                                listLoading = false;
                                console.error('Failed to load items:', error);
                            });
                    }
                } else {
                    let items = Array.from(stores.values()).map((store) => store.getState());

                    if (typeof sortBy === 'function') {
                        items.sort(sortBy);
                    } else if (sortBy) {
                        const sortFields = Array.isArray(sortBy) ? sortBy : [sortBy];
                        items.sort((a, b) => {
                            for (const field of sortFields) {
                                const aVal = (a as any)[field];
                                const bVal = (b as any)[field];
                                if (aVal < bVal) return -1;
                                if (aVal > bVal) return 1;
                            }
                            return 0;
                        });
                    }

                    const startIndex = (page - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedItems = items.slice(startIndex, endIndex);

                    listState = {
                        isLoading: false,
                        items: paginatedItems,
                        page,
                        itemsPerPage,
                        totalCount: items.length,
                        sortBy: Array.isArray(sortBy) ? sortBy : typeof sortBy === 'string' ? [sortBy] : [],
                    };
                }
            }

            return { ...listState };
        },
    };

    return factory;
}
