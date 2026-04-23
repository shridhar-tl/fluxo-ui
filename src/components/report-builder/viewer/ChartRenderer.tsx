import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    BubbleController,
    ScatterController,
    RadarController,
    PolarAreaController,
    Filler,
    Title,
    SubTitle,
    Tooltip,
    Legend,
} from 'chart.js';
import {
    Bar,
    Pie,
    Doughnut,
    Line,
    Radar,
    PolarArea,
    Scatter,
    Bubble,
} from 'react-chartjs-2';
import type { ChartOptions, ChartData } from 'chart.js';
import type { ExpressionContext } from '../expression/expression-types';
import type {
    ChartAxisConfig,
    ChartComponentProps,
    ChartSeriesConfig,
    LegendPosition,
    ReportComponent,
} from '../report-definition-types';
import { useViewerContext, buildExpressionDatasources } from './ViewerExpressionContext';
import { useEvaluatedString, useEvaluatedBoolean } from './useExpressionValue';

ChartJS.register(
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    BubbleController,
    ScatterController,
    RadarController,
    PolarAreaController,
    Filler,
    Title,
    SubTitle,
    Tooltip,
    Legend,
);

interface Props {
    component: ReportComponent;
    styleCss: React.CSSProperties;
}

type Row = Record<string, unknown>;

const defaultColors = [
    '#4f87f7', '#f76f6f', '#48c774', '#ffb347', '#a78bfa',
    '#f472b6', '#38bdf8', '#fb923c', '#34d399', '#e879f9',
];

function pickColor(p: ChartComponentProps, idx: number, fallback: string): string {
    if (p.colors && p.colors.length > 0) return p.colors[idx % p.colors.length];
    return fallback;
}

