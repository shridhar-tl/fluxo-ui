import cn from 'classnames';
import React from 'react';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicUsage from './BasicUsage';
import { FloatingPanels } from './FloatingPanels';
import { LayoutPersistence } from './LayoutPersistence';
import { TabModes } from './TabModes';

import _DockedLayout_props_json from './../../../components/docked-layout/DockedLayout.props.json';
const { dockedLayoutProps, panelConfigProps } = _DockedLayout_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Introduction and feature highlights' },
    { id: 'basic-usage', title: 'Basic Usage', description: 'Left, right, and bottom panels' },
    { id: 'tab-modes', title: 'Tab Modes', description: 'icon vs icon-label activity bar' },
    { id: 'floating', title: 'Floating Panels', description: 'Freely positioned draggable panels' },
    { id: 'persistence', title: 'Layout Persistence', description: 'Save and restore layout state' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'DockedLayout API reference' },
    { id: 'panel-config', title: 'Panel Config', description: 'PanelConfig API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Multi-position Docking',
        description: 'Dock panels to left, right, bottom, or let them float freely. Each panel is independently positioned.',
        icon: 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z',
    },
    {
        title: 'Pin / Auto-Hide',
        description: 'Toggle between pinned (always visible, takes layout space) and auto-hide (expands on demand as an overlay).',
        icon: 'M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z',
    },
    {
        title: 'Drag to Re-dock',
        description: 'Drag any panel header to re-dock it to a different edge or float it. Drop zones highlight during drag.',
        icon: 'M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    },
    {
        title: 'Tabbed Dock Regions',
        description: 'Multiple panels in the same dock position form a tabbed group. Click activity bar icons to switch.',
        icon: 'M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z',
    },
    {
        title: 'Resizable Panels',
        description: 'Drag the splitter between any pinned panel and center content. Min/max size constraints are respected.',
        icon: 'M8 5H2v14h6V5zm2 0v14h12V5H10z',
    },
    {
        title: 'Floating Panels',
        description: 'Detach any panel to float freely. Floating panels are draggable by header and resizable from the corner.',
        icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z',
    },
    {
        title: 'Layout State Persistence',
        description: 'onChange fires on every layout change. Restore any saved state by passing it back via layoutState.',
        icon: 'M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4z',
    },
    {
        title: 'Tab Modes',
        description: "Choose between 'icon' (compact) and 'icon-label' modes for the activity bar.",
        icon: 'M5 4v3H0v2h5v3l4-4zm7 0v3h8v2h-8v3l-4-4z',
    },
];



const importCode = `import { DockedLayout } from 'fluxo-ui';
import type { DockedLayoutState, PanelConfig, TabMode } from 'fluxo-ui';`;

export const DockedLayoutPage: React.FC = () => {
    const { isDark } = useStoryTheme();
    const h2 = cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark });
    const desc = cn('text-sm mb-4', { 'text-gray-400': isDark, 'text-gray-500': !isDark });

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Docked Layout
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A VS Code-style panel layout engine. Dock panels to left, right, or bottom edges. Toggle between pinned and
                    auto-hide. Drag headers to re-dock. Float panels freely with full layout state persistence.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={h2}>Basic Usage</h2>
                <p className={desc}>
                    Left, right, and bottom panels. The "Filters" panel starts as auto-hide — click its icon to reveal it.
                    Drag panel headers to re-dock. Click the pin button to toggle between pinned and auto-hide.
                </p>
                <BasicUsage />
            </section>

            <section id="tab-modes" className="scroll-mt-8">
                <h2 className={h2}>Tab Modes</h2>
                <p className={desc}>
                    Switch between <code className="font-mono">'icon'</code> (compact icon-only tabs) and{' '}
                    <code className="font-mono">'icon-label'</code> (icon with label text) via the <code className="font-mono">tabMode</code> prop.
                </p>
                <TabModes />
            </section>

            <section id="floating" className="scroll-mt-8">
                <h2 className={h2}>Floating Panels</h2>
                <p className={desc}>
                    Panels with <code className="font-mono">defaultPosition='float'</code> are freely positioned. Drag the header to
                    move them. Resize from the bottom-right corner. Use dock buttons to attach to a side.
                </p>
                <FloatingPanels />
            </section>

            <section id="persistence" className="scroll-mt-8">
                <h2 className={h2}>Layout Persistence</h2>
                <p className={desc}>
                    The <code className="font-mono">onChange</code> callback fires on every layout change. Pass the state back via{' '}
                    <code className="font-mono">layoutState</code> to restore a saved layout.
                </p>
                <LayoutPersistence />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={h2}>Import</h2>
                <pre className={cn('text-sm font-mono rounded-lg p-4', { 'bg-gray-800 text-gray-100': isDark, 'bg-gray-100 text-gray-800': !isDark })}>
                    {importCode}
                </pre>
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={h2}>DockedLayout Props</h2>
                <PropsTable props={dockedLayoutProps} />
            </section>

            <section id="panel-config" className="scroll-mt-8">
                <h2 className={h2}>PanelConfig Props</h2>
                <PropsTable props={panelConfigProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={h2}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default DockedLayoutPage;
