import { createEmptyDefinition, type ReportDefinition } from '../../../../components/report-builder';
import { orders } from '../../report-builder/example-data';

export const buildMainSalesReport = (): ReportDefinition => {
    const base = createEmptyDefinition('Sales Overview Dashboard');
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
                label: 'Region',
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
                id: 'p-minRevenue',
                name: 'minRevenue',
                type: 'numeric',
                label: 'Minimum Revenue',
                mandatory: false,
                typeConfig: {},
                defaultValue: 0,
                width: 1,
            },
        ],
        variables: [
            {
                id: 'v-selectedOrder',
                name: 'selectedOrder',
                scope: 'global',
                description: 'Currently selected order id (set by drill-through from the orders table).',
                defaultValueExpression: '',
            },
            {
                id: 'v-selectedRegion',
                name: 'selectedRegion',
                scope: 'global',
                description: 'Currently selected region for the region-summary sub-report.',
                defaultValueExpression: '',
            },
        ],
        components: [
            {
                id: 'c-header',
                type: 'header',
                props: { level: 'h1', content: 'Sales Overview Dashboard' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'c-subtitle',
                type: 'text',
                props: {
                    content:
                        '=Concat("Showing orders", IIf(IsEmpty(Parameters.region), "", Concat(" in ", Parameters.region)), IIf(Parameters.minRevenue > 0, Concat(" over $", Parameters.minRevenue), ""))',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 13, marginBottom: 12 },
            },
            {
                id: 'c-chart-revenue',
                type: 'chart-bar',
                props: {
                    datasourceId: 'ds-orders',
                    title: 'Revenue by Region',
                    xAxisField: 'region',
                    yAxisField: 'revenue',
                    barColor: '#6366f1',
                    height: 280,
                    showLegend: false,
                    tooltipValueFormat: 'currency',
                },
                styles: { marginBottom: 16 },
            },
            {
                id: 'c-table-orders',
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
                    rowVisibleExpr:
                        '=(IsEmpty(Parameters.region) || Field.region == Parameters.region) && (IsEmpty(Parameters.minRevenue) || Field.revenue >= Parameters.minRevenue)',
                    enableSorting: true,
                    onDrillThrough: 'selectedOrder',
                    footerRows: [
                        {
                            id: 'ft-total',
                            cells: [
                                { colSpan: 4, align: 'right', textExpression: "'Total'" },
                                { colSpan: 1, align: 'right', textExpression: 'Sum(Datasources.orders.units)' },
                                { colSpan: 1, align: 'right', textExpression: "FormatCurrency(Sum(Datasources.orders.revenue), '$', 0)" },
                            ],
                        },
                    ],
                },
                styles: { marginBottom: 16 },
            },
            {
                id: 'c-subreport-details',
                type: 'sub-report',
                props: {
                    subReportId: 'sr-order-details',
                    parameterMap: {
                        orderId: '=Variables.selectedOrder.id',
                    },
                },
                styles: {
                    marginBottom: 16,
                    visible: '=!IsEmpty(Variables.selectedOrder)',
                },
            },
            {
                id: 'c-subreport-region',
                type: 'sub-report',
                props: {
                    subReportId: 'sr-region-summary',
                    parameterMap: {
                        region: '=IIf(IsEmpty(Parameters.region), "North", Parameters.region)',
                    },
                },
                styles: { marginBottom: 16 },
            },
        ],
    };
};
