import cn from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../../../components';
import { combineSlices, createSlice } from '../../../store';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `// Pure TypeScript / JavaScript — no React.
import { combineSlices, createSlice } from 'fluxo-ui/store';

const userSlice = createSlice('user', () => ({ name: 'Guest' }));
const flagsSlice = createSlice('flags', () => ({ darkMode: false }));

const store = combineSlices({ user: userSlice, flags: flagsSlice });

// Subscribe directly — these listeners fire in pure JS environments
// (Node, web workers, vanilla DOM) the same way they do in React.
store.on('change', 'user.name', (s) => {
    console.log('user.name =>', s.user.name);
});

userSlice.on('change', (s) => {
    console.log('user slice changed:', s);
});

// Writes from any side propagate everywhere.
userSlice.setState({ name: 'Alice' });
store.setState((s) => ({ flags: { ...s.flags, darkMode: true } }));
`;

interface UserState {
    name: string;
}
interface FlagsState {
    darkMode: boolean;
}

const userSlice = createSlice<UserState>('user', () => ({ name: 'Guest' }));
const flagsSlice = createSlice<FlagsState>('flags', () => ({ darkMode: false }));
const vanillaStore = combineSlices({ user: userSlice, flags: flagsSlice });

const VanillaJsExample: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [logs, setLogs] = useState<string[]>([]);
    const counter = useRef(0);

    useEffect(() => {
        const unsub1 = vanillaStore.on('change', 'user.name', (s) => {
            setLogs((prev) => [...prev.slice(-19), `[combined] user.name => ${s.user.name}`]);
        });
        const unsub2 = userSlice.on('change', (s) => {
            setLogs((prev) => [...prev.slice(-19), `[user slice] ${JSON.stringify(s)}`]);
        });
        const unsub3 = flagsSlice.on('change', 'darkMode', (s) => {
            setLogs((prev) => [...prev.slice(-19), `[flags slice] darkMode=${s.darkMode}`]);
        });
        return () => {
            unsub1();
            unsub2();
            unsub3();
        };
    }, []);

    const setName = () => {
        counter.current += 1;
        userSlice.setState({ name: `User_${counter.current}` });
    };
    const toggleDark = () => vanillaStore.setState((s) => ({ flags: { ...s.flags, darkMode: !s.flags.darkMode } }));

    return (
        <>
            <ComponentDemo
                title="Framework-Agnostic Core"
                description="The slicing API is plain TypeScript. It runs in Node, web workers, plain DOM apps, or any non-React framework. React is an optional thin wrapper via createHook()."
                centered={false}
            >
                <div className="p-6 flex flex-col gap-4">
                    <div
                        className={cn('rounded-lg p-4 border flex flex-wrap gap-2', {
                            'border-white/10 bg-white/5': isDark,
                            'border-gray-200 bg-gray-50': !isDark,
                        })}
                    >
                        <Button label="Set user name" size="sm" onClick={setName} />
                        <Button label="Toggle darkMode (combined write)" size="sm" variant="secondary" onClick={toggleDark} />
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
                            Direct subscriber output (no React)
                        </div>
                        <div
                            className={cn('font-mono text-xs space-y-1 max-h-56 overflow-y-auto', {
                                'text-gray-300': isDark,
                                'text-gray-700': !isDark,
                            })}
                        >
                            {logs.length === 0 && (
                                <div className="italic opacity-50">Listeners are registered with store.on() — same API as plain JS.</div>
                            )}
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
                <CodeBlock code={code} language="ts" />
            </div>
        </>
    );
};

export default VanillaJsExample;
