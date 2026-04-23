import React, { useMemo } from 'react';
import PageLayout from '../../../PageLayout';
import type { SectionNavItem } from '../../../SectionNav';
import { LiveExampleViewer, type ExpressionHighlight } from '../shared/LiveExampleViewer';
import { buildBasicCardsDefinition } from './definitions/basic-cards-definition';
import { buildGridCardsDefinition } from './definitions/grid-cards-definition';
import { buildFilterSortLimitDefinition } from './definitions/filter-sort-limit-definition';
import { buildExpressionDatasetDefinition } from './definitions/expression-dataset-definition';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'What the repeater is' },
    { id: 'basic', title: 'Basic cards', description: 'Bind a datasource and render a card per row' },
    { id: 'grid', title: 'Grid of cards', description: 'Grid layout with nested Columns inside' },
    { id: 'filter-sort', title: 'Filter / sort / limit', description: 'Parameter-driven top-N' },
    { id: 'expression', title: 'Expression dataset', description: 'Iterate over an expression result' },
    { id: 'notes', title: 'Notes & gotchas', description: 'Field access, variables, performance' },
];

const basicHighlights: ExpressionHighlight[] = [
    {
        label: 'Bind datasource',
        expression: "datasourceId: 'ds-orders'",
        explanation: 'Point the repeater at any datasource. At runtime the viewer fetches the rows and renders the children once per row.',
    },
    {
        label: 'Current row access',
        expression: '=Field.id, =Field.revenue, =Field.region',
        explanation: 'Children of the repeater read the current iteration row via the Field.<name> namespace — the same namespace table cell expressions use.',
    },
    {
        label: 'Iteration metadata',
        expression: 'Variables.iterationNumber, Variables.iterationIndex, Variables.iterationCount, Variables.isFirst, Variables.isLast, Variables.isEven, Variables.isOdd',
        explanation: 'The repeater injects these into the per-iteration scope. Use them for "Showing 3 of 10", banding decisions, or conditional styling.',
    },
];

const gridHighlights: ExpressionHighlight[] = [
    {
        label: 'Grid layout',
        expression: "layout: 'grid', gridColumns: 3",
        explanation: 'The repeater switches to CSS grid with N equal columns. Good for card catalogues and tile dashboards.',
    },
    {
        label: 'Nested container as template',
        expression: 'children: [ Columns(1) ] with nested Header / Text',
        explanation: 'Each iteration renders a full subtree. Here the template is a 1-column layout acting as a styled card — exactly the same component you already know how to build.',
    },
];

const filterSortHighlights: ExpressionHighlight[] = [
    {
        label: 'Per-row filter',
        expression: '=Field.region == Parameters.regionFilter && Field.status != "cancelled"',
        explanation: 'Filter evaluates once per row with Field bound to that row. Rows where the expression is falsy are skipped before sort/limit.',
    },
    {
        label: 'Sort',
        expression: "sortBy: '=Field.revenue', sortDirection: 'desc'",
        explanation: 'Sort key is evaluated per row. Strings use locale-aware comparison, numbers natural order. Null values sink to the end.',
    },
    {
        label: 'Expression-based limit',
        expression: "limit: '=Parameters.topN'",
        explanation: 'Both limit and offset accept a literal number or an expression string. That lets end users control pagination via parameters.',
    },
];

const expressionDatasetHighlights: ExpressionHighlight[] = [
    {
        label: 'Dataset expression',
        expression: "datasetExpression: '=Datasources.orders'",
        explanation: 'When no datasource is bound, the repeater evaluates this expression — it must return an array. You can call Sum, Filter-like logic, or reference a derived datasource here.',
    },
    {
        label: 'Inline layout',
        expression: "layout: 'inline', inlineWrap: true",
        explanation: 'Use inline for chip-style lists. Flex wraps once children exceed the container width.',
    },
    {
        label: 'Aggregate above the repeater',
        expression: '=Concat("Orders above ", FormatCurrency(Parameters.minRevenue, "$", 0), ": ", Count(Datasources.orders, "revenue"))',
        explanation: 'The surrounding report still has access to the full dataset through Datasources.*. The repeater is a view, not a scope mutation.',
    },
];

