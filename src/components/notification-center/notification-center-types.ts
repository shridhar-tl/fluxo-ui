import React from 'react';

export interface NotificationItem {
    id: string;
    title: string;
    description?: string;
    timestamp?: string | Date;
    icon?: React.ReactNode;
    read?: boolean;
    category?: string;
    action?: React.ReactNode;
    data?: Record<string, unknown>;
}

export interface NotificationCenterProps {
    items: NotificationItem[];
    categories?: string[];
    unreadCount?: number;
    onItemClick?: (item: NotificationItem) => void;
    onMarkRead?: (id: string) => void;
    onMarkAllRead?: () => void;
    onClear?: () => void;
    onLoadMore?: () => Promise<void>;
    hasMore?: boolean;
    isLoading?: boolean;
    className?: string;
    triggerElement?: React.ReactNode;
    emptyMessage?: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    width?: string;
    maxHeight?: string;
    itemTemplate?: (item: NotificationItem) => React.ReactNode;
}
