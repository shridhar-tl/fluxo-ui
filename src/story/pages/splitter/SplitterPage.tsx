import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import DefaultSizePct from './DefaultSizePct';
import DefaultSizePx from './DefaultSizePx';
import FixedPanel from './FixedPanel';
import GutterSize from './GutterSize';
import HorizontalSplit from './HorizontalSplit';
import KeyboardNavigation from './KeyboardNavigation';
import MinSize from './MinSize';
import NestedSplitters from './NestedSplitters';
import OnResizeEnd from './OnResizeEnd';
import PersistingLayout from './PersistingLayout';
import VerticalSplit from './VerticalSplit';

const splitterProps = {
    layout: {
        type: "'horizontal' | 'vertical'",
        default: "'horizontal'",
        description: "Direction in which panels are laid out. 'horizontal' places panels side by side; 'vertical' stacks them.",
    },
    gutterSize: {
        type: 'number',
        default: '4',
        description: 'Width (or height) in pixels of the drag handle bar between panels.',
    },
    onResizeEnd: {
        type: '(firstPanelSize: number) => void',
        description: 'Called after the user finishes a drag with the new first-panel size in pixels.',
    },
    className: {
        type: 'string',
        description: 'Additional CSS classes for the outer container.',
    },
    style: {
        type: 'React.CSSProperties',
        description: 'Inline styles for the outer container.',
    },
    children: {
        type: 'React.ReactNode',
        required: true,
        description: 'Exactly two SplitterPanel children are required.',
    },
};

const splitterPanelProps = {
    defaultSize: {
        type: 'string',
        description:
            "Initial size of the panel. Accepts px (e.g. '300px') or % (e.g. '40%'). Only one panel should set this — the sibling fills the remaining space.",
    },
    minSize: {
        type: 'string',
        default: "'0px'",
        description: 'Minimum size of the panel. Accepts px or %. Prevents the panel from being resized below this threshold.',
    },
    fixed: {
        type: 'boolean',
        default: 'false',
        description: 'When true, the panel cannot be resized by the user.',
    },
    className: {
        type: 'string',
        description: 'Additional CSS classes for the panel container.',
    },
    style: {
        type: 'React.CSSProperties',
        description: 'Inline styles for the panel container.',
    },
    children: {
        type: 'React.ReactNode',
        description: 'Content to render inside the panel.',
    },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'horizontal-split', title: 'Horizontal Split', description: 'Side-by-side panels' },
    { id: 'vertical-split', title: 'Vertical Split', description: 'Stacked panels' },
    { id: 'default-size-px', title: 'Default Size (px)', description: 'Fixed pixel starting size' },
    { id: 'default-size-pct', title: 'Default Size (%)', description: 'Percentage starting size' },
    { id: 'min-size', title: 'Minimum Size', description: 'Collapse threshold' },
    { id: 'fixed-panel', title: 'Fixed Panel', description: 'Lock panel size' },
    { id: 'gutter-size', title: 'Gutter Size', description: 'Drag handle thickness' },
    { id: 'on-resize-end', title: 'onResizeEnd', description: 'Resize callback' },
    { id: 'nested', title: 'Nested Splitters', description: 'IDE-style multi-pane' },
    { id: 'persisting', title: 'Persisting Layout', description: 'Save/restore split' },
    { id: 'keyboard', title: 'Keyboard Navigation', description: 'ADA keyboard support' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'splitter-props', title: 'Splitter Props', description: 'Splitter API reference' },
    { id: 'panel-props', title: 'SplitterPanel Props', description: 'Panel API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Horizontal & Vertical',
        description: 'Side-by-side or stacked layouts via the layout prop',
        icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15',
    },
    {
        title: 'px & % Sizing',
        description: 'defaultSize and minSize accept both pixel and percentage values',
        icon: 'M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5Z',
    },
    {
        title: 'Minimum Size',
        description: 'minSize prevents panels from collapsing below a defined threshold',
        icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15',
    },
    {
        title: 'Fixed Panels',
        description: "Lock a panel's size to prevent user resizing with the fixed prop",
        icon: 'M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z',
    },
    {
        title: 'Drag & Touch',
        description: 'Smooth resizing via mouse drag and touch events on all devices',
        icon: 'M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59',
    },
    {
        title: 'Nested Splitters',
        description: 'Compose multiple splitters for IDE-style multi-pane layouts',
        icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6Z',
    },
    {
        title: 'onResizeEnd Callback',
        description: "Fires with the first panel's pixel size after drag ends — perfect for persistence",
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
    {
        title: 'Keyboard Navigation',
        description: 'Arrow keys move the gutter by 20px; fully ADA accessible without extra config',
        icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
    },
    {
        title: 'Theming',
        description: 'Full dark/light and 5 brand themes via CSS variables — zero extra config',
        icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z',
    },
];

