import React from 'react';
import {
    createEmptyDefinition,
    type ReportDefinition,
} from '../../../../components/report-builder';
import { orders } from '../example-data';
import { ExampleShowcase, type ExpressionHighlight } from './ExampleShowcase';

const definition: ReportDefinition = (() => {
    const base = createEmptyDefinition('Lookup with Validations');
    const def: ReportDefinition = {
        ...base,
        parameters: [
            {
                id: 'p-orderId',
                name: 'orderId',
                type: 'text',
                label: 'Order ID',
                description: 'Required — format ORD-0001',
                mandatory: true,
                typeConfig: { placeholder: 'ORD-0001' },
                validation: {
                    regex: '^ORD-\\d{4}$',
                    regexMessage: 'Order ID must look like ORD-1234',
                    keyfilter: '[A-Za-z0-9-]',
                    minLength: 8,
                    maxLength: 8,
                },
                width: 0.5,
            },
            {
                id: 'p-customerEmail',
                name: 'customerEmail',
                type: 'text',
                label: 'Customer Email',
                description: 'Required — standard email format',
                mandatory: true,
                typeConfig: { placeholder: 'name@example.com' },
                validation: {
                    regex: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',
                    regexMessage: 'Must be a valid email address',
                    maxLength: 120,
                },
                width: 0.5,
            },
            {
                id: 'p-minRev',
                name: 'minRev',
                type: 'numeric',
                label: 'Min Revenue',
                description: 'Required; must be between 0 and 1,000,000',
                mandatory: true,
                typeConfig: { min: 0, max: 1_000_000, step: 100 },
                validation: { minValue: 0, maxValue: 1_000_000 },
                defaultValue: 0,
                width: 0.5,
            },
            {
                id: 'p-maxRev',
                name: 'maxRev',
                type: 'numeric',
                label: 'Max Revenue',
                description: 'Optional — leave blank for no ceiling',
                mandatory: false,
                typeConfig: { min: 0, max: 1_000_000, step: 100 },
                validation: { minValue: 0, maxValue: 1_000_000 },
                width: 0.5,
            },
            {
                id: 'p-regions',
                name: 'regions',
                type: 'multi-select',
                label: 'Regions (pick 1–3)',
                description: 'Required — at least one, up to three',
                mandatory: true,
                typeConfig: {
                    options: [
                        { label: 'North', value: 'North' },
                        { label: 'South', value: 'South' },
                        { label: 'East', value: 'East' },
                        { label: 'West', value: 'West' },
                    ],
                },
                validation: { minItems: 1, maxItems: 3 },
                defaultValue: ['North'],
                width: 1,
            },
            {
                id: 'p-productCode',
                name: 'productCode',
                type: 'masked-edit',
                label: 'Product Code (optional)',
                description: 'Optional — format AA-0000',
                mandatory: false,
                typeConfig: { mask: 'AA-9999' },
                validation: {
                    regex: '^[A-Z]{2}-\\d{4}$',
                    regexMessage: 'Format AA-0000',
                },
                width: 0.5,
            },
            {
                id: 'p-notes',
                name: 'notes',
                type: 'text',
                label: 'Notes (optional, max 200)',
                description: 'Optional free-text',
                mandatory: false,
                typeConfig: { multiline: true, placeholder: 'Internal notes…' },
                validation: { maxLength: 200 },
                width: 0.5,
            },
            {
                id: 'p-attachment',
                name: 'attachment',
                type: 'file',
                label: 'Attachment (optional)',
                description: 'CSV or Excel, max 5 MB',
                mandatory: false,
                typeConfig: {},
                validation: {
                    allowedFileTypes: '.csv,.xls,.xlsx',
                    maxFileSize: 5 * 1024 * 1024,
                },
                width: 1,
            },
        ],
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        components: [
            {
                id: 'hdr',
                type: 'header',
                props: { level: 'h2', content: 'Order Lookup with Validations' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'sub',
                type: 'text',
                props: {
                    content:
                        'All validation happens inside the component — required fields are blocked from running the report, and format errors show inline. ' +
                        'Notice the key-filter (Order ID rejects spaces / symbols while typing), regex patterns, numeric ranges, min/max items on the multi-select, and file-type + size limits on the attachment.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 12 },
            },
            {
                id: 'tbl',
                type: 'table',
                props: {
                    datasourceId: 'ds-orders',
                    columns: [
                        { id: 'c-id', field: 'id', label: 'Order' },
                        { id: 'c-region', field: 'region', label: 'Region' },
                        { id: 'c-product', field: 'product', label: 'Product' },
                        {
                            id: 'c-rev',
                            field: 'revenue',
                            label: 'Revenue',
                            align: 'right',
                            formatExpr: "FormatCurrency(Field.revenue, '$', 0)",
                        },
                    ],
                    rowVisibleExpr:
                        "(IsEmpty(Parameters.orderId) || Field.id == Parameters.orderId) && " +
                        "InList(Field.region, Parameters.regions) && " +
                        "Field.revenue >= Parameters.minRev && " +
                        "(IsEmpty(Parameters.maxRev) || Field.revenue <= Parameters.maxRev)",
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
        label: 'Required + regex + keyfilter on a text parameter',
        expression:
            "mandatory: true\nvalidation: {\n  regex: '^ORD-\\\\d{4}$',\n  regexMessage: 'Order ID must look like ORD-1234',\n  keyfilter: '[A-Za-z0-9-]',\n  minLength: 8,\n  maxLength: 8,\n}",
        explanation:
            'mandatory blocks Apply when empty. regex validates on submit and shows regexMessage when invalid. ' +
            'keyfilter is applied per-keystroke (typing a space or symbol is silently blocked). Min/max length is also checked.',
    },
    {
        label: 'Numeric range validation',
        expression: 'validation: { minValue: 0, maxValue: 1_000_000 }',
        explanation:
            'Applies at submit. If the user types out-of-range values the Apply button keeps the errors visible until they fix them.',
    },
    {
        label: 'Multi-select min/max items',
        expression: 'mandatory: true, validation: { minItems: 1, maxItems: 3 }',
        explanation:
            'minItems + maxItems validate how many entries the user has selected. Useful for "pick at most N" UX.',
    },
    {
        label: 'File type + size limits',
        expression:
            "validation: {\n  allowedFileTypes: '.csv,.xls,.xlsx',\n  maxFileSize: 5 * 1024 * 1024,\n}",
        explanation:
            'The FileUpload component surfaces a preview and file-type / size errors. Validation runs again at Apply time in case the user tampered.',
    },
    {
        label: 'Expression handles "optional" filter via IsEmpty',
        expression: '(IsEmpty(Parameters.maxRev) || Field.revenue <= Parameters.maxRev)',
        explanation:
            'Optional filters use IsEmpty() as a short-circuit. When the user leaves maxRev blank, the whole clause is true, so that filter is effectively disabled.',
    },
];

export const ParameterValidationExample: React.FC = () => (
    <ExampleShowcase
        title="7 · Mandatory + optional parameters with validation"
        description="Shows required fields blocking Apply, regex/length/range/items/file-type validation, and how optional parameters gracefully skip their filter clause via IsEmpty()."
        definition={definition}
        highlights={highlights}
        defaultParameterValues={{}}
    />
);
