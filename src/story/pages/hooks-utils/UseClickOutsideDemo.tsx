import cn from 'classnames';
import React, { useRef, useState } from 'react';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `import { useClickOutside } from 'ether-ui/hooks';

const ref = useRef<HTMLDivElement>(null);
const [open, setOpen] = useState(false);

useClickOutside(ref, () => setOpen(false), open);`;

const UseClickOutsideDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [open, setOpen] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const boxRef = useRef<HTMLDivElement>(null);

    useClickOutside(boxRef, () => {
        if (open) {
            setOpen(false);
            setClickCount((c) => c + 1);
        }
    }, open);

    return (
        <>
            <ComponentDemo title="useClickOutside" description="Detects clicks outside a referenced element. Commonly used for closing dropdowns, modals, and popups.">
                <div className="space-y-3">
                    <button
                        onClick={() => setOpen(true)}
                        className="px-4 py-2 rounded-md text-sm font-medium"
                        style={{ backgroundColor: 'var(--eui-primary)', color: 'var(--eui-text-on-primary)' }}
                    >
                        Open Panel
                    </button>

                    {open && (
                        <div
                            ref={boxRef}
                            className={cn('p-5 rounded-lg border-2 max-w-sm', {
                                'bg-white/5 border-[var(--eui-primary)]': isDark,
                                'bg-white border-[var(--eui-primary)] shadow-lg': !isDark,
                            })}
                        >
                            <p className="font-semibold mb-1" style={{ color: 'var(--eui-text)' }}>Active Panel</p>
                            <p className="text-sm" style={{ color: 'var(--eui-text-muted)' }}>Click outside this panel to close it.</p>
                        </div>
                    )}

                    <p className="text-xs" style={{ color: 'var(--eui-text-muted)' }}>
                        Outside clicks detected: <span className="font-mono" style={{ color: 'var(--eui-primary)' }}>{clickCount}</span>
                    </p>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default UseClickOutsideDemo;
