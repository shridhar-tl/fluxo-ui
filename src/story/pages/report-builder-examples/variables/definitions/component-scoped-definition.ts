import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildComponentScopedDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Component-scoped variable');
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
                props: { level: 'h3', content: 'Component-scoped variables' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'c-help',
                type: 'text',
                props: {
                    content:
                        'Each table below declares its own `localSelection` variable (scope = component). Drills in one table do NOT leak into the other — the scope walker only writes to the nearest enclosing declaration that knows the name.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 10 },
            },
            {
                id: 'c-table-a',
                type: 'table',
                variables: [
                    { id: 'va-sel', name: 'localSelection', scope: 'component', description: 'Scoped to Table A', defaultValueExpression: '' },
                ],
                props: {
                    datasourceId: 'ds-orders',
                    rowVisibleExpr: "Field.region == 'North'",
                    columns: [
                        { id: 'c-a-id', field: 'id', label: 'North / Order' },
                        { id: 'c-a-product', field: 'product', label: 'Product' },
                        {
                            id: 'c-a-revenue',
                            field: 'revenue',
                            label: 'Revenue',
                            align: 'right',
                            formatExpr: "FormatCurrency(Field.revenue, '$', 0)",
                        },
                    ],
                    onDrillThrough: 'localSelection',
                    enableSorting: true,
                },
                styles: { marginBottom: 12 },
                children: [],
            },
            {
                id: 'c-table-b',
                type: 'table',
                variables: [
                    { id: 'vb-sel', name: 'localSelection', scope: 'component', description: 'Scoped to Table B', defaultValueExpression: '' },
                ],
                props: {
                    datasourceId: 'ds-orders',
                    rowVisibleExpr: "Field.region == 'South'",
                    columns: [
                        { id: 'c-b-id', field: 'id', label: 'South / Order' },
                        { id: 'c-b-product', field: 'product', label: 'Product' },
                        {
                            id: 'c-b-revenue',
                            field: 'revenue',
                            label: 'Revenue',
                            align: 'right',
                            formatExpr: "FormatCurrency(Field.revenue, '$', 0)",
                        },
                    ],
                    onDrillThrough: 'localSelection',
                    enableSorting: true,
                },
                styles: {},
                children: [],
            },
        ],
    };
};
