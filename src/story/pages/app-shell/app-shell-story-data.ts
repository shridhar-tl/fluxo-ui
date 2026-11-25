import type React from 'react';

import type { AppShellClassNames } from '../../../components';

export const navEntries = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'projects', label: 'Projects' },
    { id: 'team', label: 'Team' },
    { id: 'reports', label: 'Reports' },
    { id: 'files', label: 'Files' },
    { id: 'settings', label: 'Settings' },
];

export const statCards = [
    { id: 'revenue', title: 'Revenue', value: '$48.2k', data: [12, 18, 15, 22, 28, 26, 34] },
    { id: 'users', title: 'Active users', value: '2,431', data: [40, 42, 39, 45, 48, 52, 55] },
    { id: 'tickets', title: 'Open tickets', value: '18', data: [30, 28, 25, 26, 22, 20, 18] },
];

export const activityFeed = [
    { id: 'a1', who: 'Ava Chen', what: 'merged pull request #482', when: '2m ago' },
    { id: 'a2', who: 'Liam Patel', what: 'commented on Q3 roadmap', when: '18m ago' },
    { id: 'a3', who: 'Noah Kim', what: 'deployed to production', when: '1h ago' },
];

export const shellHeight = 520;

export const variantItems = [
    { label: 'Default', value: 'default' },
    { label: 'Floating', value: 'floating' },
    { label: 'Inset', value: 'inset' },
];

export const layoutItems = [
    { label: 'Header first', value: 'header-first' },
    { label: 'Sidebar first', value: 'sidebar-first' },
];

export const positionItems = [
    { label: 'Left', value: 'left' },
    { label: 'Right', value: 'right' },
];

export const shellFrameStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    border: '1px solid var(--eui-border-subtle)',
};

export const shellClassNames: AppShellClassNames = {
    header: 'shadow-md!',
    sidebar: 'bg-[color-mix(in_srgb,var(--eui-primary)_6%,var(--eui-bg))]!',
};
