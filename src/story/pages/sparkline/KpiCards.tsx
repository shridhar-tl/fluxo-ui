import React from 'react';

import { Card, Sparkline, Tag } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { kpiCards } from './sparkline-story-data';

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
    width: '100%',
};

const code = `<Card padding="md">
    <span>Monthly revenue</span>
    <strong>$81.4k</strong>
    <Tag color="success" size="xs">+12.5%</Tag>
    <Sparkline type="area" data={revenue} width="100%" height={44} dots="last" />
</Card>`;

const KpiCards: React.FC = () => (
    <>
        <ComponentDemo title="KPI Stat Cards" description="Fluid width sparklines fill their container and resize with it.">
            <div style={gridStyle}>
                {kpiCards.map((kpi) => (
                    <Card key={kpi.id} padding="md">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--eui-text-muted)', fontSize: '0.8125rem', fontWeight: 500 }}>{kpi.title}</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem' }}>
                                <strong style={{ color: 'var(--eui-text)', fontSize: '1.625rem', fontWeight: 700, lineHeight: 1.1 }}>{kpi.value}</strong>
                                <Tag color={kpi.positive ? 'success' : 'danger'} size="xs" shape="pill">
                                    {kpi.delta}
                                </Tag>
                            </div>
                            <Sparkline type={kpi.type} data={kpi.data} color={kpi.color} width="100%" height={44} dots="last" valueLabel={kpi.title} />
                            <span style={{ color: 'var(--eui-text-muted)', fontSize: '0.75rem' }}>Last 12 months</span>
                        </div>
                    </Card>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default KpiCards;
