import React, { useState } from 'react';
import { ReportViewer, type ReportDefinition, createEmptyDefinition } from '../../../../components/report-builder';
import { CodeBlock } from '../../../CodeBlock';
import { orders } from '../example-data';
import { sampleDatasourcePlugins } from '../report-builder-story-data';
import type { ExpressionHighlight } from './ExampleShowcase';

const definition: ReportDefinition = (() => {
    const base = createEmptyDefinition('Order List');
    const def: ReportDefinition = {
        ...base,
        parameters: [
            {
                id: 'p-highThreshold',
                name: 'highThreshold',
                type: 'numeric',
                label: 'High revenue threshold',
                mandatory: false,
                typeConfig: { min: 0, step: 500 },
                defaultValue: 3000,
                width: 0.5,
            },
        ],
        variables: [
            {
                id: 'v-selectedOrder',
                name: 'selectedOrder',
                scope: 'global',
                description: 'Receives the row id when a user clicks an Order ID cell.',
            },
        ],
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        components: [
            {
                id: 'hdr',
                type: 'header',
                props: { level: 'h2', content: 'Order List' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'sub',
                type: 'text',
                props: {
                    content:
                        'Each row mixes a drillable Order ID, status badge (via cell items), an external tracking link, a progress indicator, and a ★ flag for high-revenue rows.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 12 },
            },
            {
                id: 'tbl',
                type: 'table',
                props: {
                    datasourceId: 'ds-orders',
                    columns: [
                        {
                            id: 'c-id',
                            field: 'id',
                            label: 'Order ID',
                            width: '140px',
                            cellItems: [
                                {
                                    id: 'ci-id',
                                    type: 'field',
                                    fieldPath: 'id',
                                    clickAction: 'drill',
                                    drillVariable: 'selectedOrder',
                                    drillValueExpr: 'Field.id',
                                    style: { fontWeight: 'bold' },
                                },
                            ],
                        },
                        {
                            id: 'c-product',
                            field: 'product',
                            label: 'Product',
                        },
                        {
                            id: 'c-status',
                            field: 'status',
                            label: 'Status',
                            width: '160px',
                            cellItems: [
                                {
                                    id: 'ci-status',
                                    type: 'expression',
                                    expression:
                                        "Concat(Upper(Mid(Field.status, 1, 1)), Mid(Field.status, 2, Length(Field.status) - 1))",
                                    style: {
                                        fontWeight: 'bold',
                                        paddingLeft: 6,
                                        paddingRight: 6,
                                    },
                                },
                                {
                                    id: 'ci-badge',
                                    type: 'expression',
                                    expression:
                                        "IIf(Field.status == 'paid', '✓', IIf(Field.status == 'cancelled', '✕', IIf(Field.status == 'refunded', '↶', '…')))",
                                },
                            ],
                            conditionalFormats: [
                                { id: 'cf-paid', expression: "Field.status == 'paid'", backgroundColor: '#dcfce7', textColor: '#166534' },
                                { id: 'cf-cancel', expression: "Field.status == 'cancelled'", backgroundColor: '#fee2e2', textColor: '#991b1b' },
                                { id: 'cf-refund', expression: "Field.status == 'refunded'", backgroundColor: '#fef3c7', textColor: '#92400e' },
                                { id: 'cf-pending', expression: "Field.status == 'pending'", backgroundColor: '#e0e7ff', textColor: '#3730a3' },
                            ],
                        },
                        {
                            id: 'c-rev',
                            field: 'revenue',
                            label: 'Revenue',
                            align: 'right',
                            width: '120px',
                            formatExpr: "FormatCurrency(Field.revenue, '$', 0)",
                            conditionalFormats: [
                                {
                                    id: 'cf-high',
                                    expression: 'Field.revenue >= Parameters.highThreshold',
                                    backgroundColor: '#ecfdf5',
                                    textColor: '#047857',
                                    fontWeight: 'bold',
                                },
                            ],
                        },
                        {
                            id: 'c-flag',
                            field: 'flag',
                            label: 'Flag',
                            align: 'center',
                            width: '80px',
                            cellItems: [
                                {
                                    id: 'ci-flag',
                                    type: 'expression',
                                    expression: "IIf(Field.revenue >= Parameters.highThreshold, '★', '')",
                                    style: { fontWeight: 'bold', textColor: '#f59e0b' },
                                },
                            ],
                        },
                        {
                            id: 'c-track',
                            field: 'track',
                            label: 'Tracking',
                            width: '160px',
                            cellItems: [
                                {
                                    id: 'ci-link',
                                    type: 'text',
                                    text: 'Track →',
                                    clickAction: 'link',
                                    href: "=Concat('https://example.com/track/', Field.id)",
                                },
                            ],
                        },
                    ],
                    enableSorting: true,
                },
                styles: {},
            },
            {
                id: 'txt-footer',
                type: 'text',
                props: {
                    content:
                        'Click an Order ID to drill through — the "Selected Order" parameter at the top fills in. Click "Track →" to follow a per-row URL (which is built from the row id).',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 11, marginTop: 12 },
            },
        ],
    };
    return def;
})();

const highlights: ExpressionHighlight[] = [
    {
        label: 'Drill-through cell that writes to a report variable',
        expression: 'Field.id',
        explanation:
            'On a cell item, setting clickAction=drill + drillVariable="selectedOrder" + drillValueExpr=Field.id ' +
            'makes clicking the cell write into the in-report Variables store. Other components that reference Variables.selectedOrder will re-render. ' +
            'Variables are writable from inside the viewer; Parameters are not — they only change when the user submits the parameter panel.',
    },
    {
        label: 'Capitalise a string without a helper (Mid + Upper + Length)',
        expression: "Concat(Upper(Mid(Field.status, 1, 1)), Mid(Field.status, 2, Length(Field.status) - 1))",
        explanation:
            'Mid uses 1-based indexing. This pattern turns "paid" → "Paid". Length works for strings and arrays.',
    },
    {
        label: 'Nested IIf for a small case-statement',
        expression: "IIf(Field.status == 'paid', '✓', IIf(Field.status == 'cancelled', '✕', IIf(Field.status == 'refunded', '↶', '…')))",
        explanation:
            'IIf returns different values based on a condition. Prefer Switch() when you have 4+ branches: Switch(value, case1, result1, case2, result2, defaultResult).',
    },
    {
        label: 'Per-row hyperlink built from a field',
        expression: "=Concat('https://example.com/track/', Field.id)",
        explanation:
            "Prefix an href with '=' to mark it as an expression; otherwise it's treated as a literal URL. The URL renderer only follows http/https/mailto/tel/relative — javascript: URLs are rejected.",
    },
    {
        label: 'Conditional formatting using a parameter as the threshold',
        expression: 'Field.revenue >= Parameters.highThreshold',
        explanation:
            'Each conditional-format rule is re-evaluated when parameters change. Try raising or lowering the "High revenue threshold" at left.',
    },
];

export const CellItemsExample: React.FC = () => {
    const [drilled, setDrilled] = useState<string | null>(null);
    const [tab, setTab] = useState<'viewer' | 'expressions' | 'definition'>('viewer');
    const [paramValues, setParamValues] = useState<Record<string, unknown>>({
        highThreshold: 3000,
    });

    return (
        <section
            style={{
                border: '1px solid var(--eui-border-subtle)',
                borderRadius: 8,
                overflow: 'hidden',
                marginBottom: 28,
                background: 'var(--eui-bg)',
            }}
        >
            <div style={{ padding: '12px 16px', background: 'var(--eui-bg-subtle)', borderBottom: '1px solid var(--eui-border-subtle)' }}>
                <h3 style={{ margin: 0, color: 'var(--eui-text)', fontSize: 16, fontWeight: 600 }}>
                    5 · Cell items, drill-through, and conditional formatting
                </h3>
                <p style={{ margin: '4px 0 0', color: 'var(--eui-text-muted)', fontSize: 13 }}>
                    Each row shows drill-through on the Order ID, per-row URL on the tracking column, status badges via cellItems,
                    and conditional formatting keyed on a parameter.
                </p>
                {drilled && (
                    <div
                        style={{
                            marginTop: 8,
                            padding: '6px 10px',
                            background: 'var(--eui-primary-soft)',
                            border: '1px solid var(--eui-primary)',
                            borderRadius: 4,
                            color: 'var(--eui-text)',
                            fontSize: 12,
                        }}
                    >
                        Drilled through to order <strong>{drilled}</strong> — in a real app this would navigate to a detail page.
                    </div>
                )}
            </div>

            <div role="tablist" style={{ display: 'flex', gap: 4, padding: '6px 10px', borderBottom: '1px solid var(--eui-border-subtle)' }}>
                {(['viewer', 'expressions', 'definition'] as const).map((t) => (
                    <button
                        key={t}
                        role="tab"
                        aria-selected={tab === t}
                        onClick={() => setTab(t)}
                        style={{
                            padding: '4px 12px',
                            border: 'none',
                            borderRadius: 4,
                            background: tab === t ? 'var(--eui-primary-soft)' : 'transparent',
                            color: tab === t ? 'var(--eui-primary)' : 'var(--eui-text-muted)',
                            fontWeight: 600,
                            fontSize: 12,
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                        }}
                    >
                        {t === 'viewer' ? 'Live Viewer' : t}
                    </button>
                ))}
            </div>

            {tab === 'viewer' && (
                <div style={{ height: 620, overflow: 'hidden' }}>
                    <ReportViewer
                        definition={definition}
                        datasourcePlugins={sampleDatasourcePlugins}
                        parameterValues={paramValues}
                        onParameterChange={setParamValues}
                        onDrillThrough={(variableName, value) => {
                            if (variableName === 'selectedOrder') setDrilled(String(value));
                        }}
                        parameterPanel={{ mode: 'docked', position: 'left' }}
                        style={{ height: '100%' }}
                    />
                </div>
            )}

            {tab === 'expressions' && (
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {highlights.map((h, i) => (
                        <div key={i}>
                            <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--eui-text)', marginBottom: 2 }}>
                                {h.label}
                            </div>
                            <div
                                style={{
                                    fontFamily: 'monospace',
                                    fontSize: 12,
                                    padding: '6px 10px',
                                    background: 'var(--eui-bg-subtle)',
                                    border: '1px solid var(--eui-border-subtle)',
                                    borderRadius: 4,
                                    color: 'var(--eui-text)',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all',
                                }}
                            >
                                {h.expression}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--eui-text-muted)', marginTop: 4 }}>
                                {h.explanation}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'definition' && (
                <div style={{ padding: 12 }}>
                    <CodeBlock code={JSON.stringify(definition, null, 2)} language="json" />
                </div>
            )}
        </section>
    );
};
