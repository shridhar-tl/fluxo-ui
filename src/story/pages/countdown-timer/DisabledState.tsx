import React from 'react';
import { CountdownTimer } from '../../../components/CountdownTimer';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `// Disabled with default "Off" label
<CountdownTimer duration={30} disabled />

// Disabled with custom message
<CountdownTimer duration={30} disabled disabledMessage="Unavailable" />`;

const DisabledState: React.FC = () => (
    <>
        <ComponentDemo
            title="Disabled State"
            description="Disable the timer entirely and show a custom badge message. All interaction is blocked."
            centered={false}
        >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, padding: 16, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Default "Off"</span>
                    <CountdownTimer duration={30} variant="circular" size="md" disabled />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Custom message</span>
                    <CountdownTimer duration={30} variant="circular" size="md" disabled disabledMessage="Unavailable" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 280 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Linear disabled</span>
                    <CountdownTimer duration={30} variant="linear" size="md" disabled disabledMessage="Not active" />
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default DisabledState;
