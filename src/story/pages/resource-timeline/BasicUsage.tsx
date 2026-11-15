import React from 'react';
import { ResourceTimeline } from '../../../components/resource-timeline';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { storyEnd, storyEvents, storyResources, storyStart } from './resource-timeline-story-data';

const code = `import { ResourceTimeline } from 'fluxo-ui';

<ResourceTimeline
  resources={[{ id: 'alice', name: 'Alice Martin' }, { id: 'bob', name: 'Bob Chen' }]}
  events={[
    { id: 'e1', resourceId: 'alice', start: '2025-03-03', end: '2025-03-07', title: 'Checkout page' },
    { id: 'e2', resourceId: 'alice', start: '2025-03-06', end: '2025-03-11', title: 'Design review fixes' },
  ]}
  startDate="2025-03-01"
  endDate="2025-03-31"
  readOnly
/>`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Read-only timeline" description="Overlapping bars of a row are placed in separate lanes." centered={false}>
            <div style={{ width: '100%' }}>
                <ResourceTimeline resources={storyResources} events={storyEvents} startDate={storyStart} endDate={storyEnd} height={300} readOnly />
            </div>
        </ComponentDemo>
        <CodeBlock code={code} />
    </>
);

export default BasicUsage;
