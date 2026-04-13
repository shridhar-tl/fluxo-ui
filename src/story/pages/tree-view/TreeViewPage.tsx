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
import CheckboxMode from './CheckboxMode';
import AsyncLoading from './AsyncLoading';
import DragDrop from './DragDrop';

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Standard tree with expand/collapse' },
    { id: 'checkbox-mode', title: 'Checkbox Mode', description: 'Tri-state checkbox selection' },
    { id: 'async-loading', title: 'Async Loading', description: 'Lazy-load children on expand' },
    { id: 'drag-drop', title: 'Drag & Drop', description: 'Reorder nodes via drag' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'node-props', title: 'TreeNode', description: 'Node data interface' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const treeViewProps = {
    nodes: { type: 'TreeNode[]', required: true, description: 'Array of tree node data.' },
    expandedKeys: { type: 'Set<string>', description: 'Controlled set of expanded node IDs.' },
    selectedKeys: { type: 'Set<string>', description: 'Controlled set of selected node IDs.' },
    checkedKeys: { type: 'Set<string>', description: 'Controlled set of checked node IDs.' },
    defaultExpandedKeys: { type: 'Set<string>', description: 'Initially expanded node IDs (uncontrolled).' },
    selectionMode: { type: "'single' | 'multiple' | 'none'", default: "'single'", description: 'Node selection behavior.' },
    checkboxes: { type: 'boolean', default: 'false', description: 'Show tri-state checkboxes on each node.' },
    draggable: { type: 'boolean', default: 'false', description: 'Enable drag-and-drop reordering.' },
    loadChildren: { type: '(node: TreeNode) => Promise<TreeNode[]>', description: 'Async function to load children on expand.' },
    onExpand: { type: '(keys: Set<string>, node: TreeNode) => void', description: 'Called when a node is expanded or collapsed.' },
    onSelect: { type: '(keys: Set<string>, node: TreeNode) => void', description: 'Called when a node is selected.' },
    onCheck: { type: '(keys: Set<string>, node: TreeNode) => void', description: 'Called when a node checkbox is toggled.' },
    onDragDrop: { type: '(info: DragDropInfo) => void', description: 'Called when a node is dropped after dragging.' },
    className: { type: 'string', description: 'Additional CSS class for the tree container.' },
    nodeTemplate: { type: '(node: TreeNode) => ReactNode', description: 'Custom render function for node content.' },
    filterText: { type: 'string', description: 'Filter string to show only matching nodes.' },
};

const nodeProps = {
    id: { type: 'string', required: true, description: 'Unique identifier for the node.' },
    label: { type: 'string', required: true, description: 'Display text for the node.' },
    icon: { type: 'ReactNode', description: 'Icon displayed next to the label.' },
    children: { type: 'TreeNode[]', description: 'Child nodes (makes this a branch node).' },
    isLeaf: { type: 'boolean', description: 'Mark as leaf to prevent expand toggle when no children.' },
    disabled: { type: 'boolean', description: 'Disable selection and checkbox for this node.' },
    data: { type: 'Record<string, unknown>', description: 'Custom data attached to the node.' },
};

const features: FeatureItem[] = [
    { title: 'Expand/Collapse', description: 'Click to expand or collapse branch nodes with smooth transitions.', icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15' },
    { title: 'Tri-State Checkboxes', description: 'Parent nodes auto-compute checked, unchecked, or indeterminate state.', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: 'Async Loading', description: 'Lazily load children via an async function when a node is first expanded.', icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99' },
    { title: 'Drag & Drop', description: 'Reorder nodes by dragging them before, inside, or after other nodes.', icon: 'M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5' },
    { title: 'Keyboard Navigation', description: 'Arrow keys, Home, and End for full keyboard accessibility.', icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12' },
    { title: 'Filter / Search', description: 'Pass filterText to show only matching nodes and their ancestors.', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' },
];

const TreeViewPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>TreeView</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A hierarchical tree component with expand/collapse, checkbox selection, async loading, drag-and-drop, and keyboard navigation.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="checkbox-mode" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Checkbox Mode</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Enable <code>checkboxes</code> to add tri-state checkboxes. Parent nodes automatically reflect partial or full selection.
                </p>
                <CheckboxMode />
            </section>

            <section id="async-loading" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Async Loading</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Provide a <code>loadChildren</code> function to lazily fetch child nodes when expanding a branch for the first time.
                </p>
                <AsyncLoading />
            </section>

            <section id="drag-drop" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Drag &amp; Drop</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Enable <code>draggable</code> to allow rearranging nodes via drag and drop.
                </p>
                <DragDrop />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { TreeView } from 'ether-ui';\nimport type { TreeNode, TreeViewProps, DragDropInfo } from 'ether-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>TreeView Props</h2>
                <PropsTable props={treeViewProps} />
            </section>

            <section id="node-props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>TreeNode Interface</h2>
                <PropsTable props={nodeProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default TreeViewPage;
