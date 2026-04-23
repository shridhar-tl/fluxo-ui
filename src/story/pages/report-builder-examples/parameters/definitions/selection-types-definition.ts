import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildSelectionTypesDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Selection parameter types');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        parameters: [
            {
                id: 'p-region',
                name: 'region',
                type: 'dropdown',
                label: 'Region (dropdown, static options)',
                mandatory: false,
                typeConfig: {
                    options: [
                        { label: 'All Regions', value: '' },
                        { label: 'North', value: 'North' },
                        { label: 'South', value: 'South' },
                        { label: 'East', value: 'East' },
                        { label: 'West', value: 'West' },
                    ],
                },
                defaultValue: '',
                width: 1,
            },
            {
                id: 'p-status',
                name: 'status',
                type: 'radio-button',
                label: 'Status (radio)',
                mandatory: false,
                typeConfig: {
                    options: [
                        { label: 'Any', value: '' },
                        { label: 'Paid', value: 'paid' },
                        { label: 'Shipped', value: 'shipped' },
                        { label: 'Pending', value: 'pending' },
                    ],
                },
                defaultValue: '',
                width: 2,
            },
            {
                id: 'p-cats',
                name: 'categories',
                type: 'multi-select',
                label: 'Categories (multi-select)',
                mandatory: false,
                typeConfig: {
                    options: [
                        { label: 'Electronics', value: 'Electronics' },
                        { label: 'Apparel', value: 'Apparel' },
                        { label: 'Home', value: 'Home' },
                        { label: 'Sports', value: 'Sports' },
                    ],
                },
                defaultValue: [],
                width: 2,
            },
            {
                id: 'p-tags',
                name: 'tags',
                type: 'chips',
                label: 'Free-text tags (chips)',
                mandatory: false,
                typeConfig: { allowFreeText: true },
                defaultValue: [],
                width: 2,
            },
            {
                id: 'p-active',
                name: 'onlyActive',
                type: 'checkbox',
                label: 'Only non-cancelled orders',
                mandatory: false,
                typeConfig: {},
                defaultValue: false,
                width: 1,
            },
        ],
        variables: [],
        components: [
            {
                id: 'c-help',
                type: 'text',
                props: {
                    content:
                        'Selection controls feeding a rowVisibleExpr. Multi-select returns an array, so InList() is the right combinator; chips are the same shape. Checkbox defaults to false; use IIf to turn it into a filter clause only when checked.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 10 },
            },
            {
                id: 'c-table',
                type: 'table',
                props: {
                    datasourceId: 'ds-orders',
                    columns: [
                        { id: 'c-id', field: 'id', label: 'Order', width: '110px' },
                        { id: 'c-region', field: 'region', label: 'Region', width: '100px' },
                        { id: 'c-category', field: 'category', label: 'Category', width: '120px' },
                        { id: 'c-product', field: 'product', label: 'Product' },
                        { id: 'c-status', field: 'status', label: 'Status', width: '100px' },
                        {
                            id: 'c-revenue',
                            field: 'revenue',
                            label: 'Revenue',
                            align: 'right',
                            width: '130px',
                            formatExpr: "FormatCurrency(Field.revenue, '$', 0)",
                        },
                    ],
                    rowVisibleExpr:
                        "(IsEmpty(Parameters.region) || Field.region == Parameters.region) && (IsEmpty(Parameters.status) || Field.status == Parameters.status) && (IsEmpty(Parameters.categories) || InList(Field.category, Parameters.categories)) && (!Parameters.onlyActive || Field.status != 'cancelled')",
                    enableSorting: true,
                },
                styles: {},
            },
        ],
    };
};
