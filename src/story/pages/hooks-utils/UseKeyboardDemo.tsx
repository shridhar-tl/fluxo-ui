import cn from 'classnames';
import React, { useState } from 'react';
import { useKeyboard } from '../../../hooks/useKeyboard';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `import { useKeyboard } from 'fluxo-ui/hooks';

useKeyboard({
  ArrowUp: () => moveUp(),
  ArrowDown: () => moveDown(),
  Escape: () => close(),
}, enabled);`;

const UseKeyboardDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [enabled, setEnabled] = useState(true);
    const [log, setLog] = useState<string[]>([]);
    const [position, setPosition] = useState({ x: 2, y: 2 });

    useKeyboard(
        {
            ArrowUp: () => {
                setPosition((p) => ({ ...p, y: Math.max(0, p.y - 1) }));
                setLog((prev) => [...prev.slice(-5), 'ArrowUp pressed']);
            },
            ArrowDown: () => {
                setPosition((p) => ({ ...p, y: Math.min(4, p.y + 1) }));
                setLog((prev) => [...prev.slice(-5), 'ArrowDown pressed']);
            },
            ArrowLeft: () => {
                setPosition((p) => ({ ...p, x: Math.max(0, p.x - 1) }));
                setLog((prev) => [...prev.slice(-5), 'ArrowLeft pressed']);
            },
            ArrowRight: () => {
                setPosition((p) => ({ ...p, x: Math.min(4, p.x + 1) }));
                setLog((prev) => [...prev.slice(-5), 'ArrowRight pressed']);
            },
        },
        enabled,
    );

    return (
        <>
            <ComponentDemo
                title="useKeyboard"
                description="Registers global keyboard event handlers. Supports enabling/disabling and auto-cleanup."
            >
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--eui-text-muted)' }}>
                        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                        Keyboard handling enabled
                    </label>

                    <p className="text-xs" style={{ color: 'var(--eui-text-muted)' }}>
                        Use arrow keys to move the blue dot:
                    </p>

                    <div className="inline-grid grid-cols-5 gap-1">
                        {Array.from({ length: 25 }, (_, i) => {
                            const x = i % 5;
                            const y = Math.floor(i / 5);
                            const isActive = x === position.x && y === position.y;
                            return (
                                <div
                                    key={i}
                                    className={cn('w-10 h-10 rounded border flex items-center justify-center transition-all', {
                                        'border-white/10': isDark && !isActive,
                                        'border-gray-200': !isDark && !isActive,
                                    })}
                                    style={
                                        isActive ? { backgroundColor: 'var(--eui-primary)', borderColor: 'var(--eui-primary)' } : undefined
                                    }
                                >
                                    {isActive && <div className="w-3 h-3 rounded-full bg-white" />}
                                </div>
                            );
                        })}
                    </div>

                    {log.length > 0 && (
                        <div className={cn('p-2 rounded text-xs font-mono space-y-0.5', { 'bg-white/5': isDark, 'bg-gray-50': !isDark })}>
                            {log.map((entry, i) => (
                                <div key={i} style={{ color: 'var(--eui-text-muted)' }}>
                                    {entry}
                                </div>
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

export default UseKeyboardDemo;
