import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Interactive from './Interactive';
import Layouts from './Layouts';
import Sizes from './Sizes';

import _ActivityGauge_props_json from './../../../components/activity-gauge/ActivityGauge.props.json';
const { activityGaugeProps } = _ActivityGauge_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Multi-series ring chart' },
    { id: 'sizes', title: 'Sizes', description: 'Preset sizes' },
    { id: 'layouts', title: 'Legend Placement', description: 'Bottom, right, or none' },
    { id: 'interactive', title: 'Interactive', description: 'Hover/click highlights' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Multi-Series Rings',
        description: 'Stack 1–N concentric rings with independent values, max, and colors.',
        icon: 'M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245',
    },
    {
        title: 'Center Slot',
        description: 'Built-in title/value/sub-label or fully custom centerContent.',
        icon: 'M3.75 12h16.5',
    },
    {
        title: 'Interactive Highlights',
        description: 'Hover/focus rings or legend items to dim other series and emphasize one.',
        icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372',
    },
    {
        title: 'Tooltips & ARIA',
        description: 'Native tooltips on hover plus per-ring titles for screen readers.',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const ActivityGaugePage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Activity Gauge
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A multi-series concentric ring chart with shared center content and an optional interactive legend.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="sizes" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Sizes</h2>
            <Sizes />
        </section>

        <section id="layouts" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Legend Placement</h2>
            <Layouts />
        </section>

        <section id="interactive" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Interactive</h2>
            <Interactive />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { ActivityGauge } from 'fluxo-ui';\nimport type { ActivityGaugeProps, ActivityGaugeSeries } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={activityGaugeProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default ActivityGaugePage;
