import cn from 'classnames';
import React, { useRef } from 'react';
import { Button } from '../../../components';
import { createHook, createSlice } from '../../../store';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface TimerState {
    seconds: number;
    running: boolean;
}

const timerSlice = createSlice<TimerState>('timer', () => ({ seconds: 0, running: false }));
const useTimer = createHook(timerSlice);

const code = `import { createHook, createSlice } from 'fluxo-ui/store';

// A slice is a fully-functional store on its own — no combineSlices needed.
const timerSlice = createSlice<TimerState>('timer', () => ({ seconds: 0, running: false }));
const useTimer = createHook(timerSlice);

// Direct framework-agnostic usage from plain JavaScript:
timerSlice.on('change', 'seconds', (s) => console.log('seconds:', s.seconds));
timerSlice.setState({ running: true });

// Later — adopt the same slice into a combined store with combineSlices({ timer: timerSlice, ... })
// The slice keeps the same identity; existing subscribers keep firing.
`;

const StandaloneSlice: React.FC = () => {
    const { isDark } = useStoryTheme();
    const renderCount = useRef(0);
    renderCount.current++;
    const state = useTimer();

    const tick = () => timerSlice.setState((s) => ({ seconds: s.seconds + 1 }));
    const toggle = () => timerSlice.setState((s) => ({ running: !s.running }));
    const reset = () => timerSlice.reset();

    return (
        <>
            <ComponentDemo
                title="Standalone Slice"
                description="A slice used on its own — works exactly like a regular Store<T>. No combined parent required."
                centered={false}
            >
                <div className="p-6 flex flex-col gap-4 items-center">
                    <div
                        className={cn('rounded-lg p-6 border w-full max-w-md', {
                            'border-white/10 bg-white/5': isDark,
                            'border-gray-200 bg-gray-50': !isDark,
                        })}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div
                                className={cn('text-xs uppercase tracking-wide font-semibold', {
                                    'text-gray-500': isDark,
                                    'text-gray-400': !isDark,
                                })}
                            >
                                Standalone Timer Slice
                            </div>
                            <div
                                className={cn('text-xs px-2 py-0.5 rounded font-mono', {
                                    'bg-amber-500/20 text-amber-400': isDark,
                                    'bg-amber-100 text-amber-700': !isDark,
                                })}
                            >
                                renders: {renderCount.current}
                            </div>
                        </div>
                        <div className="text-center mb-4">
                            <div className="text-5xl font-bold tabular-nums text-[var(--eui-primary)]">{state.seconds}</div>
                            <div className={cn('text-sm mt-1', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                                {state.running ? 'running' : 'paused'}
                            </div>
                        </div>
                        <div className="flex justify-center gap-2 flex-wrap">
                            <Button label="Tick" size="sm" onClick={tick} />
                            <Button label="Toggle" size="sm" onClick={toggle} />
                            <Button label="Reset" size="sm" variant="secondary" onClick={reset} />
                        </div>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default StandaloneSlice;
