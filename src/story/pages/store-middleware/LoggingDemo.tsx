import cn from 'classnames';
import React, { useState } from 'react';
import { create, createHook } from '../../../store';
import { loggerMiddleware } from '../../../store/middlewares';
import { Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface LogState {
    count: number;
    label: string;
}

const logStore = create<LogState>(() => ({ count: 0, label: 'Hello' }), [loggerMiddleware()]);
const useLogStore = createHook(logStore);

const loggingCode = `import { create, createHook } from 'ether-ui/store';
import { loggerMiddleware } from 'ether-ui/store/middlewares';

const store = create<{ count: number; label: string }>(
  () => ({ count: 0, label: 'Hello' }),
  [loggerMiddleware()]
);
const useStore = createHook(store);

// With predicate — only log when count changes
const store2 = create<{ count: number }>(
  () => ({ count: 0 }),
  [loggerMiddleware((state, previous) => state.count !== previous?.count)]
);

// Open browser DevTools console to see logs`;

const LoggingDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const { count, label } = useLogStore();
    const [showHint, setShowHint] = useState(true);

    return (
        <>
            <ComponentDemo title="Logger" description="Logs state changes to the browser console with loggerMiddleware">
                <div className="flex flex-col items-center gap-4">
                    {showHint && (
                        <div className={cn('text-xs px-4 py-2 rounded-lg flex items-center gap-2', {
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20': isDark,
                            'bg-blue-50 text-blue-700 border border-blue-200': !isDark,
                        })}>
                            Open browser DevTools console to see the logs
                            <Button label="×" size="xs" layout="plain" onClick={() => setShowHint(false)} />
                        </div>
                    )}
                    <div className={cn('text-sm', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                        Count: <span className="font-bold text-[var(--eui-primary)]">{count}</span>
                        {' · '}
                        Label: <span className="font-bold text-[var(--eui-primary)]">{label}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button label="Increment" size="sm" onClick={() => logStore.setState((s) => ({ count: s.count + 1 }))} />
                        <Button
                            label="Change Label"
                            size="sm"
                            onClick={() => logStore.setState({ label: label === 'Hello' ? 'World' : 'Hello' })}
                        />
                        <Button label="Reset" size="sm" variant="secondary" onClick={() => logStore.reset()} />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={loggingCode} language="tsx" />
            </div>
        </>
    );
};

export default LoggingDemo;
