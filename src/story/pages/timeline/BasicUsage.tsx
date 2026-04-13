import React from 'react';
import { Timeline } from '../../../components';
import type { TimelineEvent } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const events: TimelineEvent[] = [
    { id: '1', title: 'Order Placed', description: 'Your order #12345 has been placed successfully.', timestamp: 'Jan 15, 2025 - 9:00 AM', color: 'primary' },
    { id: '2', title: 'Payment Confirmed', description: 'Payment of $299.99 has been processed.', timestamp: 'Jan 15, 2025 - 9:05 AM', color: 'success' },
    { id: '3', title: 'Order Shipped', description: 'Your package is on its way via Express Delivery.', timestamp: 'Jan 16, 2025 - 2:30 PM', color: 'info' },
    { id: '4', title: 'Out for Delivery', description: 'The package is out for delivery in your area.', timestamp: 'Jan 17, 2025 - 8:00 AM', color: 'warning' },
    { id: '5', title: 'Delivered', description: 'Your package has been delivered. Enjoy!', timestamp: 'Jan 17, 2025 - 11:45 AM', color: 'success' },
];

const code = `import { Timeline } from 'ether-ui';
import type { TimelineEvent } from 'ether-ui';

const events: TimelineEvent[] = [
  { id: '1', title: 'Order Placed', description: 'Order #12345 placed.', timestamp: 'Jan 15', color: 'primary' },
  { id: '2', title: 'Payment Confirmed', description: 'Payment processed.', timestamp: 'Jan 15', color: 'success' },
  { id: '3', title: 'Shipped', description: 'Package on its way.', timestamp: 'Jan 16', color: 'info' },
  { id: '4', title: 'Delivered', description: 'Package delivered.', timestamp: 'Jan 17', color: 'success' },
];

<Timeline events={events} />`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Order Tracking Timeline" description="A vertical left-aligned timeline showing order progress.">
            <div className="w-full max-w-lg">
                <Timeline events={events} />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
