import React from 'react';

import treeTablePropsJson from '../../../components/tree-table/TreeTable.props.json';
import { CodeBlock } from '../../CodeBlock';
import { headingStyle, subtleStyle } from '../../demo-styles';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import Appearance from './Appearance';
import BasicUsage from './BasicUsage';
import ColumnFeatures from './ColumnFeatures';
import EditingReorder from './EditingReorder';
import FlatDataExport from './FlatDataExport';
import InfiniteRoots from './InfiniteRoots';
import LargeDataset from './LargeDataset';
import LazyChildren from './LazyChildren';
import Selection from './Selection';
import SortFilter from './SortFilter';
import Templates from './Templates';

const { treeTableProps, columnProps, handleMethods } = treeTablePropsJson;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Nested data' },
    { id: 'large-dataset', title: 'Large Datasets', description: 'One million rows' },
    { id: 'lazy-children', title: 'Lazy Children', description: 'Load on expand' },
    { id: 'infinite-roots', title: 'Infinite Scroll', description: 'Load as you scroll' },
    { id: 'selection', title: 'Selection', description: 'Single, multiple, checkbox' },
    { id: 'sort-filter', title: 'Sort & Filter', description: 'Search and filter row' },
    { id: 'templates', title: 'Templates', description: 'Cells, headers, footers' },
    { id: 'columns', title: 'Columns', description: 'Frozen, grouped, resizable' },
    { id: 'editing', title: 'Editing & Reorder', description: 'Inline edits, moving rows' },
    { id: 'flat-data', title: 'Flat Data & Export', description: 'Parent keys, CSV' },
    { id: 'appearance', title: 'Appearance', description: 'Density and lines' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
];

const sections: { id: string; title: string; content: React.ReactNode }[] = [
    { id: 'basic-usage', title: 'Basic Usage', content: <BasicUsage /> },
    { id: 'large-dataset', title: 'Large Datasets', content: <LargeDataset /> },
    { id: 'lazy-children', title: 'Lazy Children with Paging', content: <LazyChildren /> },
    { id: 'infinite-roots', title: 'Infinite Scroll', content: <InfiniteRoots /> },
    { id: 'selection', title: 'Selection', content: <Selection /> },
    { id: 'sort-filter', title: 'Sorting & Filtering', content: <SortFilter /> },
    { id: 'templates', title: 'Templates & Aggregates', content: <Templates /> },
    { id: 'columns', title: 'Column Features', content: <ColumnFeatures /> },
    { id: 'editing', title: 'Inline Editing & Row Reordering', content: <EditingReorder /> },
    { id: 'flat-data', title: 'Flat Data & CSV Export', content: <FlatDataExport /> },
    { id: 'appearance', title: 'Appearance', content: <Appearance /> },
];

const importCode = `import { TreeTable } from 'fluxo-ui';
import type { TreeTableColumn, TreeTableHandle, TreeTableKey, TreeTableLoadChildren } from 'fluxo-ui';`;

const TreeTablePage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Tree Table
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A virtualized hierarchical data grid built for millions of rows. Lazy-load children page by page, append root rows as you scroll,
                select with checkboxes that cascade, sort and filter within the hierarchy, roll up totals, edit inline, pin and resize columns and
                move rows with the mouse or keyboard. Every interaction follows the WAI-ARIA treegrid pattern.
            </p>
        </div>

        {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>
                    {section.title}
                </h2>
                {section.content}
            </section>
        ))}

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>
                Import
            </h2>
            <CodeBlock code={importCode} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>
                TreeTable Props
            </h2>
            <PropsTable props={treeTableProps} />
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={headingStyle}>
                Column Options
            </h2>
            <PropsTable props={columnProps} />
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={headingStyle}>
                Ref Methods
            </h2>
            <PropsTable props={handleMethods} />
        </section>
    </PageLayout>
);

export default TreeTablePage;
