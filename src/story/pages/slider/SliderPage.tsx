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
import Formatting from './Formatting';
import GridSnap from './GridSnap';
import RangeSlider from './RangeSlider';
import Sizes from './Sizes';
import StringValues from './StringValues';
import Variants from './Variants';
import VerticalSlider from './VerticalSlider';
import WithMarks from './WithMarks';

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Simple slider with defaults' },
    { id: 'range-slider', title: 'Range Slider', description: 'Dual-thumb range selection' },
    { id: 'sizes', title: 'Sizes', description: 'All size variants' },
    { id: 'variants', title: 'Variants', description: 'Color variants' },
    { id: 'vertical', title: 'Vertical', description: 'Vertical orientation' },
    { id: 'marks', title: 'With Marks', description: 'Marks and labels on track' },
    { id: 'string-values', title: 'String Values', description: 'String labels like months' },
    { id: 'formatting', title: 'Formatting', description: 'Custom value formatting' },
    { id: 'grid-snap', title: 'Grid & Snap', description: 'Snap and grid behavior' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const sliderProps = {
    value: { type: 'number', description: 'Controlled value of the slider.' },
    defaultValue: { type: 'number', default: '0', description: 'Initial value for uncontrolled usage.' },
    min: { type: 'number', default: '0', description: 'Minimum value.' },
    max: { type: 'number', default: '100', description: 'Maximum value.' },
    step: { type: 'number', default: '1', description: 'Step increment between values.' },
    orientation: { type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Slider axis direction.' },
    size: { type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size of the track and thumb.' },
    variant: {
        type: "'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'",
        default: "'primary'",
        description: 'Color variant.',
    },
    disabled: { type: 'boolean', default: 'false', description: 'Disable interaction.' },
    range: { type: 'boolean', default: 'false', description: 'Enable dual-thumb range mode.' },
    rangeValue: { type: '[number, number]', description: 'Controlled range value (low, high).' },
    defaultRangeValue: { type: '[number, number]', description: 'Initial range value for uncontrolled usage.' },
    marks: {
        type: 'SliderMark[] | boolean',
        description: 'Display marks on the track. Pass true for auto-generated marks or an array for custom marks.',
    },
    showTooltip: { type: "boolean | 'always'", default: 'false', description: 'Show tooltip on hover/drag or always.' },
    tooltipFormat: { type: '(value: number) => string', description: 'Custom formatter for tooltip text.' },
    valueFormat: { type: '(value: number) => string', description: 'Custom formatter for displayed value.' },
    showValue: { type: 'boolean', default: 'false', description: 'Display the current value alongside the slider.' },
    valuePosition: { type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", description: 'Position of the displayed value.' },
    snap: { type: 'boolean', default: 'false', description: 'Snap the thumb to the nearest step.' },
    gridStep: { type: 'number', description: 'Coarser step for grid-based snapping.' },
    gridDuration: { type: 'number', default: '150', description: 'Animation duration (ms) for grid snap transitions.' },
    labels: { type: 'string[]', description: 'Map slider positions to string labels. Min/max auto-set from array length.' },
    showMinMax: { type: 'boolean', default: 'false', description: 'Show min and max labels at the ends.' },
    trackHeight: { type: 'number', description: 'Override the track height/width in pixels.' },
    thumbSize: { type: 'number', description: 'Override the thumb size in pixels.' },
    filled: { type: 'boolean', default: 'true', description: 'Show a filled track from min to current value.' },
    onChange: { type: '(value: number | [number, number]) => void', description: 'Called on every value change during interaction.' },
    onChangeEnd: {
        type: '(value: number | [number, number]) => void',
        description: 'Called when interaction ends (pointer up or keyboard).',
    },
};

const features: FeatureItem[] = [
    {
        title: 'Range Mode',
        description: 'Dual-thumb slider for selecting value ranges with independent low/high controls.',
        icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
    },
    {
        title: 'Five Sizes',
        description: 'Extra small to extra large with proportional track, thumb, and font scaling.',
        icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15',
    },
    {
        title: 'Six Variants',
        description: 'Semantic color variants: default, primary, success, warning, danger, and info.',
        icon: 'M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072',
    },
    {
        title: 'Marks & Labels',
        description: 'Auto-generated or custom marks with labels along the track for precise selection.',
        icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z',
    },
    {
        title: 'Grid Snap',
        description: 'Snap to steps or a custom grid with configurable animation duration.',
        icon: 'M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125',
    },
    {
        title: 'Accessibility',
        description: 'Full keyboard support with arrow keys, Page Up/Down, Home/End, and ARIA attributes.',
        icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    },
];

const SliderPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Slider</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A versatile slider component with range mode, marks, string labels, snap behavior, and full keyboard accessibility.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="range-slider" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Range Slider</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Enable dual-thumb mode with the <code>range</code> prop for selecting a value range.
                </p>
                <RangeSlider />
            </section>

            <section id="sizes" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Sizes</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use the <code>size</code> prop to control the track height, thumb size, and label font size.
                </p>
                <Sizes />
            </section>

            <section id="variants" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Variants</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Six color variants for different semantic contexts.
                </p>
                <Variants />
            </section>

            <section id="vertical" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Vertical</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Set <code>orientation="vertical"</code> for a vertical slider layout.
                </p>
                <VerticalSlider />
            </section>

            <section id="marks" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>With Marks</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Add marks along the track with <code>marks=&#123;true&#125;</code> for auto-generated marks or pass a custom array.
                </p>
                <WithMarks />
            </section>

            <section id="string-values" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>String Values</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use the <code>labels</code> prop to map slider positions to string values such as months, sizes, or priorities.
                </p>
                <StringValues />
            </section>

            <section id="formatting" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Formatting</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Customize how values appear with <code>tooltipFormat</code> and <code>valueFormat</code> callbacks.
                </p>
                <Formatting />
            </section>

            <section id="grid-snap" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Grid & Snap</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use <code>snap</code> for step-based snapping or <code>gridStep</code> for coarser grid alignment with animated
                    transitions.
                </p>
                <GridSnap />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock
                    code={`import { Slider } from 'fluxo-ui';\nimport type { SliderProps, SliderMark, SliderSize, SliderVariant } from 'fluxo-ui';`}
                />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={sliderProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default SliderPage;
