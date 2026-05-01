import React from 'react';
import { ActivityGauge } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { ActivityGauge } from 'fluxo-ui';

<ActivityGauge
  size="lg"
  centerTitle="ACTIVITY"
  centerValue="73%"
  centerSubLabel="of weekly goal"
  series={[
    { name: 'Move', value: 320, max: 500, color: '#ef4444' },
    { name: 'Exercise', value: 28, max: 30, color: '#22c55e' },
    { name: 'Stand', value: 9, max: 12, color: '#3b82f6' },
  ]}
/>`;

const series = [
    { name: 'Move', value: 320, max: 500, color: '#ef4444' },
    { name: 'Exercise', value: 28, max: 30, color: '#22c55e' },
    { name: 'Stand', value: 9, max: 12, color: '#3b82f6' },
];

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo
            title="Default Activity Gauge"
            description="A multi-series ring chart with a centered metric and a legend below."
        >
            <ActivityGauge
                size="lg"
                centerTitle="ACTIVITY"
                centerValue="73%"
                centerSubLabel="of weekly goal"
                series={series}
            />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