function formatValue(n: unknown, fmt: ChartComponentProps['tooltipValueFormat'], decimals?: number, symbol = '$'): string {
    const num = Number(n);
    if (!Number.isFinite(num)) return String(n ?? '');
    const d = typeof decimals === 'number' ? Math.max(0, Math.min(10, decimals)) : 2;
    const addSeparator = (v: number, dec: number): string => {
        const [i, f] = v.toFixed(dec).split('.');
        const ii = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return f ? `${ii}.${f}` : ii;
    };
    switch (fmt) {
        case 'currency':
            return num < 0 ? `-${symbol}${addSeparator(-num, d)}` : `${symbol}${addSeparator(num, d)}`;
        case 'percent':
            return `${(num * 100).toFixed(d)}%`;
        case 'short':
            if (Math.abs(num) >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
            if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
            if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
            return String(num);
        case 'number':
        default:
            return addSeparator(num, d);
    }
}

function toSeriesList(rows: Row[], p: ChartComponentProps): ChartSeriesConfig[] {
    if (p.series && p.series.length > 0) return p.series;

    // Implicit: pivot by seriesField.
    if (p.seriesField && p.yAxisField) {
        const keys = Array.from(new Set(rows.map((r) => String(r[p.seriesField!] ?? '')))).filter((k) => k !== '');
        return keys.map((k, i) => ({
            id: `auto-${i}`,
            label: k,
            valueField: p.yAxisField!,
            color: pickColor(p, i, defaultColors[i % defaultColors.length]),
        }));
    }

    if (p.yAxisField) {
        return [
            {
                id: 'auto-0',
                label: p.title || p.yAxisField,
                valueField: p.yAxisField,
                color: p.barColor ?? p.lineColor ?? defaultColors[0],
            },
        ];
    }

    return [];
}

type AggregationKind = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'none';

function resolveAggregation(p: ChartComponentProps, defaultKind: AggregationKind): AggregationKind {
    return p.aggregation ?? defaultKind;
}

function aggregate(values: number[], kind: AggregationKind): number {
    if (values.length === 0) return 0;
    switch (kind) {
        case 'sum':
            return values.reduce((a, b) => a + b, 0);
        case 'avg':
            return values.reduce((a, b) => a + b, 0) / values.length;
        case 'count':
            return values.length;
        case 'min':
            return Math.min(...values);
        case 'max':
            return Math.max(...values);
        case 'none':
            return values[0];
    }
}

/**
 * Build a labels + per-series data matrix from rows with categorical aggregation.
 *
 * - `labels` is the ordered list of unique x-axis values (first-seen order).
 * - `seriesData[i]` has one number per label, aggregated according to `kind`.
 * - If `seriesField` is set (and no explicit series array), rows are filtered per
 *   series by matching seriesField == series.label before aggregation.
 */
function buildCategoricalData(
    rows: Row[],
    p: ChartComponentProps,
    seriesList: ChartSeriesConfig[],
    xField: string,
    kind: AggregationKind,
): { labels: string[]; seriesData: number[][] } {
    if (kind === 'none') {
        // Pre-aggregated path: each row contributes one data point.
        const labels = rows.map((r) => String(r[xField] ?? ''));
        const seriesField = p.seriesField && !p.series ? p.seriesField : undefined;
        const seriesData = seriesList.map((s) =>
            rows.map((r) => {
                if (seriesField) {
                    return String(r[seriesField] ?? '') === s.label ? Number(r[s.valueField] ?? 0) : 0;
                }
                return Number(r[s.valueField] ?? 0);
            }),
        );
        return { labels, seriesData };
    }

    const labels: string[] = [];
    const labelIndex = new Map<string, number>();
    for (const row of rows) {
        const key = String(row[xField] ?? '');
        if (!labelIndex.has(key)) {
            labelIndex.set(key, labels.length);
            labels.push(key);
        }
    }

    const seriesField = p.seriesField && !p.series ? p.seriesField : undefined;

    const seriesData = seriesList.map((s) => {
        const buckets: number[][] = labels.map(() => []);
        for (const row of rows) {
            if (seriesField && String(row[seriesField] ?? '') !== s.label) continue;
            const idx = labelIndex.get(String(row[xField] ?? ''));
            if (idx === undefined) continue;
            const raw = row[s.valueField];
            if (kind === 'count') {
                buckets[idx].push(1);
            } else {
                const n = Number(raw ?? 0);
                if (!Number.isFinite(n)) continue;
                buckets[idx].push(n);
            }
        }
        return buckets.map((bucket) => aggregate(bucket, kind));
    });

    return { labels, seriesData };
}

/**
 * Build labels + a single values array for single-series circular-style charts
 * (pie, donut, polar-area). Aggregates multiple rows that share a label.
 */
function buildCircularData(
    rows: Row[],
    labelField: string,
    valueField: string,
    kind: AggregationKind,
): { labels: string[]; values: number[] } {
    if (kind === 'none') {
        const labels = rows.map((r) => String(r[labelField] ?? ''));
        const values = rows.map((r) => Number(r[valueField] ?? 0));
        return { labels, values };
    }

    const labels: string[] = [];
    const labelIndex = new Map<string, number>();
    const buckets: number[][] = [];
    for (const row of rows) {
        const key = String(row[labelField] ?? '');
        let idx = labelIndex.get(key);
        if (idx === undefined) {
            idx = labels.length;
            labels.push(key);
            labelIndex.set(key, idx);
            buckets.push([]);
        }
        if (kind === 'count') {
            buckets[idx].push(1);
        } else {
            const n = Number(row[valueField] ?? 0);
            if (Number.isFinite(n)) buckets[idx].push(n);
        }
    }
    const values = buckets.map((b) => aggregate(b, kind));
    return { labels, values };
}

function buildAxisScale(axis: ChartAxisConfig | undefined, _p: ChartComponentProps, stacked?: boolean) {
    if (!axis) return { stacked };
    const scale: Record<string, unknown> = { stacked: stacked ?? false };
    if (axis.display !== undefined) scale.display = axis.display;
    if (axis.beginAtZero) scale.beginAtZero = true;
    if (axis.min !== undefined) scale.min = axis.min;
    if (axis.max !== undefined) scale.max = axis.max;
    if (axis.title) {
        scale.title = { display: true, text: axis.title };
    }
    const grid: Record<string, unknown> = {};
    if (axis.gridDisplay !== undefined) grid.display = axis.gridDisplay;
    if (axis.gridColor) grid.color = axis.gridColor;
    if (Object.keys(grid).length) scale.grid = grid;
    if (axis.tickColor || axis.format) {
        scale.ticks = {
            ...(axis.tickColor ? { color: axis.tickColor } : {}),
            ...(axis.format
                ? {
                      callback: (value: unknown) =>
                          formatValue(value, axis.format, axis.decimals, axis.currencySymbol),
                  }
                : {}),
        };
    }
    return scale;
}

function buildLegendConfig(p: ChartComponentProps) {
    if (p.showLegend === false) return { display: false };
    const position: LegendPosition = p.legendPosition ?? 'top';
    return {
        display: true,
        position,
        align: p.legendAlign ?? 'center',
        labels: {
            ...(p.legendFontSize ? { font: { size: p.legendFontSize } } : {}),
            ...(p.legendBoxWidth ? { boxWidth: p.legendBoxWidth } : {}),
        },
    };
}

function buildTooltipConfig(p: ChartComponentProps) {
    if (p.tooltipEnabled === false) return { enabled: false };
    return {
        enabled: true,
        mode: p.tooltipMode ?? 'nearest',
        intersect: p.tooltipIntersect ?? true,
        callbacks: p.tooltipValueFormat
            ? {
                  label: (item: { parsed: unknown; dataset?: { label?: string } }) => {
                      const parsed = item.parsed as number | { y?: number; x?: number; r?: number } | null;
                      const num =
                          typeof parsed === 'number'
                              ? parsed
                              : parsed && typeof parsed === 'object' && 'y' in parsed
                                  ? Number((parsed as { y?: unknown }).y)
                                  : null;
                      const label = item.dataset?.label ?? '';
                      if (num === null) return label;
                      return `${label}: ${formatValue(num, p.tooltipValueFormat)}`;
                  },
              }
            : undefined,
    };
}

function buildTitlePlugin(title: string, p: ChartComponentProps) {
    if (!title) return { display: false };
    return {
        display: true,
        text: title,
        align: p.titleAlign ?? 'center',
        ...(p.titleColor ? { color: p.titleColor } : {}),
        ...(p.titleFontSize ? { font: { size: p.titleFontSize } } : {}),
    };
}

function buildSubtitlePlugin(subtitle: string) {
    if (!subtitle) return undefined;
    return { display: true, text: subtitle, padding: { bottom: 8 } };
}

export const ChartRenderer: React.FC<Props> = ({ component, styleCss }) => {
    const viewerCtx = useViewerContext();
    const p = component.props as unknown as ChartComponentProps;
    const datasources = viewerCtx.datasources;
    const datasourceConfigs = viewerCtx.datasourceConfigs;
    const drillThroughVariable = p.onDrillThrough;

    const rows = useMemo<Row[]>(() => {
        if (!p.datasourceId) return [];
        const cfg = datasourceConfigs.find((d) => d.id === p.datasourceId);
        if (cfg && datasources[cfg.name]) {
            return datasources[cfg.name].rows;
        }
        return [];
    }, [p.datasourceId, datasources, datasourceConfigs]);

    const exprCtx: ExpressionContext = useMemo(() => ({
        datasources: buildExpressionDatasources(datasources),
        parameters: viewerCtx.parameters,
        variables: viewerCtx.variables,
        builtInFields: viewerCtx.builtInFields,
    }), [datasources, viewerCtx.parameters, viewerCtx.variables, viewerCtx.builtInFields]);

    const resolvedTitle = useEvaluatedString(p.title, exprCtx);
    const resolvedSubtitle = useEvaluatedString(p.subtitle, exprCtx);
    const hidden = useEvaluatedBoolean(p.hidden, exprCtx, false);

    const handleChartClick = useMemo(() => {
        if (!drillThroughVariable || !viewerCtx.onDrillThrough) return undefined;
        return (_event: unknown, elements: Array<{ index: number }>) => {
            if (elements.length > 0) {
                const idx = elements[0].index;
                const row = rows[idx];
                if (row) viewerCtx.onDrillThrough!(drillThroughVariable, row);
            }
        };
    }, [drillThroughVariable, viewerCtx.onDrillThrough, rows]);

    const isLoading = viewerCtx.loadingDatasources.size > 0;

    if (isLoading) {
        return (
            <div
                style={{
                    height: p.height ?? 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--eui-bg-subtle)',
                    borderRadius: 6,
                    ...styleCss,
                }}
                aria-hidden="true"
            >
                <div className="eui-rb-viewer-shimmer" style={{ width: '80%', height: 160 }} />
            </div>
        );
    }

    if (hidden) return null;

    const chartType = component.type;
    const commonProps = {
        rows,
        props: p,
        title: resolvedTitle,
        subtitle: resolvedSubtitle,
        styleCss,
        onClick: handleChartClick,
    };

    switch (chartType) {
        case 'chart-bar':
            return <CartesianBar {...commonProps} horizontal={false} stacked={p.stacked ?? false} />;
        case 'chart-horizontal-bar':
            return <CartesianBar {...commonProps} horizontal={true} stacked={p.stacked ?? false} />;
        case 'chart-stacked-bar':
            return <CartesianBar {...commonProps} horizontal={false} stacked />;
        case 'chart-line':
            return <CartesianLine {...commonProps} areaFill={false} />;
        case 'chart-area':
            return <CartesianLine {...commonProps} areaFill />;
        case 'chart-pie':
            return <CircularChart {...commonProps} kind="pie" />;
        case 'chart-donut':
            return <CircularChart {...commonProps} kind="donut" />;
        case 'chart-polar-area':
            return <PolarAreaChart {...commonProps} />;
        case 'chart-radar':
            return <RadarChart {...commonProps} />;
        case 'chart-scatter':
            return <ScatterChart {...commonProps} />;
        case 'chart-bubble':
            return <BubbleChart {...commonProps} />;
        default:
            return null;
    }
};

