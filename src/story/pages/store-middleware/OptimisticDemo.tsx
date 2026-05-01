import cn from 'classnames';
import React, { useRef, useState } from 'react';
import { Button } from '../../../components';
import { create, createHook } from '../../../store';
import { optimisticMiddleware, OptimisticStore } from '../../../store/middlewares';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface LikeState {
    likes: number;
    serverLikes: number;
}

const fakeServer = (failureRate: { value: number }, latency: number) =>
    new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < failureRate.value) {
                reject(new Error('Server rejected the change'));
            } else {
                resolve();
            }
        }, latency);
    });

const failureRate = { value: 0.4 };

const optimisticStore = create<LikeState>(() => ({ likes: 0, serverLikes: 0 }), [
    optimisticMiddleware<LikeState>({
        commit: async (next) => {
            await fakeServer(failureRate, 600);
            optimisticStore.setState({ serverLikes: next.likes });
        },
    }),
]) as OptimisticStore<LikeState>;

const useOptimistic = createHook(optimisticStore);

const code = `import { create } from 'fluxo-ui/store';
import { optimisticMiddleware } from 'fluxo-ui/store/middlewares';

const store = create<LikeState>(
  () => ({ likes: 0, serverLikes: 0 }),
  [optimisticMiddleware<LikeState>({
    commit: async (next) => {
      // Send to server. If this rejects, the state automatically rolls back.
      await fetch('/api/likes', { method: 'POST', body: JSON.stringify(next) });
      store.setState({ serverLikes: next.likes });
    },
    onRollback: (prev, attempted, error) => {
      showSnackbar({ severity: 'error', message: 'Save failed — reverted' });
    },
  })]
);

// Use store.optimistic() instead of setState() for changes that need server confirmation
store.optimistic((s) => ({ likes: s.likes + 1 }));
`;

const OptimisticDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const state = useOptimistic();
    const [log, setLog] = useState<string[]>([]);
    const counter = useRef(0);

    const like = () => {
        counter.current++;
        const id = counter.current;
        optimisticStore.optimistic((s) => ({ likes: s.likes + 1 }));
        setLog((prev) => [...prev.slice(-9), `#${id} optimistic +1 (sending...)`]);
        setTimeout(() => {
            const synced = optimisticStore.getState();
            const ok = synced.likes === synced.serverLikes;
            setLog((prev) => [...prev.slice(-9), `#${id} ${ok ? 'committed' : 'rolled back'} → likes=${synced.likes}`]);
        }, 700);
    };

    return (
        <>
            <ComponentDemo
                title="Optimistic Updates with Auto-Rollback"
                description="Click +1 — UI updates immediately. A simulated server fails ~40% of the time. On failure the change rolls back automatically."
            >
                <div className="flex flex-col items-center gap-4 w-full max-w-md">
                    <div className="flex gap-8">
                        <div className="text-center">
                            <div
                                className={cn('text-xs uppercase tracking-wide mb-1', {
                                    'text-gray-500': isDark,
                                    'text-gray-400': !isDark,
                                })}
                            >
                                Optimistic
                            </div>
                            <div className="text-4xl font-bold tabular-nums text-[var(--eui-primary)]">{state.likes}</div>
                        </div>
                        <div className="text-center">
                            <div
                                className={cn('text-xs uppercase tracking-wide mb-1', {
                                    'text-gray-500': isDark,
                                    'text-gray-400': !isDark,
                                })}
                            >
                                Server
                            </div>
                            <div
                                className={cn('text-4xl font-bold tabular-nums', {
                                    'text-emerald-400': isDark,
                                    'text-emerald-600': !isDark,
                                })}
                            >
                                {state.serverLikes}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                        <Button label="+1 Like (optimistic)" size="sm" onClick={like} />
                        <Button
                            label="Lower failure rate"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                                failureRate.value = 0.05;
                                setLog((prev) => [...prev.slice(-9), `failure rate → 5%`]);
                            }}
                        />
                        <Button
                            label="Reset"
                            size="sm"
                            variant="secondary"
                            onClick={() => optimisticStore.setState({ likes: 0, serverLikes: 0 }, true)}
                        />
                    </div>
                    <div
                        className={cn('w-full text-xs font-mono p-3 rounded max-h-40 overflow-auto', {
                            'bg-black/30 text-gray-300': isDark,
                            'bg-gray-100 text-gray-700': !isDark,
                        })}
                    >
                        {log.length === 0 && <div className="italic opacity-60">Click +1 to see commits and rollbacks</div>}
                        {log.map((line, i) => (
                            <div key={i}>{line}</div>
                        ))}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default OptimisticDemo;
