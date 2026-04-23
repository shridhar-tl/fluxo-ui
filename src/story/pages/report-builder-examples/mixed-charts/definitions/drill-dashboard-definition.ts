import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildDrillDashboardDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Coordinated dashboard');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        parameters: [],
        variables: [
            {
                id: 'v-selectedRegion',
                name: 'selectedRegion',
                scope: 'global',
                description: 'Region selected from the chart.',
                defaultValueExpression: '',
            },
        ],
        components: [
            {
                id: 'c-header',
                type: 'header',
                props: { level: 'h3', content: 'Click a bar → filter the table' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'c-help',
                type: 'text',
                props: {
                    content:
                        'The chart\'s onDrillThrough sets selectedRegion to the clicked bar\'s source row. The table\'s rowVisibleExpr reads it back. Click the same bar again (or any bar with empty data) to see the no-selection state.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 10 },
            },
            {
                id: 'c-chart',
                type: 'chart-bar',
                props: {
                    datasourceId: 'ds-orders',
                    title: 'Revenue by Region',
                    subtitle: '=Concat("Selected: ", IIf(IsEmpty(Variables.selectedRegion), "— (click a bar)", Variables.selectedRegion.region))',
                    xAxisField: 'region',
                    yAxisField: 'revenue',
                    aggregation: 'sum',
                    tooltipValueFormat: 'currency',
                    yAxis: { format: 'currency', beginAtZero: true },
                    barBorderRadius: 4,
                    onDrillThrough: 'selectedRegion',
                    height: 280,
                    colors: ['#6366f1'],
                },
                styles: { marginBottom: 14 },
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
                        'IsEmpty(Variables.selectedRegion) || Field.region == Variables.selectedRegion.region',
                    enableSorting: true,
                },
                styles: {},
            },
        ],
    };
};
