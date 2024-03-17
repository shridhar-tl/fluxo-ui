import classNames from 'classnames';
import React, { forwardRef, ReactNode, useState } from 'react';
import { BaseComponentProps, ComponentEvent } from '../types';
import { generateId, getComponentClasses, getComponentStyles, getResolvedSize } from '../utils';
import './TextInput.scss';

interface TextInputProps extends BaseComponentProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
    value?: string;
    onChange?: (event: ComponentEvent<string>) => void;
    placeholder?: string;
    required?: boolean;
    readonly?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    autoComplete?: string;
    autoFocus?: boolean;
    id?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    (
        {
            value,
            onChange,
            placeholder,
            required = false,
            readonly = false,
            maxLength,
            minLength,
            pattern,
            autoComplete,
            autoFocus = false,
            id,
            disabled = false,
            className,
            name,
            args,
            leftIcon,
            rightIcon,
            ...baseProps
        },
        ref,
    ) => {
        const [inputId] = useState(id || generateId());
        const isControlled = value !== undefined;
        const [internalValue, setInternalValue] = useState(value ?? '');

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!isControlled) {
                setInternalValue(e.target.value);
            }
            if (onChange) {
                onChange({
                    event: e,
                    value: e.target.value,
                    name,
                    args,
                });
            }
        };

        const renderIcon = (icon: ReactNode) => {
            if (!icon) return null;
            if (typeof icon === 'function') {
                const IconComponent = icon as React.ComponentType<{ className?: string }>;
                return <IconComponent className="eui-text-input-icon-inner" />;
            }
            return icon;
        };

        const resolvedSize = getResolvedSize({ ...baseProps });
        const componentClasses = getComponentClasses(
            { ...baseProps, disabled, className },
            classNames('eui-text-input', `eui-text-input-${resolvedSize}`, {
                'eui-text-input-readonly': readonly,
                'eui-text-input-disabled': disabled,
                'eui-text-input-has-left': leftIcon,
                'eui-text-input-has-right': rightIcon,
            }),
        );

        const componentStyles = getComponentStyles({ ...baseProps, disabled });
        delete componentStyles.padding;
        delete componentStyles.height;
        delete componentStyles.fontSize;

        const displayValue = isControlled ? value : internalValue;

        const inputControl = (
            <input
                ref={ref}
                id={inputId}
                type="text"
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder}
                required={required}
                readOnly={readonly}
                maxLength={maxLength}
                minLength={minLength}
                pattern={pattern}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                disabled={disabled}
                className={componentClasses}
                style={componentStyles}
                aria-invalid={required && !displayValue ? 'true' : 'false'}
                aria-required={required}
            />
        );

        if (!leftIcon && !rightIcon) {
            return inputControl;
        }

        return (
            <span className="eui-text-input-wrap">
                {leftIcon && <span className="eui-text-input-icon eui-text-input-icon-left">{renderIcon(leftIcon)}</span>}
                {inputControl}
                {rightIcon && <span className="eui-text-input-icon eui-text-input-icon-right">{renderIcon(rightIcon)}</span>}
            </span>
        );
    },
);

TextInput.displayName = 'TextInput';
