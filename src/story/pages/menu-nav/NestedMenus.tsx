import React, { useState } from 'react';
import { MenuNav } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { nestedMenuItems } from './menu-nav-story-data';

const code = `import { MenuNav } from 'fluxo-ui';

const items = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  {
    id: 'settings', label: 'Settings', icon: <SettingsIcon />,
    children: [
      {
        id: 'general', label: 'General',
        children: [
          { id: 'profile', label: 'Profile' },
          { id: 'preferences', label: 'Preferences' },
          {
            id: 'notifications', label: 'Notifications',
            children: [
              { id: 'email-notifs', label: 'Email' },
              { id: 'push-notifs', label: 'Push' },
              { id: 'sms-notifs', label: 'SMS' },
            ],
          },
        ],
      },
      {
        id: 'security', label: 'Security',
        children: [
          { id: 'password', label: 'Password' },
          { id: 'two-factor', label: 'Two-Factor Auth' },
        ],
      },
    ],
  },
];

<MenuNav
  items={items}
  maxSubMenuDepth={3}
  selectedId={selectedId}
  onSelect={(id) => setSelectedId(id)}
/>`;

const NestedMenus: React.FC = () => {
    const [selectedId, setSelectedId] = useState('home');

    return (
        <>
            <ComponentDemo
                title="Nested Submenus"
                description="Up to 3 levels of nested submenus with expand/collapse behavior."
                centered={false}
            >
                <div className="flex flex-col sm:flex-row gap-6 w-full">
                    <div className="w-full sm:w-72 shrink-0">
                        <MenuNav items={nestedMenuItems} maxSubMenuDepth={3} selectedId={selectedId} onSelect={(id) => setSelectedId(id)} />
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

export default NestedMenus;
