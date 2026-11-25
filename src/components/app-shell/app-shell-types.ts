import type React from 'react';

export type AppShellLayout = 'header-first' | 'sidebar-first';
export type AppShellSidebarPosition = 'left' | 'right';
export type AppShellSidebarVariant = 'default' | 'floating' | 'inset';
export type AppShellBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | number;
export type AppShellResponsiveMode = 'container' | 'viewport';

export interface AppShellState {
    collapsed: boolean;
    isMobile: boolean;
    mobileOpen: boolean;
    closeMobile: () => void;
}

export type AppShellSlot = React.ReactNode | ((state: AppShellState) => React.ReactNode);

export interface AppShellContextValue extends AppShellState {
    setCollapsed: (collapsed: boolean) => void;
    toggleCollapsed: () => void;
    setMobileOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    sidebarId: string;
    mainId: string;
    collapsible: boolean;
    collapseLabel: string;
    expandLabel: string;
    openNavigationLabel: string;
    closeNavigationLabel: string;
}

export interface AppShellClassNames {
    header?: string;
    sidebar?: string;
    main?: string;
    footer?: string;
    aside?: string;
}

export interface AppShellProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    children?: React.ReactNode;
    header?: AppShellSlot;
    sidebar?: AppShellSlot;
    sidebarHeader?: AppShellSlot;
    sidebarFooter?: AppShellSlot;
    footer?: AppShellSlot;
    aside?: AppShellSlot;
    layout?: AppShellLayout;
    sidebarPosition?: AppShellSidebarPosition;
    sidebarVariant?: AppShellSidebarVariant;
    sidebarWidth?: number;
    collapsedWidth?: number;
    collapsible?: boolean;
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    expandOnHover?: boolean;
    showCollapseButton?: boolean;
    mobileBreakpoint?: AppShellBreakpoint;
    responsiveMode?: AppShellResponsiveMode;
    mobileOpen?: boolean;
    onMobileOpenChange?: (open: boolean) => void;
    mobileSidebarWidth?: number | string;
    closeOnNavigate?: boolean;
    swipeToClose?: boolean;
    resizable?: boolean;
    minSidebarWidth?: number;
    maxSidebarWidth?: number;
    onSidebarWidthChange?: (width: number) => void;
    asideWidth?: number;
    asideOpen?: boolean;
    hideAsideOnMobile?: boolean;
    headerHeight?: number;
    stickyHeader?: boolean;
    fullHeight?: boolean;
    height?: number | string;
    contentMaxWidth?: number | string;
    mainPadding?: number | string;
    storageKey?: string;
    skipLinkLabel?: string;
    sidebarLabel?: string;
    collapseLabel?: string;
    expandLabel?: string;
    openNavigationLabel?: string;
    closeNavigationLabel?: string;
    mainId?: string;
    classNames?: AppShellClassNames;
}

export interface AppShellToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    children?: React.ReactNode;
    mode?: 'auto' | 'mobile' | 'collapse';
    hideOnDesktop?: boolean;
    label?: string;
}
