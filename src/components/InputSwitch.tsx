import classNames from 'classnames';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { BaseComponentProps, ComponentEvent } from '../types';
import { generateId, getComponentClasses, getResolvedSize, splitBaseAndNativeProps } from '../utils';
import './eui-base.scss';
import './InputSwitch.scss';

interface InputSwitchProps extends BaseComponentProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'type'> {
    checked?: boolean;
    onChange?: (event: ComponentEvent<boolean>) => void;
    onLabel?: string;
    offLabel?: string;
    label?: string;
    ariaLabel?: string;
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
            label,
            ariaLabel,
            required = false,
            id,
            disabled = false,
            className,
            name,
            args,
            ...rest
        },
        ref,
    ) => {
        const { styleProps: baseProps, nativeProps } = splitBaseAndNativeProps(rest);
        const [inputId] = useState(id || generateId());
        const innerRef = useRef<HTMLInputElement | null>(null);
        useImperativeHandle(ref, () => innerRef.current as HTMLInputElement, []);

        const resolvedSize = getResolvedSize({ ...baseProps });

        const triggerToggle = (e: React.SyntheticEvent) => {
            if (disabled) return;
            const next = !checked;
            if (innerRef.current) {
                innerRef.current.checked = next;
            }
            if (onChange) {
                onChange({
                    event: e,
                    value: next,
                    name,
                    args,
                });
            }
        };

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

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            triggerToggle(e);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                triggerToggle(e);
            }
        };

        const containerClasses = getComponentClasses(
            { ...baseProps, disabled },
            classNames(
                'eui-input-switch',
                `eui-input-switch-${resolvedSize}`,
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

        const accessibleLabel = ariaLabel || label;
        const labelId = label ? `${inputId}-label` : undefined;

        return (
            <div className={containerClasses}>
                <input
                    ref={innerRef}
                    id={inputId}
                    type="checkbox"
                    checked={checked}
                    onChange={handleChange}
                    required={required}
                    disabled={disabled}
                    name={name}
                    className="eui-input-switch-native"
                    aria-hidden="true"
                    tabIndex={-1}
                />
                {label && (
                    <span id={labelId} className={classNames('eui-input-switch-text-label', { 'eui-input-switch-text-label-disabled': disabled })}>
                        {label}
                    </span>
                )}
                <span className={classNames('eui-input-switch-label', { 'eui-input-switch-label-muted': disabled || checked })}>
                    {offLabel}
                </span>
                <button
                    {...nativeProps}
                    type="button"
                    className={trackClasses}
                    onClick={(e) => {
                        nativeProps.onClick?.(e as any);
                        handleClick(e);
                    }}
                    onKeyDown={(e) => {
                        nativeProps.onKeyDown?.(e as any);
                        handleKeyDown(e);
                    }}
                    disabled={disabled}
                    aria-checked={checked}
                    aria-label={!accessibleLabel ? `Toggle ${checked ? 'off' : 'on'}` : accessibleLabel}
                    aria-labelledby={accessibleLabel ? undefined : labelId}
                    role="switch"
                >
                    <span className={thumbClasses} aria-hidden="true" />
                </button>
                <span
                    className={classNames('eui-input-switch-label', { 'eui-input-switch-label-muted': disabled || !checked })}
                >
                    {onLabel}
                </span>
            </div>
        );
    },
);
