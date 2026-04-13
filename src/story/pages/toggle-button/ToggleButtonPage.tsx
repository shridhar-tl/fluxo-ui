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
import CustomLabels from './CustomLabels';
import CustomStyling from './CustomStyling';
import EventHandling from './EventHandling';
import FormIntegration from './FormIntegration';
import MultipleToggles from './MultipleToggles';
import Sizes from './Sizes';
import States from './States';
import Variants from './Variants';

const toggleButtonProps = {
    checked: {
        type: 'boolean',
        default: 'false',
        description: 'The checked state of the toggle button',
    },
    onChange: {
        type: '(event: ComponentEvent<boolean>) => void',
        description: 'Callback fired when the toggle state changes. Receives ComponentEvent with value, name, args, and event.',
    },
    onLabel: {
        type: 'string',
        default: "'On'",
        description: 'Label to display when button is checked/on',
    },
    offLabel: {
        type: 'string',
        default: "'Off'",
        description: 'Label to display when button is unchecked/off',
    },
    disabled: {
        type: 'boolean',
        default: 'false',
        description: 'Disable the toggle button interaction',
    },
    className: {
        type: 'string',
        description: 'Additional CSS classes',
    },
    name: {
        type: 'string',
        description: 'Name attribute for form submission',
    },
    id: {
        type: 'string',
        description: 'HTML id attribute (auto-generated if not provided)',
    },
    args: {
        type: 'any',
        description: 'Additional arguments passed to onChange event',
    },
    variant: {
        type: "'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary' | 'secondary'",
        description: 'Color variant for the button (from BaseComponentProps)',
    },
    size: {
        type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
        description: 'Size of the button (from BaseComponentProps)',
    },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Default toggle button' },
    { id: 'custom-labels', title: 'Custom Labels', description: 'On/off label text' },
    { id: 'variants', title: 'Variants', description: 'Color variants' },
    { id: 'sizes', title: 'Sizes', description: 'Size options' },
    { id: 'states', title: 'States', description: 'On, off, disabled states' },
    { id: 'multiple-toggles', title: 'Multiple Toggles', description: 'Managing multiple toggles' },
    { id: 'custom-styling', title: 'Custom Styling', description: 'Customized toggle buttons' },
    { id: 'event-handling', title: 'Event Handling', description: 'Event logging' },
    { id: 'form-integration', title: 'Form Integration', description: 'Toggle in forms' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Two-State Toggle',
        description: 'Simple on/off functionality with clear visual feedback',
        icon: 'M3 8.689c0-.864.933-1.406 1.683-.953l7.108 4.061a1.1 1.1 0 0 1 0 1.906l-7.108 4.061A1.1 1.1 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.953l7.108 4.061a1.1 1.1 0 0 1 0 1.906l-7.108 4.061a1.1 1.1 0 0 1-1.683-.953V8.69Z',
    },
    {
        title: 'Custom Labels',
        description: 'Configurable labels for both on and off states via onLabel and offLabel props',
        icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12',
    },
    {
        title: 'Multiple Variants',
        description: 'Supports all standard variants: primary, success, warning, danger, info, secondary',
        icon: 'M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42',
    },
    {
        title: 'Size Options',
        description: 'Five size options from xs to xl for every UI density requirement',
        icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15',
    },
    {
        title: 'Disabled State',
        description: 'Built-in disabled state with visual feedback preventing interaction',
        icon: 'M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636',
    },
    {
        title: 'Form Integration',
        description: 'Works seamlessly with HTML forms via hidden input and name prop',
        icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z',
    },
    {
        title: 'Rich Events',
        description: 'ComponentEvent provides value, name, args, and the original DOM event',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
    {
        title: 'Accessibility',
        description: 'Proper ARIA attributes with aria-pressed and aria-label for screen readers',
        icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
    },
    {
        title: 'Theming',
        description: 'Full dark/light and 5 brand themes via CSS variables — zero extra config',
        icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z',
    },
];

const ToggleButtonPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    ToggleButton
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A button component that toggles between two states (on/off), useful for enabling/disabling features or switching between
                    binary options.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="custom-labels" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom Labels</h2>
                <CustomLabels />
            </section>

            <section id="variants" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Variants</h2>
                <Variants />
            </section>

            <section id="sizes" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Sizes</h2>
                <Sizes />
            </section>

            <section id="states" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>States</h2>
                <States />
            </section>

            <section id="multiple-toggles" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Multiple Toggle Buttons
                </h2>
                <MultipleToggles />
            </section>

            <section id="custom-styling" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    With Custom Styling
                </h2>
                <CustomStyling />
            </section>

            <section id="event-handling" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Event Handling</h2>
                <EventHandling />
            </section>

            <section id="form-integration" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Form Integration
                </h2>
                <FormIntegration />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { ToggleButton } from 'fluxo-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={toggleButtonProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default ToggleButtonPage;
