import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../../../PageLayout';
import type { SectionNavItem } from '../../../SectionNav';
import { FeatureGrid } from '../../../FeatureCard';
import type { FeatureItem } from '../../../FeatureCard';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'What this group is about' },
    { id: 'where-to-look', title: 'Where to look', description: 'Map of all pages' },
    { id: 'strengths', title: 'Strengths', description: 'Why Report Builder' },
    { id: 'model', title: 'Mental model', description: 'How it all fits' },
];

const features: FeatureItem[] = [
    { title: 'Pure JSON definition', description: 'Every report is serialisable JSON. Persist it, diff it, version-control it. Render anywhere with ReportViewer.' },
    { title: 'Visual drag-and-drop builder', description: 'ReportBuilder is a full VS Code-style editor — toolbox, design surface, properties, styles, console. Not a config wizard.' },
    { title: 'Typed expression language', description: 'No eval. A hand-written tokenizer / recursive-descent parser with Datasources, Parameters, Variables, Field, RowGroup, ColGroup namespaces and 40+ built-ins.' },
    { title: 'Parameters vs Variables', description: 'Parameters are host-owned inputs (validation, datasets, Apply-on-click). Variables are in-report writable state — click actions, drill-through.' },
    { title: 'Recursive tables', description: 'Column trees with nested headers (colSpan/rowSpan), multi-level row groups, per-bucket variables, head/footer rows, multi-item cells, click actions, pivot mode.' },
    { title: 'Eleven chart types', description: 'Bar, H-Bar, Stacked Bar, Line, Area, Pie, Donut, Polar Area, Radar, Scatter, Bubble — every Chart.js option exposed as a typed prop.' },
    { title: 'Sub-reports', description: 'A report can embed other reports with parameter mapping. This is nothing more than a reusable ReportDefinition loaded by the viewer.' },
    { title: 'Datasource plugins', description: 'Anything with a fetch(config, parameters) function is a plugin. Ships with Static JSON, HTTP, Jira, CSV — add your own.' },
    { title: 'Derived datasources', description: 'Flatten, pick, filter, computed transforms chain on top of any datasource. Filter a parent dataset per-parameter without a round-trip.' },
    { title: 'Library-store driven', description: 'These example pages share state through a single fluxo-ui create() store. Edit a sub-report in its own page — the parent example reflects the change.' },
    { title: 'Accessible by default', description: 'ARIA roles, keyboard navigation, focus management, high-contrast dark mode, and visible focus on every control.' },
    { title: 'PDF export + print', description: 'ReportViewer exposes exportPdf, print, refresh via viewerRef. Print-stylesheet switches the doc to a single-column page layout.' },
];

interface PageCardProps {
    title: string;
    path: string;
    description: string;
    badge?: string;
}

const PageCard: React.FC<PageCardProps> = ({ title, path, description, badge }) => (
    <Link
        to={path}
        style={{
            display: 'block',
            padding: '14px 16px',
            border: '1px solid var(--eui-border-subtle)',
            borderRadius: 8,
            background: 'var(--eui-bg)',
            color: 'var(--eui-text)',
            textDecoration: 'none',
            transition: 'background 0.12s, border-color 0.12s',
            cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--eui-bg-subtle)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--eui-bg)';
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>
            {badge && (
                <span
                    style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: 999,
                        background: 'var(--eui-primary-soft)',
                        color: 'var(--eui-primary)',
                    }}
                >
                    {badge}
                </span>
            )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--eui-text-muted)', lineHeight: 1.5 }}>{description}</div>
    </Link>
);

