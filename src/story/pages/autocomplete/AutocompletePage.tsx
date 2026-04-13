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
import CustomConfiguration from './CustomConfiguration';
import DisabledState from './DisabledState';
import UsageExamples from './UsageExamples';

const autocompleteProps = {
    items: {
        type: 'ListItem[]',
        required: true,
        description: 'Array of suggestion items with { label: string, value: any } structure',
    },
    value: {
        type: 'string',
        default: "''",
        description: 'Current input value (controlled)',
    },
    selectedValue: {
        type: 'any',
        description: 'Currently selected item value',
    },
    onChange: {
        type: '(event: ComponentEvent<string>) => void',
        description: 'Callback fired when input value changes. Receives event object with value, name, and args',
    },
    onSelect: {
        type: '(event: ComponentEvent<any>) => void',
        description: 'Callback fired when a suggestion is selected. Receives the selected item value',
    },
    onFilter: {
        type: '(query: string) => void | Promise<void>',
        description: 'Callback for filtering items or loading async data based on input',
    },
    placeholder: {
        type: 'string',
        default: "'Type to search...'",
        description: 'Placeholder text for the input',
    },
    required: {
        type: 'boolean',
        default: 'false',
        description: 'Mark the input as required',
    },
    readonly: {
        type: 'boolean',
        default: 'false',
        description: 'Make the input read-only',
    },
    disabled: {
        type: 'boolean',
        default: 'false',
        description: 'Disable the input',
    },
    minLength: {
        type: 'number',
        default: '1',
        description: 'Minimum characters before showing suggestions',
    },
    maxSuggestions: {
        type: 'number',
        description: 'Maximum number of suggestions to display (filters the items list)',
    },
    debounceMs: {
        type: 'number',
        default: '300',
        description: 'Debounce delay in milliseconds before calling onFilter',
    },
    loading: {
        type: 'boolean',
        default: 'false',
        description: 'Show loading indicator in the input',
    },
    emptyMessage: {
        type: 'string',
        default: "'No results found'",
        description: 'Message shown when no suggestions match',
    },
    renderItem: {
        type: '(item: ListItem, index: number, isSelected: boolean, isHighlighted: boolean) => ReactNode',
        description: 'Custom renderer for suggestion items',
    },
    autoFocus: {
        type: 'boolean',
        default: 'false',
        description: 'Auto focus the input on mount',
    },
    id: {
        type: 'string',
        description: 'HTML id attribute for the input',
    },
    name: {
        type: 'string',
        description: 'Name attribute for the input (used in forms)',
    },
    args: {
        type: 'any',
        description: 'Additional arguments passed to onChange/onSelect handlers',
    },
    className: {
        type: 'string',
        description: 'Additional CSS classes for the input',
    },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Simple autocomplete example' },
    { id: 'custom-config', title: 'Custom Configuration', description: 'minLength and maxSuggestions' },
    { id: 'disabled', title: 'Disabled State', description: 'Disabled input' },
    { id: 'usage', title: 'Usage', description: 'Code examples' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Type-ahead Search',
        description: 'Shows matching suggestions as the user types with configurable minimum character threshold',
        icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z',
    },
    {
        title: 'Async Filtering',
        description: 'onFilter callback with built-in debounce supports server-side search and dynamic data loading',
        icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99',
    },
    {
        title: 'Suggestion Limit',
        description: 'Control the number of visible suggestions with maxSuggestions to keep the dropdown focused',
        icon: 'M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5',
    },
    {
        title: 'Loading State',
        description: 'Built-in loading indicator shown while async suggestions are being fetched',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
    {
        title: 'Custom Item Renderer',
        description: 'renderItem prop allows fully custom suggestion item layouts including icons and metadata',
        icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z',
    },
    {
        title: 'Separate Select Callback',
        description: 'Distinct onChange (typed text) and onSelect (chosen item) callbacks for full control over state',
        icon: 'M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59',
    },
    {
        title: 'Accessibility',
        description: 'ARIA combobox pattern with keyboard navigation, focus management, and screen reader support',
        icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
    },
    {
        title: 'Theming',
        description: 'Full dark/light and 5 brand themes supported via CSS variables with zero extra configuration',
        icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z',
    },
];

const AutocompletePage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Autocomplete
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    An input field with auto-completion functionality that shows suggestions as the user types.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="custom-config" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Custom Configuration
                </h2>
                <CustomConfiguration />
            </section>

            <section id="disabled" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Disabled State</h2>
                <DisabledState />
            </section>

            <section id="usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Usage</h2>
                <UsageExamples />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { Autocomplete } from 'fluxo-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={autocompleteProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default AutocompletePage;
