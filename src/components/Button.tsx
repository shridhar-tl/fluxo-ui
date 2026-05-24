import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { ButtonVariant, PlacementCorners } from '../types';
import { showConfirmPopover } from './confirm-popover/ConfirmPopoverManager';
import Link from './Link';
import { Tooltip } from './tooltip/Tooltip';
import './eui-base.scss';
import './Button.scss';

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

type ButtonProps = {
    leftIcon?: IconComponent | React.ReactElement;
    rightIcon?: IconComponent | React.ReactElement;
    label?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    waitFor?: number;
    variant?: ButtonVariant;
    layout?: 'rounded' | 'default' | 'outlined' | 'plain' | 'sharp';
    isLoading?: boolean;
    disabled?: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void | Promise<unknown>;
    ariaLabel?: string;
    children?: React.ReactNode;
    className?: string;
    loadingMessage?: string;
    href?: string;
    newTab?: boolean;
    title?: string;
    id?: string;
    type?: 'submit' | 'link' | 'button';
    fullWidth?: boolean;
    tooltip?: React.ReactNode;
    tooltipPlacement?: PlacementCorners;
    confirmText?: React.ReactNode;
    confirmTitle?: string;
    confirmOkText?: string;
    confirmCancelText?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

const iconSizeClass = (size: string) => ({
    'eui-button-icon-xs-size': size === 'xs',
    'eui-button-icon-sm-size': size === 'sm',
    'eui-button-icon-md-size': size === 'md',
    'eui-button-icon-lg-size': size === 'lg',
    'eui-button-icon-xl-size': size === 'xl',
});

const spinnerSizeClass = (size: string) => ({
    'eui-button-icon-xs-size': size === 'xs',
    'eui-button-icon-sm-size': size === 'sm',
    'eui-button-icon-md-size': size === 'md',
    'eui-button-icon-lg-size': size === 'lg',
    'eui-button-icon-xl-size': size === 'xl',
});

const renderIcon = (icon: IconComponent | React.ReactElement, size: string) => {
    const Icon = icon as React.ElementType;
    return React.isValidElement(icon) ? (
        React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
            className: classNames('flex-shrink-0', iconSizeClass(size), (icon.props as { className?: string }).className),
        })
    ) : (
        <Icon className={classNames(iconSizeClass(size))} />
    );
};

