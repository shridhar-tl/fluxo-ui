import React, { useCallback, useMemo } from 'react';
import { TimesIcon, TrashIcon } from '../../../../assets/icons';
import { Button } from '../../../Button';
import { Checkbox } from '../../../Checkbox';
import { Dropdown } from '../../../Dropdown';
import { TextInput } from '../../../TextInput';
import type { ListItem } from '../../../../types';
import { useReportBuilderContext, useRBStore } from '../../report-builder-context';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import type {
    ChartAxisConfig,
    ChartComponentProps,
    ChartSeriesConfig,
    LegendPosition,
    LegendAlign,
    PointStyle,
    ReportComponent,
    TitleAlign,
    VariableConfig,
} from '../../report-definition-types';
import { ComponentVariablesEditor } from './ComponentVariablesEditor';
import { ExpressionField } from './ExpressionField';
import { PropsTabs } from './PropsTabs';

interface Props { component: ReportComponent; }

const defaultColors = [
    '#4f87f7', '#f76f6f', '#48c774', '#ffb347', '#a78bfa',
    '#f472b6', '#38bdf8', '#fb923c', '#34d399', '#e879f9',
];

const legendPositions: ListItem[] = [
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
];

const legendAligns: ListItem[] = [
    { value: 'start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'end', label: 'End' },
];

const titleAligns: ListItem[] = [
    { value: 'start', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'end', label: 'Right' },
];

const tooltipModes: ListItem[] = [
    { value: 'nearest', label: 'Nearest' },
    { value: 'index', label: 'Index' },
    { value: 'point', label: 'Point' },
    { value: 'dataset', label: 'Dataset' },
];

const valueFormats: ListItem[] = [
    { value: '', label: 'Default' },
    { value: 'number', label: 'Number (1,234.56)' },
    { value: 'currency', label: 'Currency ($1,234)' },
    { value: 'percent', label: 'Percent (12.3%)' },
    { value: 'short', label: 'Short (1.2K / 3.4M)' },
];

const aggregationKinds: ListItem[] = [
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'count', label: 'Count' },
    { value: 'min', label: 'Min' },
    { value: 'max', label: 'Max' },
    { value: 'none', label: 'None (row per data point)' },
];

const pointStyles: ListItem[] = [
    { value: 'circle', label: 'Circle' },
    { value: 'cross', label: 'Cross' },
    { value: 'crossRot', label: 'Cross (rotated)' },
    { value: 'dash', label: 'Dash' },
    { value: 'line', label: 'Line' },
    { value: 'rect', label: 'Square' },
    { value: 'rectRounded', label: 'Square (rounded)' },
    { value: 'rectRot', label: 'Diamond' },
    { value: 'star', label: 'Star' },
    { value: 'triangle', label: 'Triangle' },
];

const lineDashStyles: ListItem[] = [
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dotted', label: 'Dotted' },
];
void lineDashStyles;

function isBarType(t: string): boolean {
    return t === 'chart-bar' || t === 'chart-horizontal-bar' || t === 'chart-stacked-bar';
}
function isLineLikeType(t: string): boolean {
    return t === 'chart-line' || t === 'chart-area';
}
function isPolarLikeType(t: string): boolean {
    return t === 'chart-pie' || t === 'chart-donut' || t === 'chart-polar-area';
}
function isRadarType(t: string): boolean {
    return t === 'chart-radar';
}
function isScatterType(t: string): boolean {
    return t === 'chart-scatter';
}
function isBubbleType(t: string): boolean {
    return t === 'chart-bubble';
}
function needsCartesianAxes(t: string): boolean {
    return isBarType(t) || isLineLikeType(t) || isScatterType(t) || isBubbleType(t);
}
function needsRadialAxis(t: string): boolean {
    return isRadarType(t) || t === 'chart-polar-area';
}

