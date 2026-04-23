import React, { useState } from 'react';
import PageLayout from '../../../PageLayout';
import type { SectionNavItem } from '../../../SectionNav';
import { LivePreview } from './LivePreview';
import { ParentReportEditor } from './ParentReportEditor';
import { SubReportEditor } from './SubReportEditor';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'How sub-reports work' },
    { id: 'workbench', title: 'Workbench', description: 'Live preview + editors' },
    { id: 'notes', title: 'Notes', description: 'Feature notes' },
];

interface WorkbenchTab {
    id: string;
    label: string;
    render: () => React.ReactNode;
}

const workbenchTabs: WorkbenchTab[] = [
    { id: 'preview', label: 'Live Preview', render: () => <LivePreview /> },
    { id: 'parent', label: 'Parent Report', render: () => <ParentReportEditor /> },
    { id: 'order', label: 'Order Details', render: () => <SubReportEditor subReportId="sr-order-details" /> },
    { id: 'region', label: 'Region Summary', render: () => <SubReportEditor subReportId="sr-region-summary" /> },
    { id: 'rep', label: 'Sales Rep', render: () => <SubReportEditor subReportId="sr-sales-rep" /> },
];

const ReportBuilderSubReportsPage: React.FC = () => {
    const [activeId, setActiveId] = useState<string>(workbenchTabs[0].id);

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 style={{ color: 'var(--eui-text)' }} className="text-2xl md:text-4xl font-bold mb-4">
                    Sub-reports
                </h1>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-base md:text-lg mb-3">
                    A sub-report is just another <code>ReportDefinition</code> embedded inside a parent. The parent passes a{' '}
                    <code>parameterMap</code> — each entry is either a literal or an <code>=expression</code> evaluated in the parent
                    context. The child receives the parameter values, fetches its own datasources, and renders inline.
                </p>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-3">
                    Every tab on the workbench below is driven by the same shared store. Edit a sub-report in its own tab — the Live
                    Preview tab reflects the change on the next render. Refresh the page to reset to defaults.
                </p>
            </div>

            <section id="workbench" className="scroll-mt-8">
                <div
                    style={{
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 8,
                        overflow: 'hidden',
                        background: 'var(--eui-bg)',
                        height: 'calc(100vh - 180px)',
                        minHeight: 640,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div
                        role="tablist"
                        aria-label="Sub-reports workbench"
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 2,
                            padding: '6px 8px',
                            borderBottom: '1px solid var(--eui-border-subtle)',
                            background: 'var(--eui-bg-subtle)',
                            flexShrink: 0,
                        }}
                    >
                        {workbenchTabs.map((tab) => {
                            const isActive = tab.id === activeId;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => setActiveId(tab.id)}
                                    style={{
                                        padding: '6px 14px',
                                        border: 'none',
                                        borderRadius: 4,
                                        background: isActive ? 'var(--eui-primary-soft)' : 'transparent',
                                        color: isActive ? 'var(--eui-primary)' : 'var(--eui-text-muted)',
                                        fontWeight: 600,
                                        fontSize: 12,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        {workbenchTabs.map((tab) => (
                            <div
                                key={tab.id}
                                role="tabpanel"
                                aria-hidden={tab.id !== activeId}
                                style={{
                                    display: tab.id === activeId ? 'flex' : 'none',
                                    flexDirection: 'column',
                                    flex: 1,
                                    minHeight: 0,
                                }}
                            >
                                {tab.render()}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="notes" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-3">
                    Notes
                </h2>
                <ul
                    style={{
                        color: 'var(--eui-text-muted)',
                        fontSize: 13,
                        lineHeight: 1.6,
                        paddingLeft: 20,
                        listStyleType: 'disc',
                    }}
                >
                    <li>
                        <strong>Parameter mapping</strong>. Each key in <code>parameterMap</code> is a parameter <em>name</em> on the
                        child sub-report. Each value is either a literal ("USA") or an expression (<code>=Variables.selectedOrder.id</code>)
                        evaluated in the parent context before being passed in.
                    </li>
                    <li>
                        <strong>Drill writes the whole row</strong>. A <code>TableComponentProps.onDrillThrough</code> writes the entire
                        clicked row into the variable. Use <code>Variables.foo.field</code> in downstream expressions to extract what
                        you need — or use a cell-item <code>drill</code> action with <code>drillValueExpr</code> to write a specific value.
                    </li>
                    <li>
                        <strong>Sub-report discovery</strong>. The parent builder's sub-report picker reads{' '}
                        <code>availableSubReports</code> — the schema (id, label, parameter list). The viewer gets{' '}
                        <code>subReportDefinitions</code> — the full definitions needed to render. On this page, both are derived from
                        the same shared store.
                    </li>
                    <li>
                        <strong>Gating a sub-report on state</strong>. The parent's Order Details sub-report is hidden via{' '}
                        <code>styles.visible: "=!IsEmpty(Variables.selectedOrder)"</code> so it only appears once a row has been drilled.
                    </li>
                    <li>
                        <strong>Own datasources</strong>. Each sub-report declares its own datasources and fetches them independently —
                        there is no shared pool. If both parent and child need the same dataset, declare it on both.
                    </li>
                </ul>
            </section>
        </PageLayout>
    );
};

export default ReportBuilderSubReportsPage;
