import React, { useState } from 'react';
import { Button, NotificationCenter } from '../../../components';
import type { NotificationItem } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const now = Date.now();
const items: NotificationItem[] = [
    { id: '1', title: 'Welcome!', description: 'Thanks for trying the custom trigger demo.', timestamp: new Date(now - 10 * 1000), read: false },
    { id: '2', title: 'Feature released', description: 'Dark mode is now available.', timestamp: new Date(now - 60 * 60 * 1000), read: true },
];

const code = `import { NotificationCenter, Button } from 'ether-ui';

<NotificationCenter
  items={items}
  triggerElement={<Button variant="primary" size="sm">Notifications</Button>}
  header={<div className="p-3 font-bold text-lg">My Alerts</div>}
  footer={<div className="p-3 text-center text-sm">View all notifications</div>}
  width="420px"
  maxHeight="300px"
/>`;

const CustomTrigger: React.FC = () => {
    const [notifs, setNotifs] = useState(items);

    return (
        <>
            <ComponentDemo title="Custom Trigger & Layout" description="Replace the default bell icon with any element. Customize header, footer, width, and max height.">
                <NotificationCenter
                    items={notifs}
                    triggerElement={
                        <Button variant="primary" size="sm">Notifications ({notifs.filter((n) => !n.read).length})</Button>
                    }
                    header={
                        <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                            <span className="font-bold text-lg">My Alerts</span>
                        </div>
                    }
                    footer={
                        <div className="p-3 text-center text-sm opacity-70 border-t border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-100">
                            View all notifications
                        </div>
                    }
                    width="420px"
                    maxHeight="300px"
                    onItemClick={(item) => console.log('Clicked:', item.title)}
                    onMarkRead={(id) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))}
                />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default CustomTrigger;
