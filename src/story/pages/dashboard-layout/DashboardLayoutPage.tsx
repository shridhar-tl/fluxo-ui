import cn from 'classnames';
import React from 'react';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicUsage from './BasicUsage';
import HeaderActions from './HeaderActions';
import Persistence from './Persistence';
import Presets from './Presets';
import WidgetVariants from './WidgetVariants';
import WithSettings from './WithSettings';

import _DashboardLayout_props_json from './../../../components/dashboard-layout/DashboardLayout.props.json';
const { dashboardLayoutProps, dashboardWidgetProps } = _DashboardLayout_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Grid-based, breakpoint-aware dashboard' },
    { id: 'basic-usage', title: 'Basic Usage', description: 'Drag, resize, show/hide, maximize' },
    { id: 'persistence', title: 'Persistence', description: 'localStorage save/restore' },
    { id: 'presets', title: 'Layout Presets', description: 'Named view switches' },
    { id: 'variants', title: 'Widget Variants', description: 'Chrome, badges, errors' },
    { id: 'header-actions', title: 'Custom Header Controls', description: 'Inject filter toggles, dropdowns, buttons into the widget header' },
    { id: 'settings', title: 'Refresh & Settings', description: 'Per-widget refresh and settings popover' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'DashboardLayout API reference' },
    { id: 'widget-props', title: 'Widget Props', description: 'DashboardWidget API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Drag to Rearrange',
        description: 'Pick up any widget by its header in edit mode and drop it anywhere on the grid.',
        icon: 'M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    },
    {
        title: 'Resize Handles',
        description: 'Drag the corners to resize each widget. Uses the same Resizable primitive shipped in fluxo-ui.',
        icon: 'M8 5H2v14h6V5zm2 0v14h12V5H10z',
    },
    {
        title: 'Per-breakpoint Layouts',
        description: 'Separate layouts for lg/md/sm/xs. Auto-inherits and scales when a breakpoint has no explicit layout.',
        icon: 'M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z',
    },
    {
        title: 'Show / Hide Widgets',
        description: 'Toolbar opens an "Add Widget" panel listing all hidden widgets. Re-add any one with a single click.',
        icon: 'M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5C21.3 7.6 17 4.5 12 4.5z',
    },
    {
        title: 'Maximize / Collapse',
        description: 'Maximize any widget to fill the dashboard for focused viewing, or collapse it to just the header. Collapsed widgets compact vertically so the row below floats up.',
        icon: 'M3 3h18v18H3z',
    },
    {
        title: 'Custom Header Controls',
        description: 'Inject filter toggles, dropdowns, export buttons, share links, anything via headerActions — pointer events inside don’t start a drag.',
        icon: 'M4 6h16v2H4zm0 5h10v2H4zm0 5h16v2H4z',
    },
    {
        title: 'Per-widget Settings',
        description: 'Render a settings popover via renderSettings(ctx). Built-in close + Escape + scroll/resize tracking.',
        icon: 'M19.4 13a7.1 7.1 0 0 0 0-2l2-1.5-2-3.5-2.4 1a7.1 7.1 0 0 0-1.7-1L15 3h-4l-.3 2a7.1 7.1 0 0 0-1.7 1l-2.4-1-2 3.5L6.6 11a7.1 7.1 0 0 0 0 2L4.6 14.5l2 3.5 2.4-1a7.1 7.1 0 0 0 1.7 1L11 21h4l.3-2c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.5z',
    },
    {
        title: 'Refresh + Loading',
        description: 'onRefresh returns a Promise — the icon spins until it resolves. Loading prop forces the overlay.',
        icon: 'M17.65 6.35a8 8 0 1 0 2.05 8.5h-2.1A6 6 0 1 1 12 6v3l4-4-4-4z',
    },
    {
        title: 'Presets',
        description: 'Named layout/visibility presets in the toolbar — "Sales focus", "Operations", etc.',
        icon: 'M3 5h18v2H3zm0 6h12v2H3zm0 6h18v2H3z',
    },
    {
        title: 'Reset & Persistence',
        description: 'Pass persistKey for automatic localStorage save/restore. Toolbar Reset returns to defaults.',
        icon: 'M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4z',
    },
    {
        title: 'Keyboard Rearrangement',
        description: 'In edit mode, focus a widget header and use arrow keys to move it on the grid.',
        icon: 'M6 2v8h12V2M6 14v8h12v-8',
    },
    {
        title: 'Chrome Variants',
        description: 'card / borderless / sunken / plain — pick what matches your dashboard aesthetic.',
        icon: 'M4 4h6v6H4zm10 0h6v6h-6zm0 10h6v6h-6zM4 14h6v6H4z',
    },
    {
        title: 'Themed & Dark Mode',
        description: 'Everything uses --eui-* tokens — flips automatically across all 12 brand themes and dark mode.',
        icon: 'M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z',
    },
];

