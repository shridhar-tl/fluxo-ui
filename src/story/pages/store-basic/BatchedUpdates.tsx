import cn from 'classnames';
import React, { useRef } from 'react';
import { create, createHook } from '../../../store';
import { Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface BatchState {
    count: number;
}

const batchStore = create<BatchState>(() => ({ count: 0 }));
const useBatchStore = createHook(batchStore);

const code = `import { create, createHook } from 'ether-ui/store';

const store = create<{ count: number }>(() => ({ count: 0 }));
const useStore = createHook(store);

function BatchDemo() {
  const renderCount = useRef(0);
  renderCount.current++;

  const { count } = useStore();

  const handleBatchIncrement = () => {
    // All three calls are batched into a single re-render
    store.setState((s) => ({ count: s.count + 1 }));
    store.setState((s) => ({ count: s.count + 1 }));
    store.setState((s) => ({ count: s.count + 1 }));
  };

  return (
    <div>
      <p>Count: {count}</p>
      <p>Render count: {renderCount.current}</p>
      <Button label="+3 (Batched)" onClick={handleBatchIncrement} />
    </div>
  );
}`;

const BatchDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const renderCount = useRef(0);
    renderCount.current++;

    const { count } = useBatchStore();

    const handleBatchIncrement = () => {
        batchStore.setState((s) => ({ count: s.count + 1 }));
        batchStore.setState((s) => ({ count: s.count + 1 }));
        batchStore.setState((s) => ({ count: s.count + 1 }));
    };

    return (
        <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">
            <div className="flex gap-8">
                <div className="text-center">
                    <div className={cn('text-xs uppercase tracking-wide mb-1', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                        Count
                    </div>
                    <div className="text-4xl font-bold tabular-nums text-[var(--eui-primary)]">{count}</div>
                </div>
                <div className="text-center">
                    <div className={cn('text-xs uppercase tracking-wide mb-1', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                        Renders
                    </div>
                    <div className={cn('text-4xl font-bold tabular-nums', { 'text-amber-400': isDark, 'text-amber-600': !isDark })}>
                        {renderCount.current}
                    </div>
                </div>
            </div>
            <div className={cn('text-xs text-center px-4 py-2 rounded-lg', { 'bg-white/5 text-gray-400': isDark, 'bg-gray-100 text-gray-500': !isDark })}>
                Three setState calls in one handler produce only one re-render thanks to microtask batching.
                In React dev mode (StrictMode), render count may increment by 2 — this is expected and does not occur in production builds.
            </div>
            <div className="flex gap-3">
                <Button
                    label="+3 (Batched)"
                    size="sm"
                    onClick={handleBatchIncrement}
                />
                <Button
                    label="+1"
                    size="sm"
                    onClick={() => batchStore.setState((s) => ({ count: s.count + 1 }))}
                />
                <Button
                    label="Reset"
                    size="sm"
                    variant="secondary"
                    onClick={() => batchStore.reset()}
                />
            </div>
        </div>
    );
};

const BatchedUpdates: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Batched Updates" description="Multiple setState calls within one synchronous handler are batched into a single re-render">
                <BatchDemo />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BatchedUpdates;
