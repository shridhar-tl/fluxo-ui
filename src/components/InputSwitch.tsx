import classNames from 'classnames';
import React, { forwardRef, useState } from 'react';
import { BaseComponentProps, ComponentEvent } from '../types';
import { generateId, getComponentClasses } from '../utils';
import './InputSwitch.scss';

interface InputSwitchProps extends BaseComponentProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'type'> {
    checked?: boolean;
    onChange?: (event: ComponentEvent<boolean>) => void;
    onLabel?: string;
    offLabel?: string;
    required?: boolean;
    id?: string;
}

export const InputSwitch = forwardRef<HTMLInputElement, InputSwitchProps>(
    (
        {
            checked = false,
            onChange,
            onLabel = 'On',
            offLabel = 'Off',
            required = false,
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

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (onChange) {
                onChange({
                    event: e,
                    value: e.target.checked,
                    name,
                    args,
                });
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (!disabled) {
                    const syntheticEvent = {
                        ...e,
                        target: { ...e.target, checked: !checked },
                    } as any;
                    handleChange(syntheticEvent);
                }
            }
        };

        const containerClasses = getComponentClasses(
            { ...baseProps, disabled },
            classNames(
                'eui-input-switch',
                {
                    'eui-input-switch-disabled': disabled,
                },
                className,
            ),
        );

        const trackClasses = classNames('eui-input-switch-track', {
            'eui-input-switch-track-on': checked && !disabled,
            'eui-input-switch-track-disabled': disabled,
        });

        const thumbClasses = classNames('eui-input-switch-thumb', {
            'eui-input-switch-thumb-on': checked,
        });

        return (
            <div className={containerClasses}>
                <span className={classNames('eui-input-switch-label', { 'eui-input-switch-label-muted': disabled || checked })}>
                    {offLabel}
                </span>
                <button
                    type="button"
                    className={trackClasses}
                    onClick={(e) => {
                        if (!disabled) {
                            const syntheticEvent = {
                                ...e,
                                target: { ...e.target, checked: !checked },
                            } as any;
                            handleChange(syntheticEvent);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    aria-checked={checked}
                    aria-labelledby={`${inputId}-label`}
                    role="switch"
                >
                    <input
                        ref={ref}
                        id={inputId}
                        type="checkbox"
                        checked={checked}
                        onChange={handleChange}
                        required={required}
                        disabled={disabled}
                        className="eui-input-switch-native"
                    />
                    <span className={thumbClasses} />
                </button>
                <span
                    id={`${inputId}-label`}
                    className={classNames('eui-input-switch-label', { 'eui-input-switch-label-muted': disabled || !checked })}
                >
                    {onLabel}
                </span>
            </div>
        );
    },
);
