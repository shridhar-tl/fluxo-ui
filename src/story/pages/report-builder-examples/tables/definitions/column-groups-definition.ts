import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { employees } from '../../../report-builder/example-data';

export const buildColumnGroupsDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Employee Roster — Nested Columns');
    return {
        ...base,
        datasources: [
            { id: 'ds-emp', name: 'employees', type: 'static-json', config: { json: JSON.stringify(employees) } },
        ],
        parameters: [
            {
                id: 'p-onlyActive',
                name: 'onlyActive',
                type: 'checkbox',
                label: 'Only active',
                mandatory: false,
                typeConfig: {},
                defaultValue: true,
                width: 1,
            },
        ],
        variables: [],
        components: [
            {
                id: 'c-header',
                type: 'header',
                props: { level: 'h3', content: 'Employee Roster' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'c-text',
                type: 'text',
                props: {
                    content:
                        'Columns are organised under three top-level groups: Personal, Role, Compensation. Group nodes can nest recursively — the header matrix is computed from the tree depth automatically.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 10 },
            },
            {
                id: 'c-table',
                type: 'table',
                props: {
                    datasourceId: 'ds-emp',
                    columnTree: [
                        {
                            kind: 'group',
                            id: 'g-personal',
                            label: 'Personal',
                            children: [
                                { kind: 'column', id: 'c-id', field: 'id', label: 'ID', width: '90px' },
                                { kind: 'column', id: 'c-name', field: 'name', label: 'Name' },
                                { kind: 'column', id: 'c-location', field: 'location', label: 'Location', width: '90px' },
                            ],
                        },
                        {
                            kind: 'group',
                            id: 'g-role',
                            label: 'Role',
                            children: [
                                { kind: 'column', id: 'c-dept', field: 'department', label: 'Department' },
                                { kind: 'column', id: 'c-level', field: 'level', label: 'Level', width: '90px' },
                                { kind: 'column', id: 'c-mgr', field: 'manager', label: 'Manager' },
                            ],
                        },
                        {
                            kind: 'group',
                            id: 'g-comp',
                            label: 'Compensation',
                            children: [
                                {
                                    kind: 'column',
                                    id: 'c-salary',
                                    field: 'salary',
                                    label: 'Salary',
                                    align: 'right',
                                    width: '110px',
                                    formatExpr: "FormatCurrency(Field.salary, '$', 0)",
                                },
                                {
                                    kind: 'column',
                                    id: 'c-perf',
                                    field: 'performance',
                                    label: 'Rating',
                                    align: 'right',
                                    width: '80px',
                                    formatExpr: 'Round(Field.performance, 1)',
                                },
                            ],
                        },
                    ],
                    rowVisibleExpr: '=!Parameters.onlyActive || Field.active',
                    enableSorting: true,
                },
                styles: {},
            },
        ],
    };
};
