import cn from 'classnames';
import React from 'react';
import { FeatureGrid } from '../../FeatureCard';
import type { FeatureItem } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import SingleSelection from './SingleSelection';
import MultipleSelection from './MultipleSelection';
import SearchableList from './SearchableList';
import GroupedList from './GroupedList';
import DisabledState from './DisabledState';

const listBoxProps = {
    options: {
        type: 'ListBoxOption[]',
        required: true,
        description: 'Array of options to display.',
    },
    value: {
        type: 'T | T[]',
        description: 'Currently selected value or array of values (for multiple selection).',
    },
    onChange: {
        type: '(value: T | T[]) => void',
        description: 'Called when selection changes.',
    },
    multiple: {
        type: 'boolean',
        default: 'false',
        description: 'Allow selecting multiple items.',
    },
    searchable: {
        type: 'boolean',
        default: 'false',
        description: 'Show a search input above the list.',
    },
    searchPlaceholder: {
        type: 'string',
        description: 'Placeholder text for the search input.',
    },
    grouped: {
        type: 'boolean',
        default: 'false',
        description: 'Group items using the groupBy function.',
    },
    groupBy: {
        type: '(option: ListBoxOption) => string',
        description: 'Returns the group name for each option.',
    },
    selectAll: {
        type: 'boolean',
        default: 'false',
        description: 'Show a Select All checkbox (requires multiple).',
    },
    clearable: {
        type: 'boolean',
        default: 'false',
        description: 'Show a Clear All button.',
    },
    disabled: {
        type: 'boolean',
        default: 'false',
        description: 'Disable all interactions.',
    },
    emptyMessage: {
        type: 'string',
        description: 'Message shown when the option list is empty.',
    },
    maxHeight: {
        type: 'string | number',
        description: 'Max height of the scrollable list.',
    },
    itemTemplate: {
        type: '(option: ListBoxOption) => ReactNode',
        description: 'Custom renderer for each option item.',
    },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'single-selection', title: 'Single Selection', description: 'Basic single select' },
    { id: 'multiple-selection', title: 'Multiple Selection', description: 'Multi-select with select-all' },
    { id: 'searchable', title: 'Searchable', description: 'With search filter' },
    { id: 'grouped', title: 'Grouped Options', description: 'Group by category' },
    { id: 'disabled', title: 'Disabled State', description: 'Fully disabled list' },
    { id: 'props', title: 'API Reference', description: 'Component props' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Single & Multi Select', description: 'Supports both single value and multi-value selection modes', icon: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
    { title: 'Search Filter', description: 'Built-in search input filters options in real time without extra code', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 15.803a7.5 7.5 0 0 0 10.607 10.607Z' },
    { title: 'Grouping', description: 'Group options by any property with sticky group headers', icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z' },
    { title: 'Select All & Clear', description: 'Optional Select All checkbox and Clear button for bulk operations', icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z' },
    { title: 'Disabled Items', description: 'Individual options can be marked as disabled while the list remains interactive', icon: 'M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636' },
    { title: 'Custom Templates', description: 'itemTemplate prop renders any React node for fully custom option display', icon: 'M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z' },
    { title: 'Accessibility', description: 'Keyboard navigation, ARIA roles, and focus management built in', icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z' },
    { title: 'Theming', description: 'Full dark/light + 5 brand themes via CSS variables — zero extra config', icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z' },
];

const ListBoxPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>ListBox</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A scrollable list component for single or multi-item selection. Supports search, grouping, disabled items, and custom
                    item templates.
                </p>
            </div>

            <section id="single-selection" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Single Selection</h2>
                <SingleSelection />
            </section>

            <section id="multiple-selection" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Multiple Selection</h2>
                <MultipleSelection />
            </section>

            <section id="searchable" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Searchable</h2>
                <SearchableList />
            </section>

            <section id="grouped" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Grouped Options</h2>
                <GroupedList />
            </section>

            <section id="disabled" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Disabled State</h2>
                <DisabledState />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>API Reference</h2>
                <PropsTable props={listBoxProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default ListBoxPage;
