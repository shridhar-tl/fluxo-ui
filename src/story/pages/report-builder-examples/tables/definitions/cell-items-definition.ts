import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildCellItemsDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Multi-item Cells');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        parameters: [],
        variables: [
            {
                id: 'v-selectedOrder',
                name: 'selectedOrder',
                scope: 'global',
                description: 'Id of the row the user clicked on.',
                defaultValueExpression: '',
            },
        ],
        components: [
            {
                id: 'c-header',
                type: 'header',
                props: { level: 'h3', content: 'Multi-item cells + click actions' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'c-text',
                type: 'text',
                props: {
                    content:
                        'A cell can contain multiple items (text, expression, image, field value, parameter value). Each item has a click action — link, drill (write a variable), or set-variable. Click the order id to set Variables.selectedOrder and watch the callout below update.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 10 },
            },
            {
                id: 'c-callout',
                type: 'text',
                props: {
                    content:
                        '=IIf(IsEmpty(Variables.selectedOrder), "No row selected. Click an Order id below.", Concat("Selected order: ", Variables.selectedOrder))',
                },
                styles: {
                    backgroundColor: 'var(--eui-primary-soft)',
                    textColor: 'var(--eui-primary)',
                    paddingTop: 8,
                    paddingBottom: 8,
                    paddingLeft: 12,
                    paddingRight: 12,
                    borderRadius: 6,
                    fontSize: 12,
                    marginBottom: 10,
                },
            },
            {
                id: 'c-table',
                type: 'table',
                props: {
                    datasourceId: 'ds-orders',
                    columns: [
                        {
                            id: 'c-id',
                            field: 'id',
                            label: 'Order',
                            width: '140px',
                            cellItems: [
                                {
                                    id: 'ci-id',
                                    type: 'expression',
                                    expression: '=Field.id',
                                    clickAction: 'drill',
                                    drillVariable: 'selectedOrder',
                                    drillValueExpr: '=Field.id',
                                    style: { textColor: 'var(--eui-primary)', fontWeight: '600' },
                                },
                            ],
                        },
                        { id: 'c-region', field: 'region', label: 'Region', width: '100px' },
                        { id: 'c-product', field: 'product', label: 'Product' },
                        {
                            id: 'c-status',
                            field: 'status',
                            label: 'Status',
                            width: '120px',
                            conditionalFormats: [
                                {
                                    id: 'cf-paid',
                                    expression: "Field.status == 'paid'",
                                    textColor: '#10b981',
                                    fontWeight: 'bold',
                                },
                                {
                                    id: 'cf-shipped',
                                    expression: "Field.status == 'shipped'",
                                    textColor: '#2563eb',
                                    fontWeight: 'bold',
                                },
                                {
                                    id: 'cf-pending',
                                    expression: "Field.status == 'pending'",
                                    textColor: '#f59e0b',
                                    fontWeight: 'bold',
                                },
                                {
                                    id: 'cf-cancelled',
                                    expression: "Field.status == 'cancelled' || Field.status == 'refunded'",
                                    textColor: '#ef4444',
                                    fontWeight: 'bold',
                                },
                            ],
                            formatExpr: '=Upper(Field.status)',
                        },
                        {
                            id: 'c-revenue',
                            field: 'revenue',
                            label: 'Revenue',
                            align: 'right',
                            width: '130px',
                            formatExpr: "FormatCurrency(Field.revenue, '$', 0)",
                        },
                    ],
                    enableSorting: true,
                },
                styles: {},
            },
        ],
    };
};
