import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildLineAreaDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Line & Area');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        parameters: [],
        variables: [],
        components: [
            {
                id: 'c-line',
                type: 'chart-line',
                props: {
                    datasourceId: 'ds-orders',
                    title: 'Revenue over time',
                    subtitle: 'lineTension smooths the curve. Set pointStyle for the marker shape.',
                    xAxisField: 'orderDate',
                    yAxisField: 'revenue',
                    aggregation: 'sum',
                    lineTension: 0.35,
                    showPoints: true,
                    pointStyle: 'circle',
                    pointRadius: 3,
                    lineBorderWidth: 2,
                    tooltipValueFormat: 'currency',
                    yAxis: { format: 'currency' },
                    colors: ['#0ea5e9'],
                    height: 280,
                    animate: true,
                },
                styles: { marginBottom: 16 },
            },
            {
                id: 'c-area',
                type: 'chart-area',
                props: {
                    datasourceId: 'ds-orders',
                    title: 'Revenue over time — area fill',
                    subtitle: 'Same data, areaFill = true, lineTension = 0 for a staircase look',
                    xAxisField: 'orderDate',
                    yAxisField: 'revenue',
                    aggregation: 'sum',
                    lineTension: 0,
                    showPoints: false,
                    areaFill: true,
                    tooltipValueFormat: 'currency',
                    yAxis: { format: 'currency' },
                    colors: ['#a855f7'],
                    height: 260,
                },
                styles: {},
            },
        ],
    };
};
