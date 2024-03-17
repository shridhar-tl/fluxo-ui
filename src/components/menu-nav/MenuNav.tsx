import cn from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const filterItems = (items: MenuNavItem[], query: string): MenuNavItem[] => {
    const q = query.toLowerCase();
    return items.filter((item) => {
        if (item.label.toLowerCase().includes(q)) return true;
        if (item.children) return filterItems(item.children, query).length > 0;
        return false;
    });
};

interface MobileStack {
    items: MenuNavItem[];
    title: string;
}

const collapseIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const backIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

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
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const navRef = useRef<HTMLElement>(null);

    const selectedId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;
    const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

    useEffect(() => {
        const groups = items.filter(isGroup);
        const defaultExpanded = new Set<string>();
        groups.forEach((g) => {
            if (g.defaultExpanded !== false) defaultExpanded.add(g.id);
        });
        setExpandedGroups(defaultExpanded);
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
        setMobileStack((prev) => [...prev, { items: subItems, title }]);
    }, []);

    const handleMobileBack = useCallback(() => {
        setMobileStack((prev) => prev.slice(0, -1));
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
    const filteredItems = useMemo(() => {
        if (!search.trim()) return allFlatItems;
        return filterItems(allFlatItems, search);
    }, [allFlatItems, search]);

    const effectiveSelectionStyle = toolbar ? 'border-bottom' : orientation === 'horizontal' ? 'border-bottom' : selectionStyle;

    const renderItems = (itemList: MenuNavItem[]) =>
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

    const renderContent = () => {
        if (search.trim()) {
            return <ul className="eui-menu-nav-list" role="menu">{renderItems(filteredItems)}</ul>;
        }

        return (
            <ul className="eui-menu-nav-list" role="menu">
                {items.map((item) => {
                    if (isGroup(item)) {
                        const isExpanded = expandedGroups.has(item.id);
                        return (
                            <li key={item.id} className="eui-menu-nav-group" role="none">
                                <div
                                    className={cn('eui-menu-nav-group-header', {
                                        'eui-menu-nav-group-collapsed': !isExpanded,
                                    })}
                                    onClick={() => item.collapsible !== false && toggleGroup(item.id)}
                                    role={item.collapsible !== false ? 'button' : undefined}
                                    tabIndex={item.collapsible !== false ? 0 : undefined}
                                    onKeyDown={(e) => {
                                        if (item.collapsible !== false && (e.key === 'Enter' || e.key === ' ')) {
                                            e.preventDefault();
                                            toggleGroup(item.id);
                                        }
                                    }}
                                    aria-expanded={item.collapsible !== false ? isExpanded : undefined}
                                >
                                    {!isCollapsed && <span className="eui-menu-nav-group-label">{item.label}</span>}
                                    {!isCollapsed && item.collapsible !== false && (
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className={cn('eui-menu-nav-group-chevron', { 'eui-menu-nav-group-chevron-open': isExpanded })}
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    )}
                                </div>
                                {isExpanded && renderItems(item.items)}
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

        return (
            <div
                className={cn('eui-menu-nav-mobile-overlay', {
                    'eui-menu-nav-mobile-fullscreen': mobileFullScreen,
                })}
            >
                <div className="eui-menu-nav-mobile-header">
                    {mobileStack.length > 0 ? (
                        <button className="eui-menu-nav-mobile-back" onClick={handleMobileBack} type="button">
                            {backIcon}
                            <span>{currentStack?.title}</span>
                        </button>
                    ) : (
                        <span className="eui-menu-nav-mobile-title">{ariaLabel}</span>
                    )}
                    <button
                        className="eui-menu-nav-mobile-close"
                        onClick={() => { setMobileOpen(false); setMobileStack([]); }}
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
                        />
                    </div>
                )}

                <div className="eui-menu-nav-mobile-body">
                    <ul className="eui-menu-nav-list" role="menu">
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
                </div>
            </div>
        );
    };

    if (isMobile) {
        return (
            <>
                <button
                    className={cn('eui-menu-nav-mobile-trigger', `eui-menu-nav-${size}`, className)}
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open navigation menu"
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
            role="navigation"
        >
            {headerSlot && <div className="eui-menu-nav-header-slot">{headerSlot}</div>}

            {collapsible && orientation === 'vertical' && (
                <button
                    className="eui-menu-nav-collapse-btn"
                    onClick={handleCollapsedToggle}
                    aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
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
