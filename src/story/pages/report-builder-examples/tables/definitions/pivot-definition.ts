import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildPivotDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Pivot Mode');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        parameters: [],
        variables: [],
        components: [
            {
                id: 'c-header',
                type: 'header',
                props: { level: 'h3', content: 'Pivot mode' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'c-text',
                type: 'text',
                props: {
                    content:
                        'Set pivotMode to true and specify the row, column, value fields, and the aggregation. Here: Region rows × Category columns × Sum of revenue. The renderer builds the column matrix from the distinct values seen in the data.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 10 },
            },
            {
                id: 'c-table',
                type: 'table',
                props: {
                    datasourceId: 'ds-orders',
                    columns: [
                        { id: 'c-region', field: 'region', label: 'Region', sortable: true },
                    ],
                    pivotMode: true,
                    pivotRowField: 'region',
                    pivotColumnField: 'category',
                    pivotValueField: 'revenue',
                    pivotAggregation: 'sum',
                    enableSorting: true,
                },
                styles: {},
            },
        ],
    };
};
