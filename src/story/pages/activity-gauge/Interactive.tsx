import React, { useState } from 'react';
import { ActivityGauge } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<ActivityGauge interactive series={series} onSeriesClick={(idx) => setSelected(idx)} />`;

const series = [
    { name: 'Frontend', value: 88 },
    { name: 'Backend', value: 64 },
    { name: 'DB', value: 42 },
    { name: 'Infra', value: 26 },
];

const Interactive: React.FC = () => {
    const [selected, setSelected] = useState<number | null>(null);
    return (
        <>
            <ComponentDemo
                title="Interactive Highlights"
                description="Hover or focus a ring or legend item to highlight that series. Click any item to handle a select event."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
                    <ActivityGauge
                        size="lg"
                        interactive
                        series={series}
                        centerTitle="UPTIME"
                        centerValue="55%"
                        onSeriesClick={(idx) => setSelected(idx)}
                    />
                    <div
                        style={{
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            fontSize: 13,
                            minWidth: 200,
                            textAlign: 'center',
                        }}
                    >
                        Selected:{' '}
                        <strong>{selected != null ? series[selected].name : '—'}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Interactive;
