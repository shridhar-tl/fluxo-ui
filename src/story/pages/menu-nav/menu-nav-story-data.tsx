import type { MenuNavItem, MenuNavGroup } from '../../../components';

const homeIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const usersIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const settingsIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const fileIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const inboxIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
);

const chartIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const shieldIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const bellIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const helpIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const starIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const layersIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
);

const lockIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

export const basicMenuItems: MenuNavItem[] = [
    { id: 'home', label: 'Home', icon: homeIcon },
    { id: 'inbox', label: 'Inbox', icon: inboxIcon, badge: <span style={{ background: '#ef4444', color: '#fff', borderRadius: '9999px', padding: '1px 7px', fontSize: '11px', fontWeight: 600 }}>5</span> },
    { id: 'documents', label: 'Documents', icon: fileIcon },
    { id: 'analytics', label: 'Analytics', icon: chartIcon },
    { id: 'users', label: 'Users', icon: usersIcon },
    { id: 'settings', label: 'Settings', icon: settingsIcon },
];

export const horizontalMenuItems: MenuNavItem[] = [
    { id: 'home', label: 'Home', icon: homeIcon },
    {
        id: 'products', label: 'Products', icon: layersIcon,
        children: [
            { id: 'product-list', label: 'All Products' },
            { id: 'product-new', label: 'New Product' },
            { id: 'product-categories', label: 'Categories' },
        ],
    },
    {
        id: 'orders', label: 'Orders', icon: fileIcon,
        children: [
            { id: 'order-list', label: 'All Orders' },
            { id: 'order-pending', label: 'Pending' },
            { id: 'order-completed', label: 'Completed' },
        ],
    },
    { id: 'analytics', label: 'Analytics', icon: chartIcon },
    { id: 'settings', label: 'Settings', icon: settingsIcon },
];

export const nestedMenuItems: MenuNavItem[] = [
    { id: 'home', label: 'Home', icon: homeIcon },
    {
        id: 'settings', label: 'Settings', icon: settingsIcon,
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
                id: 'security', label: 'Security', icon: shieldIcon,
                children: [
                    { id: 'password', label: 'Password' },
                    { id: 'two-factor', label: 'Two-Factor Auth' },
                    { id: 'sessions', label: 'Active Sessions' },
                ],
            },
            { id: 'billing', label: 'Billing' },
        ],
    },
    {
        id: 'admin', label: 'Administration', icon: lockIcon,
        children: [
            { id: 'user-mgmt', label: 'User Management' },
            {
                id: 'roles', label: 'Roles & Permissions',
                children: [
                    { id: 'role-list', label: 'All Roles' },
                    { id: 'role-create', label: 'Create Role' },
                ],
            },
            { id: 'audit-log', label: 'Audit Log' },
        ],
    },
    { id: 'help', label: 'Help', icon: helpIcon },
];

export const groupedMenuItems: (MenuNavItem | MenuNavGroup)[] = [
    { id: 'home', label: 'Home', icon: homeIcon },
    {
        id: 'main-group',
        label: 'Main',
        collapsible: true,
        defaultExpanded: true,
        items: [
            { id: 'inbox', label: 'Inbox', icon: inboxIcon, badge: <span style={{ background: '#ef4444', color: '#fff', borderRadius: '9999px', padding: '1px 7px', fontSize: '11px', fontWeight: 600 }}>3</span> },
            { id: 'starred', label: 'Starred', icon: starIcon },
            { id: 'documents', label: 'Documents', icon: fileIcon },
        ],
    },
    {
        id: 'analytics-group',
        label: 'Analytics',
        collapsible: true,
        defaultExpanded: true,
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: chartIcon },
            { id: 'reports', label: 'Reports', icon: fileIcon },
        ],
    },
    {
        id: 'admin-group',
        label: 'Administration',
        collapsible: true,
        defaultExpanded: false,
        items: [
            { id: 'users', label: 'Users', icon: usersIcon },
            { id: 'security', label: 'Security', icon: shieldIcon },
            { id: 'settings', label: 'Settings', icon: settingsIcon },
        ],
    },
];

export const collapsibleMenuItems: MenuNavItem[] = [
    { id: 'home', label: 'Home', icon: homeIcon },
    { id: 'inbox', label: 'Inbox', icon: inboxIcon },
    { id: 'documents', label: 'Documents', icon: fileIcon },
    { id: 'analytics', label: 'Analytics', icon: chartIcon },
    { id: 'notifications', label: 'Notifications', icon: bellIcon },
    { id: 'users', label: 'Users', icon: usersIcon },
    { id: 'settings', label: 'Settings', icon: settingsIcon },
    { id: 'help', label: 'Help', icon: helpIcon },
];

export const toolbarMenuItems: MenuNavItem[] = [
    { id: 'file', label: 'File', children: [{ id: 'new', label: 'New' }, { id: 'open', label: 'Open' }, { id: 'save', label: 'Save' }, { id: 'export', label: 'Export' }] },
    { id: 'edit', label: 'Edit', children: [{ id: 'undo', label: 'Undo' }, { id: 'redo', label: 'Redo' }, { id: 'cut', label: 'Cut' }, { id: 'copy', label: 'Copy' }, { id: 'paste', label: 'Paste' }] },
    { id: 'view', label: 'View', children: [{ id: 'zoom-in', label: 'Zoom In' }, { id: 'zoom-out', label: 'Zoom Out' }, { id: 'fullscreen', label: 'Fullscreen' }] },
    { id: 'help', label: 'Help', children: [{ id: 'docs', label: 'Documentation' }, { id: 'about', label: 'About' }] },
];
