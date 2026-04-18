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
import CustomTimeout from './CustomTimeout';
import OnAnyElement from './OnAnyElement';
import Placements from './Placements';
import RichContent from './RichContent';
import SetupSection from './SetupSection';



import _Tooltip_props_json from './../../../components/tooltip/Tooltip.props.json';
const { tooltipProps, showTooltipProps } = _Tooltip_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'setup', title: 'Setup', description: 'Mount TooltipManager' },
    { id: 'basic-usage', title: 'Basic Usage', description: 'Simple string tooltip' },
    { id: 'placements', title: 'Placements', description: 'Positioning options' },
    { id: 'rich-content', title: 'Rich Content', description: 'JSX tooltip content' },
    { id: 'custom-timeout', title: 'Custom Timeout', description: 'Hide delay control' },
    { id: 'on-any-element', title: 'On Any Element', description: 'Tooltip on icons and spans' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'api-reference', title: 'API Reference', description: 'Options and functions' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Global Manager Pattern',
        description:
            'Mount TooltipManager once at the app root and call showTooltip/hideTooltip from any event handler without prop drilling.',
        icon: 'M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3.284 14.253A8.959 8.959 0 0 1 3 12c0-1.306.278-2.546.777-3.668',
    },
    {
        title: 'Smart Auto Placement',
        description:
            "The 'auto' placement mode analyzes available viewport space and picks the best corner so tooltips never clip off-screen.",
        icon: 'M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z',
    },
    {
        title: 'Rich Content Support',
        description: 'Pass any React node as tooltip content — formatted text, icons, lists, or custom JSX — not just plain strings.',
        icon: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5',
    },
    {
        title: 'Configurable Hide Delay',
        description:
            'Set a per-tooltip timeout for how long after mouse-leave the tooltip stays visible — from instant (0 ms) to several seconds.',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
    {
        title: 'Hover-Safe Tooltip',
        description:
            'Moving the mouse from the trigger onto the tooltip itself cancels the hide timer, allowing users to interact with rich content.',
        icon: 'M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59',
    },
    {
        title: 'Works on Any Element',
        description:
            'Attach onMouseEnter/onMouseLeave to buttons, icons, text spans, table cells, or any DOM element — no wrapper component needed.',
        icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12',
    },
    {
        title: 'Portal Rendering',
        description: 'Tooltips render in a portal above all other content, ensuring they never get clipped by overflow:hidden containers.',
        icon: 'M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25',
    },
    {
        title: 'Theming',
        description: 'Full dark/light mode and all 5 brand themes supported automatically via CSS custom properties.',
        icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z',
    },
];

const TooltipPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Tooltip
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A lightweight floating label that appears on hover to provide contextual information about an element. Mount{' '}
                    <code className="text-blue-400">&lt;TooltipManager /&gt;</code> once at your app root, then call{' '}
                    <code className="text-blue-400">showTooltip</code> and <code className="text-blue-400">hideTooltip</code> from any event
                    handler.
                </p>
            </div>

            <section className="scroll-mt-8" id="setup">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Setup</h2>
                <SetupSection />
            </section>

            <section className="scroll-mt-8" id="basic-usage">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section className="scroll-mt-8" id="placements">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Placements</h2>
                <Placements />
            </section>

            <section className="scroll-mt-8" id="rich-content">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Rich Content (JSX)
                </h2>
                <RichContent />
            </section>

            <section className="scroll-mt-8" id="custom-timeout">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom Timeout</h2>
                <CustomTimeout />
            </section>

            <section className="scroll-mt-8" id="on-any-element">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>On Any Element</h2>
                <OnAnyElement />
            </section>

            <section className="scroll-mt-8" id="import">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { TooltipManager, showTooltip, hideTooltip } from 'fluxo-ui';`} />
            </section>

            <section className="scroll-mt-8" id="api-reference">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>API Reference</h2>
                <h3 className={cn('text-lg font-semibold mb-3', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>TooltipOptions</h3>
                <PropsTable props={tooltipProps} />
                <h3 className={cn('text-lg font-semibold mt-6 mb-3', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Functions</h3>
                <PropsTable props={showTooltipProps} />
            </section>

            <section className="scroll-mt-8" id="features">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default TooltipPage;
