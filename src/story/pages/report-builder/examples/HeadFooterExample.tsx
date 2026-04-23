import React from 'react';
import {
    createEmptyDefinition,
    type ReportDefinition,
} from '../../../../components/report-builder';
import { orders } from '../example-data';
import { ExampleShowcase, type ExpressionHighlight } from './ExampleShowcase';

const definition: ReportDefinition = (() => {
    const base = createEmptyDefinition('Statement of Account');
    const def: ReportDefinition = {
        ...base,
        parameters: [
            {
                id: 'p-region',
                name: 'region',
                type: 'dropdown',
                label: 'Region',
                mandatory: false,
                typeConfig: {
                    options: [
                        { label: 'All', value: '' },
                        { label: 'North', value: 'North' },
                        { label: 'South', value: 'South' },
                        { label: 'East', value: 'East' },
                        { label: 'West', value: 'West' },
                    ],
                },
                defaultValue: '',
                width: 1,
            },
        ],
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        components: [
            {
                id: 'hdr',
                type: 'header',
                props: { level: 'h2', content: 'Statement of Account' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'sub',
                type: 'text',
                props: {
                    content:
                        'Table head rows show an executive summary banner. Table footer rows show grand totals with inline expressions.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 12 },
            },
            {
                id: 'tbl',
                type: 'table',
                props: {
                    datasourceId: 'ds-orders',
                    columns: [
                        { id: 'c-id', field: 'id', label: 'Order', width: '120px' },
                        { id: 'c-date', field: 'orderDate', label: 'Date', width: '110px' },
                        { id: 'c-region', field: 'region', label: 'Region', width: '90px' },
                        { id: 'c-product', field: 'product', label: 'Product' },
                        {
                            id: 'c-units',
                            field: 'units',
                            label: 'Units',
                            align: 'right',
                            width: '80px',
                        },
                        {
                            id: 'c-revenue',
                            field: 'revenue',
                            label: 'Revenue',
                            align: 'right',
                            width: '120px',
                            formatExpr: "FormatCurrency(Field.revenue, '$', 0)",
                        },
                    ],
                    rowVisibleExpr: "Parameters.region == '' || Field.region == Parameters.region",
                    headRows: [
                        {
                            id: 'hr-title',
                            cells: [
                                {
                                    colSpan: 6,
                                    align: 'center',
                                    textExpression:
                                        "Concat('Region filter: ', IIf(Parameters.region == '', 'All regions', Parameters.region), ' · Generated ', FormatDate(Today(), 'YYYY-MM-DD'))",
                                    style: { backgroundColor: '#1e293b', textColor: '#f1f5f9', fontWeight: 'bold' },
                                },
                            ],
                        },
                    ],
                    footerRows: [
                        {
                            id: 'fr-subtotal',
                            cells: [
                                { colSpan: 4, align: 'right', textExpression: "'Totals'" },
                                {
                                    colSpan: 1,
                                    align: 'right',
                                    textExpression: "Sum(Datasources.orders, 'units')",
                                    style: { fontWeight: 'bold' },
                                },
                                {
                                    colSpan: 1,
                                    align: 'right',
                                    textExpression: "FormatCurrency(Sum(Datasources.orders, 'revenue'), '$', 0)",
                                    style: { fontWeight: 'bold' },
                                },
                            ],
                        },
                        {
                            id: 'fr-stats',
                            cells: [
                                { colSpan: 4, align: 'right', textExpression: "'Stats'" },
                                {
                                    colSpan: 1,
                                    align: 'right',
                                    textExpression: "Concat('Avg ', Round(Avg(Datasources.orders, 'units'), 1))",
                                },
                                {
                                    colSpan: 1,
                                    align: 'right',
                                    textExpression:
                                        "Concat('Max ', FormatCurrency(Max(Datasources.orders, 'revenue'), '$', 0))",
                                },
                            ],
                        },
                    ],
                    enableSorting: true,
                },
                styles: {},
            },
        ],
    };
    return def;
})();

const highlights: ExpressionHighlight[] = [
    {
        label: 'Head row with dynamic banner text',
        expression:
            "Concat('Region filter: ', IIf(Parameters.region == '', 'All regions', Parameters.region), ' · Generated ', FormatDate(Today(), 'YYYY-MM-DD'))",
        explanation:
            'Head and footer rows are plain expression cells. Concat + IIf + FormatDate compose a dynamic banner. ' +
            'The banner updates automatically when the region parameter changes.',
    },
    {
        label: 'Totals row',
        expression: "Sum(Datasources.orders, 'units')",
        explanation:
            'Two-argument Sum(rows, fieldName) sums a specific field across an array of row objects. This is the easiest way to aggregate over an entire datasource.',
    },
    {
        label: 'Inline stats row with Avg and Max',
        expression: "Concat('Max ', FormatCurrency(Max(Datasources.orders, 'revenue'), '$', 0))",
        explanation:
            'Avg, Min, Max, Count all accept the same (values) or (rows, fieldName) signatures. Note Count with a field counts non-null entries for that field.',
    },
];

export const HeadFooterExample: React.FC = () => (
    <ExampleShowcase
        title="6 · Head & footer rows with totals"
        description="Extra head/footer rows with arbitrary colSpan and inline expressions. Useful for banners, grand totals, and summary statistics below the data."
        definition={definition}
        highlights={highlights}
    />
);
