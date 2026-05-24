import cn from 'classnames';
import React from 'react';
import '../eui-base.scss';
import './Card.scss';

type CardVariant = 'elevated' | 'outlined' | 'filled' | 'ghost' | 'interactive';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';
type CardOrientation = 'vertical' | 'horizontal';
type CardSize = 'sm' | 'md' | 'lg';
type CardHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface CardProps {
    variant?: CardVariant;
    padding?: CardPadding;
    orientation?: CardOrientation;
    size?: CardSize;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    headingLevel?: CardHeadingLevel;
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

const interactiveTags = new Set(['button', 'a', 'input', 'select', 'textarea', 'details', 'summary']);

const hasInteractiveDescendant = (node: React.ReactNode): boolean => {
    let found = false;
    React.Children.forEach(node, (child) => {
        if (found || !React.isValidElement(child)) return;
        if (typeof child.type === 'string' && interactiveTags.has(child.type)) {
            found = true;
            return;
        }
        const props = child.props as { children?: React.ReactNode } | null | undefined;
        if (props && 'children' in props && hasInteractiveDescendant(props.children)) {
            found = true;
        }
    });
    return found;
};

const Card: React.FC<CardProps> = ({
    variant = 'outlined',
    padding = 'md',
    orientation = 'vertical',
    size = 'md',
    title,
    subtitle,
    headingLevel,
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
    const requestedTag: 'div' | 'a' | 'button' = as ?? (href ? 'a' : variant === 'interactive' && onClick ? 'button' : 'div');

    let Tag: React.ElementType = requestedTag;
    let extraRoleProps: Record<string, unknown> = {};

    if (requestedTag === 'button' || requestedTag === 'a') {
        const innerHasInteractive =
            hasInteractiveDescendant(children) ||
            hasInteractiveDescendant(actions) ||
            hasInteractiveDescendant(footer) ||
            hasInteractiveDescendant(title) ||
            hasInteractiveDescendant(subtitle);

        if (innerHasInteractive) {
            if (typeof console !== 'undefined' && typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
                console.warn(
                    `[FluxoUI Card] as="${requestedTag}" with interactive children produces nested interactive elements (invalid HTML and a screen-reader accessibility issue). Falling back to a non-interactive container with role="group". Move the click target to a single inner element, or remove the nested interactive children.`,
                );
            }
            Tag = 'div';
            extraRoleProps = onClick
                ? {
                      role: 'button',
                      tabIndex: 0,
                      onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              if (!loading) onClick(e as unknown as React.MouseEvent<HTMLElement>);
                          }
                      },
                  }
                : { role: 'group' };
        }
    }

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
        ...extraRoleProps,
    };

    if (Tag === 'a' && href) tagProps.href = href;
    if (Tag === 'button') tagProps.type = 'button';

    const TitleTag: React.ElementType = headingLevel ? (`h${headingLevel}` as React.ElementType) : 'div';

    return (
        <Tag {...tagProps}>
            {cover && <div className="eui-card-cover">{cover}</div>}
            <div className="eui-card-body-wrap">
                {hasHeader && (
                    <div className="eui-card-header">
                        <div className="eui-card-header-text">
                            {title && <TitleTag className="eui-card-title">{title}</TitleTag>}
                            {subtitle && <div className="eui-card-subtitle">{subtitle}</div>}
                        </div>
                        {actions && <div className="eui-card-actions">{actions}</div>}
                    </div>
                )}
                {children !== undefined && (
                    <div className={cn('eui-card-body', { 'eui-card-body-with-header': hasHeader })}>
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
export type { CardProps, CardVariant, CardPadding, CardOrientation, CardSize, CardHeadingLevel };
