import React, { forwardRef, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import cn from 'classnames';

import '../eui-base.scss';
import { Chip } from './Chip';
import './ChipGroup.scss';
import { ChipGroupContext, type ChipGroupContextValue } from './chip-context';
import type { ChipGroupMultipleProps, ChipGroupProps, ChipValue } from './chip-types';

const namedGaps = new Set(['xs', 'sm', 'md', 'lg']);
const navigationKeys = new Set(['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End']);

const toArray = (value: ChipValue | ChipValue[] | null | undefined): ChipValue[] => {
    if (value === null || value === undefined) return [];
    return Array.isArray(value) ? value : [value];
};

const ChipGroup = forwardRef<HTMLDivElement, ChipGroupProps>((props, ref) => {
    const {
        children,
        options,
        size,
        variant,
        shape,
        color,
        disabled,
        showCheckmark,
        wrap = true,
        gap = 'sm',
        ariaLabel,
        multiple,
        value,
        defaultValue,
        onChange,
        required = false,
        maxSelected,
        className,
        style,
        onKeyDown,
        ...rest
    } = props as ChipGroupMultipleProps & { multiple?: boolean };

    const [internal, setInternal] = useState<ChipValue[]>(() => toArray(defaultValue));
    const isControlled = value !== undefined;
    const selectedValues = useMemo(() => (isControlled ? toArray(value) : internal), [isControlled, value, internal]);
    const isMultiple = Boolean(multiple);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const setRootRef = useCallback(
        (node: HTMLDivElement | null) => {
            rootRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
        },
        [ref],
    );

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-eui-chip-main]'));
        if (isMultiple) {
            buttons.forEach((button) => button.removeAttribute('tabindex'));
            return;
        }
        const enabled = buttons.filter((button) => !button.disabled);
        const tabStop = enabled.find((button) => button.getAttribute('aria-checked') === 'true') ?? enabled[0];
        buttons.forEach((button) => {
            button.tabIndex = button === tabStop ? 0 : -1;
        });
    }, [isMultiple, selectedValues, options, children, disabled]);

    const emit = useCallback(
        (next: ChipValue[]) => {
            if (!isControlled) setInternal(next);
            if (!onChange) return;
            if (isMultiple) onChange(next);
            else (onChange as unknown as (v: ChipValue | null) => void)(next.length ? next[0] : null);
        },
        [isControlled, onChange, isMultiple],
    );

    const toggle = useCallback(
        (chipValue: ChipValue) => {
            const isOn = selectedValues.includes(chipValue);
            if (isMultiple) {
                if (isOn) {
                    if (required && selectedValues.length === 1) return;
                    emit(selectedValues.filter((v) => v !== chipValue));
                } else {
                    if (maxSelected !== undefined && selectedValues.length >= maxSelected) return;
                    emit([...selectedValues, chipValue]);
                }
                return;
            }
            if (isOn) {
                if (required) return;
                emit([]);
            } else {
                emit([chipValue]);
            }
        },
        [selectedValues, isMultiple, required, maxSelected, emit],
    );

    const contextValue = useMemo<ChipGroupContextValue>(
        () => ({
            multiple: isMultiple,
            isSelected: (chipValue) => selectedValues.includes(chipValue),
            isBlocked: () => isMultiple && maxSelected !== undefined && selectedValues.length >= maxSelected,
            toggle,
            size,
            variant,
            shape,
            color,
            disabled,
            showCheckmark,
        }),
        [isMultiple, selectedValues, maxSelected, toggle, size, variant, shape, color, disabled, showCheckmark],
    );

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || !navigationKeys.has(event.key)) return;
        const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-eui-chip-main]:not(:disabled)'));
        const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (currentIndex === -1 || buttons.length === 0) return;
        event.preventDefault();
        let nextIndex: number;
        if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = buttons.length - 1;
        else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % buttons.length;
        else nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        const target = buttons[nextIndex];
        target.focus();
        if (!isMultiple && !required && selectedValues.length === 0) return;
        if (!isMultiple) target.click();
    };

    const gapStyle = typeof gap === 'number' ? { ['--eui-chip-group-gap' as string]: `${gap}px` } : undefined;

    return (
        <ChipGroupContext.Provider value={contextValue}>
            <div
                ref={setRootRef}
                role={isMultiple ? 'group' : 'radiogroup'}
                aria-label={ariaLabel}
                aria-disabled={disabled || undefined}
                aria-required={!isMultiple && required ? true : undefined}
                {...rest}
                onKeyDown={handleKeyDown}
                className={cn(
                    'eui-chip-group',
                    {
                        'eui-chip-group-nowrap': !wrap,
                        [`eui-chip-group-gap-${gap}`]: typeof gap === 'string' && namedGaps.has(gap),
                    },
                    className,
                )}
                style={{ ...gapStyle, ...style }}
            >
                {options?.map((option) => (
                    <Chip
                        key={option.value}
                        value={option.value}
                        label={option.label}
                        icon={option.icon}
                        avatar={option.avatar}
                        disabled={option.disabled}
                        color={option.color}
                    />
                ))}
                {children}
            </div>
        </ChipGroupContext.Provider>
    );
});

ChipGroup.displayName = 'ChipGroup';

export { ChipGroup };
