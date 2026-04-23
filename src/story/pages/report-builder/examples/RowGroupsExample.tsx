import React from 'react';
import {
    createEmptyDefinition,
    type ReportDefinition,
} from '../../../../components/report-builder';
import { orders } from '../example-data';
import { ExampleShowcase, type ExpressionHighlight } from './ExampleShowcase';

const definition: ReportDefinition = (() => {
    const base = createEmptyDefinition('Regional Sales Breakdown');
    const def: ReportDefinition = {
        ...base,
        parameters: [
            {
                id: 'p-year',
                name: 'year',
                type: 'dropdown',
                label: 'Year',
                mandatory: false,
                typeConfig: {
                    options: [
                        { label: '2025 (All)', value: '2025' },
                    ],
                },
                defaultValue: '2025',
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
                props: { level: 'h2', content: 'Regional Sales Breakdown' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'sub',
                type: 'text',
                props: {
                    content:
                        'Data is grouped by Region → Category. Expand/collapse parent rows by clicking the group header. ' +
                        'Footer rows show per-group aggregates using RowGroup context.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 12 },
            },
            {
                id: 'tbl',
                type: 'table',
                props: {
                    datasourceId: 'ds-orders',
                    columns: [
                        { id: 'c-id', field: 'id', label: 'Order', sortable: true },
                        { id: 'c-date', field: 'orderDate', label: 'Date', width: '110px' },
                        { id: 'c-product', field: 'product', label: 'Product' },
                        { id: 'c-rep', field: 'salesRep', label: 'Sales Rep' },
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
                            width: '130px',
                            formatExpr: "FormatCurrency(Field.revenue, '$', 0)",
                        },
                        {
                            id: 'c-margin',
                            field: 'margin',
                            label: 'Margin',
                            align: 'right',
                            width: '100px',
                            formatExpr: 'FormatPercent((Field.revenue - Field.cost) / Field.revenue, 1)',
                        },
                        {
                            id: 'c-shareRegion',
                            field: 'shareRegion',
                            label: '% of Region',
                            align: 'right',
                            width: '110px',
                            formatExpr:
                                "FormatPercent(Field.revenue / IIf(RowGroup('regionGroup').Variables.regionTotal > 0, RowGroup('regionGroup').Variables.regionTotal, 1), 1)",
                        },
                    ],
                    rowGroups: [
                        {
                            id: 'rg-region',
                            name: 'regionGroup',
                            groupKind: 'parent',
                            keys: ['Field.region'],
                            sortBy: 'Field.region',
                            showFooter: false,
                            variables: [
                                { key: 'regionTotal', expression: "Sum(RowGroup('regionGroup').values, 'revenue')" },
                            ],
                            children: [
                                {
                                    id: 'rg-category',
                                    name: 'categoryGroup',
                                    groupKind: 'parent',
                                    keys: ['Field.category'],
                                    sortBy: 'Field.category',
                                    showFooter: true,
                                    variables: [
                                        { key: 'categoryTotal', expression: "Sum(RowGroup('categoryGroup').values, 'revenue')" },
                                    ],
                                    children: [
                                        {
                                            id: 'rg-details',
                                            name: 'detailRows',
                                            groupKind: 'details',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    footerRows: [
                        {
                            id: 'ft-grand',
                            cells: [
                                { colSpan: 4, align: 'right', textExpression: "'Grand Total'" },
                                { colSpan: 1, align: 'right', textExpression: 'Sum(Datasources.orders.units)' },
                                { colSpan: 1, align: 'right', textExpression: "FormatCurrency(Sum(Datasources.orders.revenue), '$', 0)" },
                                { colSpan: 1, align: 'right', textExpression: "Concat(Count(Datasources.orders.id), ' orders')" },
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
        label: 'Row-group key — groups rows by the value of Field.region',
        expression: 'Field.region',
        explanation:
            'Each row-group config has a keys[] array of expressions. Rows sharing the same key value end up in the same bucket. ' +
            'Use multiple entries for multi-key grouping (e.g. [Field.year, Field.region]).',
    },
    {
        label: 'Category-level footer: revenue total',
        expression: "FormatCurrency(Sum(Datasources.orders.revenue), '$', 0)",
        explanation:
            'Per-group footer row cells are expressions. Sum(Datasources.orders.revenue) aggregates across all rows currently in scope. ' +
            'When evaluated inside a group, the Datasources.orders array is the raw datasource — use the variables feature if you need group-scoped aggregation.',
    },
    {
        label: 'Column format: margin as a percentage',
        expression: 'FormatPercent((Field.revenue - Field.cost) / Field.revenue, 1)',
        explanation:
            'Inline arithmetic is fine. FormatPercent multiplies by 100 and appends %. The second argument is decimal places.',
    },
    {
        label: 'Grand-total footer row',
        expression: "Concat(Count(Datasources.orders.id), ' orders')",
        explanation:
            'Footer rows at the table level use free expressions. Count(Datasources.orders.id) counts non-null ids in the full datasource. ' +
            'Concat joins any number of arguments as strings.',
    },
];

export const RowGroupsExample: React.FC = () => (
    <ExampleShowcase
        title="2 · Multi-level row groups with aggregates"
        description="Region → Category → Orders. Parent groups collapse; details rows show individual orders; footer rows use Sum, Count, and FormatCurrency."
        definition={definition}
        highlights={highlights}
    />
);
