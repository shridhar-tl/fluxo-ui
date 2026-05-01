import React, { useEffect, useRef, useState } from 'react';
import { ScrollToTop } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<ScrollToTop showProgress size="lg" gradient={{ from: '#3b82f6', to: '#a855f7' }} />`;

const filler = Array.from({ length: 40 });

const WithProgress: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [container, setContainer] = useState<HTMLElement | null>(null);
    useEffect(() => {
        setContainer(containerRef.current);
    }, []);
    return (
        <>
            <ComponentDemo
                title="With Progress Ring"
                description="Set showProgress to draw a circular ring tracking how far down the user has scrolled. Pair with a gradient for a striking effect."
            >
                <div
                    ref={containerRef}
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: 360,
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
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
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
                                <ScrollToTop
                                    target={container}
                                    mode="inline"
                                    showAfter={80}
                                    showProgress
                                    size="lg"
                                    gradient={{ from: '#3b82f6', to: '#a855f7' }}
                                />
                            </div>
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

export default WithProgress;
