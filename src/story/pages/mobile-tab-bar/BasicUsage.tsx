import React, { useState } from 'react';
import { MobileTabBar } from '../../../components';
import { AlertIcon, DashboardIcon, SearchIcon, UserIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { MobileTabBar } from 'fluxo-ui';

const items = [
    { key: 'home', label: 'Home', icon: <DashboardIcon /> },
    { key: 'search', label: 'Search', icon: <SearchIcon /> },
    { key: 'alerts', label: 'Alerts', icon: <AlertIcon />, badge: 3 },
    { key: 'me', label: 'Me', icon: <UserIcon /> },
];

<MobileTabBar items={items} activeKey={tab} onChange={setTab} />`;

const items = [
    { key: 'home', label: 'Home', icon: <DashboardIcon /> },
    { key: 'search', label: 'Search', icon: <SearchIcon /> },
    { key: 'alerts', label: 'Alerts', icon: <AlertIcon />, badge: 3 },
    { key: 'me', label: 'Me', icon: <UserIcon /> },
];

const BasicUsage: React.FC = () => {
    const [tab, setTab] = useState('home');
    return (
        <>
            <ComponentDemo title="Bottom tab bar" description="Mounted at the bottom of a mobile app. Tap or use ←/→ arrow keys to switch tabs.">
                <div style={{ width: '100%', maxWidth: 380, border: '1px solid var(--eui-border-subtle)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: 24, minHeight: 160, background: 'var(--eui-bg-subtle)', color: 'var(--eui-text)' }}>
                        Active tab: <strong>{tab}</strong>
                    </div>
                    <MobileTabBar items={items} activeKey={tab} onChange={setTab} />
                </div>
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default BasicUsage;
