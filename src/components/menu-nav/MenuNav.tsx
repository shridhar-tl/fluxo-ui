import cn from 'classnames';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { TimesIcon } from '../../assets/icons';
import MenuNavItemComponent from './MenuNavItem';
import type { MenuNavGroup, MenuNavItem, MenuNavProps } from './menu-nav-types';
import './MenuNav.scss';

const isGroup = (item: MenuNavItem | MenuNavGroup): item is MenuNavGroup =>
    'items' in item && Array.isArray((item as MenuNavGroup).items);

const flattenItems = (items: (MenuNavItem | MenuNavGroup)[]): MenuNavItem[] => {
    const result: MenuNavItem[] = [];
    for (const item of items) {
        if (isGroup(item)) {
            result.push(...item.items);
        } else {
            result.push(item);
        }
    }
    return result;
};

interface SearchEntry {
    item: MenuNavItem;
    path: string[];
}

const buildSearchEntries = (items: MenuNavItem[], parentPath: string[] = []): SearchEntry[] => {
    const result: SearchEntry[] = [];
    for (const item of items) {
        if (item.separator) continue;
        result.push({ item, path: parentPath });
        if (item.children && item.children.length > 0) {
            result.push(...buildSearchEntries(item.children, [...parentPath, item.label]));
        }
    }
    return result;
};

const filterSearchEntries = (entries: SearchEntry[], query: string): SearchEntry[] => {
    const q = query.toLowerCase();
    return entries.filter(({ item, path }) => {
        if (item.label.toLowerCase().includes(q)) return true;
        return path.some((segment) => segment.toLowerCase().includes(q));
    });
};

interface MobileStack {
    items: MenuNavItem[];
    title: string;
}

const collapseIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const backIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const focusableSelector = [
    'button:not([disabled])',
    '[href]:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
].join(',');

