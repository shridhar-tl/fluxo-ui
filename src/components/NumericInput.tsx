import classNames from 'classnames';
import React, { forwardRef, useCallback, useState } from 'react';
import { BaseComponentProps, ComponentEvent } from '../types';
import { generateId, getComponentClasses, getComponentStyles } from '../utils';
import './NumericInput.scss';

interface NumericInputProps extends BaseComponentProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'type'> {
    value?: number;
    onChange?: (event: ComponentEvent<number>) => void;
    placeholder?: string;
    required?: boolean;
    readonly?: boolean;
    min?: number;
    max?: number;
    maxDecimals?: number;
    autoFocus?: boolean;
    id?: string;
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
            ...baseProps
        },
        ref,
    ) => {
        const [inputId] = useState(id || generateId());
        const [displayValue, setDisplayValue] = useState(value?.toString() || '');

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

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;

            // Allow empty string, numbers, and decimal point
            if (inputValue === '' || /^-?\d*\.?\d*$/.test(inputValue)) {
                setDisplayValue(inputValue);

                if (inputValue !== '' && !isNaN(Number(inputValue))) {
                    const numValue = parseFloat(inputValue);
                    if (onChange) {
                        onChange({
                            event: e,
                            value: numValue,
                            name,
                            args,
                        });
                    }
                }
            }
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            if (displayValue !== '') {
                const numValue = parseFloat(displayValue);
                if (!isNaN(numValue)) {
                    const correctedValue = validateAndCorrect(numValue);
                    setDisplayValue(correctedValue.toString());

                    if (onChange && correctedValue !== numValue) {
                        onChange({
                            event: e,
                            value: correctedValue,
                            name,
                            args,
                        });
                    }
                }
            }
        };

        React.useEffect(() => {
            if (value !== undefined) {
                setDisplayValue(value.toString());
            }
        }, [value]);

        const componentClasses = getComponentClasses(
            { ...baseProps, disabled, className },
            classNames('eui-numeric-input', {
                'eui-numeric-input-readonly': readonly,
                'eui-numeric-input-disabled': disabled,
            }),
        );

        const componentStyles = getComponentStyles({ ...baseProps, disabled });
        delete componentStyles.padding;
        delete componentStyles.height;
        delete componentStyles.fontSize;

        return (
            <input
                ref={ref}
                id={inputId}
                type="text"
                inputMode="decimal"
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                required={required}
                readOnly={readonly}
                autoFocus={autoFocus}
                disabled={disabled}
                className={componentClasses}
                style={componentStyles}
                aria-invalid={required && !value ? 'true' : 'false'}
                aria-required={required}
                min={min}
                max={max}
            />
        );
    },
);
