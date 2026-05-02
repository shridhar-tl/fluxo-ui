import classNames from 'classnames';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDownIcon, ChevronRightIcon, ChevronUpIcon, TimesIcon } from '../../assets/icons';
import { useViewport } from '../../hooks/useMobile';
import './context-menu.scss';
import { ContextMenuState, isSeparator, MenuItem, MenuItemBase } from './types';
import { setContextMenuHandler } from './utils';

const maxMenuWidth = 280;
const maxMenuHeight = 320;
const scrollZoneHeight = 28;
const scrollSpeed = 4;

const isInteractiveItem = (m: MenuItemBase) => !isSeparator(m) && !m.disabled;

const findFirstInteractive = (items: MenuItemBase[], from = 0, dir: 1 | -1 = 1): number => {
    let i = from;
    while (i >= 0 && i < items.length) {
        if (isInteractiveItem(items[i])) return i;
        i += dir;
    }
    return -1;
};

interface ScrollableMenuListProps {
    children: React.ReactNode;
    onScroll?: () => void;
    listRefCallback?: (el: HTMLDivElement | null) => void;
}

const ScrollableMenuList: React.FC<ScrollableMenuListProps> = ({ children, onScroll, listRefCallback }) => {
    const listRef = useRef<HTMLDivElement>(null);
    const scrollRafRef = useRef<number | null>(null);
    const scrollingRef = useRef(false);
    const [showTop, setShowTop] = useState(false);
    const [showBottom, setShowBottom] = useState(false);

    const updateArrows = useCallback(() => {
        const el = listRef.current;
        if (!el) return;
        setShowTop(el.scrollTop > 0);
        setShowBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    }, []);

    useEffect(() => {
        updateArrows();
    }, [updateArrows]);

    const stopScroll = useCallback(() => {
        scrollingRef.current = false;
        if (scrollRafRef.current !== null) {
            cancelAnimationFrame(scrollRafRef.current);
            scrollRafRef.current = null;
        }
    }, []);

    const startScroll = useCallback((direction: 'up' | 'down') => {
        if (scrollingRef.current) return;
        scrollingRef.current = true;
        const el = listRef.current;
        if (!el) return;
        const step = () => {
            if (!scrollingRef.current) return;
            const before = el.scrollTop;
            el.scrollTop += direction === 'down' ? scrollSpeed : -scrollSpeed;
            if (el.scrollTop === before) {
                stopScroll();
                return;
            }
            updateArrows();
            scrollRafRef.current = requestAnimationFrame(step);
        };
        scrollRafRef.current = requestAnimationFrame(step);
    }, [stopScroll, updateArrows]);

    useEffect(() => {
        return () => stopScroll();
    }, [stopScroll]);

    const handleScroll = () => {
        updateArrows();
        onScroll?.();
    };

    return (
        <div className="eui-context-menu-scrollable">
            <div
                className={classNames('eui-context-menu-scroll-zone', 'eui-context-menu-scroll-zone-top')}
                style={{ height: scrollZoneHeight, pointerEvents: showTop ? 'auto' : 'none', opacity: showTop ? 1 : 0 }}
                onMouseEnter={() => startScroll('up')}
                onMouseLeave={stopScroll}
                aria-hidden="true"
            >
                <ChevronUpIcon className="eui-context-menu-scroll-icon" aria-hidden="true" />
            </div>
            <div
                ref={(el) => {
                    listRef.current = el;
                    listRefCallback?.(el);
                }}
                className="eui-context-menu-scroll-list"
                style={{ maxHeight: maxMenuHeight }}
                onScroll={handleScroll}
            >
                <div style={{ paddingTop: showTop ? scrollZoneHeight : 0, paddingBottom: showBottom ? scrollZoneHeight : 0 }}>
                    {children}
                </div>
            </div>
            <div
                className={classNames('eui-context-menu-scroll-zone', 'eui-context-menu-scroll-zone-bottom')}
                style={{ height: scrollZoneHeight, pointerEvents: showBottom ? 'auto' : 'none', opacity: showBottom ? 1 : 0 }}
                onMouseEnter={() => startScroll('down')}
                onMouseLeave={stopScroll}
                aria-hidden="true"
            >
                <ChevronDownIcon className="eui-context-menu-scroll-icon" aria-hidden="true" />
            </div>
        </div>
    );
};

