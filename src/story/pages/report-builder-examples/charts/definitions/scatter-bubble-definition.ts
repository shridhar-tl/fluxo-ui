import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildScatterBubbleDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Scatter & Bubble');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        parameters: [],
        variables: [],
        components: [
            {
                id: 'c-scatter',
                type: 'chart-scatter',
                props: {
                    datasourceId: 'ds-orders',
                    title: 'Units × Revenue (by Category)',
                    subtitle: 'Scatter always uses aggregation: "none" — each row is one point.',
                    xAxisField: 'units',
                    yAxisField: 'revenue',
                    seriesField: 'category',
                    pointRadius: 5,
                    pointStyle: 'circle',
                    tooltipValueFormat: 'currency',
                    xAxis: { title: 'Units' },
                    yAxis: { title: 'Revenue', format: 'currency' },
                    legendPosition: 'top',
                    height: 320,
                },
                styles: { marginBottom: 16 },
            },
            {
                id: 'c-bubble',
                type: 'chart-bubble',
                props: {
                    datasourceId: 'ds-orders',
                    title: 'Units × Revenue sized by Cost',
                    subtitle: 'Bubble adds radiusField + radiusScale on top of scatter.',
                    xAxisField: 'units',
                    yAxisField: 'revenue',
                    radiusField: 'cost',
                    radiusScale: 0.02,
                    seriesField: 'region',
                    tooltipValueFormat: 'currency',
                    xAxis: { title: 'Units' },
                    yAxis: { title: 'Revenue', format: 'currency' },
                    legendPosition: 'bottom',
                    height: 340,
                },
                styles: {},
            },
        ],
    };
};
