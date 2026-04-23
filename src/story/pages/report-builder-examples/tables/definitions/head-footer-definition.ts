import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildHeadFooterDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Head / Footer Rows');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        parameters: [],
        variables: [],
        components: [
            {
                id: 'c-header',
                type: 'header',
                props: { level: 'h3', content: 'Head & Footer Rows' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'c-text',
                type: 'text',
                props: {
                    content:
                        'Extra rows render above the data (headRows) or below (footerRows). Each cell is an expression; colSpan groups columns. Use them for banners, totals, context lines, and running aggregates.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 10 },
            },
            {
                id: 'c-table',
                type: 'table',
                props: {
                    datasourceId: 'ds-orders',
                    columns: [
                        { id: 'c-id', field: 'id', label: 'Order', sortable: true, width: '110px' },
                        { id: 'c-region', field: 'region', label: 'Region', sortable: true, width: '100px' },
                        { id: 'c-product', field: 'product', label: 'Product', sortable: true },
                        { id: 'c-units', field: 'units', label: 'Units', align: 'right', sortable: true, width: '80px' },
                        {
                            id: 'c-revenue',
                            field: 'revenue',
                            label: 'Revenue',
                            align: 'right',
                            sortable: true,
                            width: '130px',
                            formatExpr: "FormatCurrency(Field.revenue, '$', 0)",
                        },
                    ],
                    headRows: [
                        {
                            id: 'hd-banner',
                            cells: [
                                {
                                    colSpan: 5,
                                    align: 'center',
                                    textExpression:
                                        "Concat('As of ', FormatDate(Today(), 'YYYY-MM-DD'), ' — ', Count(Datasources.orders.id), ' orders, ', FormatCurrency(Sum(Datasources.orders.revenue), '$', 0), ' total revenue')",
                                    style: {
                                        backgroundColor: 'var(--eui-primary-soft)',
                                        textColor: 'var(--eui-primary)',
                                        fontWeight: '600',
                                        paddingTop: 8,
                                        paddingBottom: 8,
                                    },
                                },
                            ],
                        },
                    ],
                    footerRows: [
                        {
                            id: 'ft-totals',
                            cells: [
                                { colSpan: 3, align: 'right', textExpression: "'Totals'" },
                                { colSpan: 1, align: 'right', textExpression: 'Sum(Datasources.orders.units)' },
                                { colSpan: 1, align: 'right', textExpression: "FormatCurrency(Sum(Datasources.orders.revenue), '$', 0)" },
                            ],
                        },
                        {
                            id: 'ft-avg',
                            cells: [
                                { colSpan: 3, align: 'right', textExpression: "'Averages'" },
                                { colSpan: 1, align: 'right', textExpression: "Round(Avg(Datasources.orders, 'units'), 1)" },
                                { colSpan: 1, align: 'right', textExpression: "FormatCurrency(Avg(Datasources.orders, 'revenue'), '$', 0)" },
                            ],
                        },
                    ],
                    enableSorting: true,
                },
                styles: {},
            },
        ],
    };
};
