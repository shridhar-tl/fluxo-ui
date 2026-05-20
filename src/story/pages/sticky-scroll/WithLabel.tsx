import React, { useEffect, useRef, useState } from 'react';
import { StickyScroll } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<StickyScroll maxHeight={300} jumpButtonLabel="Jump to latest">
    {rows}
</StickyScroll>`;

const WithLabel: React.FC = () => {
    const [rows, setRows] = useState<number[]>(() => Array.from({ length: 6 }, (_, i) => i));
    const counter = useRef<number>(6);

    useEffect(() => {
        const timer = setInterval(() => {
            setRows((prev) => {
                const next = counter.current;
                counter.current += 1;
                return [...prev, next];
            });
        }, 2200);
        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <ComponentDemo
                title="Labelled jump button"
                description="Pass jumpButtonLabel to render a pill with text instead of the icon-only chevron. It only shows while the user has scrolled away from the bottom."
            >
                <div style={{ width: '100%' }}>
                    <StickyScroll maxHeight={300} jumpButtonLabel="Jump to latest" ariaLabel="Build log">
                        {rows.map((row) => (
                            <div
                                key={row}
                                style={{
                                    padding: '10px 14px',
                                    borderBottom: '1px solid var(--eui-border-subtle)',
                                    color: 'var(--eui-text)',
                                    fontSize: 13,
                                    fontFamily: 'var(--eui-font-mono, ui-monospace, monospace)',
                                }}
                            >
                                line {row + 1}: compiled module successfully
                            </div>
                        ))}
                    </StickyScroll>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default WithLabel;
