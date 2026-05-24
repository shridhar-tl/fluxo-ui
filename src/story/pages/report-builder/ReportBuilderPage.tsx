import React, { useMemo, useState } from 'react';
import { ReportBuilder } from '../../../components/report-builder';
import type { BuiltInFieldDefinition, ReportDefinition } from '../../../components/report-builder';
import PageLayout from '../../PageLayout';
import type { SectionNavItem } from '../../SectionNav';
import { PropsTable } from '../../PropsTable';
import { FeatureGrid } from '../../FeatureCard';
import type { FeatureItem } from '../../FeatureCard';
import { CodeBlock } from '../../CodeBlock';
import { sampleReportDefinition, sampleDatasourcePlugins } from './report-builder-story-data';

const playgroundBuiltInFields: BuiltInFieldDefinition[] = [
    { name: 'CurrentUser', label: 'Current user', description: 'Signed-in user record supplied by the host.', group: 'Identity', value: { id: 'user-42', name: 'Ada Lovelace', email: 'ada@example.com', role: 'Analyst' } },
    { name: 'CurrentUserId', label: 'Current user id', description: 'Shortcut for Identity.CurrentUser.id.', group: 'Identity', value: 'user-42' },
    { name: 'Tenant', label: 'Tenant', description: 'Active tenant / workspace record.', group: 'Identity', value: { id: 'acme', name: 'Acme Corp', plan: 'enterprise' } },
    { name: 'Env', label: 'Environment', description: 'Deployment environment tag.', group: 'Runtime', value: 'production' },
    { name: 'ServerTime', label: 'Server time', description: 'Host-authoritative timestamp (resolved on each evaluation).', group: 'Runtime', value: () => new Date().toISOString() },
    { name: 'FeatureFlags', label: 'Feature flags', description: 'Map of flag name → boolean, supplied by the feature-flag service.', group: 'Runtime', value: { newChartDefaults: true, experimentalPivot: false } },
];

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Introduction' },
    { id: 'playground', title: 'Playground', description: 'Live builder' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'builder-props', title: 'Builder Props', description: 'ReportBuilder API' },
    { id: 'definition-types', title: 'Definition Types', description: 'Core type reference' },
    { id: 'features', title: 'Features', description: 'Feature highlights' },
];

const features: FeatureItem[] = [
    { title: 'Drag & Drop Canvas', description: 'Drag components from the toolbox onto a visual design surface. Reorder, nest, and organize with intuitive DnD.' },
    { title: 'Datasource Plugins', description: 'Connect to any data source via plugins — Static JSON, HTTP/REST, CSV, or build your own custom plugin.' },
    { title: 'Expression Engine', description: 'Bind any property to dynamic expressions using Datasources, Parameters, and Field references with autocomplete.' },
    { title: 'Parameter System', description: 'Define typed report parameters (text, numeric, date, dropdown, etc.) with validation, defaults, and visibility rules.' },
    { title: 'Multi-tab Editing', description: 'Edit multiple reports in parallel with separate undo/redo stacks per tab.' },
    { title: 'Undo / Redo', description: 'Full undo/redo history (50 levels) with Ctrl+Z / Ctrl+Y keyboard shortcuts.' },
    { title: 'Component Library', description: '14 component types: Header, Text, Image, Table, Charts (bar/line/pie/donut), Columns, Tabs, Canvas, Sub-report.' },
    { title: 'Style Editor', description: 'Visual style editor with Typography, Background, Border, Spacing, Sizing, and Visibility sections.' },
    { title: 'Template System', description: 'Save, load, and manage report templates. Let users start from pre-built designs.' },
    { title: 'Canvas Free-form', description: 'Absolute positioning with grid snapping, alignment guides, multi-select (Ctrl+Click), and lasso selection.' },
    { title: 'Docked Panel Layout', description: 'VS Code-style panel layout with dock, auto-hide, float, and resize. Fully customizable via panelConfig.' },
    { title: 'JSON Definition', description: 'Reports stored as pure JSON — serialize, persist, version control, and render anywhere with ReportViewer.' },
];

import _ReportBuilder_props_json from '../../../components/report-builder/ReportBuilder.props.json';
const { builderProps } = _ReportBuilder_props_json;

const importCode = `// Report Builder component and types — styles apply automatically on import
import { ReportBuilder } from 'fluxo-ui/report-builder';
import type {
  ReportDefinition,
  ReportBuilderProps,
  DatasourcePlugin,
  AvailableSubReport,
} from 'fluxo-ui/report-builder';`;

const usageCode = `const [definition, setDefinition] = useState<ReportDefinition>();

<ReportBuilder
  definition={definition}
  onChange={setDefinition}
  datasourcePlugins={[myPlugin]}
  availableSubReports={[{
    id: 'detail',
    label: 'Detail Report',
    parameters: [{ name: 'id', label: 'Record ID', type: 'string' }],
  }]}
/>`;

