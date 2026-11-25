import React, { useState } from 'react';

import { DashboardIcon, FileIcon, FolderIcon, LineChartUpIcon, SearchIcon, SettingsIcon, UsersIcon } from '../../../assets/icons';
import { AppShellToggle, Avatar, Badge, Card, MenuNav, Sparkline } from '../../../components';
import type { MenuNavItem } from '../../../components';
import { activityFeed, navEntries, statCards } from './app-shell-story-data';

const iconById: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    dashboard: DashboardIcon,
    projects: FolderIcon,
    team: UsersIcon,
    reports: LineChartUpIcon,
    files: FileIcon,
    settings: SettingsIcon,
};

const navItems: MenuNavItem[] = navEntries.map((entry) => {
    const Icon = iconById[entry.id];
    return {
        id: entry.id,
        label: entry.label,
        icon: <Icon width={18} height={18} aria-hidden="true" />,
        badge: entry.id === 'projects' ? '4' : undefined,
    };
});

const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    height: '100%',
    padding: '0 1rem',
    boxSizing: 'border-box',
};

const brandMarkStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 10,
    background: 'linear-gradient(135deg, var(--eui-primary), #7c3aed)',
    color: '#ffffff',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 700,
    fontSize: '0.875rem',
};

const searchStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
    maxWidth: 320,
    height: 36,
    padding: '0 0.75rem',
    borderRadius: 10,
    border: '1px solid var(--eui-border-subtle)',
    background: 'var(--eui-bg-subtle)',
    color: 'var(--eui-text-muted)',
    fontSize: '0.8125rem',
    minWidth: 0,
};

export const BrandMark: React.FC<{ title?: string }> = ({ title = 'Acme Cloud' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
        <span style={brandMarkStyle} aria-hidden="true">
            A
        </span>
        <span className="eui-app-shell-hide-collapsed" style={{ color: 'var(--eui-text)', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {title}
        </span>
    </div>
);

interface DemoHeaderProps {
    showBrand?: boolean;
    toggleMode?: 'auto' | 'mobile' | 'collapse';
    hideToggleOnDesktop?: boolean;
}

export const DemoHeader: React.FC<DemoHeaderProps> = ({ showBrand = true, toggleMode = 'auto', hideToggleOnDesktop = false }) => (
    <div style={headerStyle}>
        <AppShellToggle mode={toggleMode} hideOnDesktop={hideToggleOnDesktop} />
        {showBrand && <BrandMark />}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
            <div style={searchStyle} role="search" aria-label="Search">
                <SearchIcon width={14} height={14} aria-hidden="true" />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Search…</span>
            </div>
        </div>
        <Badge dot color="success" overlap="circular" placement="bottom-right" ariaLabel="Online">
            <Avatar name="Ava Chen" size="sm" />
        </Badge>
    </div>
);

interface DemoNavProps {
    collapsed: boolean;
    onNavigate?: () => void;
}

export const DemoNav: React.FC<DemoNavProps> = ({ collapsed, onNavigate }) => {
    const [selected, setSelected] = useState('dashboard');

    return (
        <div style={{ padding: '0.5rem' }}>
            <MenuNav
                items={navItems}
                selectedId={selected}
                onSelect={(id) => {
                    setSelected(id);
                    onNavigate?.();
                }}
                collapsed={collapsed}
                mobileBreakpoint={0}
                ariaLabel="Main navigation"
            />
        </div>
    );
};

export const DemoSidebarFooter: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem', minWidth: 0 }}>
        <Avatar name="Ava Chen" size="sm" />
        {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ color: 'var(--eui-text)', fontSize: '0.8125rem', fontWeight: 600 }}>Ava Chen</span>
                <span style={{ color: 'var(--eui-text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ava@acme.dev
                </span>
            </div>
        )}
    </div>
);

export const DemoContent: React.FC<{ title?: string }> = ({ title = 'Dashboard' }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
                <h3 style={{ color: 'var(--eui-text)', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{title}</h3>
                <p style={{ color: 'var(--eui-text-muted)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>Welcome back. Here is what changed this week.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                {statCards.map((card) => (
                    <Card key={card.id} padding="sm">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                            <span style={{ color: 'var(--eui-text-muted)', fontSize: '0.75rem' }}>{card.title}</span>
                            <strong style={{ color: 'var(--eui-text)', fontSize: '1.25rem' }}>{card.value}</strong>
                            <Sparkline data={card.data} width="100%" height={28} trendColors interactive={false} />
                        </div>
                    </Card>
                ))}
            </div>
            <Card title="Recent activity" padding="sm">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activityFeed.map((item) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <Avatar name={item.who} size="xs" />
                            <span style={{ color: 'var(--eui-text)', fontSize: '0.8125rem', flex: 1, minWidth: 0 }}>
                                <strong>{item.who}</strong> {item.what}
                            </span>
                            <span style={{ color: 'var(--eui-text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{item.when}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
);

export const DemoAside: React.FC = () => (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <span style={{ color: 'var(--eui-text)', fontWeight: 600, fontSize: '0.875rem' }}>Details</span>
        {['Owner', 'Status', 'Updated'].map((label, index) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--eui-text-muted)' }}>{label}</span>
                <span style={{ color: 'var(--eui-text)' }}>{['Ava Chen', 'Active', 'Today'][index]}</span>
            </div>
        ))}
    </div>
);
