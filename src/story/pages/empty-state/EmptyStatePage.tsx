import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Layouts from './Layouts';
import Sizes from './Sizes';
import Variants from './Variants';
import WithIllustration from './WithIllustration';

import _EmptyState_props_json from './../../../components/empty-state/EmptyState.props.json';
const { emptyStateProps } = _EmptyState_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Title, description, and actions' },
    { id: 'variants', title: 'Variants', description: 'Six pre-styled tones' },
    { id: 'layouts', title: 'Layouts', description: 'Vertical and horizontal' },
    { id: 'sizes', title: 'Sizes', description: 'Compact, comfortable, spacious' },
    { id: 'illustration', title: 'Illustration', description: 'Custom illustration slot' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Six Variants',
        description: 'default, noResults, error, success, restricted, info — each with sensible icons and colors.',
        icon: 'M9.53 16.122',
    },
    {
        title: 'Two Layouts',
        description: 'Vertical for centered states; horizontal for inline placement (collapses on mobile).',
        icon: 'M3.75 12h16.5',
    },
    {
        title: 'Custom Illustration',
        description: 'Drop in any ReactNode — SVG, image, or composed UI — to replace the default icon.',
        icon: 'M2.25 15.75',
    },
    {
        title: 'Heading Outline',
        description: 'headingLevel keeps the document outline correct (h1–h6).',
        icon: 'M12 6v6h4.5',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const EmptyStatePage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Empty State
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A reusable placeholder for empty data, error, success, and first-run states.
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

        <section id="layouts" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Layouts</h2>
            <Layouts />
        </section>

        <section id="sizes" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Sizes</h2>
            <Sizes />
        </section>

        <section id="illustration" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Illustration</h2>
            <WithIllustration />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { EmptyState } from 'fluxo-ui';\nimport type { EmptyStateProps, EmptyStateVariant, EmptyStateSize, EmptyStateLayout } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={emptyStateProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default EmptyStatePage;
