import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import CustomThresholds from './CustomThresholds';
import Variants from './Variants';

import { MOBILE_FEATURE_ICONS } from '../mobile-icons';

import _PullToRefresh_props_json from './../../../components/pull-to-refresh/PullToRefresh.props.json';
const { pullToRefreshProps } = _PullToRefresh_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Default spinner indicator' },
    { id: 'variants', title: 'Indicator Variants', description: 'spinner, arrow, dots, minimal' },
    { id: 'thresholds', title: 'Custom Thresholds', description: 'Custom threshold, max pull, labels' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Touch & promise-aware', description: 'Indicator stays visible until the returned promise resolves.', icon: MOBILE_FEATURE_ICONS.refresh },
    { title: 'Velocity dismissal', description: 'A fast flick triggers refresh even without crossing the full threshold.', icon: MOBILE_FEATURE_ICONS.bolt },
    { title: 'Four indicator variants', description: 'spinner, arrow, dots, or a minimal bar — pick what fits the screen.', icon: MOBILE_FEATURE_ICONS.grid },
    { title: 'Custom labels', description: 'Localize pulling, release, and refreshing text.', icon: MOBILE_FEATURE_ICONS.keyboard },
    { title: 'External scroll container', description: 'Point at any scrollable element via scrollContainer when the scroller lives below the wrapper.', icon: MOBILE_FEATURE_ICONS.cursor },
    { title: 'Reduced motion', description: 'Animation and inertial transitions disable themselves under prefers-reduced-motion.', icon: MOBILE_FEATURE_ICONS.shieldCheck },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const PullToRefreshPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>Pull To Refresh</h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                Wrap any scrollable list to add the standard mobile pull-down-to-refresh gesture with promise-aware progress indicators.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="variants" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Indicator Variants</h2>
            <Variants />
        </section>

        <section id="thresholds" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Custom Thresholds & Labels</h2>
            <CustomThresholds />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { PullToRefresh } from 'fluxo-ui';\nimport type { PullToRefreshProps, PullToRefreshVariant } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={pullToRefreshProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default PullToRefreshPage;
