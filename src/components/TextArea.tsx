import classNames from 'classnames';
import React, { forwardRef, ReactNode, useEffect, useRef, useState } from 'react';
import { BaseComponentProps, ComponentEvent } from '../types';
import { generateId, getComponentClasses, getComponentStyles, splitBaseAndNativeProps } from '../utils';
import './eui-base.scss';
import './TextArea.scss';

interface TextAreaProps extends BaseComponentProps, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'size'> {
    value?: string;
    onChange?: (event: ComponentEvent<string>) => void;
    placeholder?: string;
    required?: boolean;
    readonly?: boolean;
    maxLength?: number;
    minLength?: number;
    rows?: number;
    autoResize?: boolean;
    maxHeight?: string;
    autoFocus?: boolean;
    id?: string;
    showCount?: boolean;
    error?: string | boolean;
    invalid?: boolean;
    helperText?: ReactNode;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
        {
            value,
            onChange,
            placeholder,
            required = false,
            readonly = false,
            maxLength,
            minLength,
            rows = 3,
            autoResize = false,
            maxHeight = '200px',
            autoFocus = false,
            id,
            disabled = false,
            className,
            name,
            args,
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
        const isControlled = value !== undefined;
        const [internalValue, setInternalValue] = useState(value ?? '');
        const displayValue = isControlled ? value : internalValue;
        const [currentLength, setCurrentLength] = useState((displayValue).length);
        const textareaRef = useRef<HTMLTextAreaElement>(null);
        const combinedRef = (ref as React.RefObject<HTMLTextAreaElement>) || textareaRef;

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            let newValue = e.target.value;

            if (maxLength && newValue.length > maxLength) {
                newValue = newValue.slice(0, maxLength);
                e.target.value = newValue;
            }

            setCurrentLength(newValue.length);

            if (!isControlled) {
                setInternalValue(newValue);
            }
            if (onChange) {
                onChange({
                    event: e,
                    value: newValue,
                    name,
                    args,
                });
            }
        };

        const adjustHeight = () => {
            if (autoResize && combinedRef.current) {
                const textarea = combinedRef.current;
                textarea.style.height = 'auto';

                const maxHeightValue = parseInt(maxHeight.replace('px', ''));
                const newHeight = Math.min(textarea.scrollHeight, maxHeightValue);

                textarea.style.height = `${newHeight}px`;
                textarea.style.overflowY = textarea.scrollHeight > maxHeightValue ? 'auto' : 'hidden';
            }
        };

        useEffect(() => {
            adjustHeight();
        }, [displayValue, autoResize]);

        useEffect(() => {
            setCurrentLength(displayValue.length);
        }, [displayValue]);

        const errorMessage = typeof error === 'string' ? error : undefined;
        const hasError = invalid === true || error === true || (typeof error === 'string' && error.length > 0);
        const helperId = helperText ? `${inputId}-helper` : undefined;
        const errorId = errorMessage ? `${inputId}-error` : undefined;
        const describedBy = [ariaDescribedBy, helperId, errorId].filter(Boolean).join(' ') || undefined;
        const ariaInvalid = hasError ? 'true' : (required && !displayValue ? 'true' : 'false');

        const componentClasses = getComponentClasses(
            { ...baseProps, disabled, className: classNames(className, { 'eui-textarea-error': hasError }) },
            classNames('eui-textarea', {
                'eui-textarea-resizable': !autoResize,
                'eui-textarea-readonly': readonly,
                'eui-textarea-disabled': disabled,
            }),
        );

        const baseStyles = getComponentStyles({ ...baseProps, disabled });
        delete baseStyles.padding;
        delete baseStyles.height;
        delete baseStyles.fontSize;
        const componentStyles = {
            ...baseStyles,
            ...(autoResize && { overflow: 'hidden' }),
        };

        return (
            <div className="eui-textarea-wrap">
                <textarea
                    {...nativeProps}
                    ref={combinedRef}
                    id={inputId}
                    value={displayValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required={required}
                    readOnly={readonly}
                    minLength={minLength}
                    rows={rows}
                    autoFocus={autoFocus}
                    disabled={disabled}
                    className={componentClasses}
                    style={componentStyles}
                    aria-invalid={ariaInvalid}
                    aria-required={required}
                    aria-describedby={describedBy}
                    aria-errormessage={errorId}
                    onInput={(e) => {
                        adjustHeight();
                        nativeProps.onInput?.(e);
                    }}
                />
                {maxLength && (
                    <div className="eui-textarea-count">
                        {currentLength}/{maxLength}
                    </div>
                )}
                {helperText && !errorMessage && (
                    <span id={helperId} className="eui-textarea-helper">
                        {helperText}
                    </span>
                )}
                {errorMessage && (
                    <span id={errorId} className="eui-textarea-error-message" role="alert">
                        {errorMessage}
                    </span>
                )}
            </div>
        );
    },
);
