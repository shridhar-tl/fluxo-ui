import classNames from 'classnames';
import React, { ReactNode, useState } from 'react';
import { BaseComponentProps } from '../types';
import { generateId } from '../utils';
import './FieldLabel.scss';

interface FieldLabelProps extends BaseComponentProps {
    children: ReactNode;
    label?: string;
    required?: boolean;
    optional?: boolean;
    error?: string;
    hint?: string;
    labelType?: 'default' | 'float' | 'fieldset';
    htmlFor?: string;
    id?: string;
}

export const FieldLabel: React.FC<FieldLabelProps> = ({
    children,
    label,
    required = false,
    optional = false,
    error,
    hint,
    labelType = 'default',
    htmlFor,
    id,
    className,
    disabled = false,
}) => {
    const [fieldId] = useState(id || generateId());
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent) => {
        setIsFocused(false);
        const target = e.target as HTMLInputElement;
        setHasValue(!!target.value);
    };

    const renderDefaultLabel = () => (
        <div className={classNames('eui-field-label-wrap', className)}>
            {label && (
                <label
                    htmlFor={htmlFor || fieldId}
                    className={classNames('eui-field-label', {
                        'eui-field-label-disabled': disabled,
                        'eui-field-label-error': !!error,
                    })}
                >
                    {label}
                    {required && <span className="eui-field-label-required">*</span>}
                    {optional && !required && <span className="eui-field-label-optional">(Optional)</span>}
                </label>
            )}
            <div onFocus={handleFocus} onBlur={handleBlur}>
                {children}
            </div>
            {hint && !error && <p className="eui-field-hint">{hint}</p>}
            {error && (
                <p className="eui-field-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );

    const renderFloatLabel = () => (
        <div className={classNames('eui-field-label-float', className)}>
            <div onFocus={handleFocus} onBlur={handleBlur}>
                {children}
            </div>
            {label && (
                <label
                    htmlFor={htmlFor || fieldId}
                    className={classNames('eui-field-label-floating', {
                        'eui-field-label-floating-idle': !isFocused && !hasValue && !error,
                        'eui-field-label-floating-active': (isFocused || hasValue) && !error,
                        'eui-field-label-floating-error': !!error,
                        'eui-field-label-floating-disabled': disabled,
                    })}
                >
                    {label}
                    {required && <span className="eui-field-label-required">*</span>}
                    {optional && !required && <span className="eui-field-label-optional">(Optional)</span>}
                </label>
            )}
            {hint && !error && (
                <p className="eui-field-hint" style={{ marginTop: '0.25rem' }}>
                    {hint}
                </p>
            )}
            {error && (
                <p className="eui-field-error" style={{ marginTop: '0.25rem' }} role="alert">
                    {error}
                </p>
            )}
        </div>
    );

    const renderFieldsetLabel = () => (
        <fieldset className={classNames('eui-field-label-fieldset', className)}>
            {label && (
                <legend
                    className={classNames('eui-field-label-legend', {
                        'eui-field-label-legend-disabled': disabled,
                        'eui-field-label-legend-error': !!error,
                    })}
                >
                    {label}
                    {required && <span className="eui-field-label-required">*</span>}
                    {optional && !required && <span className="eui-field-label-optional">(Optional)</span>}
                </legend>
            )}
            <div onFocus={handleFocus} onBlur={handleBlur}>
                {children}
            </div>
            {hint && !error && (
                <p className="eui-field-hint" style={{ marginTop: '0.25rem' }}>
                    {hint}
                </p>
            )}
            {error && (
                <p className="eui-field-error" style={{ marginTop: '0.25rem' }} role="alert">
                    {error}
                </p>
            )}
        </fieldset>
    );

    switch (labelType) {
        case 'float':
            return renderFloatLabel();
        case 'fieldset':
            return renderFieldsetLabel();
        default:
            return renderDefaultLabel();
    }
};
