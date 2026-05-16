import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Variants from './Variants';
import WithExtras from './WithExtras';

import { MOBILE_FEATURE_ICONS } from '../mobile-icons';

import _NavBar_props_json from './../../../components/nav-bar/NavBar.props.json';
const { navBarProps } = _NavBar_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Title, back, actions' },
    { id: 'variants', title: 'Variants', description: 'standard, centered, large, compact, transparent' },
    { id: 'extras', title: 'Sub-row', description: 'Search and segmented filters in the extra row' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Five variants', description: 'standard, centered, large (iOS-style), compact, and transparent.', icon: MOBILE_FEATURE_ICONS.grid },
    { title: 'Back button + actions', description: 'Built-in back button + an actions slot for icon buttons or menus.', icon: MOBILE_FEATURE_ICONS.cursor },
    { title: 'Large-title collapse', description: 'When variant="large" + collapseOnScroll, the title shrinks to the inline row as the page scrolls.', icon: MOBILE_FEATURE_ICONS.bolt },
    { title: 'Optional extra row', description: 'Pass children to add a second row for search inputs, filters, or segmented controls.', icon: MOBILE_FEATURE_ICONS.bars },
    { title: 'Safe-area-aware', description: 'safeArea prop applies env(safe-area-inset-top/left/right) so the bar respects iOS notches.', icon: MOBILE_FEATURE_ICONS.devices },
    { title: 'Position modes', description: 'static, sticky, fixed — pick the right scroll behavior for the screen.', icon: MOBILE_FEATURE_ICONS.layers },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const NavBarPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>Nav Bar</h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                Mobile app bar — back button, title, action icons, and an optional extra row for filters, search, or segmented controls.
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

        <section id="extras" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Sub-row content</h2>
            <WithExtras />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { NavBar } from 'fluxo-ui';\nimport type { NavBarProps, NavBarVariant, NavBarPosition } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={navBarProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default NavBarPage;
