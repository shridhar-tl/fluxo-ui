import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { FeatureGrid } from '../../FeatureCard';
import type { FeatureItem } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicUsage from './BasicUsage';
import CustomRendering from './CustomRendering';
import LoadingAndEmpty from './LoadingAndEmpty';
import ResponsiveColumns from './ResponsiveColumns';
import RowSelection from './RowSelection';
import SortableColumns from './SortableColumns';
import StyleVariants from './StyleVariants';
import WithActions from './WithActions';
import WithPagination from './WithPagination';

const tableProps = {
    columns: { type: 'Column[]', required: true, description: 'Array of column definitions' },
    rows: { type: 'any[]', required: true, description: 'Array of data objects to display' },
    totalRows: { type: 'number', required: true, description: 'Total number of rows (for pagination)' },
    id: { type: 'string', description: 'HTML id for the table container' },
    isLoading: { type: 'boolean', default: 'false', description: 'Show shimmer loading state' },
    expectedRows: { type: 'number', description: 'Number of shimmer rows when loading' },
    onSort: { type: '(column: Column, asc: boolean) => void', description: 'Callback when a sortable column is clicked' },
    onChange: { type: '(params: OnChangeParams) => void', description: 'Callback for sort, pagination, or row count changes' },
    noRowsMessage: { type: 'string', default: "'No records found.'", description: 'Message when no rows exist' },
    rowCounts: { type: 'number[]', default: '[10, 20, 25, 50, 75, 100]', description: 'Options for rows per page dropdown' },
    rowsPerPage: { type: 'number', default: 'rowCounts[0]', description: 'Initial rows per page' },
    sortColumn: { type: 'Column', description: 'Initially sorted column' },
    sortAsc: { type: 'boolean', default: 'true', description: 'Initial sort direction' },
    page: { type: 'number', default: '1', description: 'Initial page number' },
    pagination: { type: 'boolean', default: 'true', description: 'Show pagination footer' },
    containerClassName: { type: 'string', description: 'CSS class for the table container' },
    onRowClick: { type: '(arg: { row, index, event }) => void', description: 'Callback when a row is clicked' },
    bordered: { type: 'boolean', default: 'false', description: 'Show all cell borders' },
    striped: { type: 'boolean', default: 'false', description: 'Alternate row background colors' },
    compact: { type: 'boolean', default: 'false', description: 'Reduced padding for dense display' },
    comfortable: { type: 'boolean', default: 'false', description: 'Increased padding for readability' },
    borderless: { type: 'boolean', default: 'false', description: 'Remove all borders and shadow' },
    hoverable: { type: 'boolean', default: 'false', description: 'Primary-color row hover highlight' },
    cardStyle: { type: 'boolean', default: 'false', description: 'Render each row as a card' },
    minimalHeader: { type: 'boolean', default: 'false', description: 'Subtle uppercase header' },
    stickyHeader: { type: 'boolean', default: 'false', description: 'Fixed header on scroll' },
};

const columnProps = {
    title: { type: 'string', required: true, description: 'Column header text' },
    field: { type: 'string', required: true, description: 'Property name in the data object' },
    helpText: { type: 'string', description: 'Tooltip text on the column header' },
    headerClassName: { type: 'string', description: 'CSS class for the column header' },
    cellClassName: { type: 'string', description: 'CSS class for cells in this column' },
    sortable: { type: 'boolean', default: 'false', description: 'Enable sorting for this column' },
    hideBelow: { type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'", description: 'Hide column below breakpoint' },
    template: { type: '(row: any) => React.ReactNode', description: 'Custom render function for cell content' },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Simple table' },
    { id: 'style-variants', title: 'Style Variants', description: 'Visual styles' },
    { id: 'sortable-columns', title: 'Sortable', description: 'Column sorting' },
    { id: 'custom-rendering', title: 'Custom Rendering', description: 'Cell templates' },
    { id: 'with-pagination', title: 'Pagination', description: 'Paginated data' },
    { id: 'row-selection', title: 'Row Selection', description: 'Click handlers' },
    { id: 'responsive-columns', title: 'Responsive', description: 'Breakpoint hiding' },
    { id: 'with-actions', title: 'Action Buttons', description: 'Inline actions' },
    { id: 'loading-empty', title: 'Loading & Empty', description: 'State feedback' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'table-props', title: 'Table Props', description: 'API reference' },
    { id: 'column-config', title: 'Column Config', description: 'Column API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Style Variants', description: 'Nine composable styles: bordered, striped, compact, comfortable, borderless, hoverable, card, minimal header, sticky header.', icon: 'M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42' },
    { title: 'Column Sorting', description: 'Click headers to sort — supports client-side and server-side sorting.', icon: 'M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5' },
    { title: 'Pagination', description: 'Built-in footer with configurable rows-per-page and page navigation.', icon: 'M3 7.5h6m-6 4.5h6m-6 4.5h6M15 6.75l3 2.25-3 2.25m6 0H12' },
    { title: 'Custom Cell Rendering', description: 'Template functions per column for badges, buttons, or any React element.', icon: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5' },
    { title: 'Responsive Columns', description: 'Hide columns on smaller screens using hideBelow breakpoints.', icon: 'M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-3 3h3M6 10.5h.008v.008H6V10.5Zm0 3h.008v.008H6V13.5Zm0 3h.008v.008H6V16.5Z' },
    { title: 'Loading State', description: 'Animated shimmer skeleton while data is being fetched.', icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99' },
    { title: 'Row Click Handler', description: 'Attach onRowClick callbacks for selection or navigation.', icon: 'M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59' },
    { title: 'Theming', description: 'Dark/light mode and all brand themes via CSS custom properties.', icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z' },
];

const TablePage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Table</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A feature-rich data table with sorting, pagination, custom rendering, style variants, and responsive design.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="style-variants" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Style Variants</h2>
                <StyleVariants />
            </section>

            <section id="sortable-columns" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Sortable Columns</h2>
                <SortableColumns />
            </section>

            <section id="custom-rendering" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom Cell Rendering</h2>
                <CustomRendering />
            </section>

            <section id="with-pagination" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>With Pagination</h2>
                <WithPagination />
            </section>

            <section id="row-selection" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Row Selection</h2>
                <RowSelection />
            </section>

            <section id="responsive-columns" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Responsive Columns</h2>
                <ResponsiveColumns />
            </section>

            <section id="with-actions" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>With Action Buttons</h2>
                <WithActions />
            </section>

            <section id="loading-empty" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Loading & Empty States</h2>
                <LoadingAndEmpty />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { Table } from 'ether-ui';\nimport type { Column, OnChangeParams } from 'ether-ui';`} />
            </section>

            <section id="table-props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Table Props</h2>
                <PropsTable props={tableProps} />
            </section>

            <section id="column-config" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Column Configuration</h2>
                <PropsTable props={columnProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default TablePage;
