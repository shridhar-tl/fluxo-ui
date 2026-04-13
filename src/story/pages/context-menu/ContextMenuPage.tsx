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
import RightClickMenu from './RightClickMenu';
import ButtonTriggered from './ButtonTriggered';
import ScrollableMenu from './ScrollableMenu';
import NestedSubmenus from './NestedSubmenus';
import TableRowMenu from './TableRowMenu';

const contextMenuManagerProps = {
    'No props required': {
        type: '—',
        description: 'ContextMenuManager is a singleton. Mount it once at the app root; it manages all context menu state internally.',
    },
};

const showContextMenuProps = {
    event: {
        type: 'React.MouseEvent',
        required: true,
        description: 'The mouse event from onContextMenu or onClick. Used to position the menu.',
    },
    menus: {
        type: 'MenuItem[]',
        required: true,
        description: 'Array of menu items to display.',
    },
    options: {
        type: 'ContextMenuOptions',
        description: 'Optional configuration — currently supports placement (PlacementCorners).',
    },
};

const menuItemProps = {
    label: {
        type: 'string',
        description: 'Text shown for the menu item.',
    },
    icon: {
        type: 'ReactNode',
        description: 'Optional icon placed before the label.',
    },
    command: {
        type: '(id?: any) => void',
        description: 'Callback invoked when the item is clicked.',
    },
    seperator: {
        type: 'boolean',
        description: 'When true, renders a visual divider instead of a clickable item.',
    },
    items: {
        type: 'MenuItemBase[]',
        description: 'Nested sub-menu items (one level deep).',
    },
    id: {
        type: 'any',
        description: 'Optional identifier passed to the command callback.',
    },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'setup', title: 'Setup', description: 'Mount ContextMenuManager' },
    { id: 'right-click-menu', title: 'Right-click Menu', description: 'Context menu on right-click' },
    { id: 'button-triggered', title: 'Button-triggered', description: 'Open via button click' },
    { id: 'scrollable-menu', title: 'Scrollable Menu', description: 'Many items with scroll' },
    { id: 'nested-submenus', title: 'Nested Sub-menus', description: 'One level of sub-menus' },
    { id: 'table-row-menu', title: 'Table Row Menu', description: 'Per-row context actions' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'api-reference', title: 'API Reference', description: 'Props and options' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Global Manager Pattern', description: 'Mount ContextMenuManager once at the app root and call showContextMenu() from any event handler — no prop drilling required.', icon: 'M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3.284 14.253A8.959 8.959 0 0 1 3 12c0-1.306.278-2.546.777-3.668' },
    { title: 'Right-click & Click Trigger', description: 'Attach to onContextMenu for classic right-click behavior or to onClick for button-triggered dropdown-style menus.', icon: 'M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59' },
    { title: 'Nested Sub-menus', description: 'Define items with an items array for one level of nested sub-menus that expand on hover — ideal for export or action groupings.', icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z' },
    { title: 'Scrollable Long Menus', description: 'Menus with many items automatically become scrollable with hover-triggered arrow controls — no scrollbar clutter.', icon: 'M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5' },
    { title: 'Separators', description: 'Add visual dividers between menu groups by including an item with seperator: true to logically organize actions.', icon: 'M3.75 9h16.5m-16.5 6.75h16.5' },
    { title: 'Icon Support', description: 'Each menu item supports an icon prop that accepts any ReactNode — use any icon component or custom SVG element.', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z' },
    { title: 'Smart Viewport Positioning', description: 'The menu automatically repositions itself to stay within the viewport bounds regardless of where the right-click occurs.', icon: 'M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z' },
    { title: 'Theming', description: 'Full dark/light mode and all 5 brand themes supported automatically via CSS custom properties.', icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z' },
];

const ContextMenuPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Context Menu</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A positioned floating menu triggered by right-click or button click. Mount{' '}
                    <code className="text-blue-400">&lt;ContextMenuManager /&gt;</code> once at your app root, then call{' '}
                    <code className="text-blue-400">showContextMenu()</code> from any event handler.
                </p>
            </div>

            <section className="scroll-mt-8" id="setup">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Setup</h2>
                <SetupSection />
            </section>

            <section className="scroll-mt-8" id="right-click-menu">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Right-click Context Menu</h2>
                <RightClickMenu />
            </section>

            <section className="scroll-mt-8" id="button-triggered">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Button-triggered Menu</h2>
                <ButtonTriggered />
            </section>

            <section className="scroll-mt-8" id="scrollable-menu">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Many Items with Scroll</h2>
                <ScrollableMenu />
            </section>

            <section className="scroll-mt-8" id="nested-submenus">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Nested Sub-menus</h2>
                <NestedSubmenus />
            </section>

            <section className="scroll-mt-8" id="table-row-menu">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Table Row Context Menu</h2>
                <TableRowMenu />
            </section>

            <section className="scroll-mt-8" id="import">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { ContextMenuManager, showContextMenu } from 'ether-ui';`} />
            </section>

            <section className="scroll-mt-8" id="api-reference">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>API Reference</h2>
                <h3 className={cn('text-lg font-semibold mb-3', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>ContextMenuManager</h3>
                <PropsTable props={contextMenuManagerProps} />
                <h3 className={cn('text-lg font-semibold mt-6 mb-3', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>showContextMenu(event, menus, options?)</h3>
                <PropsTable props={showContextMenuProps} />
                <h3 className={cn('text-lg font-semibold mt-6 mb-3', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>MenuItem</h3>
                <PropsTable props={menuItemProps} />
            </section>

            <section className="scroll-mt-8" id="features">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default ContextMenuPage;
