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
import ColumnPivot from './ColumnPivot';
import Filtering from './Filtering';
import InteractiveDemo from './InteractiveDemo';
import MultiLevelPivot from './MultiLevelPivot';
import MultipleFunctions from './MultipleFunctions';

const sectionNavItems: SectionNavItem[] = [
    { id: 'interactive', title: 'Interactive', description: 'Drag-drop config, inline editing' },
    { id: 'basic-usage', title: 'Basic Usage', description: 'Simple region pivot' },
    { id: 'aggregate-functions', title: 'Aggregate Functions', description: 'Sum, avg, min, max, count, median' },
    { id: 'multi-level', title: 'Multi-Level Pivot', description: 'Region > Country > City' },
    { id: 'column-pivot', title: 'Column Pivot', description: 'Quarterly column headers' },
    { id: 'filtering', title: 'Filtering', description: 'Dynamic filter controls' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const pivotTableProps = {
    data: { type: 'T[]', required: true, description: 'Array of data objects to pivot.' },
    config: { type: 'PivotConfig', required: true, description: 'Configuration with rows, columns, values, and optional filters.' },
    fieldDefinitions: { type: 'FieldDefinition[]', description: 'Defines field types, labels, editors, templates, and validators.' },
    onConfigChange: { type: '(config: PivotConfig) => void', description: 'Called when user changes pivot configuration via drag-drop.' },
    onDataChange: { type: '(data: T[], rowIndex, field, newValue) => void', description: 'Called after inline cell edits.' },
    showConfigPanel: { type: 'boolean', default: 'false', description: 'Show the interactive drag-and-drop configuration panel.' },
    configPanelPosition: { type: "'left' | 'right' | 'top'", default: "'left'", description: 'Position of the config panel.' },
    configPanelCollapsible: { type: 'boolean', default: 'true', description: 'Allow collapsing the config panel.' },
    editable: { type: 'boolean', default: 'false', description: 'Enable inline cell editing on double-click.' },
    onCellEdit: { type: '(row, field, oldVal, newVal) => boolean | void', description: 'Validate or intercept cell edits. Return false to cancel.' },
    plugins: { type: 'PivotPlugin[]', description: 'Array of plugin objects for custom functions, renderers, and editors.' },
    disabledFunctions: { type: 'BuiltInAggregateFunction[]', description: 'Remove specific built-in aggregate functions.' },
    permissions: { type: 'PivotPermissions', description: 'Fine-grained control over what users can do (drag, edit, filter, export).' },
    cellTemplate: { type: 'ComponentType<CellTemplateProps> | function', description: 'Global custom cell renderer for all value cells.' },
    headerTemplate: { type: '(field, label) => ReactNode', description: 'Custom renderer for column headers.' },
    rowHeaderTemplate: { type: '(label, depth, node) => ReactNode', description: 'Custom renderer for row headers.' },
    exportable: { type: 'boolean', default: 'false', description: 'Show CSV/JSON export buttons in toolbar.' },
    onExport: { type: "(format: 'csv' | 'json') => void", description: 'Custom export handler.' },
    loading: { type: 'boolean', default: 'false', description: 'Show loading spinner.' },
    height: { type: 'string | number', description: 'Max height for scrollable area.' },
    expandAll: { type: 'boolean', default: 'false', description: 'Expand all row groups on initial render.' },
    showGrandTotal: { type: 'boolean', default: 'true', description: 'Show a grand total row at the bottom.' },
    showSubTotals: { type: 'boolean', default: 'true', description: 'Show subtotal rows for expanded groups.' },
    sortable: { type: 'boolean', default: 'true', description: 'Enable column header sorting.' },
    striped: { type: 'boolean', default: 'false', description: 'Apply alternating row backgrounds.' },
    bordered: { type: 'boolean', default: 'true', description: 'Show cell borders.' },
    compact: { type: 'boolean', default: 'false', description: 'Reduce cell padding for a denser layout.' },
    showToolbar: { type: 'boolean', default: 'false', description: 'Show toolbar with expand/collapse, export, and record count.' },
};

const features: FeatureItem[] = [
    { title: 'Multi-Level Grouping', description: 'Group rows by multiple fields to create a hierarchical drill-down structure.', icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5' },
    { title: 'Column Pivoting', description: 'Pivot field values into column headers for cross-tabulation analysis.', icon: 'M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12' },
    { title: 'Aggregate Functions', description: 'Sum, average, count, min, max, product, median, distinct, and distinctCount.', icon: 'M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z' },
    { title: 'Data Filtering', description: 'Apply filters with operators like eq, neq, gt, lt, contains, and in.', icon: 'M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z' },
    { title: 'Sortable Columns', description: 'Click column headers to sort data ascending, descending, or reset.', icon: 'M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5' },
    { title: 'Custom Formatting', description: 'Apply custom format functions to display values as currency, percentages, or any format.', icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z' },
];

const PivotTablePage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>PivotTable</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    An interactive pivot table with drag-and-drop configuration, inline editing, custom plugins, cell templates, and 15+ aggregate functions.
                </p>
            </div>

            <section id="interactive" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Interactive Pivot Table</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Drag fields between zones (Available, Rows, Columns, Values, Filters). Change aggregation functions inline. Double-click leaf cells to edit values.
                </p>
                <InteractiveDemo />
            </section>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    A simple pivot table grouping sales data by region with sum aggregations.
                </p>
                <BasicUsage />
            </section>

            <section id="aggregate-functions" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Aggregate Functions</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use different aggregate functions on value fields: sum, average, min, max, count, median, and distinctCount.
                </p>
                <MultipleFunctions />
            </section>

            <section id="multi-level" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Multi-Level Pivot</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Specify multiple fields in the <code>rows</code> array to create nested drill-down grouping.
                </p>
                <MultiLevelPivot />
            </section>

            <section id="column-pivot" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Column Pivot</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Add fields to the <code>columns</code> array to pivot values into column headers for cross-tabulation.
                </p>
                <ColumnPivot />
            </section>

            <section id="filtering" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Filtering</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Apply filters via the <code>config.filters</code> array to narrow down displayed data dynamically.
                </p>
                <Filtering />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { PivotTable } from 'ether-ui';\nimport type {\n  PivotConfig, PivotField, PivotFilter, AggregateFunction,\n  FieldDefinition, PivotPlugin, PivotPermissions,\n  CellEditorProps, CellTemplateProps, CustomAggregatePlugin,\n} from 'ether-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={pivotTableProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default PivotTablePage;
