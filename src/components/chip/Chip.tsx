import React, { forwardRef, useContext, useState } from 'react';

import cn from 'classnames';

import { CheckIcon, TimesIcon } from '../../assets/icons';
import { getCustomToneStyle, resolveToneClass } from '../../utils/color-tone';
import { preserveFocusOnRemoval } from '../../utils/focus-after-removal';
import { renderIcon } from '../../utils/render-icon';
import '../eui-base.scss';
import './Chip.scss';
import { ChipGroupContext } from './chip-context';
import type { ChipProps } from './chip-types';

const textOf = (node: React.ReactNode): string | undefined =>
    typeof node === 'string' || typeof node === 'number' ? String(node) : undefined;

const Chip = forwardRef<HTMLSpanElement, ChipProps>(
    (
        {
            children,
            label,
            value,
            color,
            textColor,
            variant,
            size,
            shape,
            icon,
            trailingIcon,
            avatar,
            selectable,
            selected,
            defaultSelected = false,
            onSelectedChange,
            showCheckmark,
            onClick,
            href,
            target,
            removable = false,
            onRemove,
            removeIcon,
            removeLabel,
            disabled,
            maxWidth,
            className,
            style,
            title,
            ...rest
        },
        ref,
    ) => {
        const group = useContext(ChipGroupContext);
        const [internalSelected, setInternalSelected] = useState(defaultSelected);
        const inGroup = group !== null && value !== undefined;
        const resolvedDisabled = disabled ?? group?.disabled ?? false;
        const isSelectable = inGroup || Boolean(selectable);
        const isSelected = inGroup ? group.isSelected(value) : (selected ?? internalSelected);
        const blocked = inGroup && !isSelected && group.isBlocked(value);
        const resolvedVariant = variant ?? group?.variant ?? 'outlined';
        const resolvedSize = size ?? group?.size ?? 'md';
        const resolvedShape = shape ?? group?.shape ?? 'pill';
        const resolvedColor = color ?? group?.color ?? 'primary';
        const checkmark = isSelectable && (showCheckmark ?? group?.showCheckmark ?? true);
        const content = label ?? children;
        const contentText = textOf(content);
        const truncate = maxWidth !== undefined;
        const mainDisabled = resolvedDisabled || blocked;

        const handleMainClick = (event: React.MouseEvent<HTMLElement>) => {
            if (mainDisabled) return;
            onClick?.(event);
            if (event.defaultPrevented || !isSelectable) return;
            if (inGroup) {
                group.toggle(value);
            } else {
                const next = !isSelected;
                if (selected === undefined) setInternalSelected(next);
                onSelectedChange?.(next, event);
            }
        };

        const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            if (resolvedDisabled) return;
            preserveFocusOnRemoval(event.currentTarget.closest<HTMLElement>('.eui-chip'), '.eui-chip-group');
            onRemove?.(event);
        };

        const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
            rest.onKeyDown?.(event);
            if (event.defaultPrevented || !removable || resolvedDisabled) return;
            if (event.key !== 'Backspace' && event.key !== 'Delete') return;
            const target = event.target as HTMLElement;
            if (!target.classList.contains('eui-chip-main') && !target.classList.contains('eui-chip-remove')) return;
            event.preventDefault();
            preserveFocusOnRemoval(event.currentTarget, '.eui-chip-group');
            onRemove?.(event);
        };

        let role: 'radio' | 'checkbox' | undefined;
        if (inGroup) role = group.multiple ? 'checkbox' : 'radio';

        const inner = (
            <>
                {checkmark && (
                    <span className={cn('eui-chip-check', { 'eui-chip-check-visible': isSelected })} aria-hidden="true">
                        <CheckIcon />
                    </span>
                )}
                {avatar && (
                    <span className="eui-chip-avatar" aria-hidden="true">
                        {typeof avatar === 'string' ? <img src={avatar} alt="" /> : avatar}
                    </span>
                )}
                {!(checkmark && isSelected && !avatar) && renderIcon(icon, 'eui-chip-icon')}
                {content !== undefined && content !== null && <span className="eui-chip-label">{content}</span>}
                {renderIcon(trailingIcon, 'eui-chip-icon eui-chip-trailing')}
            </>
        );

        const interactive = isSelectable || onClick !== undefined || href !== undefined;
        let main: React.ReactNode;
        if (href !== undefined && !isSelectable && !mainDisabled) {
            main = (
                <a className="eui-chip-main" href={href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} onClick={onClick}>
                    {inner}
                </a>
            );
        } else if (interactive) {
            main = (
                <button
                    type="button"
                    className="eui-chip-main"
                    role={role}
                    aria-checked={role ? isSelected : undefined}
                    aria-pressed={!role && isSelectable ? isSelected : undefined}
                    disabled={mainDisabled}
                    data-eui-chip-main=""
                    onClick={handleMainClick}
                >
                    {inner}
                </button>
            );
        } else {
            main = <span className="eui-chip-main eui-chip-static">{inner}</span>;
        }

        return (
            <span
                ref={ref}
                {...rest}
                onKeyDown={handleKeyDown}
                title={title ?? (truncate ? contentText : undefined)}
                className={cn(
                    'eui-chip',
                    `eui-chip-${resolvedVariant}`,
                    `eui-chip-${resolvedSize}`,
                    `eui-chip-shape-${resolvedShape}`,
                    resolveToneClass('eui-chip', resolvedColor),
                    {
                        'eui-chip-selected': isSelected,
                        'eui-chip-selectable': isSelectable,
                        'eui-chip-interactive': interactive && !mainDisabled,
                        'eui-chip-disabled': resolvedDisabled,
                        'eui-chip-blocked': blocked,
                        'eui-chip-removable': removable,
                        'eui-chip-has-avatar': Boolean(avatar),
                        'eui-chip-truncate': truncate,
                    },
                    className,
                )}
                style={{
                    ...getCustomToneStyle(resolvedColor, textColor),
                    ...(truncate ? { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth } : null),
                    ...style,
                }}
            >
                {main}
                {removable && (
                    <button
                        type="button"
                        className="eui-chip-remove"
                        onClick={handleRemove}
                        disabled={resolvedDisabled}
                        aria-label={removeLabel ?? (contentText ? `Remove ${contentText}` : 'Remove')}
                    >
                        {removeIcon ?? <TimesIcon aria-hidden="true" />}
                    </button>
                )}
            </span>
        );
    },
);

Chip.displayName = 'Chip';

export { Chip };
