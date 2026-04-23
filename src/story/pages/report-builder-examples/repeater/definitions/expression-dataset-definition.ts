import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildExpressionDatasetDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Repeater — expression dataset');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        parameters: [
            {
                id: 'p-min',
                name: 'minRevenue',
                type: 'numeric',
                label: 'Minimum revenue',
                mandatory: false,
                defaultValue: 2000,
                typeConfig: { min: 0, step: 100 },
            },
        ],
        variables: [],
        components: [
            {
                id: 'c-header',
                type: 'header',
                props: { level: 'h3', content: 'Expression-driven dataset' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'c-help',
                type: 'text',
                props: {
                    content:
                        'The repeater is not bound to a datasource. Instead its dataset expression pulls Datasources.orders directly and the per-row filter does the work. This is useful when you want to iterate over a projection that has no dedicated datasource — e.g. a derived list.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 10 },
            },
            {
                id: 'c-summary',
                type: 'text',
                props: {
                    content:
                        '=Concat("Orders above ", FormatCurrency(Parameters.minRevenue, "$", 0), ": ", Count(Datasources.orders, "revenue"))',
                },
                styles: { fontWeight: '600', marginBottom: 8 },
            },
            {
                id: 'c-repeater',
                type: 'repeater',
                props: {
                    datasetExpression: '=Datasources.orders',
                    filter: '=Field.revenue >= Parameters.minRevenue && Field.status == "paid"',
                    sortBy: '=Field.revenue',
                    sortDirection: 'desc',
                    limit: 6,
                    layout: 'inline',
                    gap: 10,
                    inlineWrap: true,
                    emptyMessage: 'No paid orders above the threshold.',
                    hideWhenEmpty: false,
                },
                styles: {},
                children: [
                    {
                        id: 'c-chip',
                        type: 'text',
                        props: {
                            content:
                                '=Concat("#", Variables.iterationNumber, " · ", Field.product, " — ", FormatCurrency(Field.revenue, "$", 0))',
                        },
                        styles: {
                            backgroundColor: 'var(--eui-primary-soft)',
                            textColor: 'var(--eui-primary)',
                            paddingTop: 6,
                            paddingBottom: 6,
                            paddingLeft: 12,
                            paddingRight: 12,
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: '600',
                        },
                    },
                ],
            },
        ],
    };
};