type ChartClickHandler = (event: unknown, elements: Array<{ index: number }>) => void;

interface CommonChartProps {
    rows: Row[];
    props: ChartComponentProps;
    title: string;
    subtitle: string;
    styleCss: React.CSSProperties;
    onClick?: ChartClickHandler;
}

function containerStyle(p: ChartComponentProps, styleCss: React.CSSProperties, onClick: unknown): React.CSSProperties {
    return {
        position: 'relative',
        cursor: onClick ? 'pointer' : undefined,
        ...(p.height ? { height: p.height } : {}),
        ...styleCss,
    };
}

// ── Cartesian: Bar / Horizontal Bar / Stacked Bar ──────────────────────────
const CartesianBar: React.FC<CommonChartProps & { horizontal: boolean; stacked: boolean }> = ({
    rows, props: p, title, subtitle, styleCss, onClick, horizontal, stacked,
}) => {
    const seriesList = toSeriesList(rows, p);
    const kind = resolveAggregation(p, 'sum');
    const { labels, seriesData } = buildCategoricalData(rows, p, seriesList, p.xAxisField ?? '', kind);

    const datasets = seriesList.map((s, i) => {
        const data = seriesData[i];
        const bg = s.color ?? pickColor(p, i, defaultColors[i % defaultColors.length]);
        return {
            label: s.label ?? s.valueField,
            data,
            backgroundColor: bg,
            borderColor: p.barBorderColor ?? bg,
            borderWidth: p.barBorderWidth ?? 0,
            borderRadius: p.barBorderRadius ?? 0,
            barPercentage: p.barPercentage ?? 0.9,
            categoryPercentage: p.categoryPercentage ?? 0.8,
        };
    });

    const data: ChartData<'bar'> = { labels, datasets };

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: p.aspectRatio ? true : true,
        aspectRatio: p.aspectRatio,
        indexAxis: horizontal ? 'y' : 'x',
        animation: p.animate === false ? false : undefined,
        plugins: {
            legend: buildLegendConfig(p),
            title: buildTitlePlugin(title, p),
            subtitle: buildSubtitlePlugin(subtitle),
            tooltip: buildTooltipConfig(p),
        },
        scales: {
            x: buildAxisScale(p.xAxis, p, stacked) as ChartOptions<'bar'>['scales'] extends infer S ? S : never,
            y: buildAxisScale(p.yAxis, p, stacked) as ChartOptions<'bar'>['scales'] extends infer S ? S : never,
        } as ChartOptions<'bar'>['scales'],
        onClick: onClick as ChartOptions<'bar'>['onClick'],
    };

    return (
        <div style={containerStyle(p, styleCss, onClick)} role="img" aria-label={title || 'Bar chart'}>
            <Bar data={data} options={options} />
        </div>
    );
};

