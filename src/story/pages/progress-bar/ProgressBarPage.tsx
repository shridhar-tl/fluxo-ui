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
import BufferProgress from './BufferProgress';
import DynamicProgress from './DynamicProgress';
import Indeterminate from './Indeterminate';
import LabelsAndValues from './LabelsAndValues';
import Layouts from './Layouts';
import MultiSegment from './MultiSegment';
import Sizes from './Sizes';
import Variants from './Variants';


import _ProgressBar_props_json from './../../../components/ProgressBar.props.json';
const { progressBarProps } = _ProgressBar_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'basic', title: 'Basic', description: 'Simple progress bars' },
    { id: 'variants', title: 'Variants', description: 'Color variants' },
    { id: 'sizes', title: 'Sizes', description: 'Different sizes' },
    { id: 'layouts', title: 'Layouts', description: 'Visual styles' },
    { id: 'labels', title: 'Labels & Values', description: 'With labels and values' },
    { id: 'indeterminate', title: 'Indeterminate', description: 'Unknown progress' },
    { id: 'buffer', title: 'Buffer', description: 'Buffered progress' },
    { id: 'multi', title: 'Multi Segment', description: 'Stacked segments' },
    { id: 'dynamic', title: 'Dynamic', description: 'Animated progress' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Multiple Variants',
        description: 'Six color variants including primary, success, warning, danger, info, and default',
        icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z',
    },
    {
        title: 'Flexible Sizing',
        description: 'Five size options from xs to xl to fit any UI context',
        icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15',
    },
    {
        title: 'Indeterminate Mode',
        description: 'Animated indeterminate state for unknown progress duration',
        icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99',
    },
    {
        title: 'Buffer Support',
        description: 'Buffered progress display for streaming or multi-phase operations',
        icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
    },
    {
        title: 'Multi Segment',
        description: 'Stacked segments for showing multiple values in a single bar',
        icon: 'M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z',
    },
    {
        title: 'Custom Templates',
        description: 'Value template with placeholders or render functions for full control',
        icon: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5',
    },
];

const ProgressBarPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    ProgressBar
                </h1>
                <p className={cn('text-xl leading-relaxed', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A versatile progress indicator with multiple variants, sizes, layouts, and support for indeterminate, buffered, and
                    multi-segment modes.
                </p>
            </div>

            <section id="basic" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic</h2>
                <BasicUsage />
            </section>

            <section id="variants" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Variants</h2>
                <Variants />
            </section>

            <section id="sizes" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Sizes</h2>
                <Sizes />
            </section>

            <section id="layouts" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Layouts</h2>
                <Layouts />
            </section>

            <section id="labels" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Labels & Values
                </h2>
                <LabelsAndValues />
            </section>

            <section id="indeterminate" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Indeterminate</h2>
                <Indeterminate />
            </section>

            <section id="buffer" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Buffer</h2>
                <BufferProgress />
            </section>

            <section id="multi" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Multi Segment</h2>
                <MultiSegment />
            </section>

            <section id="dynamic" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Dynamic Progress
                </h2>
                <DynamicProgress />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { ProgressBar } from 'fluxo-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={progressBarProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default ProgressBarPage;
