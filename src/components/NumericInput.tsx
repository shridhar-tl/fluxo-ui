import classNames from 'classnames';
import React, { forwardRef, ReactNode, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '../assets/icons';
import { BaseComponentProps, ComponentEvent } from '../types';
import { generateId, getComponentClasses, getComponentStyles, splitBaseAndNativeProps } from '../utils';
import './NumericInput.scss';

interface NumericInputProps extends BaseComponentProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'type'> {
    value?: number;
    onChange?: (event: ComponentEvent<number | undefined>) => void;
    placeholder?: string;
    required?: boolean;
    readonly?: boolean;
    min?: number;
    max?: number;
    maxDecimals?: number;
    autoFocus?: boolean;
    id?: string;
    step?: number;
    largeStep?: number;
    showSteppers?: boolean;
    error?: string | boolean;
    invalid?: boolean;
    helperText?: ReactNode;
}

export const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
    (
        {
            value,
            onChange,
            placeholder,
            required = false,
            readonly = false,
            min,
            max,
            maxDecimals = 2,
            autoFocus = false,
            id,
            disabled = false,
            className,
            name,
            args,
            step = 1,
            largeStep,
            showSteppers = false,
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
        const [displayValue, setDisplayValue] = useState(value?.toString() || '');
        const inputRef = useRef<HTMLInputElement | null>(null);

        useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

        const formatNumber = useCallback((num: number, decimals: number) => {
            return Number(num.toFixed(decimals));
        }, []);

        const validateAndCorrect = useCallback(
            (num: number) => {
                let corrected = num;

                if (min !== undefined && corrected < min) {
                    corrected = min;
                }

                if (max !== undefined && corrected > max) {
                    corrected = max;
                }

                return formatNumber(corrected, maxDecimals);
            },
            [min, max, maxDecimals, formatNumber],
        );

        const emit = useCallback(
            (event: React.SyntheticEvent, nextValue: number | undefined) => {
                if (!onChange) return;
                onChange({
                    event,
                    value: nextValue,
                    name,
                    args,
                });
            },
            [onChange, name, args],
        );

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;

            if (inputValue === '' || /^-?\d*\.?\d*$/.test(inputValue)) {
                setDisplayValue(inputValue);

                if (inputValue === '' || inputValue === '-' || inputValue === '.' || inputValue === '-.') {
                    emit(e, undefined);
                    return;
                }

                if (!isNaN(Number(inputValue))) {
                    emit(e, parseFloat(inputValue));
                }
            }
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            if (displayValue !== '') {
                const numValue = parseFloat(displayValue);
                if (!isNaN(numValue)) {
                    const correctedValue = validateAndCorrect(numValue);
                    setDisplayValue(correctedValue.toString());

                    if (correctedValue !== numValue) {
                        emit(e, correctedValue);
                    }
                }
            }
        };

        const stepBy = useCallback(
            (event: React.SyntheticEvent, delta: number) => {
                const current = displayValue !== '' && !isNaN(parseFloat(displayValue)) ? parseFloat(displayValue) : 0;
                const next = validateAndCorrect(current + delta);
                setDisplayValue(next.toString());
                emit(event, next);
            },
            [displayValue, validateAndCorrect, emit],
        );

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (disabled || readonly) return;
            if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

            e.preventDefault();
            const magnitude = e.shiftKey && largeStep !== undefined ? largeStep : step;
            const delta = e.key === 'ArrowUp' ? magnitude : -magnitude;
            stepBy(e, delta);
        };

        const handleStepperClick = (e: React.MouseEvent<HTMLButtonElement>, direction: 1 | -1) => {
            e.preventDefault();
            if (disabled || readonly) return;
            stepBy(e, direction * step);
            inputRef.current?.focus();
        };

        React.useEffect(() => {
            if (value !== undefined) {
                setDisplayValue(value.toString());
            } else {
                setDisplayValue('');
            }
        }, [value]);

        const errorMessage = typeof error === 'string' ? error : undefined;
        const hasError = invalid === true || error === true || (typeof error === 'string' && error.length > 0);
        const helperId = helperText ? `${inputId}-helper` : undefined;
        const errorId = errorMessage ? `${inputId}-error` : undefined;
        const describedBy = [ariaDescribedBy, helperId, errorId].filter(Boolean).join(' ') || undefined;

        const componentClasses = getComponentClasses(
            { ...baseProps, disabled, className: classNames(className, { 'eui-numeric-input-error': hasError }) },
            classNames('eui-numeric-input', {
                'eui-numeric-input-readonly': readonly,
                'eui-numeric-input-disabled': disabled,
                'eui-numeric-input-with-steppers': showSteppers,
            }),
        );

        const componentStyles = getComponentStyles({ ...baseProps, disabled });
        delete componentStyles.padding;
        delete componentStyles.height;
        delete componentStyles.fontSize;

        const numericValue = displayValue !== '' && !isNaN(parseFloat(displayValue)) ? parseFloat(displayValue) : undefined;
        const upDisabled = disabled || readonly || (max !== undefined && numericValue !== undefined && numericValue >= max);
        const downDisabled = disabled || readonly || (min !== undefined && numericValue !== undefined && numericValue <= min);
        const ariaInvalid = hasError ? 'true' : (required && !value ? 'true' : 'false');

        const inputElement = (
            <input
                {...nativeProps}
                ref={inputRef}
                id={inputId}
                name={name}
                type="text"
                inputMode="decimal"
                role="spinbutton"
                value={displayValue}
                onChange={handleChange}
                onBlur={(e) => {
                    nativeProps.onBlur?.(e);
                    handleBlur(e);
                }}
                onKeyDown={(e) => {
                    nativeProps.onKeyDown?.(e);
                    handleKeyDown(e);
                }}
                placeholder={placeholder}
                required={required}
                readOnly={readonly}
                autoFocus={autoFocus}
                disabled={disabled}
                className={componentClasses}
                style={{ ...nativeProps.style, ...componentStyles }}
                aria-invalid={ariaInvalid}
                aria-required={required}
                aria-valuenow={numericValue}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuetext={displayValue || undefined}
                aria-describedby={describedBy}
                aria-errormessage={errorId}
            />
        );

        const messages = (helperText && !errorMessage) || errorMessage ? (
            <>
                {helperText && !errorMessage && (
                    <span id={helperId} className="eui-numeric-input-helper">
                        {helperText}
                    </span>
                )}
                {errorMessage && (
                    <span id={errorId} className="eui-numeric-input-error-message" role="alert">
                        {errorMessage}
                    </span>
                )}
            </>
        ) : null;

        if (!showSteppers && !messages) {
            return inputElement;
        }

        if (!showSteppers) {
            return (
                <span className="eui-numeric-input-wrap-outer">
                    {inputElement}
                    {messages}
                </span>
            );
        }

        return (
            <div className={classNames('eui-numeric-input-wrap-outer', { 'eui-numeric-input-wrapper-disabled': disabled })}>
                <div className="eui-numeric-input-wrapper">
                    {inputElement}
                    <div className="eui-numeric-input-steppers" aria-hidden="true">
                        <button
                            type="button"
                            tabIndex={-1}
                            className="eui-numeric-input-stepper eui-numeric-input-stepper-up"
                            onClick={(e) => handleStepperClick(e, 1)}
                            disabled={upDisabled}
                            aria-label="Increase value"
                        >
                            <ChevronUpIcon />
                        </button>
                        <button
                            type="button"
                            tabIndex={-1}
                            className="eui-numeric-input-stepper eui-numeric-input-stepper-down"
                            onClick={(e) => handleStepperClick(e, -1)}
                            disabled={downDisabled}
                            aria-label="Decrease value"
                        >
                            <ChevronDownIcon />
                        </button>
                    </div>
                </div>
                {messages}
            </div>
        );
    },
);
