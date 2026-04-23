import React, { useMemo } from 'react';
import PageLayout from '../../../PageLayout';
import type { SectionNavItem } from '../../../SectionNav';
import { LiveExampleViewer, type ExpressionHighlight } from '../shared/LiveExampleViewer';
import { buildBarFamilyDefinition } from './definitions/bar-family-definition';
import { buildLineAreaDefinition } from './definitions/line-area-definition';
import { buildPieDonutDefinition } from './definitions/pie-donut-definition';
import { buildPolarRadarDefinition } from './definitions/polar-radar-definition';
import { buildScatterBubbleDefinition } from './definitions/scatter-bubble-definition';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Eleven chart types' },
    { id: 'bar-family', title: 'Bar family', description: 'Bar, horizontal, stacked' },
    { id: 'line-area', title: 'Line & Area', description: 'Tension, points, fill' },
    { id: 'pie-donut', title: 'Pie & Donut', description: 'Cutout, rotation, colors' },
    { id: 'polar-radar', title: 'Polar & Radar', description: 'Radial axes' },
    { id: 'scatter-bubble', title: 'Scatter & Bubble', description: 'Point sizing' },
    { id: 'defaults', title: 'Defaults', description: 'Aggregation and safety' },
];

const barHighlights: ExpressionHighlight[] = [
    {
        label: 'Auto-pivot via seriesField',
        expression: "seriesField: 'category'",
        explanation:
            'On the stacked bar, setting seriesField pivots the single yAxisField into one series per distinct value of the field. stacked: true turns the resulting series into a stack.',
    },
    {
        label: 'Tooltip + axis formatter',
        expression: "tooltipValueFormat: 'currency', yAxis.format: 'currency'",
        explanation:
            'Formatters accept number / currency / percent / short — this is what gives you consistent dollar formatting across tooltip, data labels and tick marks.',
    },
    {
        label: 'Bar spacing controls',
        expression: 'barPercentage: 0.7, categoryPercentage: 0.8',
        explanation:
            'barPercentage = bar width within its category slot; categoryPercentage = how much of the slot is used in total. Both 0–1.',
    },
];

const lineHighlights: ExpressionHighlight[] = [
    {
        label: 'Smooth vs staircase',
        expression: 'lineTension: 0.35 (smooth) vs 0 (staircase)',
        explanation:
            'Tension is 0 (straight line segments) to 1 (hyper-smooth). 0.25–0.35 is the usual "smooth but not wobbly" range.',
    },
    {
        label: 'Area toggle',
        expression: 'areaFill: true (area chart) / false (line chart)',
        explanation:
            'Both chart types share the same prop surface — the type alias just flips the default fill behaviour.',
    },
];

const pieHighlights: ExpressionHighlight[] = [
    {
        label: 'Donut vs Pie',
        expression: 'cutoutPercent: 70',
        explanation:
            'cutoutPercent is the radius of the empty centre, 0–100. Pie default is 0; donut default is 50.',
    },
    {
        label: 'Colour palette',
        expression: "colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444']",
        explanation:
            'An explicit palette cycles through each slice in order. Without it the chart falls back to a built-in theme palette.',
    },
    {
        label: 'Percent data labels',
        expression: "showDataLabels: true, dataLabelFormat: 'percent'",
        explanation:
            'Percent format renders slice values as share-of-total. Use currency / number / short for other visual hints.',
    },
];

const polarHighlights: ExpressionHighlight[] = [
    {
        label: 'Radar with series pivot',
        expression: "xAxisField: 'category', yAxisField: 'revenue', seriesField: 'region'",
        explanation:
            'Category becomes spoke label, revenue becomes distance, region becomes a separate overlaid radar shape.',
    },
    {
        label: 'Radial axis tuning',
        expression: 'rAxis: { beginAtZero: true, gridDisplay: true }',
        explanation:
            'rAxis is the polar analogue of yAxis. beginAtZero and gridDisplay are the two usual knobs.',
    },
];

const scatterHighlights: ExpressionHighlight[] = [
    {
        label: 'Scatter requires pre-aggregated data',
        expression: 'aggregation: "none" (always for scatter / bubble)',
        explanation:
            'Each row becomes a point. The library enforces "none" for scatter/bubble regardless of the prop value — aggregation only makes sense when rows share an x value.',
    },
    {
        label: 'Bubble radius',
        expression: 'radiusField: "cost", radiusScale: 0.02',
        explanation:
            'The bubble radius in pixels is roughly Number(row[radiusField]) × radiusScale. Tune scale to the magnitude of the field; 0.02 is about right when cost is in hundreds.',
    },
];

