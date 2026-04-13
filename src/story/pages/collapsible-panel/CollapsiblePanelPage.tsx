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
import Variants from './Variants';
import Sizes from './Sizes';
import IconPositions from './IconPositions';
import WithIcons from './WithIcons';
import AccordionGroup from './AccordionGroup';
import MultiOpenGroup from './MultiOpenGroup';
import HeaderActions from './HeaderActions';
import DisabledState from './DisabledState';
import Controlled from './Controlled';
import CustomHeaderTemplate from './CustomHeaderTemplate';
import HorizontalTabs from './HorizontalTabs';
import HorizontalTabsVariants from './HorizontalTabsVariants';

const panelProps = {
    title: {
        type: 'React.ReactNode',
        required: true,
        description: 'Header text or element displayed in the panel header.',
    },
    children: {
        type: 'React.ReactNode',
        required: true,
        description: 'Content rendered inside the collapsible body.',
    },
    subtitle: {
        type: 'React.ReactNode',
        description: 'Secondary text rendered below the title in the header.',
    },
    icon: {
        type: 'React.ReactNode',
        description: 'Icon element rendered before the title in the header.',
    },
    variant: {
        type: "'default' | 'bordered' | 'elevated' | 'ghost' | 'separated'",
        default: "'default'",
        description: 'Visual style of the panel. Group-level variant is used as fallback.',
    },
    size: {
        type: "'sm' | 'md' | 'lg'",
        default: "'md'",
        description: 'Controls header padding, font size, and indicator icon size.',
    },
    iconPosition: {
        type: "'start' | 'end'",
        default: "'end'",
        description: 'Position of the toggle chevron — before or after the title.',
    },
    expandIcon: {
        type: 'React.ReactNode',
        description: 'Custom icon shown when the panel is collapsed.',
    },
    collapseIcon: {
        type: 'React.ReactNode',
        description: 'Custom icon shown when the panel is expanded. Falls back to expandIcon.',
    },
    defaultOpen: {
        type: 'boolean',
        default: 'false',
        description: 'Whether the panel starts open (uncontrolled mode).',
    },
    open: {
        type: 'boolean',
        description: 'Controlled open state. When set, the component is fully controlled.',
    },
    onToggle: {
        type: '(open: boolean) => void',
        description: 'Called when the user toggles the panel. Receives the new open state.',
    },
    disabled: {
        type: 'boolean',
        default: 'false',
        description: 'Prevents toggling. Header shows not-allowed cursor and hover is suppressed.',
    },
    headerActions: {
        type: 'React.ReactNode',
        description: 'Interactive elements placed at the end of the header. Click events do not propagate.',
    },
    headerTemplate: {
        type: '(props: { isOpen, toggle }) => ReactNode',
        description: 'Fully custom header renderer. When set, title/subtitle/icon/indicator are ignored.',
    },
    lazy: {
        type: 'boolean',
        default: 'false',
        description: 'Defers rendering content until the panel is first opened.',
    },
    destroyOnCollapse: {
        type: 'boolean',
        default: 'false',
        description: 'Unmounts content from the DOM when the panel is collapsed.',
    },
    className: { type: 'string', description: 'Additional CSS classes for the root element.' },
    headerClassName: { type: 'string', description: 'Additional CSS classes for the header element.' },
    contentClassName: { type: 'string', description: 'Additional CSS classes for the content wrapper.' },
    style: { type: 'React.CSSProperties', description: 'Inline styles for the root element.' },
    id: { type: 'string', description: 'Element ID. Also used as the group key in CollapsiblePanelGroup.' },
};

const groupProps = {
    children: {
        type: 'React.ReactNode',
        required: true,
        description: 'CollapsiblePanel children to manage.',
    },
    accordion: {
        type: 'boolean',
        default: 'false',
        description: 'When true, only one panel can be open at a time.',
    },
    defaultOpenKeys: {
        type: 'string[]',
        default: '[]',
        description: 'Array of panel IDs that start open.',
    },
    variant: {
        type: "'default' | 'bordered' | 'elevated' | 'ghost' | 'separated'",
        default: "'default'",
        description: 'Default variant for all child panels.',
    },
    size: {
        type: "'sm' | 'md' | 'lg'",
        default: "'md'",
        description: 'Default size for all child panels.',
    },
    iconPosition: {
        type: "'start' | 'end'",
        default: "'end'",
        description: 'Default icon position for all child panels.',
    },
    gap: {
        type: 'number',
        description: 'Gap in pixels between panels.',
    },
    onChange: {
        type: '(openKeys: string[]) => void',
        description: 'Called when the set of open panels changes.',
    },
    className: { type: 'string', description: 'Additional CSS classes for the group container.' },
    style: { type: 'React.CSSProperties', description: 'Inline styles for the group container.' },
};

