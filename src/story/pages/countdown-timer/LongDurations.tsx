import React from 'react';
import { CountdownTimer } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `// 2 hours = 7200 seconds → displays "02:00 hrs"
<CountdownTimer duration={7200} variant="circular" />

// 1.5 days = 129600 seconds → displays days + hours
<CountdownTimer duration={129600} variant="numeric" />

// 90 minutes = 5400 seconds → displays "01:30 min"
<CountdownTimer duration={5400} variant="linear" />`;

const LongDurations: React.FC = () => (
    <>
        <ComponentDemo
            title="Long Durations"
            description="When duration exceeds 60s the display auto-promotes to minutes, hours, or days. Pass seconds only."
            centered={false}
        >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, padding: 16, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>2h circular</span>
                    <CountdownTimer duration={7200} variant="circular" size="md" autoStart={false} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>1.5 days numeric</span>
                    <CountdownTimer duration={129600} variant="numeric" size="sm" autoStart={false} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 300 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>90 min linear</span>
                    <CountdownTimer duration={5400} variant="linear" size="md" autoStart={false} />
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default LongDurations;
