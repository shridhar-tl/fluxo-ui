import cn from 'classnames';
import React, { useMemo, useState } from 'react';
import { Button } from '../../../components';
import type { ModelStore } from '../../../store';
import { createItemHook, createModel } from '../../../store';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface CounterState {
    id: string;
    count: number;
    label: string;
    lastUpdated: number;
}

const persistKey = 'fluxo-ui-demo-persist-counter';

const counterFactory = createModel<CounterState>({
    selectId: (state) => state.id,
    createWithDefaults: (id) => ({
        id,
        count: 0,
        label: 'Persisted Counter',
        lastUpdated: Date.now(),
    }),
    persist: (data) => {
        try {
            localStorage.setItem(persistKey, JSON.stringify(data));
        } catch {}
    },
    loadFromPersist: () => {
        try {
            const stored = localStorage.getItem(persistKey);
            return stored ? JSON.parse(stored) : undefined;
        } catch {
            return undefined;
        }
    },
    saveOnChange: true,
});

const code = `import { createModel, createItemHook } from 'fluxo-ui/store';

interface CounterState {
    id: string;
    count: number;
    label: string;
    lastUpdated: number;
}

// persist: custom function called whenever state is saved
// loadFromPersist: called once on store creation to restore state
// saveOnChange: auto-saves (debounced 500ms) on every setState call

const counterFactory = createModel<CounterState>({
    selectId: (state) => state.id,
    createWithDefaults: (id) => ({
        id, count: 0, label: 'Persisted Counter', lastUpdated: Date.now(),
    }),
    persist: (data) => {
        localStorage.setItem('my-counter', JSON.stringify(data));
    },
    loadFromPersist: () => {
        const stored = localStorage.getItem('my-counter');
        return stored ? JSON.parse(stored) : undefined;
    },
    saveOnChange: true,
});

const store = counterFactory.create({ id: 'main' });
const useCounter = createItemHook(store);

function Counter() {
    const state = useCounter();
    return (
        <div>
            <p>Count: {state.count}</p>
            <Button label="+"
                onClick={() => store.setState({
                    count: state.count + 1,
                    lastUpdated: Date.now(),
                })} />
            <Button label="Refresh Page"
                onClick={() => window.location.reload()} />
        </div>
    );
}`;

interface PersistedCounterProps {
    store: ModelStore<CounterState>;
}

const formatTime = (timestamp: number): string => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
};

const PersistedCounter: React.FC<PersistedCounterProps> = ({ store }) => {
    const { isDark } = useStoryTheme();
    const useCounter = useMemo(() => createItemHook(store), [store]);
    const state = useCounter() as CounterState & {
        id: string;
        isStale: boolean;
        isLoading: boolean;
        isSaving: boolean;
        isDeleting: boolean;
    };

    return (
        <div
            className={cn('rounded-lg border p-6 text-center', {
                'border-white/10 bg-white/5': isDark,
                'border-gray-200 bg-white': !isDark,
            })}
        >
            <p className={cn('text-xs mb-2 font-medium', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>{state.label}</p>
            <p className={cn('text-5xl font-bold mb-2 tabular-nums', { 'text-gray-100': isDark, 'text-gray-800': !isDark })}>
                {state.count}
            </p>
            <p className={cn('text-[10px] mb-4 tabular-nums', { 'text-gray-600': isDark, 'text-gray-400': !isDark })}>
                Last updated: {formatTime(state.lastUpdated)}
            </p>
            <div
                className={cn('text-xs text-center px-4 py-2 rounded-lg mb-4 max-w-sm mx-auto', {
                    'bg-green-500/10 text-green-400 border border-green-500/20': isDark,
                    'bg-green-50 text-green-700 border border-green-200': !isDark,
                })}
            >
                State auto-saves to localStorage via <code className="font-mono font-semibold">saveOnChange</code>. The{' '}
                <code className="font-mono font-semibold">persist</code> callback writes data, and{' '}
                <code className="font-mono font-semibold">loadFromPersist</code> restores it on creation. Try refreshing the page or
                unmounting below.
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
                <Button
                    label="-"
                    size="sm"
                    variant="secondary"
                    onClick={() => store.setState({ count: state.count - 1, lastUpdated: Date.now() })}
                />
                <Button label="+" size="sm" onClick={() => store.setState({ count: state.count + 1, lastUpdated: Date.now() })} />
                <Button label="Reset" size="sm" variant="secondary" onClick={() => store.setState({ count: 0, lastUpdated: Date.now() })} />
                <Button label="Refresh Page" size="sm" variant="info" onClick={() => window.location.reload()} />
            </div>
        </div>
    );
};

const StorageInspector: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [raw, setRaw] = useState<string>(() => {
        try {
            return localStorage.getItem(persistKey) || '(empty)';
        } catch {
            return '(unavailable)';
        }
    });

    const refresh = () => {
        try {
            setRaw(localStorage.getItem(persistKey) || '(empty)');
        } catch {
            setRaw('(unavailable)');
        }
    };

    return (
        <div
            className={cn('rounded-lg border p-4 mt-4', {
                'border-white/10 bg-white/5': isDark,
                'border-gray-200 bg-gray-50': !isDark,
            })}
        >
            <div className="flex items-center justify-between mb-2">
                <p className={cn('text-xs font-semibold', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>localStorage Inspector</p>
                <Button label="Refresh" size="xs" variant="secondary" layout="plain" onClick={refresh} />
            </div>
            <pre
                className={cn('text-[11px] font-mono p-3 rounded overflow-x-auto whitespace-pre-wrap break-all', {
                    'bg-black/30 text-gray-400': isDark,
                    'bg-white text-gray-600 border border-gray-200': !isDark,
                })}
            >
                Key: {persistKey}
                {'\n'}
                Value: {raw}
            </pre>
        </div>
    );
};

const PersistenceDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [mounted, setMounted] = useState(true);
    const [store] = useState(() => counterFactory.create({ id: 'demo-persist' }));

    return (
        <>
            <ComponentDemo
                title="Persistence Demo"
                description="State persists to localStorage and survives component remount and page refresh"
                centered={false}
            >
                <div className="w-full max-w-md mx-auto p-4">
                    <div className="flex justify-center gap-2 mb-4">
                        <Button
                            label={mounted ? 'Unmount Component' : 'Remount Component'}
                            size="sm"
                            variant="warning"
                            layout="outlined"
                            onClick={() => setMounted((m) => !m)}
                        />
                    </div>

                    {mounted ? (
                        <PersistedCounter store={store} />
                    ) : (
                        <div
                            className={cn('rounded-lg border border-dashed p-8 text-center', {
                                'border-white/10': isDark,
                                'border-gray-300': !isDark,
                            })}
                        >
                            <p className={cn('text-sm', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                                Component unmounted. Click &quot;Remount Component&quot; to see the state restored.
                            </p>
                        </div>
                    )}

                    <StorageInspector />

                    <div className="flex justify-center mt-4">
                        <Button
                            label="Clear Storage & Reset"
                            size="xs"
                            variant="secondary"
                            layout="plain"
                            onClick={() => {
                                localStorage.removeItem(persistKey);
                                store.setState({ count: 0, lastUpdated: 0 });
                            }}
                        />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default PersistenceDemo;
