import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Sizes from './Sizes';
import Variants from './Variants';
import WithProgress from './WithProgress';

import _ScrollToTop_props_json from './../../../components/scroll-to-top/ScrollToTop.props.json';
const { scrollToTopProps } = _ScrollToTop_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Default fixed FAB' },
    { id: 'variants', title: 'Variants × Layouts', description: 'Solid, outlined, glass + custom' },
    { id: 'sizes', title: 'Sizes & Label', description: 'Four sizes + optional pill label' },
    { id: 'progress', title: 'Progress Ring', description: 'Circular ring tracking scroll depth' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Auto-Show / Hide',
        description: 'Appears once the user scrolls past the threshold; smoothly slides back when they reach the top.',
        icon: 'M3.75 12h16.5',
    },
    {
        title: 'Fully Themed',
        description: '7 variants × 3 layouts plus any custom CSS color or gradient. Full dark-mode support out of the box.',
        icon: 'M12 6v6h4.5',
    },
    {
        title: 'Progress Ring',
        description: 'Optional circular ring tracking how far down the page the user has scrolled.',
        icon: 'M9.53 16.122',
    },
    {
        title: 'Window or Container',
        description: 'Tracks the window by default, or any element via the target prop — perfect for scrollable side panels.',
        icon: 'M2.25 15.75',
    },
    {
        title: 'Reduced Motion',
        description: "Falls back to instant scroll under prefers-reduced-motion and skips the appearance animation.",
        icon: 'M15 19.128',
    },
    {
        title: 'Touch Targets',
        description: 'Always ≥ 44×44px on mobile, with focus-visible outline and aria-label.',
        icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const ScrollToTopPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Scroll To Top
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A floating action button that appears once the user has scrolled past a threshold and smooth-scrolls back to the top on click.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="variants" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Variants × Layouts</h2>
            <Variants />
        </section>

        <section id="sizes" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Sizes & Label</h2>
            <Sizes />
        </section>

        <section id="progress" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Progress Ring</h2>
            <WithProgress />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { ScrollToTop } from 'fluxo-ui';\nimport type { ScrollToTopProps, ScrollToTopVariant, ScrollToTopLayout, ScrollToTopSize } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={scrollToTopProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default ScrollToTopPage;
