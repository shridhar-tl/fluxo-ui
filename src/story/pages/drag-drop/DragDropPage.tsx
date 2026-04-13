import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { FeatureGrid } from '../../FeatureCard';
import type { FeatureItem } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import SetupSection from './SetupSection';
import BasicDragDrop from './BasicDragDrop';
import MultiContainer from './MultiContainer';
import RenderProps from './RenderProps';
import TypeBasedDragDrop from './TypeBasedDragDrop';

const draggableProps = {
    containerId: {
        type: 'string',
        required: true,
        description: 'Unique identifier for the container this draggable belongs to',
    },
    index: {
        type: 'number',
        required: true,
        description: 'Index of the item in the container',
    },
    item: {
        type: 'any',
        required: true,
        description: 'The actual item data being dragged',
    },
    id: {
        type: 'string | number',
        description: 'Optional unique identifier for the item',
    },
    itemType: {
        type: 'string',
        default: "'any'",
        description: 'Type of the draggable item (used for drop validation)',
    },
    args: {
        type: 'any',
        description: 'Additional arguments to pass along with drag data',
    },
    canDrag: {
        type: 'boolean',
        default: 'true',
        description: 'Whether the item can be dragged',
    },
    onRemove: {
        type: '(source: { index: number; id?: string | number }, dropResult: DropResult | null) => void',
        description: 'Callback when item is removed from its original container',
    },
    onDragStart: {
        type: '(item: DragItem, monitor: DragSourceMonitor) => void',
        description: 'Callback when drag starts',
    },
    onDragEnd: {
        type: '(item: DragItem | undefined, monitor: DragSourceMonitor) => void',
        description: 'Callback when drag ends',
    },
    className: {
        type: 'string',
        description: 'Additional CSS classes',
    },
    children: {
        type: 'ReactNode | ((props: DraggableRenderProps) => ReactNode)',
        description: 'Children can be ReactNode or render prop function',
    },
};

const droppableProps = {
    containerId: {
        type: 'string',
        required: true,
        description: 'Unique identifier for the container',
    },
    index: {
        type: 'number',
        required: true,
        description: 'Index position within the container',
    },
    id: {
        type: 'string | number',
        description: 'Optional unique identifier',
    },
    accept: {
        type: 'string | string[]',
        default: "'any'",
        description: "Type(s) of draggable items this droppable accepts",
    },
    args: {
        type: 'any',
        description: 'Additional arguments to pass to drop handler',
    },
    canDrop: {
        type: 'boolean | ((item: DragItem, monitor: DropTargetMonitor) => boolean)',
        default: 'true',
        description: 'Whether dropping is currently allowed',
    },
    onDrop: {
        type: '(source: DragItem, target: DropResult) => void',
        description: 'Callback when an item is dropped',
    },
    onHover: {
        type: '(item: DragItem, monitor: DropTargetMonitor) => void',
        description: 'Callback when a draggable item hovers over this droppable',
    },
    className: {
        type: 'string',
        description: 'Additional CSS classes',
    },
    children: {
        type: 'ReactNode | ((props: DroppableRenderProps) => ReactNode)',
        description: 'Children can be ReactNode or render prop function',
    },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'setup', title: 'Setup', description: 'DragDropProvider setup' },
    { id: 'basic', title: 'Basic Drag & Drop', description: 'Simple drag and drop' },
    { id: 'multi-container', title: 'Multi-Container', description: 'Kanban-style board' },
    { id: 'render-props', title: 'Render Props', description: 'Custom styling' },
    { id: 'type-based', title: 'Type-Based', description: 'Drop type restrictions' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'draggable-props', title: 'Draggable Props', description: 'Draggable API' },
    { id: 'droppable-props', title: 'Droppable Props', description: 'Droppable API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Draggable', description: 'Wrap any element to make it draggable with full control over item type and drag callbacks', icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15' },
    { title: 'Droppable', description: 'Define drop zones that accept specific item types with hover and drop callbacks', icon: 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3' },
    { title: 'Type-Based Restrictions', description: 'Accept only specific item types per drop zone using the accept prop', icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z' },
    { title: 'Render Props', description: 'Access isDragging, isOver, canDrop, and ref callbacks via render prop pattern', icon: 'M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z' },
    { title: 'Multi-Container', description: 'Move items between multiple containers for kanban boards and category sorting', icon: 'M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z' },
    { title: 'onRemove Callback', description: 'Cleanly remove items from their source container when dropped elsewhere', icon: 'M6 18 18 6M6 6l12 12' },
    { title: 'Accessibility', description: 'Keyboard drag support and ARIA attributes for screen reader compatibility', icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z' },
    { title: 'Theming', description: 'Full dark/light + 5 brand themes via CSS variables — zero extra config', icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z' },
];

const DragDropPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Drag & Drop</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    Powerful drag and drop components built with react-dnd for creating interactive interfaces.
                </p>
            </div>

            <section id="setup" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Setup</h2>
                <SetupSection />
            </section>

            <section id="basic" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Drag & Drop</h2>
                <BasicDragDrop />
            </section>

            <section id="multi-container" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Multi-Container Drag & Drop</h2>
                <MultiContainer />
            </section>

            <section id="render-props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom Styling with Render Props</h2>
                <RenderProps />
            </section>

            <section id="type-based" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Type-Based Drag & Drop Restrictions</h2>
                <TypeBasedDragDrop />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock
                    code={`import { DragDropProvider, Draggable, Droppable } from 'ether-ui/dnd';`}
                />
            </section>

            <section id="draggable-props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Draggable Props</h2>
                <PropsTable props={draggableProps} />
            </section>

            <section id="droppable-props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Droppable Props</h2>
                <PropsTable props={droppableProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default DragDropPage;