const pages: Array<{ heading: string; cards: PageCardProps[] }> = [
    {
        heading: 'Start here',
        cards: [
            {
                title: 'Combined Examples',
                path: '/components/report-builder-examples',
                description: 'Seven worked examples: parameter filtering, row groups, column groups, conditional visibility, cell items, head/footer, validation. The quickest way to see the pieces in action.',
            },
        ],
    },
    {
        heading: 'Feature deep-dives',
        cards: [
            {
                title: 'Tables',
                path: '/components/report-builder-examples/tables',
                description: 'Basics, nested column headers, multi-level row groups, head/footer rows, multi-item cells with click actions, conditional formats, pivot mode.',
                badge: 'New',
            },
            {
                title: 'Sub-reports',
                path: '/components/report-builder-examples/sub-reports',
                description: 'The parent report embeds three sub-reports. Each sub-report has its own Builder page — edit it and the parent preview reflects the change. Parameter mapping is all expression-based.',
                badge: 'New',
            },
            {
                title: 'Repeater',
                path: '/components/report-builder-examples/repeater',
                description: 'Bind a container to a dataset and render the children once per row. Cards, chips, grids, filter/sort/limit, expression datasets — the generic "for each" when a table is too tabular.',
                badge: 'New',
            },
        ],
    },
    {
        heading: 'Classic playgrounds',
        cards: [
            { title: 'Report Builder', path: '/components/report-builder', description: 'The full builder component with a sample report loaded. Drag, drop, edit, preview, export JSON.' },
            { title: 'Report Viewer', path: '/components/report-viewer', description: 'The viewer in isolation with parameters, toolbar, PDF export, and drill-through.' },
        ],
    },
];

export const ReportBuilderOverviewPage: React.FC = () => {
    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 style={{ color: 'var(--eui-text)' }} className="text-2xl md:text-4xl font-bold mb-4">
                    Report Builder — Examples Hub
                </h1>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-base md:text-lg mb-4">
                    Report Builder is one of the largest modules in the library. Instead of a single page trying to explain everything,
                    this section is split into focused feature pages. Start with the combined examples to see the shape of reports in general,
                    then jump to the specific feature page that matches what you are building.
                </p>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-4">
                    Every page here is driven by real <code>ReportViewer</code> and <code>ReportBuilder</code> instances running on a shared
                    store. There is no static markup or screenshots — if you can click it on screen, you are exercising the live component.
                </p>
            </div>

            <section id="where-to-look" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-3">
                    Where to look
                </h2>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-5">
                    Pick the section that matches your goal. "New" pages ship in this release; "Soon" placeholders exist so links from
                    Navigation do not 404 while I'm working through the backlog.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {pages.map((group) => (
                        <div key={group.heading}>
                            <h3 style={{ color: 'var(--eui-text)', fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
                                {group.heading}
                            </h3>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                                    gap: 12,
                                }}
                            >
                                {group.cards.map((card) => (
                                    <PageCard key={card.path} {...card} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section id="strengths" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-3">
                    Strengths
                </h2>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-4">
                    What sets this module apart from "build a form, submit, render a template" reporting tools.
                </p>
                <FeatureGrid features={features} />
            </section>

            <section id="model" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-3">
                    Mental model
                </h2>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-3">
                    A single read-only JSON shape, the <code>ReportDefinition</code>, captures everything: metadata, datasources,
                    parameters, variables, a component tree, and global styles. The builder edits that shape; the viewer renders it.
                </p>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-3">
                    Datasources are declared once at the top of the report and referenced by id throughout. Parameters flow into them
                    (useful for server-side filtering) and into expressions. Variables are the opposite — they are set by user interaction
                    inside the report (drill-through, cell click, chart click) and read by expressions to re-evaluate conditional formats,
                    visibility, chart titles, and so on.
                </p>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-3">
                    Component props that can vary are strings. A string beginning with <code>=</code> is evaluated as an expression; anything
                    else is a literal. This keeps the data shape simple and serialisable while still supporting full dynamic binding.
                </p>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm">
                    Sub-reports are just other reports. The parent passes a parameter map — each key is a parameter name on the child; each
                    value is either a literal or an expression evaluated in the parent's context. The child receives them, fetches its own
                    datasources, and renders inline.
                </p>
            </section>
        </PageLayout>
    );
};

export default ReportBuilderOverviewPage;
