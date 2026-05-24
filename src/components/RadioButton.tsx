import classNames from 'classnames';
import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { BaseComponentProps, ComponentEvent, ListItem } from '../types';
import { generateId, getComponentClasses, splitBaseAndNativeProps, splitVisibleAndHiddenProps } from '../utils';
import './eui-base.scss';
import './RadioButton.scss';

interface RadioButtonProps extends BaseComponentProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'type'> {
    checked?: boolean;
    onChange?: (event: ComponentEvent<string>) => void;
    label?: string;
    value?: string;
    required?: boolean;
    id?: string;
    tabIndex?: number;
}

export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
    ({ checked = false, onChange, label, value, required = false, id, disabled = false, className, name, args, tabIndex, ...rest }, ref) => {
        const { styleProps: baseProps, nativeProps } = splitBaseAndNativeProps(rest);
        const { visibleProps, hiddenInputProps } = splitVisibleAndHiddenProps(nativeProps);
        const [generatedId] = useState(() => generateId());
        const inputId = id || generatedId;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (onChange && e.target.checked) {
                onChange({
                    event: e,
                    value: value!,
                    name,
                    args,
                });
            }
        };

        const containerClasses = getComponentClasses(
            { ...baseProps, disabled },
            classNames('eui-radio', { 'eui-radio-disabled': disabled }, className),
        );

        return (
            <label {...visibleProps} className={containerClasses} htmlFor={inputId}>
                <span className="eui-radio-control-wrap">
                    <input
                        {...hiddenInputProps}
                        ref={ref}
                        id={inputId}
                        type="radio"
                        checked={checked}
                        onChange={handleChange}
                        value={value}
                        required={required}
                        disabled={disabled}
                        name={name}
                        tabIndex={tabIndex}
                        className="eui-radio-native"
                    />
                    <span
                        className={classNames('eui-radio-control', {
                            'eui-radio-control-checked': checked,
                            'eui-radio-control-disabled': disabled,
                        })}
                        aria-hidden="true"
                    >
                        {checked && <span className="eui-radio-dot" />}
                    </span>
                </span>
                {label && (
                    <span className={classNames('eui-radio-label', { 'eui-radio-label-disabled': disabled })}>
                        {label}
                    </span>
                )}
            </label>
        );
    },
);

interface RadioButtonGroupProps extends BaseComponentProps {
    items: ListItem[];
    value?: string;
    onChange?: (event: ComponentEvent<string>) => void;
    required?: boolean;
    orientation?: 'horizontal' | 'vertical';
    ariaLabel?: string;
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
    invalid?: boolean;
}

type RadioGroupExtraAttributes = {
    'aria-describedby'?: string;
    'aria-invalid'?: boolean | 'true' | 'false';
};

export const RadioButtonGroup: React.FC<RadioButtonGroupProps & RadioGroupExtraAttributes> = ({
    items,
    value,
    onChange,
    required = false,
    orientation = 'vertical',
    disabled = false,
    className,
    name,
    args,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    invalid,
    id,
    ...rest
}) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(value);
    const selectedValue = isControlled ? value : internalValue;
    const groupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isControlled) {
            setInternalValue(value);
        }
    }, [isControlled, value]);

    const handleChange = (event: ComponentEvent<string>) => {
        if (!isControlled) {
            setInternalValue(event.value);
        }
        if (onChange) {
            onChange({
                ...event,
                name,
                args,
            });
        }
    };

    const enabledItems = items.filter((it) => !disabled && !it.disabled);

    const focusItem = useCallback((focusValue: string) => {
        const node = groupRef.current?.querySelector<HTMLInputElement>(`input[type="radio"][value="${CSS.escape(focusValue)}"]`);
        node?.focus();
    }, []);

    const moveFocus = useCallback(
        (direction: 1 | -1, currentValue: string | undefined) => {
            if (enabledItems.length === 0) return;
            const idx = enabledItems.findIndex((it) => it.value === currentValue);
            const startIdx = idx >= 0 ? idx : 0;
            const nextIdx = (startIdx + direction + enabledItems.length) % enabledItems.length;
            const next = enabledItems[nextIdx];
            handleChange({
                event: undefined,
                value: next.value,
                name,
                args,
            } as unknown as ComponentEvent<string>);
            requestAnimationFrame(() => focusItem(next.value));
        },
        [enabledItems, focusItem, name, args],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (disabled) return;
            const target = e.target as HTMLElement;
            if (target.tagName !== 'INPUT') return;
            const currentValue = (target as HTMLInputElement).value;

            switch (e.key) {
                case 'ArrowDown':
                case 'ArrowRight':
                    e.preventDefault();
                    moveFocus(1, currentValue);
                    break;
                case 'ArrowUp':
                case 'ArrowLeft':
                    e.preventDefault();
                    moveFocus(-1, currentValue);
                    break;
                case 'Home':
                    if (enabledItems.length > 0) {
                        e.preventDefault();
                        const first = enabledItems[0];
                        handleChange({ event: undefined, value: first.value, name, args } as unknown as ComponentEvent<string>);
                        requestAnimationFrame(() => focusItem(first.value));
                    }
                    break;
                case 'End':
                    if (enabledItems.length > 0) {
                        e.preventDefault();
                        const last = enabledItems[enabledItems.length - 1];
                        handleChange({ event: undefined, value: last.value, name, args } as unknown as ComponentEvent<string>);
                        requestAnimationFrame(() => focusItem(last.value));
                    }
                    break;
                default:
                    break;
            }
        },
        [disabled, moveFocus, enabledItems, focusItem, name, args],
    );

    const containerClasses = classNames('eui-radio-group', { 'eui-radio-group-horizontal': orientation === 'horizontal' }, className);

    const focusedValueIdx = enabledItems.findIndex((it) => it.value === selectedValue);
    const rovingFocusValue = focusedValueIdx >= 0 ? selectedValue : enabledItems[0]?.value;

    const restAriaInvalid = (rest as RadioGroupExtraAttributes)['aria-invalid'];
    const restAriaDescribedBy = (rest as RadioGroupExtraAttributes)['aria-describedby'];

    return (
        <div
            ref={groupRef}
            id={id}
            className={containerClasses}
            role="radiogroup"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy ?? restAriaDescribedBy}
            aria-required={required || undefined}
            aria-invalid={invalid || restAriaInvalid || undefined}
            aria-disabled={disabled || undefined}
            onKeyDown={handleKeyDown}
        >
            {items.map((item, index) => {
                const isFirst = index === 0;
                const isItemDisabled = disabled || item.disabled;
                const isChecked = selectedValue === item.value;
                const itemTabIndex = isItemDisabled
                    ? -1
                    : selectedValue === undefined
                        ? (item.value === rovingFocusValue ? 0 : -1)
                        : isChecked
                            ? 0
                            : -1;
                return (
                    <RadioButton
                        key={index}
                        label={item.label}
                        value={item.value}
                        checked={isChecked}
                        onChange={handleChange}
                        disabled={isItemDisabled}
                        required={required && isFirst}
                        name={name}
                        tabIndex={itemTabIndex}
                    />
                );
            })}
        </div>
    );
};
