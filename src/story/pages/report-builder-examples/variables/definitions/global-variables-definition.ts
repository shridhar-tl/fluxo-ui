import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildGlobalVariablesDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Drill-through → Variable → Visibility');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        parameters: [],
        variables: [
            {
                id: 'v-selected',
                name: 'selectedOrder',
                scope: 'global',
                description: 'Row clicked in the orders table.',
                defaultValueExpression: '',
            },
        ],
        components: [
            {
                id: 'c-header',
                type: 'header',
                props: { level: 'h3', content: 'Orders — click a row to reveal the detail panel' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'c-help',
                type: 'text',
                props: {
                    content:
                        'The table&rsquo;s Drill-through Variable is set to `selectedOrder`. Clicking a row writes the full row object into the variable; the detail panel below checks `!IsEmpty(Variables.selectedOrder)` in styles.visible to appear once a selection exists. Parameters never change from this interaction.',
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
                        { id: 'c-product', field: 'product', label: 'Product' },
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
                    onDrillThrough: 'selectedOrder',
                },
                styles: {},
            },
            {
                id: 'c-detail',
                type: 'text',
                props: {
                    content:
                        "=Concat('Selected: ', Variables.selectedOrder.id, ' · ', Variables.selectedOrder.region, ' · ', Variables.selectedOrder.product, ' → ', FormatCurrency(Variables.selectedOrder.revenue, '$', 0))",
                },
                styles: {
                    visible: '=!IsEmpty(Variables.selectedOrder)',
                    marginTop: 12,
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingLeft: 12,
                    paddingRight: 12,
                    borderRadius: 6,
                    backgroundColor: 'var(--eui-primary-soft)',
                    textColor: 'var(--eui-primary)',
                    fontWeight: '600',
                },
            },
        ],
    };
};
