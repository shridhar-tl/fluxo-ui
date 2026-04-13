import cn from 'classnames';
import React from 'react';
import { Button } from '../../../components';
import { create, createHook } from '../../../store';
import { broadcastMiddleware } from '../../../store/middlewares';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface SharedState {
    count: number;
    lastUpdatedBy: string;
}

const sharedStore = create<SharedState>(() => ({ count: 0, lastUpdatedBy: 'none' }), [broadcastMiddleware('fluxo-ui-demo-counter')]);
const useSharedStore = createHook(sharedStore);

const tabId = Math.random().toString(36).slice(2, 6).toUpperCase();

const broadcastCode = `import { create, createHook } from 'fluxo-ui/store';
import { broadcastMiddleware } from 'fluxo-ui/store/middlewares';

const store = create<{ count: number }>(
  () => ({ count: 0 }),
  [broadcastMiddleware('my-app-counter')]
);
const useStore = createHook(store);

// Changes in one tab automatically sync to all other tabs
// Open this page in two browser tabs to see it in action!
function Counter() {
  const { count } = useStore();
  return (
    <div>
      <span>{count}</span>
      <Button label="+1"
        onClick={() => store.setState(s => ({ count: s.count + 1 }))} />
    </div>
  );
}`;

const BroadcastDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const state = useSharedStore();

    return (
        <>
            <ComponentDemo
                title="Broadcast (Cross-Tab Sync)"
                description="Sync state across browser tabs using the BroadcastChannel API. Open this page in another tab and click buttons — both tabs stay in sync."
            >
                <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
                    <div
                        className={cn('text-xs font-mono px-2 py-1 rounded', {
                            'bg-white/10 text-gray-400': isDark,
                            'bg-gray-100 text-gray-500': !isDark,
                        })}
                    >
                        Tab ID: {tabId}
                    </div>
                    <div className="text-4xl font-bold tabular-nums text-[var(--eui-primary)]">{state.count}</div>
                    {state.lastUpdatedBy !== 'none' && (
                        <div
                            className={cn('text-xs', {
                                'text-gray-400': isDark,
                                'text-gray-500': !isDark,
                            })}
                        >
                            Last updated by: {state.lastUpdatedBy === tabId ? 'this tab' : `tab ${state.lastUpdatedBy}`}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Button
                            label="+1"
                            size="sm"
                            onClick={() => sharedStore.setState((s) => ({ count: s.count + 1, lastUpdatedBy: tabId }))}
                        />
                        <Button
                            label="+5"
                            size="sm"
                            onClick={() => sharedStore.setState((s) => ({ count: s.count + 5, lastUpdatedBy: tabId }))}
                        />
                        <Button
                            label="Reset"
                            size="sm"
                            variant="secondary"
                            onClick={() => sharedStore.setState({ count: 0, lastUpdatedBy: tabId })}
                        />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={broadcastCode} language="tsx" />
            </div>
        </>
    );
};

export default BroadcastDemo;
