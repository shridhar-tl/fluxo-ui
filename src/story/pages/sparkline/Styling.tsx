import React from 'react';

import { Card, Sparkline } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { churnSeries, flatSeries, gapSeries, profitSeries, revenueSeries, signupSeries } from './sparkline-story-data';

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    width: '100%',
};

const examples: { id: string; title: string; node: React.ReactNode }[] = [
    { id: 'smooth', title: 'Smooth curve', node: <Sparkline data={revenueSeries} curve="smooth" width="100%" height={48} /> },
    { id: 'linear', title: 'Linear curve', node: <Sparkline data={revenueSeries} curve="linear" width="100%" height={48} /> },
    { id: 'step', title: 'Step curve', node: <Sparkline type="area" data={signupSeries} curve="step" width="100%" height={48} color="info" /> },
    { id: 'solid', title: 'Solid fill', node: <Sparkline type="area" data={signupSeries} fill="solid" fillOpacity={0.25} width="100%" height={48} color="#7c3aed" /> },
    { id: 'trend-up', title: 'Trend colors · up', node: <Sparkline data={revenueSeries} trendColors width="100%" height={48} /> },
    { id: 'trend-down', title: 'Trend colors · down', node: <Sparkline data={churnSeries} trendColors width="100%" height={48} /> },
    { id: 'trend-flat', title: 'Trend colors · custom', node: <Sparkline data={flatSeries} trendColors={{ up: 'info', down: 'warning', flat: 'secondary' }} width="100%" height={48} /> },
    { id: 'gaps', title: 'Gaps in data', node: <Sparkline data={gapSeries} dots="all" width="100%" height={48} color="warning" /> },
    { id: 'connect', title: 'Connected gaps', node: <Sparkline data={gapSeries} connectNulls width="100%" height={48} color="warning" /> },
    { id: 'negative', title: 'Negative bar color', node: <Sparkline type="bar" data={profitSeries} color="success" negativeColor="#dc2626" barRadius={2} width="100%" height={48} /> },
    { id: 'threshold', title: 'Threshold at 30', node: <Sparkline type="bar" data={signupSeries} threshold={30} color="primary" negativeColor="#ea580c" width="100%" height={48} /> },
    { id: 'bar-gap', title: 'Tight bars', node: <Sparkline type="bar" data={revenueSeries} barGap={0.05} barRadius={1} width="100%" height={48} color="info" /> },
    { id: 'slow', title: 'Slow draw-in', node: <Sparkline type="area" data={revenueSeries} animationDuration={2000} width="100%" height={48} color="success" /> },
    { id: 'no-cursor', title: 'Tooltip without cursor', node: <Sparkline data={signupSeries} showCursor={false} dots="last" width="100%" height={48} color="#db2777" /> },
    { id: 'thick', title: 'Stroke width', node: <Sparkline data={revenueSeries} strokeWidth={3} dots="last" dotRadius={4} width="100%" height={48} color="danger" /> },
    { id: 'static', title: 'Static, no animation', node: <Sparkline data={revenueSeries} animate={false} interactive={false} width="100%" height={48} color="secondary" /> },
];

const code = `<Sparkline data={data} curve="step" />
<Sparkline type="area" data={data} fill="solid" fillOpacity={0.25} color="#7c3aed" />
<Sparkline data={data} trendColors />
<Sparkline data={data} trendColors={{ up: 'info', down: 'warning', flat: 'secondary' }} />
<Sparkline data={[12, 15, null, 18, 21]} connectNulls />
<Sparkline type="bar" data={profit} color="success" negativeColor="#dc2626" />
<Sparkline type="bar" data={signups} threshold={30} negativeColor="#ea580c" barGap={0.05} />
<Sparkline type="area" data={data} animationDuration={2000} />
<Sparkline data={data} showCursor={false} />
<Sparkline data={data} animate={false} interactive={false} />`;

const Styling: React.FC = () => (
    <>
        <ComponentDemo title="Curves, Fills, Colors & Gaps" description="Fine-tune the look with curves, fills, trend coloring, null handling and stroke options.">
            <div style={gridStyle}>
                {examples.map((example) => (
                    <Card key={example.id} title={example.title} padding="sm">
                        {example.node}
                    </Card>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Styling;
