import React, { useState } from 'react';
import { MenuNav } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { groupedMenuItems } from './menu-nav-story-data';

const code = `import { MenuNav } from 'ether-ui';
import type { MenuNavGroup } from 'ether-ui';

const items = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  {
    id: 'main-group',
    label: 'Main',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { id: 'inbox', label: 'Inbox', icon: <InboxIcon /> },
      { id: 'starred', label: 'Starred', icon: <StarIcon /> },
      { id: 'documents', label: 'Documents', icon: <FileIcon /> },
    ],
  },
  {
    id: 'analytics-group',
    label: 'Analytics',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <ChartIcon /> },
      { id: 'reports', label: 'Reports', icon: <FileIcon /> },
    ],
  },
  {
    id: 'admin-group',
    label: 'Administration',
    collapsible: true,
    defaultExpanded: false,
    items: [
      { id: 'users', label: 'Users', icon: <UsersIcon /> },
      { id: 'security', label: 'Security', icon: <ShieldIcon /> },
      { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
    ],
  },
];

<MenuNav
  items={items}
  selectedId={selectedId}
  onSelect={(id) => setSelectedId(id)}
/>`;

const GroupedMenus: React.FC = () => {
    const [selectedId, setSelectedId] = useState('home');

    return (
        <>
            <ComponentDemo title="Grouped Menu Items" description="Menu items organized into collapsible groups with section headers." centered={false}>
                <div className="flex flex-col sm:flex-row gap-6 w-full">
                    <div className="w-full sm:w-64 shrink-0">
                        <MenuNav
                            items={groupedMenuItems}
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

export default GroupedMenus;
