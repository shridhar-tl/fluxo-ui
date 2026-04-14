import cn from 'classnames';
import React from 'react';
import './Card.scss';

type CardVariant = 'elevated' | 'outlined' | 'filled' | 'ghost' | 'interactive';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';
type CardOrientation = 'vertical' | 'horizontal';
type CardSize = 'sm' | 'md' | 'lg';

interface CardProps {
    variant?: CardVariant;
    padding?: CardPadding;
    orientation?: CardOrientation;
    size?: CardSize;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
    cover?: React.ReactNode;
    footer?: React.ReactNode;
    loading?: boolean;
    as?: 'div' | 'a' | 'button';
    href?: string;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    className?: string;
    children?: React.ReactNode;
    ariaLabel?: string;
}

const Card: React.FC<CardProps> = ({
    variant = 'outlined',
    padding = 'md',
    orientation = 'vertical',
    size = 'md',
    title,
    subtitle,
    actions,
    cover,
    footer,
    loading = false,
    as,
    href,
    onClick,
    className,
    children,
    ariaLabel,
}) => {
    const hasHeader = Boolean(title || subtitle || actions);
    const Tag: React.ElementType = as ?? (href ? 'a' : variant === 'interactive' && onClick ? 'button' : 'div');

    const tagProps: Record<string, unknown> = {
        className: cn(
            'eui-card',
            `eui-card-variant-${variant}`,
            `eui-card-padding-${padding}`,
            `eui-card-orientation-${orientation}`,
            `eui-card-size-${size}`,
            { 'eui-card-loading': loading },
            className,
        ),
        onClick: loading ? undefined : onClick,
        'aria-label': ariaLabel,
        'aria-busy': loading || undefined,
    };

    if (Tag === 'a' && href) tagProps.href = href;
    if (Tag === 'button') tagProps.type = 'button';

    return (
        <Tag {...tagProps}>
            {cover && <div className="eui-card-cover">{cover}</div>}
            <div className="eui-card-body-wrap">
                {hasHeader && (
                    <div className="eui-card-header">
                        <div className="eui-card-header-text">
                            {title && <div className="eui-card-title">{title}</div>}
                            {subtitle && <div className="eui-card-subtitle">{subtitle}</div>}
                        </div>
                        {actions && <div className="eui-card-actions">{actions}</div>}
                    </div>
                )}
                {children !== undefined && (
                    <div className={cn('eui-card-body', { 'mt-2': hasHeader })} style={hasHeader ? { marginTop: '0.625rem' } : undefined}>
                        {children}
                    </div>
                )}
                {footer && <div className="eui-card-footer">{footer}</div>}
            </div>
            {loading && <div className="eui-card-shimmer" aria-hidden="true" />}
        </Tag>
    );
};

export { Card };
export type { CardProps, CardVariant, CardPadding, CardOrientation, CardSize };
