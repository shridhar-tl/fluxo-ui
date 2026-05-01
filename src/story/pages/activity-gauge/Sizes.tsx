import React from 'react';
import { ActivityGauge } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const series = [
    { name: 'Read', value: 70 },
    { name: 'Watch', value: 45 },
    { name: 'Write', value: 80 },
];

const code = `<ActivityGauge size="sm" series={series} centerValue="65%" />
<ActivityGauge size="md" series={series} centerValue="65%" />
<ActivityGauge size="lg" series={series} centerValue="65%" />
<ActivityGauge size="xl" series={series} centerValue="65%" />`;

const Sizes: React.FC = () => (
    <>
        <ComponentDemo title="Sizes" description="sm, md, lg, and xl preset sizes — or supply a custom number.">
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityGauge size="sm" series={series} centerValue="65%" legend="none" />
                <ActivityGauge size="md" series={series} centerValue="65%" legend="none" />
                <ActivityGauge size="lg" series={series} centerValue="65%" legend="none" />
                <ActivityGauge size="xl" series={series} centerValue="65%" legend="none" />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Sizes;
