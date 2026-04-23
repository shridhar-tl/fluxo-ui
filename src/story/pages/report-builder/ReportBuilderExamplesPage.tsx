import React from 'react';
import PageLayout from '../../PageLayout';
import type { SectionNavItem } from '../../SectionNav';
import { CodeBlock } from '../../CodeBlock';
import { CellItemsExample } from './examples/CellItemsExample';
import { ColumnGroupsExample } from './examples/ColumnGroupsExample';
import { ConditionalVisibilityExample } from './examples/ConditionalVisibilityExample';
import { HeadFooterExample } from './examples/HeadFooterExample';
import { ParameterFilteringExample } from './examples/ParameterFilteringExample';
import { ParameterValidationExample } from './examples/ParameterValidationExample';
import { RowGroupsExample } from './examples/RowGroupsExample';
import { SubReportInclusionExample } from './examples/SubReportInclusionExample';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'What you will see' },
    { id: 'ex-filter', title: '1 · Filtering', description: 'Parameter-driven filters' },
    { id: 'ex-rowgroups', title: '2 · Row Groups', description: 'Multi-level aggregates' },
    { id: 'ex-colgroups', title: '3 · Column Groups', description: 'Nested headers' },
    { id: 'ex-visibility', title: '4 · Conditional Visibility', description: 'Show/hide sections' },
    { id: 'ex-cells', title: '5 · Cell Items & Drill', description: 'Multi-item cells' },
    { id: 'ex-headfoot', title: '6 · Head/Footer', description: 'Totals & banners' },
    { id: 'ex-validation', title: '7 · Validations', description: 'Required + validation rules' },
    { id: 'ex-subreport', title: '8 · Sub-report', description: 'Embed a report inside a report' },
    { id: 'expr-ref', title: 'Expression Reference', description: 'Helpers quick guide' },
];

const expressionReference = `// === Namespaces ===
Datasources.<name>.<field>     // array of field values (aggregate target)
Datasources.<name>             // the raw array of row objects (pass to Sum/Count/Avg/Min/Max)
Parameters.<name>              // parameter value; property path supported (Parameters.dateRange.fromDate)
Field.<name>                   // field of the current row (in table cell / row-visible context)
Field('a.b.c')                 // safe nested-field access (rejects __proto__ / constructor / prototype)
RowGroup('name').key           // key of current row-group frame
RowGroup('name').keys          // array of keys when using multi-key grouping
RowGroup('name').values        // array of row objects in the group
RowGroup('name').Fields.<f>    // field of the group's first row
RowGroup('name').Variables.<v> // group-scoped variable value
ColGroup('name').…             // same shape for column groups
Variables.<name>               // row-group-local variables (shortcut)

// === Aggregates ===
Sum(Datasources.orders.revenue)              // numeric array form
Sum(Datasources.orders, 'revenue')           // (rows, fieldName) form — preferred when you have raw rows
Count(Datasources.orders)                    // row count
Count(Datasources.orders, 'status')          // non-null count for a field
Avg(rows, 'unitPrice')
Min(rows, 'orderDate')
Max(rows, 'revenue')

// === Conditionals ===
IIf(cond, trueValue, falseValue)             // two-way
Switch(value, case1, result1, case2, result2, defaultResult)
!expr / expr && expr / expr || expr
expr == expr / != / < / > / <= / >=

// === Text ===
Concat(a, b, c, …)
Upper / Lower / Trim / Len / Length
Mid(str, 1, 3)                               // 1-based start
Replace(s, find, replaceWith)
StartsWith / EndsWith / Contains
PadLeft(v, 5, '0')  /  PadRight(v, 10, ' ')

// === Numeric / formatting ===
Round(v, decimals)  Floor(v)  Ceil(v)  Abs(v)
FormatNumber(12345.6, 2, ',')                // "12,345.60"
FormatCurrency(12345, '$', 0)                // "$12,345"
FormatPercent(0.128, 1)                      // "12.8%"

// === Dates ===
Today() / Now()
Year(d) / Month(d) / Day(d) / WeekDay(d)
DateAdd('day' | 'month' | 'year' | 'hour', amount, date)
DateDiff('day' | 'hour', date1, date2)
FormatDate(d, 'YYYY-MM-DD')

// === Null / empty handling ===
IsNull(v) / IsEmpty(v) / Coalesce(a, b, c, …)
IfNull(v, fallback)
InList(value, [a, b, c])                     // true if value is in the list
Between(value, min, max)                     // inclusive
Any(arr) / All(arr)
`;

export const ReportBuilderExamplesPage: React.FC = () => {
    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 style={{ color: 'var(--eui-text)' }} className="text-2xl md:text-4xl font-bold mb-4">
                    Report Builder Examples
                </h1>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-base md:text-lg mb-4">
                    Eight worked examples showing how parameters, grouping, column trees, conditional visibility, cell items,
                    head/footer rows, validation, and sub-report inclusion compose into real-world reports. Every example ships with
                    its full JSON definition and a list of the key expressions used.
                </p>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-2">
                    Tip: open the <em>Definition</em> tab inside each example to see the exact JSON that drives it. Copy-paste into
                    your own ReportViewer as a starting point.
                </p>
            </div>

            <section id="ex-filter" className="scroll-mt-8"><ParameterFilteringExample /></section>
            <section id="ex-rowgroups" className="scroll-mt-8"><RowGroupsExample /></section>
            <section id="ex-colgroups" className="scroll-mt-8"><ColumnGroupsExample /></section>
            <section id="ex-visibility" className="scroll-mt-8"><ConditionalVisibilityExample /></section>
            <section id="ex-cells" className="scroll-mt-8"><CellItemsExample /></section>
            <section id="ex-headfoot" className="scroll-mt-8"><HeadFooterExample /></section>
            <section id="ex-validation" className="scroll-mt-8"><ParameterValidationExample /></section>
            <section id="ex-subreport" className="scroll-mt-8"><SubReportInclusionExample /></section>

            <section id="expr-ref" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-4">Expression Reference</h2>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-4">
                    Quick cheat-sheet of the expression language used across format expressions, row-visibility, conditional formatting,
                    cellItems, and row-group dataset/filter/sort/keys/variables.
                </p>
                <CodeBlock code={expressionReference} language="javascript" />
            </section>
        </PageLayout>
    );
};

export default ReportBuilderExamplesPage;
