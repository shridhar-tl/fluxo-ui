import cn from 'classnames';
import React from 'react';
import { FeatureGrid } from '../../FeatureCard';
import type { FeatureItem } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicUsageDemo from './BasicUsageDemo';
import PlaceholderDemo from './PlaceholderDemo';
import KeepMountedDemo from './KeepMountedDemo';
import RootMarginDemo from './RootMarginDemo';
import LazyImageDemo from './LazyImageDemo';


import _DeferredView_props_json from './../../../components/DeferredView.props.json';
const { deferredViewProps } = _DeferredView_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Defer rendering until visible' },
    { id: 'placeholder', title: 'Placeholder', description: 'Custom loading placeholders' },
    { id: 'keep-mounted', title: 'Keep Mounted', description: 'Persist vs unmount on leave' },
    { id: 'root-margin', title: 'Root Margin', description: 'Preload before viewport entry' },
    { id: 'lazy-images', title: 'Lazy Images', description: 'Deferred image gallery' },
    { id: 'props', title: 'API Reference', description: 'Component props' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Viewport Aware',
        description: 'Uses IntersectionObserver to detect when children enter the viewport — works inside scrollable containers, tab panels, and page scroll',
        icon: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    },
    {
        title: 'Zero Dependencies',
        description: 'Built entirely on the native IntersectionObserver API — no external libraries needed',
        icon: 'M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25',
    },
    {
        title: 'Preloading',
        description: 'Configure rootMargin to begin loading content before it enters the viewport for a seamless experience',
        icon: 'M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z',
    },
    {
        title: 'Keep Mounted',
        description: 'Choose whether components stay mounted after first render or unmount when scrolled away to reclaim memory',
        icon: 'M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z',
    },
    {
        title: 'Custom Placeholders',
        description: 'Show shimmer skeletons, spinners, or any React node as a placeholder while content is deferred',
        icon: 'M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.764m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42',
    },
    {
        title: 'Performance',
        description: 'Defer API calls, image loading, and heavy renders to reduce initial page load time and memory usage',
        icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z',
    },
];

const DeferredViewPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>DeferredView</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    Defer mounting of child components until they become visible in the viewport. Use it to lazy-load heavy
                    components, defer API calls, delay image buffering, or skip rendering content hidden in inactive tabs.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsageDemo />
            </section>

            <section id="placeholder" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom Placeholder</h2>
                <PlaceholderDemo />
            </section>

            <section id="keep-mounted" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Keep Mounted</h2>
                <KeepMountedDemo />
            </section>

            <section id="root-margin" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Root Margin</h2>
                <RootMarginDemo />
            </section>

            <section id="lazy-images" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Lazy Image Gallery</h2>
                <LazyImageDemo />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>API Reference</h2>
                <PropsTable props={deferredViewProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default DeferredViewPage;
