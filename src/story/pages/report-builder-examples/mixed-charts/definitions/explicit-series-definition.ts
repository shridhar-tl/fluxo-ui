import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

const regionAgg = ['North', 'South', 'East', 'West'].map((region) => {
    const sub = orders.filter((o) => o.region === region);
    return {
        region,
        revenue: sub.reduce((a, b) => a + b.revenue, 0),
        cost: sub.reduce((a, b) => a + b.cost, 0),
        margin: sub.reduce((a, b) => a + (b.revenue - b.cost), 0),
        units: sub.reduce((a, b) => a + b.units, 0),
    };
});

export const buildExplicitSeriesDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Explicit ChartSeriesConfig');
    return {
        ...base,
        datasources: [
            { id: 'ds-rev', name: 'regionAgg', type: 'static-json', config: { json: JSON.stringify(regionAgg) } },
        ],
        parameters: [],
        variables: [],
        components: [
            {
                id: 'c-chart',
                type: 'chart-bar',
                props: {
                    datasourceId: 'ds-rev',
                    title: 'Revenue vs Cost vs Margin (per-series colours)',
                    subtitle: 'The `series` array lets you hand-pick label / colour / borderWidth for each series.',
                    xAxisField: 'region',
                    aggregation: 'none',
                    series: [
                        { id: 'revenue', label: 'Revenue', valueField: 'revenue', color: '#6366f1' },
                        { id: 'cost', label: 'Cost', valueField: 'cost', color: '#f97316' },
                        { id: 'margin', label: 'Margin', valueField: 'margin', color: '#10b981' },
                    ],
                    tooltipValueFormat: 'currency',
                    yAxis: { format: 'currency', beginAtZero: true },
                    barBorderRadius: 4,
                    legendPosition: 'top',
                    height: 320,
                },
                styles: {},
            },
        ],
    };
};
