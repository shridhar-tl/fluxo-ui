import React from 'react';
import { AnimateOnView } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { AnimateOnView } from 'fluxo-ui';

<AnimateOnView animation="fadeInUp">
  <div>This content animates when scrolled into view</div>
</AnimateOnView>`;

const BasicUsage: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Fade In Up" description="Default animation triggers once when the element enters the viewport.">
                <div className="space-y-4">
                    <AnimateOnView animation="fadeInUp">
                        <div className="p-6 rounded-lg bg-[var(--eui-primary-subtle)] border border-[var(--eui-primary-border)] text-center">
                            <p className="text-lg font-semibold" style={{ color: 'var(--eui-primary)' }}>
                                Fade In Up
                            </p>
                            <p className="text-sm" style={{ color: 'var(--eui-text-muted)' }}>
                                Scroll down and back to see this animate
                            </p>
                        </div>
                    </AnimateOnView>
                    <AnimateOnView animation="fadeIn" delay={200}>
                        <div className="p-6 rounded-lg bg-[var(--eui-bg-subtle)] border border-[var(--eui-border)] text-center">
                            <p className="text-lg font-semibold" style={{ color: 'var(--eui-text)' }}>
                                Fade In
                            </p>
                            <p className="text-sm" style={{ color: 'var(--eui-text-muted)' }}>
                                With 200ms delay
                            </p>
                        </div>
                    </AnimateOnView>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
