import cn from 'classnames';
import React, { useCallback, useState } from 'react';
import { Button } from '../../../components';
import { create, createHook } from '../../../store';
import type { UndoRedoStateProps } from '../../../store/middlewares';
import { persistMiddleware, undoRedoMiddleware, validationMiddleware } from '../../../store/middlewares';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface UndoState {
    value: number;
}

const undoStore = create<UndoState>(() => ({ value: 0 }), [undoRedoMiddleware(20)]);
const useUndoStore = createHook<UndoState, UndoState & UndoRedoStateProps>(undoStore);

const undoRedoCode = `import { create, createHook, undoRedoMiddleware } from 'fluxo-ui/store';

const store = create<{ value: number }>(
  () => ({ value: 0 }),
  [undoRedoMiddleware(20)]
);
const useStore = createHook(store);

function UndoDemo() {
  const { value } = useStore();

  return (
    <div>
      <span>{value}</span>
      <button onClick={() => store.setState(s => ({ value: s.value + 1 }))}>
        +1
      </button>
      <button onClick={() => (store as any).undo()}>Undo</button>
      <button onClick={() => (store as any).redo()}>Redo</button>
    </div>
  );
}`;

const persistStorageKey = 'fluxo-store-demo-persist';

interface PersistState {
    count: number;
}

const persistStore = create<PersistState>(() => ({ count: 0 }), [persistMiddleware('local', persistStorageKey)]);
const usePersistStore = createHook(persistStore);

const persistCode = `import { create, createHook, persistMiddleware } from 'fluxo-ui/store';

const store = create<{ count: number }>(
  () => ({ count: 0 }),
  [persistMiddleware('local', 'my-app-counter')]
);
const useStore = createHook(store);

function PersistDemo() {
  const { count } = useStore();
  // Value survives page refresh!
  return <span>Persisted count: {count}</span>;
}`;

interface ValidatedState {
    amount: number;
}

const validationErrors: Record<string, string>[] = [];

const validatedStore = create<ValidatedState>(
    () => ({ amount: 10 }),
    [
        validationMiddleware(
            (state: ValidatedState) => {
                const errors: Record<string, string> = {};
                if (state.amount < 0) {
                    errors.amount = 'Amount cannot be negative';
                }
                if (state.amount > 100) {
                    errors.amount = 'Amount cannot exceed 100';
                }
                return Object.keys(errors).length > 0 ? errors : undefined;
            },
            (errors) => {
                validationErrors.length = 0;
                validationErrors.push(errors);
            },
        ),
    ],
);
const useValidatedStore = createHook(validatedStore);

const validationCode = `import { create, createHook, validationMiddleware } from 'fluxo-ui/store';

const store = create<{ amount: number }>(
  () => ({ amount: 10 }),
  [validationMiddleware(
    (state) => {
      if (state.amount < 0) return { amount: 'Cannot be negative' };
      if (state.amount > 100) return { amount: 'Cannot exceed 100' };
    },
    (errors) => console.log('Validation failed:', errors)
  )]
);

// setState is rejected if validation fails
store.setState({ amount: -5 }); // blocked!`;

const typedUndoStore = undoStore as ReturnType<ReturnType<typeof undoRedoMiddleware>>;

const UndoRedoDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const { value, canUndo, canRedo } = useUndoStore();

    return (
        <div className="flex flex-col items-center gap-4">
            <div className={cn('text-xs uppercase tracking-wide font-semibold', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                Undo / Redo Middleware
            </div>
            <div className="text-4xl font-bold tabular-nums text-[var(--eui-primary)]">{value}</div>
            <div className="flex gap-2 flex-wrap justify-center">
                <Button label="+1" size="sm" onClick={() => undoStore.setState((s) => ({ value: s.value + 1 }))} />
                <Button label="+5" size="sm" onClick={() => undoStore.setState((s) => ({ value: s.value + 5 }))} />
                <Button label="Undo" size="sm" variant="secondary" disabled={!canUndo} onClick={() => typedUndoStore.undo()} />
                <Button label="Redo" size="sm" variant="secondary" disabled={!canRedo} onClick={() => typedUndoStore.redo()} />
            </div>
        </div>
    );
};

const PersistDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const { count } = usePersistStore();
    const [mounted, setMounted] = useState(true);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className={cn('text-xs uppercase tracking-wide font-semibold', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                Persist Middleware
            </div>
            {mounted ? (
                <>
                    <div className="text-4xl font-bold tabular-nums text-[var(--eui-primary)]">{count}</div>
                    <div className="flex gap-2">
                        <Button label="Increment" size="sm" onClick={() => persistStore.setState((s) => ({ count: s.count + 1 }))} />
                        <Button label="Unmount" size="sm" variant="warning" onClick={() => setMounted(false)} />
                    </div>
                    <div
                        className={cn('text-xs text-center px-4 py-2 rounded-lg', {
                            'bg-white/5 text-gray-400': isDark,
                            'bg-gray-100 text-gray-500': !isDark,
                        })}
                    >
                        Try refreshing the page — the counter value persists in localStorage.
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
    );
};

const ValidationDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const { amount } = useValidatedStore();
    const [lastError, setLastError] = useState<string | null>(null);

    const trySetAmount = useCallback((newAmount: number) => {
        validationErrors.length = 0;
        validatedStore.setState({ amount: newAmount });
        requestAnimationFrame(() => {
            if (validationErrors.length > 0) {
                setLastError(validationErrors[0].amount || 'Validation failed');
            } else {
                setLastError(null);
            }
        });
    }, []);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className={cn('text-xs uppercase tracking-wide font-semibold', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                Validation Middleware
            </div>
            <div className="text-4xl font-bold tabular-nums text-[var(--eui-primary)]">{amount}</div>
            <div className={cn('text-xs', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>Valid range: 0 to 100</div>
            {lastError && <div className="text-xs text-red-500 font-medium px-3 py-1.5 rounded-md bg-red-500/10">{lastError}</div>}
            <div className="flex gap-2 flex-wrap justify-center">
                <Button label="+10" size="sm" onClick={() => trySetAmount(amount + 10)} />
                <Button label="-10" size="sm" onClick={() => trySetAmount(amount - 10)} />
                <Button label="Set -5 (blocked)" size="sm" variant="danger" onClick={() => trySetAmount(-5)} />
                <Button label="Set 150 (blocked)" size="sm" variant="danger" onClick={() => trySetAmount(150)} />
            </div>
        </div>
    );
};

const MiddlewareDemo: React.FC = () => {
    return (
        <>
            <div className="space-y-6">
                <ComponentDemo title="Undo / Redo" description="Track state history and navigate back and forth with undoRedoMiddleware">
                    <UndoRedoDemo />
                </ComponentDemo>
                <div className="mt-4">
                    <CodeBlock code={undoRedoCode} language="tsx" />
                </div>

                <ComponentDemo
                    title="Persistence"
                    description="Automatically save and restore state from localStorage with persistMiddleware"
                >
                    <PersistDemo />
                </ComponentDemo>
                <div className="mt-4">
                    <CodeBlock code={persistCode} language="tsx" />
                </div>

                <ComponentDemo title="Validation" description="Reject invalid state updates with validationMiddleware">
                    <ValidationDemo />
                </ComponentDemo>
                <div className="mt-4">
                    <CodeBlock code={validationCode} language="tsx" />
                </div>
            </div>
        </>
    );
};

export default MiddlewareDemo;
