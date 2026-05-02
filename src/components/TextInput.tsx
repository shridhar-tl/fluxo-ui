import classNames from 'classnames';
import React, { forwardRef, ReactNode, useState } from 'react';
import { TimesIcon } from '../assets/icons';
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
    error?: string | boolean;
    invalid?: boolean;
    helperText?: ReactNode;
    clearable?: boolean;
    onClear?: () => void;
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
            error,
            invalid,
            helperText,
            clearable = false,
            onClear,
            'aria-describedby': ariaDescribedBy,
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
        const errorMessage = typeof error === 'string' ? error : undefined;
        const hasError = invalid === true || error === true || (typeof error === 'string' && error.length > 0);
        const helperId = helperText ? `${inputId}-helper` : undefined;
        const errorId = errorMessage ? `${inputId}-error` : undefined;
        const describedBy = [ariaDescribedBy, helperId, errorId].filter(Boolean).join(' ') || undefined;

        const componentClasses = getComponentClasses(
            { ...baseProps, disabled, className: classNames(className, { 'eui-text-input-error': hasError }) },
            classNames('eui-text-input', `eui-text-input-${resolvedSize}`, {
                'eui-text-input-readonly': readonly,
                'eui-text-input-disabled': disabled,
                'eui-text-input-has-left': leftIcon,
                'eui-text-input-has-right': rightIcon || (clearable && (isControlled ? value : internalValue)),
            }),
        );

        const componentStyles = getComponentStyles({ ...baseProps, disabled });
        delete componentStyles.padding;
        delete componentStyles.height;
        delete componentStyles.fontSize;

        const displayValue = isControlled ? value : internalValue;
        const ariaInvalid = hasError ? 'true' : (required && !displayValue ? 'true' : 'false');

        const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (disabled || readonly) return;
            if (!isControlled) {
                setInternalValue('');
            }
            if (onChange) {
                onChange({
                    event: e,
                    value: '',
                    name,
                    args,
                });
            }
            onClear?.();
        };

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
                aria-invalid={ariaInvalid}
                aria-required={required}
                aria-describedby={describedBy}
                aria-errormessage={errorId}
            />
        );

        const showClear = clearable && !!displayValue && !disabled && !readonly;
        const wrapNeeded = leftIcon || rightIcon || showClear || helperText || errorMessage;

        if (!wrapNeeded) {
            return inputControl;
        }

        return (
            <span className="eui-text-input-wrap-outer">
                <span className="eui-text-input-wrap">
                    {leftIcon && <span className="eui-text-input-icon eui-text-input-icon-left">{renderIcon(leftIcon)}</span>}
                    {inputControl}
                    {showClear && !rightIcon && (
                        <button
                            type="button"
                            className="eui-text-input-clear"
                            onClick={handleClear}
                            tabIndex={-1}
                            aria-label="Clear input"
                        >
                            <TimesIcon />
                        </button>
                    )}
                    {rightIcon && <span className="eui-text-input-icon eui-text-input-icon-right">{renderIcon(rightIcon)}</span>}
                </span>
                {helperText && !errorMessage && (
                    <span id={helperId} className="eui-text-input-helper">
                        {helperText}
                    </span>
                )}
                {errorMessage && (
                    <span id={errorId} className="eui-text-input-error-message" role="alert">
                        {errorMessage}
                    </span>
                )}
            </span>
        );
    },
);

TextInput.displayName = 'TextInput';