export const ChartPropsPanel: React.FC<Props> = ({ component }) => {
    const { store } = useReportBuilderContext();
    const datasources = useRBStore((s) => s.definition.datasources);
    const p = component.props as unknown as ChartComponentProps;
    const chartType = component.type;

    const update = useCallback((patch: Partial<ChartComponentProps>) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                components: updateComponentInTree(prev.definition.components, component.id, (c) => ({
                    ...c,
                    props: { ...c.props, ...patch },
                })),
                metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
            },
        }));
    }, [store, component.id]);

    const updateStyles = useCallback((patch: Record<string, unknown>) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                components: updateComponentInTree(prev.definition.components, component.id, (c) => ({
                    ...c,
                    styles: { ...c.styles, ...patch },
                })),
                metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
            },
        }));
    }, [store, component.id]);

    const handleVariablesChange = useCallback((variables: VariableConfig[]) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                components: updateComponentInTree(prev.definition.components, component.id, (c) => ({
                    ...c,
                    variables: variables.length > 0 ? variables : undefined,
                })),
                metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
            },
        }));
    }, [store, component.id]);

    const dsOptions: ListItem[] = useMemo(
        () => [
            { value: '', label: '— Select —' },
            ...datasources.map((ds) => ({ value: ds.id, label: ds.name })),
        ],
        [datasources],
    );

    const tabs = useMemo(() => {
        const result = [
            { id: 'data', label: 'Data', render: () => <DataTab chartType={chartType} p={p} update={update} dsOptions={dsOptions} /> },
            { id: 'series', label: 'Series', render: () => <SeriesTab chartType={chartType} p={p} update={update} /> },
            { id: 'title', label: 'Title & Legend', render: () => <TitleLegendTab p={p} update={update} /> },
        ];
        if (needsCartesianAxes(chartType) || needsRadialAxis(chartType)) {
            result.push({ id: 'axes', label: 'Axes', render: () => <AxesTab chartType={chartType} p={p} update={update} /> });
        }
        result.push({ id: 'style', label: 'Styling', render: () => <StylingTab chartType={chartType} p={p} update={update} /> });
        result.push({ id: 'interaction', label: 'Tooltip', render: () => <InteractionTab p={p} update={update} /> });
        result.push({
            id: 'visibility',
            label: 'Visibility',
            render: () => (
                <VisibilityTab
                    component={component}
                    p={p}
                    update={update}
                    updateStyles={updateStyles}
                    onVariablesChange={handleVariablesChange}
                />
            ),
        });
        return result;
    }, [chartType, p, update, updateStyles, dsOptions, component, handleVariablesChange]);

    return (
        <div className="eui-rb-props-section">
            <div className="eui-rb-props-section-title">{chartLabel(chartType)} Configuration</div>
            <PropsTabs tabs={tabs} storageKey={`rb-chart-tab-${component.id}`} />
        </div>
    );
};

function chartLabel(type: string): string {
    const map: Record<string, string> = {
        'chart-bar': 'Bar Chart',
        'chart-horizontal-bar': 'Horizontal Bar',
        'chart-stacked-bar': 'Stacked Bar',
        'chart-pie': 'Pie Chart',
        'chart-donut': 'Donut Chart',
        'chart-line': 'Line Chart',
        'chart-area': 'Area Chart',
        'chart-polar-area': 'Polar Area',
        'chart-radar': 'Radar Chart',
        'chart-scatter': 'Scatter Plot',
        'chart-bubble': 'Bubble Chart',
    };
    return map[type] ?? 'Chart';
}

