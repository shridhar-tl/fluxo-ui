import React, { forwardRef, useContext, useState } from 'react';

import cn from 'classnames';

import { TimesIcon } from '../../assets/icons';
import { getCustomToneStyle, resolveToneClass } from '../../utils/color-tone';
import { preserveFocusOnRemoval } from '../../utils/focus-after-removal';
import { renderIcon } from '../../utils/render-icon';
import '../eui-base.scss';
import './Tag.scss';
import { TagGroupContext } from './tag-context';
import type { TagGradient, TagProps } from './tag-types';

const buildGradient = (gradient?: TagGradient): string | undefined =>
    gradient ? `linear-gradient(${gradient.deg ?? 135}deg, ${gradient.from}, ${gradient.to})` : undefined;

const toCssSize = (value?: number | string): string | undefined =>
    value === undefined ? undefined : typeof value === 'number' ? `${value}px` : value;

const textOf = (node: React.ReactNode): string | undefined =>
    typeof node === 'string' || typeof node === 'number' ? String(node) : undefined;

const Tag = forwardRef<HTMLSpanElement, TagProps>(
    (
        {
            children,
            label,
            color,
            textColor,
            variant,
            size,
            shape,
            icon,
            iconPosition = 'start',
            avatar,
            count,
            closable = false,
            closeIcon,
            closeLabel,
            onClose,
            visible,
            href,
            target,
            rel,
            onClick,
            disabled = false,
            selected,
            uppercase = false,
            bordered = false,
            elevated = false,
            maxWidth,
            gradient,
            className,
            style,
            title,
            ...rest
        },
        ref,
    ) => {
        const group = useContext(TagGroupContext);
        const [internalVisible, setInternalVisible] = useState(true);
        const resolvedColor = color ?? group?.color;
        const resolvedVariant = variant ?? group?.variant ?? 'soft';
        const resolvedSize = size ?? group?.size ?? 'md';
        const resolvedShape = shape ?? group?.shape ?? 'rounded';
        const isVisible = visible ?? internalVisible;

        if (!isVisible) return null;

        const content = label ?? children;
        const contentText = textOf(content);
        const truncate = maxWidth !== undefined;
        const interactive = !disabled && (href !== undefined || onClick !== undefined);

        const requestClose = (
            event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLElement>,
            tagElement: HTMLElement | null,
        ) => {
            preserveFocusOnRemoval(tagElement, '.eui-tag-group');
            onClose?.(event);
            if (!event.defaultPrevented && visible === undefined) setInternalVisible(false);
        };

        const handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            if (disabled) return;
            requestClose(event, event.currentTarget.closest<HTMLElement>('.eui-tag'));
        };

        const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
            rest.onKeyDown?.(event);
            if (!closable || disabled || event.defaultPrevented) return;
            if (event.key !== 'Backspace' && event.key !== 'Delete') return;
            const target = event.target as HTMLElement;
            if (!target.classList.contains('eui-tag-action') && !target.classList.contains('eui-tag-close')) return;
            requestClose(event, event.currentTarget);
            event.preventDefault();
        };

        const toneStyle = getCustomToneStyle(resolvedColor, textColor);
        const gradientBg = resolvedVariant === 'gradient' ? buildGradient(gradient) : undefined;
        const mergedStyle: React.CSSProperties = {
            ...toneStyle,
            ...(gradientBg ? { backgroundImage: gradientBg } : null),
            ...(truncate ? { maxWidth: toCssSize(maxWidth) } : null),
            ...style,
        };

        const iconNode = renderIcon(icon, 'eui-tag-icon');
        const inner = (
            <>
                {resolvedVariant === 'dot' && <span className="eui-tag-dot-mark" aria-hidden="true" />}
                {avatar && (
                    <span className="eui-tag-avatar" aria-hidden="true">
                        {typeof avatar === 'string' ? <img src={avatar} alt="" /> : avatar}
                    </span>
                )}
                {iconPosition === 'start' && iconNode}
                {content !== undefined && content !== null && <span className="eui-tag-text">{content}</span>}
                {iconPosition === 'end' && iconNode}
                {count !== undefined && count !== null && <span className="eui-tag-count">{count}</span>}
            </>
        );

        let body: React.ReactNode;
        if (href !== undefined && !disabled) {
            body = (
                <a
                    className="eui-tag-action"
                    href={href}
                    target={target}
                    rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
                    onClick={onClick}
                    aria-current={selected ? 'true' : undefined}
                >
                    {inner}
                </a>
            );
        } else if (onClick !== undefined) {
            body = (
                <button
                    type="button"
                    className="eui-tag-action"
                    onClick={onClick}
                    disabled={disabled}
                    aria-pressed={selected === undefined ? undefined : selected}
                >
                    {inner}
                </button>
            );
        } else {
            body = (
                <span className="eui-tag-content" aria-current={selected ? 'true' : undefined}>
                    {inner}
                </span>
            );
        }

        return (
            <span
                ref={ref}
                {...rest}
                onKeyDown={handleKeyDown}
                title={title ?? (truncate ? contentText : undefined)}
                aria-disabled={disabled || undefined}
                className={cn(
                    'eui-tag',
                    `eui-tag-${resolvedVariant}`,
                    `eui-tag-${resolvedSize}`,
                    `eui-tag-shape-${resolvedShape}`,
                    resolveToneClass('eui-tag', resolvedColor),
                    {
                        'eui-tag-interactive': interactive,
                        'eui-tag-closable': closable,
                        'eui-tag-disabled': disabled,
                        'eui-tag-selected': selected,
                        'eui-tag-uppercase': uppercase,
                        'eui-tag-bordered': bordered,
                        'eui-tag-elevated': elevated,
                        'eui-tag-truncate': truncate,
                        'eui-tag-has-avatar': Boolean(avatar),
                    },
                    className,
                )}
                style={mergedStyle}
            >
                {body}
                {closable && (
                    <button
                        type="button"
                        className="eui-tag-close"
                        onClick={handleClose}
                        disabled={disabled}
                        aria-label={closeLabel ?? (contentText ? `Remove ${contentText}` : 'Remove')}
                    >
                        {closeIcon ?? <TimesIcon aria-hidden="true" />}
                    </button>
                )}
            </span>
        );
    },
);

Tag.displayName = 'Tag';

export { Tag };
