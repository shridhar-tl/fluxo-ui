import cn from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../../../components';
import { create, createHook } from '../../../store';
import { persistMiddleware } from '../../../store/middlewares';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const persistStorageKey = 'fluxo-store-demo-persist';

interface PersistState {
    count: number;
}

const persistStore = create<PersistState>(() => ({ count: 0 }), [persistMiddleware('local', persistStorageKey)]);
const usePersistStore = createHook(persistStore);

function getStoredValue(): number | null {
    try {
        const raw = localStorage.getItem(persistStorageKey);
        if (raw) {
            const parsed = JSON.parse(raw);
            return typeof parsed.count === 'number' ? parsed.count : null;
        }
    } catch {
        // ignore
    }
    return null;
}

const persistCode = `import { create, createHook } from 'fluxo-ui/store';
import { persistMiddleware } from 'fluxo-ui/store/middlewares';

const store = create<{ count: number }>(
  () => ({ count: 0 }),
  [persistMiddleware('local', 'my-app-counter')]
);
const useStore = createHook(store);

function PersistDemo() {
  const { count } = useStore();

  return (
    <div>
      <span>Persisted count: {count}</span>
      <Button label="Increment"
        onClick={() => store.setState(s => ({ count: s.count + 1 }))} />
      <Button label="Refresh Page"
        onClick={() => window.location.reload()} />
    </div>
  );
}`;

const PersistDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const { count } = usePersistStore();
    const [mounted, setMounted] = useState(true);
    const [restoredFromStorage] = useState(() => getStoredValue() !== null && getStoredValue() !== 0);
    const [showSavedFlash, setShowSavedFlash] = useState(false);

    useEffect(() => {
        if (count === 0) return;
        setShowSavedFlash(true);
        const timer = setTimeout(() => setShowSavedFlash(false), 1200);
        return () => clearTimeout(timer);
    }, [count]);

    const storageRawValue = useMemo(() => {
        try {
            return localStorage.getItem(persistStorageKey);
        } catch {
            return null;
        }
    }, [count]);

    return (
        <>
            <ComponentDemo title="Persistence" description="Automatically save and restore state from localStorage with persistMiddleware">
                <div className="flex flex-col items-center gap-4">
                    {mounted ? (
                        <>
                            {restoredFromStorage && (
                                <div
                                    className={cn('flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full', {
                                        'bg-blue-500/15 text-blue-400 border border-blue-500/25': isDark,
                                        'bg-blue-50 text-blue-700 border border-blue-200': !isDark,
                                    })}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                        <path
                                            fillRule="evenodd"
                                            d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H4.598a.75.75 0 0 0-.75.75v3.634a.75.75 0 0 0 1.5 0v-2.033l.312.311a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.389Zm-1.873-5.848a7 7 0 0 0-11.712 3.138.75.75 0 0 0 1.449.389 5.5 5.5 0 0 1 9.201-2.466l.312.311H10.256a.75.75 0 0 0 0 1.5h3.634a.75.75 0 0 0 .75-.75V4.064a.75.75 0 0 0-1.5 0v2.033l-.312-.311Z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Restored from localStorage
                                </div>
                            )}
                            <div className="relative flex items-center gap-3">
                                <div className="text-4xl font-bold tabular-nums text-[var(--eui-primary)]">{count}</div>
                                <div
                                    className={cn(
                                        'absolute -right-16 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-0.5 rounded transition-opacity duration-300',
                                        showSavedFlash ? 'opacity-100' : 'opacity-0',
                                        {
                                            'bg-green-500/15 text-green-400': isDark,
                                            'bg-green-50 text-green-600': !isDark,
                                        },
                                    )}
                                >
                                    Saved
                                </div>
                            </div>
                            <div
                                className={cn('text-xs text-center px-4 py-2 rounded-lg max-w-sm', {
                                    'bg-green-500/10 text-green-400 border border-green-500/20': isDark,
                                    'bg-green-50 text-green-700 border border-green-200': !isDark,
                                })}
                            >
                                This value is persisted to localStorage. Try refreshing the page — the count will be restored!
                            </div>
                            <div className="flex gap-2 flex-wrap justify-center">
                                <Button
                                    label="Increment"
                                    size="sm"
                                    onClick={() => persistStore.setState((s) => ({ count: s.count + 1 }))}
                                />
                                <Button
                                    label="Decrement"
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => persistStore.setState((s) => ({ count: s.count - 1 }))}
                                />
                                <Button label="Refresh Page" size="sm" variant="info" onClick={() => window.location.reload()} />
                                <Button label="Unmount" size="sm" variant="warning" onClick={() => setMounted(false)} />
                            </div>
                            <div
                                className={cn('w-full max-w-md rounded-lg px-4 py-3 text-xs font-mono', {
                                    'bg-white/5 text-gray-400 border border-white/10': isDark,
                                    'bg-gray-50 text-gray-500 border border-gray-200': !isDark,
                                })}
                            >
                                <div
                                    className={cn('text-[10px] uppercase tracking-wider font-semibold mb-1', {
                                        'text-gray-500': isDark,
                                        'text-gray-400': !isDark,
                                    })}
                                >
                                    localStorage[&quot;{persistStorageKey}&quot;]
                                </div>
                                <div className="truncate">{storageRawValue || 'null'}</div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                                Component unmounted. Value is persisted in localStorage.
                            </div>
                            <Button label="Remount" size="sm" variant="success" onClick={() => setMounted(true)} />
                        </div>
                    )}
                    <Button
                        label="Clear Storage & Reset"
                        size="xs"
                        variant="secondary"
                        layout="plain"
                        onClick={() => {
                            localStorage.removeItem(persistStorageKey);
                            persistStore.reset();
                        }}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={persistCode} language="tsx" />
            </div>
        </>
    );
};

export default PersistDemo;
