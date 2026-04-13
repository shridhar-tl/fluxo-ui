import cn from 'classnames';
import React, { useState } from 'react';
import { useDebounce } from '../../../hooks';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `import { useDebounce } from 'ether-ui/hooks';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);

// debouncedSearch only updates 500ms after the user stops typing`;

const UseDebounceDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [value, setValue] = useState('');
    const debouncedValue = useDebounce(value, 500);
    const [log, setLog] = useState<string[]>([]);

    React.useEffect(() => {
        if (debouncedValue) {
            setLog((prev) => [...prev.slice(-4), `Debounced: "${debouncedValue}" at ${new Date().toLocaleTimeString()}`]);
        }
    }, [debouncedValue]);

    return (
        <>
            <ComponentDemo title="useDebounce" description="Debounces a value update by a specified delay. Useful for search inputs, API calls, etc.">
                <div className="space-y-3 max-w-md">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Type something..."
                        className={cn('w-full px-3 py-2 rounded-md border text-sm', {
                            'bg-white/5 border-white/15 text-gray-200': isDark,
                            'bg-white border-gray-300 text-gray-800': !isDark,
                        })}
                    />
                    <div className="flex gap-4 text-sm">
                        <div>
                            <span style={{ color: 'var(--eui-text-muted)' }}>Instant: </span>
                            <span className="font-mono" style={{ color: 'var(--eui-text)' }}>{value || '(empty)'}</span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--eui-text-muted)' }}>Debounced (500ms): </span>
                            <span className="font-mono" style={{ color: 'var(--eui-primary)' }}>{debouncedValue || '(empty)'}</span>
                        </div>
                    </div>
                    {log.length > 0 && (
                        <div className={cn('p-3 rounded-md text-xs font-mono space-y-1', {
                            'bg-white/5': isDark,
                            'bg-gray-50': !isDark,
                        })}>
                            {log.map((entry, i) => (
                                <div key={i} style={{ color: 'var(--eui-text-muted)' }}>{entry}</div>
                            ))}
                        </div>
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default UseDebounceDemo;
