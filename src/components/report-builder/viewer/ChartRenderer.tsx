import React, { useEffect, useMemo, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Filler,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import { evaluateExpression } from '../expression/expression-parser';
import type { ExpressionContext } from '../expression/expression-types';
import type { ReportComponent, ChartComponentProps } from '../report-definition-types';
import { useViewerContext, buildExpressionDatasources } from './ViewerExpressionContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Filler, Title, Tooltip, Legend);

interface Props {
    component: ReportComponent;
    styleCss: React.CSSProperties;
}

type Row = Record<string, unknown>;

const defaultColors = [
    '#4f87f7', '#f76f6f', '#48c774', '#ffb347', '#a78bfa',
    '#f472b6', '#38bdf8', '#fb923c', '#34d399', '#e879f9',
];

async function evalTitle(title: string | undefined, ctx: ExpressionContext): Promise<string> {
    if (!title) return '';
    if (!title.startsWith('=')) return title;
    const { result, error } = await evaluateExpression(title.slice(1), ctx);
    if (error) return title;
    return String(result ?? '');
}

export const ChartRenderer: React.FC<Props> = ({ component, styleCss }) => {
    const viewerCtx = useViewerContext();
    const p = component.props as unknown as ChartComponentProps;
    const datasources = viewerCtx.datasources;
    const datasourceConfigs = viewerCtx.datasourceConfigs;
    const drillThroughParam = p.onDrillThrough;

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
    }), [datasources, viewerCtx.parameters]);

    const [resolvedTitle, setResolvedTitle] = useState(p.title ?? '');

    useEffect(() => {
        evalTitle(p.title, exprCtx).then(setResolvedTitle);
    }, [p.title, exprCtx]);

    const handleChartClick = useMemo(() => {
        if (!drillThroughParam || !viewerCtx.onDrillThrough) return undefined;
        return (_event: unknown, elements: Array<{ index: number }>) => {
            if (elements.length > 0) {
                const idx = elements[0].index;
                const row = rows[idx];
                if (row) viewerCtx.onDrillThrough!(drillThroughParam, row);
            }
        };
    }, [drillThroughParam, viewerCtx.onDrillThrough, rows]);

    const isLoading = viewerCtx.loadingDatasources.size > 0;

    if (isLoading) {
        return (
            <div
                style={{
                    height: 200,
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

    const chartType = component.type;
    const showLegend = p.showLegend ?? true;

    if (chartType === 'chart-bar') {
        return <BarChart rows={rows} props={p} title={resolvedTitle} showLegend={showLegend} styleCss={styleCss} onClick={handleChartClick} />;
    }

    if (chartType === 'chart-line') {
        return <LineChart rows={rows} props={p} title={resolvedTitle} showLegend={showLegend} styleCss={styleCss} onClick={handleChartClick} />;
    }

    if (chartType === 'chart-pie') {
        return <PieChart rows={rows} props={p} title={resolvedTitle} showLegend={showLegend} styleCss={styleCss} cutout={false} onClick={handleChartClick} />;
    }

    if (chartType === 'chart-donut') {
        return <PieChart rows={rows} props={p} title={resolvedTitle} showLegend={showLegend} styleCss={styleCss} cutout onClick={handleChartClick} />;
    }

    return null;
};

type ChartClickHandler = (event: unknown, elements: Array<{ index: number }>) => void;

const BarChart: React.FC<{
    rows: Row[];
    props: ChartComponentProps;
    title: string;
    showLegend: boolean;
    styleCss: React.CSSProperties;
    onClick?: ChartClickHandler;
}> = ({ rows, props: p, title, showLegend, styleCss, onClick }) => {
    const labels = rows.map((r) => String(r[p.xAxisField ?? ''] ?? ''));
    const values = rows.map((r) => Number(r[p.yAxisField ?? ''] ?? 0));
    const stacked = p.stacked ?? false;

    const data = {
        labels,
        datasets: [{
            label: title || 'Value',
            data: values,
            backgroundColor: p.barColor ?? '#4f87f7',
        }],
    };

    return (
        <div style={{ position: 'relative', cursor: onClick ? 'pointer' : undefined, ...styleCss }} role="img" aria-label={title || 'Bar chart'}>
            <Bar
                data={data}
                options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: showLegend },
                        title: { display: !!title, text: title },
                    },
                    scales: stacked ? {
                        x: { stacked: true },
                        y: { stacked: true },
                    } : undefined,
                    onClick,
                }}
            />
        </div>
    );
};

const LineChart: React.FC<{
    rows: Row[];
    props: ChartComponentProps;
    title: string;
    showLegend: boolean;
    styleCss: React.CSSProperties;
    onClick?: ChartClickHandler;
}> = ({ rows, props: p, title, showLegend, styleCss, onClick }) => {
    const labels = rows.map((r) => String(r[p.xAxisField ?? ''] ?? ''));
    const values = rows.map((r) => Number(r[p.yAxisField ?? ''] ?? 0));
    const lineColor = p.lineColor ?? '#4f87f7';
    const tension = p.lineTension ?? 0.3;
    const showPoints = p.showPoints ?? true;
    const areaFill = p.areaFill ?? false;

    const data = {
        labels,
        datasets: [{
            label: title || 'Value',
            data: values,
            borderColor: lineColor,
            backgroundColor: areaFill ? `${lineColor}33` : 'transparent',
            tension,
            pointRadius: showPoints ? 4 : 0,
            pointHoverRadius: showPoints ? 6 : 0,
            fill: areaFill,
        }],
    };

    return (
        <div style={{ position: 'relative', cursor: onClick ? 'pointer' : undefined, ...styleCss }} role="img" aria-label={title || 'Line chart'}>
            <Line
                data={data}
                options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: showLegend },
                        title: { display: !!title, text: title },
                    },
                    onClick,
                }}
            />
        </div>
    );
};

const PieChart: React.FC<{
    rows: Row[];
    props: ChartComponentProps;
    title: string;
    showLegend: boolean;
    styleCss: React.CSSProperties;
    cutout: boolean;
    onClick?: ChartClickHandler;
}> = ({ rows, props: p, title, showLegend, styleCss, cutout, onClick }) => {
    const labels = rows.map((r) => String(r[p.labelField ?? ''] ?? ''));
    const values = rows.map((r) => Number(r[p.valueField ?? ''] ?? 0));
    const colors = (p.colors && p.colors.length > 0)
        ? p.colors
        : rows.map((_, i) => defaultColors[i % defaultColors.length]);

    const data = {
        labels,
        datasets: [{
            data: values,
            backgroundColor: colors,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { display: showLegend },
            title: { display: !!title, text: title },
        },
        ...(cutout ? { cutout: '50%' } : {}),
        onClick,
    };

    const Component = cutout ? Doughnut : Pie;

    return (
        <div style={{ position: 'relative', cursor: onClick ? 'pointer' : undefined, ...styleCss }} role="img" aria-label={title || (cutout ? 'Donut chart' : 'Pie chart')}>
            <Component data={data} options={options} />
        </div>
    );
};
