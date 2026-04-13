import React from 'react';
import { Timeline } from '../../../components';
import type { TimelineEvent } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const events: TimelineEvent[] = [
    { id: '1', title: 'Research', timestamp: 'Week 1', color: 'primary' },
    { id: '2', title: 'Design', timestamp: 'Week 2-3', color: 'info' },
    { id: '3', title: 'Development', timestamp: 'Week 4-8', color: 'warning' },
    { id: '4', title: 'Testing', timestamp: 'Week 9-10', color: 'danger' },
    { id: '5', title: 'Launch', timestamp: 'Week 11', color: 'success' },
];

const code = `import { Timeline } from 'ether-ui';

<Timeline
  events={events}
  layout="horizontal"
/>`;

const HorizontalLayout: React.FC = () => (
    <>
        <ComponentDemo title="Horizontal Timeline" description="A horizontal layout for project milestones or step-based workflows." centered={false}>
            <div className="w-full overflow-x-auto">
                <Timeline events={events} layout="horizontal" />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default HorizontalLayout;
