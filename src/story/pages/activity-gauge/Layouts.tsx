import React from 'react';
import { ActivityGauge } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const series = [
    { name: 'Mobile', value: 78 },
    { name: 'Desktop', value: 56 },
    { name: 'Tablet', value: 32 },
];

const code = `<ActivityGauge series={series} legend="bottom" centerValue="55%" />
<ActivityGauge series={series} legend="right" centerValue="55%" />
<ActivityGauge series={series} legend="none" centerValue="55%" />`;

const Layouts: React.FC = () => (
    <>
        <ComponentDemo
            title="Legend Placement"
            description="Render the legend below, beside the gauge, or hide it entirely."
        >
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center' }}>
                <ActivityGauge size="md" series={series} legend="bottom" centerValue="55%" />
                <ActivityGauge size="md" series={series} legend="right" centerValue="55%" />
                <ActivityGauge size="md" series={series} legend="none" centerValue="55%" />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Layouts;
