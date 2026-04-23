import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildBasicCardsDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Basic Repeater — cards');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders.slice(0, 6)) } },
        ],
        parameters: [],
        variables: [],
        components: [
            {
                id: 'c-header',
                type: 'header',
                props: { level: 'h3', content: 'First 6 orders' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'c-help',
                type: 'text',
                props: {
                    content:
                        'The repeater renders its children once per row. Child expressions use Field.<name> to access the current row.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 10 },
            },
            {
                id: 'c-repeater',
                type: 'repeater',
                props: {
                    datasourceId: 'ds-orders',
                    layout: 'stack',
                    gap: 10,
                    separator: 'line',
                    alternateRowBackground: true,
                    emptyMessage: 'No orders.',
                },
                styles: {},
                children: [
                    {
                        id: 'c-row-title',
                        type: 'header',
                        props: {
                            level: 'h5',
                            content: '=Concat(Field.id, " · ", Field.product)',
                        },
                        styles: {},
                    },
                    {
                        id: 'c-row-body',
                        type: 'text',
                        props: {
                            content:
                                '=Concat("Region: ", Field.region, " · Units: ", Field.units, " · Revenue ", FormatCurrency(Field.revenue, "$", 0))',
                        },
                        styles: { fontSize: 12, textColor: 'var(--eui-text-muted)' },
                    },
                ],
            },
        ],
    };
};
