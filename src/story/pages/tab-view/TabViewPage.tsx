import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicUsage from './BasicUsage';
import ClosableTabs from './ClosableTabs';
import EventHandling from './EventHandling';
import HeaderEnd from './HeaderEnd';
import Positions from './Positions';
import ScrollableTabs from './ScrollableTabs';
import StyleVariants from './StyleVariants';
import WithIcons from './WithIcons';



import _TabView_props_json from './../../../components/tab-view/TabView.props.json';
const { tabViewProps, tabPageProps } = _TabView_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Simple tab navigation' },
    { id: 'style-variants', title: 'Style Variants', description: 'Visual style options' },
    { id: 'scrollable-tabs', title: 'Scrollable', description: 'Scroll arrows for overflow' },
    { id: 'positions', title: 'Positions', description: 'Header placement options' },
    { id: 'with-icons', title: 'With Icons', description: 'Left and right icons' },
    { id: 'closable-tabs', title: 'Closable Tabs', description: 'Dynamic tab management' },
    { id: 'header-end', title: 'Header End', description: 'Custom trailing content' },
    { id: 'event-handling', title: 'Event Handling', description: 'Change and close callbacks' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'tabview-props', title: 'TabView Props', description: 'TabView API reference' },
    { id: 'tabpage-props', title: 'TabPage Props', description: 'TabPage API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Style Variants',
        description: 'Eight visual styles: default, pills, enclosed, segment (iOS), editor (VS Code), thick-border, elevated, and glow.',
        icon: 'M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42',
    },
    {
        title: 'Flexible Positioning',
        description: 'Tab headers on top, bottom, left, or right to suit any layout.',
        icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12',
    },
    {
        title: 'Scrollable Tabs',
        description: 'Automatic scroll arrows when tabs overflow the available space.',
        icon: 'M8.25 4.5l7.5 7.5-7.5 7.5',
    },
    {
        title: 'Icon Support',
        description: 'Left and right icons on any tab header via strings, components, or elements.',
        icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z',
    },
    {
        title: 'Closable Tabs',
        description: 'Dynamic tab management with close buttons and onTabClose callback.',
        icon: 'M6 18L18 6M6 6l12 12',
    },
    {
        title: 'Before-Change Guard',
        description: 'Validate or cancel tab switches before they happen.',
        icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z',
    },
    {
        title: 'Keyboard Navigation',
        description: 'Arrow keys, Home/End for accessible tab switching.',
        icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
    },
    {
        title: 'Header End Slot',
        description: 'Place custom components at the trailing end of the tab header row.',
        icon: 'M12 4.5v15m7.5-7.5h-15',
    },
];

const TabViewPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    TabView
                </h1>
                <p className={cn('text-xl leading-relaxed', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A flexible tab component with multiple style variants, positions, scrolling, icons, closable tabs, and extensive
                    customization options.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="style-variants" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Style Variants</h2>
                <StyleVariants />
            </section>

            <section id="scrollable-tabs" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Scrollable Tabs
                </h2>
                <ScrollableTabs />
            </section>

            <section id="positions" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Positions</h2>
                <Positions />
            </section>

            <section id="with-icons" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>With Icons</h2>
                <WithIcons />
            </section>

            <section id="closable-tabs" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Closable Tabs</h2>
                <ClosableTabs />
            </section>

            <section id="header-end" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Header End</h2>
                <HeaderEnd />
            </section>

            <section id="event-handling" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Event Handling</h2>
                <EventHandling />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock
                    code={`import { TabView, TabPage } from 'fluxo-ui';\nimport type { TabChangeEvent, TabCloseEvent, TabViewVariant } from 'fluxo-ui';`}
                />
            </section>

            <section id="tabview-props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>TabView Props</h2>
                <PropsTable props={tabViewProps} />
            </section>

            <section id="tabpage-props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>TabPage Props</h2>
                <PropsTable props={tabPageProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default TabViewPage;
