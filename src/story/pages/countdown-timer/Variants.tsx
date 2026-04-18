import React from 'react';
import { CountdownTimer } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `// Circular — ring arc progress
<CountdownTimer duration={60} variant="circular" />

// Rounded Square — rounded rectangle border progress
<CountdownTimer duration={60} variant="rounded-square" />

// Triangle — equilateral triangle border progress
<CountdownTimer duration={60} variant="triangle" />

// Linear — horizontal bar progress
<CountdownTimer duration={60} variant="linear" />

// Segmented — equal blocks that disappear one by one
<CountdownTimer duration={60} variant="segmented" segmentCount={20} />

// Numeric — styled digit display
<CountdownTimer duration={3723} variant="numeric" />`;

const shapeVariants = [
    { key: 'circular', label: 'Circular' },
    { key: 'rounded-square', label: 'Rounded Square' },
    { key: 'triangle', label: 'Triangle' },
] as const;


const Variants: React.FC = () => (
    <>
        <ComponentDemo
            title="Shape Variants"
            description="Three SVG border-progress shapes: circular ring, rounded square, and equilateral triangle."
            centered={false}
        >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, padding: 16, alignItems: 'flex-end', justifyContent: 'center' }}>
                {shapeVariants.map(({ key, label }) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                        <CountdownTimer duration={60} variant={key} size="md" />
                    </div>
                ))}
            </div>
        </ComponentDemo>

        <ComponentDemo
            title="Other Variants"
            description="Linear bar, segmented blocks, and large numeric digit display."
            centered={false}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Linear</span>
                    <CountdownTimer duration={60} variant="linear" size="md" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Segmented (20 blocks, single uniform row)</span>
                    <CountdownTimer duration={60} variant="segmented" size="md" segmentCount={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Numeric</span>
                    <CountdownTimer duration={3723} variant="numeric" size="md" />
                </div>
            </div>
        </ComponentDemo>

        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Variants;
