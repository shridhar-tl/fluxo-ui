import React from 'react';
import PageLayout from '../../../PageLayout';
import type { SectionNavItem } from '../../../SectionNav';
import { ExpressionPlayground } from './ExpressionPlayground';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'How expressions work' },
    { id: 'playground', title: 'Playground', description: 'Live evaluate any expression' },
    { id: 'namespaces', title: 'Namespaces', description: 'Five roots in scope' },
    { id: 'worked-examples', title: 'Worked Examples', description: 'Categorised recipes' },
    { id: 'row-group-scope', title: 'Row-group scope', description: 'Aggregates inside a bucket' },
    { id: 'rules', title: 'Rules & gotchas', description: 'Defaults, safety, types' },
];

interface Example {
    title: string;
    expression: string;
    explanation: string;
}

const categories: Array<{ title: string; description: string; examples: Example[] }> = [
    {
        title: 'Aggregates',
        description: 'Aggregating over a whole datasource, typically in head/footer rows and KPI text.',
        examples: [
            {
                title: 'Total revenue',
                expression: "FormatCurrency(Sum(Datasources.orders, 'revenue'), '$', 0)",
                explanation: 'Sum accepts either an array of numbers or an array of rows + field name. Combine with FormatCurrency for display.',
            },
            {
                title: 'Average performance, one decimal',
                expression: "Round(Avg(Datasources.employees, 'performance'), 1)",
                explanation: 'Avg returns 0 for an empty set — remember to guard with IsEmpty if you want a distinct no-data state.',
            },
            {
                title: 'Count of non-empty emails',
                expression: "Count(Datasources.employees, 'email')",
                explanation: 'Count with a field name only counts rows where the field is not null / undefined — pass no field to count all rows.',
            },
        ],
    },
    {
        title: 'Conditionals',
        description: 'Branching output from a single expression. IIf is the workhorse; Switch is cleaner for many-way dispatch.',
        examples: [
            {
                title: 'Status badge text',
                expression: "IIf(Field.status == 'paid', '✓ Paid', IIf(Field.status == 'pending', '⏳ Pending', '✗ Other'))",
                explanation: 'IIf nests to form if/else-if chains. For three or more branches, prefer Switch.',
            },
            {
                title: 'Switch-based label',
                expression: "Switch(Field.status, 'paid', 'Completed', 'pending', 'In review', 'cancelled', 'Dropped', 'Other')",
                explanation: 'Switch(value, case1, result1, ..., fallback). If the arg count is even, the last arg is used as the default.',
            },
            {
                title: 'Parameter-driven filter clause',
                expression: "IsEmpty(Parameters.region) || Field.region == Parameters.region",
                explanation: 'The optional-filter idiom: IsEmpty short-circuits so a blank parameter disables the clause entirely.',
            },
        ],
    },
    {
        title: 'String / Number formatting',
        description: 'Turn raw values into display strings. All formatters are null-safe and return empty strings on garbage input.',
        examples: [
            {
                title: 'Currency',
                expression: "FormatCurrency(Field.revenue, '€', 2)",
                explanation: 'symbol and decimals default to "$" and 2. Thousands separators are always commas in the default output.',
            },
            {
                title: 'Percent from ratio',
                expression: "FormatPercent(Field.revenue / Field.target, 1)",
                explanation: 'Input is a 0..1 ratio; the formatter multiplies by 100 and appends the % symbol.',
            },
            {
                title: 'Zero-padded invoice id',
                expression: "Concat('INV-', PadLeft(Field.id, 6, '0'))",
                explanation: 'PadLeft / PadRight take a target length and a pad character (default space).',
            },
        ],
    },
    {
        title: 'Dates',
        description: 'Date math and formatting. Dates are ISO strings internally — the functions accept any Date-parseable string.',
        examples: [
            {
                title: 'Today',
                expression: 'Today()',
                explanation: 'Returns "YYYY-MM-DD" in local time. Use Now() for the full ISO timestamp.',
            },
            {
                title: 'Days since order',
                expression: "DateDiff('day', Field.orderDate, Today())",
                explanation: 'Unit may be day/hour/minute. Negative when the second arg is earlier.',
            },
            {
                title: 'Pretty date',
                expression: "FormatDate(Field.orderDate, 'YYYY-MM-DD')",
                explanation: 'Only YYYY, MM, DD tokens today — ship a richer format string if you need other units.',
            },
        ],
    },
    {
        title: 'Variable paths',
        description: 'Variables are writable state. Anything drilled from a table or chart lands in a Variable and can be re-read by expressions elsewhere.',
        examples: [
            {
                title: 'Nested field after drill-through',
                expression: 'Variables.selectedOrder.revenue',
                explanation: 'Drill writes the whole row, so you navigate with .field.nested to pull out what you want.',
            },
            {
                title: 'Gate a section on a selection',
                expression: '!IsEmpty(Variables.selectedOrder)',
                explanation: 'Typical pattern for styles.visible on sub-reports / panels — appear only when a row has been drilled.',
            },
        ],
    },
    {
        title: 'Built-in fields',
        description: 'Host-supplied constants (current user, tenant, feature flags). Combined from initReportBuilder registrations and per-instance props.',
        examples: [
            {
                title: 'Current user name',
                expression: 'BuiltInFields.CurrentUser.name',
                explanation: 'Access like any object path. Getters are resolved lazily on each evaluation, so clock-style values stay fresh.',
            },
            {
                title: 'Environment gate',
                expression: "BuiltInFields.Env == 'production'",
                explanation: 'Returns a boolean you can feed into styles.visible or Hidden (advanced).',
            },
        ],
    },
];

const ReportBuilderExpressionsPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div id="overview">
            <h1 style={{ color: 'var(--eui-text)' }} className="text-2xl md:text-4xl font-bold mb-4">
                Expressions
            </h1>
            <p style={{ color: 'var(--eui-text-muted)' }} className="text-base md:text-lg mb-3">
                Report Builder ships a hand-written expression language. There is no <code>eval</code>,{' '}
                <code>new Function</code>, or string-form <code>setTimeout</code> — every expression goes through a
                typed tokenizer → recursive-descent parser → AST walker. All component props that can be dynamic accept
                an expression by prefixing a <code>=</code> sign; anything else is treated as a literal.
            </p>
            <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-3">
                Most props panels already switch to the expression editor with a single <code>fx</code> toggle; what you
                see in the playground below is the same editor component used in the builder.
            </p>
        </div>

        <section id="playground" className="scroll-mt-8" style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-3">
                Playground
            </h2>
            <ExpressionPlayground />
        </section>

        <section id="namespaces" className="scroll-mt-8" style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-3">
                Namespaces
            </h2>
            <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-3">
                Only the following identifier roots are recognised. Anything else is an unknown identifier.
            </p>
            <ul style={{ color: 'var(--eui-text-muted)', fontSize: 13, lineHeight: 1.7, paddingLeft: 20, listStyleType: 'disc' }}>
                <li><code>Datasources.&lt;name&gt;</code> / <code>Datasources.&lt;name&gt;.&lt;field&gt;</code> — rows or a projected field array</li>
                <li><code>Parameters.&lt;name&gt;</code> (with optional <code>.path.to.field</code>) — host-owned input values</li>
                <li><code>Variables.&lt;name&gt;</code> (with optional <code>.path</code>) — in-report writable state, set by drill-through / click actions</li>
                <li><code>BuiltInFields.&lt;name&gt;</code> — read-only host constants supplied via <code>initReportBuilder</code> or the component <code>builtInFields</code> prop</li>
                <li><code>Field.&lt;name&gt;</code> — the current row being rendered (inside a table cell, chart formatter, row visibility expression, etc.)</li>
                <li><code>RowGroup(&apos;name&apos;).key</code> / <code>.keys</code> / <code>.values</code> / <code>.Fields.&lt;field&gt;</code> / <code>.Variables.&lt;name&gt;</code> — access a row-group bucket</li>
                <li><code>ColGroup(&apos;name&apos;)</code> — same shape as RowGroup, for column-grouping contexts</li>
            </ul>
        </section>

        <section id="worked-examples" className="scroll-mt-8" style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-3">
                Worked Examples
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {categories.map((cat) => (
                    <div key={cat.title}>
                        <h3 style={{ color: 'var(--eui-text)', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{cat.title}</h3>
                        <p style={{ color: 'var(--eui-text-muted)', fontSize: 13, marginBottom: 10 }}>{cat.description}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {cat.examples.map((ex) => (
                                <div
                                    key={ex.title}
                                    style={{
                                        border: '1px solid var(--eui-border-subtle)',
                                        borderRadius: 6,
                                        padding: '10px 12px',
                                        background: 'var(--eui-bg)',
                                    }}
                                >
                                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--eui-text)', marginBottom: 4 }}>
                                        {ex.title}
                                    </div>
                                    <pre
                                        style={{
                                            margin: '0 0 6px',
                                            padding: '6px 10px',
                                            background: 'var(--eui-bg-subtle)',
                                            border: '1px solid var(--eui-border-subtle)',
                                            borderRadius: 4,
                                            fontSize: 12,
                                            fontFamily: 'Menlo, Consolas, monospace',
                                            color: 'var(--eui-text)',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-all',
                                        }}
                                    >{ex.expression}</pre>
                                    <div style={{ fontSize: 12, color: 'var(--eui-text-muted)', lineHeight: 1.5 }}>{ex.explanation}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>

        <section id="row-group-scope" className="scroll-mt-8" style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-3">
                Row-group scope
            </h2>
            <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-3">
                Table row groups expose a per-bucket frame in expressions. Inside a group-level formatter (for example a
                group header text or footer cell), you address the enclosing group with <code>RowGroup(&apos;name&apos;)</code>.
            </p>
            <ul style={{ color: 'var(--eui-text-muted)', fontSize: 13, lineHeight: 1.7, paddingLeft: 20, listStyleType: 'disc' }}>
                <li><code>RowGroup(&apos;region&apos;).key</code> — the single grouping key (e.g. <code>&quot;North&quot;</code>) when the row group has a single key.</li>
                <li><code>RowGroup(&apos;region&apos;).keys</code> — array form when the group is keyed by multiple fields.</li>
                <li><code>RowGroup(&apos;region&apos;).values</code> — the rows inside this bucket. Feed this directly into <code>Sum / Count / Avg</code>.</li>
                <li><code>RowGroup(&apos;region&apos;).Fields.revenue</code> — shortcut for the most-recent row&apos;s field value in that bucket.</li>
                <li><code>RowGroup(&apos;region&apos;).Variables.myVar</code> — a per-bucket variable computed by the group engine.</li>
            </ul>
        </section>

        <section id="rules" className="scroll-mt-8" style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-3">
                Rules &amp; gotchas
            </h2>
            <ul style={{ color: 'var(--eui-text-muted)', fontSize: 13, lineHeight: 1.7, paddingLeft: 20, listStyleType: 'disc' }}>
                <li><strong>No unsafe eval.</strong> Every expression is parsed into an AST; there is no string execution.</li>
                <li><strong>Missing property paths return null.</strong> Forbidden path segments (<code>__proto__</code>, <code>prototype</code>, <code>constructor</code>) also return null.</li>
                <li><strong>Type mismatches surface as warnings.</strong> If a field expects <code>boolean</code> and your expression returns <code>string</code>, the editor shows an error.</li>
                <li><strong>Optional-filter pattern.</strong> Always write <code>IsEmpty(Parameters.x) || &lt;clause&gt;</code> so a blank parameter disables the clause instead of excluding every row.</li>
                <li><strong>Parameters are read-only inside the viewer.</strong> Click actions, drills, and chart clicks write to <code>Variables</code>. Parameters only change via the parameter panel&apos;s Apply button.</li>
                <li><strong>Async built-in fields.</strong> A built-in field may be a Promise-returning getter. The evaluator awaits it, so the expression simply resolves when the value is ready — no special syntax required.</li>
            </ul>
        </section>
    </PageLayout>
);

export default ReportBuilderExpressionsPage;