// ── Cartesian: Line / Area ─────────────────────────────────────────────────
const CartesianLine: React.FC<CommonChartProps & { areaFill: boolean }> = ({
    rows, props: p, title, subtitle, styleCss, onClick, areaFill,
}) => {
    const seriesList = toSeriesList(rows, p);
    const kind = resolveAggregation(p, 'sum');
    const { labels, seriesData } = buildCategoricalData(rows, p, seriesList, p.xAxisField ?? '', kind);
    const effectiveAreaFill = p.areaFill ?? areaFill;

    const datasets = seriesList.map((s, i) => {
        const data = seriesData[i];
        const color = s.color ?? pickColor(p, i, defaultColors[i % defaultColors.length]);
        return {
            label: s.label ?? s.valueField,
            data,
            borderColor: color,
            backgroundColor: effectiveAreaFill ? `${color}33` : 'transparent',
            tension: p.lineTension ?? 0.3,
            borderWidth: s.borderWidth ?? p.lineBorderWidth ?? 2,
            pointRadius: (p.showPoints ?? true) ? (p.pointRadius ?? 4) : 0,
            pointHoverRadius: (p.showPoints ?? true) ? (p.pointRadius ?? 4) + 2 : 0,
            pointStyle: s.pointStyle ?? p.pointStyle ?? 'circle',
            fill: effectiveAreaFill,
        };
    });

    const data: ChartData<'line'> = { labels, datasets };

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: p.aspectRatio,
        animation: p.animate === false ? false : undefined,
        plugins: {
            legend: buildLegendConfig(p),
            title: buildTitlePlugin(title, p),
            subtitle: buildSubtitlePlugin(subtitle),
            tooltip: buildTooltipConfig(p),
        },
        scales: {
            x: buildAxisScale(p.xAxis, p) as ChartOptions<'line'>['scales'] extends infer S ? S : never,
            y: buildAxisScale(p.yAxis, p) as ChartOptions<'line'>['scales'] extends infer S ? S : never,
        } as ChartOptions<'line'>['scales'],
        onClick: onClick as ChartOptions<'line'>['onClick'],
    };

    return (
        <div style={containerStyle(p, styleCss, onClick)} role="img" aria-label={title || 'Line chart'}>
            <Line data={data} options={options} />
        </div>
    );
};

