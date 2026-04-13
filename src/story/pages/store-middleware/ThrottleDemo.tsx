import cn from 'classnames';
import React, { useRef } from 'react';
import { Button } from '../../../components';
import { create, createHook } from '../../../store';
import { throttleMiddleware } from '../../../store/middlewares';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface ThrottleState {
    value: number;
}

const throttledStore = create<ThrottleState>(() => ({ value: 0 }), [throttleMiddleware(500)]);
const useThrottledStore = createHook(throttledStore);

const normalStore = create<ThrottleState>(() => ({ value: 0 }));
const useNormalStore = createHook(normalStore);

const throttleCode = `import { create, createHook } from 'fluxo-ui/store';
import { throttleMiddleware } from 'fluxo-ui/store/middlewares';

// Updates are batched within a 500ms window
const store = create<{ value: number }>(
  () => ({ value: 0 }),
  [throttleMiddleware(500)]
);
const useStore = createHook(store);

function ThrottleDemo() {
  const { value } = useStore();

  const handleRapidClicks = () => {
    // These rapid calls are merged and applied once after 500ms
    for (let i = 0; i < 10; i++) {
      store.setState((s) => ({ value: s.value + 1 }));
    }
  };

  return (
    <div>
      <span>Value: {value}</span>
      <Button label="Rapid +10" onClick={handleRapidClicks} />
    </div>
  );
}`;

const ThrottleDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const throttledRenders = useRef(0);
    const normalRenders = useRef(0);

    throttledRenders.current++;
    const { value: throttledValue } = useThrottledStore();

    normalRenders.current++;
    const { value: normalValue } = useNormalStore();

    const handleRapidThrottled = () => {
        for (let i = 0; i < 10; i++) {
            throttledStore.setState((s) => ({ value: s.value + 1 }));
        }
    };

    const handleRapidNormal = () => {
        for (let i = 0; i < 10; i++) {
            normalStore.setState((s) => ({ value: s.value + 1 }));
        }
    };

    return (
        <>
            <ComponentDemo
                title="Throttle"
                description="Batch rapid state updates within a time window using throttleMiddleware"
                centered={false}
            >
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                            className={cn('rounded-lg p-4 border text-center', {
                                'border-white/10 bg-white/5': isDark,
                                'border-gray-200 bg-gray-50': !isDark,
                            })}
                        >
                            <div
                                className={cn('text-xs uppercase tracking-wide mb-2 font-semibold', {
                                    'text-gray-500': isDark,
                                    'text-gray-400': !isDark,
                                })}
                            >
                                With Throttle (500ms)
                            </div>
                            <div className="text-3xl font-bold tabular-nums text-[var(--eui-primary)] mb-1">{throttledValue}</div>
                            <div className={cn('text-xs mb-3', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                                Renders: {throttledRenders.current}
                            </div>
                            <Button label="Rapid +10" size="sm" onClick={handleRapidThrottled} />
                        </div>
                        <div
                            className={cn('rounded-lg p-4 border text-center', {
                                'border-white/10 bg-white/5': isDark,
                                'border-gray-200 bg-gray-50': !isDark,
                            })}
                        >
                            <div
                                className={cn('text-xs uppercase tracking-wide mb-2 font-semibold', {
                                    'text-gray-500': isDark,
                                    'text-gray-400': !isDark,
                                })}
                            >
                                Without Throttle
                            </div>
                            <div className="text-3xl font-bold tabular-nums text-[var(--eui-primary)] mb-1">{normalValue}</div>
                            <div className={cn('text-xs mb-3', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                                Renders: {normalRenders.current}
                            </div>
                            <Button label="Rapid +10" size="sm" onClick={handleRapidNormal} />
                        </div>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={throttleCode} language="tsx" />
            </div>
        </>
    );
};

export default ThrottleDemo;
