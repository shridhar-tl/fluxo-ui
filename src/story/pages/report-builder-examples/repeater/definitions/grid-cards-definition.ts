import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders, type Order } from '../../../report-builder/example-data';

export const buildGridCardsDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Repeater — grid of product cards');
    const highRevenue = orders
        .filter((o: Order) => o.revenue > 1500 && o.status !== 'cancelled' && o.status !== 'refunded')
        .slice(0, 9);

    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(highRevenue) } },
        ],
        parameters: [],
        variables: [],
        components: [
            {
                id: 'c-header',
                type: 'header',
                props: { level: 'h3', content: 'High-revenue orders — 3×3 grid' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'c-repeater',
                type: 'repeater',
                props: {
                    datasourceId: 'ds-orders',
                    layout: 'grid',
                    gridColumns: 3,
                    gap: 12,
                    separator: 'none',
                    emptyMessage: 'No orders matched.',
                },
                styles: {},
                children: [
                    {
                        id: 'c-card',
                        type: 'columns',
                        props: { columnCount: 1 },
                        styles: {
                            backgroundColor: 'var(--eui-bg-subtle)',
                            borderColor: 'var(--eui-border-subtle)',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            borderRadius: 8,
                            paddingTop: 12,
                            paddingBottom: 12,
                            paddingLeft: 14,
                            paddingRight: 14,
                        },
                        children: [
                            {
                                id: 'c-col',
                                type: 'column',
                                props: {},
                                styles: {},
                                children: [
                                    {
                                        id: 'c-card-title',
                                        type: 'header',
                                        props: {
                                            level: 'h5',
                                            content: '=Field.product',
                                        },
                                        styles: { marginBottom: 2 },
                                    },
                                    {
                                        id: 'c-card-meta',
                                        type: 'text',
                                        props: {
                                            content:
                                                '=Concat(Field.region, " · ", Field.category)',
                                        },
                                        styles: { fontSize: 11, textColor: 'var(--eui-text-muted)' },
                                    },
                                    {
                                        id: 'c-card-price',
                                        type: 'header',
                                        props: {
                                            level: 'h4',
                                            content: '=FormatCurrency(Field.revenue, "$", 0)',
                                        },
                                        styles: {
                                            textColor: 'var(--eui-primary)',
                                            marginTop: 6,
                                        },
                                    },
                                    {
                                        id: 'c-card-rep',
                                        type: 'text',
                                        props: {
                                            content: '=Concat("Rep: ", Field.salesRep)',
                                        },
                                        styles: { fontSize: 11, textColor: 'var(--eui-text-muted)' },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };
};