// ── Circular: Pie / Donut ──────────────────────────────────────────────────
const CircularChart: React.FC<CommonChartProps & { kind: 'pie' | 'donut' }> = ({
    rows, props: p, title, subtitle, styleCss, onClick, kind,
}) => {
    const aggKind = resolveAggregation(p, 'sum');
    const { labels, values } = buildCircularData(rows, p.labelField ?? '', p.valueField ?? '', aggKind);
    const colors = (p.colors && p.colors.length > 0)
        ? labels.map((_, i) => p.colors![i % p.colors!.length])
        : labels.map((_, i) => defaultColors[i % defaultColors.length]);

    const data: ChartData<'pie' | 'doughnut'> = {
        labels,
        datasets: [{
            data: values,
            backgroundColor: colors,
            borderColor: p.borderColor,
            borderWidth: p.borderWidth ?? 0,
        }],
    };

    const cutout = kind === 'donut' ? `${p.cutoutPercent ?? 50}%` : 0;

    const options: ChartOptions<'pie' | 'doughnut'> = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: p.aspectRatio,
        rotation: p.rotation,
        animation: p.animate === false ? false : undefined,
        plugins: {
            legend: buildLegendConfig(p),
            title: buildTitlePlugin(title, p),
            subtitle: buildSubtitlePlugin(subtitle),
            tooltip: buildTooltipConfig(p),
        },
        cutout,
        onClick: onClick as ChartOptions<'pie'>['onClick'],
    };

    const Component = kind === 'donut' ? Doughnut : Pie;

    return (
        <div style={containerStyle(p, styleCss, onClick)} role="img" aria-label={title || `${kind} chart`}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Component data={data as any} options={options as any} />
        </div>
    );
};

