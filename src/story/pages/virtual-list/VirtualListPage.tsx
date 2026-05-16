import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import InfiniteLoading from './InfiniteLoading';
import Variants from './Variants';

import { MOBILE_FEATURE_ICONS } from '../mobile-icons';

import _VirtualList_props_json from './../../../components/virtual-list/VirtualList.props.json';
const { virtualListProps } = _VirtualList_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: '10,000-row windowed list' },
    { id: 'variants', title: 'Variants', description: 'plain, divided, card' },
    { id: 'infinite', title: 'Infinite Loading', description: 'onEndReached for paged feeds' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Windowed rendering', description: 'Only rows visible in the viewport (plus overscan) are mounted.', icon: MOBILE_FEATURE_ICONS.eye },
    { title: 'Fixed or dynamic heights', description: 'Pass a number for uniform rows or a function for per-row heights.', icon: MOBILE_FEATURE_ICONS.bars },
    { title: 'Imperative scroll API', description: 'scrollToIndex / scrollToOffset / getScrollOffset via ref.', icon: MOBILE_FEATURE_ICONS.cursor },
    { title: 'Infinite loading hook', description: 'onEndReached fires when the user nears the bottom — perfect for paged feeds.', icon: MOBILE_FEATURE_ICONS.refresh },
    { title: 'Three variants', description: 'plain, divided (subtle separators), and card (rounded rows).', icon: MOBILE_FEATURE_ICONS.grid },
    { title: 'Theme-aware', description: 'Uses --eui-* variables so it adopts every brand theme and dark mode.', icon: MOBILE_FEATURE_ICONS.palette },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const VirtualListPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>Virtual List</h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                Windowed scrolling list that keeps render cost flat regardless of dataset size — essential for long mobile lists.
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

        <section id="infinite" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Infinite Loading</h2>
            <InfiniteLoading />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { VirtualList } from 'fluxo-ui';\nimport type { VirtualListProps, VirtualListHandle, VirtualListVariant } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={virtualListProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default VirtualListPage;
