import classNames from 'classnames';
import React, { forwardRef, useState } from 'react';
import { BaseComponentProps, ButtonVariant, ComponentEvent } from '../types';
import { generateId, getComponentClasses, getComponentStyles, getResolvedSize } from '../utils';
import './ToggleButton.scss';

interface ToggleButtonProps extends BaseComponentProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    checked?: boolean;
    onChange?: (event: ComponentEvent<boolean>) => void;
    onLabel?: string;
    offLabel?: string;
    id?: string;
    variant?: ButtonVariant;
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
    ({ checked = false, onChange, onLabel = 'On', offLabel = 'Off', id, disabled = false, className, name, args, ...baseProps }, ref) => {
        const [inputId] = useState(id || generateId());

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

        return (
            <button
                ref={ref}
                id={inputId}
                type="button"
                onClick={handleClick}
                disabled={disabled}
                className={buttonClasses}
                style={componentStyles}
                aria-pressed={checked}
                aria-label={`Toggle button: ${checked ? onLabel : offLabel}`}
            >
                {checked ? onLabel : offLabel}
                <input type="hidden" name={name} value={checked.toString()} />
            </button>
        );
    },
);
