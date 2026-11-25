import React, { forwardRef } from 'react';

import cn from 'classnames';

import { MenuIcon } from '../../assets/icons';
import '../eui-base.scss';
import { useAppShell } from './app-shell-context';
import type { AppShellToggleProps } from './app-shell-types';
import './AppShellToggle.scss';

const AppShellToggle = forwardRef<HTMLButtonElement, AppShellToggleProps>(
    ({ children, mode = 'auto', hideOnDesktop = false, label, className, onClick, ...rest }, ref) => {
        const shell = useAppShell();
        const targetsDrawer = mode === 'mobile' || (mode === 'auto' && shell.isMobile);
        const expanded = targetsDrawer ? shell.mobileOpen : !shell.collapsed;
        const defaultLabel = targetsDrawer
            ? shell.mobileOpen
                ? shell.closeNavigationLabel
                : shell.openNavigationLabel
            : shell.collapsed
              ? shell.expandLabel
              : shell.collapseLabel;

        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            if (mode === 'mobile') shell.setMobileOpen(!shell.mobileOpen);
            else if (mode === 'collapse') shell.toggleCollapsed();
            else shell.toggleSidebar();
        };

        return (
            <button
                ref={ref}
                type="button"
                {...rest}
                className={cn('eui-app-shell-toggle', { 'eui-app-shell-toggle-mobile-only': hideOnDesktop && !shell.isMobile }, className)}
                aria-label={label ?? defaultLabel}
                aria-expanded={expanded}
                aria-controls={shell.sidebarId || undefined}
                onClick={handleClick}
            >
                {children ?? <MenuIcon aria-hidden="true" />}
            </button>
        );
    },
);

AppShellToggle.displayName = 'AppShellToggle';

export { AppShellToggle };
