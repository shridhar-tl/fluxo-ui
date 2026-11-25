import React, { forwardRef } from 'react';

import cn from 'classnames';

import { getCustomToneStyle, resolveToneClass, type ToneColor } from '../../utils/color-tone';
import { renderIcon, type IconProp } from '../../utils/render-icon';
import '../eui-base.scss';
import './Badge.scss';

type BadgeVariant = 'solid' | 'soft' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';
type BadgePlacement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
type BadgeOverlap = 'rectangular' | 'circular';
type BadgeShape = 'pill' | 'rounded' | 'square';
type BadgeStatus = 'default' | 'success' | 'processing' | 'warning' | 'error';
type BadgeColor = ToneColor | (string & {});

interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color' | 'content'> {
    children?: React.ReactNode;
    content?: React.ReactNode;
    count?: number;
    max?: number;
    showZero?: boolean;
    dot?: boolean;
    color?: BadgeColor;
    textColor?: string;
    variant?: BadgeVariant;
    size?: BadgeSize;
    shape?: BadgeShape;
    placement?: BadgePlacement;
    offset?: [number, number];
    overlap?: BadgeOverlap;
    invisible?: boolean;
    pulse?: boolean;
    bordered?: boolean;
    icon?: IconProp;
    status?: BadgeStatus;
    text?: React.ReactNode;
    animateChanges?: boolean;
    ariaLabel?: string;
    badgeClassName?: string;
}

const statusTone: Record<BadgeStatus, ToneColor> = {
    default: 'default',
    success: 'success',
    processing: 'primary',
    warning: 'warning',
    error: 'danger',
};

const formatCount = (count: number, max: number) => (count > max ? `${max}+` : String(count));

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    (
        {
            children,
            content,
            count,
            max = 99,
            showZero = false,
            dot = false,
            color,
            textColor,
            variant = 'solid',
            size = 'md',
            shape = 'pill',
            placement = 'top-right',
            offset,
            overlap = 'rectangular',
            invisible = false,
            pulse = false,
            bordered,
            icon,
            status,
            text,
            animateChanges = false,
            ariaLabel,
            badgeClassName,
            className,
            style,
            ...rest
        },
        ref,
    ) => {
        if (status !== undefined && children === undefined) {
            const tone = color ?? statusTone[status];
            return (
                <span ref={ref} {...rest} className={cn('eui-badge-status', className)} style={style}>
                    <span
                        className={cn('eui-badge-status-dot', resolveToneClass('eui-badge-status-dot', tone), {
                            'eui-badge-status-processing': status === 'processing' || pulse,
                        })}
                        style={getCustomToneStyle(tone, textColor)}
                        aria-hidden="true"
                    />
                    {text !== undefined && <span className="eui-badge-status-text">{text}</span>}
                    {ariaLabel && <span className="eui-visually-hidden">{ariaLabel}</span>}
                </span>
            );
        }

        const iconNode = renderIcon(icon, 'eui-badge-icon');
        let displayContent: React.ReactNode = null;
        if (!dot) {
            if (content !== undefined && content !== null) displayContent = content;
            else if (count !== undefined) displayContent = count === 0 && !showZero ? null : formatCount(count, max);
        }
        const isEmpty = !dot && displayContent === null && iconNode === null;
        const hidden = invisible || isEmpty;
        const anchored = children !== undefined;
        const resolvedBordered = bordered ?? anchored;

        const offsetStyle: Record<string, string> | undefined = offset
            ? { '--eui-badge-offset-x': `${offset[0]}px`, '--eui-badge-offset-y': `${offset[1]}px` }
            : undefined;

        const badge = (
            <span
                key={animateChanges ? String(displayContent) : undefined}
                className={cn(
                    'eui-badge',
                    `eui-badge-${variant}`,
                    `eui-badge-${size}`,
                    `eui-badge-shape-${shape}`,
                    resolveToneClass('eui-badge', color ?? 'danger'),
                    {
                        'eui-badge-dot': dot,
                        'eui-badge-anchored': anchored,
                        [`eui-badge-${placement}`]: anchored,
                        [`eui-badge-overlap-${overlap}`]: anchored,
                        'eui-badge-hidden': hidden,
                        'eui-badge-pulse': pulse,
                        'eui-badge-bordered': resolvedBordered,
                        'eui-badge-animate': animateChanges,
                        'eui-badge-icon-only': iconNode !== null && displayContent === null,
                    },
                    anchored ? badgeClassName : cn(badgeClassName, className),
                )}
                style={{ ...getCustomToneStyle(color, textColor), ...offsetStyle, ...(anchored ? null : style) }}
                aria-hidden={ariaLabel || hidden ? true : undefined}
                {...(anchored ? null : rest)}
                ref={anchored ? undefined : ref}
            >
                {iconNode}
                {displayContent}
            </span>
        );

        const announcement = ariaLabel ? (
            <span className="eui-visually-hidden" aria-live={count !== undefined ? 'polite' : undefined} aria-atomic={count !== undefined || undefined}>
                {hidden ? '' : ariaLabel}
            </span>
        ) : null;

        if (!anchored) {
            return (
                <>
                    {badge}
                    {announcement}
                </>
            );
        }

        return (
            <span ref={ref} {...rest} className={cn('eui-badge-wrapper', className)} style={style}>
                {children}
                {badge}
                {announcement}
            </span>
        );
    },
);

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeColor, BadgeOverlap, BadgePlacement, BadgeProps, BadgeShape, BadgeSize, BadgeStatus, BadgeVariant };
