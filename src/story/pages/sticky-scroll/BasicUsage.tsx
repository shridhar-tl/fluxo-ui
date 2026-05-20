import React, { useEffect, useRef, useState } from 'react';
import { Button, StickyScroll } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { StickyScroll } from 'fluxo-ui';

<StickyScroll maxHeight={320}>
    {messages.map((m) => (
        <div key={m.id}>{m.text}</div>
    ))}
</StickyScroll>`;

interface FeedEntry {
    id: number;
    text: string;
}

const lines = [
    'Agent connected to the bound tab.',
    'Reading page info — title, URL, ready state.',
    'Clicking the "New invoice" button.',
    'Filling customer name with "Acme Corp".',
    'Selecting currency: USD.',
    'Waiting for the line-items table to render.',
    'Inspecting the computed total.',
    'Capturing a screenshot for the step.',
    'Validating the success toast appeared.',
];

const BasicUsage: React.FC = () => {
    const [entries, setEntries] = useState<FeedEntry[]>(() =>
        lines.slice(0, 4).map((text, id) => ({ id, text })),
    );
    const counter = useRef<number>(4);

    useEffect(() => {
        const timer = setInterval(() => {
            setEntries((prev) => {
                const next = lines[counter.current % lines.length];
                const entry: FeedEntry = { id: counter.current, text: next };
                counter.current += 1;
                return [...prev, entry];
            });
        }, 1800);
        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <ComponentDemo
                title="Live activity feed"
                description="New rows stream in every 1.8s. While you are at the bottom the view auto-follows. Scroll up to read an older row and it stays put — a 'jump to latest' button appears so you can re-pin."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <StickyScroll
                        maxHeight={300}
                        role="log"
                        ariaLabel="Activity feed"
                        className="eui-demo-sticky"
                    >
                        {entries.map((entry) => (
                            <div
                                key={entry.id}
                                style={{
                                    padding: '10px 14px',
                                    borderBottom: '1px solid var(--eui-border-subtle)',
                                    color: 'var(--eui-text)',
                                    fontSize: 13,
                                }}
                            >
                                <span style={{ color: 'var(--eui-text-muted)', marginRight: 8 }}>
                                    #{entry.id + 1}
                                </span>
                                {entry.text}
                            </div>
                        ))}
                    </StickyScroll>
                    <div
                        style={{
                            display: 'flex',
                            gap: 8,
                            padding: '10px 14px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                        }}
                    >
                        <Button
                            size="sm"
                            label="Add row"
                            onClick={() =>
                                setEntries((prev) => {
                                    const next = lines[counter.current % lines.length];
                                    const entry: FeedEntry = { id: counter.current, text: next };
                                    counter.current += 1;
                                    return [...prev, entry];
                                })
                            }
                        />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
