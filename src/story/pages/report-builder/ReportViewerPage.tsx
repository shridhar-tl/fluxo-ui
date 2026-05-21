import React, { useMemo, useState } from 'react';
import { ReportViewer } from '../../../components/report-builder/report-viewer-index';
import PageLayout from '../../PageLayout';
import type { SectionNavItem } from '../../SectionNav';
import { PropsTable } from '../../PropsTable';
import { FeatureGrid } from '../../FeatureCard';
import type { FeatureItem } from '../../FeatureCard';
import { CodeBlock } from '../../CodeBlock';
import { salesData, sampleReportDefinition, sampleDatasourcePlugins } from './report-builder-story-data';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Introduction' },
    { id: 'demo', title: 'Demo', description: 'Live viewer' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'viewer-props', title: 'Viewer Props', description: 'ReportViewer API' },
    { id: 'callbacks', title: 'Callbacks', description: 'Event callbacks' },
    { id: 'features', title: 'Features', description: 'Feature highlights' },
];

const features: FeatureItem[] = [
    { title: 'Datasource Fetching', description: 'Automatically fetches all datasources on mount via plugins. Derived datasources processed sequentially after regular ones.' },
    { title: 'Expression Evaluation', description: 'Evaluates dynamic expressions in text, visibility, formatting, and conditional styles at render time.' },
    { title: 'Parameter Panel', description: 'Docked or popover parameter panel lets end-users filter and configure reports interactively.' },
    { title: 'Table Features', description: 'Sorting, grouping (multi-level), pivot mode, frozen columns, column resizing, reorder, conditional formatting, inline editing.' },
    { title: 'Chart Rendering', description: 'Bar (stacked), Line (tension, area fill), Pie, and Donut charts via Chart.js with responsive layout.' },
    { title: 'PDF Export & Print', description: 'Export to PDF via html2canvas or print with dedicated print stylesheet and proper page breaks.' },
    { title: 'Drill-through', description: 'Click table rows or chart elements to filter other components by updating parameter values.' },
    { title: 'Virtual Scrolling', description: 'Automatic virtual scrolling for tables with 100+ rows. Only visible rows render.' },
    { title: 'Sub-reports', description: 'Recursive rendering of nested sub-reports with their own datasources and parameter mappings.' },
    { title: 'Copy to Clipboard', description: 'One-click copy of filtered table data as tab-separated values.' },
    { title: 'URL Bookmarking', description: 'Optional parameter state sync to URL hash for shareable/bookmarkable report views.' },
    { title: 'Canvas Layout', description: 'Absolute-positioned free-form canvas with component rendering.' },
];

import _ReportBuilder_props_json from '../../../components/report-builder/ReportBuilder.props.json';
const { viewerProps } = _ReportBuilder_props_json;

const importCode = `// Base styles (once in your app entry)
import 'fluxo-ui/styles';

// Report Viewer component and types
import { ReportViewer } from 'fluxo-ui/report-viewer';
import type {
  ReportDefinition,
  ReportViewerProps,
  ReportViewerHandle,
  DatasourcePlugin,
  SubReportDefinition,
} from 'fluxo-ui/report-viewer';`;

const usageCode = `<ReportViewer
  definition={reportJson}
  datasourcePlugins={[myPlugin]}
  parameterValues={{ year: 2025, region: 'US' }}
  onParameterChange={(values) => setParams(values)}
  parameterPanel={{ mode: 'docked', position: 'left' }}
  onColumnResize={(compId, colId, w) => persist(compId, colId, w)}
  onDrillThrough={(param, value) => console.log(param, value)}
  syncParamsToHash
/>

// Custom toolbar with viewerRef:
const viewerRef = useRef<ReportViewerHandle>(null);

<ReportViewer
  definition={reportJson}
  datasourcePlugins={[myPlugin]}
  hideToolbar
  viewerRef={viewerRef}
/>
<button onClick={() => viewerRef.current?.print()}>Print</button>
<button onClick={() => viewerRef.current?.exportPdf()}>PDF</button>
<button onClick={() => viewerRef.current?.refresh()}>Reload</button>`;

type InfoTab = 'viewer' | 'definition' | 'data';

const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 600,
    border: 'none',
    background: active ? 'var(--eui-primary-soft)' : 'transparent',
    color: active ? 'var(--eui-primary)' : 'var(--eui-text-muted)',
    borderRadius: 4,
    cursor: 'pointer',
});

