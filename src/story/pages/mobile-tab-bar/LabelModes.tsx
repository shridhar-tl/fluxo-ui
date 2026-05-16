import React, { useState } from 'react';
import { MobileTabBar } from '../../../components';
import { AlertIcon, DashboardIcon, SearchIcon, UserIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<MobileTabBar showLabels="always" items={items} ... />
<MobileTabBar showLabels="active" items={items} ... />
<MobileTabBar showLabels="never"  items={items} ... />`;

const items = [
    { key: 'home', label: 'Home', icon: <DashboardIcon /> },
    { key: 'search', label: 'Search', icon: <SearchIcon /> },
    { key: 'alerts', label: 'Alerts', icon: <AlertIcon /> },
    { key: 'me', label: 'Me', icon: <UserIcon /> },
];

const Preview: React.FC<{ mode: 'always' | 'active' | 'never'; description: string }> = ({ mode, description }) => {
    const [tab, setTab] = useState('home');
    return (
        <ComponentDemo title={`showLabels="${mode}"`} description={description}>
            <div style={{ width: '100%', maxWidth: 380, border: '1px solid var(--eui-border-subtle)', borderRadius: 12, overflow: 'hidden' }}>
                <MobileTabBar showLabels={mode} items={items} activeKey={tab} onChange={setTab} />
            </div>
        </ComponentDemo>
    );
};

const LabelModes: React.FC = () => (
    <>
        <Preview mode="always" description="All labels visible — best for first-time users." />
        <div className="mt-4"><Preview mode="active" description="Only the active label — saves space while preserving context." /></div>
        <div className="mt-4"><Preview mode="never" description="Icon-only — for tight bars where the icons are universally recognized." /></div>
        <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
    </>
);

export default LabelModes;
