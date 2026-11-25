import type { BadgePlacement, BadgeStatus, BadgeVariant } from '../../../components';

export const toneList = ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'] as const;

export const badgeVariants: BadgeVariant[] = ['solid', 'soft', 'outline'];

export const placements: BadgePlacement[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

export const statuses: { status: BadgeStatus; text: string }[] = [
    { status: 'success', text: 'Operational' },
    { status: 'processing', text: 'Deploying' },
    { status: 'warning', text: 'Degraded' },
    { status: 'error', text: 'Outage' },
    { status: 'default', text: 'Paused' },
];

export const teamMembers = [
    { name: 'Ava Chen', status: 'success' as BadgeStatus, unread: 3 },
    { name: 'Liam Patel', status: 'warning' as BadgeStatus, unread: 0 },
    { name: 'Noah Kim', status: 'error' as BadgeStatus, unread: 12 },
    { name: 'Mia Lopez', status: 'default' as BadgeStatus, unread: 128 },
];

export const inboxFolders = [
    { label: 'Inbox', count: 24, color: 'primary' as const },
    { label: 'Mentions', count: 3, color: 'danger' as const },
    { label: 'Drafts', count: 0, color: 'secondary' as const },
    { label: 'Archive', count: 1240, color: 'default' as const },
];
