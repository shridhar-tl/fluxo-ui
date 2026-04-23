import React from 'react';
import {
    createEmptyDefinition,
    type ReportDefinition,
} from '../../../../components/report-builder';
import { orders } from '../example-data';
import { ExampleShowcase, type ExpressionHighlight } from './ExampleShowcase';

const regionSummary = (() => {
    const grouped = new Map<string, number>();
    for (const o of orders) grouped.set(o.region, (grouped.get(o.region) ?? 0) + o.revenue);
    return Array.from(grouped.entries()).map(([region, revenue]) => ({ region, revenue }));
})();

const categorySummary = (() => {
    const grouped = new Map<string, number>();
    for (const o of orders) grouped.set(o.category, (grouped.get(o.category) ?? 0) + o.revenue);
    return Array.from(grouped.entries()).map(([category, revenue]) => ({ category, revenue }));
})();

const definition: ReportDefinition = (() => {
    const base = createEmptyDefinition('Conditional Sections');
    const def: ReportDefinition = {
        ...base,
        parameters: [
            {
                id: 'p-audience',
                name: 'audience',
                type: 'radio-button',
                label: 'Report audience',
                mandatory: false,
                typeConfig: {
                    options: [
                        { label: 'Executive', value: 'executive' },
                        { label: 'Manager', value: 'manager' },
                        { label: 'Analyst', value: 'analyst' },
                    ],
                },
                defaultValue: 'manager',
                width: 0.5,
            },
            {
                id: 'p-showCharts',
                name: 'showCharts',
                type: 'checkbox',
                label: 'Include charts',
                mandatory: false,
                typeConfig: {},
                defaultValue: true,
                width: 0.25,
            },
            {
                id: 'p-showDisclaimer',
                name: 'showDisclaimer',
                type: 'checkbox',
                label: 'Show disclaimer',
                mandatory: false,
                typeConfig: {},
                defaultValue: false,
                width: 0.25,
            },
            {
                id: 'p-minRevenue',
                name: 'minRevenue',
                type: 'numeric',
                label: 'Highlight regions with revenue ≥',
                mandatory: false,
                typeConfig: { min: 0, step: 1000 },
                defaultValue: 80000,
                width: 1,
            },
        ],
        datasources: [
            { id: 'ds-region', name: 'regionSummary', type: 'static-json', config: { json: JSON.stringify(regionSummary) } },
            { id: 'ds-cat', name: 'categorySummary', type: 'static-json', config: { json: JSON.stringify(categorySummary) } },
        ],
        components: [
            {
                id: 'hdr',
                type: 'header',
                props: { level: 'h2', content: 'Sales Dashboard' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'sub',
                type: 'text',
                props: {
                    content:
                        'Switch the audience at left to see sections show/hide. Each component has styles.visible bound to an expression.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 12 },
            },

            {
                id: 'hdr-exec',
                type: 'header',
                props: { level: 'h3', content: 'Executive Summary' },
                styles: {
                    visible: "Parameters.audience == 'executive'",
                    marginBottom: 8,
                },
            },
            {
                id: 'txt-exec',
                type: 'text',
                props: {
                    content:
                        'One-page overview for leadership. Detailed breakdowns are hidden by design — switch to "Manager" or "Analyst" audience to see more.',
                },
                styles: {
                    visible: "Parameters.audience == 'executive'",
                    textColor: 'var(--eui-text-muted)',
                    marginBottom: 12,
                },
            },

            {
                id: 'hdr-charts',
                type: 'header',
                props: { level: 'h3', content: 'Revenue Charts' },
                styles: {
                    visible: "Parameters.showCharts && InList(Parameters.audience, ['executive', 'manager'])",
                    marginBottom: 8,
                },
            },
            {
                id: 'cols-charts',
                type: 'columns',
                props: { columnCount: 2 },
                styles: {
                    visible: "Parameters.showCharts && InList(Parameters.audience, ['executive', 'manager'])",
                    marginBottom: 16,
                },
                children: [
                    {
                        id: 'col1',
                        type: 'column',
                        props: {},
                        styles: {},
                        children: [
                            {
                                id: 'chart-bar',
                                type: 'chart-bar',
                                props: {
                                    datasourceId: 'ds-region',
                                    title: 'Revenue by Region',
                                    xAxisField: 'region',
                                    yAxisField: 'revenue',
                                    barColor: '#4f87f7',
                                    showLegend: false,
                                },
                                styles: {},
                            },
                        ],
                    },
                    {
                        id: 'col2',
                        type: 'column',
                        props: {},
                        styles: {},
                        children: [
                            {
                                id: 'chart-donut',
                                type: 'chart-donut',
                                props: {
                                    datasourceId: 'ds-cat',
                                    title: 'By Category',
                                    labelField: 'category',
                                    valueField: 'revenue',
                                    showLegend: true,
                                },
                                styles: {},
                            },
                        ],
                    },
                ],
            },

            {
                id: 'hdr-detail',
                type: 'header',
                props: { level: 'h3', content: 'Regional Detail' },
                styles: {
                    visible: "InList(Parameters.audience, ['manager', 'analyst'])",
                    marginBottom: 8,
                },
            },
            {
                id: 'tbl-region',
                type: 'table',
                props: {
                    datasourceId: 'ds-region',
                    columns: [
                        { id: 'c-region', field: 'region', label: 'Region' },
                        {
                            id: 'c-rev',
                            field: 'revenue',
                            label: 'Revenue',
                            align: 'right',
                            formatExpr: "FormatCurrency(Field.revenue, '$', 0)",
                            conditionalFormats: [
                                {
                                    id: 'cf-hot',
                                    expression: 'Field.revenue >= Parameters.minRevenue',
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
                            formatExpr: "IIf(Field.revenue >= Parameters.minRevenue, '★ hot', '—')",
                        },
                    ],
                    enableSorting: true,
                },
                styles: {
                    visible: "InList(Parameters.audience, ['manager', 'analyst'])",
                    marginBottom: 16,
                },
            },

            {
                id: 'hdr-raw',
                type: 'header',
                props: { level: 'h3', content: 'Raw Order Data (Analyst)' },
                styles: {
                    visible: "Parameters.audience == 'analyst'",
                    marginBottom: 8,
                },
            },
            {
                id: 'tbl-orders',
                type: 'table',
                props: {
                    datasourceId: 'ds-region',
                    columns: [
                        { id: 'c-r', field: 'region', label: 'Region' },
                        { id: 'c-rv', field: 'revenue', label: 'Revenue', align: 'right', formatExpr: 'FormatNumber(Field.revenue, 0)' },
                    ],
                    enableSorting: true,
                    enableCopyData: true,
                },
                styles: {
                    visible: "Parameters.audience == 'analyst'",
                    marginBottom: 16,
                },
            },

            {
                id: 'hr-disc',
                type: 'horizontal-line',
                props: { thickness: 1, marginTop: 12, marginBottom: 8 },
                styles: { visible: 'Parameters.showDisclaimer' },
            },
            {
                id: 'txt-disc',
                type: 'text',
                props: {
                    content:
                        'Disclaimer: Revenue figures are aggregated from raw order data and may not reflect finalised accounting. Figures subject to change.',
                },
                styles: {
                    visible: 'Parameters.showDisclaimer',
                    textColor: 'var(--eui-text-muted)',
                    fontSize: 11,
                    fontStyle: 'italic',
                },
            },
        ],
    };
    return def;
})();

const highlights: ExpressionHighlight[] = [
    {
        label: 'Show a component only for one audience',
        expression: "Parameters.audience == 'executive'",
        explanation:
            'Any component supports styles.visible. Strings need single quotes; == is equality (also != for not-equal). Comparison short-circuits are supported.',
    },
    {
        label: 'Show charts only when the checkbox is ticked AND audience is exec/manager',
        expression: "Parameters.showCharts && InList(Parameters.audience, ['executive', 'manager'])",
        explanation:
            'Mix boolean parameters with InList to allow multiple audiences. The array is an inline literal — no quotes needed around array members when they are numbers/booleans.',
    },
    {
        label: 'Conditional cell format + inline flag column using IIf',
        expression: "IIf(Field.revenue >= Parameters.minRevenue, '★ hot', '—')",
        explanation:
            'IIf(cond, ifTrue, ifFalse) lets you mix dynamic text into a column without writing a conditional-format rule. Great for badge columns.',
    },
    {
        label: 'Showcase of Not (!) and expression negation',
        expression: '!Parameters.onlyActive || Field.active == true',
        explanation:
            'Use ! to negate a boolean. Prefer this pattern for optional filters so the default (unchecked) shows everything.',
    },
];

export const ConditionalVisibilityExample: React.FC = () => (
    <ExampleShowcase
        title="4 · Conditional sections via parameters"
        description="Every component honours styles.visible as an expression. This example switches between Executive / Manager / Analyst views plus optional charts and disclaimer."
        definition={definition}
        highlights={highlights}
    />
);
