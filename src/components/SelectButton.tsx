import classNames from 'classnames';
import React, { forwardRef, useState } from 'react';
import { BaseComponentProps, ComponentEvent, ListItem } from '../types';
import { getComponentClasses, getResolvedSize } from '../utils';
import './SelectButton.scss';

interface SelectButtonBaseProps extends BaseComponentProps {
    items: ListItem[];
    required?: boolean;
    direction?: 'horizontal' | 'vertical';
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
            ...baseProps
        },
        ref,
    ) => {
        const [internalValue, setInternalValue] = useState<string | string[] | undefined>(
            multiple ? [] : undefined
        );
        const isControlled = value !== undefined;
        const currentValue = isControlled ? value : internalValue;

        const isSelected = (item: ListItem) => {
            if (multiple && Array.isArray(currentValue)) {
                return currentValue.includes(item.value);
            }
            return currentValue === item.value;
        };

        const handleSelect = (item: ListItem) => {
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
                    event: { target: { value: newValue } } as React.ChangeEvent<HTMLInputElement>,
                    value: newValue,
                    name,
                    args,
                });
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

        return (
            <div ref={ref} className={containerClasses} role="group">
                {items.map((item, index) => {
                    const ItemIcon = item.icon as React.ElementType | React.ReactElement | undefined;
                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSelect(item)}
                            disabled={disabled || item.disabled}
                            className={getButtonClasses(item, index)}
                            aria-pressed={isSelected(item)}
                            aria-label={item.label}
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
