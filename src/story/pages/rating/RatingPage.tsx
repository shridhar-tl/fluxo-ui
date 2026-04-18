import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Labels from './Labels';
import Precision from './Precision';
import Shapes from './Shapes';
import Sizes from './Sizes';
import Variants from './Variants';

import _Rating_props_json from './../../../components/rating/Rating.props.json';
const { ratingProps } = _Rating_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Simple rating with defaults' },
    { id: 'shapes', title: 'Shapes', description: 'Star, heart, thumb, circle, square' },
    { id: 'sizes', title: 'Sizes', description: 'Five size variants' },
    { id: 'variants', title: 'Variants', description: 'Color variants' },
    { id: 'precision', title: 'Precision', description: 'Whole, half, and decimal values' },
    { id: 'labels', title: 'Tooltips & Labels', description: 'Per-star tooltips and dynamic labels' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];


const features: FeatureItem[] = [
    {
        title: 'Five Shapes',
        description: 'Star, heart, thumb, circle, and square icons built-in — plus custom icon support.',
        icon: 'M12 2l2.95 6.74 7.3.63-5.53 4.82 1.66 7.16L12 17.77 5.62 21.35 7.28 14.2 1.75 9.37l7.3-.63L12 2z',
    },
    {
        title: 'Fractional Precision',
        description: 'Click anywhere on an icon for half-star or decimal ratings with pixel-accurate fills.',
        icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5',
    },
    {
        title: 'Tooltips & Labels',
        description: 'Per-star tooltips and dynamic labels that update on hover for expressive feedback.',
        icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z',
    },
    {
        title: 'Keyboard Accessible',
        description: 'Arrow keys, Home/End, and ARIA slider roles for full keyboard navigation.',
        icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const RatingPage: React.FC = () => {
    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                    Rating
                </h1>
                <p className="text-base md:text-xl" style={subtleStyle}>
                    A flexible star rating component with multiple shapes, fractional precision, tooltips, and full keyboard support.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="shapes" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Shapes</h2>
                <p className="mb-4 text-sm" style={subtleStyle}>
                    Choose from five built-in shapes using the <code>shape</code> prop.
                </p>
                <Shapes />
            </section>

            <section id="sizes" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Sizes</h2>
                <Sizes />
            </section>

            <section id="variants" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Variants</h2>
                <Variants />
            </section>

            <section id="precision" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Precision</h2>
                <Precision />
            </section>

            <section id="labels" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Tooltips & Labels</h2>
                <Labels />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
                <CodeBlock code={`import { Rating } from 'fluxo-ui';\nimport type { RatingProps, RatingShape, RatingSize, RatingVariant, RatingPrecision } from 'fluxo-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
                <PropsTable props={ratingProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default RatingPage;
