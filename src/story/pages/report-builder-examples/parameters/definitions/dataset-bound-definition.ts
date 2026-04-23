import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

const uniqueRegions = Array.from(new Set(orders.map((o) => o.region))).map((r) => ({ value: r, label: r }));
const uniqueCountries = Array.from(new Set(orders.map((o) => o.country))).map((c) => ({ value: c, label: c }));

export const buildDatasetBoundDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Dataset-bound parameter options');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
            { id: 'ds-regions', name: 'regions', type: 'static-json', config: { json: JSON.stringify(uniqueRegions) } },
            { id: 'ds-countries', name: 'countries', type: 'static-json', config: { json: JSON.stringify(uniqueCountries) } },
        ],
        parameters: [
            {
                id: 'p-region',
                name: 'region',
                type: 'dropdown',
                label: 'Region (options from ds-regions)',
                mandatory: false,
                typeConfig: {},
                datasetId: 'ds-regions',
                displayField: 'label',
                valueField: 'value',
                defaultValue: '',
                width: 2,
            },
            {
                id: 'p-country',
                name: 'country',
                type: 'autocomplete',
                label: 'Country (autocomplete, dataset-bound)',
                mandatory: false,
                typeConfig: { minQueryLength: 0 },
                datasetId: 'ds-countries',
                displayField: 'label',
                valueField: 'value',
                defaultValue: '',
                width: 2,
            },
        ],
        variables: [],
        components: [
            {
                id: 'c-help',
                type: 'text',
                props: {
                    content:
                        'Parameters can draw options from a datasource instead of hard-coding them. Set datasetId + displayField + valueField on the parameter. The viewer rebuilds the options on every datasource fetch, so parameter-driven datasets compose naturally.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 10 },
            },
            {
                id: 'c-table',
                type: 'table',
                props: {
                    datasourceId: 'ds-orders',
                    columns: [
                        { id: 'c-id', field: 'id', label: 'Order', width: '110px' },
                        { id: 'c-region', field: 'region', label: 'Region', width: '100px' },
                        { id: 'c-country', field: 'country', label: 'Country', width: '120px' },
                        { id: 'c-product', field: 'product', label: 'Product' },
                        {
                            id: 'c-revenue',
                            field: 'revenue',
                            label: 'Revenue',
                            align: 'right',
                            width: '130px',
                            formatExpr: "FormatCurrency(Field.revenue, '$', 0)",
                        },
                    ],
                    rowVisibleExpr:
                        "(IsEmpty(Parameters.region) || Field.region == Parameters.region) && (IsEmpty(Parameters.country) || Field.country == Parameters.country)",
                    enableSorting: true,
                },
                styles: {},
            },
        ],
    };
};