// ── Polar Area ─────────────────────────────────────────────────────────────
const PolarAreaChart: React.FC<CommonChartProps> = ({ rows, props: p, title, subtitle, styleCss, onClick }) => {
    const aggKind = resolveAggregation(p, 'sum');
    const { labels, values } = buildCircularData(rows, p.labelField ?? '', p.valueField ?? '', aggKind);
    const colors = (p.colors && p.colors.length > 0)
        ? labels.map((_, i) => p.colors![i % p.colors!.length])
        : labels.map((_, i) => defaultColors[i % defaultColors.length]);

    const data: ChartData<'polarArea'> = {
        labels,
        datasets: [{
            data: values,
            backgroundColor: colors.map((c) => `${c}BB`),
            borderColor: colors,
            borderWidth: p.borderWidth ?? 1,
        }],
    };

    const options: ChartOptions<'polarArea'> = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: p.aspectRatio,
        animation: p.animate === false ? false : undefined,
        plugins: {
            legend: buildLegendConfig(p),
            title: buildTitlePlugin(title, p),
            subtitle: buildSubtitlePlugin(subtitle),
            tooltip: buildTooltipConfig(p),
        },
        scales: {
            r: buildAxisScale(p.rAxis, p) as ChartOptions<'polarArea'>['scales'] extends infer S ? S : never,
        } as ChartOptions<'polarArea'>['scales'],
        onClick: onClick as ChartOptions<'polarArea'>['onClick'],
    };

    return (
        <div style={containerStyle(p, styleCss, onClick)} role="img" aria-label={title || 'Polar area chart'}>
            <PolarArea data={data} options={options} />
        </div>
    );
};

// ── Radar ──────────────────────────────────────────────────────────────────
const RadarChart: React.FC<CommonChartProps> = ({ rows, props: p, title, subtitle, styleCss, onClick }) => {
    const seriesList = toSeriesList(rows, p);
    const aggKind = resolveAggregation(p, 'sum');
    const { labels, seriesData } = buildCategoricalData(rows, p, seriesList, p.labelField ?? p.xAxisField ?? '', aggKind);

    const datasets = seriesList.map((s, i) => {
        const data = seriesData[i];
        const color = s.color ?? pickColor(p, i, defaultColors[i % defaultColors.length]);
        return {
            label: s.label ?? s.valueField,
            data,
            backgroundColor: `${color}44`,
            borderColor: color,
            borderWidth: s.borderWidth ?? 2,
            pointBackgroundColor: color,
            pointRadius: (p.showPoints ?? true) ? (p.pointRadius ?? 3) : 0,
            pointStyle: s.pointStyle ?? p.pointStyle ?? 'circle',
        };
    });

    const data: ChartData<'radar'> = { labels, datasets };

    const options: ChartOptions<'radar'> = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: p.aspectRatio,
        animation: p.animate === false ? false : undefined,
        plugins: {
            legend: buildLegendConfig(p),
            title: buildTitlePlugin(title, p),
            subtitle: buildSubtitlePlugin(subtitle),
            tooltip: buildTooltipConfig(p),
        },
        scales: {
            r: buildAxisScale(p.rAxis, p) as ChartOptions<'radar'>['scales'] extends infer S ? S : never,
        } as ChartOptions<'radar'>['scales'],
        onClick: onClick as ChartOptions<'radar'>['onClick'],
    };

    return (
        <div style={containerStyle(p, styleCss, onClick)} role="img" aria-label={title || 'Radar chart'}>
            <Radar data={data} options={options} />
        </div>
    );
};