interface DesktopMenuItemsProps {
    menus: MenuItem[];
    onClose: () => void;
    onScrollListRef?: (el: HTMLDivElement | null) => void;
}

const DesktopMenuItems: React.FC<DesktopMenuItemsProps> = ({ menus, onClose, onScrollListRef }) => {
    const [focusedIndex, setFocusedIndex] = useState<number>(() => findFirstInteractive(menus));
    const itemRefs = useRef<Array<HTMLButtonElement | HTMLDivElement | null>>([]);
    const typeAheadRef = useRef<{ buffer: string; timer: number | null }>({ buffer: '', timer: null });
    const [scrollPing, setScrollPing] = useState(0);

    useEffect(() => {
        const idx = findFirstInteractive(menus);
        setFocusedIndex(idx);
    }, [menus]);

    useEffect(() => {
        const target = itemRefs.current[focusedIndex];
        target?.focus();
    }, [focusedIndex]);

    const moveFocus = (delta: 1 | -1) => {
        const len = menus.length;
        if (len === 0) return;
        let next = focusedIndex;
        for (let i = 0; i < len; i++) {
            next = (next + delta + len) % len;
            if (isInteractiveItem(menus[next])) {
                setFocusedIndex(next);
                return;
            }
        }
    };

    const handleTypeAhead = (key: string) => {
        const state = typeAheadRef.current;
        if (state.timer !== null) window.clearTimeout(state.timer);
        state.buffer += key.toLowerCase();
        state.timer = window.setTimeout(() => {
            state.buffer = '';
            state.timer = null;
        }, 600);
        const search = state.buffer;
        const startIndex = (focusedIndex + 1) % menus.length;
        for (let i = 0; i < menus.length; i++) {
            const idx = (startIndex + i) % menus.length;
            const item = menus[idx];
            if (!isInteractiveItem(item)) continue;
            if (item.label?.toLowerCase().startsWith(search)) {
                setFocusedIndex(idx);
                return;
            }
        }
    };

    const handleItemKeyDown = (e: React.KeyboardEvent, item: MenuItemBase, hasChildren: boolean) => {
        const key = e.key;
        if (key === 'ArrowDown') {
            e.preventDefault();
            moveFocus(1);
        } else if (key === 'ArrowUp') {
            e.preventDefault();
            moveFocus(-1);
        } else if (key === 'Home') {
            e.preventDefault();
            const i = findFirstInteractive(menus, 0, 1);
            if (i !== -1) setFocusedIndex(i);
        } else if (key === 'End') {
            e.preventDefault();
            const i = findFirstInteractive(menus, menus.length - 1, -1);
            if (i !== -1) setFocusedIndex(i);
        } else if (key === 'Enter' || key === ' ') {
            if (hasChildren) return;
            e.preventDefault();
            if (item.disabled) return;
            item.command?.(item.id);
            onClose();
        } else if (key.length === 1 && /[a-z0-9]/i.test(key)) {
            handleTypeAhead(key);
        }
    };

    return (
        <ScrollableMenuList
            onScroll={() => setScrollPing((n) => n + 1)}
            listRefCallback={onScrollListRef}
        >
            {menus.map((menu, idx) => {
                if (isSeparator(menu)) {
                    return <div key={idx} className="eui-context-menu-separator" role="separator" />;
                }
                if ('items' in menu && Array.isArray(menu.items)) {
                    return (
                        <SubMenuItem
                            key={idx}
                            menu={menu}
                            onClose={onClose}
                            tabIndex={focusedIndex === idx ? 0 : -1}
                            onFocusItem={() => setFocusedIndex(idx)}
                            onTypeAhead={handleTypeAhead}
                            siblings={menus}
                            siblingIndex={idx}
                            onMoveFocus={moveFocus}
                            scrollPing={scrollPing}
                            registerRef={(el) => { itemRefs.current[idx] = el; }}
                        />
                    );
                }
                return (
                    <button
                        key={idx}
                        ref={(el) => { itemRefs.current[idx] = el; }}
                        role="menuitem"
                        tabIndex={focusedIndex === idx ? 0 : -1}
                        className={classNames('eui-context-menu-item', { 'eui-context-menu-item-disabled': menu.disabled })}
                        disabled={menu.disabled}
                        onClick={() => {
                            menu.command?.(menu.id);
                            onClose();
                        }}
                        onFocus={() => setFocusedIndex(idx)}
                        onMouseEnter={() => setFocusedIndex(idx)}
                        onKeyDown={(e) => handleItemKeyDown(e, menu, false)}
                    >
                        {menu.icon && <span className="eui-context-menu-item-icon" aria-hidden="true">{menu.icon}</span>}
                        <span className="eui-context-menu-item-label">{menu.label}</span>
                    </button>
                );
            })}
        </ScrollableMenuList>
    );
};

