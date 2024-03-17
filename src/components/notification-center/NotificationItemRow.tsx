import classNames from 'classnames';
import React from 'react';
import type { NotificationItem } from './notification-center-types';

const timeUnits: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000000],
    ['month', 2592000000],
    ['week', 604800000],
    ['day', 86400000],
    ['hour', 3600000],
    ['minute', 60000],
    ['second', 1000],
];

const formatTimeAgo = (timestamp: string | Date): string => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    if (isNaN(date.getTime())) {
        return typeof timestamp === 'string' ? timestamp : 'Unknown';
    }

    const diff = Date.now() - date.getTime();

    if (diff < 1000) {
        return 'just now';
    }

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    for (const [unit, ms] of timeUnits) {
        const value = Math.floor(diff / ms);
        if (value >= 1) {
            return rtf.format(-value, unit);
        }
    }

    return 'just now';
};

interface NotificationItemRowProps {
    item: NotificationItem;
    onClick?: (item: NotificationItem) => void;
    onMarkRead?: (id: string) => void;
    itemTemplate?: (item: NotificationItem) => React.ReactNode;
}

export const NotificationItemRow: React.FC<NotificationItemRowProps> = ({
    item,
    onClick,
    onMarkRead,
    itemTemplate,
}) => {
    const handleClick = () => {
        onClick?.(item);
        if (!item.read) {
            onMarkRead?.(item.id);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    if (itemTemplate) {
        return (
            <div
                className={classNames('eui-nc-item', { 'eui-nc-item-unread': !item.read })}
                role="option"
                aria-selected={!item.read}
                tabIndex={0}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
            >
                {itemTemplate(item)}
            </div>
        );
    }

    return (
        <div
            className={classNames('eui-nc-item', { 'eui-nc-item-unread': !item.read })}
            role="option"
            aria-selected={!item.read}
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
        >
            {!item.read && <span className="eui-nc-unread-dot" aria-label="Unread" />}
            {item.icon && <span className="eui-nc-item-icon">{item.icon}</span>}
            <div className="eui-nc-item-content">
                <div className="eui-nc-item-title">{item.title}</div>
                {item.description && <div className="eui-nc-item-desc">{item.description}</div>}
                {item.timestamp && (
                    <time
                        className="eui-nc-item-time"
                        dateTime={(() => { const d = new Date(item.timestamp); return isNaN(d.getTime()) ? undefined : d.toISOString(); })()}
                    >
                        {formatTimeAgo(item.timestamp)}
                    </time>
                )}
            </div>
            {item.action && (
                <div className="eui-nc-item-action" onClick={(e) => e.stopPropagation()}>
                    {item.action}
                </div>
            )}
        </div>
    );
};
