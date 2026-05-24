import classNames from 'classnames';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { BaseComponentProps, ComponentEvent } from '../types';
import { generateId, getComponentClasses, getResolvedSize, splitBaseAndNativeProps, splitVisibleAndHiddenProps } from '../utils';
import './eui-base.scss';
import './Checkbox.scss';

interface CheckboxProps extends BaseComponentProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'type' | 'children'> {
    checked?: boolean;
    onChange?: (event: ComponentEvent<boolean>) => void;
    label?: React.ReactNode;
    children?: React.ReactNode;
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
            children,
            indeterminate = false,
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
        const { visibleProps, hiddenInputProps } = splitVisibleAndHiddenProps(nativeProps);
        const [inputId] = useState(id || name || generateId());
        const innerRef = useRef<HTMLInputElement | null>(null);

        useImperativeHandle(ref, () => innerRef.current as HTMLInputElement, []);

        useEffect(() => {
            if (innerRef.current) {
                innerRef.current.indeterminate = indeterminate;
            }
        }, [indeterminate]);

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

        const resolvedSize = getResolvedSize({ ...baseProps });

        const containerClasses = getComponentClasses(
            { ...baseProps, disabled },
            classNames(
                'eui-checkbox',
                `eui-checkbox-${resolvedSize}`,
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
                    {...hiddenInputProps}
                    ref={innerRef}
                    id={inputId}
                    name={name}
                    type="checkbox"
                    checked={checked}
                    onChange={handleChange}
                    required={required}
                    disabled={disabled}
                    className="eui-checkbox-native"
                    aria-checked={indeterminate ? 'mixed' : checked}
                    aria-required={required || undefined}
                />
                <div className={boxClasses} aria-hidden="true">
                    {indeterminate ? renderIntermediateIcon() : renderCheckIcon(checked)}
                </div>
            </div>
        );

        const labelContent = children ?? label;

        if (labelContent === undefined || labelContent === null || labelContent === '') {
            return (
                <label {...visibleProps} className={containerClasses} htmlFor={inputId}>
                    {checkbox}
                </label>
            );
        }

        return (
            <label {...visibleProps} className={containerClasses} htmlFor={inputId}>
                {checkbox}
                <span
                    className={classNames('eui-checkbox-label', {
                        'eui-checkbox-label-disabled': disabled,
                    })}
                >
                    {labelContent}
                </span>
            </label>
        );
    },
);

const renderIntermediateIcon = () => {
    return (
        <svg fill="white" viewBox="0 0 16 16" aria-hidden="true">
            <rect x="3" y="7" width="10" height="2" rx="1" />
        </svg>
    );
};

const renderCheckIcon = (checked: boolean) => {
    if (checked) {
        return (
            <svg fill="white" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
            </svg>
        );
    }

    return null;
};
