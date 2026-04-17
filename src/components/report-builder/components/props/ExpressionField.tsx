import classNames from 'classnames';
import React, { useState } from 'react';
import { ExpressionEditor } from '../../expression/ExpressionEditor';
import type { ExpressionTypeContext, ExpressionReturnType } from '../../expression/expression-types';

interface ExpressionFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    expectedReturnType?: ExpressionReturnType;
    typeContext?: ExpressionTypeContext;
    multiline?: boolean;
    inputType?: 'text' | 'number' | 'color';
}

export const ExpressionField: React.FC<ExpressionFieldProps> = ({
    label,
    value,
    onChange,
    placeholder,
    expectedReturnType,
    typeContext,
    multiline = false,
    inputType = 'text',
}) => {
    const [exprMode, setExprMode] = useState(() => value.trim().startsWith('='));

    const handleToggle = () => {
        const next = !exprMode;
        setExprMode(next);
        if (next && !value.startsWith('=')) {
            onChange(`=${value}`);
        } else if (!next && value.startsWith('=')) {
            onChange(value.slice(1));
        }
    };

    const fieldId = React.useId();

    return (
        <div className="eui-rb-prop-field">
            <div className="eui-rb-prop-field-label-row">
                <label htmlFor={fieldId} className="eui-rb-prop-field-label">{label}</label>
                <button
                    className={classNames('eui-rb-expr-toggle', { active: exprMode })}
                    onClick={handleToggle}
                    title={exprMode ? 'Switch to static value' : 'Switch to expression'}
                    aria-label={exprMode ? 'Use static value' : 'Use expression'}
                    type="button"
                >
                    fx
                </button>
            </div>
            {exprMode ? (
                <ExpressionEditor
                    id={fieldId}
                    value={value.startsWith('=') ? value.slice(1) : value}
                    onChange={(v) => onChange(`=${v}`)}
                    expectedReturnType={expectedReturnType}
                    typeContext={typeContext}
                    placeholder={placeholder}
                    multiline={multiline}
                    aria-label={label}
                />
            ) : (
                inputType === 'color' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                            id={fieldId}
                            type="color"
                            value={value || '#000000'}
                            onChange={(e) => onChange(e.target.value)}
                            style={{ width: 32, height: 28, border: '1px solid var(--eui-border-subtle)', borderRadius: 3, cursor: 'pointer', padding: 1, background: 'var(--eui-input-bg)' }}
                            aria-label={label}
                        />
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={placeholder ?? '#000000'}
                            className="eui-rb-prop-input"
                            style={{ flex: 1 }}
                            aria-label={`${label} hex`}
                        />
                    </div>
                ) : inputType === 'number' ? (
                    <input
                        id={fieldId}
                        type="number"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="eui-rb-prop-input"
                    />
                ) : multiline ? (
                    <textarea
                        id={fieldId}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="eui-rb-prop-input"
                        rows={3}
                        style={{ resize: 'vertical' }}
                    />
                ) : (
                    <input
                        id={fieldId}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="eui-rb-prop-input"
                    />
                )
            )}
        </div>
    );
};
