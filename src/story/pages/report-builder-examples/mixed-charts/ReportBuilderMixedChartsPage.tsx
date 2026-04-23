import React, { useMemo } from 'react';
import PageLayout from '../../../PageLayout';
import type { SectionNavItem } from '../../../SectionNav';
import { LiveExampleViewer, type ExpressionHighlight } from '../shared/LiveExampleViewer';
import { buildDrillDashboardDefinition } from './definitions/drill-dashboard-definition';
import { buildExplicitSeriesDefinition } from './definitions/explicit-series-definition';
import { buildSeriesFieldDefinition } from './definitions/series-field-definition';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Multi-series + dashboards' },
    { id: 'series-field', title: 'seriesField pivot', description: 'One-field → N series' },
    { id: 'explicit-series', title: 'Explicit series', description: 'ChartSeriesConfig[]' },
    { id: 'drill-dashboard', title: 'Drill-through', description: 'Chart click → table filter' },
    { id: 'notes', title: 'Notes', description: 'Axis / tooltip / legend tips' },
];

const seriesFieldHighlights: ExpressionHighlight[] = [
    {
        label: 'Auto-pivot',
        expression: "xAxisField: 'region', yAxisField: 'revenue', seriesField: 'category'",
        explanation:
            'Region becomes the bar groups. Revenue is aggregated per (region, category) combination. Category becomes N separate series, one colour each.',
    },
    {
        label: 'Tooltip currency format',
        expression: "tooltipValueFormat: 'currency'",
        explanation:
            'Applies to every series. Use the axis format for the tick labels, the tooltip format for hover, and dataLabelFormat for printed labels.',
    },
];

const explicitHighlights: ExpressionHighlight[] = [
    {
        label: 'Typed series config',
        expression:
            "series: [{ id: 'revenue', label: 'Revenue', valueField: 'revenue', color: '#6366f1' }, { id: 'cost', ... }, { id: 'margin', ... }]",
        explanation:
            'Use `series` when each series comes from a different column of a pre-aggregated dataset. The dataset here is 4 rows × {region, revenue, cost, margin}; the chart renders 3 bars per region.',
    },
    {
        label: 'aggregation: "none" with explicit series',
        expression: "aggregation: 'none'",
        explanation:
            'Because the data is already one-row-per-x, aggregation must be "none" — otherwise the engine would collapse all rows into one.',
    },
];

const drillHighlights: ExpressionHighlight[] = [
    {
        label: 'Chart → variable',
        expression: "onDrillThrough: 'selectedRegion'",
        explanation:
            'Clicking a bar writes the source row (one of the aggregated group rows) into Variables.selectedRegion. The host onDrillThrough callback also fires for analytics.',
    },
    {
        label: 'Table reads back',
        expression: 'IsEmpty(Variables.selectedRegion) || Field.region == Variables.selectedRegion.region',
        explanation:
            'The coordinated filter. IsEmpty keeps the table showing everything until a bar has been clicked. .region navigates into the saved row.',
    },
    {
        label: 'Subtitle echoes the selection',
        expression: '=Concat("Selected: ", IIf(IsEmpty(Variables.selectedRegion), "— (click a bar)", Variables.selectedRegion.region))',
        explanation:
            'Expression-bound subtitle makes the interaction discoverable: the user sees the variable value update immediately after a click.',
    },
];

const ReportBuilderMixedChartsPage: React.FC = () => {
    const seriesFieldDef = useMemo(() => buildSeriesFieldDefinition(), []);
    const explicitDef = useMemo(() => buildExplicitSeriesDefinition(), []);
    const drillDef = useMemo(() => buildDrillDashboardDefinition(), []);

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 style={{ color: 'var(--eui-text)' }} className="text-2xl md:text-4xl font-bold mb-4">
                    Mixed Charts &amp; Dashboards
                </h1>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-base md:text-lg mb-3">
                    Moving from &ldquo;one chart per component&rdquo; to real dashboards: multiple series in one chart,
                    explicit per-series configuration, and coordinating components through shared Variables.
                </p>
            </div>

            <section id="series-field" className="scroll-mt-8">
                <LiveExampleViewer
                    title="1 · seriesField auto-pivot"
                    description="One-liner to turn a single y-field into N series by pivoting on another field."
                    definition={seriesFieldDef}
                    highlights={seriesFieldHighlights}
                    height={480}
                />
            </section>

            <section id="explicit-series" className="scroll-mt-8">
                <LiveExampleViewer
                    title="2 · Explicit series[] array"
                    description="Each series comes from a different column. You hand-pick colour, label, and border width."
                    definition={explicitDef}
                    highlights={explicitHighlights}
                    height={480}
                />
            </section>

            <section id="drill-dashboard" className="scroll-mt-8">
                <LiveExampleViewer
                    title="3 · Drill-through coordinated dashboard"
                    description="Chart click writes a Variable; a downstream table reads it back. This is the generic pattern for linked-view dashboards."
                    definition={drillDef}
                    highlights={drillHighlights}
                    height={720}
                />
            </section>

            <section id="notes" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-3">
                    Notes
                </h2>
                <ul style={{ color: 'var(--eui-text-muted)', fontSize: 13, lineHeight: 1.6, paddingLeft: 20, listStyleType: 'disc' }}>
                    <li>
                        <strong>seriesField vs series[].</strong> Use seriesField for auto-pivot from long-format data;
                        use <code>series[]</code> when each series is a different <em>column</em> of wide-format data.
                    </li>
                    <li>
                        <strong>Dual y-axes.</strong> Per-series <code>yAxisID</code> on Chart.js primitives maps to{' '}
                        <code>yAxis</code> / <code>yAxis2</code> in ChartComponentProps (v1 ships single-axis; use
                        per-series <code>color</code> + scale-tied series for side-by-side scales).
                    </li>
                    <li>
                        <strong>Drill value shape.</strong> For charts, the drill-through value is the aggregated group
                        row — a synthetic row whose fields are whatever the chart grouped on.
                    </li>
                    <li>
                        <strong>Keep the subtitle expression-bound.</strong> Echoing the active selection as the chart
                        subtitle is the cheapest way to make a dashboard feel responsive.
                    </li>
                </ul>
            </section>
        </PageLayout>
    );
};

export default ReportBuilderMixedChartsPage;