const ReportBuilderChartsPage: React.FC = () => {
    const barDef = useMemo(() => buildBarFamilyDefinition(), []);
    const lineDef = useMemo(() => buildLineAreaDefinition(), []);
    const pieDef = useMemo(() => buildPieDonutDefinition(), []);
    const polarDef = useMemo(() => buildPolarRadarDefinition(), []);
    const scatterDef = useMemo(() => buildScatterBubbleDefinition(), []);

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 style={{ color: 'var(--eui-text)' }} className="text-2xl md:text-4xl font-bold mb-4">
                    Charts
                </h1>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-base md:text-lg mb-3">
                    Eleven chart types backed by Chart.js. Every Chart.js option that matters is exposed as a typed
                    prop, and every value prop is expression-capable through the same{' '}
                    <code>fx</code> toggle used everywhere else in the builder.
                </p>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-3">
                    Each section renders a live <code>ReportViewer</code>. Open the <em>Definition</em> tab to copy the
                    JSON; open <em>Expressions</em> to see the key props called out.
                </p>
            </div>

            <section id="bar-family" className="scroll-mt-8">
                <LiveExampleViewer
                    title="Bar family"
                    description="Bar + horizontal bar + stacked bar. Stacked uses seriesField to pivot a single y-field into per-category series."
                    definition={barDef}
                    highlights={barHighlights}
                    height={780}
                />
            </section>

            <section id="line-area" className="scroll-mt-8">
                <LiveExampleViewer
                    title="Line & Area"
                    description="Same data, two treatments. Adjust lineTension / showPoints / areaFill to taste."
                    definition={lineDef}
                    highlights={lineHighlights}
                    height={600}
                />
            </section>

            <section id="pie-donut" className="scroll-mt-8">
                <LiveExampleViewer
                    title="Pie & Donut"
                    description="labelField + valueField. cutoutPercent turns a pie into a donut; rotation and colour palettes are explicit."
                    definition={pieDef}
                    highlights={pieHighlights}
                    height={700}
                />
            </section>

            <section id="polar-radar" className="scroll-mt-8">
                <LiveExampleViewer
                    title="Polar & Radar"
                    description="Polar uses label/value like a pie. Radar uses x/y/series like a bar chart but on a radial axis."
                    definition={polarDef}
                    highlights={polarHighlights}
                    height={720}
                />
            </section>

            <section id="scatter-bubble" className="scroll-mt-8">
                <LiveExampleViewer
                    title="Scatter & Bubble"
                    description="Two numeric axes. Bubble adds a radius dimension through radiusField + radiusScale."
                    definition={scatterDef}
                    highlights={scatterHighlights}
                    height={760}
                />
            </section>

            <section id="defaults" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-3">
                    Defaults worth knowing
                </h2>
                <ul style={{ color: 'var(--eui-text-muted)', fontSize: 13, lineHeight: 1.6, paddingLeft: 20, listStyleType: 'disc' }}>
                    <li>
                        <strong>Aggregation defaults.</strong> Bar / line / area / pie / donut / polar / radar default
                        to <code>&apos;sum&apos;</code> and group rows by xAxisField / labelField. Scatter and bubble
                        default to <code>&apos;none&apos;</code> and the engine enforces it.
                    </li>
                    <li>
                        <strong>Pre-aggregated data.</strong> Pass <code>aggregation: &apos;none&apos;</code> explicitly
                        when your datasource already returns one row per data point.
                    </li>
                    <li>
                        <strong>Series palette.</strong> If <code>colors</code> is omitted, the chart uses a built-in
                        theme palette that adapts to dark mode via CSS variables.
                    </li>
                    <li>
                        <strong>Every chart supports drill-through.</strong> Set <code>onDrillThrough</code> on the
                        chart props to the target variable name; the clicked slice / point / bar writes its source row
                        into <code>Variables.&lt;name&gt;</code>.
                    </li>
                </ul>
            </section>
        </PageLayout>
    );
};

export default ReportBuilderChartsPage;
