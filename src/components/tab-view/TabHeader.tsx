import classNames from 'classnames';
import React from 'react';
import type { TabViewVariant } from './TabView';
import { renderIcon } from './tabview-utils';

interface TabHeaderProps {
    id?: string;
    panelId?: string;
    header: React.ReactNode;
    leftIcon?: string | React.ComponentType<Record<string, unknown>> | React.ReactElement;
    rightIcon?: string | React.ComponentType<Record<string, unknown>> | React.ReactElement;
    active?: boolean;
    disabled?: boolean;
    closable?: boolean;
    onClick?: () => void;
    onClose?: (e: React.MouseEvent | React.KeyboardEvent) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    tabIndex?: number;
    position: 'top' | 'bottom' | 'left' | 'right';
    variant?: TabViewVariant;
    className?: string;
    closeAriaLabel?: string;
    tabRef?: (el: HTMLDivElement | null) => void;
}

const stringifyHeader = (header: React.ReactNode): string => {
    if (typeof header === 'string') return header;
    if (typeof header === 'number') return String(header);
    return '';
};

export const TabHeader: React.FC<TabHeaderProps> = ({
    id,
    panelId,
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
    closeAriaLabel,
    tabRef,
}) => {
    const isVertical = position === 'left' || position === 'right';

    const headerClasses = classNames(
        'eui-tab-header',
        `eui-tab-header-${position}`,
        variant !== 'default' && `eui-tab-header-${variant}`,
        {
            'eui-tab-header-active': active,
            'eui-tab-header-disabled': disabled,
        },
        className
    );

    const handleClick = () => {
        if (disabled) return;
        onClick?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
            return;
        }
        if ((e.key === 'Delete' || e.key === 'Backspace') && closable) {
            e.preventDefault();
            onClose?.(e);
            return;
        }
        onKeyDown?.(e);
    };

    const handleCloseClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose?.(e);
    };

    const headerText = stringifyHeader(header);
    const resolvedCloseLabel = closeAriaLabel ?? (headerText ? `Close ${headerText}` : 'Close tab');

    return (
        <div
            ref={tabRef}
            id={id}
            className={headerClasses}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={disabled ? -1 : tabIndex}
            role="tab"
            aria-selected={active}
            aria-disabled={disabled || undefined}
            aria-controls={panelId}
        >
            {renderIcon(leftIcon, 'eui-tab-header-icon')}
            <span className={classNames('eui-tab-header-label', { 'eui-tab-header-label-sm': isVertical })}>{header}</span>
            {renderIcon(rightIcon, 'eui-tab-header-icon')}
            {closable && !disabled && (
                <button
                    type="button"
                    className="eui-tab-header-close"
                    onClick={handleCloseClick}
                    aria-label={resolvedCloseLabel}
                    tabIndex={-1}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            )}
        </div>
    );
};
