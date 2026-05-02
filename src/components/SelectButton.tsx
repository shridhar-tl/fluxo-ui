import classNames from 'classnames';
import React, { forwardRef, useCallback, useRef, useState } from 'react';
import { BaseComponentProps, ComponentEvent, ListItem } from '../types';
import { getComponentClasses, getResolvedSize } from '../utils';
import './SelectButton.scss';

interface SelectButtonBaseProps extends BaseComponentProps {
    items: ListItem[];
    required?: boolean;
    direction?: 'horizontal' | 'vertical';
    ariaLabel?: string;
    ariaLabelledBy?: string;
}

interface SelectButtonSingleProps extends SelectButtonBaseProps {
    multiple?: false;
    value?: string;
    onChange?: (event: ComponentEvent<string>) => void;
}

interface SelectButtonMultiProps extends SelectButtonBaseProps {
    multiple: true;
    value?: string[];
    onChange?: (event: ComponentEvent<string[]>) => void;
}

type SelectButtonProps = SelectButtonSingleProps | SelectButtonMultiProps;

export const SelectButton = forwardRef<HTMLDivElement, SelectButtonProps>(
    (
        {
            items,
            value,
            onChange,
            multiple = false,
            required = false,
            direction = 'horizontal',
            disabled = false,
            className,
            name,
            args,
            ariaLabel,
            ariaLabelledBy,
            ...baseProps
        },
        ref,
    ) => {
        const [internalValue, setInternalValue] = useState<string | string[] | undefined>(
            multiple ? [] : undefined
        );
        const groupRef = useRef<HTMLDivElement | null>(null);
        const isControlled = value !== undefined;
        const currentValue = isControlled ? value : internalValue;

        const setRef = useCallback((node: HTMLDivElement | null) => {
            groupRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }, [ref]);

        const isSelected = (item: ListItem) => {
            if (multiple && Array.isArray(currentValue)) {
                return currentValue.includes(item.value);
            }
            return currentValue === item.value;
        };

        const handleSelect = (item: ListItem, e?: React.SyntheticEvent) => {
            if (item.disabled || disabled) return;

            let newValue: string | string[];

            if (multiple) {
                const cur = Array.isArray(currentValue) ? currentValue : [];
                if (cur.includes(item.value)) {
                    newValue = cur.filter((v) => v !== item.value);
                } else {
                    newValue = [...cur, item.value];
                }
            } else {
                newValue = item.value;
            }

            if (!isControlled) {
                setInternalValue(newValue);
            }

            if (onChange) {
                (onChange as (event: ComponentEvent<string | string[]>) => void)({
                    event: e,
                    value: newValue,
                    name,
                    args,
                });
            }
        };

        const enabledIndices = items
            .map((item, index) => (item.disabled || disabled ? -1 : index))
            .filter((i) => i >= 0);

        const focusItem = (index: number) => {
            const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[data-select-button-index]');
            const target = Array.from(buttons || []).find((b) => Number(b.dataset.selectButtonIndex) === index);
            target?.focus();
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
            if (disabled) return;
            const item = items[index];
            const isHorizontal = direction === 'horizontal';

            const move = (delta: 1 | -1) => {
                if (enabledIndices.length === 0) return;
                const enabledPos = enabledIndices.indexOf(index);
                const startPos = enabledPos >= 0 ? enabledPos : 0;
                const nextPos = (startPos + delta + enabledIndices.length) % enabledIndices.length;
                const nextIdx = enabledIndices[nextPos];
                focusItem(nextIdx);
                if (!multiple) {
                    handleSelect(items[nextIdx], e);
                }
            };

            const isNextKey = isHorizontal ? e.key === 'ArrowRight' : e.key === 'ArrowDown';
            const isPrevKey = isHorizontal ? e.key === 'ArrowLeft' : e.key === 'ArrowUp';
            const isAltAxisKey = isHorizontal ? (e.key === 'ArrowDown' || e.key === 'ArrowUp') : (e.key === 'ArrowRight' || e.key === 'ArrowLeft');

            if (isNextKey) {
                e.preventDefault();
                move(1);
                return;
            }
            if (isPrevKey) {
                e.preventDefault();
                move(-1);
                return;
            }
            if (isAltAxisKey) {
                // for horizontal radiogroup arrow up/down still navigates per ARIA pattern
                e.preventDefault();
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') move(1);
                else move(-1);
                return;
            }
            if (e.key === 'Home' && enabledIndices.length > 0) {
                e.preventDefault();
                const first = enabledIndices[0];
                focusItem(first);
                if (!multiple) handleSelect(items[first], e);
                return;
            }
            if (e.key === 'End' && enabledIndices.length > 0) {
                e.preventDefault();
                const last = enabledIndices[enabledIndices.length - 1];
                focusItem(last);
                if (!multiple) handleSelect(items[last], e);
                return;
            }
            if ((e.key === ' ' || e.key === 'Enter') && item) {
                e.preventDefault();
                handleSelect(item, e);
            }
        };

        const resolvedSize = getResolvedSize({ ...baseProps });
        const containerClasses = classNames(
            'eui-select-button',
            `eui-select-button-${direction}`,
            `eui-select-button-${resolvedSize}`,
            { 'eui-select-button-disabled': disabled },
            className,
        );

        const getButtonClasses = (item: ListItem, index: number) =>
            getComponentClasses(
                { ...baseProps, disabled: disabled || item.disabled },
                classNames('eui-select-button-item', {
                    'eui-select-button-item-first': index === 0,
                    'eui-select-button-item-last': index === items.length - 1,
                    'eui-select-button-item-middle': index > 0 && index < items.length - 1,
                    'eui-select-button-item-selected': isSelected(item) && !disabled,
                    'eui-select-button-item-disabled': disabled || item.disabled,
                }),
            );

        const groupRole = multiple ? 'group' : 'radiogroup';

        const focusedSingleItemValue = (() => {
            if (multiple) return undefined;
            return currentValue ?? items.find((it) => !it.disabled)?.value;
        })();

        return (
            <div
                ref={setRef}
                className={containerClasses}
                role={groupRole}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                aria-required={required || undefined}
                aria-disabled={disabled || undefined}
            >
                {items.map((item, index) => {
                    const ItemIcon = item.icon as React.ElementType | React.ReactElement | undefined;
                    const selected = isSelected(item);
                    const isItemDisabled = disabled || item.disabled;
                    const itemTabIndex = multiple
                        ? (isItemDisabled ? -1 : 0)
                        : (isItemDisabled ? -1 : item.value === focusedSingleItemValue ? 0 : -1);
                    const ariaProps = multiple
                        ? { 'aria-pressed': selected }
                        : { role: 'radio', 'aria-checked': selected };
                    return (
                        <button
                            key={index}
                            type="button"
                            data-select-button-index={index}
                            onClick={(e) => handleSelect(item, e)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            disabled={isItemDisabled}
                            tabIndex={itemTabIndex}
                            className={getButtonClasses(item, index)}
                            {...ariaProps}
                        >
                            {ItemIcon && (React.isValidElement(ItemIcon) ? ItemIcon : <ItemIcon className="eui-select-button-item-icon" />)}
                            <span>{item.label}</span>
                        </button>
                    );
                })}

                <input
                    type="hidden"
                    name={name}
                    value={multiple && Array.isArray(currentValue) ? currentValue.join(',') : currentValue?.toString() || ''}
                    required={required}
                />
            </div>
        );
    },
);
