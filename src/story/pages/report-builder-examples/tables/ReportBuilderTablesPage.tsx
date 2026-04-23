import React from 'react';
import PageLayout from '../../../PageLayout';
import type { SectionNavItem } from '../../../SectionNav';
import { BasicsSection } from './BasicsSection';
import { CellItemsSection } from './CellItemsSection';
import { ColumnGroupsSection } from './ColumnGroupsSection';
import { HeadFooterSection } from './HeadFooterSection';
import { PivotSection } from './PivotSection';
import { RowGroupsSection } from './RowGroupsSection';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'What tables offer' },
    { id: 'basics', title: '1 · Basics', description: 'Flat columns, sort, resize' },
    { id: 'column-groups', title: '2 · Nested Columns', description: 'Grouped header matrix' },
    { id: 'row-groups', title: '3 · Row Groups', description: 'Multi-level aggregates' },
    { id: 'cell-items', title: '4 · Cell Items', description: 'Multi-item cells + click' },
    { id: 'head-footer', title: '5 · Head / Footer', description: 'Banners + totals' },
    { id: 'pivot', title: '6 · Pivot Mode', description: 'Row × column × value' },
    { id: 'notes', title: 'Notes', description: 'Feature notes' },
];

export const ReportBuilderTablesPage: React.FC = () => {
    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 style={{ color: 'var(--eui-text)' }} className="text-2xl md:text-4xl font-bold mb-4">
                    Tables in Report Builder
                </h1>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-base md:text-lg mb-3">
                    The table component is the workhorse of Report Builder. It has one prop entry (<code>datasourceId</code>) plus a
                    recursive column tree, optional row groups, head / footer rows, pivot mode, multi-item cells, and conditional
                    formatting — all driven by the same typed expression language.
                </p>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-2">
                    Each demo below is a live <code>ReportViewer</code>. Open the <em>Definition</em> tab to copy the JSON; open the
                    <em> Expressions</em> tab to see the key expressions called out with an explanation.
                </p>
            </div>

            <section id="basics" className="scroll-mt-8">
                <BasicsSection />
            </section>
            <section id="column-groups" className="scroll-mt-8">
                <ColumnGroupsSection />
            </section>
            <section id="row-groups" className="scroll-mt-8">
                <RowGroupsSection />
            </section>
            <section id="cell-items" className="scroll-mt-8">
                <CellItemsSection />
            </section>
            <section id="head-footer" className="scroll-mt-8">
                <HeadFooterSection />
            </section>
            <section id="pivot" className="scroll-mt-8">
                <PivotSection />
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
                        <strong>Column tree is canonical</strong>. The flat <code>columns</code> and <code>columnGroups</code> arrays
                        are kept in sync alongside it for fast lookups. When writing programmatically, update <code>columnTree</code>
                        and derive the mirrors via <code>columnTreeToLegacy</code>.
                    </li>
                    <li>
                        <strong>Row-group engine</strong> applies <code>dataset → filter → sort → keys → variables</code> in that
                        order. Keys can be an array for multi-key grouping. Variables are computed per bucket and cached.
                    </li>
                    <li>
                        <strong>Conditional format firing order</strong>: first match wins. Put the most specific rules first. A
                        conditional format can set <code>backgroundColor</code>, <code>textColor</code>,<code> fontWeight</code>,
                        <code> fontStyle</code>.
                    </li>
                    <li>
                        <strong>Drill-through writes Variables</strong>, never Parameters. This is a hard architectural rule — click
                        actions inside the viewer can freely set Variables; Parameters only change via the parameter-panel Apply button.
                    </li>
                </ul>
            </section>
        </PageLayout>
    );
};

export default ReportBuilderTablesPage;
