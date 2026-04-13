import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { FeatureGrid } from '../../FeatureCard';
import type { FeatureItem } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicUsage from './BasicUsage';
import GroupedItems from './GroupedItems';
import ControlledPopover from './ControlledPopover';
import CustomContent from './CustomContent';
import FilterablePopover from './FilterablePopover';

const popoverProps = {
    isOpen: {
        type: 'boolean',
        required: true,
        description: 'Controls whether the popover is visible.',
    },
    onClose: {
        type: '(e?: MouseEvent) => void',
        required: true,
        description: 'Callback invoked when the popover should close (click outside, Escape key).',
    },
    triggerElement: {
        type: 'HTMLElement | null',
        required: true,
        description: 'The DOM element the popover is anchored to for positioning.',
    },
    items: {
        type: 'ListItem[]',
        required: true,
        description: 'Array of list items to display inside the popover.',
    },
    groups: {
        type: 'ListItemGroup[]',
        description: 'Optional grouping of items with labeled section headers.',
    },
    onSelect: {
        type: '(item: ListItem, index: number) => void',
        required: true,
        description: 'Callback invoked when an item is selected.',
    },
    selectedIndex: {
        type: 'number',
        default: '-1',
        description: 'Index of the currently selected item (shows a check mark).',
    },
    renderItem: {
        type: '(item, index, isSelected, isHighlighted) => ReactNode',
        description: 'Custom render function for each list item.',
    },
    maxHeight: {
        type: 'string',
        default: "'300px'",
        description: 'Maximum height of the popover container before scrolling.',
    },
    width: {
        type: 'string',
        description: "Width of the popover. Defaults to the trigger element's width.",
    },
    filter: {
        type: 'string',
        default: "''",
        description: 'Filter string to narrow down displayed items by label.',
    },
    loading: {
        type: 'boolean',
        default: 'false',
        description: 'Shows a loading spinner instead of items.',
    },
    emptyMessage: {
        type: 'string',
        default: "'No items found'",
        description: 'Message displayed when no items match the filter.',
    },
    children: {
        type: 'ReactNode',
        description: 'Content rendered above the item list (e.g., a search input).',
    },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Simple selectable list' },
    { id: 'grouped-items', title: 'Grouped Items', description: 'Categorized item groups' },
    { id: 'controlled', title: 'Controlled', description: 'Programmatic open/close' },
    { id: 'custom-content', title: 'Custom Render', description: 'Custom item rendering' },
    { id: 'filterable', title: 'Filterable', description: 'Search with children slot' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'api-reference', title: 'API Reference', description: 'Props table' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Portal Rendering',
        description: 'Renders in a portal so the popover is never clipped by overflow:hidden containers or stacking contexts.',
        icon: 'M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25',
    },
    {
        title: 'Keyboard Navigation',
        description: 'Full keyboard support with ArrowUp, ArrowDown to navigate, Enter to select, and Escape to close.',
        icon: 'M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z',
    },
    {
        title: 'Smart Positioning',
        description: 'Automatically calculates the best position relative to the trigger element using usePosition hook.',
        icon: 'M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z',
    },
    {
        title: 'Grouped Items',
        description: 'Organize items into labeled groups with section headers for better categorization.',
        icon: 'M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z',
    },
    {
        title: 'Custom Rendering',
        description: 'Supply a renderItem function to fully control the appearance of each item in the list.',
        icon: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5',
    },
    {
        title: 'Built-in Filtering',
        description: 'Pass a filter string to narrow items by label, and use the children slot to render a search input.',
        icon: 'M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z',
    },
    {
        title: 'Mobile Responsive',
        description: 'Adapts to mobile viewports with a full-width bottom sheet layout using the useMobile hook.',
        icon: 'M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3',
    },
    {
        title: 'Click Outside to Close',
        description: 'Clicking anywhere outside the popover automatically closes it via the useClickOutside hook.',
        icon: 'M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59',
    },
];

const PopoverPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Popover</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A floating panel anchored to a trigger element that displays a selectable list of items. Supports keyboard navigation,
                    grouped items, custom rendering, built-in filtering, and mobile-responsive layout.
                </p>
            </div>

            <section className="scroll-mt-8" id="basic-usage">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section className="scroll-mt-8" id="grouped-items">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Grouped Items</h2>
                <GroupedItems />
            </section>

            <section className="scroll-mt-8" id="controlled">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Controlled Open/Close</h2>
                <ControlledPopover />
            </section>

            <section className="scroll-mt-8" id="custom-content">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom Render Item</h2>
                <CustomContent />
            </section>

            <section className="scroll-mt-8" id="filterable">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Filterable Popover</h2>
                <FilterablePopover />
            </section>

            <section className="scroll-mt-8" id="import">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { Popover } from 'ether-ui';`} />
            </section>

            <section className="scroll-mt-8" id="api-reference">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>API Reference</h2>
                <PropsTable props={popoverProps} />
            </section>

            <section className="scroll-mt-8" id="features">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default PopoverPage;
