import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicSortable from './BasicSortable';
import ComplexItems from './ComplexItems';
import DragHandles from './DragHandles';
import MultipleLists from './MultipleLists';
import ScrollableLongList from './ScrollableLongList';
import SetupSection from './SetupSection';
import TypeBasedSortable from './TypeBasedSortable';

const sortableProps = {
    items: { type: 'T[]', required: true, description: 'Array of items to render' },
    accept: { type: 'string | string[]', description: 'Type(s) of external draggable items this sortable accepts' },
    itemType: { type: 'string', default: "'any'", description: 'Default item type for items within this sortable' },
    itemTypeProp: { type: 'string', description: 'Property name on items to get their type (for mixed item types)' },
    args: { type: 'any', description: 'Additional arguments passed to callbacks' },
    allowRemove: { type: 'boolean', default: 'false', description: 'Auto-remove items from source list on cross-container drop (default false — manage removal in destination onDrop)' },
    showPlaceholder: { type: 'boolean', default: 'false', description: 'Whether to show a placeholder drop zone at the end' },
    placeholder: { type: 'ReactNode', description: 'Custom placeholder content' },
    dropIndicator: {
        type: "'highlight' | 'line' | 'none'",
        default: "'line'",
        description: "Drop indicator style — 'line' shows an insertion line between items, 'highlight' glows the slot",
    },
    orientation: {
        type: "'vertical' | 'horizontal'",
        default: "'vertical'",
        description: 'Layout direction for items',
    },
    gap: {
        type: 'string',
        default: "'0.5rem'",
        description: 'Gap between items (any valid CSS length)',
    },
    as: { type: 'ElementType', default: "'div'", description: 'HTML tag name for the container element' },
    provideDropRef: { type: 'boolean', default: 'false', description: 'Pass drop ref to children render function' },
    provideDragRef: { type: 'boolean', default: 'false', description: 'Pass drag ref to children render function' },
    onChange: {
        type: '(items: T[], args?: any, event?: SortableChangeEvent) => void',
        required: true,
        description: 'Callback when items are reordered or changed',
    },
    onDrop: {
        type: '(source: DragItem, target: DropResult, args?: any) => void',
        description: 'Callback when an external item is dropped',
    },
    onRemove: {
        type: '(removed: { index: number; id?: string | number }, dropResult: DropResult | null) => void',
        description: 'Callback when an item is removed (dragged out)',
    },
    className: { type: 'string', description: 'Additional CSS classes' },
    children: {
        type: '(item: T, index: number, refs: { draggable?: DraggableRenderProps; droppable?: DroppableRenderProps }) => ReactNode',
        required: true,
        description: 'Render function for each item',
    },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'setup', title: 'Setup', description: 'Import and use' },
    { id: 'basic', title: 'Basic Sortable', description: 'Simple list reordering' },
    { id: 'complex-items', title: 'Complex Items', description: 'Task list with priority' },
    { id: 'multiple-lists', title: 'Multiple Lists', description: 'Kanban board' },
    { id: 'type-based', title: 'Type-Based', description: 'Accept specific types' },
    { id: 'drag-handles', title: 'Drag Handles', description: 'Custom drag handles' },
    { id: 'scrollable-long', title: 'Scrollable + Long List', description: '500 items with auto-scroll' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Reordering',
        description: 'Drag items within a list to reorder them with smooth visual feedback',
        icon: 'M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25',
    },
    {
        title: 'Multi-List Transfer',
        description: 'Move items between multiple Sortable lists for kanban-style boards',
        icon: 'M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z',
    },
    {
        title: 'Type Restrictions',
        description: 'Restrict which item types each Sortable accepts using itemType and accept props',
        icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z',
    },
    {
        title: 'Custom Drag Handles',
        description: 'Use provideDragRef to attach the drag ref to a specific handle element',
        icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15',
    },
    {
        title: 'Placeholder Drop Zone',
        description: 'Show a placeholder at the end of the list to indicate the drop target',
        icon: 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3',
    },
    {
        title: 'Render Props',
        description: 'Full access to dragging state for per-item visual feedback via render function',
        icon: 'M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z',
    },
    {
        title: 'Accessibility',
        description: 'Keyboard drag support and ARIA attributes for screen reader compatibility',
        icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
    },
    {
        title: 'Theming',
        description: 'Full dark/light + 5 brand themes via CSS variables — zero extra config',
        icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z',
    },
];

const SortablePage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Sortable
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A powerful sortable list component that combines dragging and dropping for easy reordering.
                </p>
            </div>

            <section id="setup" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Setup</h2>
                <SetupSection />
            </section>

            <section id="basic" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Basic Sortable List
                </h2>
                <BasicSortable />
            </section>

            <section id="complex-items" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Complex Items with Details
                </h2>
                <ComplexItems />
            </section>

            <section id="multiple-lists" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Multiple Sortable Lists
                </h2>
                <MultipleLists />
            </section>

            <section id="type-based" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Type-Based Drag & Drop Restrictions
                </h2>
                <TypeBasedSortable />
            </section>

            <section id="drag-handles" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Custom Drag Handles
                </h2>
                <DragHandles />
            </section>

            <section id="scrollable-long" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Scrollable Container + Long List
                </h2>
                <ScrollableLongList />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { Sortable } from 'fluxo-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={sortableProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default SortablePage;
