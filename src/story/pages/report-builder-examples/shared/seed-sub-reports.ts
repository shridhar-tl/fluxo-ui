import { createEmptyDefinition, type ReportDefinition } from '../../../../components/report-builder';
import { orders } from '../../report-builder/example-data';

export const buildOrderDetailsSubReport = (): ReportDefinition => {
    const base = createEmptyDefinition('Order Details');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        parameters: [
            {
                id: 'p-orderId',
                name: 'orderId',
                type: 'text',
                label: 'Order Id',
                mandatory: true,
                typeConfig: {},
                defaultValue: 'ORD-1000',
                width: 1,
            },
        ],
        variables: [],
        components: [
            {
                id: 'c-header',
                type: 'header',
                props: {
                    level: 'h3',
                    content: '=Concat("Order Details — ", Parameters.orderId)',
                },
                styles: { marginBottom: 4 },
            },
            {
                id: 'c-table',
                type: 'table',
                props: {
                    datasourceId: 'ds-orders',
                    columns: [
                        { id: 'd-id', field: 'id', label: 'Order', sortable: false, width: '110px' },
                        { id: 'd-region', field: 'region', label: 'Region', sortable: false, width: '100px' },
                        { id: 'd-category', field: 'category', label: 'Category', sortable: false, width: '120px' },
                        { id: 'd-product', field: 'product', label: 'Product', sortable: false },
                        { id: 'd-salesRep', field: 'salesRep', label: 'Sales Rep', sortable: false },
                        { id: 'd-units', field: 'units', label: 'Units', align: 'right', width: '80px', sortable: false },
                        {
                            id: 'd-revenue',
                            field: 'revenue',
                            label: 'Revenue',
                            align: 'right',
                            width: '130px',
                            sortable: false,
                            formatExpr: "FormatCurrency(Field.revenue, '$', 0)",
                        },
                    ],
                    rowVisibleExpr: '=Field.id == Parameters.orderId',
                    enableSorting: false,
                },
                styles: { marginBottom: 8 },
            },
        ],
    };
};

export const buildRegionSummarySubReport = (): ReportDefinition => {
    const base = createEmptyDefinition('Region Summary');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
            {
                id: 'ds-regionOrders',
                name: 'regionOrders',
                type: 'derived',
                config: {
                    sourceDatasourceId: 'ds-orders',
                    transforms: [
                        { type: 'filter', expression: 'Field.region == Parameters.region' },
                    ],
                },
            },
        ],
        parameters: [
            {
                id: 'p-region',
                name: 'region',
                type: 'text',
                label: 'Region',
                mandatory: true,
                typeConfig: {},
                defaultValue: 'North',
                width: 1,
            },
        ],
        variables: [],
        components: [
            {
                id: 'c-header',
                type: 'header',
                props: {
                    level: 'h3',
                    content: '=Concat("Region Summary — ", Parameters.region)',
                },
                styles: { marginBottom: 6 },
            },
            {
                id: 'c-chart',
                type: 'chart-bar',
                props: {
                    datasourceId: 'ds-regionOrders',
                    title: '=Concat("Category revenue in ", Parameters.region)',
                    xAxisField: 'category',
                    yAxisField: 'revenue',
                    barColor: '#10b981',
                    height: 240,
                    showLegend: false,
                    tooltipValueFormat: 'currency',
                },
                styles: { marginBottom: 8 },
            },
            {
                id: 'c-note',
                type: 'text',
                props: {
                    content:
                        '=Concat("Total orders: ", Count(Datasources.regionOrders.id), " · Total revenue: ", FormatCurrency(Sum(Datasources.regionOrders.revenue), "$", 0))',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12 },
            },
        ],
    };
};

export const buildSalesRepSubReport = (): ReportDefinition => {
    const base = createEmptyDefinition('Sales Rep Performance');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        parameters: [
            {
                id: 'p-rep',
                name: 'salesRep',
                type: 'text',
                label: 'Sales Rep',
                mandatory: true,
                typeConfig: {},
                defaultValue: 'A. Chen',
                width: 1,
            },
        ],
        variables: [],
        components: [
            {
                id: 'c-header',
                type: 'header',
                props: { level: 'h3', content: '=Concat("Rep — ", Parameters.salesRep)' },
                styles: { marginBottom: 6 },
            },
            {
                id: 'c-table',
                type: 'table',
                props: {
                    datasourceId: 'ds-orders',
                    columns: [
                        { id: 'sr-id', field: 'id', label: 'Order', sortable: true, width: '110px' },
                        { id: 'sr-region', field: 'region', label: 'Region', sortable: true, width: '90px' },
                        { id: 'sr-product', field: 'product', label: 'Product', sortable: true },
                        {
                            id: 'sr-revenue',
                            field: 'revenue',
                            label: 'Revenue',
                            align: 'right',
                            width: '120px',
                            sortable: true,
                            formatExpr: "FormatCurrency(Field.revenue, '$', 0)",
                        },
                    ],
                    rowVisibleExpr: '=Field.salesRep == Parameters.salesRep',
                    enableSorting: true,
                },
                styles: {},
            },
        ],
    };
};
