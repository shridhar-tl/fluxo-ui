import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import LabelModes from './LabelModes';
import Variants from './Variants';

import { MOBILE_FEATURE_ICONS } from '../mobile-icons';

import _MobileTabBar_props_json from './../../../components/mobile-tab-bar/MobileTabBar.props.json';
const { mobileTabBarProps } = _MobileTabBar_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Bottom tab bar with badges' },
    { id: 'variants', title: 'Variants', description: 'flat, elevated, pill, floating' },
    { id: 'labels', title: 'Label modes', description: 'always, active, never' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Four variants', description: 'flat, elevated, pill (active fill), and floating (detached card).', icon: MOBILE_FEATURE_ICONS.grid },
    { title: 'Per-tab badges', description: 'Numeric or text badges with a notched ring against the bar.', icon: MOBILE_FEATURE_ICONS.bell },
    { title: 'Active icon swap', description: 'Optional activeIcon swaps for a filled variant when the tab is selected.', icon: MOBILE_FEATURE_ICONS.sparkles },
    { title: 'Label modes', description: 'always, active-only, or never — match space constraints.', icon: MOBILE_FEATURE_ICONS.bars },
    { title: 'ARIA tablist + keyboard', description: '←/→/Home/End navigate tabs; aria-selected / aria-disabled wired automatically.', icon: MOBILE_FEATURE_ICONS.keyboard },
    { title: 'Safe-area-aware', description: 'env(safe-area-inset-bottom) padding so the bar clears the iOS home indicator.', icon: MOBILE_FEATURE_ICONS.shield },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const MobileTabBarPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>Mobile Tab Bar</h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                Bottom-anchored navigation bar for mobile apps, with badges, active-state icon swaps, and four visual variants.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="variants" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Variants</h2>
            <Variants />
        </section>

        <section id="labels" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Label modes</h2>
            <LabelModes />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { MobileTabBar } from 'fluxo-ui';\nimport type { MobileTabBarProps, MobileTabBarItem, MobileTabBarVariant, MobileTabBarPosition, MobileTabBarShowLabel } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={mobileTabBarProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default MobileTabBarPage;
