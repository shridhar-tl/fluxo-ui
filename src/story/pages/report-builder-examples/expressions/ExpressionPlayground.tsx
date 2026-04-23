import React, { useEffect, useMemo, useState } from 'react';
import { CodeBlock } from '../../../CodeBlock';
import { ExpressionEditor } from '../../../../components/report-builder/expression/ExpressionEditor';
import { evaluateExpression } from '../../../../components/report-builder/expression/expression-parser';
import type { ExpressionTypeContext } from '../../../../components/report-builder/expression/expression-types';
import { employees, orders } from '../../report-builder/example-data';

const datasets = {
    orders: orders as unknown as Record<string, unknown>[],
    employees: employees as unknown as Record<string, unknown>[],
};

const parameters: Record<string, unknown> = {
    region: 'North',
    minRevenue: 500,
    statuses: ['paid', 'shipped'],
    today: new Date().toISOString().slice(0, 10),
};

const variables: Record<string, unknown> = {
    selectedOrder: { id: 'ORD-1042', revenue: 1850, region: 'North' },
    selectedEmployee: null,
};

const builtInFields: Record<string, unknown> = {
    CurrentUser: { id: 'user-42', name: 'Ada Lovelace', role: 'Analyst' },
    Tenant: { id: 'acme', name: 'Acme Corp' },
    Env: 'production',
};

const typeContext: ExpressionTypeContext = {
    availableDatasources: {
        orders: ['id', 'region', 'country', 'category', 'product', 'revenue', 'cost', 'units', 'status', 'orderDate'],
        employees: ['id', 'name', 'department', 'level', 'salary', 'hireDate', 'active'],
    },
    availableParameters: Object.keys(parameters),
    availableVariables: Object.keys(variables),
    availableBuiltInFields: Object.keys(builtInFields),
};

const presets: Array<{ label: string; expression: string }> = [
    { label: 'Sum revenue', expression: "Sum(Datasources.orders, 'revenue')" },
    { label: 'Currency format', expression: "FormatCurrency(Sum(Datasources.orders, 'revenue'), '$', 0)" },
    { label: 'Avg performance', expression: "Round(Avg(Datasources.employees, 'performance'), 2)" },
    { label: 'IIf conditional', expression: "IIf(Parameters.minRevenue > 0, Concat('over $', Parameters.minRevenue), 'no filter')" },
    { label: 'InList filter', expression: "InList('paid', Parameters.statuses)" },
    { label: 'Variable path', expression: 'Variables.selectedOrder.revenue' },
    { label: 'Built-in field', expression: 'BuiltInFields.CurrentUser.name' },
    { label: 'Today()', expression: 'Today()' },
    { label: 'IIf + Env', expression: "IIf(BuiltInFields.Env == 'production', 'PROD', 'DEV')" },
];

const defaultExpression = "FormatCurrency(Sum(Datasources.orders, 'revenue'), '$', 0)";

export const ExpressionPlayground: React.FC = () => {
    const [expr, setExpr] = useState(defaultExpression);
    const [result, setResult] = useState<{ value: unknown; error: string | null } | null>(null);
    const [evaluating, setEvaluating] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setEvaluating(true);
        evaluateExpression(expr, { datasources: datasets, parameters, variables, builtInFields }).then((r) => {
            if (!cancelled) {
                setResult({ value: r.result, error: r.error });
                setEvaluating(false);
            }
        });
        return () => { cancelled = true; };
    }, [expr]);

    const resultText = useMemo(() => {
        if (!result) return '—';
        if (result.error) return `ERROR: ${result.error}`;
        if (result.value === undefined) return 'undefined';
        if (result.value === null) return 'null';
        if (typeof result.value === 'object') return JSON.stringify(result.value, null, 2);
        return String(result.value);
    }, [result]);

    const contextSnippet = useMemo(() => JSON.stringify({
        datasources: { orders: '[80 orders]', employees: '[48 employees]' },
        parameters,
        variables,
        builtInFields,
    }, null, 2), []);

    return (
        <div
            style={{
                border: '1px solid var(--eui-border-subtle)',
                borderRadius: 8,
                overflow: 'hidden',
                background: 'var(--eui-bg)',
            }}
        >
            <div style={{ padding: '12px 16px', background: 'var(--eui-bg-subtle)', borderBottom: '1px solid var(--eui-border-subtle)' }}>
                <h3 style={{ margin: 0, color: 'var(--eui-text)', fontSize: 16, fontWeight: 600 }}>
                    Expression Playground
                </h3>
                <p style={{ margin: '4px 0 0', color: 'var(--eui-text-muted)', fontSize: 13 }}>
                    Type an expression (no leading <code>=</code> needed). Syntax highlighting and completions mirror what
                    the props panels give you inside the builder. Result updates on every keystroke.
                </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 16px', borderBottom: '1px solid var(--eui-border-subtle)' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', alignSelf: 'center' }}>Presets:</span>
                {presets.map((p) => (
                    <button
                        key={p.label}
                        type="button"
                        onClick={() => setExpr(p.expression)}
                        style={{
                            fontSize: 11,
                            padding: '4px 10px',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 999,
                            background: 'var(--eui-bg)',
                            color: 'var(--eui-text)',
                            cursor: 'pointer',
                        }}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ExpressionEditor
                    value={expr}
                    onChange={setExpr}
                    typeContext={typeContext}
                    expectedReturnType="any"
                    multiline
                    aria-label="Expression"
                />
                <div
                    style={{
                        padding: '10px 12px',
                        background: 'var(--eui-bg-subtle)',
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 6,
                        fontFamily: 'Menlo, Consolas, monospace',
                        fontSize: 13,
                        color: 'var(--eui-text)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        minHeight: 42,
                    }}
                >
                    <div style={{ fontFamily: 'inherit', fontSize: 11, color: 'var(--eui-text-muted)', marginBottom: 4 }}>
                        {evaluating ? 'Evaluating…' : (result?.error ? 'Error' : 'Result')}
                    </div>
                    <div style={{ color: result?.error ? '#ef4444' : 'var(--eui-text)' }}>{resultText}</div>
                </div>
            </div>

            <details style={{ padding: '10px 16px 16px', borderTop: '1px solid var(--eui-border-subtle)' }}>
                <summary style={{ fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--eui-text)' }}>
                    Evaluation context (the maps that <code>Datasources.*</code>, <code>Parameters.*</code>,{' '}
                    <code>Variables.*</code>, and <code>BuiltInFields.*</code> draw from)
                </summary>
                <div style={{ marginTop: 8 }}>
                    <CodeBlock code={contextSnippet} language="json" />
                </div>
            </details>
        </div>
    );
};
