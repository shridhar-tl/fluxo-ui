import { createContext, useContext } from 'react';

import type { AppShellContextValue } from './app-shell-types';

const noop = () => undefined;

const fallbackContext: AppShellContextValue = {
    collapsed: false,
    isMobile: false,
    mobileOpen: false,
    closeMobile: noop,
    setCollapsed: noop,
    toggleCollapsed: noop,
    setMobileOpen: noop,
    toggleSidebar: noop,
    sidebarId: '',
    mainId: '',
    collapsible: false,
    collapseLabel: 'Collapse sidebar',
    expandLabel: 'Expand sidebar',
    openNavigationLabel: 'Open navigation',
    closeNavigationLabel: 'Close navigation',
};

export const AppShellContext = createContext<AppShellContextValue | null>(null);

export const useAppShell = (): AppShellContextValue => useContext(AppShellContext) ?? fallbackContext;
