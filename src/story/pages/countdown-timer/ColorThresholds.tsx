import React from 'react';
import { CountdownTimer } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

// Short duration so the thresholds are visibly crossed within seconds of loading.
// at: 66 → when ≤66% remaining (i.e. after first ~7s of a 20s timer) → warning
// at: 33 → when ≤33% remaining (i.e. after first ~13s) → danger
const thresholds = [
    { at: 66, color: 'warning' as const },
    { at: 33, color: 'danger' as const },
];

const code = `// Auto color-shift: primary → warning → danger as time runs out
// 'at' means "when remaining % is AT OR BELOW this value"
<CountdownTimer
  duration={20}
  variant="circular"
  colorThresholds={[
    { at: 66, color: 'warning' },  // ≤66% left → warning amber
    { at: 33, color: 'danger' },   // ≤33% left → danger red
  ]}
  repeat
/>

// Static semantic colors
<CountdownTimer duration={20} variant="circular" color="success" />
<CountdownTimer duration={20} variant="circular" color="warning" />
<CountdownTimer duration={20} variant="circular" color="danger" />

// Custom hex color
<CountdownTimer duration={20} variant="circular" color="#8b5cf6" />`;

const ColorThresholds: React.FC = () => (
    <>
        <ComponentDemo
            title="Color Thresholds"
            description="Watch the auto-shift timer below — it starts primary blue, turns warning amber at ≤66% remaining, then danger red at ≤33%. Set repeat so you can observe the full cycle."
            centered={false}
        >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, padding: 16, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Auto-shift (repeat)</span>
                    <CountdownTimer duration={20} variant="circular" size="md" colorThresholds={thresholds} repeat />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Success</span>
                    <CountdownTimer duration={20} variant="circular" size="md" color="success" repeat />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Warning</span>
                    <CountdownTimer duration={20} variant="circular" size="md" color="warning" repeat />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Danger</span>
                    <CountdownTimer duration={20} variant="circular" size="md" color="danger" repeat />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Custom #8b5cf6</span>
                    <CountdownTimer duration={20} variant="circular" size="md" color="#8b5cf6" repeat />
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default ColorThresholds;