export const ReportBuilderPage: React.FC = () => {
    const [definition, setDefinition] = useState<ReportDefinition | undefined>(sampleReportDefinition);

    const jsonStr = useMemo(() => {
        if (!definition) return '(No changes yet — drag a component to start)';
        return JSON.stringify(definition, null, 2);
    }, [definition]);

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 style={{ color: 'var(--eui-text)' }} className="text-2xl md:text-4xl font-bold mb-4">
                    Report Builder
                </h1>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-base md:text-xl mb-6">
                    A full-featured visual report designer. Connect datasources, define parameters, drag-and-drop
                    components onto a canvas, and export a pure JSON definition that can be rendered anywhere with{' '}
                    <code style={{ fontSize: '0.85em', fontFamily: 'monospace', background: 'var(--eui-bg-subtle)', padding: '2px 6px', borderRadius: 4 }}>ReportViewer</code>.
                </p>
            </div>

            <section id="playground" className="scroll-mt-8">
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-4">
                    Drag components from the Toolbox. Configure datasources, parameters, and styles in the side panels.
                    Four sample datasource plugins are pre-loaded: Static JSON, HTTP, Jira, and CSV.
                </p>
                <div style={{ height: 640, border: '1px solid var(--eui-border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
                    <ReportBuilder
                        definition={definition}
                        onChange={setDefinition}
                        datasourcePlugins={sampleDatasourcePlugins}
                        builtInFields={playgroundBuiltInFields}
                        style={{ height: '100%' }}
                    />
                </div>
                <div style={{ marginTop: 16 }}>
                    <details style={{ color: 'var(--eui-text)' }}>
                        <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--eui-text-muted)', marginBottom: 8 }}>
                            View live definition JSON
                        </summary>
                        <pre style={{
                            fontSize: 11, fontFamily: 'monospace', padding: 16, borderRadius: 6,
                            border: '1px solid var(--eui-border-subtle)', background: 'var(--eui-bg-subtle)',
                            color: 'var(--eui-text)', overflowX: 'auto', maxHeight: 320, overflowY: 'auto',
                        }}>
                            {jsonStr}
                        </pre>
                    </details>
                </div>
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-4">Import</h2>
                <CodeBlock code={importCode} />
                <h3 style={{ color: 'var(--eui-text)', marginTop: 24 }} className="text-lg font-semibold mb-3">Basic Usage</h3>
                <CodeBlock code={usageCode} />
            </section>

            <section id="builder-props" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-4">ReportBuilder Props</h2>
                <PropsTable props={builderProps} />
            </section>

            <section id="definition-types" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-4">Key Types</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div>
                        <h3 style={{ color: 'var(--eui-text)' }} className="text-lg font-semibold mb-2">Component Types</h3>
                        <p style={{ color: 'var(--eui-text-muted)', fontSize: 13, marginBottom: 8 }}>
                            Drag-and-drop these from the Toolbox panel:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {['header', 'text', 'image', 'horizontal-line', 'columns', 'tab', 'table', 'chart-bar', 'chart-line', 'chart-pie', 'chart-donut', 'canvas', 'sub-report'].map((t) => (
                                <span key={t} style={{ fontSize: 12, fontFamily: 'monospace', padding: '3px 8px', borderRadius: 4, background: 'var(--eui-bg-subtle)', border: '1px solid var(--eui-border-subtle)', color: 'var(--eui-text)' }}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 style={{ color: 'var(--eui-text)' }} className="text-lg font-semibold mb-2">Parameter Types</h3>
                        <p style={{ color: 'var(--eui-text-muted)', fontSize: 13, marginBottom: 8 }}>
                            Available parameter input types for end-user filtering:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {['text', 'masked-edit', 'numeric', 'date-picker', 'date-range-picker', 'dropdown', 'radio-button', 'multi-select', 'chips', 'checkbox'].map((t) => (
                                <span key={t} style={{ fontSize: 12, fontFamily: 'monospace', padding: '3px 8px', borderRadius: 4, background: 'var(--eui-bg-subtle)', border: '1px solid var(--eui-border-subtle)', color: 'var(--eui-text)' }}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 style={{ color: 'var(--eui-text)' }} className="text-lg font-semibold mb-2">Expression Syntax</h3>
                        <CodeBlock code={`Datasources.mySource.fieldName    // datasource field
Parameters.myParam                 // parameter value
Field.fieldName                    // current row field (in tables)
Sum(Datasources.sales.amount)      // aggregate function
IIf(Parameters.year > 2024, "New", "Old")  // conditional`} />
                    </div>
                </div>
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-4">Features</h2>
                <FeatureGrid features={features} columns={3} />
            </section>
        </PageLayout>
    );
};

export default ReportBuilderPage;
