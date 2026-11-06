import cn from 'classnames';
import React from 'react';
import { FeatureGrid } from '../../FeatureCard';
import type { FeatureItem } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import ClickToOpen from './ClickToOpen';
import HoverDetails from './HoverDetails';
import WithFooter from './WithFooter';

import _OverlayPanel_props_json from './../../../components/overlay-panel/OverlayPanel.props.json';
const { overlayPanelProps } = _OverlayPanel_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'click', title: 'Click to open', description: 'Anchored details panel' },
    { id: 'hover', title: 'Hover details', description: 'Opens on hover or focus' },
    { id: 'footer', title: 'Footer actions', description: 'Actions and placement' },
    { id: 'props', title: 'API Reference', description: 'Component props' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Anchored Positioning',
        description: '8 placement options with automatic flipping when space is limited, kept in place while scrolling',
        icon: 'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z',
    },
    {
        title: 'Any Content',
        description: 'Render rich content with an optional title and footer. The body scrolls when it is tall',
        icon: 'M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25',
    },
    {
        title: 'Hover or Click',
        description: 'Use it for click-triggered panels and hover cards. Pointer events reach the panel content',
        icon: 'M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Z',
    },
    { title: 'Dismissal', description: 'Closes on Escape, the close button or a click outside the panel and target', icon: 'M6 18 18 6M6 6l12 12' },
    {
        title: 'Mobile Sheet',
        description: 'Shows as a bottom sheet with a backdrop on small screens',
        icon: 'M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3',
    },
    {
        title: 'Accessibility',
        description: 'Dialog role with an accessible name, focus moves in and is restored on close, reduced motion respected',
        icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Z',
    },
];

const OverlayPanelPage: React.FC = () => {
    const { isDark } = useStoryTheme();
    const headingClass = cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark });

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Overlay Panel</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A floating panel anchored to an element, for details, hover cards and small forms. Control it with{' '}
                    <code className="text-blue-400">isOpen</code>, <code className="text-blue-400">target</code> and{' '}
                    <code className="text-blue-400">onClose</code>.
                </p>
            </div>

            <section id="click" className="scroll-mt-8">
                <h2 className={headingClass}>Click to open</h2>
                <ClickToOpen />
            </section>

            <section id="hover" className="scroll-mt-8">
                <h2 className={headingClass}>Hover details</h2>
                <HoverDetails />
            </section>

            <section id="footer" className="scroll-mt-8">
                <h2 className={headingClass}>Footer actions</h2>
                <WithFooter />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={headingClass}>API Reference</h2>
                <PropsTable props={overlayPanelProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default OverlayPanelPage;
