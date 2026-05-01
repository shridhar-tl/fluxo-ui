import React, { useEffect, useRef, useState } from 'react';
import { ScrollToTop } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { ScrollToTop } from 'fluxo-ui';

// Mounted at the app root; auto-shows after 200px of scroll
<ScrollToTop showAfter={200} />`;

const filler = Array.from({ length: 30 });

const BasicUsage: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [container, setContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setContainer(containerRef.current);
    }, []);

    return (
        <>
            <ComponentDemo
                title="Default Scroll-To-Top"
                description="The button is mounted once at the app root and watches the page scroll. Below is a self-contained scroll demo — scroll inside the panel and the embedded button appears in the bottom-right corner."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div
                        ref={containerRef}
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: 320,
                            overflowY: 'auto',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 8,
                            padding: 16,
                        }}
                    >
                        <h4 style={{ marginTop: 0, color: 'var(--eui-text)' }}>Scroll me</h4>
                        {filler.map((_, idx) => (
                            <p key={idx} style={{ color: 'var(--eui-text-muted)', lineHeight: 1.6 }}>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
                            </p>
                        ))}
                        {container && (
                            <div
                                style={{
                                    position: 'sticky',
                                    bottom: 12,
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    pointerEvents: 'none',
                                }}
                            >
                                <div style={{ pointerEvents: 'auto' }}>
                                    <ScrollToTop target={container} mode="inline" showAfter={120} size="md" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div
                        style={{
                            padding: '10px 14px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            fontSize: 12,
                            color: 'var(--eui-text-muted)',
                        }}
                    >
                        In production, drop a single <code>&lt;ScrollToTop /&gt;</code> at your app root. It tracks{' '}
                        <code>window</code> by default and floats over the viewport.
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
