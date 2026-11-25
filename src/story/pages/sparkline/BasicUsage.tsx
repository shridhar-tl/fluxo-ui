import React from 'react';

import { Sparkline } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowLabelStyle, rowStyle, stackStyle } from '../../demo-styles';
import { profitSeries, revenueSeries, signupSeries } from './sparkline-story-data';

const code = `import { Sparkline } from 'fluxo-ui';

<Sparkline data={[42, 48, 45, 52, 58, 55, 63, 61, 70, 74, 72, 81]} />
<Sparkline type="area" color="success" data={signups} />
<Sparkline type="bar" data={profit} />`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Inline Trends" description="Tiny charts that fit inside text, cards and table cells. Hover or focus to inspect values.">
            <div style={stackStyle}>
                <div style={{ ...rowStyle, gap: '1rem' }}>
                    <span style={rowLabelStyle}>Line</span>
                    <Sparkline data={revenueSeries} width={140} height={36} valueLabel="Revenue" />
                </div>
                <div style={{ ...rowStyle, gap: '1rem' }}>
                    <span style={rowLabelStyle}>Area</span>
                    <Sparkline type="area" color="success" data={signupSeries} width={140} height={36} valueLabel="Sign-ups" />
                </div>
                <div style={{ ...rowStyle, gap: '1rem' }}>
                    <span style={rowLabelStyle}>Bar</span>
                    <Sparkline type="bar" data={profitSeries} width={140} height={36} valueLabel="Profit" />
                </div>
                <p style={{ color: 'var(--eui-text)', fontSize: '0.9375rem', margin: 0 }}>
                    Revenue grew 12.5% this quarter <Sparkline data={revenueSeries} width={64} height={16} dots="none" interactive={false} /> while
                    sign-ups kept climbing <Sparkline type="bar" color="success" data={signupSeries} width={64} height={16} interactive={false} />.
                </p>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
