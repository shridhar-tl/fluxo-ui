import classNames from 'classnames';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '../assets/icons';
import { PasswordStrengthMeter, PasswordStrengthMeterProps } from './password-strength';
import { BaseComponentProps, ComponentEvent } from '../types';
import { generateId, getComponentClasses, getComponentStyles, getResolvedSize, splitBaseAndNativeProps } from '../utils';
import './eui-base.scss';
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
    strengthMeter?: boolean | Omit<PasswordStrengthMeterProps, 'value'>;
    error?: string | boolean;
    invalid?: boolean;
    helperText?: React.ReactNode;
}

const isDevEnvironment = (): boolean => {
    try {
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
            return process.env.NODE_ENV !== 'production';
        }
    } catch {
        // ignore
    }
    return true;
};

const detectSignupContext = (input: HTMLInputElement | null): boolean => {
    if (!input) return false;
    const signupRegex = /confirm|new[-_ ]?password|create[-_ ]?password|signup|sign[-_ ]?up|register/i;
    const form = input.form;
    const peers = form ? Array.from(form.querySelectorAll<HTMLElement>('input,button')) : [];
    for (const el of peers) {
        if (el === input) continue;
        if (el instanceof HTMLInputElement && el.type === 'password') {
            const meta = `${el.name || ''} ${el.id || ''} ${el.getAttribute('aria-label') || ''}`;
            if (signupRegex.test(meta)) return true;
        }
        if (el instanceof HTMLButtonElement) {
            const text = `${el.textContent || ''} ${el.getAttribute('aria-label') || ''}`;
            if (/sign\s*up|create\s*account|register/i.test(text)) return true;
        }
    }
    const ownMeta = `${input.name || ''} ${input.id || ''} ${input.getAttribute('aria-label') || ''}`;
    return signupRegex.test(ownMeta);
};

const passwordWarningSent = new WeakSet<HTMLInputElement>();

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
            strengthMeter,
            error,
            invalid,
            helperText,
            'aria-describedby': ariaDescribedBy,
            ...rest
        },
        ref,
    ) => {
        const { styleProps: baseProps, nativeProps } = splitBaseAndNativeProps(rest);
        const [inputId] = useState(id || generateId());
        const [internalShowPassword, setInternalShowPassword] = useState(false);
        const isControlled = value !== undefined;
        const [internalValue, setInternalValue] = useState(value ?? '');
        const inputRef = useRef<HTMLInputElement | null>(null);

        useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

        const showPassword = controlledShowPassword !== undefined ? controlledShowPassword : internalShowPassword;
        const displayValue = isControlled ? value : internalValue;

        const meterId = strengthMeter ? `${inputId}-strength` : undefined;

        useEffect(() => {
            if (!isDevEnvironment()) return;
            const inputEl = inputRef.current;
            if (!inputEl || passwordWarningSent.has(inputEl)) return;
            const t = window.setTimeout(() => {
                if (autoComplete === 'new-password') return;
                if (detectSignupContext(inputEl)) {
                    passwordWarningSent.add(inputEl);
                    // eslint-disable-next-line no-console
                    console.warn(
                        '[Fluxo UI Password] This field appears to be in a signup/registration form. Set autoComplete="new-password" so password managers offer to generate a strong password.',
                    );
                }
            }, 200);
            return () => window.clearTimeout(t);
        }, [autoComplete]);

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

        const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            if (controlledShowPassword === undefined) {
                setInternalShowPassword(!internalShowPassword);
            }
            window.requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        };

        const errorMessage = typeof error === 'string' ? error : undefined;
        const hasError = invalid === true || error === true || (typeof error === 'string' && error.length > 0);
        const helperId = helperText ? `${inputId}-helper` : undefined;
        const errorId = errorMessage ? `${inputId}-error` : undefined;
        const describedBy = [ariaDescribedBy, meterId, helperId, errorId].filter(Boolean).join(' ') || undefined;
        const ariaInvalid = hasError ? 'true' : (required && !displayValue ? 'true' : 'false');

        const resolvedSize = getResolvedSize({ ...baseProps });
        const componentClasses = getComponentClasses(
            { ...baseProps, disabled, className: classNames(className, { 'eui-password-error': hasError }) },
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
                {...nativeProps}
                ref={inputRef}
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
                name={name}
                className={componentClasses}
                style={{ ...nativeProps.style, ...componentStyles }}
                aria-invalid={ariaInvalid}
                aria-required={required}
                aria-describedby={describedBy}
                aria-errormessage={errorId}
            />
        );

        const meterProps: Omit<PasswordStrengthMeterProps, 'value'> | null =
            strengthMeter === true ? {} : typeof strengthMeter === 'object' && strengthMeter ? strengthMeter : null;

        const inputBlock = !toggleable ? (
            passwordField
        ) : (
            <span className="eui-password-wrap">
                {passwordField}
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={disabled}
                    className="eui-password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                >
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
            </span>
        );

        const messages = (helperText && !errorMessage) || errorMessage ? (
            <>
                {helperText && !errorMessage && (
                    <span id={helperId} className="eui-password-helper">
                        {helperText}
                    </span>
                )}
                {errorMessage && (
                    <span id={errorId} className="eui-password-error-message" role="alert">
                        {errorMessage}
                    </span>
                )}
            </>
        ) : null;

        if (!meterProps && !messages) {
            return inputBlock;
        }

        return (
            <div className="eui-password-with-meter">
                {inputBlock}
                {meterProps && (
                    <PasswordStrengthMeter
                        {...meterProps}
                        value={typeof displayValue === 'string' ? displayValue : ''}
                        id={meterId}
                    />
                )}
                {messages}
            </div>
        );
    },
);