// ── Scatter ────────────────────────────────────────────────────────────────
const ScatterChart: React.FC<CommonChartProps> = ({ rows, props: p, title, subtitle, styleCss, onClick }) => {
    const seriesList = toSeriesList(rows, p);
    const datasets = seriesList.map((s, i) => {
        const xField = s.xField ?? p.xAxisField ?? '';
        const yField = s.yField ?? s.valueField ?? p.yAxisField ?? '';
        const pts = rows
            .map((r) => ({ x: Number(r[xField]), y: Number(r[yField]) }))
            .filter((pt) => Number.isFinite(pt.x) && Number.isFinite(pt.y));
        const color = s.color ?? pickColor(p, i, defaultColors[i % defaultColors.length]);
        return {
            label: s.label ?? yField,
            data: pts,
            backgroundColor: color,
            borderColor: color,
            pointRadius: p.pointRadius ?? 5,
            pointStyle: s.pointStyle ?? p.pointStyle ?? 'circle',
        };
    });

    const data: ChartData<'scatter'> = { datasets };

    const options: ChartOptions<'scatter'> = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: p.aspectRatio,
        animation: p.animate === false ? false : undefined,
        plugins: {
            legend: buildLegendConfig(p),
            title: buildTitlePlugin(title, p),
            subtitle: buildSubtitlePlugin(subtitle),
            tooltip: buildTooltipConfig(p),
        },
        scales: {
            x: { type: 'linear', ...(buildAxisScale(p.xAxis, p) as object) },
            y: { type: 'linear', ...(buildAxisScale(p.yAxis, p) as object) },
        } as ChartOptions<'scatter'>['scales'],
        onClick: onClick as ChartOptions<'scatter'>['onClick'],
    };

    return (
        <div style={containerStyle(p, styleCss, onClick)} role="img" aria-label={title || 'Scatter chart'}>
            <Scatter data={data} options={options} />
        </div>
    );
};

// ── Bubble ─────────────────────────────────────────────────────────────────
const BubbleChart: React.FC<CommonChartProps> = ({ rows, props: p, title, subtitle, styleCss, onClick }) => {
    const seriesList = toSeriesList(rows, p);
    const scale = p.radiusScale ?? 1;

    const datasets = seriesList.map((s, i) => {
        const xField = s.xField ?? p.xAxisField ?? '';
        const yField = s.yField ?? s.valueField ?? p.yAxisField ?? '';
        const rField = s.radiusField ?? p.radiusField ?? '';
        const pts = rows
            .map((r) => ({
                x: Number(r[xField]),
                y: Number(r[yField]),
                r: Math.max(3, Number(r[rField] ?? 0) * scale),
            }))
            .filter((pt) => Number.isFinite(pt.x) && Number.isFinite(pt.y) && Number.isFinite(pt.r));
        const color = s.color ?? pickColor(p, i, defaultColors[i % defaultColors.length]);
        return {
            label: s.label ?? yField,
            data: pts,
            backgroundColor: `${color}99`,
            borderColor: color,
        };
    });

    const data: ChartData<'bubble'> = { datasets };

    const options: ChartOptions<'bubble'> = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: p.aspectRatio,
        animation: p.animate === false ? false : undefined,
        plugins: {
            legend: buildLegendConfig(p),
            title: buildTitlePlugin(title, p),
            subtitle: buildSubtitlePlugin(subtitle),
            tooltip: buildTooltipConfig(p),
        },
        scales: {
            x: { type: 'linear', ...(buildAxisScale(p.xAxis, p) as object) },
            y: { type: 'linear', ...(buildAxisScale(p.yAxis, p) as object) },
        } as ChartOptions<'bubble'>['scales'],
        onClick: onClick as ChartOptions<'bubble'>['onClick'],
    };

    return (
        <div style={containerStyle(p, styleCss, onClick)} role="img" aria-label={title || 'Bubble chart'}>
            <Bubble data={data} options={options} />
        </div>
    );
};
