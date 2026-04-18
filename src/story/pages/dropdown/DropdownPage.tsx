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
import ClearableDropdown from './ClearableDropdown';
import CustomFieldMapping from './CustomFieldMapping';
import DropdownStates from './DropdownStates';
import GroupedOptions from './GroupedOptions';
import SearchableDropdown from './SearchableDropdown';


import _Dropdown_props_json from './../../../components/Dropdown.props.json';
const { dropdownProps } = _Dropdown_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Default dropdown example' },
    { id: 'searchable', title: 'Searchable', description: 'Filter options by typing' },
    { id: 'clearable', title: 'Clearable', description: 'Clear selected value' },
    { id: 'grouped', title: 'Grouped Options', description: 'Options organized by category' },
    { id: 'custom-fields', title: 'Custom Field Mapping', description: 'optionLabel and optionValue' },
    { id: 'states', title: 'States', description: 'Normal, disabled, error, etc.' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Single Select',
        description: 'Controlled single-value selection with clear and searchable support',
        icon: 'M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9',
    },
    {
        title: 'Searchable',
        description: 'Built-in filter input to quickly find options in long lists',
        icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z',
    },
    { title: 'Clearable', description: 'Optional clear button to reset selected value to empty', icon: 'M6 18 18 6M6 6l12 12' },
    {
        title: 'Grouped Options',
        description: 'Organize options into labeled groups with nested item arrays',
        icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z',
    },
    {
        title: 'Custom Field Mapping',
        description: 'optionLabel and optionValue props map any data shape to the dropdown',
        icon: 'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
    },
    {
        title: 'Custom Rendering',
        description: 'renderItem and renderValue callbacks for full JSX control over items',
        icon: 'M17.25 6.75 22.5 12l-5.25 5.25-5.25-5.25 5.25-5.25Zm-10.5 0L1.5 12l5.25 5.25 5.25-5.25-5.25-5.25Zm4.872-4.099 4.562 18.171',
    },
    {
        title: 'States',
        description: 'Disabled, read-only, required, error, and loading states built in',
        icon: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
    {
        title: 'Accessibility',
        description: 'ARIA roles, keyboard navigation, and screen reader support',
        icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
    },
    {
        title: 'Theming',
        description: 'Full dark/light + 5 brand themes via CSS variables — zero extra config',
        icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z',
    },
];

const DropdownPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Dropdown
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A versatile dropdown component for selecting single options with search and clear functionality.
                </p>
            </div>

            <section className="scroll-mt-8" id="basic-usage">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section className="scroll-mt-8" id="searchable">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Searchable Dropdown
                </h2>
                <SearchableDropdown />
            </section>

            <section className="scroll-mt-8" id="clearable">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Clearable Dropdown
                </h2>
                <ClearableDropdown />
            </section>

            <section className="scroll-mt-8" id="grouped">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Grouped Options
                </h2>
                <GroupedOptions />
            </section>

            <section className="scroll-mt-8" id="custom-fields">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Custom Field Mapping
                </h2>
                <CustomFieldMapping />
            </section>

            <section className="scroll-mt-8" id="states">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>States</h2>
                <DropdownStates />
            </section>

            <section className="scroll-mt-8" id="import">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { Dropdown } from 'fluxo-ui';`} />
            </section>

            <section className="scroll-mt-8" id="props">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={dropdownProps} />
            </section>

            <section className="scroll-mt-8" id="features">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default DropdownPage;
