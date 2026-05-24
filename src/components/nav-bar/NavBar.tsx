import cn from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon } from '../../assets/icons';
import '../eui-base.scss';
import './NavBar.scss';

type NavBarVariant = 'standard' | 'centered' | 'large' | 'transparent' | 'compact';
type NavBarPosition = 'top' | 'sticky' | 'fixed' | 'static';

interface NavBarProps {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    leading?: React.ReactNode;
    actions?: React.ReactNode;
    onBack?: () => void;
    backLabel?: string;
    showBack?: boolean;
    variant?: NavBarVariant;
    position?: NavBarPosition;
    bordered?: boolean;
    elevated?: boolean;
    safeArea?: boolean;
    collapseOnScroll?: boolean;
    scrollContainer?: HTMLElement | null;
    children?: React.ReactNode;
    className?: string;
    ariaLabel?: string;
}

const NavBar: React.FC<NavBarProps> = ({
    title,
    subtitle,
    leading,
    actions,
    onBack,
    backLabel = 'Back',
    showBack,
    variant = 'standard',
    position = 'static',
    bordered = true,
    elevated = false,
    safeArea = false,
    collapseOnScroll = false,
    scrollContainer,
    children,
    className,
    ariaLabel,
}) => {
    const [collapsed, setCollapsed] = useState(false);
    const lastScrollRef = useRef(0);
    const showBackButton = showBack ?? Boolean(onBack);
    const isLarge = variant === 'large';

    useEffect(() => {
        if (!collapseOnScroll || !isLarge) return;
        const target = scrollContainer ?? window;
        const getScrollTop = () => {
            if (target === window) return window.scrollY;
            return (target as HTMLElement).scrollTop;
        };
        const handleScroll = () => {
            const current = getScrollTop();
            const threshold = 24;
            if (current > threshold && !collapsed) setCollapsed(true);
            else if (current <= threshold && collapsed) setCollapsed(false);
            lastScrollRef.current = current;
        };
        target.addEventListener('scroll', handleScroll, { passive: true });
        return () => target.removeEventListener('scroll', handleScroll);
    }, [collapseOnScroll, isLarge, scrollContainer, collapsed]);

    const titleNode = title ? (
        <div className="eui-nav-bar-title-block">
            <div className="eui-nav-bar-title">{title}</div>
            {subtitle && <div className="eui-nav-bar-subtitle">{subtitle}</div>}
        </div>
    ) : null;

    return (
        <header
            className={cn(
                'eui-nav-bar',
                `eui-nav-bar-variant-${variant}`,
                `eui-nav-bar-position-${position}`,
                {
                    'eui-nav-bar-bordered': bordered,
                    'eui-nav-bar-elevated': elevated,
                    'eui-nav-bar-safe-area': safeArea,
                    'eui-nav-bar-collapsed': collapsed,
                },
                className,
            )}
            role="banner"
            aria-label={ariaLabel}
        >
            <div className="eui-nav-bar-row">
                <div className="eui-nav-bar-leading">
                    {showBackButton && (
                        <button
                            type="button"
                            className="eui-nav-bar-back"
                            onClick={onBack}
                            aria-label={backLabel}
                        >
                            <ChevronLeftIcon aria-hidden="true" />
                            <span className="eui-nav-bar-back-label">{backLabel}</span>
                        </button>
                    )}
                    {leading}
                </div>

                {variant !== 'large' && titleNode}

                <div className="eui-nav-bar-actions">{actions}</div>
            </div>

            {isLarge && (
                <div className={cn('eui-nav-bar-large-title', { 'eui-nav-bar-large-title-collapsed': collapsed })}>
                    {titleNode}
                </div>
            )}

            {children && <div className="eui-nav-bar-extra">{children}</div>}
        </header>
    );
};

export { NavBar };
export type { NavBarProps, NavBarVariant, NavBarPosition };
