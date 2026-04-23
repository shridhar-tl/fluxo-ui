import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { orders } from '../../../report-builder/example-data';

export const buildSimpleTypesDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Simple parameter types');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        parameters: [
            {
                id: 'p-orderId',
                name: 'orderId',
                type: 'text',
                label: 'Order ID (text, contains)',
                mandatory: false,
                typeConfig: { placeholder: 'e.g. 1015' },
                defaultValue: '',
                width: 1,
            },
            {
                id: 'p-minUnits',
                name: 'minUnits',
                type: 'numeric',
                label: 'Min units',
                mandatory: false,
                typeConfig: { min: 0, max: 100, decimalPlaces: 0, step: 1 },
                defaultValue: 0,
                width: 1,
            },
            {
                id: 'p-start',
                name: 'startDate',
                type: 'date-picker',
                label: 'From (order date >= …)',
                mandatory: false,
                typeConfig: {},
                width: 1,
            },
            {
                id: 'p-range',
                name: 'dateRange',
                type: 'date-range-picker',
                label: 'Date range',
                mandatory: false,
                typeConfig: {},
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
                        'All four inputs are parameters. Enter values in the panel and press Apply. The table\'s rowVisibleExpr combines them with IsEmpty guards so leaving a field blank disables its filter.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 10 },
            },
            {
                id: 'c-table',
                type: 'table',
                props: {
                    datasourceId: 'ds-orders',
                    columns: [
                        { id: 'c-id', field: 'id', label: 'Order', sortable: true, width: '110px' },
                        { id: 'c-date', field: 'orderDate', label: 'Date', sortable: true, width: '120px' },
                        { id: 'c-units', field: 'units', label: 'Units', align: 'right', width: '80px', sortable: true },
                        {
                            id: 'c-revenue',
                            field: 'revenue',
                            label: 'Revenue',
                            align: 'right',
                            sortable: true,
                            formatExpr: "FormatCurrency(Field.revenue, '$', 0)",
                        },
                    ],
                    rowVisibleExpr:
                        "(IsEmpty(Parameters.orderId) || Contains(Field.id, Parameters.orderId)) && (IsEmpty(Parameters.minUnits) || Field.units >= Parameters.minUnits) && (IsEmpty(Parameters.startDate) || Field.orderDate >= Parameters.startDate) && (IsEmpty(Parameters.dateRange) || IsEmpty(Parameters.dateRange.start) || (Field.orderDate >= Parameters.dateRange.start && Field.orderDate <= Parameters.dateRange.end))",
                    enableSorting: true,
                },
                styles: {},
            },
        ],
    };
};