const importCode = `import { DashboardLayout } from 'fluxo-ui';
import type {
  DashboardWidget,
  DashboardLayouts,
  DashboardLayoutPreset,
  DashboardLayoutState,
} from 'fluxo-ui';`;

const DashboardLayoutPage: React.FC = () => {
    const { isDark } = useStoryTheme();
    const h2 = cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark });
    const desc = cn('text-sm mb-4', { 'text-gray-400': isDark, 'text-gray-500': !isDark });

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Dashboard Layout
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A grid-based dashboard engine. Drag widgets to rearrange, drag the corners to resize, hide / show
                    widgets from a built-in panel, save per-breakpoint layouts to localStorage, define named presets,
                    expose per-widget refresh and settings — all themed and dark-mode ready.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={h2}>Basic Usage</h2>
                <p className={desc}>
                    Provide widgets + per-breakpoint defaultLayouts. Toggle <code className="font-mono">Edit layout</code> in
                    the toolbar to enable drag and resize.
                </p>
                <BasicUsage />
            </section>

            <section id="persistence" className="scroll-mt-8">
                <h2 className={h2}>LocalStorage Persistence</h2>
                <p className={desc}>
                    Pass a <code className="font-mono">persistKey</code> and the full state — layouts, hidden ids,
                    collapsed ids, maximized id, active preset — is saved automatically.
                </p>
                <Persistence />
            </section>

            <section id="presets" className="scroll-mt-8">
                <h2 className={h2}>Layout Presets</h2>
                <p className={desc}>
                    Define named layout/visibility presets and the toolbar exposes a dropdown for switching between them.
                </p>
                <Presets />
            </section>

            <section id="variants" className="scroll-mt-8">
                <h2 className={h2}>Widget Chrome & States</h2>
                <p className={desc}>
                    Pick a visual chrome per widget; surface badges and error states declaratively.
                </p>
                <WidgetVariants />
            </section>

            <section id="header-actions" className="scroll-mt-8">
                <h2 className={h2}>Custom Header Controls</h2>
                <p className={desc}>
                    Pass any React node to <code className="font-mono">headerActions</code> — filter toggles, dropdowns,
                    export buttons, share links, anything. Pointer events inside the slot don't initiate drag.
                    Wrap your controls in elements with class <code className="font-mono">eui-dashboard-widget-action</code> to
                    inherit the built-in icon-button styling.
                </p>
                <HeaderActions />
            </section>

            <section id="settings" className="scroll-mt-8">
                <h2 className={h2}>Refresh & Settings</h2>
                <p className={desc}>
                    Hand a widget an <code className="font-mono">onRefresh</code> Promise to enable a spinning refresh icon,
                    and a <code className="font-mono">renderSettings</code> render-prop to expose a settings popover.
                </p>
                <WithSettings />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={h2}>Import</h2>
                <pre className={cn('text-sm font-mono rounded-lg p-4', { 'bg-gray-800 text-gray-100': isDark, 'bg-gray-100 text-gray-800': !isDark })}>
                    {importCode}
                </pre>
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={h2}>DashboardLayout Props</h2>
                <PropsTable props={dashboardLayoutProps} />
            </section>

            <section id="widget-props" className="scroll-mt-8">
                <h2 className={h2}>DashboardWidget Props</h2>
                <PropsTable props={dashboardWidgetProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={h2}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default DashboardLayoutPage;
