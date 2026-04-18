import React from 'react';
import { CountdownTimer } from '../../../components';
import type { CountdownTimerSize } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const sizes: CountdownTimerSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

const code = `<CountdownTimer duration={60} variant="circular" size="xs" />
<CountdownTimer duration={60} variant="circular" size="sm" />
<CountdownTimer duration={60} variant="circular" size="md" />
<CountdownTimer duration={60} variant="circular" size="lg" />
<CountdownTimer duration={60} variant="circular" size="xl" />`;

const Sizes: React.FC = () => (
    <>
        <ComponentDemo
            title="Sizes"
            description="Five sizes from xs to xl — applies to all variants."
            centered={false}
        >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 32, padding: 16 }}>
                {sizes.map((s) => (
                    <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <CountdownTimer duration={60} variant="circular" size={s} showControls={false} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s}</span>
                    </div>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Sizes;