export const ContextMenuManager: React.FC = () => {
    const [state, setState] = useState<ContextMenuState>({
        visible: false,
        menus: [],
        eventX: 0,
        eventY: 0,
        placement: 'auto',
        style: { left: 0, top: 0, opacity: 0 },
    });
    const menuRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const { isCompact, isMobile, isTablet } = useViewport();

    const closeMenu = useCallback(() => {
        setState((prev) => ({ ...prev, visible: false }));
    }, []);

    useEffect(() => {
        setContextMenuHandler((event, menus, options) => {
            previousFocusRef.current = document.activeElement as HTMLElement | null;
            setState({
                visible: true,
                menus,
                eventX: event.clientX,
                eventY: event.clientY,
                placement: options?.placement || 'auto',
                style: { left: event.clientX + window.scrollX, top: event.clientY + window.scrollY, opacity: 0 },
            });
        });
        return () => setContextMenuHandler(null);
    }, []);

    useEffect(() => {
        if (state.visible) return;
        previousFocusRef.current?.focus?.();
    }, [state.visible]);

    useLayoutEffect(() => {
        if (isCompact) return;
        if (state.visible && menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const sx = window.scrollX;
            const sy = window.scrollY;
            let left = state.eventX;
            let top = state.eventY;
            if (state.placement !== 'auto') {
                switch (state.placement) {
                    case 'bottomRight':
                        left = state.eventX;
                        top = state.eventY;
                        break;
                    case 'bottomLeft':
                        left = state.eventX - rect.width;
                        top = state.eventY;
                        break;
                    case 'topRight':
                        left = state.eventX;
                        top = state.eventY - rect.height;
                        break;
                    case 'topLeft':
                        left = state.eventX - rect.width;
                        top = state.eventY - rect.height;
                        break;
                }
            } else {
                if (state.eventX + rect.width > window.innerWidth) {
                    left = state.eventX - rect.width;
                    if (left < 0) left = 0;
                }
                if (state.eventY + rect.height > window.innerHeight) {
                    top = state.eventY - rect.height;
                    if (top < 0) top = 0;
                }
            }
            setState((prev) => ({
                ...prev,
                style: { left: left + sx, top: top + sy, opacity: 1 },
            }));
        }
    }, [state.visible, state.eventX, state.eventY, state.placement, isCompact]);

    useEffect(() => {
        if (!state.visible || isCompact) return;

        const recompute = () => {
            if (!menuRef.current) return;
            const rect = menuRef.current.getBoundingClientRect();
            const sx = window.scrollX;
            const sy = window.scrollY;
            let left = state.eventX;
            let top = state.eventY;
            if (state.eventX + rect.width > window.innerWidth) {
                left = Math.max(0, state.eventX - rect.width);
            }
            if (state.eventY + rect.height > window.innerHeight) {
                top = Math.max(0, state.eventY - rect.height);
            }
            setState((prev) => ({
                ...prev,
                style: { left: left + sx, top: top + sy, opacity: 1 },
            }));
        };

        window.addEventListener('resize', recompute);
        window.addEventListener('scroll', recompute, true);
        return () => {
            window.removeEventListener('resize', recompute);
            window.removeEventListener('scroll', recompute, true);
        };
    }, [state.visible, state.eventX, state.eventY, isCompact]);

    useEffect(() => {
        if (!state.visible) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                closeMenu();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeMenu();
            }
        };

        if (!isCompact) {
            window.addEventListener('mousedown', handleClickOutside);
        }
        window.addEventListener('keydown', handleEscape);

        if (isCompact) {
            const previousOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                window.removeEventListener('keydown', handleEscape);
                document.body.style.overflow = previousOverflow;
            };
        }

        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleEscape);
        };
    }, [state.visible, isCompact, closeMenu]);

    if (!state.visible) return null;

    if (isCompact) {
        return ReactDOM.createPortal(
            <div
                className={classNames('eui-context-menu-sheet-backdrop', {
                    'eui-context-menu-sheet-backdrop-mobile': isMobile,
                    'eui-context-menu-sheet-backdrop-tablet': isTablet,
                })}
                onClick={closeMenu}
            >
                <div
                    ref={menuRef}
                    className={classNames('eui-context-menu-sheet', {
                        'eui-context-menu-sheet-mobile': isMobile,
                        'eui-context-menu-sheet-tablet': isTablet,
                    })}
                    role="menu"
                    aria-label="Context menu"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="eui-context-menu-sheet-header">
                        <span className="eui-context-menu-sheet-grabber" aria-hidden="true" />
                        <button
                            type="button"
                            className="eui-context-menu-sheet-close"
                            onClick={closeMenu}
                            aria-label="Close menu"
                        >
                            <TimesIcon />
                        </button>
                    </div>
                    <div className="eui-context-menu-sheet-body">
                        {state.menus.map((menu, idx) => {
                            if (isSeparator(menu)) {
                                return <div key={idx} className="eui-context-menu-separator" role="separator" />;
                            }
                            if ('items' in menu && Array.isArray(menu.items)) {
                                return (
                                    <MobileSubMenuItem
                                        key={idx}
                                        menu={menu}
                                        onClose={closeMenu}
                                    />
                                );
                            }
                            return (
                                <button
                                    key={idx}
                                    role="menuitem"
                                    tabIndex={0}
                                    className={classNames('eui-context-menu-item eui-context-menu-item-mobile', {
                                        'eui-context-menu-item-disabled': menu.disabled,
                                    })}
                                    disabled={menu.disabled}
                                    onClick={() => {
                                        menu.command?.(menu.id);
                                        closeMenu();
                                    }}
                                >
                                    {menu.icon && <span className="eui-context-menu-item-icon" aria-hidden="true">{menu.icon}</span>}
                                    <span className="eui-context-menu-item-label">{menu.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>,
            document.body,
        );
    }

    return ReactDOM.createPortal(
        <div
            ref={menuRef}
            className="eui-context-menu"
            role="menu"
            aria-label="Context menu"
            style={{
                top: state.style.top,
                left: state.style.left,
                opacity: state.style.opacity,
                maxWidth: maxMenuWidth,
                minWidth: 160,
            }}
        >
            <DesktopMenuItems menus={state.menus} onClose={closeMenu} />
        </div>,
        document.body,
    );
};

interface MobileSubMenuItemProps {
    menu: MenuItem;
    onClose: () => void;
}

const MobileSubMenuItem: React.FC<MobileSubMenuItemProps> = ({ menu, onClose }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={classNames('eui-context-submenu-mobile', { 'eui-context-submenu-mobile-open': open })}>
            <button
                role="menuitem"
                tabIndex={0}
                className="eui-context-menu-item eui-context-menu-item-mobile"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
            >
                {menu.icon && <span className="eui-context-menu-item-icon" aria-hidden="true">{menu.icon}</span>}
                <span className="eui-context-menu-item-label">{menu.label}</span>
                <ChevronDownIcon
                    className={classNames('eui-context-menu-item-arrow', 'eui-context-menu-item-arrow-mobile', {
                        'eui-context-menu-item-arrow-open': open,
                    })}
                    aria-hidden="true"
                />
            </button>
            {open && (
                <div className="eui-context-submenu-mobile-list" role="menu">
                    {menu.items?.map((item, i) => {
                        if (isSeparator(item)) {
                            return <div key={i} className="eui-context-menu-separator" role="separator" />;
                        }
                        return (
                            <button
                                key={i}
                                role="menuitem"
                                tabIndex={0}
                                className={classNames('eui-context-menu-item eui-context-menu-item-mobile eui-context-menu-item-mobile-nested', {
                                    'eui-context-menu-item-disabled': item.disabled,
                                })}
                                disabled={item.disabled}
                                onClick={() => {
                                    item.command?.(item.id);
                                    onClose();
                                }}
                            >
                                {item.icon && <span className="eui-context-menu-item-icon" aria-hidden="true">{item.icon}</span>}
                                <span className="eui-context-menu-item-label">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

interface SubMenuItemProps {
    menu: MenuItem;
    onClose: () => void;
    tabIndex: number;
    onFocusItem: () => void;
    onTypeAhead: (key: string) => void;
    siblings: MenuItem[];
    siblingIndex: number;
    onMoveFocus: (delta: 1 | -1) => void;
    scrollPing: number;
    registerRef: (el: HTMLButtonElement | null) => void;
}

const SubMenuItem: React.FC<SubMenuItemProps> = ({
    menu,
    onClose,
    tabIndex,
    onFocusItem,
    onTypeAhead,
    onMoveFocus,
    scrollPing,
    registerRef,
}) => {
    const [open, setOpen] = useState(false);
    const [openedFromKeyboard, setOpenedFromKeyboard] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const subMenuRef = useRef<HTMLDivElement>(null);
    const subItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const [subFocusedIndex, setSubFocusedIndex] = useState<number>(0);
    const [subStyle, setSubStyle] = useState<React.CSSProperties>({});
    const subItems = menu.items ?? [];

    const positionSubmenu = useCallback(() => {
        if (!triggerRef.current || !subMenuRef.current) return;
        const parentRect = triggerRef.current.getBoundingClientRect();
        const subRect = subMenuRef.current.getBoundingClientRect();
        const spaceRight = window.innerWidth - parentRect.right;
        const spaceBelow = window.innerHeight - parentRect.top;

        const openLeft = spaceRight < subRect.width && parentRect.left > subRect.width;
        const openUp = spaceBelow < subRect.height;

        const top = openUp ? parentRect.bottom - subRect.height : parentRect.top;
        const left = openLeft ? parentRect.left - subRect.width : parentRect.right;

        setSubStyle({
            position: 'absolute',
            top: top + window.scrollY,
            left: left + window.scrollX,
        });
    }, []);

    useLayoutEffect(() => {
        if (!open) return;
        positionSubmenu();
    }, [open, positionSubmenu]);

    useEffect(() => {
        if (!open) return;
        const onScroll = () => positionSubmenu();
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onScroll);
        };
    }, [open, positionSubmenu]);

    useEffect(() => {
        if (open) positionSubmenu();
    }, [scrollPing, open, positionSubmenu]);

    useEffect(() => {
        if (!open || !openedFromKeyboard) return;
        const idx = findFirstInteractive(subItems);
        if (idx >= 0) {
            setSubFocusedIndex(idx);
            requestAnimationFrame(() => subItemRefs.current[idx]?.focus());
        }
    }, [open, openedFromKeyboard, subItems]);

    const moveSubFocus = (delta: 1 | -1) => {
        const len = subItems.length;
        if (len === 0) return;
        let next = subFocusedIndex;
        for (let i = 0; i < len; i++) {
            next = (next + delta + len) % len;
            if (isInteractiveItem(subItems[next])) {
                setSubFocusedIndex(next);
                subItemRefs.current[next]?.focus();
                return;
            }
        }
    };

    const handleMouseLeave = (e: React.MouseEvent) => {
        const related = e.relatedTarget as Node | null;
        if (triggerRef.current?.contains(related) || subMenuRef.current?.contains(related)) {
            return;
        }
        setOpen(false);
        setOpenedFromKeyboard(false);
    };

    return (
        <>
            <button
                ref={(el) => {
                    (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
                    registerRef(el);
                }}
                role="menuitem"
                tabIndex={tabIndex}
                aria-haspopup="menu"
                aria-expanded={open}
                className="eui-context-menu-item"
                onClick={() => setOpen((v) => !v)}
                onMouseEnter={() => { setOpen(true); onFocusItem(); }}
                onMouseLeave={handleMouseLeave}
                onFocus={onFocusItem}
                onKeyDown={(e) => {
                    const k = e.key;
                    if (k === 'Enter' || k === ' ' || k === 'ArrowRight') {
                        e.preventDefault();
                        setOpen(true);
                        setOpenedFromKeyboard(true);
                        return;
                    }
                    if (k === 'ArrowLeft' || k === 'Escape') {
                        if (open) {
                            e.preventDefault();
                            setOpen(false);
                            setOpenedFromKeyboard(false);
                            return;
                        }
                    }
                    if (k === 'ArrowDown') {
                        e.preventDefault();
                        onMoveFocus(1);
                        return;
                    }
                    if (k === 'ArrowUp') {
                        e.preventDefault();
                        onMoveFocus(-1);
                        return;
                    }
                    if (k.length === 1 && /[a-z0-9]/i.test(k)) {
                        onTypeAhead(k);
                    }
                }}
            >
                {menu.icon && <span className="eui-context-menu-item-icon" aria-hidden="true">{menu.icon}</span>}
                <span className="eui-context-menu-item-label">{menu.label}</span>
                <ChevronRightIcon className="eui-context-menu-item-arrow" aria-hidden="true" />
            </button>
            {open &&
                ReactDOM.createPortal(
                    <div
                        ref={subMenuRef}
                        role="menu"
                        aria-label={menu.label}
                        className="eui-context-submenu-panel"
                        style={{ ...subStyle, maxWidth: maxMenuWidth, minWidth: 160 }}
                        onMouseLeave={handleMouseLeave}
                    >
                        <ScrollableMenuList>
                            {subItems.map((item, i) => {
                                if (isSeparator(item)) {
                                    return <div key={i} className="eui-context-menu-separator" role="separator" />;
                                }
                                return (
                                    <button
                                        key={i}
                                        ref={(el) => { subItemRefs.current[i] = el; }}
                                        role="menuitem"
                                        tabIndex={subFocusedIndex === i ? 0 : -1}
                                        className={classNames('eui-context-menu-item', { 'eui-context-menu-item-disabled': item.disabled })}
                                        disabled={item.disabled}
                                        onClick={() => {
                                            item.command?.(item.id);
                                            onClose();
                                        }}
                                        onFocus={() => setSubFocusedIndex(i)}
                                        onMouseEnter={() => setSubFocusedIndex(i)}
                                        onKeyDown={(e) => {
                                            const k = e.key;
                                            if (k === 'ArrowDown') {
                                                e.preventDefault();
                                                moveSubFocus(1);
                                            } else if (k === 'ArrowUp') {
                                                e.preventDefault();
                                                moveSubFocus(-1);
                                            } else if (k === 'ArrowLeft' || k === 'Escape') {
                                                e.preventDefault();
                                                setOpen(false);
                                                setOpenedFromKeyboard(false);
                                                triggerRef.current?.focus();
                                            } else if (k === 'Enter' || k === ' ') {
                                                if (!item.disabled) {
                                                    e.preventDefault();
                                                    item.command?.(item.id);
                                                    onClose();
                                                }
                                            }
                                        }}
                                    >
                                        {item.icon && <span className="eui-context-menu-item-icon" aria-hidden="true">{item.icon}</span>}
                                        <span className="eui-context-menu-item-label">{item.label}</span>
                                    </button>
                                );
                            })}
                        </ScrollableMenuList>
                    </div>,
                    document.body,
                )}
        </>
    );
};

export default ContextMenuManager;
