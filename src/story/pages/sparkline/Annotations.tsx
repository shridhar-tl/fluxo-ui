import React, { useState } from 'react';

import { Card, SelectButton, Sparkline } from '../../../components';
import type { SparklineDots } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { stackStyle } from '../../demo-styles';
import { latencySeries, revenueSeries } from './sparkline-story-data';

const dotItems: { label: string; value: SparklineDots }[] = [
    { label: 'None', value: 'none' },
    { label: 'Last', value: 'last' },
    { label: 'First & last', value: 'first-last' },
    { label: 'Min & max', value: 'min-max' },
    { label: 'Extremes', value: 'extremes' },
    { label: 'All', value: 'all' },
];

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
    width: '100%',
};

const captionStyle: React.CSSProperties = { color: 'var(--eui-text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' };

const Annotations: React.FC = () => {
    const [dots, setDots] = useState<SparklineDots>('min-max');

    const code = `<Sparkline data={data} dots="${dots}" minColor="#dc2626" maxColor="#15803d" />
<Sparkline data={data} referenceLine={{ value: 'mean', label: 'Average', dashed: true }} />
<Sparkline type="area" data={latency} band={{ from: 120, to: 170 }} />
<Sparkline data={latency} referenceLine={180} color="danger" />`;

    return (
        <>
            <ComponentDemo title="Markers, Reference Lines & Bands" description="Highlight key points, compare against an average or goal, and shade a normal range.">
                <div style={stackStyle}>
                    <SelectButton items={dotItems} value={dots} onChange={(event) => setDots(event.value as SparklineDots)} ariaLabel="Markers" />
                    <div style={gridStyle}>
                        <Card title="Markers" padding="sm">
                            <Sparkline data={revenueSeries} dots={dots} minColor="#dc2626" maxColor="#15803d" width="100%" height={56} valueLabel="Revenue" />
                            <div style={captionStyle}>Min in red, max in green</div>
                        </Card>
                        <Card title="Mean reference" padding="sm">
                            <Sparkline
                                data={revenueSeries}
                                dots={dots}
                                referenceLine={{ value: 'mean', label: 'Average', dashed: true }}
                                width="100%"
                                height={56}
                                valueLabel="Revenue"
                            />
                            <div style={captionStyle}>Dashed line at the series average</div>
                        </Card>
                        <Card title="Normal band" padding="sm">
                            <Sparkline type="area" data={latencySeries} dots={dots} band={{ from: 120, to: 170 }} color="info" width="100%" height={56} valueLabel="Latency" />
                            <div style={captionStyle}>Shaded band from 120 to 170 ms</div>
                        </Card>
                        <Card title="Threshold" padding="sm">
                            <Sparkline data={latencySeries} dots={dots} referenceLine={{ value: 180, label: 'SLO' }} color="danger" width="100%" height={56} valueLabel="Latency" />
                            <div style={captionStyle}>SLO line at 180 ms</div>
                        </Card>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Annotations;
