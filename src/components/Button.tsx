import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { ButtonVariant } from '../types';
import Link from './Link';
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
    ...rest
}: ButtonProps) {
    const [loading, setLoading] = useState<boolean>(isLoading);
    const [remainingTime, setRemainingTime] = useState<number | null>(waitFor && waitFor > 0 ? waitFor : null);

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

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        if (disabled || loading || remainingTime !== null) return;
        if (onClick) {
            const result = onClick(e);
            if (result && typeof (result as Promise<unknown>).then === 'function') {
                setLoading(true);
                try {
                    await result;
                } finally {
                    setLoading(false);
                }
            }
        }
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
        },
        className,
    );

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
        </>
    );

    if (type === 'submit') {
        return (
            <button
                {...rest}
                id={id}
                type="submit"
                className={buttonClasses}
                onClick={handleClick}
                disabled={combinedDisabled}
                aria-label={ariaLabel || label}
                aria-busy={loading}
                title={title}
            >
                {content}
            </button>
        );
    }

    if (href && !combinedDisabled) {
        return (
            <Link id={id} href={href} className={buttonClasses} onClick={handleClick} newTab={newTab} title={title}>
                {content}
            </Link>
        );
    }

    return (
        <button
            {...rest}
            id={id}
            type="button"
            className={buttonClasses}
            onClick={handleClick}
            disabled={combinedDisabled}
            aria-label={ariaLabel || label}
            aria-busy={loading}
            title={title}
        >
            {content}
        </button>
    );
}

export { Button };
