import classNames from 'classnames';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnnouncementIcon } from '../../assets/icons';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useKeyboard } from '../../hooks/useKeyboard';
import { usePosition } from '../../hooks/usePosition';
import type { NotificationCenterProps } from './notification-center-types';
import './NotificationCenter.scss';
import { NotificationItemRow } from './NotificationItemRow';

const allCategory = 'All';

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
    items,
    categories,
    unreadCount,
    onItemClick,
    onMarkRead,
    onMarkAllRead,
    onClear,
    onLoadMore,
    hasMore = false,
    isLoading = false,
    className,
    triggerElement,
    emptyMessage = 'No notifications',
    header,
    footer,
    width = '380px',
    maxHeight = '480px',
    itemTemplate,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(allCategory);
    const [loadingMore, setLoadingMore] = useState(false);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const { calculatePosition } = usePosition();

    const resolvedUnreadCount = useMemo(() => {
        if (unreadCount !== undefined) return unreadCount;
        return items.filter((item) => !item.read).length;
    }, [unreadCount, items]);

    const filteredItems = useMemo(() => {
        if (activeCategory === allCategory) return items;
        return items.filter((item) => item.category === activeCategory);
    }, [items, activeCategory]);

    const categoryTabs = useMemo(() => {
        if (!categories || categories.length === 0) return [];
        return [allCategory, ...categories];
    }, [categories]);

    const togglePanel = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const closePanel = useCallback(() => {
        setIsOpen(false);
    }, []);

    useClickOutside(panelRef, closePanel, isOpen);

    useKeyboard({ Escape: closePanel }, isOpen);

    useLayoutEffect(() => {
        if (!isOpen) return;
        const reposition = () => {
            if (triggerRef.current && panelRef.current) {
                calculatePosition(triggerRef.current, panelRef.current);
            }
        };
        reposition();
        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
        return () => {
            window.removeEventListener('scroll', reposition, true);
            window.removeEventListener('resize', reposition);
        };
    }, [isOpen, calculatePosition]);

    const handleScroll = useCallback(async () => {
        if (!listRef.current || !hasMore || loadingMore || isLoading || !onLoadMore) return;

        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        if (scrollHeight - scrollTop - clientHeight < 60) {
            setLoadingMore(true);
            try {
                await onLoadMore();
            } finally {
                setLoadingMore(false);
            }
        }
    }, [hasMore, loadingMore, isLoading, onLoadMore]);

    useEffect(() => {
        const listEl = listRef.current;
        if (!listEl || !isOpen) return;

        listEl.addEventListener('scroll', handleScroll, { passive: true });
        return () => listEl.removeEventListener('scroll', handleScroll);
    }, [isOpen, handleScroll]);

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            togglePanel();
        }
    };

    const panel = isOpen ? (
        <div
            ref={panelRef}
            className={classNames('eui-notification-center', className)}
            style={{ width }}
            role="dialog"
            aria-label="Notification center"
            aria-modal="false"
        >
            {header ?? (
                <div className="eui-nc-header">
                    <span className="eui-nc-header-title">Notifications</span>
                    <div className="eui-nc-header-actions">
                        {onMarkAllRead && resolvedUnreadCount > 0 && (
                            <button className="eui-nc-action-btn" onClick={onMarkAllRead} type="button">
                                Mark all read
                            </button>
                        )}
                        {onClear && items.length > 0 && (
                            <button className="eui-nc-action-btn eui-nc-action-btn-danger" onClick={onClear} type="button">
                                Clear all
                            </button>
                        )}
                    </div>
                </div>
            )}

            {categoryTabs.length > 0 && (
                <div className="eui-nc-tabs" role="tablist" aria-label="Notification categories">
                    {categoryTabs.map((cat) => (
                        <button
                            key={cat}
                            className={classNames('eui-nc-tab', { 'eui-nc-tab-active': activeCategory === cat })}
                            role="tab"
                            aria-selected={activeCategory === cat}
                            onClick={() => setActiveCategory(cat)}
                            type="button"
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            <div
                ref={listRef}
                className="eui-nc-list"
                style={{ maxHeight }}
                role="listbox"
                aria-label="Notifications list"
            >
                {filteredItems.length === 0 && !isLoading ? (
                    <div className="eui-nc-empty">
                        {typeof emptyMessage === 'string' ? <span>{emptyMessage}</span> : emptyMessage}
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <NotificationItemRow
                            key={item.id}
                            item={item}
                            onClick={onItemClick}
                            onMarkRead={onMarkRead}
                            itemTemplate={itemTemplate}
                        />
                    ))
                )}

                {(isLoading || loadingMore) && (
                    <div className="eui-nc-loading">
                        <span className="eui-nc-spinner" />
                        <span>Loading...</span>
                    </div>
                )}
            </div>

            {footer && <div className="eui-nc-footer">{footer}</div>}
        </div>
    ) : null;

    return (
        <>
            <button
                ref={triggerRef}
                className="eui-nc-trigger"
                onClick={togglePanel}
                onKeyDown={handleTriggerKeyDown}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-label={`Notifications${resolvedUnreadCount > 0 ? `, ${resolvedUnreadCount} unread` : ''}`}
                type="button"
            >
                {triggerElement ?? <AnnouncementIcon className="eui-nc-trigger-icon" />}
                {resolvedUnreadCount > 0 && (
                    <span className="eui-nc-badge" aria-hidden="true">
                        {resolvedUnreadCount > 99 ? '99+' : resolvedUnreadCount}
                    </span>
                )}
            </button>
            {createPortal(panel, document.body)}
        </>
    );
};
