import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Variants from './Variants';

import { MOBILE_FEATURE_ICONS } from '../mobile-icons';

import _TouchRipple_props_json from './../../../components/touch-ripple/TouchRipple.props.json';
const { touchRippleProps } = _TouchRipple_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Default and centered ripple' },
    { id: 'variants', title: 'Variants', description: 'material, subtle, highlight, outline' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Origin-aware ink', description: 'Ripple grows from the tap location (or centered when center is set).', icon: MOBILE_FEATURE_ICONS.cursor },
    { title: 'Four variants', description: 'material, subtle, highlight (primary color), outline (focus ring).', icon: MOBILE_FEATURE_ICONS.grid },
    { title: 'Touch + keyboard', description: 'Pointer-down emits a ripple; Enter/Space emits a centered one.', icon: MOBILE_FEATURE_ICONS.keyboard },
    { title: 'Custom host element', description: 'Render as any tag via as= — usually button, a, or div.', icon: MOBILE_FEATURE_ICONS.layers },
    { title: 'Reduced motion', description: 'Ripple disabled automatically under prefers-reduced-motion.', icon: MOBILE_FEATURE_ICONS.shieldCheck },
    { title: 'Tap highlight suppressed', description: 'Removes the default iOS gray tap highlight in favor of the ripple.', icon: MOBILE_FEATURE_ICONS.sparkles },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const TouchRipplePage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>Touch Ripple</h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A drop-in wrapper that adds a Material-style ripple to any tappable element — buttons, cards, list rows, icons.
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

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { TouchRipple } from 'fluxo-ui';\nimport type { TouchRippleProps, TouchRippleVariant } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={touchRippleProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default TouchRipplePage;
