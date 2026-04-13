import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import ArrayEditing from './ArrayEditing';
import BasicUsage from './BasicUsage';
import ComplexData from './ComplexData';
import NestedObjects from './NestedObjects';
import PermissionControls from './PermissionControls';
import ReadOnlyMode from './ReadOnlyMode';
import SizeVariants from './SizeVariants';
import SortedKeys from './SortedKeys';
import TypeShowcase from './TypeShowcase';

const jsonEditorProps = {
    value: { type: 'JsonValue', description: 'The JSON value to display and edit', default: '-' },
    onChange: { type: '(value: JsonValue) => void', description: 'Callback when the value changes', default: '-' },
    allowEditValue: { type: 'boolean', default: 'true', description: 'Allow editing values' },
    allowEditKey: { type: 'boolean', default: 'true', description: 'Allow editing/renaming keys' },
    allowRemove: { type: 'boolean', default: 'true', description: 'Allow removing properties/items' },
    allowInsert: { type: 'boolean', default: 'true', description: 'Allow adding new properties/items' },
    allowTypeChange: { type: 'boolean', default: 'false', description: 'Show type badges with type changing' },
    allowCopy: { type: 'boolean', default: 'true', description: 'Allow copying values to clipboard' },
    allowSearch: { type: 'boolean', default: 'true', description: 'Show search in toolbar' },
    readOnly: { type: 'boolean', default: 'false', description: 'Disable all editing' },
    expandDepth: { type: 'number', default: '1', description: 'Initial depth to auto-expand' },
    size: { type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Font and spacing size' },
    maxHeight: { type: 'string | number', description: 'Max height with scroll overflow', default: '-' },
    showDataTypes: { type: 'boolean', default: 'false', description: 'Show type labels next to values' },
    showItemCount: { type: 'boolean', default: 'true', description: 'Show item count for objects/arrays' },
    showToolbar: { type: 'boolean', default: 'true', description: 'Show the toolbar with search and actions' },
    sortKeys: { type: 'boolean', default: 'false', description: 'Sort object keys alphabetically' },
    className: { type: 'string', description: 'Additional CSS class', default: '-' },
    id: { type: 'string', description: 'HTML id attribute', default: '-' },
    ariaLabel: { type: 'string', description: 'Accessible label', default: '-' },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic', title: 'Basic', description: 'Simple editing' },
    { id: 'nested', title: 'Nested', description: 'Deep hierarchies' },
    { id: 'arrays', title: 'Arrays', description: 'Array editing' },
    { id: 'types', title: 'Data Types', description: 'Type support' },
    { id: 'complex', title: 'Complex', description: 'Real-world data' },
    { id: 'readonly', title: 'Read-Only', description: 'View mode' },
    { id: 'permissions', title: 'Permissions', description: 'Edit controls' },
    { id: 'sizes', title: 'Sizes', description: 'Size variants' },
    { id: 'sorted', title: 'Sorted Keys', description: 'Alphabetical keys' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Recursive Editing',
        description: 'Edit deeply nested objects and arrays with collapsible tree view and indentation guides',
        icon: 'M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125v-5.25Z',
    },
    {
        title: 'Smart Type Detection',
        description: 'Automatically detects strings, numbers, booleans, null, objects, arrays, and URLs',
        icon: 'M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z',
    },
    {
        title: 'Inline Editing',
        description: 'Double-click to edit keys and values in place with keyboard shortcuts (Enter to save, Esc to cancel)',
        icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z',
    },
    {
        title: 'CRUD Operations',
        description: 'Add new properties/items, rename keys, edit values, and delete entries with confirmation',
        icon: 'M12 4.5v15m7.5-7.5h-15',
    },
    {
        title: 'Permission Controls',
        description: 'Fine-grained boolean flags to control edit, add, remove, and type change capabilities',
        icon: 'M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z',
    },
    {
        title: 'URL Detection',
        description: 'Automatically detects URLs and provides clickable launch buttons',
        icon: 'M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244',
    },
];

const JsonEditorPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    JSON Editor
                </h1>
                <p className={cn('text-xl leading-relaxed', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    An interactive tree-view editor for JSON data with inline editing, type detection, URL handling, and full CRUD
                    operations on nested objects and arrays.
                </p>
            </div>

            <section id="basic" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic</h2>
                <BasicUsage />
            </section>

            <section id="nested" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Nested Objects</h2>
                <NestedObjects />
            </section>

            <section id="arrays" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Arrays</h2>
                <ArrayEditing />
            </section>

            <section id="types" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Data Types</h2>
                <TypeShowcase />
            </section>

            <section id="complex" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Complex Data</h2>
                <ComplexData />
            </section>

            <section id="readonly" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Read-Only</h2>
                <ReadOnlyMode />
            </section>

            <section id="permissions" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Permissions</h2>
                <PermissionControls />
            </section>

            <section id="sizes" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Sizes</h2>
                <SizeVariants />
            </section>

            <section id="sorted" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Sorted Keys</h2>
                <SortedKeys />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { JsonEditor } from 'fluxo-ui';\nimport type { JsonValue, JsonEditorProps } from 'fluxo-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={jsonEditorProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default JsonEditorPage;
