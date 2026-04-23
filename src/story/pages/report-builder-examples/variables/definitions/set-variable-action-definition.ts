import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

const modeOptions = [
    { key: 'revenue', label: 'Revenue' },
    { key: 'units', label: 'Units' },
    { key: 'cost', label: 'Cost' },
];

export const buildSetVariableActionDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Set-variable cell actions');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
            { id: 'ds-modes', name: 'modes', type: 'static-json', config: { json: JSON.stringify(modeOptions) } },
        ],
        parameters: [],
        variables: [
            {
                id: 'v-mode',
                name: 'viewMode',
                scope: 'global',
                description: 'Controlled by the three pills below.',
                defaultValueExpression: 'revenue',
            },
        ],
        components: [
            {
                id: 'c-header',
                type: 'header',
                props: { level: 'h3', content: 'Buttons that write to variables' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'c-help',
                type: 'text',
                props: {
                    content:
                        'The three rows in the first table are backed by a tiny `modes` datasource. Each row\'s Label column uses a `set-variable` cell-item that writes the row\'s key into `viewMode`. The main orders table below has a footer expression that reads `Variables.viewMode` via Switch() and shows the matching aggregate.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 10 },
            },
            {
                id: 'c-pills',
                type: 'table',
                props: {
                    datasourceId: 'ds-modes',
                    columns: [
                        {
                            id: 'c-pill',
                            field: 'label',
                            label: 'Click a mode to switch the footer aggregate',
                            cellItems: [
                                {
                                    id: 'pill-item',
                                    type: 'field',
                                    fieldPath: 'label',
                                    clickAction: 'set-variable',
                                    setVariableName: 'viewMode',
                                    setVariableValueExpr: 'Field.key',
                                },
                            ],
                        },
                    ],
                    enableSorting: false,
                },
                styles: { marginBottom: 12 },
            },
            {
                id: 'c-mode-readout',
                type: 'text',
                props: {
                    content: "=Concat('Current mode: ', Variables.viewMode)",
                },
                styles: {
                    fontSize: 12,
                    fontWeight: '600',
                    textColor: 'var(--eui-primary)',
                    marginBottom: 8,
                },
            },
            {
                id: 'c-table',
                type: 'table',
                props: {
                    datasourceId: 'ds-orders',
                    columns: [
                        { id: 'c-id', field: 'id', label: 'Order', width: '110px' },
                        { id: 'c-region', field: 'region', label: 'Region', width: '100px' },
                        { id: 'c-product', field: 'product', label: 'Product' },
                        { id: 'c-units', field: 'units', label: 'Units', align: 'right', width: '80px' },
                        {
                            id: 'c-revenue',
                            field: 'revenue',
                            label: 'Revenue',
                            align: 'right',
                            width: '130px',
                            formatExpr: "FormatCurrency(Field.revenue, '$', 0)",
                        },
                        {
                            id: 'c-cost',
                            field: 'cost',
                            label: 'Cost',
                            align: 'right',
                            width: '130px',
                            formatExpr: "FormatCurrency(Field.cost, '$', 0)",
                        },
                    ],
                    enableSorting: true,
                    footerRows: [
                        {
                            id: 'ft-total',
                            cells: [
                                { colSpan: 3, align: 'right', textExpression: "Concat('Total (', Variables.viewMode, ')')" },
                                {
                                    colSpan: 3,
                                    align: 'right',
                                    textExpression:
                                        "Switch(Variables.viewMode, 'revenue', FormatCurrency(Sum(Datasources.orders, 'revenue'), '$', 0), 'units', ToString(Sum(Datasources.orders, 'units')), 'cost', FormatCurrency(Sum(Datasources.orders, 'cost'), '$', 0), '')",
                                },
                            ],
                        },
                    ],
                },
                styles: {},
            },
        ],
    };
};