export const ReportViewerPage: React.FC = () => {
    const [paramValues, setParamValues] = useState<Record<string, unknown>>({});
    const [activeTab, setActiveTab] = useState<InfoTab>('viewer');

    const definitionJson = useMemo(
        () => JSON.stringify(sampleReportDefinition, null, 2),
        [],
    );

    const dataJson = useMemo(
        () => JSON.stringify(salesData, null, 2),
        [],
    );

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 style={{ color: 'var(--eui-text)' }} className="text-2xl md:text-4xl font-bold mb-4">
                    Report Viewer
                </h1>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-base md:text-xl mb-6">
                    Renders a report definition JSON into a fully interactive view. Fetches datasources,
                    evaluates expressions, and provides a rich set of viewer features including sorting, drill-through,
                    PDF export, and parameter filtering.
                </p>
            </div>

            <section id="demo" className="scroll-mt-8">
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-4">
                    A multi-section sales report featuring header, subtitle, horizontal rules, bar/donut/line/pie charts in a 2-column layout,
                    a sortable detail table with copy-to-clipboard, and a disclaimer footer. A4 page setup with 10mm margins.
                    Use the toolbar to test Print and PDF Export. Switch tabs to inspect the definition JSON and raw datasource data.
                </p>

                <div style={{
                    display: 'flex',
                    gap: 4,
                    padding: '6px 8px',
                    background: 'var(--eui-bg-subtle)',
                    border: '1px solid var(--eui-border-subtle)',
                    borderBottom: 'none',
                    borderRadius: '8px 8px 0 0',
                }}>
                    <button style={tabStyle(activeTab === 'viewer')} onClick={() => setActiveTab('viewer')}>Viewer</button>
                    <button style={tabStyle(activeTab === 'definition')} onClick={() => setActiveTab('definition')}>Report Definition</button>
                    <button style={tabStyle(activeTab === 'data')} onClick={() => setActiveTab('data')}>Sample Data</button>
                </div>

                {activeTab === 'viewer' && (
                    <div style={{ height: 680, border: '1px solid var(--eui-border-subtle)', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                        <ReportViewer
                            definition={sampleReportDefinition}
                            datasourcePlugins={sampleDatasourcePlugins}
                            parameterValues={paramValues}
                            onParameterChange={setParamValues}
                            style={{ height: '100%' }}
                        />
                    </div>
                )}

                {activeTab === 'definition' && (
                    <div style={{
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: '0 0 8px 8px',
                        overflow: 'hidden',
                    }}>
                        <div style={{ padding: '8px 12px', background: 'var(--eui-bg-subtle)', borderBottom: '1px solid var(--eui-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--eui-text-muted)' }}>ReportDefinition JSON</span>
                            <span style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>
                                This is the exact JSON passed as the <code style={{ fontFamily: 'monospace' }}>definition</code> prop
                            </span>
                        </div>
                        <pre style={{
                            fontSize: 11,
                            fontFamily: 'monospace',
                            padding: 16,
                            background: 'var(--eui-bg)',
                            color: 'var(--eui-text)',
                            overflowX: 'auto',
                            maxHeight: 480,
                            overflowY: 'auto',
                            margin: 0,
                        }}>
                            {definitionJson}
                        </pre>
                    </div>
                )}

                {activeTab === 'data' && (
                    <div style={{
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: '0 0 8px 8px',
                        overflow: 'hidden',
                    }}>
                        <div style={{ padding: '8px 12px', background: 'var(--eui-bg-subtle)', borderBottom: '1px solid var(--eui-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--eui-text-muted)' }}>Sample Datasource Rows</span>
                            <span style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>
                                {salesData.length} rows &middot; returned by the static-json plugin
                            </span>
                        </div>
                        <pre style={{
                            fontSize: 11,
                            fontFamily: 'monospace',
                            padding: 16,
                            background: 'var(--eui-bg)',
                            color: 'var(--eui-text)',
                            overflowX: 'auto',
                            maxHeight: 480,
                            overflowY: 'auto',
                            margin: 0,
                        }}>
                            {dataJson}
                        </pre>
                    </div>
                )}
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-4">Import</h2>
                <CodeBlock code={importCode} />
                <h3 style={{ color: 'var(--eui-text)', marginTop: 24 }} className="text-lg font-semibold mb-3">Basic Usage</h3>
                <CodeBlock code={usageCode} />
            </section>

            <section id="viewer-props" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-4">ReportViewer Props</h2>
                <PropsTable props={viewerProps} />
            </section>

            <section id="callbacks" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-4">Callback Reference</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                        { name: 'onColumnResize', sig: '(componentId: string, columnId: string, width: number) => void', desc: 'Persist column widths back to your definition store. Fires on every drag resize.' },
                        { name: 'onColumnReorder', sig: '(componentId: string, columnIds: string[]) => void', desc: 'Persist column order. Fires when user drag-reorders table headers.' },
                        { name: 'onDrillThrough', sig: '(parameterName: string, value: unknown) => void', desc: 'Fires when user clicks a table row or chart element. The row object or data point is passed as value. Parameter values are auto-updated internally.' },
                        { name: 'onCellEdit', sig: '(componentId: string, rowIndex: number, field: string, value: unknown) => void', desc: 'Fires when user double-clicks a cell and commits an edit. Only works when enableCellEdit is true on the table component.' },
                        { name: 'onParameterChange', sig: '(values: Record<string, unknown>) => void', desc: 'Fires when end-user changes any parameter value via the parameter panel or drill-through.' },
                    ].map((cb) => (
                        <div key={cb.name} style={{ padding: '12px 16px', borderRadius: 6, border: '1px solid var(--eui-border-subtle)', background: 'var(--eui-bg-subtle)' }}>
                            <code style={{ fontSize: 13, fontWeight: 600, color: 'var(--eui-primary)' }}>{cb.name}</code>
                            <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--eui-text-muted)', marginTop: 4 }}>{cb.sig}</div>
                            <p style={{ fontSize: 13, color: 'var(--eui-text)', marginTop: 6, margin: 0 }}>{cb.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-4">Features</h2>
                <FeatureGrid features={features} columns={3} />
            </section>
        </PageLayout>
    );
};

export default ReportViewerPage;
