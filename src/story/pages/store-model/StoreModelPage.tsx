import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicCRUD from './BasicCRUD';
import CombinedDemo from './CombinedDemo';
import ListManagement from './ListManagement';
import PersistenceDemo from './PersistenceDemo';
import ValidationDemo from './ValidationDemo';

const modelConfigProps = {
    createWithDefaults: {
        type: '(id: any) => T',
        description: 'Factory function returning default state for new model instances',
        default: '-',
    },
    selectId: { type: '(state: T) => any', description: 'Extract the unique identifier from the model state', default: '-' },
    nextId: { type: '() => any', description: 'Generate a new unique ID when creating models', default: '-' },
    loadItem: {
        type: '(id: any) => Promise<T>',
        description: 'Async function to load a single item by ID from a remote source',
        default: '-',
    },
    loadItems: {
        type: '(options: PageOptions) => Promise<T[]>',
        description: 'Async function to load a paginated list of items',
        default: '-',
    },
    onCreate: {
        type: '(data: T, options: ChangeOptions<T>) => Promise<void>',
        description: 'Handler called when saving a new model (no existing ID)',
        default: '-',
    },
    onUpdate: {
        type: '(data: T, options: ChangeOptions<T>) => Promise<void>',
        description: 'Handler called when saving an existing model',
        default: '-',
    },
    onDelete: { type: '(data: T) => Promise<void>', description: 'Handler called when deleting a model', default: '-' },
    validate: {
        type: '(state: T) => errors | undefined',
        description: 'Validation function returning field-level errors or undefined if valid',
        default: '-',
    },
    validateBehavior: {
        type: "'change' | 'save'",
        description: 'When to run validation: on every state change or only on save',
        default: '-',
    },
    persist: {
        type: "boolean | 'local' | 'session' | ((store: T) => void)",
        description: 'Enable state persistence to localStorage, sessionStorage, or a custom function',
        default: 'false',
    },
    loadFromPersist: {
        type: '() => T | undefined',
        description: 'Custom function to load persisted state on initialization',
        default: '-',
    },
    saveOnChange: { type: 'boolean', description: 'Automatically save (debounced 500ms) whenever state changes', default: 'false' },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-crud', title: 'Basic CRUD', description: 'Create, read, update, delete' },
    { id: 'list-management', title: 'List Management', description: 'Pagination and sorting' },
    { id: 'persistence', title: 'Persistence', description: 'State survives remount' },
    { id: 'validation', title: 'Validation', description: 'Real-time field validation' },
    { id: 'combined', title: 'Combined Demo', description: 'Task manager example' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'API Reference', description: 'ModelConfig options' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Domain Model Factory',
        description: 'Create typed model factories with createModel that produce individually managed store instances for each entity',
        icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125',
    },
    {
        title: 'Built-in CRUD',
        description: 'Each model instance exposes save(), delete(), destroy(), and refresh() methods backed by configurable async handlers',
        icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10',
    },
    {
        title: 'Pagination & Sorting',
        description: 'list() provides client-side or server-side pagination and multi-field sorting out of the box',
        icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z',
    },
    {
        title: 'Validation',
        description:
            'Attach a validate function that runs on change or save, returning field-level error maps for form-style error display',
        icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z',
    },
    {
        title: 'Persistence',
        description: 'Optionally persist model state to localStorage or sessionStorage, or provide a custom persistence handler',
        icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375',
    },
    {
        title: 'React Hooks',
        description: 'createItemHook and createListHook provide reactive bindings so components re-render on relevant state changes',
        icon: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5',
    },
];

const StoreModelPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Model Store
                </h1>
                <p className={cn('text-xl leading-relaxed', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A domain-model factory built on top of the base store. createModel provides entity-level CRUD, list pagination,
                    validation, persistence, and React hooks for building data-driven UIs.
                </p>
            </div>

            <section id="basic-crud" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic CRUD</h2>
                <BasicCRUD />
            </section>

            <section id="list-management" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    List Management
                </h2>
                <ListManagement />
            </section>

            <section id="persistence" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Persistence</h2>
                <PersistenceDemo />
            </section>

            <section id="validation" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Validation</h2>
                <ValidationDemo />
            </section>

            <section id="combined" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Combined Demo</h2>
                <CombinedDemo />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock
                    code={`import { createModel, createItemHook, createListHook } from 'fluxo-ui/store';\nimport type { ModelConfig, ModelFactory, ModelStore, ListState } from 'fluxo-ui/store';`}
                />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>API Reference</h2>
                <PropsTable props={modelConfigProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default StoreModelPage;
