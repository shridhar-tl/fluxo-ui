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

import _Shimmer_props_json from './../../../components/shimmer/Shimmer.props.json';
const { skeletonListProps } = _Shimmer_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Default avatar-two-line list' },
    { id: 'variants', title: 'Variants', description: 'Nine layout presets' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Nine presets', description: 'simple, avatar-text, avatar-two-line, thumbnail, two-line-action, card-stack, comment, chat, media.', icon: MOBILE_FEATURE_ICONS.grid },
    { title: 'Built from primitives', description: 'Composed from existing SkeletonAvatar / SkeletonLine / SkeletonRect / SkeletonText — same shimmer animation.', icon: MOBILE_FEATURE_ICONS.layers },
    { title: 'Configurable density', description: 'Tune rows, gap, padding, avatar shape, and contrast level to match the real UI.', icon: MOBILE_FEATURE_ICONS.bars },
    { title: 'Shimmer or pulse', description: 'Two animations — pick whichever feels right for the surface.', icon: MOBILE_FEATURE_ICONS.sparkles },
    { title: 'Screen reader aware', description: 'role="status" + aria-busy + customizable loadingLabel so assistive tech announces loading state.', icon: MOBILE_FEATURE_ICONS.eye },
    { title: 'Theme-driven', description: 'Uses --eui-* tokens — flips correctly under dark mode and every brand theme.', icon: MOBILE_FEATURE_ICONS.palette },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const SkeletonListPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>Skeleton List</h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A high-level skeleton wrapper — drop in nine ready-made list/card placeholders that match common mobile patterns.
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
            <CodeBlock code={`import { SkeletonList } from 'fluxo-ui';\nimport type { SkeletonListProps, SkeletonListVariant } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={skeletonListProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default SkeletonListPage;
