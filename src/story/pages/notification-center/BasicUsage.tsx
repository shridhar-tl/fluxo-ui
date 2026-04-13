import React, { useState } from 'react';
import { NotificationCenter } from '../../../components';
import type { NotificationItem } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const now = Date.now();
const initialItems: NotificationItem[] = [
    { id: '1', title: 'New message from Alice', description: 'Hey, can you review the latest PR?', timestamp: new Date(now - 2 * 60 * 1000), read: false },
    { id: '2', title: 'Build succeeded', description: 'Production deployment completed.', timestamp: new Date(now - 15 * 60 * 1000), read: false },
    { id: '3', title: 'Comment on issue #42', description: 'Bob mentioned you in a comment.', timestamp: new Date(now - 60 * 60 * 1000), read: true },
    { id: '4', title: 'New team member', description: 'Charlie joined the development team.', timestamp: new Date(now - 3 * 60 * 60 * 1000), read: true },
    { id: '5', title: 'System update', description: 'Scheduled maintenance tonight at 10 PM.', timestamp: new Date(now - 24 * 60 * 60 * 1000), read: true },
];

const code = `import { NotificationCenter } from 'ether-ui';
import type { NotificationItem } from 'ether-ui';

const [items, setItems] = useState<NotificationItem[]>([...]);

<NotificationCenter
  items={items}
  onItemClick={(item) => console.log('Clicked:', item.title)}
  onMarkRead={(id) => markAsRead(id)}
  onMarkAllRead={() => markAllRead()}
  onClear={() => setItems([])}
/>`;

const BasicUsage: React.FC = () => {
    const [items, setItems] = useState(initialItems);

    const handleMarkRead = (id: string) => {
        setItems((prev) => prev.map((item) => item.id === id ? { ...item, read: true } : item));
    };

    const handleMarkAllRead = () => {
        setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    };

    const handleClear = () => {
        setItems([]);
    };

    return (
        <>
            <ComponentDemo title="Notification Bell" description="Click the bell icon to open the notification panel. Unread count is shown as a badge.">
                <NotificationCenter
                    items={items}
                    onItemClick={(item) => console.log('Clicked:', item.title)}
                    onMarkRead={handleMarkRead}
                    onMarkAllRead={handleMarkAllRead}
                    onClear={handleClear}
                />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
