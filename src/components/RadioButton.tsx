import classNames from 'classnames';
import React, { forwardRef, useState } from 'react';
import { BaseComponentProps, ComponentEvent, ListItem } from '../types';
import { generateId, getComponentClasses } from '../utils';
import './RadioButton.scss';

interface RadioButtonProps extends BaseComponentProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'type'> {
    checked?: boolean;
    onChange?: (event: ComponentEvent<string>) => void;
    label?: string;
    value?: string;
    required?: boolean;
    id?: string;
}

export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
    ({ checked = false, onChange, label, value, required = false, id, disabled = false, className, name, args, ...baseProps }, ref) => {
        const [inputId] = useState(id || generateId());

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
            <label className={containerClasses} htmlFor={inputId}>
                <div className="relative shrink-0">
                    <input
                        ref={ref}
                        id={inputId}
                        type="radio"
                        checked={checked}
                        onChange={handleChange}
                        value={value}
                        required={required}
                        disabled={disabled}
                        name={name}
                        className="eui-radio-native"
                        aria-describedby={label ? `${inputId}-label` : undefined}
                    />
                    <div
                        className={classNames('eui-radio-control', {
                            'eui-radio-control-checked': checked,
                            'eui-radio-control-disabled': disabled,
                        })}
                    >
                        {checked && <div className="eui-radio-dot" />}
                    </div>
                </div>
                {label && (
                    <span id={`${inputId}-label`} className={classNames('eui-radio-label', { 'eui-radio-label-disabled': disabled })}>
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
}

export const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
    items,
    value,
    onChange,
    required = false,
    orientation = 'vertical',
    disabled = false,
    className,
    name,
    args,
    ...baseProps
}) => {
    const isControlled = onChange !== undefined;
    const [internalValue, setInternalValue] = useState(value);
    const selectedValue = isControlled ? value : internalValue;

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

    const containerClasses = classNames('eui-radio-group', { 'eui-radio-group-horizontal': orientation === 'horizontal' }, className);

    return (
        <div className={containerClasses} role="radiogroup">
            {items.map((item, index) => (
                <RadioButton
                    key={index}
                    label={item.label}
                    value={item.value}
                    checked={selectedValue === item.value}
                    onChange={handleChange}
                    disabled={disabled || item.disabled}
                    required={required}
                    name={name}
                    {...baseProps}
                />
            ))}
        </div>
    );
};
