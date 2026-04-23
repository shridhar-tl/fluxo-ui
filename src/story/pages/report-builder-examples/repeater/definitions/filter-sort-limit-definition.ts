import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildFilterSortLimitDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Repeater — filter, sort, limit');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        parameters: [
            {
                id: 'p-region',
                name: 'regionFilter',
                type: 'dropdown',
                label: 'Region',
                mandatory: false,
                defaultValue: 'North',
                typeConfig: {
                    options: [
                        { label: 'North', value: 'North' },
                        { label: 'South', value: 'South' },
                        { label: 'East', value: 'East' },
                        { label: 'West', value: 'West' },
                    ],
                },
            },
            {
                id: 'p-top',
                name: 'topN',
                type: 'numeric',
                label: 'Show top N',
                mandatory: false,
                defaultValue: 5,
                typeConfig: { min: 1, max: 20 },
            },
        ],
        variables: [],
        components: [
            {
                id: 'c-header',
                type: 'header',
                props: { level: 'h3', content: 'Top-N orders in the selected region' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'c-help',
                type: 'text',
                props: {
                    content:
                        'Pick a region and how many rows to show. The repeater filters by Field.region == Parameters.regionFilter, sorts by revenue descending, and limits to Parameters.topN.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 10 },
            },
            {
                id: 'c-repeater',
                type: 'repeater',
                props: {
                    datasourceId: 'ds-orders',
                    filter: '=Field.region == Parameters.regionFilter && Field.status != "cancelled"',
                    sortBy: '=Field.revenue',
                    sortDirection: 'desc',
                    limit: '=Parameters.topN',
                    layout: 'stack',
                    gap: 8,
                    separator: 'line',
                    emptyMessage: 'No orders matched the filter.',
                },
                styles: {},
                children: [
                    {
                        id: 'c-row',
                        type: 'columns',
                        props: { columnCount: 3 },
                        styles: {},
                        children: [
                            {
                                id: 'c-col-rank',
                                type: 'column',
                                props: {},
                                styles: {},
                                children: [
                                    {
                                        id: 'c-rank',
                                        type: 'header',
                                        props: {
                                            level: 'h4',
                                            content: '=Concat("#", Variables.iterationNumber)',
                                        },
                                        styles: { textColor: 'var(--eui-primary)' },
                                    },
                                    {
                                        id: 'c-id',
                                        type: 'text',
                                        props: {
                                            content: '=Field.id',
                                        },
                                        styles: { fontSize: 11, textColor: 'var(--eui-text-muted)' },
                                    },
                                ],
                            },
                            {
                                id: 'c-col-product',
                                type: 'column',
                                props: {},
                                styles: {},
                                children: [
                                    {
                                        id: 'c-product',
                                        type: 'header',
                                        props: { level: 'h5', content: '=Field.product' },
                                        styles: {},
                                    },
                                    {
                                        id: 'c-meta',
                                        type: 'text',
                                        props: {
                                            content: '=Concat(Field.category, " · ", Field.salesRep)',
                                        },
                                        styles: { fontSize: 11, textColor: 'var(--eui-text-muted)' },
                                    },
                                ],
                            },
                            {
                                id: 'c-col-rev',
                                type: 'column',
                                props: {},
                                styles: {},
                                children: [
                                    {
                                        id: 'c-rev',
                                        type: 'header',
                                        props: {
                                            level: 'h4',
                                            content: '=FormatCurrency(Field.revenue, "$", 0)',
                                        },
                                        styles: {
                                            textAlign: 'right',
                                        },
                                    },
                                    {
                                        id: 'c-units',
                                        type: 'text',
                                        props: {
                                            content: '=Concat(Field.units, " units")',
                                        },
                                        styles: { fontSize: 11, textColor: 'var(--eui-text-muted)', textAlign: 'right' },
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
