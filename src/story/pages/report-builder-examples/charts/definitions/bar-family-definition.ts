import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildBarFamilyDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Bar, Horizontal, Stacked');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        parameters: [],
        variables: [],
        components: [
            {
                id: 'c-bar',
                type: 'chart-bar',
                props: {
                    datasourceId: 'ds-orders',
                    title: 'Revenue by Region',
                    subtitle: 'Vertical bar with rounded corners and percent-of-total data labels',
                    xAxisField: 'region',
                    yAxisField: 'revenue',
                    aggregation: 'sum',
                    barBorderRadius: 6,
                    barPercentage: 0.7,
                    categoryPercentage: 0.8,
                    showDataLabels: true,
                    dataLabelFormat: 'currency',
                    dataLabelDecimals: 0,
                    tooltipValueFormat: 'currency',
                    yAxis: { format: 'currency', beginAtZero: true },
                    colors: ['#6366f1'],
                    height: 280,
                    animate: true,
                },
                styles: { marginBottom: 16 },
            },
            {
                id: 'c-hbar',
                type: 'chart-horizontal-bar',
                props: {
                    datasourceId: 'ds-orders',
                    title: 'Revenue by Category',
                    subtitle: 'Horizontal bar — flip the axis when the category is the readable dimension',
                    xAxisField: 'category',
                    yAxisField: 'revenue',
                    aggregation: 'sum',
                    barBorderRadius: 4,
                    tooltipValueFormat: 'currency',
                    xAxis: { format: 'currency' },
                    colors: ['#10b981'],
                    height: 240,
                    animate: true,
                },
                styles: { marginBottom: 16 },
            },
            {
                id: 'c-stacked',
                type: 'chart-stacked-bar',
                props: {
                    datasourceId: 'ds-orders',
                    title: 'Revenue by Region, stacked by Category',
                    subtitle: 'seriesField pivots a single y-field into N series (one per distinct category)',
                    xAxisField: 'region',
                    yAxisField: 'revenue',
                    seriesField: 'category',
                    aggregation: 'sum',
                    stacked: true,
                    barBorderRadius: 0,
                    tooltipValueFormat: 'currency',
                    yAxis: { format: 'currency', beginAtZero: true },
                    legendPosition: 'top',
                    height: 280,
                },
                styles: {},
            },
        ],
    };
};