const ReportBuilderRepeaterPage: React.FC = () => {
    const basicDef = useMemo(() => buildBasicCardsDefinition(), []);
    const gridDef = useMemo(() => buildGridCardsDefinition(), []);
    const filterSortDef = useMemo(() => buildFilterSortLimitDefinition(), []);
    const expressionDef = useMemo(() => buildExpressionDatasetDefinition(), []);

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 style={{ color: 'var(--eui-text)' }} className="text-2xl md:text-4xl font-bold mb-4">
                    Repeater
                </h1>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-base md:text-lg mb-3">
                    The <strong>Repeater</strong> binds to a dataset and renders its children once per row. It
                    is the generic &quot;for each&quot; container — use it when a table is too tabular (cards,
                    chips, timelines) or when you want custom per-row layouts.
                </p>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-3">
                    Inside any child, the current row is addressable via <code>Field.&lt;name&gt;</code>. Iteration
                    metadata (index, count, isFirst, isLast, isEven, isOdd) is automatically merged into
                    <code> Variables.*</code> for that iteration scope.
                </p>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-3">
                    Binding options: a datasource (recommended), or a <em>dataset expression</em> that returns an
                    array. Per-row <em>filter</em>, <em>sortBy</em> (+ direction), <em>offset</em> and
                    <em> limit</em> run in that order before rendering. Layout can be stack, grid, or inline.
                </p>
            </div>

            <section id="basic" className="scroll-mt-8">
                <LiveExampleViewer
                    title="1 · Bind a datasource and render a card per row"
                    description="The simplest shape — a stack layout, a line separator, alternating backgrounds, and Field.* for row access."
                    definition={basicDef}
                    highlights={basicHighlights}
                    height={560}
                />
            </section>

            <section id="grid" className="scroll-mt-8">
                <LiveExampleViewer
                    title="2 · Grid of cards"
                    description="Use layout='grid' to build card catalogues. The child template is a full Columns subtree — any component you can build outside the repeater works inside."
                    definition={gridDef}
                    highlights={gridHighlights}
                    height={580}
                />
            </section>

            <section id="filter-sort" className="scroll-mt-8">
                <LiveExampleViewer
                    title="3 · Filter, sort, and limit with parameters"
                    description="End users pick a region and how many rows to show. The repeater filters, sorts descending by revenue, and limits. Variables.iterationNumber produces the #1, #2, … labels."
                    definition={filterSortDef}
                    highlights={filterSortHighlights}
                    height={620}
                />
            </section>

            <section id="expression" className="scroll-mt-8">
                <LiveExampleViewer
                    title="4 · Iterate over an expression result"
                    description="No datasource is bound. The dataset expression pulls rows from Datasources.orders — and the filter, sort, limit pipeline applies exactly the same."
                    definition={expressionDef}
                    highlights={expressionDatasetHighlights}
                    height={540}
                />
            </section>

            <section id="notes" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className="text-xl font-bold mb-2">Notes &amp; gotchas</h2>
                <ul style={{ color: 'var(--eui-text-muted)' }} className="text-sm list-disc pl-6 space-y-2">
                    <li>
                        <strong>Field.&lt;name&gt; is the only row accessor.</strong> Inside a repeater child, use
                        <code> =Field.region</code>, not <code>Datasources.orders.region</code> — the repeater does
                        not create a row-scoped datasource alias.
                    </li>
                    <li>
                        <strong>Iteration metadata lives in Variables.</strong> <code>Variables.iterationIndex</code>
                        is 0-based; <code>Variables.iterationNumber</code> is 1-based. These never leak outside the
                        repeater subtree.
                    </li>
                    <li>
                        <strong>Component-scoped variables</strong> declared on the repeater itself are writable per-iteration
                        via cell-item actions (when the child is a table). Reads from outside see the global / outer
                        scope. Same scope rules as anywhere else.
                    </li>
                    <li>
                        <strong>Runtime cost.</strong> Each child subtree is rendered per row. Keep the template small,
                        or pair the repeater with a limit when the dataset is large. The repeater itself does not
                        paginate.
                    </li>
                    <li>
                        <strong>Children use drag-and-drop.</strong> In the builder, the repeater accepts the same child
                        types as a column cell. Drag components into its drop zone; they become the iteration template.
                    </li>
                </ul>
            </section>
        </PageLayout>
    );
};

export default ReportBuilderRepeaterPage;
