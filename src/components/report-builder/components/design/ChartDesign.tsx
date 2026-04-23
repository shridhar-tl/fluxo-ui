import React from 'react';
import { useRBStore } from '../../report-builder-context';
import type { ReportComponent, ChartComponentProps } from '../../report-definition-types';

interface Props { component: ReportComponent; }

const chartLabels: Record<string, string> = {
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

const BarPreview: React.FC<{ color?: string }> = ({ color = '#4f87f7' }) => (
    <svg viewBox="0 0 200 100" style={{ width: '100%', height: 100 }} aria-hidden="true">
        <rect x="15" y="60" width="30" height="36" rx="2" fill={color} opacity={0.7} />
        <rect x="55" y="30" width="30" height="66" rx="2" fill={color} opacity={0.85} />
        <rect x="95" y="45" width="30" height="51" rx="2" fill={color} opacity={0.75} />
        <rect x="135" y="15" width="30" height="81" rx="2" fill={color} />
        <line x1="10" y1="97" x2="190" y2="97" stroke="var(--eui-border-subtle)" strokeWidth="1" />
        <line x1="10" y1="3" x2="10" y2="97" stroke="var(--eui-border-subtle)" strokeWidth="1" />
    </svg>
);

const LinePreview: React.FC<{ color?: string; fill?: boolean }> = ({ color = '#48c774', fill }) => (
    <svg viewBox="0 0 200 100" style={{ width: '100%', height: 100 }} aria-hidden="true">
        {fill && <path d="M20,70 L60,40 L100,55 L140,25 L180,35 L180,97 L20,97 Z" fill={color} opacity={0.12} />}
        <polyline
            points="20,70 60,40 100,55 140,25 180,35"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx="20" cy="70" r="3" fill={color} />
        <circle cx="60" cy="40" r="3" fill={color} />
        <circle cx="100" cy="55" r="3" fill={color} />
        <circle cx="140" cy="25" r="3" fill={color} />
        <circle cx="180" cy="35" r="3" fill={color} />
        <line x1="10" y1="97" x2="190" y2="97" stroke="var(--eui-border-subtle)" strokeWidth="1" />
        <line x1="10" y1="3" x2="10" y2="97" stroke="var(--eui-border-subtle)" strokeWidth="1" />
    </svg>
);

const PiePreview: React.FC<{ cutout?: boolean }> = ({ cutout }) => {
    const cx = 100;
    const cy = 55;
    const r = 40;
    const innerR = cutout ? 22 : 0;
    const colors = ['#4f87f7', '#f76f6f', '#48c774', '#ffb347'];
    const slices = [0.35, 0.28, 0.22, 0.15];

    let startAngle = -Math.PI / 2;
    const paths = slices.map((pct, i) => {
        const endAngle = startAngle + pct * 2 * Math.PI;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const largeArc = pct > 0.5 ? 1 : 0;

        let d: string;
        if (cutout) {
            const ix1 = cx + innerR * Math.cos(startAngle);
            const iy1 = cy + innerR * Math.sin(startAngle);
            const ix2 = cx + innerR * Math.cos(endAngle);
            const iy2 = cy + innerR * Math.sin(endAngle);
            d = `M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} L${ix2},${iy2} A${innerR},${innerR} 0 ${largeArc} 0 ${ix1},${iy1} Z`;
        } else {
            d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;
        }
        startAngle = endAngle;
        return <path key={i} d={d} fill={colors[i]} opacity={0.85} />;
    });

    return (
        <svg viewBox="0 0 200 110" style={{ width: '100%', height: 110 }} aria-hidden="true">
            {paths}
        </svg>
    );
};

export const ChartDesign: React.FC<Props> = ({ component }) => {
    const p = component.props as unknown as ChartComponentProps;
    const datasources = useRBStore((s) => s.definition.datasources);
    const ds = datasources.find((d) => d.id === p.datasourceId);

    const label = chartLabels[component.type] ?? 'Chart';

    const renderPreview = () => {
        switch (component.type) {
            case 'chart-bar':
            case 'chart-horizontal-bar':
            case 'chart-stacked-bar':
                return <BarPreview color={p.barColor} />;
            case 'chart-line':
            case 'chart-scatter':
                return <LinePreview color={p.lineColor} />;
            case 'chart-area':
                return <LinePreview color={p.lineColor} fill />;
            case 'chart-pie':
                return <PiePreview />;
            case 'chart-donut':
                return <PiePreview cutout />;
            case 'chart-polar-area':
            case 'chart-radar':
            case 'chart-bubble':
                return <PiePreview />;
            default:
                return <BarPreview />;
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                padding: '8px 12px',
                background: 'var(--eui-bg-subtle)',
                border: '1px solid var(--eui-border-subtle)',
                borderRadius: 6,
                color: 'var(--eui-text)',
            }}
        >
            <div style={{ fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
                {p.title || label}
            </div>
            {renderPreview()}
            {ds && (
                <div style={{ fontSize: 10, color: 'var(--eui-text-muted)', textAlign: 'center' }}>
                    {ds.name}
                </div>
            )}
            {!ds && p.datasourceId && (
                <div style={{ fontSize: 10, color: 'var(--eui-text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                    Datasource not found
                </div>
            )}
        </div>
    );
};