// ── Tab: Data ──────────────────────────────────────────────────────────────
const DataTab: React.FC<{
    chartType: string;
    p: ChartComponentProps;
    update: (patch: Partial<ChartComponentProps>) => void;
    dsOptions: ListItem[];
}> = ({ chartType, p, update, dsOptions }) => {
    const useXY = isBarType(chartType) || isLineLikeType(chartType) || isScatterType(chartType) || isBubbleType(chartType) || isRadarType(chartType);
    const useLV = isPolarLikeType(chartType);

    return (
        <>
            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Datasource</label>
                <Dropdown
                    options={dsOptions}
                    value={p.datasourceId ?? ''}
                    onChange={(e) => update({ datasourceId: e.value })}
                    size="sm"
                    aria-label="Select datasource"
                />
            </div>

            {useXY && (
                <>
                    <ExpressionField
                        label={isScatterType(chartType) || isBubbleType(chartType) ? 'X Field' : 'Category / X Field'}
                        value={p.xAxisField ?? ''}
                        onChange={(v) => update({ xAxisField: v })}
                        placeholder="fieldName"
                        expectedReturnType="string"
                    />
                    <ExpressionField
                        label={isRadarType(chartType) ? 'Value Field (default series)' : 'Value / Y Field'}
                        value={p.yAxisField ?? ''}
                        onChange={(v) => update({ yAxisField: v })}
                        placeholder="fieldName"
                        expectedReturnType="string"
                    />
                    {isBubbleType(chartType) && (
                        <ExpressionField
                            label="Radius Field"
                            value={p.radiusField ?? ''}
                            onChange={(v) => update({ radiusField: v })}
                            placeholder="fieldName"
                            expectedReturnType="string"
                            hint="Each row becomes a bubble; radius = Number(row[radiusField]) × radius scale."
                        />
                    )}
                    {!isScatterType(chartType) && !isBubbleType(chartType) && (
                        <ExpressionField
                            label="Series Field (optional)"
                            value={p.seriesField ?? ''}
                            onChange={(v) => update({ seriesField: v })}
                            placeholder="e.g. category"
                            expectedReturnType="string"
                            hint="When set, one series is generated per distinct value. Uses Value / Y Field for each series."
                        />
                    )}
                </>
            )}

            {useLV && (
                <>
                    <ExpressionField
                        label="Label Field"
                        value={p.labelField ?? ''}
                        onChange={(v) => update({ labelField: v })}
                        placeholder="fieldName"
                        expectedReturnType="string"
                    />
                    <ExpressionField
                        label="Value Field"
                        value={p.valueField ?? ''}
                        onChange={(v) => update({ valueField: v })}
                        placeholder="fieldName"
                        expectedReturnType="string"
                    />
                </>
            )}

            {!isScatterType(chartType) && !isBubbleType(chartType) && (
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label">Aggregation</label>
                    <Dropdown
                        options={aggregationKinds}
                        value={p.aggregation ?? 'sum'}
                        onChange={(e) => update({ aggregation: e.value as ChartComponentProps['aggregation'] })}
                        size="sm"
                        aria-label="Select aggregation"
                    />
                    <div style={{ fontSize: 11, color: 'var(--eui-text-muted)', marginTop: 4 }}>
                        How to combine multiple rows that share the same category / label value. Sum is the default — use None if your data is already pre-aggregated (one row per data point).
                    </div>
                </div>
            )}

            <ExpressionField
                label="Drill-through Variable"
                value={p.onDrillThrough ?? ''}
                onChange={(v) => update({ onDrillThrough: v || undefined })}
                placeholder="variableName"
                expectedReturnType="string"
                hint="When set, clicking a data point writes the clicked row into this report variable. The host's onDrillThrough callback also fires as a notification."
            />
        </>
    );
};

