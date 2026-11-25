import React from 'react';

import { Card, Sparkline } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { stackStyle } from '../../demo-styles';
import { bulletRows, trafficLabels, typeGallery } from './sparkline-story-data';

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    width: '100%',
};

const code = `<Sparkline type="line" data={data} />
<Sparkline type="area" data={data} />
<Sparkline type="bar" data={profit} />
<Sparkline type="winloss" data={[1, 1, -1, 1, 0, -1]} />
<Sparkline type="discrete" data={data} />
<Sparkline type="pie" data={[48, 27, 15, 10]} width={40} height={40} innerRadius={0.6} />
<Sparkline type="bullet" data={[82]} target={90} ranges={[60, 85, 100]} />`;

const TypesGallery: React.FC = () => (
    <>
        <ComponentDemo title="Chart Types" description="Seven chart types cover trends, distributions, outcomes and progress to target.">
            <div style={stackStyle}>
                <div style={gridStyle}>
                    {typeGallery.map((item) => (
                        <Card key={item.type} title={item.title} padding="sm">
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 56 }}>
                                {item.type === 'pie' ? (
                                    <Sparkline
                                        type="pie"
                                        data={item.data.map((value, index) => ({ value, label: trafficLabels[index] }))}
                                        width={52}
                                        height={52}
                                        innerRadius={0.6}
                                        valueLabel="Traffic share"
                                        formatValue={(v) => `${v}%`}
                                    />
                                ) : (
                                    <Sparkline type={item.type} data={item.data} width="100%" height={48} valueLabel={item.title} />
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
                <Card title="Bullet" subtitle="Value against target with qualitative ranges" padding="sm">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {bulletRows.map((row) => (
                            <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 48px', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ color: 'var(--eui-text-muted)', fontSize: '0.8125rem' }}>{row.label}</span>
                                <Sparkline type="bullet" data={[row.value]} target={row.target} ranges={row.ranges} width="100%" height={18} valueLabel={row.label} />
                                <span style={{ color: 'var(--eui-text)', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right' }}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default TypesGallery;