const SplitterPage: React.FC = () => {
    const { isDark } = useStoryTheme();
    const h2 = cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark });
    const desc = cn('text-sm mb-4', { 'text-gray-400': isDark, 'text-gray-500': !isDark });

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Splitter
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A resizable split-panel component that divides a container into two adjustable sections. Supports horizontal and
                    vertical layouts with drag, touch, and keyboard resize support.
                </p>
            </div>

            <section id="horizontal-split" className="scroll-mt-8">
                <h2 className={h2}>Basic Horizontal Split</h2>
                <p className={desc}>
                    Default layout — panels sit side by side. Drag the gutter to resize. The second panel fills all remaining space.
                </p>
                <HorizontalSplit />
            </section>

            <section id="vertical-split" className="scroll-mt-8">
                <h2 className={h2}>Vertical Split</h2>
                <p className={desc}>
                    Use <code className="font-mono">layout="vertical"</code> to stack panels top-to-bottom with a horizontal drag handle.
                </p>
                <VerticalSplit />
            </section>

            <section id="default-size-px" className="scroll-mt-8">
                <h2 className={h2}>Default Size (px)</h2>
                <p className={desc}>
                    Set <code className="font-mono">defaultSize</code> on one panel to give it a fixed starting size. The sibling fills the
                    rest. Only set this on one panel per splitter.
                </p>
                <DefaultSizePx />
            </section>

            <section id="default-size-pct" className="scroll-mt-8">
                <h2 className={h2}>Default Size (%)</h2>
                <p className={desc}>Percentages are also supported, making the initial split responsive to the container width.</p>
                <DefaultSizePct />
            </section>

            <section id="min-size" className="scroll-mt-8">
                <h2 className={h2}>Minimum Panel Size</h2>
                <p className={desc}>
                    Use <code className="font-mono">minSize</code> to prevent a panel from being resized below a threshold. Accepts px or %.
                    Try dragging the gutter all the way to either edge.
                </p>
                <MinSize />
            </section>

            <section id="fixed-panel" className="scroll-mt-8">
                <h2 className={h2}>Fixed Panel</h2>
                <p className={desc}>
                    Set <code className="font-mono">fixed</code> on a panel to lock its size. The gutter is rendered but dragging will not
                    change the fixed panel.
                </p>
                <FixedPanel />
            </section>

            <section id="gutter-size" className="scroll-mt-8">
                <h2 className={h2}>Custom Gutter Size</h2>
                <p className={desc}>
                    Control how thick the drag handle bar is with <code className="font-mono">gutterSize</code> (in pixels). Larger gutters
                    are easier to grab on touch devices.
                </p>
                <GutterSize />
            </section>

            <section id="on-resize-end" className="scroll-mt-8">
                <h2 className={h2}>onResizeEnd Callback</h2>
                <p className={desc}>
                    <code className="font-mono">onResizeEnd</code> fires after the user releases the gutter, providing the first panel's
                    pixel size. Use it to persist the layout to storage.
                </p>
                <OnResizeEnd />
            </section>

            <section id="nested" className="scroll-mt-8">
                <h2 className={h2}>Nested Splitters</h2>
                <p className={desc}>
                    Place a <code className="font-mono">Splitter</code> inside a <code className="font-mono">SplitterPanel</code> to build
                    IDE-style multi-pane layouts. Make sure the inner splitter fills its panel with{' '}
                    <code className="font-mono">height: 100%</code>.
                </p>
                <NestedSplitters />
            </section>

            <section id="persisting" className="scroll-mt-8">
                <h2 className={h2}>Persisting Layout</h2>
                <p className={desc}>
                    Combine <code className="font-mono">defaultSize</code> and <code className="font-mono">onResizeEnd</code> to save and
                    restore the user's preferred split across sessions.
                </p>
                <PersistingLayout />
            </section>

            <section id="keyboard" className="scroll-mt-8">
                <h2 className={h2}>Keyboard Navigation</h2>
                <p className={desc}>
                    The gutter is focusable and responds to arrow keys, making it fully ADA-accessible without any extra configuration.
                </p>
                <KeyboardNavigation />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={h2}>Import</h2>
                <CodeBlock code={`import { Splitter, SplitterPanel } from 'fluxo-ui';`} />
            </section>

            <section id="splitter-props" className="scroll-mt-8">
                <h2 className={h2}>Splitter Props</h2>
                <PropsTable props={splitterProps} />
            </section>

            <section id="panel-props" className="scroll-mt-8">
                <h2 className={h2}>SplitterPanel Props</h2>
                <PropsTable props={splitterPanelProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default SplitterPage;
