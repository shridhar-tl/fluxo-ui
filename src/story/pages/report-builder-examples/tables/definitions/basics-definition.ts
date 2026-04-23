import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildBasicsDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Orders — Basic Table');
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
                props: { level: 'h3', content: 'Orders' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'c-text',
                type: 'text',
                props: {
                    content:
                        'The simplest table. A datasource, a flat list of columns, and sorting enabled. Click a header to sort; drag a header edge to resize; drag a header body to reorder.',
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
                        { id: 'c-category', field: 'category', label: 'Category', sortable: true, width: '120px' },
                        { id: 'c-product', field: 'product', label: 'Product', sortable: true },
                        { id: 'c-units', field: 'units', label: 'Units', align: 'right', width: '80px', sortable: true },
                        {
                            id: 'c-revenue',
                            field: 'revenue',
                            label: 'Revenue',
                            align: 'right',
                            width: '130px',
                            sortable: true,
                            formatExpr: "FormatCurrency(Field.revenue, '$', 0)",
                        },
                    ],
                    enableSorting: true,
                    enableCopyData: true,
                },
                styles: {},
            },
        ],
    };
};
