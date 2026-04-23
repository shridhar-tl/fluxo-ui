import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildPolarRadarDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Polar & Radar');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        parameters: [],
        variables: [],
        components: [
            {
                id: 'c-polar',
                type: 'chart-polar-area',
                props: {
                    datasourceId: 'ds-orders',
                    title: 'Polar area — Revenue by Region',
                    subtitle: 'Distance from centre = value. Same labelField / valueField shape as pie.',
                    labelField: 'region',
                    valueField: 'revenue',
                    aggregation: 'sum',
                    rAxis: { beginAtZero: true, gridDisplay: true },
                    tooltipValueFormat: 'currency',
                    colors: ['#6366f1', '#ec4899', '#10b981', '#f59e0b'],
                    height: 320,
                },
                styles: { marginBottom: 16 },
            },
            {
                id: 'c-radar',
                type: 'chart-radar',
                props: {
                    datasourceId: 'ds-orders',
                    title: 'Radar — Revenue by Category × Region',
                    subtitle: 'xAxisField = category (spokes). seriesField = region (overlaid shapes).',
                    xAxisField: 'category',
                    yAxisField: 'revenue',
                    seriesField: 'region',
                    aggregation: 'sum',
                    lineTension: 0.25,
                    showPoints: true,
                    pointRadius: 3,
                    rAxis: { beginAtZero: true },
                    tooltipValueFormat: 'currency',
                    legendPosition: 'bottom',
                    height: 320,
                },
                styles: {},
            },
        ],
    };
};
