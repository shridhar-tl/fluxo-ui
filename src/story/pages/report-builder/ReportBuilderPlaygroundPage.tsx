import cn from 'classnames';
import React, { useMemo, useState } from 'react';
import { ReportBuilder, ReportViewer } from '../../../components/report-builder';
import type { ReportDefinition } from '../../../components/report-builder';
import PageLayout from '../../PageLayout';
import type { SectionNavItem } from '../../SectionNav';
import { sampleReportDefinition, sampleDatasourcePlugins } from './report-builder-story-data';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Introduction' },
    { id: 'playground', title: 'Builder', description: 'Live builder' },
    { id: 'viewer', title: 'Viewer', description: 'Report viewer' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'API reference' },
];

const importCode = `// Use the builder to design reports
import { ReportBuilder } from 'fluxo-ui/report-builder';
import type { ReportDefinition, DatasourcePlugin } from 'fluxo-ui/report-builder';

// To render a report, use the viewer
import { ReportViewer } from 'fluxo-ui/report-viewer';`;

export const ReportBuilderPlaygroundPage: React.FC = () => {
    const [definition, setDefinition] = useState<ReportDefinition | undefined>(sampleReportDefinition);
    const [viewerDef, setViewerDef] = useState<ReportDefinition | undefined>(undefined);
    const [showViewer, setShowViewer] = useState(false);
    const h2 = 'text-2xl font-semibold mb-4';
    const desc = 'text-sm mb-4';

    const jsonStr = useMemo(() => {
        if (!definition) return '(No changes yet)';
        return JSON.stringify(definition, null, 2);
    }, [definition]);

    const handlePlay = () => {
        setViewerDef(definition);
        setShowViewer(true);
    };

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 style={{ color: 'var(--eui-text)' }} className="text-2xl md:text-4xl font-bold mb-4">
                    Report Builder
                </h1>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-base md:text-xl mb-6">
                    A full-featured visual report designer. Connect datasources, define parameters, and build reports
                    with a drag-and-drop canvas. Exports a pure JSON definition rendered by{' '}
                    <code className="font-mono text-sm">ReportViewer</code>.
                </p>
            </div>

            <section id="playground" className="scroll-mt-8">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <h2 style={{ color: 'var(--eui-text)' }} className={h2}>Builder Playground</h2>
                    <button
                        onClick={handlePlay}
                        disabled={!definition || definition.components.length === 0}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            height: 32, padding: '0 16px', fontSize: 13, fontWeight: 600,
                            border: 'none', borderRadius: 6, cursor: 'pointer',
                            background: 'var(--eui-primary)', color: '#fff',
                            opacity: (!definition || definition.components.length === 0) ? 0.5 : 1,
                            transition: 'opacity 0.15s',
                        }}
                        aria-label="Preview report in viewer"
                    >
                        ▶ Preview
                    </button>
                </div>
                <p style={{ color: 'var(--eui-text-muted)' }} className={cn(desc, 'mt-0')}>
                    Drag components from the Toolbox panel. CSV, Static JSON, HTTP and Jira Sample datasource plugins are pre-loaded.
                    Click Preview to open the report in the viewer below.
                </p>
                <div style={{ height: 640, border: '1px solid var(--eui-border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
                    <ReportBuilder
                        definition={definition}
                        onChange={setDefinition}
                        datasourcePlugins={sampleDatasourcePlugins}
                        style={{ height: '100%' }}
                    />
                </div>
            </section>

            {showViewer && viewerDef && (
                <section id="viewer" className="scroll-mt-8">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <h2 style={{ color: 'var(--eui-text)' }} className={h2}>Report Viewer</h2>
                        <button
                            onClick={() => setShowViewer(false)}
                            style={{ height: 28, padding: '0 12px', fontSize: 12, border: '1px solid var(--eui-border-subtle)', borderRadius: 4, background: 'var(--eui-bg)', color: 'var(--eui-text)', cursor: 'pointer' }}
                            aria-label="Close viewer"
                        >
                            Close
                        </button>
                    </div>
                    <p style={{ color: 'var(--eui-text-muted)' }} className={desc}>
                        Live preview of your report. Datasources are fetched and expressions are evaluated at render time.
                    </p>
                    <div style={{ height: 520, border: '1px solid var(--eui-border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
                        <ReportViewer
                            definition={viewerDef}
                            datasourcePlugins={sampleDatasourcePlugins}
                            style={{ height: '100%' }}
                        />
                    </div>
                </section>
            )}

            <section id="json-output" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className={h2}>Live Definition JSON</h2>
                <p style={{ color: 'var(--eui-text-muted)' }} className={desc}>
                    Updated on every change. Persist via <code className="font-mono text-sm">onChange</code> in your app.
                </p>
                <pre style={{
                    fontSize: 11, fontFamily: 'monospace', padding: 16, borderRadius: 6,
                    border: '1px solid var(--eui-border-subtle)', background: 'var(--eui-bg-subtle)',
                    color: 'var(--eui-text)', overflowX: 'auto', maxHeight: 320, overflowY: 'auto',
                }}>
                    {jsonStr}
                </pre>
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className={h2}>Import</h2>
                <pre style={{ fontSize: 13, fontFamily: 'monospace', padding: 16, borderRadius: 6, border: '1px solid var(--eui-border-subtle)', background: 'var(--eui-bg-subtle)', color: 'var(--eui-text)' }}>
                    {importCode}
                </pre>
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className={h2}>ReportBuilder Props</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: 'var(--eui-text)' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--eui-border-subtle)', textAlign: 'left' }}>
                                <th style={{ padding: '8px 12px' }}>Prop</th>
                                <th style={{ padding: '8px 12px' }}>Type</th>
                                <th style={{ padding: '8px 12px' }}>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ['definition', 'ReportDefinition', 'Initial/controlled report definition JSON.'],
                                ['onChange', '(def: ReportDefinition) => void', 'Fires on every definition change.'],
                                ['datasourcePlugins', 'DatasourcePlugin[]', 'Registered datasource type plugins.'],
                                ['parameterPlugins', 'CustomParameterPlugin[]', 'Optional custom parameter type plugins.'],
                                ['availableSubReports', '{ id, label }[]', 'Sub-reports the designer can reference.'],
                                ['layoutState', 'DockedLayoutState', 'Controlled panel layout state.'],
                                ['onLayoutChange', '(state) => void', 'Fires on panel layout change.'],
                                ['breakpoints', 'Breakpoint[]', 'Responsive breakpoints for panel layout.'],
                                ['panelConfig', 'PanelConfig map', 'Per-panel move/close overrides.'],
                                ['className', 'string', 'Additional CSS class.'],
                                ['style', 'CSSProperties', 'Inline styles.'],
                            ].map(([prop, type, d]) => (
                                <tr key={prop} style={{ borderBottom: '1px solid var(--eui-border-subtle)' }}>
                                    <td style={{ padding: '7px 12px', fontFamily: 'monospace', fontSize: 12 }}>{prop}</td>
                                    <td style={{ padding: '7px 12px', fontFamily: 'monospace', fontSize: 11, color: 'var(--eui-text-muted)' }}>{type}</td>
                                    <td style={{ padding: '7px 12px', color: 'var(--eui-text-muted)' }}>{d}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h2 style={{ color: 'var(--eui-text)', marginTop: 32 }} className={h2}>ReportViewer Props</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: 'var(--eui-text)' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--eui-border-subtle)', textAlign: 'left' }}>
                                <th style={{ padding: '8px 12px' }}>Prop</th>
                                <th style={{ padding: '8px 12px' }}>Type</th>
                                <th style={{ padding: '8px 12px' }}>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ['definition', 'ReportDefinition', 'The report definition to render. Required.'],
                                ['datasourcePlugins', 'DatasourcePlugin[]', 'Plugins used to fetch datasource data.'],
                                ['parameterValues', 'Record<string, unknown>', 'Controlled parameter values.'],
                                ['onParameterChange', '(values) => void', 'Fires when parameters change.'],
                                ['parameterPanel', '{ mode, position }', 'Parameter panel mode: popover | docked, position: left | right | top.'],
                                ['className', 'string', 'Additional CSS class.'],
                                ['style', 'CSSProperties', 'Inline styles.'],
                            ].map(([prop, type, d]) => (
                                <tr key={prop} style={{ borderBottom: '1px solid var(--eui-border-subtle)' }}>
                                    <td style={{ padding: '7px 12px', fontFamily: 'monospace', fontSize: 12 }}>{prop}</td>
                                    <td style={{ padding: '7px 12px', fontFamily: 'monospace', fontSize: 11, color: 'var(--eui-text-muted)' }}>{type}</td>
                                    <td style={{ padding: '7px 12px', color: 'var(--eui-text-muted)' }}>{d}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </PageLayout>
    );
};

export default ReportBuilderPlaygroundPage;
