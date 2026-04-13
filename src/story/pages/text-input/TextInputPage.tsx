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
import TextInputStates from './TextInputStates';
import Validation from './Validation';
import WithIcons from './WithIcons';
import WithLabel from './WithLabel';

const textInputProps = {
    value: { type: 'string', description: 'Current value of the input (controlled)' },
    placeholder: { type: 'string', description: 'Placeholder text' },
    label: { type: 'string', description: 'Label text' },
    error: { type: 'string', description: 'Error message to display' },
    disabled: { type: 'boolean', default: false, description: 'Disable the input' },
    readonly: { type: 'boolean', default: false, description: 'Make the input read-only' },
    required: { type: 'boolean', default: false, description: 'Mark the input as required' },
    autoFocus: { type: 'boolean', default: false, description: 'Auto focus the input on mount' },
    maxLength: { type: 'number', description: 'Maximum character limit' },
    minLength: { type: 'number', description: 'Minimum character requirement' },
    pattern: { type: 'string', description: 'Regex pattern for validation' },
    autoComplete: { type: 'string', description: 'Auto-complete hint' },
    leftIcon: { type: 'ReactNode', description: 'Icon to display on the left side' },
    rightIcon: { type: 'ReactNode', description: 'Icon to display on the right side' },
    id: { type: 'string', description: 'Unique identifier for the input' },
    name: { type: 'string', description: 'Name attribute for the input' },
    onChange: { type: 'function', description: 'Change event handler' },
    className: { type: 'string', description: 'Additional CSS classes' },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Default input example' },
    { id: 'with-label', title: 'With Label', description: 'Input with field label' },
    { id: 'with-icons', title: 'With Icons', description: 'Left and right icon slots' },
    { id: 'states', title: 'States', description: 'Normal, disabled, read-only, required' },
    { id: 'validation', title: 'Validation', description: 'Error state and messages' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Controlled Input',
        description: 'Fully controlled via value and onChange for form state management',
        icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10',
    },
    {
        title: 'Icon Slots',
        description: 'Left and right icon slots accept any React node',
        icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z',
    },
    {
        title: 'Validation',
        description: 'Error prop displays inline validation messages below the input',
        icon: 'M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z',
    },
    {
        title: 'States',
        description: 'Disabled, read-only, required, and error states fully supported',
        icon: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
    {
        title: 'Character Limits',
        description: 'maxLength and minLength props for length constraints',
        icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12',
    },
    {
        title: 'Accessibility',
        description: 'Label association, ARIA attributes, and keyboard focus support',
        icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
    },
    {
        title: 'Theming',
        description: 'Full dark/light + 5 brand themes via CSS variables — zero extra config',
        icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z',
    },
];

const TextInputPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    TextInput
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A flexible text input component with support for labels, validation, and various states.
                </p>
            </div>

            <section className="scroll-mt-8" id="basic-usage">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section className="scroll-mt-8" id="with-label">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>With Label</h2>
                <WithLabel />
            </section>

            <section className="scroll-mt-8" id="with-icons">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>With Icons</h2>
                <WithIcons />
            </section>

            <section className="scroll-mt-8" id="states">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>States</h2>
                <TextInputStates />
            </section>

            <section className="scroll-mt-8" id="validation">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Validation</h2>
                <Validation />
            </section>

            <section className="scroll-mt-8" id="import">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { TextInput } from 'fluxo-ui';`} />
            </section>

            <section className="scroll-mt-8" id="props">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={textInputProps} />
            </section>

            <section className="scroll-mt-8" id="features">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default TextInputPage;
