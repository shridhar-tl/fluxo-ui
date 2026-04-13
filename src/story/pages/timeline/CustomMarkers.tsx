import React from 'react';
import type { TimelineEvent } from '../../../components';
import { Timeline } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const checkIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const starIcon = (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

const rocketIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
        />
    </svg>
);

const events: TimelineEvent[] = [
    { id: '1', title: 'Task Completed', description: 'Initial setup finished.', timestamp: '10:00 AM', icon: checkIcon, color: 'success' },
    {
        id: '2',
        title: 'Achievement Unlocked',
        description: 'First milestone reached!',
        timestamp: '11:30 AM',
        icon: starIcon,
        color: 'warning',
    },
    {
        id: '3',
        title: 'Deployment',
        description: 'Application deployed to production.',
        timestamp: '2:00 PM',
        icon: rocketIcon,
        color: 'primary',
    },
    { id: '4', title: 'Review Done', description: 'Code review passed all checks.', timestamp: '3:45 PM', icon: checkIcon, color: 'info' },
];

const code = `import { Timeline } from 'fluxo-ui';

const checkIcon = <svg>...</svg>;

const events = [
  {
    id: '1',
    title: 'Task Completed',
    icon: checkIcon,
    color: 'success',
  },
  // ...
];

<Timeline
  events={events}
  markerSize="lg"
/>`;

const CustomMarkers: React.FC = () => (
    <>
        <ComponentDemo
            title="Custom Icons & Markers"
            description="Use custom SVG icons in the timeline markers. Combine with markerSize for larger icons."
        >
            <div className="w-full max-w-lg">
                <Timeline events={events} markerSize="lg" />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default CustomMarkers;
