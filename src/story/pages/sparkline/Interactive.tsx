import React, { useCallback, useState } from 'react';

import { Card, Sparkline } from '../../../components';
import type { SparklinePointInfo } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, stackStyle } from '../../demo-styles';
import { revenueData } from './sparkline-story-data';

const formatRevenue = (value: number) => `$${value.toFixed(1)}k`;

const renderTooltip = (point: SparklinePointInfo) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: '0.6875rem', opacity: 0.8 }}>{point.label} 2026</span>
        <strong>{point.value === null ? 'No data' : formatRevenue(point.value)}</strong>
    </div>
);

const code = `<Sparkline
    type="area"
    data={[{ value: 42, label: 'Jan' }, { value: 48, label: 'Feb' }]}
    formatValue={(v) => \`$\${v}k\`}
    renderTooltip={(point) => <strong>{point.label}: {point.value}</strong>}
    onPointHover={setHovered}
    onPointClick={setPinned}
    valueLabel="Revenue"
/>`;

const Interactive: React.FC = () => {
    const [hovered, setHovered] = useState<SparklinePointInfo | null>(null);
    const [pinned, setPinned] = useState<SparklinePointInfo | null>(null);

    const handleHover = useCallback((point: SparklinePointInfo | null) => setHovered(point), []);
    const handleClick = useCallback((point: SparklinePointInfo) => setPinned(point), []);

    const shown = hovered ?? pinned ?? revenueData[revenueData.length - 1];
    const shownValue = shown.value === null ? 'No data' : formatRevenue(shown.value);

    return (
        <>
            <ComponentDemo
                title="Tooltips, Events & Keyboard"
                description="Focus the chart and use the arrow keys, Home and End to move between points. Values are announced to screen readers."
            >
                <div style={stackStyle}>
                    <div style={{ width: '100%', maxWidth: 520 }}>
                        <Card padding="md">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                                <span style={{ color: 'var(--eui-text-muted)', fontSize: '0.8125rem' }}>Revenue · {shown.label}</span>
                                <strong style={{ color: 'var(--eui-text)', fontSize: '1.5rem' }}>{shownValue}</strong>
                            </div>
                            <Sparkline
                                type="area"
                                data={revenueData}
                                width="100%"
                                height={80}
                                strokeWidth={2}
                                dots="last"
                                formatValue={formatRevenue}
                                renderTooltip={renderTooltip}
                                onPointHover={handleHover}
                                onPointClick={handleClick}
                                valueLabel="Revenue"
                            />
                        </Card>
                    </div>
                    <div style={readoutStyle} aria-live="polite">
                        {pinned ? `Pinned ${pinned.label}: ${pinned.value === null ? 'No data' : formatRevenue(pinned.value)}` : 'Click a point to pin it.'}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Interactive;
