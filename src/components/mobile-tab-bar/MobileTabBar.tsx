import cn from 'classnames';
import React from 'react';
import '../eui-base.scss';
import './MobileTabBar.scss';

type MobileTabBarVariant = 'flat' | 'elevated' | 'pill' | 'floating';
type MobileTabBarPosition = 'fixed' | 'sticky' | 'static';
type MobileTabBarShowLabel = 'always' | 'never' | 'active';

interface MobileTabBarItem {
    key: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
    activeIcon?: React.ReactNode;
    badge?: React.ReactNode;
    disabled?: boolean;
    ariaLabel?: string;
}

interface MobileTabBarProps {
    items: MobileTabBarItem[];
    activeKey: string;
    onChange: (key: string) => void;
    variant?: MobileTabBarVariant;
    position?: MobileTabBarPosition;
    showLabels?: MobileTabBarShowLabel;
    safeArea?: boolean;
    className?: string;
    ariaLabel?: string;
}

const MobileTabBar: React.FC<MobileTabBarProps> = ({
    items,
    activeKey,
    onChange,
    variant = 'flat',
    position = 'static',
    showLabels = 'always',
    safeArea = true,
    className,
    ariaLabel = 'Primary',
}) => {
    const navRef = React.useRef<HTMLElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
        const enabled = items
            .map((it, i) => (it.disabled ? -1 : i))
            .filter((i) => i >= 0);
        if (enabled.length === 0) return;
        const pos = enabled.indexOf(idx);
        let nextPos = pos;
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextPos = (pos + 1) % enabled.length;
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            nextPos = (pos - 1 + enabled.length) % enabled.length;
        } else if (e.key === 'Home') {
            e.preventDefault();
            nextPos = 0;
        } else if (e.key === 'End') {
            e.preventDefault();
            nextPos = enabled.length - 1;
        } else {
            return;
        }
        const nextIdx = enabled[nextPos];
        onChange(items[nextIdx].key);
        const buttons = navRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
        buttons?.[nextIdx]?.focus();
    };

    return (
        <nav
            ref={navRef}
            className={cn(
                'eui-mobile-tab-bar',
                `eui-mobile-tab-bar-variant-${variant}`,
                `eui-mobile-tab-bar-position-${position}`,
                `eui-mobile-tab-bar-labels-${showLabels}`,
                {
                    'eui-mobile-tab-bar-safe-area': safeArea,
                },
                className,
            )}
            role="tablist"
            aria-label={ariaLabel}
        >
            <div className="eui-mobile-tab-bar-inner">
                {items.map((item, idx) => {
                    const isActive = item.key === activeKey;
                    const icon = isActive && item.activeIcon ? item.activeIcon : item.icon;
                    return (
                        <button
                            key={item.key}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-disabled={item.disabled || undefined}
                            aria-label={item.ariaLabel ?? (typeof item.label === 'string' ? item.label : undefined)}
                            disabled={item.disabled}
                            tabIndex={isActive ? 0 : -1}
                            className={cn('eui-mobile-tab-bar-item', {
                                'eui-mobile-tab-bar-item-active': isActive,
                                'eui-mobile-tab-bar-item-disabled': item.disabled,
                            })}
                            onClick={() => !item.disabled && onChange(item.key)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                        >
                            <span className="eui-mobile-tab-bar-item-icon" aria-hidden="true">
                                {icon}
                                {item.badge !== undefined && (
                                    <span className="eui-mobile-tab-bar-item-badge">{item.badge}</span>
                                )}
                            </span>
                            <span className="eui-mobile-tab-bar-item-label">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export { MobileTabBar };
export type {
    MobileTabBarProps,
    MobileTabBarItem,
    MobileTabBarVariant,
    MobileTabBarPosition,
    MobileTabBarShowLabel,
};
