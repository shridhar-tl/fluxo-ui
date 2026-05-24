import classNames from 'classnames';
import React, { ReactNode, useEffect, useState } from 'react';
import { BaseComponentProps } from '../types';
import { generateId } from '../utils';
import './eui-base.scss';
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

const isReactElement = (node: unknown): node is React.ReactElement => React.isValidElement(node);

const cloneChildWithIds = (
    child: ReactNode,
    fieldId: string,
    describedBy: string | undefined,
    invalid: boolean,
): ReactNode => {
    if (!isReactElement(child)) return child;
    const childProps = child.props as Record<string, unknown>;
    const nextProps: Record<string, unknown> = {};
    if (!childProps.id) {
        nextProps.id = fieldId;
    }
    if (describedBy) {
        nextProps['aria-describedby'] = [childProps['aria-describedby'], describedBy].filter(Boolean).join(' ');
    }
    if (invalid && childProps['aria-invalid'] === undefined) {
        nextProps['aria-invalid'] = 'true';
    }
    if (Object.keys(nextProps).length === 0) {
        return child;
    }
    return React.cloneElement(child, nextProps);
};

const hasInitialValue = (child: ReactNode): boolean => {
    if (!isReactElement(child)) return false;
    const childProps = child.props as Record<string, unknown>;
    const v = childProps.value ?? childProps.defaultValue;
    if (v === undefined || v === null) return false;
    if (typeof v === 'string') return v.length > 0;
    if (typeof v === 'number') return true;
    return false;
};

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
    const labelHtmlFor = htmlFor || fieldId;
    const errorId = error ? `${fieldId}-error` : undefined;
    const hintId = hint && !error ? `${fieldId}-hint` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState<boolean>(() => hasInitialValue(children));

    useEffect(() => {
        setHasValue(hasInitialValue(children));
    }, [children]);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent) => {
        setIsFocused(false);
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        setHasValue(!!target.value);
    };

    const enhancedChildren = React.Children.map(children, (child) =>
        cloneChildWithIds(child, fieldId, describedBy, !!error),
    );

    const renderDefaultLabel = () => (
        <div className={classNames('eui-field-label-wrap', className)}>
            {label && (
                <label
                    htmlFor={labelHtmlFor}
                    className={classNames('eui-field-label', {
                        'eui-field-label-disabled': disabled,
                        'eui-field-label-error': !!error,
                    })}
                >
                    {label}
                    {required && (
                        <span className="eui-field-label-required" aria-label="required">
                            *
                        </span>
                    )}
                    {optional && !required && <span className="eui-field-label-optional">(Optional)</span>}
                </label>
            )}
            <div onFocus={handleFocus} onBlur={handleBlur}>
                {enhancedChildren}
            </div>
            {hint && !error && (
                <p id={hintId} className="eui-field-hint">
                    {hint}
                </p>
            )}
            {error && (
                <p id={errorId} className="eui-field-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );

    const renderFloatLabel = () => (
        <div className={classNames('eui-field-label-float', className)}>
            <div onFocus={handleFocus} onBlur={handleBlur}>
                {enhancedChildren}
            </div>
            {label && (
                <label
                    htmlFor={labelHtmlFor}
                    className={classNames('eui-field-label-floating', {
                        'eui-field-label-floating-idle': !isFocused && !hasValue && !error,
                        'eui-field-label-floating-active': (isFocused || hasValue) && !error,
                        'eui-field-label-floating-error': !!error,
                        'eui-field-label-floating-disabled': disabled,
                    })}
                >
                    {label}
                    {required && (
                        <span className="eui-field-label-required" aria-label="required">
                            *
                        </span>
                    )}
                    {optional && !required && <span className="eui-field-label-optional">(Optional)</span>}
                </label>
            )}
            {hint && !error && (
                <p id={hintId} className="eui-field-hint" style={{ marginTop: '0.25rem' }}>
                    {hint}
                </p>
            )}
            {error && (
                <p id={errorId} className="eui-field-error" style={{ marginTop: '0.25rem' }} role="alert">
                    {error}
                </p>
            )}
        </div>
    );

    const renderFieldsetLabel = () => (
        <fieldset id={fieldId} className={classNames('eui-field-label-fieldset', className)} aria-describedby={describedBy} aria-invalid={error ? 'true' : undefined}>
            {label && (
                <legend
                    className={classNames('eui-field-label-legend', {
                        'eui-field-label-legend-disabled': disabled,
                        'eui-field-label-legend-error': !!error,
                    })}
                >
                    {label}
                    {required && (
                        <span className="eui-field-label-required" aria-label="required">
                            *
                        </span>
                    )}
                    {optional && !required && <span className="eui-field-label-optional">(Optional)</span>}
                </legend>
            )}
            <div onFocus={handleFocus} onBlur={handleBlur}>
                {children}
            </div>
            {hint && !error && (
                <p id={hintId} className="eui-field-hint" style={{ marginTop: '0.25rem' }}>
                    {hint}
                </p>
            )}
            {error && (
                <p id={errorId} className="eui-field-error" style={{ marginTop: '0.25rem' }} role="alert">
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
