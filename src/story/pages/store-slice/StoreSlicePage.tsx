import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicSlice from './BasicSlice';
import BidirectionalSync from './BidirectionalSync';
import StandaloneSlice from './StandaloneSlice';
import VanillaJsExample from './VanillaJsExample';

import _slice_props_json from '../../../store/store.props.json';
const { sliceApiProps } = _slice_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic', title: 'Basic Slices', description: 'Compose slices into a combined store' },
    { id: 'standalone', title: 'Standalone', description: 'A slice without a combined parent' },
    { id: 'bidirectional', title: 'Bidirectional Sync', description: 'Slice ↔ Combined notifications' },
    { id: 'vanilla', title: 'Vanilla JS', description: 'Framework-agnostic core' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'api', title: 'API Reference', description: 'Slice API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Standalone-Capable Slices',
        description: 'A slice is a full Store<T> on its own. Use it directly — combine later without changing call sites.',
        icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
    },
    {
        title: 'Bidirectional Sync',
        description: 'Writes via the slice or the combined store both fan out to slice subscribers and combined-store subscribers.',
        icon: 'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
    },
    {
        title: 'Single State Cell',
        description: 'No duplicated state. Slice and combined store share one cloned state per batch — zero double-write or fan-out cost.',
        icon: 'M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z',
    },
    {
        title: 'Path Subscriptions Across Layers',
        description: 'Slice-local paths and combined fully-qualified paths both work — listeners only fire for their relevant changes.',
        icon: 'M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z',
    },
    {
        title: 'Microtask-Cached Reads',
        description: 'Slice.getState() caches the local branch within a microtask — repeated reads are O(1) without re-cloning the parent.',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
    {
        title: 'Framework-Agnostic',
        description: 'createSlice and combineSlices are pure TypeScript. React integration is optional via createHook(slice) or createHook(combined).',
        icon: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5',
    },
];

const StoreSlicePage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Slices
                </h1>
                <p className={cn('text-xl leading-relaxed', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    Compose multiple independent state shards into a single store, or use any shard standalone. Slice subscribers and
                    combined-store subscribers stay in sync automatically — no matter which side wrote the change.
                </p>
            </div>

            <section id="basic" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Slices</h2>
                <BasicSlice />
            </section>

            <section id="standalone" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Standalone Slice
                </h2>
                <StandaloneSlice />
            </section>

            <section id="bidirectional" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Bidirectional Sync
                </h2>
                <BidirectionalSync />
            </section>

            <section id="vanilla" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Framework-Agnostic Core
                </h2>
                <VanillaJsExample />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { createSlice, combineSlices, createHook, isSlice, isCombinedStore } from 'fluxo-ui/store';`} />
            </section>

            <section id="api" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>API Reference</h2>
                <PropsTable props={sliceApiProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default StoreSlicePage;
