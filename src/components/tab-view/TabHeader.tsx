import classNames from 'classnames';
import React from 'react';
import type { TabViewVariant } from './TabView';
import { renderIcon } from './tabview-utils';

interface TabHeaderProps {
    header: React.ReactNode;
    leftIcon?: string | React.ComponentType<any> | React.ReactElement;
    rightIcon?: string | React.ComponentType<any> | React.ReactElement;
    active?: boolean;
    disabled?: boolean;
    closable?: boolean;
    onClick?: () => void;
    onClose?: (e: React.MouseEvent) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    tabIndex?: number;
    position: 'top' | 'bottom' | 'left' | 'right';
    variant?: TabViewVariant;
    className?: string;
}

export const TabHeader: React.FC<TabHeaderProps> = ({
    header,
    leftIcon,
    rightIcon,
    active = false,
    disabled = false,
    closable = false,
    onClick,
    onClose,
    onKeyDown,
    tabIndex,
    position,
    variant = 'default',
    className,
}) => {
    const isVertical = position === 'left' || position === 'right';

    const headerClasses = classNames(
        'eui-tab-header',
        `eui-tab-header-${position}`,
        variant !== 'default' && `eui-tab-header-${variant}`,
        {
            'eui-tab-header-active': active,
        },
        className
    );

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose?.(e);
    };

    return (
        <button
            className={headerClasses}
            onClick={!disabled ? onClick : undefined}
            onKeyDown={!disabled ? onKeyDown : undefined}
            tabIndex={disabled ? -1 : tabIndex}
            disabled={disabled}
            role="tab"
            aria-selected={active}
        >
            {renderIcon(leftIcon, 'eui-tab-header-icon')}
            <span className={classNames('eui-tab-header-label', { 'eui-tab-header-label-sm': isVertical })}>{header}</span>
            {renderIcon(rightIcon, 'eui-tab-header-icon')}
            {closable && !disabled && (
                <span
                    className="eui-tab-header-close"
                    onClick={handleClose}
                    role="button"
                    aria-label="Close tab"
                    tabIndex={-1}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </span>
            )}
        </button>
    );
};
