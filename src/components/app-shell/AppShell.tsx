import React, { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';

import cn from 'classnames';

import { lockBodyScroll, unlockBodyScroll } from '../../utils/body-scroll-lock';
import '../eui-base.scss';
import './AppShell.scss';
import { AppShellContext } from './app-shell-context';
import { readShellState, resolveBreakpoint, writeShellState } from './app-shell-storage';
import type { AppShellContextValue, AppShellProps, AppShellSlot, AppShellState } from './app-shell-types';
import { AppShellResizeHandle } from './AppShellResizeHandle';
import { AppShellSidebar } from './AppShellSidebar';

type CssVars = React.CSSProperties & Record<`--${string}`, string>;

const renderSlot = (slot: AppShellSlot | undefined, state: AppShellState): React.ReactNode =>
    typeof slot === 'function' ? slot(state) : slot;

const toCss = (value: number | string | undefined): string | undefined =>
    value === undefined ? undefined : typeof value === 'number' ? `${value}px` : value;

const clampWidth = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const AppShell = forwardRef<HTMLDivElement, AppShellProps>(
    (
        {
            children,
            header,
            sidebar,
            sidebarHeader,
            sidebarFooter,
            footer,
            aside,
            layout = 'header-first',
            sidebarPosition = 'left',
            sidebarVariant = 'default',
            sidebarWidth = 260,
            collapsedWidth = 68,
            collapsible = true,
            collapsed: controlledCollapsed,
            defaultCollapsed = false,
            onCollapsedChange,
            expandOnHover = false,
            showCollapseButton,
            mobileBreakpoint = 'lg',
            responsiveMode = 'container',
            mobileOpen: controlledMobileOpen,
            onMobileOpenChange,
            mobileSidebarWidth = 'min(85%, 300px)',
            closeOnNavigate = true,
            swipeToClose = true,
            resizable = false,
            minSidebarWidth = 200,
            maxSidebarWidth = 420,
            onSidebarWidthChange,
            asideWidth = 300,
            asideOpen = true,
            hideAsideOnMobile = true,
            headerHeight = 56,
            stickyHeader = true,
            fullHeight = true,
            height,
            contentMaxWidth,
            mainPadding,
            storageKey,
            skipLinkLabel = 'Skip to main content',
            sidebarLabel = 'Primary',
            collapseLabel = 'Collapse sidebar',
            expandLabel = 'Expand sidebar',
            openNavigationLabel = 'Open navigation',
            closeNavigationLabel = 'Close navigation',
            mainId: mainIdProp,
            classNames,
            className,
            style,
            ...rest
        },
        ref,
    ) => {
        const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
        const sidebarId = `eui-shell-sidebar-${uid}`;
        const mainId = mainIdProp ?? `eui-shell-main-${uid}`;
        const rootRef = useRef<HTMLDivElement | null>(null);
        const wasMobileRef = useRef(false);
        const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
        const [internalMobileOpen, setInternalMobileOpen] = useState(false);
        const [width, setWidth] = useState(sidebarWidth);
        const [restoredKey, setRestoredKey] = useState<string | null>(null);
        const [isMobile, setIsMobile] = useState(false);
        const [measured, setMeasured] = useState(false);
        const [hoverExpanded, setHoverExpanded] = useState(false);
        const [resizing, setResizing] = useState(false);
        const breakpoint = resolveBreakpoint(mobileBreakpoint);
        const hasSidebar = sidebar !== undefined || sidebarHeader !== undefined || sidebarFooter !== undefined;

        const effectiveCollapsed = controlledCollapsed ?? internalCollapsed;
        const collapsed = collapsible && effectiveCollapsed;
        const rawMobileOpen = controlledMobileOpen ?? internalMobileOpen;
        const mobileOpen = isMobile && rawMobileOpen;
        const effectiveWidth = resizable ? clampWidth(width, minSidebarWidth, maxSidebarWidth) : sidebarWidth;
        const visuallyCollapsed = !isMobile && collapsed && !hoverExpanded;

        const setRefs = useCallback(
            (node: HTMLDivElement | null) => {
                rootRef.current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) ref.current = node;
            },
            [ref],
        );

        useIsomorphicLayoutEffect(() => {
            const stored = readShellState(storageKey);
            if (stored.collapsed !== undefined) setInternalCollapsed(stored.collapsed);
            if (stored.width !== undefined) setWidth(stored.width);
            setRestoredKey(storageKey ?? '');
        }, [storageKey]);

        useIsomorphicLayoutEffect(() => {
            if (responsiveMode === 'viewport') {
                if (typeof window.matchMedia !== 'function') return;
                const query = window.matchMedia(`(max-width: ${breakpoint - 0.02}px)`);
                const update = () => setIsMobile(query.matches);
                update();
                query.addEventListener('change', update);
                return () => query.removeEventListener('change', update);
            }
            const node = rootRef.current;
            if (!node) return;
            setIsMobile(node.clientWidth < breakpoint);
            if (typeof ResizeObserver === 'undefined') return;
            const observer = new ResizeObserver((entries) => {
                const next = (entries[0]?.contentRect.width ?? node.clientWidth) < breakpoint;
                setIsMobile((prev) => (prev === next ? prev : next));
            });
            observer.observe(node);
            return () => observer.disconnect();
        }, [responsiveMode, breakpoint]);

        useEffect(() => {
            let second = 0;
            const first = requestAnimationFrame(() => {
                second = requestAnimationFrame(() => setMeasured(true));
            });
            return () => {
                cancelAnimationFrame(first);
                cancelAnimationFrame(second);
            };
        }, []);

        useEffect(() => {
            if (!collapsed) setHoverExpanded(false);
        }, [collapsed]);

        useEffect(() => {
            if (!storageKey || restoredKey !== storageKey || resizing) return;
            writeShellState(storageKey, { collapsed: effectiveCollapsed, width: effectiveWidth });
        }, [storageKey, restoredKey, resizing, effectiveCollapsed, effectiveWidth]);

        useEffect(() => {
            if (!mobileOpen || !fullHeight) return;
            lockBodyScroll();
            return () => unlockBodyScroll();
        }, [mobileOpen, fullHeight]);

        const setCollapsed = useCallback(
            (next: boolean) => {
                if (!collapsible) return;
                if (controlledCollapsed === undefined) setInternalCollapsed(next);
                onCollapsedChange?.(next);
            },
            [collapsible, controlledCollapsed, onCollapsedChange],
        );

        const setMobileOpen = useCallback(
            (next: boolean) => {
                if (controlledMobileOpen === undefined) setInternalMobileOpen(next);
                onMobileOpenChange?.(next);
            },
            [controlledMobileOpen, onMobileOpenChange],
        );

        useEffect(() => {
            const leftMobile = wasMobileRef.current && !isMobile;
            wasMobileRef.current = isMobile;
            if (isMobile) {
                setHoverExpanded(false);
                return;
            }
            if (leftMobile && rawMobileOpen) setMobileOpen(false);
        }, [isMobile, rawMobileOpen, setMobileOpen]);

        const closeMobile = useCallback(() => setMobileOpen(false), [setMobileOpen]);
        const toggleCollapsed = useCallback(() => setCollapsed(!collapsed), [setCollapsed, collapsed]);
        const toggleSidebar = useCallback(() => {
            if (isMobile) setMobileOpen(!mobileOpen);
            else setCollapsed(!collapsed);
        }, [isMobile, mobileOpen, collapsed, setMobileOpen, setCollapsed]);

        const handleResize = useCallback(
            (next: number) => {
                setWidth(next);
                onSidebarWidthChange?.(next);
            },
            [onSidebarWidthChange],
        );

        const reportedCollapsed = !isMobile && collapsed && !hoverExpanded;

        const contextValue = useMemo<AppShellContextValue>(
            () => ({
                collapsed: reportedCollapsed,
                isMobile,
                mobileOpen,
                closeMobile,
                setCollapsed,
                toggleCollapsed,
                setMobileOpen,
                toggleSidebar,
                sidebarId,
                mainId,
                collapsible,
                collapseLabel,
                expandLabel,
                openNavigationLabel,
                closeNavigationLabel,
            }),
            [
                reportedCollapsed,
                isMobile,
                mobileOpen,
                closeMobile,
                setCollapsed,
                toggleCollapsed,
                setMobileOpen,
                toggleSidebar,
                sidebarId,
                mainId,
                collapsible,
                collapseLabel,
                expandLabel,
                openNavigationLabel,
                closeNavigationLabel,
            ],
        );

        const slotState: AppShellState = { collapsed: reportedCollapsed, isMobile, mobileOpen, closeMobile };
        const headerNode = renderSlot(header, slotState);
        const footerNode = renderSlot(footer, slotState);
        const asideNode = asideOpen && !(isMobile && hideAsideOnMobile) ? renderSlot(aside, slotState) : null;

        const styleVars: CssVars = {
            '--eui-shell-sidebar-w': `${effectiveWidth}px`,
            '--eui-shell-collapsed-w': `${collapsedWidth}px`,
            '--eui-shell-mobile-w': toCss(mobileSidebarWidth) ?? '300px',
            '--eui-shell-aside-w': `${asideWidth}px`,
            '--eui-shell-header-h': `${headerHeight}px`,
            ...(contentMaxWidth !== undefined ? { '--eui-shell-content-max': toCss(contentMaxWidth) as string } : null),
            ...(mainPadding !== undefined ? { '--eui-shell-main-pad': toCss(mainPadding) as string } : null),
            ...(height !== undefined ? { height: toCss(height) } : null),
            ...style,
        };

        const sidebarNode = hasSidebar ? (
            <AppShellSidebar
                id={sidebarId}
                label={sidebarLabel}
                position={sidebarPosition}
                variant={sidebarVariant}
                isMobile={isMobile}
                mobileOpen={mobileOpen}
                collapsed={collapsed}
                visuallyCollapsed={visuallyCollapsed}
                hoverExpanded={hoverExpanded}
                expandOnHover={expandOnHover}
                showCollapseButton={showCollapseButton ?? collapsible}
                collapseLabel={collapseLabel}
                expandLabel={expandLabel}
                closeOnNavigate={closeOnNavigate}
                swipeToClose={swipeToClose}
                header={renderSlot(sidebarHeader, slotState)}
                footer={renderSlot(sidebarFooter, slotState)}
                className={classNames?.sidebar}
                onToggleCollapsed={toggleCollapsed}
                onCloseMobile={closeMobile}
                onHoverChange={setHoverExpanded}
                resizeHandle={
                    resizable && !isMobile && !collapsed ? (
                        <AppShellResizeHandle
                            width={effectiveWidth}
                            min={minSidebarWidth}
                            max={maxSidebarWidth}
                            defaultWidth={sidebarWidth}
                            position={sidebarPosition}
                            controls={sidebarId}
                            onResize={handleResize}
                            onResizeStateChange={setResizing}
                        />
                    ) : null
                }
            >
                {renderSlot(sidebar, slotState)}
            </AppShellSidebar>
        ) : null;

        const headerElement =
            headerNode !== undefined && headerNode !== null ? (
                <header className={cn('eui-app-shell-header', { 'eui-app-shell-header-sticky': stickyHeader }, classNames?.header)}>{headerNode}</header>
            ) : null;

        const mainColumn = (
            <div className="eui-app-shell-content">
                {layout === 'sidebar-first' && headerElement}
                <main id={mainId} tabIndex={-1} className={cn('eui-app-shell-main', classNames?.main)}>
                    <div className="eui-app-shell-main-inner">{children}</div>
                </main>
                {footerNode !== undefined && footerNode !== null && (
                    <footer className={cn('eui-app-shell-footer', classNames?.footer)}>{footerNode}</footer>
                )}
            </div>
        );

        const asideElement = asideNode ? (
            <aside className={cn('eui-app-shell-aside', classNames?.aside)} aria-label="Secondary">
                {asideNode}
            </aside>
        ) : null;

        return (
            <AppShellContext.Provider value={contextValue}>
                <div
                    ref={setRefs}
                    {...rest}
                    className={cn(
                        'eui-app-shell',
                        `eui-app-shell-${layout}`,
                        `eui-app-shell-sidebar-pos-${sidebarPosition}`,
                        `eui-app-shell-variant-${sidebarVariant}`,
                        {
                            'eui-app-shell-full': fullHeight && height === undefined,
                            'eui-app-shell-mobile': isMobile,
                            'eui-app-shell-collapsed': visuallyCollapsed,
                            'eui-app-shell-collapsed-hover': !isMobile && collapsed && hoverExpanded,
                            'eui-app-shell-resizing': resizing,
                            'eui-app-shell-unmeasured': !measured,
                            'eui-app-shell-no-sidebar': !hasSidebar,
                        },
                        className,
                    )}
                    style={styleVars}
                >
                    <a className="eui-app-shell-skip" href={`#${mainId}`}>
                        {skipLinkLabel}
                    </a>
                    {layout === 'header-first' && headerElement}
                    <div className="eui-app-shell-body">
                        {sidebarNode}
                        {mainColumn}
                        {asideElement}
                    </div>
                </div>
            </AppShellContext.Provider>
        );
    },
);

AppShell.displayName = 'AppShell';

export { AppShell };
