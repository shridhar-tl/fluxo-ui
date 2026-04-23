import { createEmptyDefinition, type ReportDefinition } from '../../../../../components/report-builder';
import { employees } from '../../../report-builder/example-data';

export const buildValidationDefinition = (): ReportDefinition => {
    const base = createEmptyDefinition('Parameter validation');
    return {
        ...base,
        datasources: [
            { id: 'ds-emp', name: 'employees', type: 'static-json', config: { json: JSON.stringify(employees) } },
        ],
        parameters: [
            {
                id: 'p-name',
                name: 'employeeName',
                type: 'text',
                label: 'Name (min 2 chars)',
                mandatory: true,
                typeConfig: { placeholder: 'e.g. Ada' },
                defaultValue: '',
                width: 2,
                validation: { minLength: 2, maxLength: 40 },
            },
            {
                id: 'p-email',
                name: 'email',
                type: 'text',
                label: 'Email (regex validated)',
                mandatory: false,
                typeConfig: { placeholder: 'user@domain' },
                defaultValue: '',
                width: 2,
                validation: {
                    regex: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',
                    regexMessage: 'Enter a valid email address.',
                },
            },
            {
                id: 'p-salary',
                name: 'minSalary',
                type: 'numeric',
                label: 'Min salary (0–300k)',
                mandatory: false,
                typeConfig: { step: 1000 },
                defaultValue: 0,
                width: 1,
                validation: { minValue: 0, maxValue: 300000 },
            },
            {
                id: 'p-depts',
                name: 'departments',
                type: 'chips',
                label: 'Departments (1–4 items)',
                mandatory: false,
                typeConfig: { allowFreeText: true },
                defaultValue: [],
                width: 2,
                validation: { minItems: 1, maxItems: 4 },
            },
        ],
        variables: [],
        components: [
            {
                id: 'c-help',
                type: 'text',
                props: {
                    content:
                        'Every rule is declarative: mandatory, regex, min/max value, min/max length, min/max items, allowedFileTypes, maxFileSize. The parameter panel shows inline errors and disables Apply until all mandatory + valid rules pass.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 10 },
            },
            {
                id: 'c-table',
                type: 'table',
                props: {
                    datasourceId: 'ds-emp',
                    columns: [
                        { id: 'c-id', field: 'id', label: 'ID', width: '100px' },
                        { id: 'c-name', field: 'name', label: 'Name' },
                        { id: 'c-dept', field: 'department', label: 'Department' },
                        {
                            id: 'c-salary',
                            field: 'salary',
                            label: 'Salary',
                            align: 'right',
                            width: '120px',
                            formatExpr: "FormatCurrency(Field.salary, '$', 0)",
                        },
                    ],
                    rowVisibleExpr:
                        "(IsEmpty(Parameters.employeeName) || Contains(Lower(Field.name), Lower(Parameters.employeeName))) && (IsEmpty(Parameters.minSalary) || Field.salary >= Parameters.minSalary) && (IsEmpty(Parameters.departments) || InList(Field.department, Parameters.departments))",
                    enableSorting: true,
                },
                styles: {},
            },
        ],
    };
};
