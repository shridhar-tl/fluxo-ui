import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { FeatureGrid } from '../../FeatureCard';
import type { FeatureItem } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicLabel from './BasicLabel';
import RequiredField from './RequiredField';
import OptionalField from './OptionalField';
import ErrorState from './ErrorState';
import DisabledState from './DisabledState';
import CombinedStates from './CombinedStates';

const fieldLabelProps = {
    htmlFor: {
        type: 'string',
        description: 'Associates the label with a form control',
    },
    children: {
        type: 'ReactNode',
        required: true,
        description: 'Label content',
    },
    required: {
        type: 'boolean',
        default: false,
        description: 'Shows required indicator',
    },
    optional: {
        type: 'boolean',
        default: false,
        description: 'Shows optional indicator',
    },
    disabled: {
        type: 'boolean',
        default: false,
        description: 'Disabled state styling',
    },
    error: {
        type: 'boolean',
        default: false,
        description: 'Error state styling',
    },
    className: {
        type: 'string',
        description: 'Additional CSS classes',
    },
};

const importCode = `import { FieldLabel } from 'ether-ui';`;

const basicUsageCode = `import { FieldLabel, TextInput } from 'ether-ui';

function MyComponent() {
  return (
    <div>
      <FieldLabel htmlFor="email">Email Address</FieldLabel>
      <TextInput id="email" placeholder="Enter your email" />
    </div>
  );
}`;

const advancedUsageCode = `import { FieldLabel, TextInput } from 'ether-ui';

function MyComponent() {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel htmlFor="required-field" required>
          Username
        </FieldLabel>
        <TextInput id="required-field" placeholder="Required field" />
      </div>

      <div>
        <FieldLabel htmlFor="optional-field" optional>
          Middle Name
        </FieldLabel>
        <TextInput id="optional-field" placeholder="Optional field" />
      </div>

      <div>
        <FieldLabel htmlFor="error-field" error>
          Password
        </FieldLabel>
        <TextInput id="error-field" placeholder="Invalid input" />
      </div>
    </div>
  );
}`;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-label', title: 'Basic Label', description: 'Simple field label' },
    { id: 'required-field', title: 'Required Field', description: 'Label with required indicator' },
    { id: 'optional-field', title: 'Optional Field', description: 'Label with optional indicator' },
    { id: 'error-state', title: 'Error State', description: 'Label in error state' },
    { id: 'disabled-state', title: 'Disabled State', description: 'Label in disabled state' },
    { id: 'combined-states', title: 'Combined States', description: 'Multiple form fields' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'usage', title: 'Usage', description: 'Code examples' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Required Indicator', description: 'Shows a visual asterisk marker for required form fields', icon: 'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z' },
    { title: 'Optional Indicator', description: 'Displays an "(optional)" badge for non-mandatory fields', icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z' },
    { title: 'Error State', description: 'Applies error styling and color to indicate invalid input', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z' },
    { title: 'Disabled State', description: 'Muted styling for disabled or read-only form fields', icon: 'M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636' },
    { title: 'Accessibility', description: 'htmlFor prop properly associates labels with form controls for screen readers', icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z' },
    { title: 'Theming', description: 'Full dark/light and 5 brand themes via CSS variables — zero extra config', icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z' },
];

const FieldLabelPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>FieldLabel</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A label component for form fields with support for required, optional, and error states.
                </p>
            </div>

            <section id="basic-label" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Label</h2>
                <BasicLabel />
            </section>

            <section id="required-field" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Required Field</h2>
                <RequiredField />
            </section>

            <section id="optional-field" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Optional Field</h2>
                <OptionalField />
            </section>

            <section id="error-state" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Error State</h2>
                <ErrorState />
            </section>

            <section id="disabled-state" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Disabled State</h2>
                <DisabledState />
            </section>

            <section id="combined-states" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Combined States</h2>
                <CombinedStates />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={importCode} language="typescript" />
            </section>

            <section id="usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Usage</h2>
                <div className="space-y-4">
                    <h3 className={cn('text-lg font-medium', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>Basic Usage</h3>
                    <CodeBlock code={basicUsageCode} language="typescript" />
                </div>
                <div className="mt-6 space-y-4">
                    <h3 className={cn('text-lg font-medium', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>Advanced Usage</h3>
                    <CodeBlock code={advancedUsageCode} language="typescript" />
                </div>
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={fieldLabelProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default FieldLabelPage;
