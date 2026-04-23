import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildSeriesFieldDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('seriesField auto-pivot');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        parameters: [],
        variables: [],
        components: [
            {
                id: 'c-chart',
                type: 'chart-bar',
                props: {
                    datasourceId: 'ds-orders',
                    title: 'Revenue by Region × Category',
                    subtitle: 'One y-field (revenue) pivoted into N series via seriesField = category',
                    xAxisField: 'region',
                    yAxisField: 'revenue',
                    seriesField: 'category',
                    aggregation: 'sum',
                    tooltipValueFormat: 'currency',
                    yAxis: { format: 'currency', beginAtZero: true },
                    legendPosition: 'top',
                    barBorderRadius: 4,
                    height: 320,
                },
                styles: {},
            },
        ],
    };
};
