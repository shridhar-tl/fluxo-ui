import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Interactive from './Interactive';
import Sizes from './Sizes';
import Variants from './Variants';

import { MOBILE_FEATURE_ICONS } from '../mobile-icons';

import _StepDots_props_json from './../../../components/step-dots/StepDots.props.json';
const { stepDotsProps } = _StepDots_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Default dot indicator' },
    { id: 'variants', title: 'Variants', description: 'Dot, bar, pill, numbered' },
    { id: 'sizes', title: 'Sizes', description: 'Small, medium, large' },
    { id: 'interactive', title: 'Interactive', description: 'Keyboard-navigable dots' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Four variants', description: 'Dot (stretching pill), bar, pill, and numbered styles.', icon: MOBILE_FEATURE_ICONS.grid },
    { title: 'Three sizes', description: 'sm / md / lg scale the whole indicator group.', icon: MOBILE_FEATURE_ICONS.bars },
    { title: 'Interactive mode', description: 'Add interactive to make dots focusable and clickable.', icon: MOBILE_FEATURE_ICONS.cursor },
    { title: 'ARIA tablist', description: 'role="tablist" with aria-current="step" for assistive tech.', icon: MOBILE_FEATURE_ICONS.eye },
    { title: 'Reduced motion', description: 'Animations disable themselves under prefers-reduced-motion.', icon: MOBILE_FEATURE_ICONS.shieldCheck },
    { title: 'Theme-driven', description: 'Active color uses --eui-primary; works in every theme + dark mode.', icon: MOBILE_FEATURE_ICONS.palette },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const StepDotsPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>Step Dots</h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                Tiny dot/bar indicators showing position in an onboarding flow or carousel. Lightweight alternative to the full Stepper.
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

        <section id="sizes" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Sizes</h2>
            <Sizes />
        </section>

        <section id="interactive" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Interactive</h2>
            <Interactive />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { StepDots } from 'fluxo-ui';\nimport type { StepDotsProps, StepDotsVariant, StepDotsSize } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={stepDotsProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default StepDotsPage;
