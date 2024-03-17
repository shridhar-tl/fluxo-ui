import classNames from 'classnames';
import React, { forwardRef, useState } from 'react';
import { BaseComponentProps, ComponentEvent } from '../types';
import { getComponentClasses } from '../utils';
import './Checkbox.scss';

interface CheckboxProps extends BaseComponentProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'type'> {
    checked?: boolean;
    onChange?: (event: ComponentEvent<boolean>) => void;
    label?: string;
    indeterminate?: boolean;
    required?: boolean;
    id?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    (
        {
            checked = false,
            onChange,
            label,
            indeterminate = false,
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
        const [inputId] = useState(id || name);

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

        const containerClasses = getComponentClasses(
            { ...baseProps, disabled },
            classNames(
                'eui-checkbox',
                {
                    'eui-checkbox-disabled': disabled,
                },
                className,
            ),
        );

        const boxClasses = classNames('eui-checkbox-box', {
            'eui-checkbox-box-checked': checked && !indeterminate,
            'eui-checkbox-box-indeterminate': indeterminate,
            'eui-checkbox-box-unchecked': !checked && !indeterminate,
            'eui-checkbox-box-disabled': disabled,
        });

        const checkbox = (
            <div className="eui-checkbox-input-wrapper">
                <input
                    ref={ref}
                    id={inputId}
                    type="checkbox"
                    checked={checked}
                    onChange={handleChange}
                    required={required}
                    disabled={disabled}
                    className="eui-checkbox-native"
                    aria-describedby={label ? `${inputId}-label` : undefined}
                />
                <div className={boxClasses}>{indeterminate ? renderIntermediateIcon() : renderCheckIcon(checked)}</div>
            </div>
        );

        if (!label) {
            return (
                <label className={containerClasses} htmlFor={inputId}>
                    {checkbox}
                </label>
            );
        }

        return (
            <label className={containerClasses} htmlFor={inputId}>
                {checkbox}
                <span
                    id={`${inputId}-label`}
                    className={classNames('eui-checkbox-label', {
                        'eui-checkbox-label-disabled': disabled,
                    })}
                >
                    {label}
                </span>
            </label>
        );
    },
);

const renderIntermediateIcon = () => {
    return (
        <svg fill="white" viewBox="0 0 16 16">
            <rect x="3" y="7" width="10" height="2" rx="1" />
        </svg>
    );
};

const renderCheckIcon = (checked: boolean) => {
    if (checked) {
        return (
            <svg fill="white" viewBox="0 0 16 16">
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
            </svg>
        );
    }

    return null;
};
