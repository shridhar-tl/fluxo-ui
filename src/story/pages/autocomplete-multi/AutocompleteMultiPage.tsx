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
import DisabledState from './DisabledState';
import LimitedSelections from './LimitedSelections';
import PresetValues from './PresetValues';
import UsageExamples from './UsageExamples';

const autocompleteMultiProps = {
    items: {
        type: 'ListItem[]',
        required: true,
        description: 'Array of items to display in suggestions',
    },
    value: {
        type: 'T[]',
        description: 'Array of selected values',
    },
    onChange: {
        type: 'function',
        description: 'Callback fired when values change: (event: ComponentEvent<T[]>) => void',
    },
    onFilter: {
        type: 'function',
        description: 'Callback fired when filter input changes: (query: string) => void | Promise<void>',
    },
    placeholder: {
        type: 'string',
        default: 'Type to search and select...',
        description: 'Placeholder text for the input field',
    },
    disabled: {
        type: 'boolean',
        default: false,
        description: 'Whether the input is disabled',
    },
    readonly: {
        type: 'boolean',
        default: false,
        description: 'Whether the input is readonly',
    },
    required: {
        type: 'boolean',
        default: false,
        description: 'Whether the field is required',
    },
    debounceMs: {
        type: 'number',
        default: 300,
        description: 'Debounce delay in milliseconds for filter callback',
    },
    minLength: {
        type: 'number',
        default: 1,
        description: 'Minimum characters before showing suggestions',
    },
    maxSelectedItems: {
        type: 'number',
        description: 'Maximum number of items that can be selected',
    },
    loading: {
        type: 'boolean',
        default: false,
        description: 'Whether data is loading',
    },
    emptyMessage: {
        type: 'string',
        default: 'No results found',
        description: 'Message shown when no items match the filter',
    },
    renderItem: {
        type: 'function',
        description:
            'Custom render function for each item: (item: ListItem, index: number, isSelected: boolean, isHighlighted: boolean) => React.ReactNode',
    },
    renderSelectedTemplate: {
        type: 'function',
        description:
            'Custom render function for selected items: (selectedItems: ListItem[], onRemove: (value: T) => void) => React.ReactNode',
    },
    showCount: {
        type: 'boolean',
        default: false,
        description: 'Show count of selected items when more than 3 are selected',
    },
    autoFocus: {
        type: 'boolean',
        default: false,
        description: 'Auto-focus the input field on mount',
    },
    id: {
        type: 'string',
        description: 'ID for the input element',
    },
    name: {
        type: 'string',
        description: 'Name attribute for the hidden input field',
    },
    args: {
        type: 'any',
        description: 'Additional arguments passed to event callbacks',
    },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Multi-select autocomplete example' },
    { id: 'preset-values', title: 'Preset Values', description: 'Pre-selected values on load' },
    { id: 'limited-selections', title: 'Limited Selections', description: 'Maximum selection count' },
    { id: 'disabled', title: 'Disabled State', description: 'Disabled input' },
    { id: 'usage', title: 'Usage', description: 'Code examples' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Multi-Selection via Autocomplete',
        description: 'Type to filter and select multiple items that appear as removable tags inline with the input',
        icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z',
    },
    {
        title: 'Tag Display',
        description: 'Each selected item renders as a dismissible tag inside the input for a compact, clear selection view',
        icon: 'M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z',
    },
    {
        title: 'Selection Limit',
        description: 'maxSelectedItems prevents selecting beyond the configured cap, locking the input automatically',
        icon: 'M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636',
    },
    {
        title: 'Show Count Mode',
        description: 'When showCount is enabled, overflowing tags collapse into a numeric badge for cleaner display',
        icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
    },
    {
        title: 'Async Filtering',
        description: 'onFilter with built-in debounce supports server-side search and live data loading as the user types',
        icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99',
    },
    {
        title: 'Custom Item Renderer',
        description: 'renderItem and renderSelectedTemplate props allow fully custom suggestion and tag layouts',
        icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z',
    },
    {
        title: 'Accessibility',
        description: 'ARIA combobox and listbox roles with keyboard navigation, focus trapping, and screen reader announcements',
        icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
    },
    {
        title: 'Theming',
        description: 'Full dark/light and 5 brand themes supported via CSS variables with zero extra configuration',
        icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z',
    },
];

const AutocompleteMultiPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    AutocompleteMulti
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A multi-select autocomplete component that allows users to select multiple items from suggestions.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="preset-values" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Preset Values</h2>
                <PresetValues />
            </section>

            <section id="limited-selections" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Limited Selections
                </h2>
                <LimitedSelections />
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
                <CodeBlock code={`import { AutocompleteMulti } from 'fluxo-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={autocompleteMultiProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default AutocompleteMultiPage;
