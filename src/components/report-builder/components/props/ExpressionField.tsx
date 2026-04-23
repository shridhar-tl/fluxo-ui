import classNames from 'classnames';
import React, { useContext, useMemo, useState } from 'react';
import { ExpressionEditor } from '../../expression/ExpressionEditor';
import type { ExpressionTypeContext, ExpressionReturnType } from '../../expression/expression-types';
import { ReportBuilderContext } from '../../report-builder-context';
import type { ReportComponent, ReportDefinition } from '../../report-definition-types';

function collectComponentVariableNames(components: ReportComponent[], out: string[] = []): string[] {
    for (const c of components) {
        if (c.variables) {
            for (const v of c.variables) out.push(v.name);
        }
        if (c.children) collectComponentVariableNames(c.children, out);
    }
    return out;
}

function useBuilderTypeContext(
    override: ExpressionTypeContext | undefined,
): ExpressionTypeContext | undefined {
    const ctx = useContext(ReportBuilderContext);
    const [definition, setDefinition] = React.useState<ReportDefinition | null>(
        () => ctx?.store.getState().definition ?? null,
    );
    React.useEffect(() => {
        if (!ctx) return;
        const handler = () => setDefinition(ctx.store.getState().definition);
        handler();
        return ctx.store.on('change', handler);
    }, [ctx]);

    const availableBuiltInFields = useMemo(
        () => (ctx ? ctx.builtInFields.map((f) => f.name) : undefined),
        [ctx],
    );

    return useMemo<ExpressionTypeContext | undefined>(() => {
        if (!definition) return override;
        const availableParameters = definition.parameters.map((p) => p.name);
        const availableVariables = [
            ...definition.variables.map((v) => v.name),
            ...collectComponentVariableNames(definition.components),
        ];
        const availableDatasources: Record<string, string[]> = {};
        for (const d of definition.datasources) availableDatasources[d.name] = [];
        return {
            ...override,
            availableParameters: override?.availableParameters ?? availableParameters,
            availableVariables: override?.availableVariables ?? availableVariables,
            availableBuiltInFields: override?.availableBuiltInFields ?? availableBuiltInFields,
            availableDatasources: override?.availableDatasources ?? availableDatasources,
        };
    }, [definition, override, availableBuiltInFields]);
}

interface ExpressionFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    expectedReturnType?: ExpressionReturnType;
    typeContext?: ExpressionTypeContext;
    multiline?: boolean;
    inputType?: 'text' | 'number' | 'color';
    /** Hint text shown under the field. */
    hint?: string;
    /** Numeric-only: value bounds. */
    min?: number;
    max?: number;
    step?: number;
    /** Optional datalist for quick suggestions (e.g. field names). */
    suggestions?: string[];
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
    hint,
    min,
    max,
    step,
    suggestions,
}) => {
    const [exprMode, setExprMode] = useState(() => value.trim().startsWith('='));
    const mergedTypeContext = useBuilderTypeContext(typeContext);

    const handleToggle = () => {
        const next = !exprMode;
        setExprMode(next);
        if (next && !value.startsWith('=')) {
            onChange(`=${value}`);
        } else if (!next && value.startsWith('=')) {
            onChange(value.slice(1));
        }
    };

    const reactId = React.useId();
    const fieldId = reactId;
    const listId = suggestions && suggestions.length > 0 ? `${reactId}-list` : undefined;

    return (
        <div className="eui-rb-prop-field">
            {label && (
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
            )}
            {exprMode ? (
                <ExpressionEditor
                    id={fieldId}
                    value={value.startsWith('=') ? value.slice(1) : value}
                    onChange={(v) => onChange(`=${v}`)}
                    expectedReturnType={expectedReturnType}
                    typeContext={mergedTypeContext}
                    placeholder={placeholder}
                    multiline={multiline}
                    aria-label={label}
                />
            ) : inputType === 'color' ? (
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
                    min={min}
                    max={max}
                    step={step}
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
                <>
                    <input
                        id={fieldId}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="eui-rb-prop-input"
                        list={listId}
                    />
                    {listId && suggestions && (
                        <datalist id={listId}>
                            {suggestions.map((s) => <option key={s} value={s} />)}
                        </datalist>
                    )}
                </>
            )}
            {hint && (
                <div style={{ fontSize: 10, color: 'var(--eui-text-muted)', marginTop: 2 }}>{hint}</div>
            )}
        </div>
    );
};
