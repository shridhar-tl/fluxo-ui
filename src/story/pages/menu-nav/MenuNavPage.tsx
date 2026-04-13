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
import Horizontal from './Horizontal';
import SelectionStyles from './SelectionStyles';
import Sizes from './Sizes';
import NestedMenus from './NestedMenus';
import GroupedMenus from './GroupedMenus';
import Collapsible from './Collapsible';
import ToolbarMode from './ToolbarMode';
import CustomSlots from './CustomSlots';

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Simple vertical menu' },
    { id: 'horizontal', title: 'Horizontal', description: 'Horizontal menu with submenus' },
    { id: 'selection-styles', title: 'Selection Styles', description: 'Five visual selection styles' },
    { id: 'sizes', title: 'Sizes', description: 'All size options' },
    { id: 'nested-menus', title: 'Nested Menus', description: '3 levels of nested submenus' },
    { id: 'grouped-menus', title: 'Grouped Menus', description: 'Collapsible group sections' },
    { id: 'collapsible', title: 'Collapsible', description: 'Icon-only collapsed mode' },
    { id: 'toolbar-mode', title: 'Toolbar Mode', description: 'Application toolbar style' },
    { id: 'custom-slots', title: 'Custom Slots', description: 'Header, footer, and search' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const menuNavProps = {
    items: { type: '(MenuNavItem | MenuNavGroup)[]', required: true, description: 'Array of menu items or groups to render.' },
    orientation: { type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Layout orientation of the menu.' },
    size: { type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size of menu items.' },
    selectedId: { type: 'string', description: 'Controlled selected item ID.' },
    defaultSelectedId: { type: 'string', default: "''", description: 'Default selected item ID for uncontrolled usage.' },
    onSelect: { type: '(id: string, item: MenuNavItem) => void', description: 'Callback when a menu item is selected.' },
    selectionStyle: { type: "'border-left' | 'border-bottom' | 'background' | 'arrow' | 'highlight'", default: "'border-left'", description: 'Visual style for the selected item indicator.' },
    iconPosition: { type: "'left' | 'right'", default: "'left'", description: 'Position of icons relative to label text.' },
    collapsed: { type: 'boolean', description: 'Controlled collapsed state (icon-only mode).' },
    collapsible: { type: 'boolean', default: 'false', description: 'Whether the menu can be collapsed to icon-only mode.' },
    onCollapsedChange: { type: '(collapsed: boolean) => void', description: 'Callback when collapsed state changes.' },
    mobileBreakpoint: { type: 'number', default: '768', description: 'Viewport width below which mobile mode activates.' },
    mobileFullScreen: { type: 'boolean', default: 'true', description: 'Whether mobile menu takes full screen.' },
    showSearch: { type: 'boolean', default: 'false', description: 'Show a search input to filter menu items.' },
    searchPlaceholder: { type: 'string', default: "'Search...'", description: 'Placeholder text for the search input.' },
    headerSlot: { type: 'ReactNode', description: 'Custom content rendered above the menu.' },
    footerSlot: { type: 'ReactNode', description: 'Custom content rendered below the menu.' },
    maxSubMenuDepth: { type: 'number', default: '3', description: 'Maximum depth of nested submenus.' },
    toolbar: { type: 'boolean', default: 'false', description: 'Enable toolbar mode (horizontal with border-bottom selection).' },
    className: { type: 'string', description: 'Additional CSS class for the nav element.' },
    ariaLabel: { type: 'string', default: "'Navigation'", description: 'ARIA label for the nav element.' },
};

const features: FeatureItem[] = [
    { title: 'Dual Orientation', description: 'Vertical sidebar or horizontal navbar layout with automatic style adjustments.', icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15' },
    { title: 'Nested Submenus', description: 'Supports up to 3 levels of nested submenus with expand/collapse.', icon: 'M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm0 5.25h.007v.008H3.75V12zm0 5.25h.007v.008H3.75v-.008z' },
    { title: 'Selection Styles', description: 'Five distinct visual styles for highlighting the active menu item.', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: 'Collapsible Sidebar', description: 'Toggle between full menu and compact icon-only mode.', icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5' },
    { title: 'Grouped Items', description: 'Organize items into collapsible groups with section headers.', icon: 'M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM2.25 16.125c0-.621.504-1.125 1.125-1.125h6c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-2.25z' },
    { title: 'Mobile Responsive', description: 'Automatic mobile mode with fullscreen overlay and drill-down navigation.', icon: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3' },
];

const MenuNavPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>MenuNav</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A versatile navigation menu component supporting vertical sidebars, horizontal navbars, nested submenus, collapsible groups, and toolbar mode.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="horizontal" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Horizontal</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Set <code>orientation="horizontal"</code> for a top navigation bar with dropdown submenus.
                </p>
                <Horizontal />
            </section>

            <section id="selection-styles" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Selection Styles</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use <code>selectionStyle</code> to change how the active item is visually indicated.
                </p>
                <SelectionStyles />
            </section>

            <section id="sizes" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Sizes</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    The <code>size</code> prop controls the overall scale of menu items.
                </p>
                <Sizes />
            </section>

            <section id="nested-menus" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Nested Menus</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Items can have <code>children</code> arrays for multi-level navigation, controlled by <code>maxSubMenuDepth</code>.
                </p>
                <NestedMenus />
            </section>

            <section id="grouped-menus" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Grouped Menus</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use <code>MenuNavGroup</code> objects to organize items into labeled, collapsible sections.
                </p>
                <GroupedMenus />
            </section>

            <section id="collapsible" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Collapsible</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Enable <code>collapsible</code> to allow toggling between full and icon-only mode.
                </p>
                <Collapsible />
            </section>

            <section id="toolbar-mode" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Toolbar Mode</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Set <code>toolbar</code> for an application-style menu bar with dropdown items.
                </p>
                <ToolbarMode />
            </section>

            <section id="custom-slots" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom Slots</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use <code>headerSlot</code>, <code>footerSlot</code>, and <code>showSearch</code> to add custom content around the menu.
                </p>
                <CustomSlots />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { MenuNav } from 'ether-ui';\nimport type { MenuNavProps, MenuNavItem, MenuNavGroup, MenuNavSize, MenuNavSelectionStyle } from 'ether-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={menuNavProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default MenuNavPage;