const tabsProps = {
    tabs: {
        type: 'CollapsibleTabItem[]',
        required: true,
        description: 'Array of tab objects with id, label, isOpen, and render function.',
    },
    height: {
        type: 'number | string',
        description: 'Minimum height of the tabs container.',
    },
    minOpenTabs: {
        type: 'number',
        default: '1',
        description: 'Minimum number of tabs that must stay open at any time.',
    },
    variant: {
        type: "'default' | 'bordered' | 'elevated'",
        default: "'default'",
        description: 'Visual style variant for the tabs layout.',
    },
    onTabToggle: {
        type: '(tabId: string, isOpen: boolean) => void',
        description: 'Called when a tab is toggled.',
    },
    className: { type: 'string', description: 'Additional CSS classes for the container.' },
    style: { type: 'React.CSSProperties', description: 'Inline styles for the container.' },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic', title: 'Basic Usage', description: 'Simple expand/collapse' },
    { id: 'variants', title: 'Variants', description: '5 visual styles' },
    { id: 'sizes', title: 'Sizes', description: 'sm, md, lg' },
    { id: 'icon-positions', title: 'Icon Positions', description: 'Start or end' },
    { id: 'with-icons', title: 'With Icons', description: 'Custom header icons' },
    { id: 'accordion', title: 'Accordion Group', description: 'Single-open mode' },
    { id: 'multi-open', title: 'Multi-Open Group', description: 'Multiple panels open' },
    { id: 'header-actions', title: 'Header Actions', description: 'Buttons in the header' },
    { id: 'disabled', title: 'Disabled State', description: 'Non-interactive panels' },
    { id: 'controlled', title: 'Controlled Mode', description: 'External state control' },
    { id: 'custom-header', title: 'Custom Header', description: 'Full header template' },
    { id: 'horizontal-tabs', title: 'Horizontal Tabs', description: 'Side-by-side layout' },
    { id: 'horizontal-variants', title: 'Horizontal Variants', description: 'Tab style variants' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'panel-props', title: 'Panel Props', description: 'CollapsiblePanel API' },
    { id: 'group-props', title: 'Group Props', description: 'CollapsiblePanelGroup API' },
    { id: 'tabs-props', title: 'Tabs Props', description: 'CollapsibleTabs API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: '5 Variants', description: 'default, bordered, elevated, ghost, and separated visual styles', icon: 'M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42' },
    { title: '3 Sizes', description: 'Small, medium, and large with proportional scaling of padding and fonts', icon: 'M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25' },
    { title: 'Accordion Mode', description: 'Group panels with single-open or multi-open behavior', icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5' },
    { title: 'ADA Accessible', description: 'Full ARIA attributes, keyboard navigation, and prefers-reduced-motion support', icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z' },
    { title: 'Smooth Animations', description: 'CSS Grid-based height animation with cubic-bezier easing for fluid transitions', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
    { title: 'Custom Headers', description: 'Full header template support for completely custom header rendering', icon: 'M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.653-4.657m5.014-2.024a4.202 4.202 0 0 0 3.784 1.483l.037-.004a4.2 4.2 0 0 0 3.484-3.755l-.006.036a4.202 4.202 0 0 0-1.483-3.784' },
    { title: 'Horizontal Tabs', description: 'Side-by-side collapsible panels with rotated labels — IDE-style split panes', icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15' },
    { title: 'Theming', description: 'Full dark/light mode and all brand themes via CSS variables — zero extra config', icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z' },
];

const CollapsiblePanelPage: React.FC = () => {
    const { isDark } = useStoryTheme();
    const h2 = cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark });
    const desc = cn('text-sm mb-4', { 'text-gray-400': isDark, 'text-gray-500': !isDark });

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Collapsible Panel
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    Expandable and collapsible content sections with smooth animations, multiple variants, accordion
                    group behavior, and a horizontal tabs layout for side-by-side split panes.
                </p>
            </div>

            <section id="basic" className="scroll-mt-8">
                <h2 className={h2}>Basic Usage</h2>
                <p className={desc}>
                    Individual panels expand and collapse with a smooth CSS Grid height animation. Each panel manages its own state
                    or can be externally controlled.
                </p>
                <BasicUsage />
            </section>

            <section id="variants" className="scroll-mt-8">
                <h2 className={h2}>Variants</h2>
                <p className={desc}>
                    Five visual styles to match different UI contexts — from subtle defaults to prominent elevated shadows.
                </p>
                <Variants />
            </section>

            <section id="sizes" className="scroll-mt-8">
                <h2 className={h2}>Sizes</h2>
                <p className={desc}>
                    Three size presets control header padding, font size, and indicator dimensions.
                </p>
                <Sizes />
            </section>

            <section id="icon-positions" className="scroll-mt-8">
                <h2 className={h2}>Icon Positions</h2>
                <p className={desc}>
                    Place the toggle chevron at the start or end of the header.
                </p>
                <IconPositions />
            </section>

            <section id="with-icons" className="scroll-mt-8">
                <h2 className={h2}>With Icons</h2>
                <p className={desc}>
                    Add a leading icon to visually categorize panel content — settings, security, notifications, etc.
                </p>
                <WithIcons />
            </section>

            <section id="accordion" className="scroll-mt-8">
                <h2 className={h2}>Accordion Group</h2>
                <p className={desc}>
                    Wrap panels in a <code className="font-mono">CollapsiblePanelGroup</code> with
                    <code className="font-mono"> accordion</code> to ensure only one panel is open at a time.
                </p>
                <AccordionGroup />
            </section>

            <section id="multi-open" className="scroll-mt-8">
                <h2 className={h2}>Multi-Open Group</h2>
                <p className={desc}>
                    Without the <code className="font-mono">accordion</code> prop, any number of panels can be open simultaneously.
                    The group still provides shared variant and size defaults.
                </p>
                <MultiOpenGroup />
            </section>

            <section id="header-actions" className="scroll-mt-8">
                <h2 className={h2}>Header Actions</h2>
                <p className={desc}>
                    Place interactive elements (buttons, badges) at the trailing edge of the header. Click events are
                    isolated — they do not toggle the panel.
                </p>
                <HeaderActions />
            </section>

            <section id="disabled" className="scroll-mt-8">
                <h2 className={h2}>Disabled State</h2>
                <p className={desc}>
                    Disabled panels cannot be toggled. The header shows a not-allowed cursor and reduced opacity.
                </p>
                <DisabledState />
            </section>

            <section id="controlled" className="scroll-mt-8">
                <h2 className={h2}>Controlled Mode</h2>
                <p className={desc}>
                    Use <code className="font-mono">open</code> and <code className="font-mono">onToggle</code> for
                    full external control over the panel state.
                </p>
                <Controlled />
            </section>

            <section id="custom-header" className="scroll-mt-8">
                <h2 className={h2}>Custom Header Template</h2>
                <p className={desc}>
                    The <code className="font-mono">headerTemplate</code> prop gives you complete control over
                    header rendering with access to <code className="font-mono">isOpen</code> and <code className="font-mono">toggle</code>.
                </p>
                <CustomHeaderTemplate />
            </section>

            <section id="horizontal-tabs" className="scroll-mt-8">
                <h2 className={h2}>Horizontal Collapsible Tabs</h2>
                <p className={desc}>
                    Side-by-side collapsible panels that show rotated labels when collapsed. On mobile they stack
                    vertically. At least one tab stays open (configurable via <code className="font-mono">minOpenTabs</code>).
                </p>
                <HorizontalTabs />
            </section>

            <section id="horizontal-variants" className="scroll-mt-8">
                <h2 className={h2}>Horizontal Tabs Variants</h2>
                <p className={desc}>
                    The horizontal tabs layout supports default, bordered, and elevated visual styles.
                </p>
                <HorizontalTabsVariants />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={h2}>Import</h2>
                <CodeBlock code={`import { CollapsiblePanel, CollapsiblePanelGroup, CollapsibleTabs } from 'ether-ui';`} />
            </section>

            <section id="panel-props" className="scroll-mt-8">
                <h2 className={h2}>CollapsiblePanel Props</h2>
                <PropsTable props={panelProps} />
            </section>

            <section id="group-props" className="scroll-mt-8">
                <h2 className={h2}>CollapsiblePanelGroup Props</h2>
                <PropsTable props={groupProps} />
            </section>

            <section id="tabs-props" className="scroll-mt-8">
                <h2 className={h2}>CollapsibleTabs Props</h2>
                <PropsTable props={tabsProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default CollapsiblePanelPage;
