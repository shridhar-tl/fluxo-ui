import React from 'react';
import { PullToRefresh } from '../../../components';
import type { PullToRefreshVariant } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const variantCode = `<PullToRefresh variant="dots" onRefresh={refresh}>
    {/* scrollable content */}
</PullToRefresh>`;

const variantList: { variant: PullToRefreshVariant; title: string; description: string }[] = [
    { variant: 'spinner', title: 'Spinner (default)', description: 'A refresh icon that rotates with pull progress and spins while refreshing.' },
    { variant: 'arrow', title: 'Arrow', description: 'An arrow that flips upside down once the threshold is reached.' },
    { variant: 'dots', title: 'Dots', description: 'Three bouncing dots — minimal and unobtrusive.' },
    { variant: 'minimal', title: 'Minimal', description: 'Just a thin progress bar with no text label.' },
];

const VariantPanel: React.FC<{ variant: PullToRefreshVariant; title: string; description: string }> = ({ variant, title, description }) => (
    <ComponentDemo title={title} description={description}>
        <div style={{
            width: '100%',
            height: 200,
            border: '1px solid var(--eui-border-subtle)',
            borderRadius: 8,
            overflow: 'hidden',
            background: 'var(--eui-bg-subtle)',
        }}>
            <PullToRefresh variant={variant} onRefresh={() => wait(1200)}>
                <div style={{ padding: 16, color: 'var(--eui-text-muted)' }}>
                    Drag down inside this panel to trigger a 1.2s refresh using the <strong style={{ color: 'var(--eui-text)' }}>{variant}</strong> indicator.
                </div>
            </PullToRefresh>
        </div>
    </ComponentDemo>
);

const Variants: React.FC = () => (
    <>
        {variantList.map((v) => (
            <div key={v.variant} className="mb-4">
                <VariantPanel {...v} />
            </div>
        ))}
        <CodeBlock code={variantCode} language="tsx" />
    </>
);

export default Variants;