// ── Tab: Series ────────────────────────────────────────────────────────────
const SeriesTab: React.FC<{
    chartType: string;
    p: ChartComponentProps;
    update: (patch: Partial<ChartComponentProps>) => void;
}> = ({ chartType, p, update }) => {
    const series = p.series ?? [];

    const addSeries = () => {
        const next: ChartSeriesConfig = {
            id: crypto.randomUUID(),
            label: `Series ${series.length + 1}`,
            valueField: '',
            color: defaultColors[series.length % defaultColors.length],
        };
        update({ series: [...series, next] });
    };

    const updateSeries = (idx: number, patch: Partial<ChartSeriesConfig>) => {
        const next = series.map((s, i) => (i === idx ? { ...s, ...patch } : s));
        update({ series: next });
    };

    const removeSeries = (idx: number) => {
        update({ series: series.filter((_, i) => i !== idx) });
    };

    const colors = p.colors ?? [];
    const addColor = () => update({ colors: [...colors, defaultColors[colors.length % defaultColors.length]] });
    const updateColor = (idx: number, v: string) => update({ colors: colors.map((c, i) => (i === idx ? v : c)) });
    const removeColor = (idx: number) => update({ colors: colors.filter((_, i) => i !== idx) });

    const supportsExplicitSeries = isBarType(chartType) || isLineLikeType(chartType) || isRadarType(chartType) || isScatterType(chartType) || isBubbleType(chartType);
    const supportsPalette = isPolarLikeType(chartType) || isRadarType(chartType);

    return (
        <>
            {supportsExplicitSeries && (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)' }}>
                            Explicit Series ({series.length})
                        </span>
                        <Button size="xs" layout="outlined" onClick={addSeries} label="+ Series" ariaLabel="Add series" />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--eui-text-muted)', marginBottom: 8 }}>
                        Leave empty to auto-derive from the data-tab Y / series field.
                    </div>
                    {series.map((s, i) => (
                        <div
                            key={s.id}
                            style={{
                                border: '1px solid var(--eui-border-subtle)',
                                borderRadius: 4,
                                padding: 8,
                                marginBottom: 6,
                                background: 'var(--eui-bg-subtle)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--eui-text-muted)', flex: 1 }}>
                                    #{i + 1}
                                </span>
                                <Button
                                    layout="plain"
                                    size="xs"
                                    variant="danger"
                                    onClick={() => removeSeries(i)}
                                    ariaLabel="Remove series"
                                    leftIcon={<TrashIcon aria-hidden="true" />}
                                />
                            </div>
                            <TextInput
                                value={s.label ?? ''}
                                onChange={(e) => updateSeries(i, { label: e.value })}
                                placeholder="Series label"
                                size="sm"
                                aria-label="Series label"
                            />
                            <div style={{ marginTop: 4 }}>
                                <ExpressionField
                                    label="Value Field"
                                    value={s.valueField ?? ''}
                                    onChange={(v) => updateSeries(i, { valueField: v })}
                                    placeholder="fieldName"
                                    expectedReturnType="string"
                                />
                            </div>
                            {(isScatterType(chartType) || isBubbleType(chartType)) && (
                                <>
                                    <ExpressionField
                                        label="X Field (override)"
                                        value={s.xField ?? ''}
                                        onChange={(v) => updateSeries(i, { xField: v || undefined })}
                                        placeholder="optional"
                                    />
                                    <ExpressionField
                                        label="Y Field (override)"
                                        value={s.yField ?? ''}
                                        onChange={(v) => updateSeries(i, { yField: v || undefined })}
                                        placeholder="optional"
                                    />
                                </>
                            )}
                            {isBubbleType(chartType) && (
                                <ExpressionField
                                    label="Radius Field (override)"
                                    value={s.radiusField ?? ''}
                                    onChange={(v) => updateSeries(i, { radiusField: v || undefined })}
                                    placeholder="optional"
                                />
                            )}
                            <ExpressionField
                                label="Color"
                                value={s.color ?? ''}
                                onChange={(v) => updateSeries(i, { color: v || undefined })}
                                placeholder="#4f87f7"
                                inputType="color"
                            />
                            {isLineLikeType(chartType) && (
                                <>
                                    <ExpressionField
                                        label="Border Width"
                                        value={String(s.borderWidth ?? '')}
                                        onChange={(v) => updateSeries(i, { borderWidth: v ? Number(v) : undefined })}
                                        inputType="number"
                                        min={0}
                                        max={20}
                                    />
                                    <div className="eui-rb-prop-field">
                                        <label className="eui-rb-prop-field-label">Point Style</label>
                                        <Dropdown
                                            options={pointStyles}
                                            value={s.pointStyle ?? ''}
                                            onChange={(e) => updateSeries(i, { pointStyle: (e.value || undefined) as PointStyle })}
                                            size="sm"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </>
            )}

            {supportsPalette && (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)' }}>
                            Color Palette ({colors.length})
                        </span>
                        <Button size="xs" layout="outlined" onClick={addColor} label="+ Color" ariaLabel="Add color" />
                    </div>
                    {colors.length === 0 && (
                        <div style={{ fontSize: 11, color: 'var(--eui-text-muted)', fontStyle: 'italic' }}>
                            Default palette will be used.
                        </div>
                    )}
                    {colors.map((color, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => updateColor(idx, e.target.value)}
                                style={{ width: 28, height: 24, border: '1px solid var(--eui-border-subtle)', borderRadius: 3, cursor: 'pointer', padding: 1, background: 'var(--eui-input-bg)' }}
                                aria-label={`Color ${idx + 1}`}
                            />
                            <TextInput value={color} onChange={(e) => updateColor(idx, e.value)} size="sm" style={{ flex: 1 }} />
                            <Button
                                layout="plain"
                                size="xs"
                                onClick={() => removeColor(idx)}
                                ariaLabel={`Remove color ${idx + 1}`}
                                leftIcon={<TimesIcon aria-hidden="true" />}
                            />
                        </div>
                    ))}
                </>
            )}
        </>
    );
};

// ── Tab: Title & Legend ────────────────────────────────────────────────────
const TitleLegendTab: React.FC<{
    p: ChartComponentProps;
    update: (patch: Partial<ChartComponentProps>) => void;
}> = ({ p, update }) => {
    return (
        <>
            <ExpressionField
                label="Title"
                value={p.title ?? ''}
                onChange={(v) => update({ title: v })}
                placeholder="Chart title"
                expectedReturnType="string"
            />
            <ExpressionField
                label="Subtitle"
                value={p.subtitle ?? ''}
                onChange={(v) => update({ subtitle: v || undefined })}
                placeholder="Optional subtitle"
                expectedReturnType="string"
            />
            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Title Alignment</label>
                <Dropdown
                    options={titleAligns}
                    value={p.titleAlign ?? 'center'}
                    onChange={(e) => update({ titleAlign: e.value as TitleAlign })}
                    size="sm"
                />
            </div>
            <ExpressionField
                label="Title Color"
                value={p.titleColor ?? ''}
                onChange={(v) => update({ titleColor: v || undefined })}
                inputType="color"
            />
            <ExpressionField
                label="Title Font Size"
                value={String(p.titleFontSize ?? '')}
                onChange={(v) => update({ titleFontSize: v ? Number(v) : undefined })}
                inputType="number"
                min={8}
                max={48}
            />

            <div style={{ marginTop: 10 }}>
                <Checkbox
                    checked={p.showLegend ?? true}
                    onChange={(e) => update({ showLegend: e.value })}
                    label="Show legend"
                />
            </div>
            {(p.showLegend ?? true) && (
                <>
                    <div className="eui-rb-prop-field">
                        <label className="eui-rb-prop-field-label">Legend Position</label>
                        <Dropdown
                            options={legendPositions}
                            value={p.legendPosition ?? 'top'}
                            onChange={(e) => update({ legendPosition: e.value as LegendPosition })}
                            size="sm"
                        />
                    </div>
                    <div className="eui-rb-prop-field">
                        <label className="eui-rb-prop-field-label">Legend Align</label>
                        <Dropdown
                            options={legendAligns}
                            value={p.legendAlign ?? 'center'}
                            onChange={(e) => update({ legendAlign: e.value as LegendAlign })}
                            size="sm"
                        />
                    </div>
                    <ExpressionField
                        label="Legend Font Size"
                        value={String(p.legendFontSize ?? '')}
                        onChange={(v) => update({ legendFontSize: v ? Number(v) : undefined })}
                        inputType="number"
                        min={8}
                        max={24}
                    />
                    <ExpressionField
                        label="Legend Box Width"
                        value={String(p.legendBoxWidth ?? '')}
                        onChange={(v) => update({ legendBoxWidth: v ? Number(v) : undefined })}
                        inputType="number"
                        min={4}
                        max={80}
                    />
                </>
            )}
        </>
    );
};

// ── Tab: Axes ──────────────────────────────────────────────────────────────
const AxesTab: React.FC<{
    chartType: string;
    p: ChartComponentProps;
    update: (patch: Partial<ChartComponentProps>) => void;
}> = ({ chartType, p, update }) => {
    const showX = needsCartesianAxes(chartType);
    const showY = needsCartesianAxes(chartType);
    const showR = needsRadialAxis(chartType);

    const axisEditor = (
        title: string,
        key: 'xAxis' | 'yAxis' | 'rAxis',
    ) => {
        const axis: ChartAxisConfig = p[key] ?? {};
        const patchAxis = (patch: Partial<ChartAxisConfig>) => {
            update({ [key]: { ...axis, ...patch } } as Partial<ChartComponentProps>);
        };
        return (
            <div style={{ border: '1px solid var(--eui-border-subtle)', borderRadius: 4, padding: 8, marginBottom: 10, background: 'var(--eui-bg-subtle)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text)', marginBottom: 4 }}>{title}</div>
                <Checkbox
                    checked={axis.display ?? true}
                    onChange={(e) => patchAxis({ display: e.value })}
                    label="Show axis"
                />
                <Checkbox
                    checked={axis.gridDisplay ?? true}
                    onChange={(e) => patchAxis({ gridDisplay: e.value })}
                    label="Show grid lines"
                />
                <Checkbox
                    checked={axis.beginAtZero ?? false}
                    onChange={(e) => patchAxis({ beginAtZero: e.value })}
                    label="Begin at zero"
                />
                <ExpressionField
                    label="Axis Title"
                    value={axis.title ?? ''}
                    onChange={(v) => patchAxis({ title: v || undefined })}
                    expectedReturnType="string"
                />
                <div style={{ display: 'flex', gap: 6 }}>
                    <ExpressionField
                        label="Min"
                        value={axis.min !== undefined ? String(axis.min) : ''}
                        onChange={(v) => patchAxis({ min: v === '' ? undefined : Number(v) })}
                        inputType="number"
                    />
                    <ExpressionField
                        label="Max"
                        value={axis.max !== undefined ? String(axis.max) : ''}
                        onChange={(v) => patchAxis({ max: v === '' ? undefined : Number(v) })}
                        inputType="number"
                    />
                </div>
                <ExpressionField
                    label="Grid Color"
                    value={axis.gridColor ?? ''}
                    onChange={(v) => patchAxis({ gridColor: v || undefined })}
                    inputType="color"
                />
                <ExpressionField
                    label="Tick Color"
                    value={axis.tickColor ?? ''}
                    onChange={(v) => patchAxis({ tickColor: v || undefined })}
                    inputType="color"
                />
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label">Tick Format</label>
                    <Dropdown
                        options={valueFormats}
                        value={axis.format ?? ''}
                        onChange={(e) => patchAxis({ format: (e.value || undefined) as ChartAxisConfig['format'] })}
                        size="sm"
                    />
                </div>
                {axis.format === 'currency' && (
                    <TextInput
                        value={axis.currencySymbol ?? '$'}
                        onChange={(e) => patchAxis({ currencySymbol: e.value || undefined })}
                        placeholder="$"
                        size="sm"
                        aria-label="Currency symbol"
                    />
                )}
                {axis.format && (
                    <ExpressionField
                        label="Decimals"
                        value={axis.decimals !== undefined ? String(axis.decimals) : ''}
                        onChange={(v) => patchAxis({ decimals: v === '' ? undefined : Number(v) })}
                        inputType="number"
                        min={0}
                        max={10}
                    />
                )}
            </div>
        );
    };

    return (
        <>
            {showX && axisEditor('X Axis', 'xAxis')}
            {showY && axisEditor('Y Axis', 'yAxis')}
            {showR && axisEditor('Radial Axis', 'rAxis')}
        </>
    );
};

// ── Tab: Styling ───────────────────────────────────────────────────────────
const StylingTab: React.FC<{
    chartType: string;
    p: ChartComponentProps;
    update: (patch: Partial<ChartComponentProps>) => void;
}> = ({ chartType, p, update }) => {
    return (
        <>
            {(isBarType(chartType)) && (
                <>
                    <ExpressionField
                        label="Bar Color (single-series)"
                        value={p.barColor ?? ''}
                        onChange={(v) => update({ barColor: v || undefined })}
                        inputType="color"
                    />
                    <Checkbox
                        checked={p.stacked ?? false}
                        onChange={(e) => update({ stacked: e.value })}
                        label="Stacked"
                    />
                    <ExpressionField
                        label="Bar Border Width"
                        value={String(p.barBorderWidth ?? '')}
                        onChange={(v) => update({ barBorderWidth: v ? Number(v) : undefined })}
                        inputType="number"
                        min={0}
                        max={20}
                    />
                    <ExpressionField
                        label="Bar Border Color"
                        value={p.barBorderColor ?? ''}
                        onChange={(v) => update({ barBorderColor: v || undefined })}
                        inputType="color"
                    />
                    <ExpressionField
                        label="Bar Border Radius"
                        value={String(p.barBorderRadius ?? '')}
                        onChange={(v) => update({ barBorderRadius: v ? Number(v) : undefined })}
                        inputType="number"
                        min={0}
                        max={40}
                    />
                    <ExpressionField
                        label="Bar Percentage (per-category)"
                        value={String(p.barPercentage ?? '')}
                        onChange={(v) => update({ barPercentage: v ? Number(v) : undefined })}
                        inputType="number"
                        min={0.1}
                        max={1}
                        step={0.05}
                        hint="Fraction of the available width used by each bar (0.1 to 1)."
                    />
                    <ExpressionField
                        label="Category Percentage"
                        value={String(p.categoryPercentage ?? '')}
                        onChange={(v) => update({ categoryPercentage: v ? Number(v) : undefined })}
                        inputType="number"
                        min={0.1}
                        max={1}
                        step={0.05}
                        hint="Fraction of the axis available to each category (0.1 to 1)."
                    />
                </>
            )}

            {isLineLikeType(chartType) && (
                <>
                    <ExpressionField
                        label="Line Color (single-series)"
                        value={p.lineColor ?? ''}
                        onChange={(v) => update({ lineColor: v || undefined })}
                        inputType="color"
                    />
                    <ExpressionField
                        label="Line Tension"
                        value={String(p.lineTension ?? '')}
                        onChange={(v) => update({ lineTension: v === '' ? undefined : Number(v) })}
                        inputType="number"
                        min={0}
                        max={1}
                        step={0.05}
                        hint="0 = straight segments, 1 = smooth curves."
                    />
                    <ExpressionField
                        label="Line Border Width"
                        value={String(p.lineBorderWidth ?? '')}
                        onChange={(v) => update({ lineBorderWidth: v ? Number(v) : undefined })}
                        inputType="number"
                        min={1}
                        max={20}
                    />
                    <Checkbox
                        checked={p.showPoints ?? true}
                        onChange={(e) => update({ showPoints: e.value })}
                        label="Show data points"
                    />
                    <Checkbox
                        checked={p.areaFill ?? chartType === 'chart-area'}
                        onChange={(e) => update({ areaFill: e.value })}
                        label="Area fill"
                    />
                    <div className="eui-rb-prop-field">
                        <label className="eui-rb-prop-field-label">Default Point Style</label>
                        <Dropdown
                            options={pointStyles}
                            value={p.pointStyle ?? 'circle'}
                            onChange={(e) => update({ pointStyle: e.value as PointStyle })}
                            size="sm"
                        />
                    </div>
                    <ExpressionField
                        label="Default Point Radius"
                        value={String(p.pointRadius ?? '')}
                        onChange={(v) => update({ pointRadius: v ? Number(v) : undefined })}
                        inputType="number"
                        min={0}
                        max={20}
                    />
                </>
            )}

            {isPolarLikeType(chartType) && (
                <>
                    {chartType === 'chart-donut' && (
                        <ExpressionField
                            label="Cutout Size"
                            value={String(p.cutoutPercent ?? '')}
                            onChange={(v) => update({ cutoutPercent: v ? Number(v) : undefined })}
                            inputType="number"
                            min={0}
                            max={90}
                            hint="Percentage (0–90). Larger = thinner ring."
                        />
                    )}
                    <ExpressionField
                        label="Rotation (degrees)"
                        value={String(p.rotation ?? '')}
                        onChange={(v) => update({ rotation: v === '' ? undefined : Number(v) })}
                        inputType="number"
                        min={-360}
                        max={360}
                        hint="Rotate the chart start angle."
                    />
                    <ExpressionField
                        label="Border Width"
                        value={String(p.borderWidth ?? '')}
                        onChange={(v) => update({ borderWidth: v ? Number(v) : undefined })}
                        inputType="number"
                        min={0}
                        max={10}
                    />
                    <ExpressionField
                        label="Border Color"
                        value={p.borderColor ?? ''}
                        onChange={(v) => update({ borderColor: v || undefined })}
                        inputType="color"
                    />
                </>
            )}

            {(isScatterType(chartType) || isBubbleType(chartType)) && (
                <>
                    <div className="eui-rb-prop-field">
                        <label className="eui-rb-prop-field-label">Point Style</label>
                        <Dropdown
                            options={pointStyles}
                            value={p.pointStyle ?? 'circle'}
                            onChange={(e) => update({ pointStyle: e.value as PointStyle })}
                            size="sm"
                        />
                    </div>
                    <ExpressionField
                        label="Point Radius"
                        value={String(p.pointRadius ?? '')}
                        onChange={(v) => update({ pointRadius: v ? Number(v) : undefined })}
                        inputType="number"
                        min={1}
                        max={30}
                    />
                    {isBubbleType(chartType) && (
                        <ExpressionField
                            label="Radius Scale"
                            value={String(p.radiusScale ?? '')}
                            onChange={(v) => update({ radiusScale: v ? Number(v) : undefined })}
                            inputType="number"
                            min={0.01}
                            max={100}
                            step={0.1}
                            hint="Multiplier applied to radiusField before rendering."
                        />
                    )}
                </>
            )}

            <ExpressionField
                label="Chart Height (px)"
                value={String(p.height ?? '')}
                onChange={(v) => update({ height: v ? Number(v) : undefined })}
                inputType="number"
                min={100}
                max={2000}
                hint="Leave blank for auto-aspect height."
            />
            <ExpressionField
                label="Aspect Ratio"
                value={String(p.aspectRatio ?? '')}
                onChange={(v) => update({ aspectRatio: v === '' ? undefined : Number(v) })}
                inputType="number"
                min={0.1}
                max={10}
                step={0.1}
                hint="Width / height. Leave blank to let Chart.js decide."
            />
            <Checkbox
                checked={p.animate ?? true}
                onChange={(e) => update({ animate: e.value })}
                label="Animate on render"
            />
        </>
    );
};

// ── Tab: Tooltip / Interaction ─────────────────────────────────────────────
const InteractionTab: React.FC<{
    p: ChartComponentProps;
    update: (patch: Partial<ChartComponentProps>) => void;
}> = ({ p, update }) => {
    const enabled = p.tooltipEnabled ?? true;
    return (
        <>
            <Checkbox
                checked={enabled}
                onChange={(e) => update({ tooltipEnabled: e.value })}
                label="Enable tooltip on hover"
            />
            {enabled && (
                <>
                    <div className="eui-rb-prop-field">
                        <label className="eui-rb-prop-field-label">Interaction Mode</label>
                        <Dropdown
                            options={tooltipModes}
                            value={p.tooltipMode ?? 'nearest'}
                            onChange={(e) => update({ tooltipMode: e.value as ChartComponentProps['tooltipMode'] })}
                            size="sm"
                        />
                    </div>
                    <Checkbox
                        checked={p.tooltipIntersect ?? true}
                        onChange={(e) => update({ tooltipIntersect: e.value })}
                        label="Only trigger when hovering directly over element"
                    />
                    <div className="eui-rb-prop-field">
                        <label className="eui-rb-prop-field-label">Value Format</label>
                        <Dropdown
                            options={valueFormats}
                            value={p.tooltipValueFormat ?? ''}
                            onChange={(e) => update({ tooltipValueFormat: (e.value || undefined) as ChartComponentProps['tooltipValueFormat'] })}
                            size="sm"
                        />
                    </div>
                </>
            )}
        </>
    );
};

// ── Tab: Visibility ────────────────────────────────────────────────────────
const VisibilityTab: React.FC<{
    component: ReportComponent;
    p: ChartComponentProps;
    update: (patch: Partial<ChartComponentProps>) => void;
    updateStyles: (patch: Record<string, unknown>) => void;
    onVariablesChange: (variables: VariableConfig[]) => void;
}> = ({ component, p, update, updateStyles, onVariablesChange }) => {
    const styles = component.styles as { visible?: string | boolean };
    const visible = typeof styles.visible === 'string' ? styles.visible : '';

    return (
        <>
            <ExpressionField
                label="Visible (expression)"
                value={visible}
                onChange={(v) => updateStyles({ visible: v ? v : undefined })}
                placeholder="=Parameters.showChart"
                expectedReturnType="boolean"
                hint="Leave blank to always show. Returns truthy → visible, falsy → hidden."
            />
            <ExpressionField
                label="Hidden (advanced, overrides visible when truthy)"
                value={p.hidden ?? ''}
                onChange={(v) => update({ hidden: v || undefined })}
                placeholder="=Count(Datasources.orders) == 0"
                expectedReturnType="boolean"
                hint="Convenience inverse of Visible. Hidden when the expression is truthy."
            />
            <ComponentVariablesEditor
                title="Component Variables"
                description="Scoped to this chart. Drill-through or cell-item actions on this chart can write to these names in addition to any globals."
                variables={component.variables}
                onChange={onVariablesChange}
            />
        </>
    );
};
