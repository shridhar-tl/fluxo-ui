import React from 'react';
import {
    createEmptyDefinition,
    type ReportDefinition,
} from '../../../../components/report-builder';
import { employees } from '../example-data';
import { ExampleShowcase, type ExpressionHighlight } from './ExampleShowcase';

const definition: ReportDefinition = (() => {
    const base = createEmptyDefinition('Employee Roster');
    const def: ReportDefinition = {
        ...base,
        parameters: [
            {
                id: 'p-onlyActive',
                name: 'onlyActive',
                type: 'checkbox',
                label: 'Only active employees',
                mandatory: false,
                typeConfig: {},
                defaultValue: true,
                width: 1,
            },
        ],
        datasources: [
            { id: 'ds-emp', name: 'employees', type: 'static-json', config: { json: JSON.stringify(employees) } },
        ],
        components: [
            {
                id: 'hdr',
                type: 'header',
                props: { level: 'h2', content: 'Employee Roster' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'sub',
                type: 'text',
                props: {
                    content:
                        'Columns are organised under three top-level groups (Personal, Role, Compensation). ' +
                        'The header renders as a nested thead with colSpan/rowSpan.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 12 },
            },
            {
                id: 'tbl',
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
                                { kind: 'column', id: 'c-level', field: 'level', label: 'Level', width: '80px' },
                                {
                                    kind: 'column',
                                    id: 'c-hire',
                                    field: 'hireDate',
                                    label: 'Hired',
                                    width: '110px',
                                    formatExpr: "FormatDate(Field.hireDate, 'MM/DD/YYYY')",
                                },
                                {
                                    kind: 'column',
                                    id: 'c-tenure',
                                    field: 'tenure',
                                    label: 'Tenure (yrs)',
                                    align: 'right',
                                    width: '100px',
                                    formatExpr: 'Round(DateDiff("day", Field.hireDate, Today()) / 365, 1)',
                                },
                            ],
                        },
                        {
                            kind: 'group',
                            id: 'g-comp',
                            label: 'Compensation & Performance',
                            children: [
                                {
                                    kind: 'column',
                                    id: 'c-salary',
                                    field: 'salary',
                                    label: 'Salary',
                                    align: 'right',
                                    width: '120px',
                                    formatExpr: "FormatCurrency(Field.salary, '$', 0)",
                                },
                                {
                                    kind: 'column',
                                    id: 'c-perf',
                                    field: 'performance',
                                    label: 'Perf.',
                                    align: 'right',
                                    width: '80px',
                                    conditionalFormats: [
                                        { id: 'cf-low', expression: 'Field.performance < 3.2', backgroundColor: '#fee2e2', textColor: '#991b1b' },
                                        { id: 'cf-high', expression: 'Field.performance >= 4.5', backgroundColor: '#dcfce7', textColor: '#166534' },
                                    ],
                                },
                            ],
                        },
                    ],
                    columns: [],
                    rowVisibleExpr: '!Parameters.onlyActive || Field.active == true',
                    enableSorting: true,
                },
                styles: {},
            },
        ],
    };
    return def;
})();

const highlights: ExpressionHighlight[] = [
    {
        label: 'Tenure in years (computed from hireDate)',
        expression: 'Round(DateDiff("day", Field.hireDate, Today()) / 365, 1)',
        explanation:
            'DateDiff returns the number of days between two ISO dates. Dividing by 365 and rounding to 1 decimal produces a tenure figure. ' +
            'Today() returns the current date as an ISO string.',
    },
    {
        label: 'Formatted hire date',
        expression: "FormatDate(Field.hireDate, 'MM/DD/YYYY')",
        explanation:
            'FormatDate supports YYYY, MM, DD tokens. For more advanced formatting, compose with Year/Month/Day helpers: ' +
            "Concat(Year(Field.hireDate), '-', Month(Field.hireDate)).",
    },
    {
        label: 'Conditional formatting: low performance in red, high in green',
        expression: 'Field.performance < 3.2',
        explanation:
            'Each conditional-format rule is an expression evaluated against the row. When true, the cell applies the defined background/text color. ' +
            'Multiple rules can stack — later rules override earlier ones.',
    },
    {
        label: 'Row visibility: "Only active" checkbox',
        expression: '!Parameters.onlyActive || Field.active == true',
        explanation:
            'Boolean checkbox parameters work well with short-circuit OR. Using ! (Not) gives the "unchecked = show all" semantic.',
    },
];

export const ColumnGroupsExample: React.FC = () => (
    <ExampleShowcase
        title="3 · Nested column groups"
        description="Columns organised into three top-level groups. The header matrix renders with proper colSpan (group cells) and rowSpan (leaf cells spanning unused group depth)."
        definition={definition}
        highlights={highlights}
    />
);
