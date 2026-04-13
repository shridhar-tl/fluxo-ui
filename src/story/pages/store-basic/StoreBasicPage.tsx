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
import BatchedUpdates from './BatchedUpdates';
import ComputedProperties from './ComputedProperties';
import MultipleStores from './MultipleStores';
import PathSubscriptions from './PathSubscriptions';

const storeApiProps = {
    'create(initializer, middlewares?)': {
        type: '(initializer: () => T, middlewares?: Middleware<T>[]) => Store<T>',
        description: 'Create a new store with initial state and optional middleware',
        default: '-',
    },
    'store.getState()': { type: '() => T', description: 'Get the current state snapshot (includes computed properties)', default: '-' },
    'store.setState(update)': {
        type: '(partial: Partial<T>) => void',
        description: 'Merge partial state into current state (batched via microtask)',
        default: '-',
    },
    'store.setState(updater)': {
        type: '(fn: (state: T) => Partial<T>) => void',
        description: 'Update state using an updater function for safe reads',
        default: '-',
    },
    'store.on(event, listener)': {
        type: "(event: 'init' | 'change', listener) => unsubscribe",
        description: 'Subscribe to all state changes or initialization',
        default: '-',
    },
    'store.on(event, path, listener)': {
        type: "(event: 'change', path: string, listener) => unsubscribe",
        description: 'Subscribe to changes on a specific state path',
        default: '-',
    },
    'store.reset()': { type: '() => void', description: 'Reset state to the initial value from the initializer function', default: '-' },
    'store.compute(name, fn, deps)': {
        type: '(name: string, fn: (state: T) => R, deps: string[]) => void',
        description: 'Register a computed property with dependency tracking',
        default: '-',
    },
    'createHook(store)': {
        type: '(store: Store<T>) => useStore',
        description: 'Create a React hook bound to a store for reactive component integration',
        default: '-',
    },
    'useStore(selector?, equalityFn?)': {
        type: '(selector?, equalityFn?) => T | R',
        description: 'React hook returned by createHook. Optional selector for derived slices',
        default: '-',
    },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic', title: 'Basic Usage', description: 'Counter example' },
    { id: 'computed', title: 'Computed', description: 'Derived state' },
    { id: 'batched', title: 'Batched Updates', description: 'Microtask batching' },
    { id: 'path-subscriptions', title: 'Path Subscriptions', description: 'Granular listeners' },
    { id: 'multiple-stores', title: 'Multiple Stores', description: 'Independent stores' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'api', title: 'API Reference', description: 'Store API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Microtask Batching',
        description: 'Multiple setState calls within one synchronous handler are batched into a single notification, minimizing re-renders',
        icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
    },
    {
        title: 'Computed Properties',
        description: 'Derive values from state with automatic dependency tracking and caching for optimal performance',
        icon: 'M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z',
    },
    {
        title: 'Path-Based Subscriptions',
        description: 'Listen to specific state paths for fine-grained reactivity, avoiding unnecessary work when unrelated state changes',
        icon: 'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
    },
    {
        title: 'Middleware System',
        description: 'Extensible middleware for persistence, undo/redo, validation, throttling, logging, and devtools integration',
        icon: 'M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    },
    {
        title: 'Immutable Updates',
        description: 'State is cloned via structuredClone on every update, ensuring safe immutable operations without external libraries',
        icon: 'M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z',
    },
    {
        title: 'Framework Agnostic Core',
        description: 'The core store is plain TypeScript with no React dependency. React integration is provided through createHook()',
        icon: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5',
    },
];

const StoreBasicPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Basic Store
                </h1>
                <p className={cn('text-xl leading-relaxed', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A lightweight state management solution with batched updates, computed properties, path-based subscriptions, and a
                    composable middleware system.
                </p>
            </div>

            <section id="basic" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="computed" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Computed Properties
                </h2>
                <ComputedProperties />
            </section>

            <section id="batched" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Batched Updates
                </h2>
                <BatchedUpdates />
            </section>

            <section id="path-subscriptions" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Path Subscriptions
                </h2>
                <PathSubscriptions />
            </section>

            <section id="multiple-stores" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Multiple Stores
                </h2>
                <MultipleStores />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock
                    code={`import { create, createHook } from 'fluxo-ui/store';\nimport {\n  persistMiddleware,\n  undoRedoMiddleware,\n  validationMiddleware,\n  loggerMiddleware,\n  throttleMiddleware,\n  devToolsMiddleware,\n} from 'fluxo-ui/store/middlewares';`}
                />
            </section>

            <section id="api" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>API Reference</h2>
                <PropsTable props={storeApiProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default StoreBasicPage;
