import classNames from 'classnames';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import './context-menu.scss';
import { ContextMenuState } from './types';
import { setContextMenuHandler } from './utils';

const maxMenuWidth = 280;
const maxMenuHeight = 320;
const scrollZoneHeight = 28;
const scrollSpeed = 4;

interface ScrollableMenuListProps {
    children: React.ReactNode;
}

const ScrollableMenuList: React.FC<ScrollableMenuListProps> = ({ children }) => {
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
    }, []);

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
    }, []);

    useEffect(() => {
        return () => stopScroll();
    }, []);

    return (
        <div className="eui-context-menu-scrollable">
            <div
                className={classNames('eui-context-menu-scroll-zone', 'eui-context-menu-scroll-zone-top')}
                style={{ height: scrollZoneHeight, pointerEvents: showTop ? 'auto' : 'none', opacity: showTop ? 1 : 0 }}
                onMouseEnter={() => startScroll('up')}
                onMouseLeave={stopScroll}
            >
                <svg className="eui-context-menu-scroll-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                        fillRule="evenodd"
                        d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>
            <div ref={listRef} className="eui-context-menu-scroll-list" style={{ maxHeight: maxMenuHeight }} onScroll={updateArrows}>
                <div style={{ paddingTop: showTop ? scrollZoneHeight : 0, paddingBottom: showBottom ? scrollZoneHeight : 0 }}>
                    {children}
                </div>
            </div>
            <div
                className={classNames('eui-context-menu-scroll-zone', 'eui-context-menu-scroll-zone-bottom')}
                style={{ height: scrollZoneHeight, pointerEvents: showBottom ? 'auto' : 'none', opacity: showBottom ? 1 : 0 }}
                onMouseEnter={() => startScroll('down')}
                onMouseLeave={stopScroll}
            >
                <svg className="eui-context-menu-scroll-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>
        </div>
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

    useEffect(() => {
        setContextMenuHandler((event, menus, options) => {
            const docX = event.clientX + window.scrollX;
            const docY = event.clientY + window.scrollY;
            setState({
                visible: true,
                menus,
                eventX: event.clientX,
                eventY: event.clientY,
                placement: options?.placement || 'auto',
                style: { left: docX, top: docY, opacity: 0 },
            });
        });
        return () => setContextMenuHandler(null);
    }, []);

    useLayoutEffect(() => {
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
    }, [state.visible, state.eventX, state.eventY, state.placement]);

    useEffect(() => {
        if (!state.visible) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setState((prev) => ({ ...prev, visible: false }));
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setState((prev) => ({ ...prev, visible: false }));
            }
        };

        window.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleEscape);
        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleEscape);
        };
    }, [state.visible]);

    if (!state.visible) return null;

    return ReactDOM.createPortal(
        <div
            ref={menuRef}
            className="eui-context-menu"
            style={{
                top: state.style.top,
                left: state.style.left,
                opacity: state.style.opacity,
                maxWidth: maxMenuWidth,
                minWidth: 160,
            }}
        >
            <ScrollableMenuList>
                {state.menus.map((menu, idx) => {
                    if ('seperator' in menu && menu.seperator) {
                        return <div key={idx} className="eui-context-menu-separator" />;
                    }
                    if ('items' in menu && Array.isArray(menu.items)) {
                        return <SubMenuItem key={idx} menu={menu} onClose={() => setState((prev) => ({ ...prev, visible: false }))} />;
                    }
                    return (
                        <button
                            key={idx}
                            role="menuitem"
                            tabIndex={0}
                            className={classNames('eui-context-menu-item', { 'eui-context-menu-item-disabled': menu.disabled })}
                            disabled={menu.disabled}
                            onClick={() => {
                                menu.command?.(menu.id);
                                setState((prev) => ({ ...prev, visible: false }));
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    menu.command?.(menu.id);
                                    setState((prev) => ({ ...prev, visible: false }));
                                }
                            }}
                        >
                            {menu.icon && <span className="eui-context-menu-item-icon">{menu.icon}</span>}
                            <span className="eui-context-menu-item-label">{menu.label}</span>
                        </button>
                    );
                })}
            </ScrollableMenuList>
        </div>,
        document.body,
    );
};

interface SubMenuItemProps {
    menu: import('./types').MenuItem;
    onClose: () => void;
}

const SubMenuItem: React.FC<SubMenuItemProps> = ({ menu, onClose }) => {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const subMenuRef = useRef<HTMLDivElement>(null);
    const [subStyle, setSubStyle] = useState<React.CSSProperties>({});

    useLayoutEffect(() => {
        if (open && triggerRef.current && subMenuRef.current) {
            const parentRect = triggerRef.current.getBoundingClientRect();
            const subRect = subMenuRef.current.getBoundingClientRect();
            const spaceRight = window.innerWidth - parentRect.right;
            const spaceBelow = window.innerHeight - parentRect.top;

            const openLeft = spaceRight < subRect.width && parentRect.left > subRect.width;
            const openUp = spaceBelow < subRect.height;

            setSubStyle({
                position: 'fixed',
                top: openUp ? parentRect.bottom - subRect.height : parentRect.top,
                left: openLeft ? parentRect.left - subRect.width : parentRect.right,
            });
        }
    }, [open]);

    const handleMouseLeave = (e: React.MouseEvent) => {
        const related = e.relatedTarget as Node | null;
        if (triggerRef.current?.contains(related) || subMenuRef.current?.contains(related)) {
            return;
        }
        setOpen(false);
    };

    return (
        <div ref={triggerRef} className="eui-context-submenu" onMouseEnter={() => setOpen(true)} onMouseLeave={handleMouseLeave}>
            <button
                role="menuitem"
                tabIndex={0}
                className="eui-context-menu-item"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') setOpen(true);
                    if (e.key === 'ArrowLeft' || e.key === 'Escape') setOpen(false);
                }}
            >
                {menu.icon && <span className="eui-context-menu-item-icon">{menu.icon}</span>}
                <span className="eui-context-menu-item-label">{menu.label}</span>
                <svg className="eui-context-menu-item-arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                        fillRule="evenodd"
                        d="M7.293 4.293a1 1 0 011.414 0L14.414 10l-5.707 5.707a1 1 0 01-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
            {open &&
                ReactDOM.createPortal(
                    <div
                        ref={subMenuRef}
                        className="eui-context-submenu-panel"
                        style={{ ...subStyle, maxWidth: maxMenuWidth, minWidth: 160 }}
                        onMouseLeave={handleMouseLeave}
                    >
                        <ScrollableMenuList>
                            {menu.items?.map((item, i) => (
                                <button
                                    key={i}
                                    role="menuitem"
                                    tabIndex={0}
                                    className={classNames('eui-context-menu-item', { 'eui-context-menu-item-disabled': item.disabled })}
                                    disabled={item.disabled}
                                    onClick={() => {
                                        item.command?.(item.id);
                                        onClose();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            item.command?.(item.id);
                                            onClose();
                                        }
                                    }}
                                >
                                    {item.icon && <span className="eui-context-menu-item-icon">{item.icon}</span>}
                                    <span className="eui-context-menu-item-label">{item.label}</span>
                                </button>
                            ))}
                        </ScrollableMenuList>
                    </div>,
                    document.body,
                )}
        </div>
    );
};

export default ContextMenuManager;
