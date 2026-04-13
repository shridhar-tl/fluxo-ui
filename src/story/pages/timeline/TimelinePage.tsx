import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import AlternateAlignment from './AlternateAlignment';
import BasicUsage from './BasicUsage';
import CustomMarkers from './CustomMarkers';
import HorizontalLayout from './HorizontalLayout';

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Vertical left-aligned timeline' },
    { id: 'horizontal', title: 'Horizontal Layout', description: 'Horizontal milestone timeline' },
    { id: 'alternate', title: 'Alternate Alignment', description: 'Events on alternating sides' },
    { id: 'custom-markers', title: 'Custom Markers', description: 'Icons in timeline markers' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'event-props', title: 'TimelineEvent', description: 'Event data interface' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const timelineProps = {
    events: { type: 'TimelineEvent[]', required: true, description: 'Array of timeline event data.' },
    layout: { type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Timeline orientation.' },
    align: { type: "'left' | 'right' | 'alternate'", default: "'left'", description: 'Content alignment relative to the timeline axis.' },
    connectorStyle: {
        type: "'solid' | 'dashed' | 'dotted'",
        default: "'solid'",
        description: 'Style of the connector lines between events.',
    },
    markerSize: { type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of timeline markers.' },
    className: { type: 'string', description: 'Additional CSS class for the container.' },
};

const eventProps = {
    id: { type: 'string', required: true, description: 'Unique identifier for the event.' },
    title: { type: 'string', required: true, description: 'Event title text.' },
    description: { type: 'ReactNode', description: 'Event description or body content.' },
    timestamp: { type: 'string', description: 'Timestamp or date label.' },
    icon: { type: 'ReactNode', description: 'Custom icon displayed in the marker.' },
    color: { type: "'primary' | 'success' | 'warning' | 'danger' | 'info'", description: 'Color theme for the marker.' },
    marker: { type: 'ReactNode', description: 'Fully custom marker element (overrides icon and dot).' },
    content: { type: 'ReactNode', description: 'Additional custom content below description.' },
};

const features: FeatureItem[] = [
    {
        title: 'Vertical & Horizontal',
        description: 'Two layout modes for different use cases: vertical scrolling or horizontal milestone display.',
        icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25z',
    },
    {
        title: 'Alternate Alignment',
        description: 'Events can alternate between left and right for a visually balanced layout.',
        icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
    },
    {
        title: 'Custom Markers',
        description: 'Use icons, custom elements, or the default dot as timeline markers.',
        icon: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128z',
    },
    {
        title: 'Color Variants',
        description: 'Five color options: primary, success, warning, danger, and info.',
        icon: 'M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197',
    },
    {
        title: 'Connector Styles',
        description: 'Solid, dashed, or dotted connector lines between timeline markers.',
        icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12',
    },
    {
        title: 'Accessibility',
        description: 'Semantic list markup with ARIA roles for screen reader support.',
        icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    },
];

const TimelinePage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Timeline
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A timeline component for displaying chronological events with vertical/horizontal layouts, custom markers, and multiple
                    alignment options.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="horizontal" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Horizontal Layout
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use <code>layout="horizontal"</code> for a left-to-right timeline ideal for project milestones.
                </p>
                <HorizontalLayout />
            </section>

            <section id="alternate" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Alternate Alignment
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use <code>align="alternate"</code> to place events on alternating sides of the timeline axis.
                </p>
                <AlternateAlignment />
            </section>

            <section id="custom-markers" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom Markers</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Pass an <code>icon</code> or <code>marker</code> on each event to customize the timeline markers.
                </p>
                <CustomMarkers />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { Timeline } from 'fluxo-ui';\nimport type { TimelineEvent, TimelineProps } from 'fluxo-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Timeline Props</h2>
                <PropsTable props={timelineProps} />
            </section>

            <section id="event-props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    TimelineEvent Interface
                </h2>
                <PropsTable props={eventProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default TimelinePage;
