import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildRowGroupsDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Region → Category Breakdown');
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
                props: { level: 'h3', content: 'Region → Category Breakdown' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'c-text',
                type: 'text',
                props: {
                    content:
                        'Recursive row groups. Region groups contain Category groups, which contain the raw order rows. Each group computes its own per-bucket variables (regionTotal, categoryTotal) and renders a footer showing the aggregate. Click parent rows to collapse/expand.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 10 },
            },
            {
                id: 'c-table',
                type: 'table',
                props: {
                    datasourceId: 'ds-orders',
                    columns: [
                        { id: 'c-id', field: 'id', label: 'Order', sortable: true },
                        { id: 'c-date', field: 'orderDate', label: 'Date', width: '110px' },
                        { id: 'c-product', field: 'product', label: 'Product' },
                        { id: 'c-rep', field: 'salesRep', label: 'Sales Rep' },
                        { id: 'c-units', field: 'units', label: 'Units', align: 'right', width: '80px' },
                        {
                            id: 'c-revenue',
                            field: 'revenue',
                            label: 'Revenue',
                            align: 'right',
                            width: '130px',
                            formatExpr: "FormatCurrency(Field.revenue, '$', 0)",
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
                            showFooter: true,
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
                                        { id: 'rg-details', name: 'detailRows', groupKind: 'details' },
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
                                { colSpan: 1, align: 'right', textExpression: '' },
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
