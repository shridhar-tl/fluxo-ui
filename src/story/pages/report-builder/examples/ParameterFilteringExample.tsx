import React from 'react';
import {
    createEmptyDefinition,
    type ReportDefinition,
} from '../../../../components/report-builder';
import { orders } from '../example-data';
import { ExampleShowcase, type ExpressionHighlight } from './ExampleShowcase';

const definition: ReportDefinition = (() => {
    const base = createEmptyDefinition('Order Search');
    const def: ReportDefinition = {
        ...base,
        parameters: [
            {
                id: 'p-dateRange',
                name: 'dateRange',
                type: 'date-range-picker',
                label: 'Order Date',
                mandatory: false,
                typeConfig: {},
                width: 0.5,
            },
            {
                id: 'p-regions',
                name: 'regions',
                type: 'multi-select',
                label: 'Regions',
                mandatory: false,
                typeConfig: {
                    options: [
                        { label: 'North', value: 'North' },
                        { label: 'South', value: 'South' },
                        { label: 'East', value: 'East' },
                        { label: 'West', value: 'West' },
                    ],
                },
                width: 0.5,
            },
            {
                id: 'p-status',
                name: 'status',
                type: 'dropdown',
                label: 'Status',
                mandatory: false,
                typeConfig: {
                    options: [
                        { label: '(all)', value: '' },
                        { label: 'Paid', value: 'paid' },
                        { label: 'Shipped', value: 'shipped' },
                        { label: 'Pending', value: 'pending' },
                        { label: 'Cancelled', value: 'cancelled' },
                        { label: 'Refunded', value: 'refunded' },
                    ],
                },
                defaultValue: '',
                width: 0.25,
            },
            {
                id: 'p-minRevenue',
                name: 'minRevenue',
                type: 'numeric',
                label: 'Min Revenue',
                mandatory: false,
                typeConfig: { min: 0, step: 100 },
                defaultValue: 0,
                width: 0.25,
            },
            {
                id: 'p-categoryFilter',
                name: 'categoryFilter',
                type: 'chips',
                label: 'Category (chips, free-text)',
                mandatory: false,
                typeConfig: {},
                width: 0.5,
            },
        ],
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        components: [
            {
                id: 'hdr',
                type: 'header',
                props: { level: 'h2', content: 'Order Search' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'sub',
                type: 'text',
                props: { content: 'Use the filters on the left to narrow down the results. Leave a filter blank to ignore it.' },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 12 },
            },
            {
                id: 'tbl',
                type: 'table',
                props: {
                    datasourceId: 'ds-orders',
                    columns: [
                        { id: 'c-id', field: 'id', label: 'Order', sortable: true },
                        { id: 'c-date', field: 'orderDate', label: 'Date', sortable: true, width: '110px' },
                        { id: 'c-region', field: 'region', label: 'Region', sortable: true, width: '90px' },
                        { id: 'c-category', field: 'category', label: 'Category', sortable: true },
                        { id: 'c-product', field: 'product', label: 'Product', sortable: true },
                        { id: 'c-status', field: 'status', label: 'Status', sortable: true, width: '110px' },
                        {
                            id: 'c-revenue',
                            field: 'revenue',
                            label: 'Revenue',
                            align: 'right',
                            sortable: true,
                            width: '120px',
                            formatExpr: "FormatCurrency(Field.revenue, '$', 0)",
                        },
                    ],
                    enableSorting: true,
                    enableCopyData: true,
                    rowVisibleExpr:
                        "(IsEmpty(Parameters.dateRange) || Between(Field.orderDate, Parameters.dateRange.fromDate, Parameters.dateRange.toDate)) && " +
                        '(IsEmpty(Parameters.regions) || InList(Field.region, Parameters.regions)) && ' +
                        "(Parameters.status == '' || Field.status == Parameters.status) && " +
                        '(Field.revenue >= Parameters.minRevenue) && ' +
                        '(IsEmpty(Parameters.categoryFilter) || InList(Field.category, Parameters.categoryFilter))',
                },
                styles: {},
            },
        ],
    };
    return def;
})();

const highlights: ExpressionHighlight[] = [
    {
        label: 'Row visibility — combines 5 filters with AND',
        expression:
            "(IsEmpty(Parameters.dateRange) || Between(Field.orderDate, Parameters.dateRange.fromDate, Parameters.dateRange.toDate)) &&\n" +
            '(IsEmpty(Parameters.regions) || InList(Field.region, Parameters.regions)) &&\n' +
            "(Parameters.status == '' || Field.status == Parameters.status) &&\n" +
            '(Field.revenue >= Parameters.minRevenue) &&\n' +
            '(IsEmpty(Parameters.categoryFilter) || InList(Field.category, Parameters.categoryFilter))',
        explanation:
            'Each clause first checks whether the parameter is empty (so leaving it blank disables that filter). ' +
            'IsEmpty handles both null/undefined and empty arrays. InList checks multi-select / chips membership. ' +
            'Between is inclusive on both ends and works with ISO date strings.',
    },
    {
        label: 'Revenue format',
        expression: "FormatCurrency(Field.revenue, '$', 0)",
        explanation:
            "Formats a number with thousand separators and a currency symbol. Use '€', '£', or any string as the first argument.",
    },
];

export const ParameterFilteringExample: React.FC = () => (
    <ExampleShowcase
        title="1 · Parameter-driven filtering"
        description="Date-range + multi-select + dropdown + numeric + chips parameters combine into a single rowVisibleExpr. Leave any filter blank to skip it."
        definition={definition}
        highlights={highlights}
    />
);
