import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import FullSwipe from './FullSwipe';
import Variants from './Variants';

import { MOBILE_FEATURE_ICONS } from '../mobile-icons';

import _SwipeableListItem_props_json from './../../../components/swipeable-list-item/SwipeableListItem.props.json';
const { swipeableListItemProps } = _SwipeableListItem_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Left and right swipe actions' },
    { id: 'variants', title: 'Variants', description: 'Inline, card, compact' },
    { id: 'full-swipe', title: 'Full Swipe', description: 'Auto-fire on long swipe' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Left & right actions', description: 'Reveal independent action strips on either side of the row.', icon: MOBILE_FEATURE_ICONS.swipe },
    { title: 'Per-action colors', description: 'Use the shared status palette: primary, success, warning, danger, neutral.', icon: MOBILE_FEATURE_ICONS.palette },
    { title: 'Full-swipe trigger', description: 'Mark a primary action with fullSwipe to fire it automatically on a long swipe.', icon: MOBILE_FEATURE_ICONS.bolt },
    { title: 'Three variants', description: 'Inline rows, rounded cards, or compact dense rows.', icon: MOBILE_FEATURE_ICONS.grid },
    { title: 'Axis-locked drag', description: 'Vertical scrolling stays untouched — the row only intercepts clear horizontal gestures.', icon: MOBILE_FEATURE_ICONS.cursor },
    { title: 'Imperative handle', description: 'Use a ref to programmatically open/close from outside.', icon: MOBILE_FEATURE_ICONS.sparkles },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const SwipeableListItemPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>Swipeable List Item</h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A list row that reveals actions when the user swipes it left or right — the classic iOS Mail interaction.
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

        <section id="full-swipe" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Full-swipe trigger</h2>
            <FullSwipe />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { SwipeableListItem } from 'fluxo-ui';\nimport type { SwipeableListItemProps, SwipeableAction, SwipeableVariant } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={swipeableListItemProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default SwipeableListItemPage;
