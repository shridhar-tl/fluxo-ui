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
import InteractiveTimeline from './InteractiveTimeline';

import _ResourceTimeline_props_json from './../../../components/resource-timeline/ResourceTimeline.props.json';
const { timelineProps, eventProps } = _ResourceTimeline_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Introduction' },
    { id: 'basic-usage', title: 'Basic Usage', description: 'Read-only rows and lanes' },
    { id: 'interactive', title: 'Plan and Reassign', description: 'Move, resize, reassign and drop' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'ResourceTimeline API reference' },
    { id: 'event-props', title: 'Event Properties', description: 'ResourceTimelineEvent reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Rows and Lanes',
        description: 'One row per resource. Bars that overlap in time are stacked in lanes so none is hidden.',
        icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
    },
    {
        title: 'Move, Resize, Reassign',
        description: 'Drag bars along time, resize either end, or drop them on another row to change the resource.',
        icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
    },
    {
        title: 'External Drop',
        description: 'Accepts items dragged from outside, such as an unscheduled list, onto a row and day.',
        icon: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3',
    },
    {
        title: 'Day Cells',
        description: 'Optional row of day cells under each resource, for load, availability or totals.',
        icon: 'M3.75 3v11.25A2.25 2.25 0 006 16.5h12M3.75 3h-1.5m1.5 0h16.5',
    },
    {
        title: 'Keyboard Operable',
        description: 'Arrow keys move bars, Alt and Ctrl with arrows resize them, up and down arrows change the row.',
        icon: 'M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z',
    },
];

const ResourceTimelinePage: React.FC = () => {
    const { isDark } = useStoryTheme();
    const headingClass = cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark });
    const textClass = cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark });

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <div className="mb-2">
                    <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Resource Timeline</h1>
                    <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                        A day-based scheduler with one row per resource. Plan work by moving and resizing bars, reassign it by dropping it on another row, and show a load
                        row under each resource.
                    </p>
                </div>
            </div>

            <section className="scroll-mt-8" id="basic-usage">
                <h2 className={headingClass}>Basic Usage</h2>
                <p className={textClass}>Pass resources, events and the date range. Overlapping events are placed in separate lanes.</p>
                <BasicUsage />
            </section>

            <section className="scroll-mt-8" id="interactive">
                <h2 className={headingClass}>Plan and Reassign</h2>
                <p className={textClass}>
                    Handle <code>onEventChange</code> to move, resize and reassign bars, <code>onExternalDrop</code> to accept new work, and use{' '}
                    <code>dayCellTemplate</code> for a per-day row.
                </p>
                <InteractiveTimeline />
            </section>

            <section className="scroll-mt-8" id="import">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock
                    code={`import { ResourceTimeline } from 'fluxo-ui';
import type {
  ResourceTimelineProps,
  ResourceTimelineResource,
  ResourceTimelineEvent,
  ResourceTimelineMarker,
  ResourceTimelineEventChangeEvent,
  ResourceTimelineEventClickEvent,
  ResourceTimelineDropEvent,
} from 'fluxo-ui';`}
                />
            </section>

            <section className="scroll-mt-8" id="props">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>ResourceTimeline Props</h2>
                <PropsTable props={timelineProps} />
            </section>

            <section className="scroll-mt-8" id="event-props">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>ResourceTimelineEvent Properties</h2>
                <PropsTable props={eventProps} />
            </section>

            <section className="scroll-mt-8" id="features">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default ResourceTimelinePage;
