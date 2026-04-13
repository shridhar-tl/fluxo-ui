import React, { useState } from 'react';
import { MenuNav } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicMenuItems } from './menu-nav-story-data';

const code = `import { MenuNav } from 'ether-ui';

const items = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'inbox', label: 'Inbox', icon: <InboxIcon />, badge: <Badge>5</Badge> },
  { id: 'documents', label: 'Documents', icon: <FileIcon /> },
  { id: 'analytics', label: 'Analytics', icon: <ChartIcon /> },
  { id: 'users', label: 'Users', icon: <UsersIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
];

<MenuNav
  items={items}
  defaultSelectedId="home"
  onSelect={(id, item) => console.log(id, item)}
/>`;

const BasicUsage: React.FC = () => {
    const [selectedId, setSelectedId] = useState('home');

    return (
        <>
            <ComponentDemo title="Vertical Menu" description="A simple vertical navigation menu with icons and a badge." centered={false}>
                <div className="flex flex-col sm:flex-row gap-6 w-full">
                    <div className="w-full sm:w-64 shrink-0">
                        <MenuNav
                            items={basicMenuItems}
                            selectedId={selectedId}
                            onSelect={(id) => setSelectedId(id)}
                        />
                    </div>
                    <div className="flex-1 flex items-center justify-center text-sm opacity-60">
                        Selected: <strong className="ml-1">{selectedId}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