const MenuNav: React.FC<MenuNavProps> = ({
    items,
    orientation = 'vertical',
    size = 'md',
    selectedId: controlledSelectedId,
    defaultSelectedId = '',
    onSelect,
    selectionStyle = 'border-left',
    iconPosition = 'left',
    collapsed: controlledCollapsed,
    collapsible = false,
    onCollapsedChange,
    mobileBreakpoint = 768,
    mobileFullScreen = true,
    showSearch = false,
    searchPlaceholder = 'Search...',
    searchAriaLabel = 'Search navigation',
    headerSlot,
    footerSlot,
    maxSubMenuDepth = 3,
    toolbar = false,
    className,
    ariaLabel = 'Navigation',
}) => {
    const [internalSelectedId, setInternalSelectedId] = useState(defaultSelectedId);
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const [search, setSearch] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileStack, setMobileStack] = useState<MobileStack[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
        const initial = new Set<string>();
        for (const item of items) {
            if (isGroup(item) && item.defaultExpanded !== false) initial.add(item.id);
        }
        return initial;
    });
    const navRef = useRef<HTMLElement>(null);
    const mobileTriggerRef = useRef<HTMLButtonElement>(null);
    const mobileOverlayRef = useRef<HTMLDivElement>(null);
    const seenGroupsRef = useRef<Set<string>>(new Set(
        items.filter(isGroup).map((g) => g.id)
    ));
    const generatedId = useId();
    const overlayId = `eui-menu-nav-overlay-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    const selectedId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;
    const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

    useEffect(() => {
        const groups = items.filter(isGroup);
        const currentGroupIds = new Set<string>();
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            for (const g of groups) {
                currentGroupIds.add(g.id);
                if (!seenGroupsRef.current.has(g.id)) {
                    if (g.defaultExpanded !== false) next.add(g.id);
                    seenGroupsRef.current.add(g.id);
                }
            }
            for (const id of Array.from(next)) {
                if (!currentGroupIds.has(id)) next.delete(id);
            }
            for (const id of Array.from(seenGroupsRef.current)) {
                if (!currentGroupIds.has(id)) seenGroupsRef.current.delete(id);
            }
            return next;
        });
    }, [items]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < mobileBreakpoint);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [mobileBreakpoint]);

    const handleSelect = useCallback(
        (id: string, item: MenuNavItem) => {
            setInternalSelectedId(id);
            onSelect?.(id, item);
            if (isMobile) {
                setMobileOpen(false);
                setMobileStack([]);
            }
        },
        [onSelect, isMobile],
    );

    const handleCollapsedToggle = useCallback(() => {
        const next = !isCollapsed;
        setInternalCollapsed(next);
        onCollapsedChange?.(next);
    }, [isCollapsed, onCollapsedChange]);

    const handleMobileSubmenu = useCallback((subItems: MenuNavItem[], title: string) => {
        setMobileStack((prev) => {
            if (prev.length >= maxSubMenuDepth) return prev;
            return [...prev, { items: subItems, title }];
        });
    }, [maxSubMenuDepth]);

    const handleMobileBack = useCallback(() => {
        setMobileStack((prev) => prev.slice(0, -1));
    }, []);

    const closeMobile = useCallback(() => {
        setMobileOpen(false);
        setMobileStack([]);
        setSearch('');
    }, []);

    const toggleGroup = useCallback((groupId: string) => {
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(groupId)) next.delete(groupId);
            else next.add(groupId);
            return next;
        });
    }, []);

    const allFlatItems = useMemo(() => flattenItems(items), [items]);
    const searchEntries = useMemo(() => buildSearchEntries(allFlatItems), [allFlatItems]);
    const filteredSearchResults = useMemo(() => {
        if (!search.trim()) return [];
        return filterSearchEntries(searchEntries, search);
    }, [searchEntries, search]);

    const effectiveSelectionStyle = toolbar ? 'border-bottom' : orientation === 'horizontal' ? 'border-bottom' : selectionStyle;

    useEffect(() => {
        if (!isMobile || !mobileOpen) return;

        const previousActive = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeMobile();
                return;
            }
            if (e.key !== 'Tab') return;
            const overlay = mobileOverlayRef.current;
            if (!overlay) return;
            const focusable = Array.from(overlay.querySelectorAll<HTMLElement>(focusableSelector)).filter(
                (el) => el.tabIndex !== -1,
            );
            if (focusable.length === 0) {
                e.preventDefault();
                overlay.focus();
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first || !overlay.contains(document.activeElement)) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last || !overlay.contains(document.activeElement)) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        const focusFrame = requestAnimationFrame(() => {
            const overlay = mobileOverlayRef.current;
            const focusable = overlay?.querySelectorAll<HTMLElement>(focusableSelector);
            if (focusable && focusable.length > 0) {
                focusable[0].focus();
            } else {
                overlay?.focus();
            }
        });

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
            cancelAnimationFrame(focusFrame);
            previousActive?.focus?.();
        };
    }, [isMobile, mobileOpen, closeMobile]);

    const renderListItems = (itemList: MenuNavItem[]) =>
        itemList.map((item) => (
            <MenuNavItemComponent
                key={item.id}
                item={item}
                depth={0}
                maxDepth={maxSubMenuDepth}
                selectedId={selectedId}
                size={size}
                orientation={orientation}
                selectionStyle={effectiveSelectionStyle}
                iconPosition={iconPosition}
                collapsed={isCollapsed && !isMobile}
                onSelect={handleSelect}
                onMobileSubmenu={handleMobileSubmenu}
                isMobile={isMobile && mobileOpen}
            />
        ));

    const renderSearchResults = () => (
        <ul className="eui-menu-nav-list eui-menu-nav-search-results">
            {filteredSearchResults.length === 0 ? (
                <li className="eui-menu-nav-search-empty" aria-live="polite">
                    No results found
                </li>
            ) : (
                filteredSearchResults.map(({ item, path }) => (
                    <li key={item.id} className="eui-menu-nav-search-result">
                        <button
                            type="button"
                            className={cn('eui-menu-nav-item', `eui-menu-nav-item-depth-0`, 'eui-menu-nav-search-result-btn', {
                                'eui-menu-nav-item-selected': selectedId === item.id,
                                'eui-menu-nav-item-disabled': item.disabled,
                            })}
                            onClick={() => {
                                if (item.disabled) return;
                                item.onClick?.();
                                handleSelect(item.id, item);
                            }}
                            disabled={item.disabled}
                        >
                            {item.icon && <span className="eui-menu-nav-item-icon">{item.icon}</span>}
                            <span className="eui-menu-nav-search-result-text">
                                <span className="eui-menu-nav-item-label">{item.label}</span>
                                {path.length > 0 && (
                                    <span className="eui-menu-nav-search-result-path">{path.join(' / ')}</span>
                                )}
                            </span>
                            {item.badge && <span className="eui-menu-nav-item-badge">{item.badge}</span>}
                        </button>
                    </li>
                ))
            )}
        </ul>
    );

    const renderContent = () => {
        if (search.trim()) {
            return renderSearchResults();
        }

        return (
            <ul className="eui-menu-nav-list">
                {items.map((item) => {
                    if (isGroup(item)) {
                        const isExpanded = expandedGroups.has(item.id);
                        const groupContentId = `${overlayId}-group-${item.id}`;
                        const isCollapsibleGroup = item.collapsible !== false;
                        const headerInner = !isCollapsed ? (
                            <>
                                <span className="eui-menu-nav-group-label">{item.label}</span>
                                {isCollapsibleGroup && (
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className={cn('eui-menu-nav-group-chevron', { 'eui-menu-nav-group-chevron-open': isExpanded })}
                                        aria-hidden="true"
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                )}
                            </>
                        ) : null;

                        return (
                            <li key={item.id} className="eui-menu-nav-group">
                                {isCollapsibleGroup ? (
                                    <button
                                        type="button"
                                        className={cn('eui-menu-nav-group-header', {
                                            'eui-menu-nav-group-collapsed': !isExpanded,
                                        })}
                                        onClick={() => toggleGroup(item.id)}
                                        aria-expanded={isExpanded}
                                        aria-controls={groupContentId}
                                    >
                                        {headerInner}
                                    </button>
                                ) : (
                                    <div className="eui-menu-nav-group-header">
                                        {headerInner}
                                    </div>
                                )}
                                {isExpanded && (
                                    <ul id={groupContentId} className="eui-menu-nav-list eui-menu-nav-group-items">
                                        {renderListItems(item.items)}
                                    </ul>
                                )}
                            </li>
                        );
                    }
                    return (
                        <MenuNavItemComponent
                            key={item.id}
                            item={item}
                            depth={0}
                            maxDepth={maxSubMenuDepth}
                            selectedId={selectedId}
                            size={size}
                            orientation={orientation}
                            selectionStyle={effectiveSelectionStyle}
                            iconPosition={iconPosition}
                            collapsed={isCollapsed && !isMobile}
                            onSelect={handleSelect}
                            onMobileSubmenu={handleMobileSubmenu}
                            isMobile={isMobile && mobileOpen}
                        />
                    );
                })}
            </ul>
        );
    };

    const renderMobileOverlay = () => {
        if (!isMobile || !mobileOpen) return null;

        const currentStack = mobileStack.length > 0 ? mobileStack[mobileStack.length - 1] : null;
        const displayItems = currentStack ? currentStack.items : allFlatItems;
        const overlayLabel = currentStack ? currentStack.title : ariaLabel;

        return (
            <div
                ref={mobileOverlayRef}
                id={overlayId}
                role="dialog"
                aria-modal="true"
                aria-label={overlayLabel}
                tabIndex={-1}
                className={cn('eui-menu-nav-mobile-overlay', {
                    'eui-menu-nav-mobile-fullscreen': mobileFullScreen,
                })}
            >
                <div className="eui-menu-nav-mobile-header">
                    {mobileStack.length > 0 ? (
                        <button className="eui-menu-nav-mobile-back" onClick={handleMobileBack} type="button" aria-label={`Back to previous menu`}>
                            {backIcon}
                            <span>{currentStack?.title}</span>
                        </button>
                    ) : (
                        <span className="eui-menu-nav-mobile-title">{ariaLabel}</span>
                    )}
                    <button
                        className="eui-menu-nav-mobile-close"
                        onClick={closeMobile}
                        type="button"
                        aria-label="Close menu"
                    >
                        <TimesIcon />
                    </button>
                </div>

                {showSearch && (
                    <div className="eui-menu-nav-search eui-menu-nav-mobile-search">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            aria-label={searchAriaLabel}
                        />
                    </div>
                )}

                <div className="eui-menu-nav-mobile-body">
                    {search.trim() ? (
                        renderSearchResults()
                    ) : (
                        <ul className="eui-menu-nav-list">
                            {displayItems.map((item) => (
                                <MenuNavItemComponent
                                    key={item.id}
                                    item={item}
                                    depth={0}
                                    maxDepth={maxSubMenuDepth}
                                    selectedId={selectedId}
                                    size={size}
                                    orientation="vertical"
                                    selectionStyle="background"
                                    iconPosition={iconPosition}
                                    collapsed={false}
                                    onSelect={handleSelect}
                                    onMobileSubmenu={handleMobileSubmenu}
                                    isMobile={true}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        );
    };

    if (isMobile) {
        return (
            <>
                <button
                    ref={mobileTriggerRef}
                    className={cn('eui-menu-nav-mobile-trigger', `eui-menu-nav-${size}`, className)}
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open navigation menu"
                    aria-expanded={mobileOpen}
                    aria-controls={overlayId}
                    aria-haspopup="dialog"
                    type="button"
                >
                    {collapseIcon}
                </button>
                {renderMobileOverlay()}
            </>
        );
    }

    return (
        <nav
            ref={navRef}
            className={cn(
                'eui-menu-nav',
                `eui-menu-nav-${orientation}`,
                `eui-menu-nav-${size}`,
                `eui-menu-nav-select-${effectiveSelectionStyle}`,
                {
                    'eui-menu-nav-collapsed': isCollapsed,
                    'eui-menu-nav-toolbar': toolbar,
                },
                className,
            )}
            aria-label={ariaLabel}
        >
            {headerSlot && <div className="eui-menu-nav-header-slot">{headerSlot}</div>}

            {collapsible && orientation === 'vertical' && (
                <button
                    className="eui-menu-nav-collapse-btn"
                    onClick={handleCollapsedToggle}
                    aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
                    aria-pressed={isCollapsed}
                    type="button"
                >
                    {collapseIcon}
                </button>
            )}

            {showSearch && !isCollapsed && (
                <div className="eui-menu-nav-search">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={searchPlaceholder}
                        aria-label={searchAriaLabel}
                    />
                </div>
            )}

            <div className="eui-menu-nav-body">{renderContent()}</div>

            {footerSlot && <div className="eui-menu-nav-footer-slot">{footerSlot}</div>}
        </nav>
    );
};

export { MenuNav };
export type { MenuNavProps, MenuNavItem, MenuNavGroup } from './menu-nav-types';
