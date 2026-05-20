import React, { useRef, useState } from 'react';
import { Button, StickyScroll } from '../../../components';
import type { StickyScrollHandle } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `const ref = useRef<StickyScrollHandle>(null);

<StickyScroll ref={ref} maxHeight={300} onPinnedChange={setPinned}>
    {rows}
</StickyScroll>

<Button label="Scroll to bottom" onClick={() => ref.current?.scrollToBottom()} />`;

const Imperative: React.FC = () => {
    const ref = useRef<StickyScrollHandle>(null);
    const [rows, setRows] = useState<number[]>(() => Array.from({ length: 20 }, (_, i) => i));
    const [pinned, setPinned] = useState<boolean>(true);
    const counter = useRef<number>(20);

    return (
        <>
            <ComponentDemo
                title="Imperative handle & pinned state"
                description="Call scrollToBottom() via a ref, and observe pinned state through onPinnedChange. Useful for a custom 'send' button that always re-pins."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <StickyScroll ref={ref} maxHeight={300} onPinnedChange={setPinned} ariaLabel="Items">
                        {rows.map((row) => (
                            <div
                                key={row}
                                style={{
                                    padding: '10px 14px',
                                    borderBottom: '1px solid var(--eui-border-subtle)',
                                    color: 'var(--eui-text)',
                                    fontSize: 13,
                                }}
                            >
                                Item {row + 1}
                            </div>
                        ))}
                    </StickyScroll>
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 14px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                        }}
                    >
                        <Button
                            size="sm"
                            label="Add item"
                            onClick={() =>
                                setRows((prev) => {
                                    const next = counter.current;
                                    counter.current += 1;
                                    return [...prev, next];
                                })
                            }
                        />
                        <Button size="sm" layout="outlined" label="Scroll to bottom" onClick={() => ref.current?.scrollToBottom()} />
                        <span style={{ color: 'var(--eui-text-muted)', fontSize: 13 }}>
                            pinned: <strong style={{ color: 'var(--eui-text)' }}>{String(pinned)}</strong>
                        </span>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Imperative;
