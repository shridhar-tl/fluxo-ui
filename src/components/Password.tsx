import classNames from 'classnames';
import React, { forwardRef, useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '../assets/icons';
import { BaseComponentProps, ComponentEvent } from '../types';
import { generateId, getComponentClasses, getComponentStyles, getResolvedSize } from '../utils';
import './Password.scss';

interface PasswordProps extends BaseComponentProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'type'> {
    value?: string;
    onChange?: (event: ComponentEvent<string>) => void;
    placeholder?: string;
    required?: boolean;
    readonly?: boolean;
    maxLength?: number;
    minLength?: number;
    autoComplete?: string;
    autoFocus?: boolean;
    showPassword?: boolean;
    toggleable?: boolean;
    id?: string;
}

export const Password = forwardRef<HTMLInputElement, PasswordProps>(
    (
        {
            value,
            onChange,
            placeholder,
            required = false,
            readonly = false,
            maxLength,
            minLength,
            autoComplete = 'current-password',
            autoFocus = false,
            showPassword: controlledShowPassword,
            toggleable = true,
            id,
            disabled = false,
            className,
            name,
            args,
            ...baseProps
        },
        ref,
    ) => {
        const [inputId] = useState(id || generateId());
        const [internalShowPassword, setInternalShowPassword] = useState(false);
        const isControlled = value !== undefined;
        const [internalValue, setInternalValue] = useState(value ?? '');

        const showPassword = controlledShowPassword !== undefined ? controlledShowPassword : internalShowPassword;
        const displayValue = isControlled ? value : internalValue;

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

        const togglePasswordVisibility = () => {
            if (controlledShowPassword === undefined) {
                setInternalShowPassword(!internalShowPassword);
            }
        };

        const resolvedSize = getResolvedSize({ ...baseProps });
        const componentClasses = getComponentClasses(
            { ...baseProps, disabled, className },
            classNames('eui-password', `eui-password-${resolvedSize}`, {
                'eui-password-toggleable': toggleable,
                'eui-password-readonly': readonly,
                'eui-password-disabled': disabled,
            }),
        );

        const componentStyles = getComponentStyles({ ...baseProps, disabled });
        delete componentStyles.padding;
        delete componentStyles.height;
        delete componentStyles.fontSize;

        const passwordField = (
            <input
                ref={ref}
                id={inputId}
                type={showPassword ? 'text' : 'password'}
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder}
                required={required}
                readOnly={readonly}
                maxLength={maxLength}
                minLength={minLength}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                disabled={disabled}
                className={componentClasses}
                style={componentStyles}
                aria-invalid={required && !displayValue ? 'true' : 'false'}
                aria-required={required}
            />
        );

        if (!toggleable) {
            return passwordField;
        }

        return (
            <span className="eui-password-wrap">
                {passwordField}
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={disabled}
                    className="eui-password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
            </span>
        );
    },
);
