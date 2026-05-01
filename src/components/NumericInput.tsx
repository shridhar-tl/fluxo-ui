import classNames from 'classnames';
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '../assets/icons';
import { BaseComponentProps, ComponentEvent } from '../types';
import { generateId, getComponentClasses, getComponentStyles } from '../utils';
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
            ...baseProps
        },
        ref,
    ) => {
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

        const componentClasses = getComponentClasses(
            { ...baseProps, disabled, className },
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

        const inputElement = (
            <input
                ref={inputRef}
                id={inputId}
                type="text"
                inputMode="decimal"
                role="spinbutton"
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                required={required}
                readOnly={readonly}
                autoFocus={autoFocus}
                disabled={disabled}
                className={componentClasses}
                style={componentStyles}
                aria-invalid={required && !value ? 'true' : 'false'}
                aria-required={required}
                aria-valuenow={numericValue}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuetext={displayValue || undefined}
            />
        );

        if (!showSteppers) {
            return inputElement;
        }

        return (
            <div className={classNames('eui-numeric-input-wrapper', { 'eui-numeric-input-wrapper-disabled': disabled })}>
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
        );
    },
);
