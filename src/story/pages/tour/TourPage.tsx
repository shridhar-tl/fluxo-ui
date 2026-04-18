import cn from 'classnames';
import React from 'react';
import { FeatureGrid } from '../../FeatureCard';
import type { FeatureItem } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicTour from './BasicTour';
import RichContent from './RichContent';
import StepCallbacks from './StepCallbacks';
import PlacementOptions from './PlacementOptions';
import StartAtStep from './StartAtStep';
import DarkModeSection from './DarkModeSection';



import _Tour_props_json from './../../../components/tour/Tour.props.json';
const { tourProps, stepProps } = _Tour_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-tour', title: 'Basic Tour', description: 'Five-step dashboard tour' },
    { id: 'rich-content', title: 'Rich JSX Content', description: 'JSX inside step content' },
    { id: 'step-callbacks', title: 'Step Callbacks', description: 'onNext, onPrev, onSkip' },
    { id: 'placement', title: 'Placement Options', description: 'Top, bottom, left, right' },
    { id: 'start-at', title: 'Start at Step', description: 'Resume from any step' },
    { id: 'dark-mode', title: 'Dark Mode', description: 'Auto dark/light theme' },
    { id: 'api', title: 'API Reference', description: 'Props documentation' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'DOM Element Targeting', description: 'Each step targets any DOM element via a CSS selector, overlaying a highlight with a tooltip.', icon: 'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z' },
    { title: 'Rich JSX Content', description: 'Step content accepts any React node — lists, callouts, badges, icons, and custom markup.', icon: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5' },
    { title: 'Four Placements', description: 'Tooltip placement can be top, bottom, left, or right with automatic fallback when space is limited.', icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15' },
    { title: 'Step Callbacks', description: 'onNext, onPrev, and onSkip callbacks on each step enable analytics, state sync, and side effects.', icon: 'M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0' },
    { title: 'Resume from Any Step', description: 'The initialStep prop lets you deep-link into a specific step or restore saved tour progress.', icon: 'M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z' },
    { title: 'Overlay & Highlight', description: 'A semi-transparent overlay dims the rest of the page while the target element is highlighted with a border.', icon: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' },
    { title: 'Dark Mode', description: 'Overlay, highlight, and tooltip all adapt automatically to dark/light mode via CSS class inheritance.', icon: 'M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z' },
    { title: 'Accessibility', description: 'Keyboard navigation and focus management ensure the tour is fully accessible for all users.', icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z' },
];

const TourPage: React.FC = () => {
    const { isDark } = useStoryTheme();
    const mutedText = isDark ? 'text-gray-400' : 'text-gray-500';
    const tagBg = isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Step Tour</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    Guided, step-by-step product tours that highlight DOM elements with tooltips. Ideal for onboarding new users or
                    showcasing features after a release.
                </p>
            </div>

            <section className="scroll-mt-8" id="basic-tour">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Tour</h2>
                <p className={`text-sm mb-4 ${mutedText}`}>
                    A realistic dashboard mock-up with five tour steps covering the header, stats panel, action bar, sidebar
                    navigation, and profile menu.
                </p>
                <BasicTour />
            </section>

            <section className="scroll-mt-8" id="rich-content">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Rich JSX Content</h2>
                <p className={`text-sm mb-4 ${mutedText}`}>
                    Step content supports full JSX, allowing lists, callout boxes, badges, and any custom markup.
                </p>
                <RichContent />
            </section>

            <section className="scroll-mt-8" id="step-callbacks">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Step Callbacks</h2>
                <p className={`text-sm mb-4 ${mutedText}`}>
                    Every step exposes <code className={`font-mono text-xs px-1 py-0.5 rounded ${tagBg}`}>onNext</code>,{' '}
                    <code className={`font-mono text-xs px-1 py-0.5 rounded ${tagBg}`}>onPrev</code>, and{' '}
                    <code className={`font-mono text-xs px-1 py-0.5 rounded ${tagBg}`}>onSkip</code> callbacks. Use them to sync
                    external state, fire analytics events, or trigger side effects at each transition.
                </p>
                <StepCallbacks />
            </section>

            <section className="scroll-mt-8" id="placement">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Placement Options</h2>
                <p className={`text-sm mb-4 ${mutedText}`}>
                    Each step declares a preferred placement. The tooltip automatically falls back to an alternative side when
                    viewport space is insufficient.
                </p>
                <PlacementOptions />
            </section>

            <section className="scroll-mt-8" id="start-at">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Start at a Specific Step</h2>
                <p className={`text-sm mb-4 ${mutedText}`}>
                    Pass <code className={`font-mono text-xs px-1 py-0.5 rounded ${tagBg}`}>initialStep</code> to resume a tour
                    mid-way — useful for restoring progress from local storage or deep-linking into a feature.
                </p>
                <StartAtStep />
            </section>

            <section className="scroll-mt-8" id="dark-mode">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Dark Mode Support</h2>
                <p className={`text-sm mb-4 ${mutedText}`}>
                    The tour overlay, highlight, and tooltip all respond to the{' '}
                    <code className={`font-mono text-xs px-1 py-0.5 rounded ${tagBg}`}>mode-dark</code> class on{' '}
                    <code className={`font-mono text-xs px-1 py-0.5 rounded ${tagBg}`}>document.body</code>. No extra props
                    needed — the theme is inherited automatically via Tailwind's dark-variant utilities.
                </p>
                <DarkModeSection />
            </section>

            <section className="scroll-mt-8" id="api">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>API Reference</h2>
                <h3 className={cn('text-lg font-semibold mb-3', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>StepTour props</h3>
                <PropsTable props={tourProps} />
                <h3 className={cn('text-lg font-semibold mt-6 mb-3', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>TourStep</h3>
                <PropsTable props={stepProps} />
            </section>

            <section className="scroll-mt-8" id="features">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default TourPage;
