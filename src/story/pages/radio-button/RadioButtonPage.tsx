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
import HorizontalLayout from './HorizontalLayout';
import States from './States';
import ControlledUncontrolled from './ControlledUncontrolled';

const radioButtonGroupProps = {
    items: {
        type: 'ListItem[]',
        required: true,
        description: 'Array of radio button items with label, value, and optional disabled property',
    },
    value: {
        type: 'string',
        description: 'Currently selected value (controlled component)',
    },
    onChange: {
        type: 'function',
        description: 'Change event handler - receives ComponentEvent with selected value',
    },
    name: {
        type: 'string',
        description: 'Name attribute for the radio group',
    },
    args: {
        type: 'any',
        description: 'Custom arguments passed through to onChange event',
    },
    label: {
        type: 'string',
        description: 'Label for the radio group',
    },
    disabled: {
        type: 'boolean',
        default: false,
        description: 'Disable all radio buttons',
    },
    required: {
        type: 'boolean',
        default: false,
        description: 'Mark the group as required',
    },
    error: {
        type: 'string',
        description: 'Error message to display',
    },
    orientation: {
        type: 'string',
        default: 'vertical',
        description: 'Layout orientation (vertical or horizontal)',
    },
    className: {
        type: 'string',
        description: 'Additional CSS classes',
    },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Default radio group example' },
    { id: 'horizontal-layout', title: 'Horizontal Layout', description: 'Horizontal orientation' },
    { id: 'states', title: 'States', description: 'Normal, disabled, error states' },
    { id: 'controlled-uncontrolled', title: 'Controlled vs Uncontrolled', description: 'State management modes' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Single Selection', description: 'Enforces exactly one selection at a time from a set of mutually exclusive options', icon: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
    { title: 'Vertical & Horizontal', description: 'Supports both vertical (stacked) and horizontal (inline) orientations via the orientation prop', icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5' },
    { title: 'Per-Item Disabled', description: 'Individual items can be disabled independently while the rest of the group remains interactive', icon: 'M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636' },
    { title: 'Full Group Disable', description: 'The disabled prop disables all radio buttons in the group at once for easy form-level control', icon: 'M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z' },
    { title: 'Validation Support', description: 'Built-in required and error props for form validation with visible error message display', icon: 'M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z' },
    { title: 'Controlled Component', description: 'Fully controlled via value and onChange — works as both controlled and uncontrolled inputs', icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99' },
    { title: 'Accessibility', description: 'Uses native radio input semantics with proper grouping, keyboard navigation, and ARIA labels', icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z' },
    { title: 'Theming', description: 'Full dark/light and 5 brand themes supported via CSS variables with zero extra configuration', icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z' },
];

const RadioButtonPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>RadioButtonGroup</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>A radio button group component for selecting a single option from multiple choices.</p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="horizontal-layout" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Horizontal Layout</h2>
                <HorizontalLayout />
            </section>

            <section id="states" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>States</h2>
                <States />
            </section>

            <section id="controlled-uncontrolled" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Controlled vs Uncontrolled</h2>
                <ControlledUncontrolled />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { RadioButtonGroup } from 'ether-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={radioButtonGroupProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default RadioButtonPage;
