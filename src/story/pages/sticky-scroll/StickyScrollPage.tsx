import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Imperative from './Imperative';
import WithLabel from './WithLabel';

import _StickyScroll_props_json from './../../../components/sticky-scroll/StickyScroll.props.json';
const { stickyScrollProps } = _StickyScroll_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Stick-to-bottom live feed' },
    { id: 'with-label', title: 'Labelled Button', description: 'Pill jump-to-latest button' },
    { id: 'imperative', title: 'Imperative & State', description: 'Ref handle + pinned change' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Smart Auto-Follow',
        description: 'Appends auto-scroll the view only while the user is already at the bottom — never yanks them back when reading older content.',
        icon: 'M3.75 12h16.5',
    },
    {
        title: 'Jump To Latest',
        description: 'A floating button appears the moment the user scrolls up, letting them re-pin to the newest content with one click.',
        icon: 'M12 6v6h4.5',
    },
    {
        title: 'Resize-Aware',
        description: 'A ResizeObserver keeps the view pinned even when items grow in height, not just when new ones are added.',
        icon: 'M2.25 15.75',
    },
    {
        title: 'Imperative Handle',
        description: 'scrollToBottom(), isPinned(), and getElement() via ref for custom controls and integrations.',
        icon: 'M9.53 16.122',
    },
    {
        title: 'Reduced Motion',
        description: 'Falls back to instant scroll under prefers-reduced-motion and dampens the button animation.',
        icon: 'M15 19.128',
    },
    {
        title: 'Accessible',
        description: 'Keyboard-focusable jump button with aria-label, an aria-hidden state when pinned, and an optional role like log for live regions.',
        icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const StickyScrollPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Sticky Scroll
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A scroll container that auto-follows new content while the user is at the bottom, but holds its position the moment they scroll up to read history — chat logs, activity feeds, build output, terminals.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="with-label" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Labelled Button</h2>
            <WithLabel />
        </section>

        <section id="imperative" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Imperative & State</h2>
            <Imperative />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { StickyScroll } from 'fluxo-ui';\nimport type { StickyScrollProps, StickyScrollHandle, StickyScrollBehavior } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={stickyScrollProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default StickyScrollPage;
