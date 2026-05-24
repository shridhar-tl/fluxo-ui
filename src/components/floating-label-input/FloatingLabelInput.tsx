import cn from 'classnames';
import React, { forwardRef, useId, useState } from 'react';
import '../eui-base.scss';
import './FloatingLabelInput.scss';

type FloatingLabelVariant = 'outlined' | 'filled' | 'underlined';
type FloatingLabelSize = 'sm' | 'md' | 'lg';

interface FloatingLabelInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label: string;
    helperText?: React.ReactNode;
    errorText?: React.ReactNode;
    variant?: FloatingLabelVariant;
    size?: FloatingLabelSize;
    fullWidth?: boolean;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    invalid?: boolean;
    rootClassName?: string;
}

const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
    (
        {
            label,
            helperText,
            errorText,
            variant = 'outlined',
            size = 'md',
            fullWidth = false,
            leadingIcon,
            trailingIcon,
            invalid = false,
            rootClassName,
            className,
            id,
            value,
            defaultValue,
            placeholder,
            disabled,
            required,
            onFocus,
            onBlur,
            onChange,
            ...rest
        },
        ref,
    ) => {
        const generatedId = useId();
        const inputId = id ?? `eui-floating-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
        const helperId = helperText || errorText ? `${inputId}-helper` : undefined;
        const [isFocused, setIsFocused] = useState(false);
        const [internalValue, setInternalValue] = useState<string | number | readonly string[] | undefined>(defaultValue);
        const isControlled = value !== undefined;
        const currentValue = isControlled ? value : internalValue;
        const hasValue = currentValue !== undefined && currentValue !== '' && currentValue !== null;
        const floated = isFocused || hasValue || Boolean(placeholder);
        const hasError = invalid || Boolean(errorText);

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            onFocus?.(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            onBlur?.(e);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!isControlled) setInternalValue(e.target.value);
            onChange?.(e);
        };

        return (
            <div
                className={cn(
                    'eui-floating-label-input',
                    `eui-floating-label-variant-${variant}`,
                    `eui-floating-label-size-${size}`,
                    rootClassName,
                    {
                        'eui-floating-label-focused': isFocused,
                        'eui-floating-label-floated': floated,
                        'eui-floating-label-disabled': disabled,
                        'eui-floating-label-error': hasError,
                        'eui-floating-label-full-width': fullWidth,
                    },
                )}
            >
                <div className="eui-floating-label-input-wrapper">
                    {leadingIcon && (
                        <span className="eui-floating-label-input-icon eui-floating-label-input-icon-leading" aria-hidden="true">
                            {leadingIcon}
                        </span>
                    )}
                    <input
                        {...rest}
                        ref={ref}
                        id={inputId}
                        value={isControlled ? value : undefined}
                        defaultValue={isControlled ? undefined : defaultValue}
                        placeholder={placeholder}
                        disabled={disabled}
                        required={required}
                        aria-invalid={hasError || undefined}
                        aria-describedby={helperId}
                        className={cn('eui-floating-label-input-field', className)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChange={handleChange}
                    />
                    <label htmlFor={inputId} className="eui-floating-label-input-label">
                        {label}
                        {required && <span className="eui-floating-label-input-required" aria-hidden="true"> *</span>}
                    </label>
                    {trailingIcon && (
                        <span className="eui-floating-label-input-icon eui-floating-label-input-icon-trailing" aria-hidden="true">
                            {trailingIcon}
                        </span>
                    )}
                </div>
                {(helperText || errorText) && (
                    <div
                        id={helperId}
                        className={cn('eui-floating-label-input-helper', {
                            'eui-floating-label-input-helper-error': hasError,
                        })}
                        role={hasError ? 'alert' : undefined}
                    >
                        {hasError ? errorText ?? helperText : helperText}
                    </div>
                )}
            </div>
        );
    },
);

FloatingLabelInput.displayName = 'FloatingLabelInput';

export { FloatingLabelInput };
export type { FloatingLabelInputProps, FloatingLabelVariant, FloatingLabelSize };
