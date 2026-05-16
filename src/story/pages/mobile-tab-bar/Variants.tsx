import React, { useState } from 'react';
import { MobileTabBar } from '../../../components';
import type { MobileTabBarVariant } from '../../../components';
import { AlertIcon, DashboardIcon, SearchIcon, UserIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<MobileTabBar variant="elevated" items={items} activeKey={tab} onChange={setTab} />`;

const items = [
    { key: 'home', label: 'Home', icon: <DashboardIcon /> },
    { key: 'search', label: 'Search', icon: <SearchIcon /> },
    { key: 'alerts', label: 'Alerts', icon: <AlertIcon />, badge: 5 },
    { key: 'me', label: 'Me', icon: <UserIcon /> },
];

const VariantPreview: React.FC<{ variant: MobileTabBarVariant; description: string }> = ({ variant, description }) => {
    const [tab, setTab] = useState('home');
    return (
        <ComponentDemo title={variant.charAt(0).toUpperCase() + variant.slice(1)} description={description}>
            <div style={{ width: '100%', maxWidth: 380, border: '1px solid var(--eui-border-subtle)', borderRadius: 12, overflow: 'hidden', background: 'var(--eui-bg-subtle)' }}>
                <div style={{ padding: 24, minHeight: 120 }}>&nbsp;</div>
                <MobileTabBar variant={variant} items={items} activeKey={tab} onChange={setTab} />
            </div>
        </ComponentDemo>
    );
};

const Variants: React.FC = () => (
    <>
        <VariantPreview variant="flat" description="Default — border on top, transparent bar." />
        <div className="mt-4"><VariantPreview variant="elevated" description="Soft shadow above the bar (instead of a border)." /></div>
        <div className="mt-4"><VariantPreview variant="pill" description="Active tab gets a solid primary pill background." /></div>
        <div className="mt-4"><VariantPreview variant="floating" description="Detached rounded card with shadow — modern iOS pattern." /></div>
        <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
    </>
);

export default Variants;
