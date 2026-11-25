import React, { useEffect, useRef } from 'react';

import cn from 'classnames';

import { ChevronLeftIcon, ChevronRightIcon } from '../../assets/icons';
import { pushLayer } from '../../utils/layer-stack';
import type { AppShellSidebarPosition, AppShellSidebarVariant } from './app-shell-types';

interface AppShellSidebarProps {
    id: string;
    label: string;
    position: AppShellSidebarPosition;
    variant: AppShellSidebarVariant;
    isMobile: boolean;
    mobileOpen: boolean;
    collapsed: boolean;
    visuallyCollapsed: boolean;
    hoverExpanded: boolean;
    expandOnHover: boolean;
    showCollapseButton: boolean;
    collapseLabel: string;
    expandLabel: string;
    closeOnNavigate: boolean;
    swipeToClose: boolean;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    resizeHandle?: React.ReactNode;
    onToggleCollapsed: () => void;
    onCloseMobile: () => void;
    onHoverChange: (hovering: boolean) => void;
}

const focusableSelector =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const navigateSelector = 'a[href], [role="menuitem"], [data-eui-shell-close]';
const swipeThreshold = 60;

const AppShellSidebar: React.FC<AppShellSidebarProps> = ({
    id,
    label,
    position,
    variant,
    isMobile,
    mobileOpen,
    collapsed,
    visuallyCollapsed,
    hoverExpanded,
    expandOnHover,
    showCollapseButton,
    collapseLabel,
    expandLabel,
    closeOnNavigate,
    swipeToClose,
    header,
    footer,
    children,
    className,
    resizeHandle,
    onToggleCollapsed,
    onCloseMobile,
    onHoverChange,
}) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const swipeRef = useRef<{ x: number; y: number; id: number } | null>(null);
    const hoverTimerRef = useRef<number | null>(null);
    const closeMobileRef = useRef<(() => void) | undefined>(onCloseMobile);
    const drawerOpen = isMobile && mobileOpen;

    useEffect(() => {
        closeMobileRef.current = onCloseMobile;
    }, [onCloseMobile]);

    useEffect(() => {
        if (!drawerOpen) return;
        const previous = document.activeElement as HTMLElement | null;
        const panel = panelRef.current;
        const frame = requestAnimationFrame(() => {
            const first = panel?.querySelector<HTMLElement>(focusableSelector);
            (first ?? panel)?.focus();
        });
        const releaseLayer = pushLayer(closeMobileRef);
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Tab' || !panel) return;
            const items = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector)).filter((el) => el.offsetParent !== null);
            if (!items.length) {
                event.preventDefault();
                panel.focus();
                return;
            }
            const first = items[0];
            const last = items[items.length - 1];
            if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => {
            cancelAnimationFrame(frame);
            releaseLayer();
            document.removeEventListener('keydown', onKeyDown);
            if (previous && document.contains(previous)) previous.focus();
        };
    }, [drawerOpen]);

    useEffect(() => {
        if (hoverTimerRef.current !== null) {
            window.clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
    }, [collapsed, isMobile]);

    useEffect(
        () => () => {
            if (hoverTimerRef.current !== null) window.clearTimeout(hoverTimerRef.current);
        },
        [],
    );

    const scheduleHover = (hovering: boolean) => {
        if (!expandOnHover || isMobile || !collapsed) return;
        if (hoverTimerRef.current !== null) window.clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = window.setTimeout(() => {
            hoverTimerRef.current = null;
            onHoverChange(hovering);
        }, hovering ? 150 : 250);
    };

    const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!drawerOpen || !closeOnNavigate) return;
        const target = event.target as HTMLElement;
        if (target.closest(navigateSelector)) onCloseMobile();
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!drawerOpen || !swipeToClose || event.pointerType === 'mouse') return;
        swipeRef.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        const start = swipeRef.current;
        swipeRef.current = null;
        if (!start || start.id !== event.pointerId) return;
        const dx = event.clientX - start.x;
        const dy = Math.abs(event.clientY - start.y);
        const closingDistance = position === 'left' ? -dx : dx;
        if (closingDistance > swipeThreshold && closingDistance > dy * 1.5) onCloseMobile();
    };

    const CollapseIcon = (position === 'left') === collapsed ? ChevronRightIcon : ChevronLeftIcon;

    return (
        <>
            {isMobile && (
                <div
                    className={cn('eui-app-shell-backdrop', { 'eui-app-shell-backdrop-open': drawerOpen })}
                    onClick={onCloseMobile}
                    aria-hidden="true"
                />
            )}
            <div
                id={id}
                className={cn(
                    'eui-app-shell-sidebar',
                    `eui-app-shell-sidebar-${variant}`,
                    `eui-app-shell-sidebar-${position}`,
                    {
                        'eui-app-shell-sidebar-mobile': isMobile,
                        'eui-app-shell-sidebar-open': drawerOpen,
                        'eui-app-shell-sidebar-collapsed': visuallyCollapsed,
                        'eui-app-shell-sidebar-hover-expanded': !isMobile && collapsed && hoverExpanded,
                    },
                    className,
                )}
                inert={isMobile && !mobileOpen ? true : undefined}
            >
                <div
                    ref={panelRef}
                    className="eui-app-shell-sidebar-panel"
                    role={drawerOpen ? 'dialog' : undefined}
                    aria-modal={drawerOpen ? true : undefined}
                    aria-label={drawerOpen ? label : undefined}
                    tabIndex={drawerOpen ? -1 : undefined}
                    onMouseEnter={() => scheduleHover(true)}
                    onMouseLeave={() => scheduleHover(false)}
                    onClickCapture={handleClickCapture}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={() => {
                        swipeRef.current = null;
                    }}
                >
                    {header && <div className="eui-app-shell-sidebar-header">{header}</div>}
                    <nav className="eui-app-shell-sidebar-body" aria-label={label}>
                        {children}
                    </nav>
                    {(footer || (showCollapseButton && !isMobile)) && (
                        <div className="eui-app-shell-sidebar-footer">
                            {footer}
                            {showCollapseButton && !isMobile && (
                                <button
                                    type="button"
                                    className="eui-app-shell-collapse-btn"
                                    onClick={onToggleCollapsed}
                                    aria-expanded={!collapsed}
                                    aria-controls={id}
                                    aria-label={collapsed ? expandLabel : collapseLabel}
                                    title={collapsed ? expandLabel : collapseLabel}
                                >
                                    <CollapseIcon aria-hidden="true" />
                                    <span className="eui-app-shell-collapse-text">{collapsed ? expandLabel : collapseLabel}</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
                {resizeHandle}
            </div>
        </>
    );
};

export { AppShellSidebar };
