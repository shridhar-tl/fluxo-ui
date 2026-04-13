import React, { useState } from 'react';
import type { NotificationItem } from '../../../components';
import { NotificationCenter } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const now = Date.now();
const initialItems: NotificationItem[] = [
    {
        id: '1',
        title: 'Pull request approved',
        description: 'Your PR #78 was approved by 2 reviewers.',
        timestamp: new Date(now - 5 * 60 * 1000),
        read: false,
        category: 'Updates',
    },
    {
        id: '2',
        title: 'New follower',
        description: 'Dave started following you.',
        timestamp: new Date(now - 10 * 60 * 1000),
        read: false,
        category: 'Social',
    },
    {
        id: '3',
        title: 'Security alert',
        description: 'New login detected from Chrome on Windows.',
        timestamp: new Date(now - 30 * 60 * 1000),
        read: false,
        category: 'Alerts',
    },
    {
        id: '4',
        title: 'Task assigned',
        description: 'You were assigned to "Fix login bug".',
        timestamp: new Date(now - 60 * 60 * 1000),
        read: true,
        category: 'Updates',
    },
    {
        id: '5',
        title: 'Friend request',
        description: 'Eve sent you a connection request.',
        timestamp: new Date(now - 2 * 60 * 60 * 1000),
        read: true,
        category: 'Social',
    },
    {
        id: '6',
        title: 'Payment failed',
        description: 'Your subscription payment was declined.',
        timestamp: new Date(now - 4 * 60 * 60 * 1000),
        read: false,
        category: 'Alerts',
    },
    {
        id: '7',
        title: 'Code review requested',
        description: 'Review changes in feat/new-api branch.',
        timestamp: new Date(now - 24 * 60 * 60 * 1000),
        read: true,
        category: 'Updates',
    },
];

const code = `import { NotificationCenter } from 'fluxo-ui';

<NotificationCenter
  items={items}
  categories={['Updates', 'Social', 'Alerts']}
  onItemClick={(item) => console.log(item)}
  onMarkRead={(id) => markAsRead(id)}
  onMarkAllRead={() => markAllRead()}
/>`;

const Categories: React.FC = () => {
    const [items, setItems] = useState(initialItems);

    const handleMarkRead = (id: string) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
    };

    const handleMarkAllRead = () => {
        setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    };

    return (
        <>
            <ComponentDemo
                title="Category Tabs"
                description="Filter notifications by category using tab buttons. The 'All' tab shows everything."
            >
                <NotificationCenter
                    items={items}
                    categories={['Updates', 'Social', 'Alerts']}
                    onItemClick={(item) => console.log('Clicked:', item.title)}
                    onMarkRead={handleMarkRead}
                    onMarkAllRead={handleMarkAllRead}
                />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Categories;
