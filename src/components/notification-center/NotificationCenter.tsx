import classNames from 'classnames';
import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnnouncementIcon, TimesIcon } from '../../assets/icons';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useViewport } from '../../hooks/useMobile';
import { usePosition } from '../../hooks/usePosition';
import type { NotificationCenterProps } from './notification-center-types';
import './NotificationCenter.scss';
import { NotificationItemRow } from './NotificationItemRow';

const allCategory = 'All';

const focusableSelector = [
    'button:not([disabled])',
    '[href]:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
].join(',');

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
    const [announcement, setAnnouncement] = useState('');

    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const { calculatePosition } = usePosition();
    const { isCompact, isMobile, isTablet } = useViewport();
    const generatedId = useId();
    const baseId = `eui-nc-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const panelId = `${baseId}-panel`;

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

    useClickOutside(panelRef, closePanel, isOpen && !isCompact);

    useLayoutEffect(() => {
        if (!isOpen || isCompact) return;
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
    }, [isOpen, calculatePosition, isCompact]);

    useEffect(() => {
        if (!isOpen) return;
        previousFocusRef.current = document.activeElement as HTMLElement | null;

        const previousOverflow = isCompact ? document.body.style.overflow : null;
        if (isCompact) {
            document.body.style.overflow = 'hidden';
        }

        const focusFrame = requestAnimationFrame(() => {
            const panel = panelRef.current;
            if (!panel) return;
            const focusable = panel.querySelectorAll<HTMLElement>(focusableSelector);
            if (focusable.length > 0) {
                focusable[0].focus();
            } else {
                panel.focus();
            }
        });

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                closePanel();
                return;
            }
            if (e.key !== 'Tab') return;
            const panel = panelRef.current;
            if (!panel) return;
            const focusable = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector)).filter(
                (el) => el.tabIndex !== -1,
            );
            if (focusable.length === 0) {
                e.preventDefault();
                panel.focus();
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first || !panel.contains(document.activeElement)) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last || !panel.contains(document.activeElement)) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            cancelAnimationFrame(focusFrame);
            document.removeEventListener('keydown', handleKeyDown);
            if (isCompact && previousOverflow !== null) {
                document.body.style.overflow = previousOverflow;
            }
            previousFocusRef.current?.focus?.();
        };
    }, [isOpen, isCompact, closePanel]);

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

    const announce = (msg: string) => {
        setAnnouncement('');
        window.setTimeout(() => setAnnouncement(msg), 30);
    };

    const handleMarkAllRead = () => {
        onMarkAllRead?.();
        announce('All notifications marked as read');
    };

    const handleClearAll = () => {
        onClear?.();
        announce('All notifications cleared');
    };

    const handleTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
        const len = categoryTabs.length;
        if (len === 0) return;
        let next = idx;
        if (e.key === 'ArrowRight') {
            next = (idx + 1) % len;
        } else if (e.key === 'ArrowLeft') {
            next = (idx - 1 + len) % len;
        } else if (e.key === 'Home') {
            next = 0;
        } else if (e.key === 'End') {
            next = len - 1;
        } else {
            return;
        }
        e.preventDefault();
        setActiveCategory(categoryTabs[next]);
        requestAnimationFrame(() => tabRefs.current[next]?.focus());
    };

    const activeTabIndex = categoryTabs.indexOf(activeCategory);
    const activeTabId = `${baseId}-tab-${activeTabIndex}`;
    const isBusy = isLoading || loadingMore;

    const panel = isOpen ? (
        <div
            ref={panelRef}
            tabIndex={-1}
            className={classNames('eui-notification-center', className, {
                'eui-notification-center-mobile': isMobile,
                'eui-notification-center-tablet': isTablet,
            })}
            style={isCompact ? undefined : { width }}
            role="dialog"
            aria-label="Notification center"
            aria-modal={isCompact ? 'true' : 'false'}
        >
            {header ?? (
                <div className="eui-nc-header">
                    <span className="eui-nc-header-title">Notifications</span>
                    <div className="eui-nc-header-actions">
                        {onMarkAllRead && resolvedUnreadCount > 0 && (
                            <button className="eui-nc-action-btn" onClick={handleMarkAllRead} type="button">
                                Mark all read
                            </button>
                        )}
                        {onClear && items.length > 0 && (
                            <button className="eui-nc-action-btn eui-nc-action-btn-danger" onClick={handleClearAll} type="button">
                                Clear all
                            </button>
                        )}
                        {isCompact && (
                            <button
                                className="eui-nc-close-btn"
                                onClick={closePanel}
                                type="button"
                                aria-label="Close notifications"
                            >
                                <TimesIcon />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {categoryTabs.length > 0 && (
                <div className="eui-nc-tabs" role="tablist" aria-label="Notification categories">
                    {categoryTabs.map((cat, idx) => {
                        const tabId = `${baseId}-tab-${idx}`;
                        const selected = activeCategory === cat;
                        return (
                            <button
                                key={cat}
                                ref={(el) => { tabRefs.current[idx] = el; }}
                                id={tabId}
                                className={classNames('eui-nc-tab', { 'eui-nc-tab-active': selected })}
                                role="tab"
                                aria-selected={selected}
                                aria-controls={panelId}
                                tabIndex={selected ? 0 : -1}
                                onClick={() => setActiveCategory(cat)}
                                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                                type="button"
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            )}

            <div
                ref={listRef}
                id={panelId}
                role={categoryTabs.length > 0 ? 'tabpanel' : 'feed'}
                aria-labelledby={categoryTabs.length > 0 ? activeTabId : undefined}
                aria-label={categoryTabs.length > 0 ? undefined : 'Notifications list'}
                aria-busy={isBusy}
                className="eui-nc-list"
                style={isCompact ? undefined : { maxHeight }}
            >
                {filteredItems.length === 0 && !isLoading ? (
                    <div className="eui-nc-empty">
                        {typeof emptyMessage === 'string' ? <span>{emptyMessage}</span> : emptyMessage}
                    </div>
                ) : (
                    <div role={categoryTabs.length > 0 ? 'feed' : undefined} aria-busy={categoryTabs.length > 0 ? isBusy : undefined}>
                        {filteredItems.map((item) => (
                            <NotificationItemRow
                                key={item.id}
                                item={item}
                                onClick={onItemClick}
                                onMarkRead={onMarkRead}
                                itemTemplate={itemTemplate}
                            />
                        ))}
                    </div>
                )}

                {(isLoading || loadingMore) && (
                    <div className="eui-nc-loading" role="status" aria-live="polite">
                        <span className="eui-nc-spinner" aria-hidden="true" />
                        <span>Loading...</span>
                    </div>
                )}
            </div>

            {footer && <div className="eui-nc-footer">{footer}</div>}

            <div className="eui-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
                {announcement}
            </div>
        </div>
    ) : null;

    return (
        <>
            <button
                ref={triggerRef}
                className="eui-nc-trigger"
                onClick={togglePanel}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-controls={isOpen ? panelId : undefined}
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
            {createPortal(
                isOpen && isCompact ? (
                    <div className="eui-nc-backdrop" onClick={closePanel}>
                        <div onClick={(e) => e.stopPropagation()} className="eui-nc-backdrop-inner">
                            {panel}
                        </div>
                    </div>
                ) : (
                    panel
                ),
                document.body,
            )}
        </>
    );
};
