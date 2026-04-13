import cn from 'classnames';
import React, { useRef } from 'react';
import { TextInput } from '../../../components';
import { create, createHook } from '../../../store';
import { debounceMiddleware } from '../../../store/middlewares';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface SearchState {
    query: string;
    searchCount: number;
}

const debouncedStore = create<SearchState>(() => ({ query: '', searchCount: 0 }), [debounceMiddleware(500)]);
const useDebouncedStore = createHook(debouncedStore);

const normalStore = create<SearchState>(() => ({ query: '', searchCount: 0 }));
const useNormalStore = createHook(normalStore);

const debounceCode = `import { create, createHook } from 'fluxo-ui/store';
import { debounceMiddleware } from 'fluxo-ui/store/middlewares';

const store = create<{ query: string }>(
  () => ({ query: '' }),
  [debounceMiddleware(500)]
);
const useStore = createHook(store);

function SearchInput() {
  const { query } = useStore();
  // State only updates 500ms after the user stops typing
  return (
    <TextInput
      value={query}
      onChange={(e) => store.setState({ query: e.target.value })}
      placeholder="Type to search..."
    />
  );
}`;

const DebouncedPanel: React.FC<{ title: string; store: typeof debouncedStore; hook: typeof useDebouncedStore }> = ({
    title,
    store: s,
    hook,
}) => {
    const { isDark } = useStoryTheme();
    const state = hook();
    const renderCount = useRef(0);
    renderCount.current++;

    return (
        <div
            className={cn('flex-1 rounded-lg border p-4', {
                'border-white/10 bg-white/5': isDark,
                'border-gray-200 bg-gray-50': !isDark,
            })}
        >
            <div
                className={cn('text-xs font-semibold uppercase tracking-wider mb-3', {
                    'text-gray-400': isDark,
                    'text-gray-500': !isDark,
                })}
            >
                {title}
            </div>
            <TextInput
                value={state.query}
                onChange={(e) => s.setState({ query: e.target.value, searchCount: s.getState().searchCount + 1 })}
                placeholder="Type rapidly..."
            />
            <div
                className={cn('mt-3 text-sm space-y-1', {
                    'text-gray-300': isDark,
                    'text-gray-600': !isDark,
                })}
            >
                <div>
                    Updates: <span className="font-bold text-[var(--eui-primary)]">{state.searchCount}</span>
                </div>
                <div>
                    Renders: <span className="font-bold text-[var(--eui-primary)]">{renderCount.current}</span>
                </div>
            </div>
        </div>
    );
};

const DebounceDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo
                title="Debounce"
                description="Delay state updates until input activity stops. Compare debounced vs immediate updates."
            >
                <div className="flex gap-4 flex-col sm:flex-row w-full">
                    <DebouncedPanel title="With Debounce (500ms)" store={debouncedStore} hook={useDebouncedStore} />
                    <DebouncedPanel title="Without Debounce" store={normalStore} hook={useNormalStore} />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={debounceCode} language="tsx" />
            </div>
        </>
    );
};

export default DebounceDemo;
