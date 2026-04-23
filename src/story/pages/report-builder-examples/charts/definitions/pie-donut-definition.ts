import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildPieDonutDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Pie & Donut');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        parameters: [],
        variables: [],
        components: [
            {
                id: 'c-pie',
                type: 'chart-pie',
                props: {
                    datasourceId: 'ds-orders',
                    title: 'Revenue share by Category',
                    subtitle: 'labelField + valueField. rotation starts the first slice at the top.',
                    labelField: 'category',
                    valueField: 'revenue',
                    aggregation: 'sum',
                    rotation: -90,
                    borderWidth: 2,
                    borderColor: 'var(--eui-bg)',
                    colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'],
                    tooltipValueFormat: 'currency',
                    showDataLabels: true,
                    dataLabelFormat: 'percent',
                    height: 300,
                },
                styles: { marginBottom: 16 },
            },
            {
                id: 'c-donut',
                type: 'chart-donut',
                props: {
                    datasourceId: 'ds-orders',
                    title: 'Donut — 70% cutout',
                    subtitle: 'cutoutPercent controls the hole. Higher values = thinner ring.',
                    labelField: 'region',
                    valueField: 'revenue',
                    aggregation: 'sum',
                    cutoutPercent: 70,
                    borderWidth: 2,
                    borderColor: 'var(--eui-bg)',
                    tooltipValueFormat: 'currency',
                    colors: ['#6366f1', '#ec4899', '#10b981', '#f59e0b'],
                    height: 300,
                },
                styles: {},
            },
        ],
    };
};
