import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { FeatureGrid } from '../../FeatureCard';
import type { FeatureItem } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicUsage from './BasicUsage';
import MultipleSelection from './MultipleSelection';
import VerticalDirection from './VerticalDirection';
import WithIcons from './WithIcons';
import DisabledState from './DisabledState';
import DisabledItems from './DisabledItems';
import SizeVariants from './SizeVariants';
import ThemeVariants from './ThemeVariants';
import RealWorldExamples from './RealWorldExamples';
import UsageNotes from './UsageNotes';

const selectButtonProps = {
    items: {
        type: 'ListItem[]',
        required: true,
        description:
            'Array of items to display. Each item has { value: any, label: any, disabled?: boolean, icon?: IconComponent | ReactElement }',
    },
    value: {
        type: 'T | T[]',
        description: 'Selected value(s). Single value for single selection, array of values for multiple selection',
    },
    onChange: {
        type: '(event: ComponentEvent<T>) => void',
        description: 'Callback fired when selection changes. Receives ComponentEvent with the new value',
    },
    multiple: {
        type: 'boolean',
        default: 'false',
        description: 'Enable multiple selection mode. When true, value should be an array',
    },
    required: {
        type: 'boolean',
        default: 'false',
        description: 'Mark the field as required (affects hidden input)',
    },
    direction: {
        type: "'horizontal' | 'vertical'",
        default: "'horizontal'",
        description: 'Layout direction of the button group',
    },
    disabled: {
        type: 'boolean',
        default: 'false',
        description: 'Disable all buttons in the group',
    },
    className: {
        type: 'string',
        description: 'Additional CSS classes for the container',
    },
    name: {
        type: 'string',
        description: 'Name attribute for the hidden input field (useful for form submissions)',
    },
    size: {
        type: "'sm' | 'md' | 'lg' | 'xl'",
        description: 'Size variant (inherited from BaseComponentProps)',
    },
    theme: {
        type: "'default' | 'primary' | 'secondary' | 'success' | 'dark'",
        description: 'Theme variant (inherited from BaseComponentProps)',
    },
    borderRadius: {
        type: 'string',
        description: 'Custom border radius (inherited from BaseComponentProps)',
    },
    borderColor: {
        type: 'string',
        description: 'Custom border color (inherited from BaseComponentProps)',
    },
    borderWidth: {
        type: 'string',
        description: 'Custom border width (inherited from BaseComponentProps)',
    },
    backgroundColor: {
        type: 'string',
        description: 'Custom background color (inherited from BaseComponentProps)',
    },
    fontSize: {
        type: 'string',
        description: 'Custom font size (inherited from BaseComponentProps)',
    },
    fontColor: {
        type: 'string',
        description: 'Custom font color (inherited from BaseComponentProps)',
    },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Single selection example' },
    { id: 'multiple-selection', title: 'Multiple Selection', description: 'Multi-select mode' },
    { id: 'vertical-direction', title: 'Vertical Direction', description: 'Vertical layout' },
    { id: 'with-icons', title: 'With Icons', description: 'Buttons with icon support' },
    { id: 'disabled-state', title: 'Disabled State', description: 'Fully disabled group' },
    { id: 'disabled-items', title: 'Disabled Items', description: 'Individual item disabled' },
    { id: 'size-variants', title: 'Size Variants', description: 'sm, md, lg sizes' },
    { id: 'theme-variants', title: 'Theme Variants', description: 'Color theme options' },
    { id: 'real-world', title: 'Real-World Examples', description: 'Practical use cases' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'usage-notes', title: 'Usage Notes', description: 'Implementation details' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Single & Multi Select', description: 'Supports both single and multiple selection modes via the multiple prop', icon: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
    { title: 'Icon Support', description: 'Each item can include an icon component displayed alongside the label', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z' },
    { title: 'Directional Layout', description: 'Horizontal (default) or vertical layout via the direction prop', icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15' },
    { title: 'Size Variants', description: 'sm, md, lg, xl sizes to fit any context or density requirement', icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15' },
    { title: 'Granular Disable', description: 'Disable the entire group or individual items via the disabled property', icon: 'M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636' },
    { title: 'Form Integration', description: 'Built-in hidden input with name prop support for native form submissions', icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z' },
    { title: 'Accessibility', description: 'Uses role="group" and aria-pressed attributes for full screen reader support', icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z' },
    { title: 'Theming', description: 'Full dark/light and 5 brand themes via CSS variables — zero extra config', icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z' },
];

const SelectButtonPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>SelectButton</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A grouped button component for single or multiple selection. Perfect for toggle groups, filters, and segmented controls.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="multiple-selection" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Multiple Selection
                </h2>
                <MultipleSelection />
            </section>

            <section id="vertical-direction" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Vertical Direction
                </h2>
                <VerticalDirection />
            </section>

            <section id="with-icons" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>With Icons</h2>
                <WithIcons />
            </section>

            <section id="disabled-state" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Disabled State</h2>
                <DisabledState />
            </section>

            <section id="disabled-items" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Disabled Individual Items
                </h2>
                <DisabledItems />
            </section>

            <section id="size-variants" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Size Variants</h2>
                <SizeVariants />
            </section>

            <section id="theme-variants" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Theme Variants</h2>
                <ThemeVariants />
            </section>

            <section id="real-world" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Real-World Examples
                </h2>
                <RealWorldExamples />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { SelectButton } from 'ether-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={selectButtonProps} />
            </section>

            <section id="usage-notes" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Usage Notes</h2>
                <UsageNotes />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default SelectButtonPage;
