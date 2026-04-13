import cn from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import { PivotTable } from '../../../components';
import type { AggregateFunction, BuiltInAggregateFunction, CellTemplateProps, CustomAggregatePlugin, FieldDefinition, PivotConfig, PivotPlugin } from '../../../components/pivot-table/pivot-table-types';
import PageLayout from '../../PageLayout';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import { salesData } from '../pivot-table/pivot-table-story-data';
import type { SalesRecord } from '../pivot-table/pivot-table-story-data';

const sectionNavItems: SectionNavItem[] = [
    { id: 'playground', title: 'Playground', description: 'Interactive pivot table' },
    { id: 'settings', title: 'Settings', description: 'Configuration options' },
];

const builtInFunctions: { name: AggregateFunction; label: string }[] = [
    { name: 'sum', label: 'Sum' },
    { name: 'average', label: 'Average' },
    { name: 'count', label: 'Count' },
    { name: 'min', label: 'Min' },
    { name: 'max', label: 'Max' },
    { name: 'product', label: 'Product' },
    { name: 'median', label: 'Median' },
    { name: 'distinct', label: 'Distinct' },
    { name: 'distinctCount', label: 'Distinct Count' },
    { name: 'first', label: 'First' },
    { name: 'last', label: 'Last' },
    { name: 'variance', label: 'Variance' },
    { name: 'stddev', label: 'Std Dev' },
    { name: 'range', label: 'Range' },
    { name: 'percentile90', label: 'P90' },
];

const weightedAvgPlugin: CustomAggregatePlugin = {
    name: 'weightedAvg',
    label: 'Weighted Avg',
    description: 'Revenue-weighted average',
    fn: (values) => {
        if (values.length === 0) return 0;
        const total = values.reduce((s: number, v) => s + Number(v), 0);
        return Math.round(total / values.length * 100) / 100;
    },
};

const RevenueCell: React.FC<CellTemplateProps> = ({ value }) => {
    const num = Number(value);
    const color = num >= 40000 ? '#22c55e' : num >= 20000 ? '#f59e0b' : '#ef4444';
    return (
        <span style={{ color, fontWeight: 600 }}>
            ${Number(num).toLocaleString()}
        </span>
    );
};

const PivotTablePlaygroundPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    const [config, setConfig] = useState<PivotConfig>({
        rows: ['region', 'country'],
        columns: [],
        values: [
            { field: 'revenue', label: 'Revenue', aggregateFunction: 'sum', format: (v) => `$${Number(v).toLocaleString()}` },
            { field: 'quantity', label: 'Qty', aggregateFunction: 'sum' },
            { field: 'profit', label: 'Profit', aggregateFunction: 'sum', format: (v) => `$${Number(v).toLocaleString()}` },
        ],
    });

    const [showConfigPanel, setShowConfigPanel] = useState(true);
    const [configPanelPosition, setConfigPanelPosition] = useState<'left' | 'right' | 'top'>('left');
    const [showToolbar, setShowToolbar] = useState(true);
    const [showGrandTotal, setShowGrandTotal] = useState(true);
    const [showSubTotals, setShowSubTotals] = useState(true);
    const [expandAll, setExpandAll] = useState(false);
    const [sortable, setSortable] = useState(true);
    const [striped, setStriped] = useState(false);
    const [bordered, setBordered] = useState(true);
    const [compact, setCompact] = useState(false);
    const [editable, setEditable] = useState(true);
    const [exportable, setExportable] = useState(true);
    const [usePlugins, setUsePlugins] = useState(false);
    const [useCustomTemplate, setUseCustomTemplate] = useState(false);
    const [disabledFns, setDisabledFns] = useState<BuiltInAggregateFunction[]>([]);
    const [pivotData, setPivotData] = useState(salesData);

    const plugins: PivotPlugin[] = useMemo(() => {
        if (!usePlugins) return [];
        return [{
            name: 'custom-functions',
            aggregateFunctions: [weightedAvgPlugin],
        }];
    }, [usePlugins]);

    const fieldDefinitions: FieldDefinition[] = useMemo(() => [
        { field: 'region', label: 'Region', dataType: 'string' },
        { field: 'country', label: 'Country', dataType: 'string' },
        { field: 'city', label: 'City', dataType: 'string' },
        { field: 'product', label: 'Product', dataType: 'string' },
        { field: 'category', label: 'Category', dataType: 'string' },
        { field: 'quarter', label: 'Quarter', dataType: 'string' },
        { field: 'salesperson', label: 'Salesperson', dataType: 'string' },
        { field: 'revenue', label: 'Revenue', dataType: 'number', editable: true, template: useCustomTemplate ? RevenueCell : undefined },
        { field: 'quantity', label: 'Quantity', dataType: 'number', editable: true },
        { field: 'profit', label: 'Profit', dataType: 'number', editable: true },
    ], [useCustomTemplate]);

    const handleDataChange = useCallback((newData: Record<string, unknown>[]) => {
        setPivotData(newData as SalesRecord[]);
    }, []);

    const toggleDisabledFn = (fn: BuiltInAggregateFunction) => {
        setDisabledFns((prev) => prev.includes(fn) ? prev.filter((f) => f !== fn) : [...prev, fn]);
    };

    const checkboxStyle = cn('flex items-center gap-2 text-sm cursor-pointer', {
        'text-gray-300': isDark,
        'text-gray-700': !isDark,
    });

    const sectionTitle = cn('text-sm font-semibold mb-2', {
        'text-gray-200': isDark,
        'text-gray-800': !isDark,
    });

    const panelBg = cn('p-4 rounded-lg border', {
        'bg-white/3 border-white/10': isDark,
        'bg-white border-gray-200': !isDark,
    });

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Pivot Table Playground
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    Interactive playground to explore all PivotTable features. Drag fields between zones, toggle settings, and edit cells live.
                </p>
            </div>

            <section id="settings" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Settings</h2>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                    <div className={panelBg}>
                        <h3 className={sectionTitle}>Display</h3>
                        <div className="space-y-2">
                            <label className={checkboxStyle}><input type="checkbox" checked={showConfigPanel} onChange={(e) => setShowConfigPanel(e.target.checked)} /> Config Panel</label>
                            <label className={checkboxStyle}><input type="checkbox" checked={showToolbar} onChange={(e) => setShowToolbar(e.target.checked)} /> Toolbar</label>
                            <label className={checkboxStyle}><input type="checkbox" checked={showGrandTotal} onChange={(e) => setShowGrandTotal(e.target.checked)} /> Grand Total</label>
                            <label className={checkboxStyle}><input type="checkbox" checked={showSubTotals} onChange={(e) => setShowSubTotals(e.target.checked)} /> Sub Totals</label>
                            <label className={checkboxStyle}><input type="checkbox" checked={expandAll} onChange={(e) => setExpandAll(e.target.checked)} /> Expand All</label>
                        </div>
                    </div>

                    <div className={panelBg}>
                        <h3 className={sectionTitle}>Styling</h3>
                        <div className="space-y-2">
                            <label className={checkboxStyle}><input type="checkbox" checked={striped} onChange={(e) => setStriped(e.target.checked)} /> Striped</label>
                            <label className={checkboxStyle}><input type="checkbox" checked={bordered} onChange={(e) => setBordered(e.target.checked)} /> Bordered</label>
                            <label className={checkboxStyle}><input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} /> Compact</label>
                            <label className={checkboxStyle}><input type="checkbox" checked={sortable} onChange={(e) => setSortable(e.target.checked)} /> Sortable</label>
                        </div>
                    </div>

                    <div className={panelBg}>
                        <h3 className={sectionTitle}>Features</h3>
                        <div className="space-y-2">
                            <label className={checkboxStyle}><input type="checkbox" checked={editable} onChange={(e) => setEditable(e.target.checked)} /> Editable</label>
                            <label className={checkboxStyle}><input type="checkbox" checked={exportable} onChange={(e) => setExportable(e.target.checked)} /> Exportable</label>
                            <label className={checkboxStyle}><input type="checkbox" checked={usePlugins} onChange={(e) => setUsePlugins(e.target.checked)} /> Custom Plugin</label>
                            <label className={checkboxStyle}><input type="checkbox" checked={useCustomTemplate} onChange={(e) => setUseCustomTemplate(e.target.checked)} /> Custom Cell Template</label>
                        </div>
                    </div>

                    <div className={panelBg}>
                        <h3 className={sectionTitle}>Config Panel Position</h3>
                        <div className="space-y-2">
                            {(['left', 'right', 'top'] as const).map((pos) => (
                                <label key={pos} className={checkboxStyle}>
                                    <input
                                        type="radio"
                                        name="configPos"
                                        checked={configPanelPosition === pos}
                                        onChange={() => setConfigPanelPosition(pos)}
                                    />
                                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={cn(panelBg, 'mb-6')}>
                    <h3 className={sectionTitle}>Disable Built-in Functions</h3>
                    <div className="flex flex-wrap gap-2">
                        {builtInFunctions.map((fn) => (
                            <button
                                key={fn.name}
                                className={cn('px-2 py-1 rounded text-xs border transition-all', {
                                    'border-red-400 bg-red-500/20 text-red-400 line-through': disabledFns.includes(fn.name as BuiltInAggregateFunction),
                                    'border-gray-600 text-gray-400 hover:border-gray-400': isDark && !disabledFns.includes(fn.name as BuiltInAggregateFunction),
                                    'border-gray-300 text-gray-600 hover:border-gray-400': !isDark && !disabledFns.includes(fn.name as BuiltInAggregateFunction),
                                })}
                                onClick={() => toggleDisabledFn(fn.name as BuiltInAggregateFunction)}
                                type="button"
                            >
                                {fn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section id="playground" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Playground</h2>
                <p className={cn('text-sm mb-4', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Drag fields between zones in the config panel. Double-click leaf cells to edit. Change aggregation functions on value fields.
                </p>

                <div className={cn('rounded-xl border overflow-hidden', {
                    'border-white/10': isDark,
                    'border-gray-200': !isDark,
                })}>
                    <PivotTable
                        data={pivotData}
                        config={config}
                        fieldDefinitions={fieldDefinitions}
                        onConfigChange={setConfig}
                        onDataChange={handleDataChange}
                        showConfigPanel={showConfigPanel}
                        configPanelPosition={configPanelPosition}
                        showToolbar={showToolbar}
                        showGrandTotal={showGrandTotal}
                        showSubTotals={showSubTotals}
                        expandAll={expandAll}
                        sortable={sortable}
                        striped={striped}
                        bordered={bordered}
                        compact={compact}
                        editable={editable}
                        exportable={exportable}
                        plugins={plugins}
                        disabledFunctions={disabledFns}
                        height="500px"
                    />
                </div>

                <div className={cn('mt-4 p-4 rounded-lg border font-mono text-xs', {
                    'bg-white/3 border-white/10 text-gray-400': isDark,
                    'bg-gray-50 border-gray-200 text-gray-600': !isDark,
                })}>
                    <strong>Current Config:</strong>
                    <pre className="mt-2 overflow-x-auto">{JSON.stringify(config, null, 2)}</pre>
                </div>
            </section>
        </PageLayout>
    );
};

export default PivotTablePlaygroundPage;
