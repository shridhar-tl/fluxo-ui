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
import ColorVariants from './ColorVariants';
import InteractiveSteps from './InteractiveSteps';
import LabelPlacement from './LabelPlacement';
import LayoutShapes from './LayoutShapes';
import SizeOptions from './SizeOptions';
import StepStatus from './StepStatus';
import TextOnly from './TextOnly';
import VerticalOrientation from './VerticalOrientation';
import WithIcons from './WithIcons';

const stepperProps = {
    steps: { type: 'StepItem[]', description: 'Array of step definitions with label, description, icon, and status', default: '-' },
    activeStep: { type: 'number', default: '0', description: 'Index of the currently active step' },
    variant: {
        type: "'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'",
        default: "'primary'",
        description: 'Color variant',
    },
    size: { type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size of indicators and text' },
    layout: {
        type: "'default' | 'rounded' | 'square' | 'rectangle' | 'dot' | 'minimal'",
        default: "'default'",
        description: 'Shape of step indicators',
    },
    orientation: { type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction' },
    labelPlacement: {
        type: "'bottom' | 'right' | 'alternate'",
        default: "'bottom'",
        description: 'Position of labels relative to indicators',
    },
    showStepNumbers: { type: 'boolean', default: 'true', description: 'Show step numbers inside indicators' },
    showConnectors: { type: 'boolean', default: 'true', description: 'Show connector lines between steps' },
    clickable: { type: 'boolean', default: 'false', description: 'Allow clicking on steps to navigate' },
    linear: { type: 'boolean', default: 'false', description: 'Only allow clicking the next step' },
    completedIcon: { type: 'ReactElement | IconComponent', description: 'Custom icon for completed steps' },
    errorIcon: { type: 'ReactElement | IconComponent', description: 'Custom icon for error steps' },
    onChange: { type: '(step: number) => void', description: 'Callback when a step is clicked' },
    connector: { type: 'ReactNode', description: 'Custom connector element' },
    className: { type: 'string', description: 'Additional CSS class' },
    disabled: { type: 'boolean', default: 'false', description: 'Disable all interaction' },
    id: { type: 'string', description: 'HTML id attribute' },
    ariaLabel: { type: 'string', description: 'Accessible label' },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic', title: 'Basic', description: 'Simple stepper' },
    { id: 'layouts', title: 'Layouts', description: 'Indicator shapes' },
    { id: 'with-icons', title: 'With Icons', description: 'Custom step icons' },
    { id: 'text-only', title: 'Text Only', description: 'Minimal layout' },
    { id: 'sizes', title: 'Sizes', description: 'Size variations' },
    { id: 'vertical', title: 'Vertical', description: 'Vertical orientation' },
    { id: 'label-placement', title: 'Label Placement', description: 'Label positions' },
    { id: 'interactive', title: 'Interactive', description: 'Clickable steps' },
    { id: 'status', title: 'Step Status', description: 'Error and warning states' },
    { id: 'variants', title: 'Variants', description: 'Color variants' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Multiple Layouts',
        description: 'Six indicator shapes: default rounded-rect, circle, square, rectangle pill, dot, and minimal text-only',
        icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z',
    },
    {
        title: 'Custom Icons',
        description: 'Pass custom icons per step for active, completed, and default states',
        icon: 'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z',
    },
    {
        title: 'Vertical & Horizontal',
        description: 'Both orientations with automatic connector adjustment',
        icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15',
    },
    {
        title: 'Interactive Navigation',
        description: 'Clickable steps with optional linear restriction for wizard flows',
        icon: 'M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59',
    },
    {
        title: 'Step Status',
        description: 'Individual step status with error, warning, completed, active, and pending states',
        icon: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
    {
        title: 'Label Placement',
        description: 'Labels can be placed below, to the right, or alternating above/below',
        icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
    },
];

const StepperPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Stepper
                </h1>
                <p className={cn('text-xl leading-relaxed', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A step indicator component with multiple layouts, icon support, vertical/horizontal orientations, and interactive
                    navigation for wizard flows.
                </p>
            </div>

            <section id="basic" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic</h2>
                <BasicUsage />
            </section>

            <section id="layouts" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Layouts</h2>
                <LayoutShapes />
            </section>

            <section id="with-icons" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>With Icons</h2>
                <WithIcons />
            </section>

            <section id="text-only" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Text Only</h2>
                <TextOnly />
            </section>

            <section id="sizes" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Sizes</h2>
                <SizeOptions />
            </section>

            <section id="vertical" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Vertical</h2>
                <VerticalOrientation />
            </section>

            <section id="label-placement" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Label Placement
                </h2>
                <LabelPlacement />
            </section>

            <section id="interactive" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Interactive</h2>
                <InteractiveSteps />
            </section>

            <section id="status" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Step Status</h2>
                <StepStatus />
            </section>

            <section id="variants" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Variants</h2>
                <ColorVariants />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { Stepper } from 'fluxo-ui';\nimport type { StepItem } from 'fluxo-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={stepperProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default StepperPage;
