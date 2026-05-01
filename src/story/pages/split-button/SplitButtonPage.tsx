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

import _SplitButton_props_json from './../../../components/split-button/SplitButton.props.json';
const { splitButtonProps } = _SplitButton_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Primary action plus a related-actions menu' },
    { id: 'variants', title: 'Variants', description: 'All seven color variants' },
    { id: 'layouts', title: 'Layouts', description: 'Five layout shapes' },
    { id: 'sizes', title: 'Sizes', description: 'Five preset sizes' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Primary + Menu',
        description: 'A primary action paired with a chevron trigger that opens secondary actions.',
        icon: 'M9.53 16.122a3 3 0 0 0-5.78 1.128',
    },
    {
        title: 'Full Keyboard',
        description: 'Arrow keys, Home/End, type-ahead, Enter/Space activate, Escape closes & restores focus.',
        icon: 'M3.75 12h16.5',
    },
    {
        title: 'Auto-flip Menu',
        description: 'The portal menu auto-flips vertically/horizontally when there is not enough viewport space.',
        icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372',
    },
    {
        title: 'Reuses Button',
        description: 'Both halves use the existing Button so variants, layouts, sizes, and async loading flow through.',
        icon: 'M12 6v6h4.5',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const SplitButtonPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Split Button
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A primary action button paired with a secondary trigger that opens a menu of related actions.
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

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { SplitButton } from 'fluxo-ui';\nimport type { SplitButtonProps, SplitButtonItem } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={splitButtonProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default SplitButtonPage;
