import classNames from 'classnames';
import React, { forwardRef, useState } from 'react';
import { BaseComponentProps, ButtonVariant, ComponentEvent } from '../types';
import { generateId, getComponentClasses, getComponentStyles, getResolvedSize, splitBaseAndNativeProps } from '../utils';
import './eui-base.scss';
import './ToggleButton.scss';

interface ToggleButtonProps extends BaseComponentProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    checked?: boolean;
    onChange?: (event: ComponentEvent<boolean>) => void;
    onLabel?: string;
    offLabel?: string;
    id?: string;
    variant?: ButtonVariant;
    label?: string;
    ariaLabel?: string;
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
    (
        {
            checked = false,
            onChange,
            onLabel = 'On',
            offLabel = 'Off',
            id,
            disabled = false,
            className,
            name,
            args,
            label,
            ariaLabel,
            ...rest
        },
        ref,
    ) => {
        const { styleProps: baseProps, nativeProps } = splitBaseAndNativeProps(rest);
        const [inputId] = useState(id || generateId());
        const labelId = label ? `${inputId}-label` : undefined;

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (onChange) {
                onChange({
                    event: e,
                    value: !checked,
                    name,
                    args,
                });
            }
        };

        const resolvedSize = getResolvedSize({ ...baseProps });
        const buttonClasses = getComponentClasses(
            { ...baseProps, disabled },
            classNames(
                'eui-toggle-button',
                `eui-toggle-button-${resolvedSize}`,
                {
                    'eui-toggle-button-checked': checked,
                    'eui-toggle-button-disabled': disabled,
                },
                className,
            ),
        );

        const componentStyles = getComponentStyles({ ...baseProps, disabled });
        delete componentStyles.padding;
        delete componentStyles.height;
        delete componentStyles.fontSize;

        const accessibleLabel = ariaLabel || (label ? undefined : `${checked ? onLabel : offLabel}`);

        return (
            <span className="eui-toggle-button-wrap">
                {label && (
                    <span id={labelId} className="eui-toggle-button-label">
                        {label}
                    </span>
                )}
                <button
                    {...nativeProps}
                    ref={ref}
                    id={inputId}
                    type="button"
                    onClick={(e) => {
                        nativeProps.onClick?.(e);
                        handleClick(e);
                    }}
                    disabled={disabled}
                    className={buttonClasses}
                    style={{ ...nativeProps.style, ...componentStyles }}
                    aria-pressed={checked}
                    aria-label={accessibleLabel}
                    aria-labelledby={labelId}
                >
                    {checked ? onLabel : offLabel}
                </button>
                <input type="hidden" name={name} value={checked.toString()} />
            </span>
        );
    },
);
