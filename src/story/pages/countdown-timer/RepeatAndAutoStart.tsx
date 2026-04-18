import React from 'react';
import { CountdownTimer } from '../../../components/CountdownTimer';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `// Repeat: automatically restarts when completed
<CountdownTimer duration={15} repeat={true} />

// Manual start: does not start until you press play
<CountdownTimer duration={30} autoStart={false} />`;

const RepeatAndAutoStart: React.FC = () => (
    <>
        <ComponentDemo
            title="Repeat & Auto-Start"
            description="Use repeat to loop infinitely on completion. Use autoStart={false} to let the user start manually."
            centered={false}
        >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, padding: 16, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Repeat (15s loop)</span>
                    <CountdownTimer duration={15} variant="circular" size="md" repeat />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Manual Start</span>
                    <CountdownTimer duration={30} variant="circular" size="md" autoStart={false} />
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default RepeatAndAutoStart;
