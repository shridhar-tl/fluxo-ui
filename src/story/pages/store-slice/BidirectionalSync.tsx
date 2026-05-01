import cn from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../../../components';
import { combineSlices, createSlice } from '../../../store';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface CounterState {
    value: number;
}

interface SettingsState {
    theme: 'light' | 'dark';
    debug: boolean;
}

const counterSlice = createSlice<CounterState>('counter', () => ({ value: 0 }));
const settingsSlice = createSlice<SettingsState>('settings', () => ({ theme: 'light', debug: false }));

const syncStore = combineSlices({ counter: counterSlice, settings: settingsSlice });

const code = `import { combineSlices, createSlice } from 'fluxo-ui/store';

const counterSlice = createSlice<CounterState>('counter', () => ({ value: 0 }));
const settingsSlice = createSlice<SettingsState>('settings', () => ({ theme: 'light', debug: false }));

const syncStore = combineSlices({ counter: counterSlice, settings: settingsSlice });

// Slice-level path subscription — only fires for this slice's branch
counterSlice.on('change', 'value', (s) => console.log('[counter slice] value =', s.value));

// Combined-level path subscription — fully-qualified path including the slice key
syncStore.on('change', 'counter.value', (s) => console.log('[combined] counter.value =', s.counter.value));
syncStore.on('change', 'settings.theme', (s) => console.log('[combined] settings.theme =', s.settings.theme));

// Either write style triggers BOTH subscriptions:
counterSlice.setState({ value: 1 });             // slice direct
syncStore.setState((s) => ({ counter: { ...s.counter, value: 2 } })); // combined direct
`;

const BidirectionalSync: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [logs, setLogs] = useState<string[]>([]);
    const counterRender = useRef(0);
    const combinedRender = useRef(0);

    useEffect(() => {
        const unsub1 = counterSlice.on('change', 'value', (s) => {
            counterRender.current++;
            setLogs((prev) => [...prev.slice(-19), `[counter slice] value=${s.value}`]);
        });
        const unsub2 = settingsSlice.on('change', 'theme', (s) => {
            setLogs((prev) => [...prev.slice(-19), `[settings slice] theme=${s.theme}`]);
        });
        const unsub3 = syncStore.on('change', 'counter.value', (s) => {
            combinedRender.current++;
            setLogs((prev) => [...prev.slice(-19), `[combined] counter.value=${s.counter.value}`]);
        });
        const unsub4 = syncStore.on('change', 'settings.theme', (s) => {
            setLogs((prev) => [...prev.slice(-19), `[combined] settings.theme=${s.settings.theme}`]);
        });
        const unsub5 = syncStore.on('change', 'settings.debug', (s) => {
            setLogs((prev) => [...prev.slice(-19), `[combined] settings.debug=${s.settings.debug}`]);
        });
        return () => {
            unsub1();
            unsub2();
            unsub3();
            unsub4();
            unsub5();
        };
    }, []);

    const sliceWrite = () => counterSlice.setState((s) => ({ value: s.value + 1 }));
    const combinedWrite = () =>
        syncStore.setState((s) => ({
            counter: { ...s.counter, value: s.counter.value + 1 },
        }));
    const settingsSliceWrite = () =>
        settingsSlice.setState((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' }));
    const settingsCombinedWrite = () =>
        syncStore.setState((s) => ({ settings: { ...s.settings, debug: !s.settings.debug } }));

    return (
        <>
            <ComponentDemo
                title="Bidirectional Sync"
                description="Slice subscribers and combined-store subscribers both fire on every change, no matter which side wrote."
                centered={false}
            >
                <div className="p-6 flex flex-col gap-4">
                    <div
                        className={cn('rounded-lg p-4 border flex flex-wrap gap-2', {
                            'border-white/10 bg-white/5': isDark,
                            'border-gray-200 bg-gray-50': !isDark,
                        })}
                    >
                        <Button label="counter via slice" size="sm" onClick={sliceWrite} />
                        <Button label="counter via combined" size="sm" variant="secondary" onClick={combinedWrite} />
                        <Button label="theme via slice" size="sm" onClick={settingsSliceWrite} />
                        <Button label="debug via combined" size="sm" variant="secondary" onClick={settingsCombinedWrite} />
                        <Button label="Clear log" size="sm" variant="secondary" layout="plain" onClick={() => setLogs([])} />
                    </div>
                    <div
                        className={cn('rounded-lg p-4 border', {
                            'border-white/10 bg-black/30': isDark,
                            'border-gray-200 bg-white': !isDark,
                        })}
                    >
                        <div
                            className={cn('text-xs uppercase tracking-wide font-semibold mb-2', {
                                'text-gray-500': isDark,
                                'text-gray-400': !isDark,
                            })}
                        >
                            Subscriber log (slice + combined fire on every write)
                        </div>
                        <div
                            className={cn('font-mono text-xs space-y-1 max-h-56 overflow-y-auto', {
                                'text-gray-300': isDark,
                                'text-gray-700': !isDark,
                            })}
                        >
                            {logs.length === 0 && <div className="italic opacity-50">Click any button above to see both layers fire</div>}
                            {logs.map((log, i) => (
                                <div key={i} className={cn('py-0.5 px-2 rounded', { 'bg-white/5': isDark, 'bg-gray-100': !isDark })}>
                                    {log}
                                </div>
                            ))}
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

export default BidirectionalSync;