const renderSpinner = (size: string) => (
    <svg
        className={classNames('eui-button-spinner', spinnerSizeClass(size))}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
    >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

function Button({
    label,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    size = 'md',
    waitFor,
    variant = 'default',
    layout = 'default',
    type = 'button',
    isLoading = false,
    disabled = false,
    onClick,
    ariaLabel,
    children,
    className,
    loadingMessage = 'Loading...',
    href,
    newTab,
    title,
    id,
    fullWidth,
    tooltip,
    tooltipPlacement = 'auto',
    confirmText,
    confirmTitle,
    confirmOkText,
    confirmCancelText,
    ...rest
}: ButtonProps) {
    const [loading, setLoading] = useState<boolean>(isLoading);
    const [remainingTime, setRemainingTime] = useState<number | null>(waitFor && waitFor > 0 ? waitFor : null);
    const triggerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (waitFor && waitFor > 0) {
            setRemainingTime(waitFor);
            const interval = setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev !== null) {
                        const newTime = prev - 1;
                        if (newTime <= 0) {
                            clearInterval(interval);
                            return null;
                        }
                        return newTime;
                    }
                    return prev;
                });
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setRemainingTime(null);
        }
    }, [waitFor]);

    useEffect(() => {
        setLoading(isLoading);
    }, [isLoading]);

    const runOnClick = async (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        if (!onClick) return;
        const result = onClick(e);
        if (result && typeof (result as Promise<unknown>).then === 'function') {
            setLoading(true);
            try {
                await result;
            } finally {
                setLoading(false);
            }
        }
    };

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        if (disabled || loading || remainingTime !== null) return;
        if (confirmText) {
            e.preventDefault();
            e.stopPropagation();
            const target = e.currentTarget as HTMLElement;
            triggerRef.current = target;
            const confirmEvent = e;
            showConfirmPopover({
                target,
                message: confirmText,
                title: confirmTitle ?? 'Confirm',
                placement: 'auto',
                actions: [
                    {
                        label: confirmCancelText ?? 'Cancel',
                        variant: 'default',
                        layout: 'outlined',
                        onClick: () => {},
                    },
                    {
                        label: confirmOkText ?? 'Confirm',
                        variant: variant === 'danger' ? 'danger' : 'primary',
                        layout: 'default',
                        onClick: () => {
                            void runOnClick(confirmEvent);
                        },
                    },
                ],
            });
            return;
        }
        await runOnClick(e);
    };

    const combinedDisabled = disabled || loading || remainingTime !== null;
    const isIconOnly = Boolean(!label && !children && (LeftIcon || RightIcon));
    const isSolid = layout !== 'plain' && layout !== 'outlined';

    const buttonClasses = classNames(
        'eui-button',
        `eui-button-${layout}`,
        `eui-button-variant-${variant}`,
        isIconOnly ? `eui-button-icon-${size}` : `eui-button-${size}`,
        {
            'eui-button-disabled': combinedDisabled,
            'eui-button-shadow': isSolid && layout !== 'sharp',
            'eui-button-link-type': type === 'link',
            'eui-button-full-width': fullWidth,
        },
        className,
    );

    const accessibleName = ariaLabel || label || (typeof tooltip === 'string' ? tooltip : undefined);

    const content = (
        <>
            {loading && renderSpinner(size)}
            {!loading && LeftIcon && renderIcon(LeftIcon, size)}
            {children}
            {(label || remainingTime !== null) && (
                <span className="eui-button-label">
                    {label}
                    {remainingTime !== null && ` (${remainingTime}s)`}
                </span>
            )}
            {!loading && RightIcon && renderIcon(RightIcon, size)}
            {loading && loadingMessage && !isIconOnly && <span className="eui-button-label">{loadingMessage}</span>}
            {loading && loadingMessage && (
                <span className="eui-visually-hidden" aria-live="polite" role="status">
                    {loadingMessage}
                </span>
            )}
        </>
    );

    let element: React.ReactElement;

    if (type === 'submit') {
        element = (
            <button
                {...rest}
                id={id}
                type="submit"
                className={buttonClasses}
                onClick={handleClick}
                disabled={combinedDisabled}
                aria-label={accessibleName}
                aria-busy={loading}
                title={title}
            >
                {content}
            </button>
        );
    } else if (href && !combinedDisabled) {
        const { name, ...linkRest } = rest as React.ButtonHTMLAttributes<HTMLButtonElement> & { name?: string };
        const ariaProps: Record<string, unknown> = {};
        Object.keys(linkRest).forEach((key) => {
            if (key.startsWith('aria-') || key === 'role' || key === 'tabIndex') {
                (ariaProps as Record<string, unknown>)[key] = (linkRest as Record<string, unknown>)[key];
            }
        });
        element = (
            <Link
                id={id}
                href={href}
                className={buttonClasses}
                onClick={handleClick}
                newTab={newTab}
                title={title}
                aria-label={accessibleName}
                aria-busy={loading || undefined}
                {...(name ? { name } : {})}
                {...ariaProps}
            >
                {content}
            </Link>
        );
    } else {
        element = (
            <button
                {...rest}
                id={id}
                type="button"
                className={buttonClasses}
                onClick={handleClick}
                disabled={combinedDisabled}
                aria-label={accessibleName}
                aria-busy={loading}
                title={title}
            >
                {content}
            </button>
        );
    }

    if (tooltip) {
        return (
            <Tooltip content={tooltip} placement={tooltipPlacement}>
                {element}
            </Tooltip>
        );
    }

    return element;
}

export { Button };
