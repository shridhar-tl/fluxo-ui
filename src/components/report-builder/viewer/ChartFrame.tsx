import React from 'react';
import { toDisplayText } from '../data/value-utils';

interface ChartTableDataset {
    label?: string;
    data: readonly unknown[];
}

export interface ChartTableData {
    labels?: readonly unknown[];
    datasets: readonly ChartTableDataset[];
}

interface PointValue {
    x?: unknown;
    y?: unknown;
    r?: unknown;
    /** The value a bubble's radius is drawn from, before scaling. */
    size?: unknown;
}

function isPoint(value: unknown): value is PointValue {
    return typeof value === 'object' && value !== null && ('x' in value || 'y' in value);
}

/** The values a chart draws as a table that screen readers and copy and paste can use, since the canvas itself has no text. */
const ChartDataTable: React.FC<{ caption: string; data: ChartTableData }> = ({ caption, data }) => {
    const labels = data.labels ?? [];
    if (labels.length > 0) {
        const single = data.datasets.length === 1;
        return (
            <table className="eui-rv-chart-data">
                <caption>{caption}</caption>
                <thead>
                    <tr>
                        <th scope="col">Category</th>
                        {data.datasets.map((ds, i) => (
                            <th key={i} scope="col">{single && !ds.label ? 'Value' : toDisplayText(ds.label)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {labels.map((label, row) => (
                        <tr key={row}>
                            <th scope="row">{toDisplayText(label)}</th>
                            {data.datasets.map((ds, i) => (
                                <td key={i}>{toDisplayText(ds.data[row])}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
    const hasRadius = data.datasets.some((ds) => ds.data.some((pt) => isPoint(pt) && pt.r !== undefined));
    return (
        <table className="eui-rv-chart-data">
            <caption>{caption}</caption>
            <thead>
                <tr>
                    <th scope="col">Series</th>
                    <th scope="col">X</th>
                    <th scope="col">Y</th>
                    {hasRadius && <th scope="col">Size</th>}
                </tr>
            </thead>
            <tbody>
                {data.datasets.flatMap((ds, i) =>
                    ds.data.filter(isPoint).map((pt, j) => (
                        <tr key={`${i}-${j}`}>
                            <th scope="row">{toDisplayText(ds.label)}</th>
                            <td>{toDisplayText(pt.x)}</td>
                            <td>{toDisplayText(pt.y)}</td>
                            {hasRadius && <td>{toDisplayText(pt.size ?? pt.r)}</td>}
                        </tr>
                    )),
                )}
            </tbody>
        </table>
    );
};

interface ChartFrameProps {
    style: React.CSSProperties;
    label: string;
    data: ChartTableData;
    children: React.ReactNode;
}

export const ChartFrame: React.FC<ChartFrameProps> = ({ style, label, data, children }) => (
    <figure className="eui-rv-chart" style={{ margin: 0, ...style }} aria-label={label}>
        <div aria-hidden="true" style={{ position: 'relative', height: '100%' }}>
            {children}
        </div>
        <ChartDataTable caption={label} data={data} />
    </figure>
);
