import React from 'react';
import { Timeline } from '../../../components';
import type { TimelineEvent } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const events: TimelineEvent[] = [
    { id: '1', title: 'Founded', description: 'Company was founded in a small garage with a big dream.', timestamp: '2018', color: 'primary' },
    { id: '2', title: 'Series A Funding', description: 'Raised $5M in Series A to expand the team.', timestamp: '2019', color: 'success' },
    { id: '3', title: 'Product Launch', description: 'Launched the flagship product to 10,000 users.', timestamp: '2020', color: 'info' },
    { id: '4', title: 'Global Expansion', description: 'Opened offices in 3 new countries across Europe and Asia.', timestamp: '2021', color: 'warning' },
    { id: '5', title: 'IPO', description: 'Went public on the NASDAQ stock exchange.', timestamp: '2023', color: 'danger' },
    { id: '6', title: '1M Users', description: 'Reached one million active users worldwide.', timestamp: '2024', color: 'success' },
];

const code = `import { Timeline } from 'ether-ui';

<Timeline
  events={events}
  align="alternate"
  connectorStyle="dashed"
/>`;

const AlternateAlignment: React.FC = () => (
    <>
        <ComponentDemo title="Alternate Alignment" description="Events alternate between left and right sides of the timeline axis." centered={false}>
            <div className="w-full max-w-2xl mx-auto">
                <Timeline events={events} align="alternate" connectorStyle="dashed" />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default AlternateAlignment;
