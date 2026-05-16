import cn from 'classnames';
import React from 'react';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicUsage from './BasicUsage';
import GridSnap from './GridSnap';
import HandleAndAxis from './HandleAndAxis';
import WithResizable from './WithResizable';

import _Moveable_props_json from './../../../components/moveable/Moveable.props.json';
const { moveableProps } = _Moveable_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Wrap any element to make it draggable' },
    { id: 'basic-usage', title: 'Basic Usage', description: 'Drag, keyboard, bounds' },
    { id: 'handle-axis', title: 'Handle & Axis', description: 'Drag handles and axis lock' },
    { id: 'grid-snap', title: 'Grid Snap', description: 'Snap-to-grid drag' },
    { id: 'compose', title: 'Compose with Resizable', description: 'Move + resize a floating panel' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Moveable API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Wraps Any Element',
        description: 'Turn any React node into a draggable element with a single wrapper.',
        icon: 'M4 4h6v6H4zm10 0h6v6h-6zm0 10h6v6h-6zM4 14h6v6H4z',
    },
    {
        title: 'Bounds Aware',
        description: 'Keep movement inside the parent, the window, or a custom rect.',
        icon: 'M3 3h18v18H3z',
    },
    {
        title: 'Drag Handle Support',
        description: 'Restrict drag start to a specific child via handleSelector.',
        icon: 'M9 4h6v2H9zm0 14h6v2H9zM5 8h14v2H5zm0 6h14v2H5z',
    },
    {
        title: 'Axis Lock',
        description: 'Restrict movement to the x-axis or y-axis.',
        icon: 'M2 12h20M12 2v20',
    },
    {
        title: 'Grid Snap',
        description: 'Provide [stepX, stepY] to snap drag to a perfectly aligned grid.',
        icon: 'M4 4h6v6H4zm10 0h6v6h-6zm0 10h6v6h-6zM4 14h6v6H4z',
    },
    {
        title: 'Keyboard Movement',
        description: 'Focus + arrow keys to move with the keyboard (Shift for bigger steps).',
        icon: 'M6 2v8h12V2M6 14v8h12v-8',
    },
    {
        title: 'Position Persistence',
        description: 'Set rememberLastPosition + storageKey to restore position across sessions.',
        icon: 'M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4z',
    },
    {
        title: 'Composes Cleanly',
        description: 'Nest Resizable inside Moveable to build floating, resizable panels.',
        icon: 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z',
    },
];

const importCode = `import { Moveable } from 'fluxo-ui';
import type { MoveableProps, MoveablePosition } from 'fluxo-ui';`;

const MoveablePage: React.FC = () => {
    const { isDark } = useStoryTheme();
    const h2 = cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark });
    const desc = cn('text-sm mb-4', { 'text-gray-400': isDark, 'text-gray-500': !isDark });

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Moveable
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A drag wrapper for any element. Position anything freely on the page with mouse, touch, or keyboard
                    — with bounds, axis lock, grid snapping, drag handles, and optional position persistence.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={h2}>Basic Usage</h2>
                <p className={desc}>
                    Wrap any element. Drag with the mouse / touch, or focus the element and press arrow keys.
                </p>
                <BasicUsage />
            </section>

            <section id="handle-axis" className="scroll-mt-8">
                <h2 className={h2}>Drag Handle & Axis Lock</h2>
                <p className={desc}>
                    Use <code className="font-mono">handleSelector</code> to restrict drag start to a header, and{' '}
                    <code className="font-mono">axis</code> to lock to x or y.
                </p>
                <HandleAndAxis />
            </section>

            <section id="grid-snap" className="scroll-mt-8">
                <h2 className={h2}>Grid Snap</h2>
                <p className={desc}>
                    Use <code className="font-mono">grid={'{[stepX, stepY]}'}</code> for crisp, aligned positioning.
                </p>
                <GridSnap />
            </section>

            <section id="compose" className="scroll-mt-8">
                <h2 className={h2}>Compose with Resizable</h2>
                <p className={desc}>
                    Wrap a <code className="font-mono">Resizable</code> inside a <code className="font-mono">Moveable</code> to
                    build a floating, sizeable panel — the same primitives the <code className="font-mono">DashboardLayout</code> uses.
                </p>
                <WithResizable />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={h2}>Import</h2>
                <pre className={cn('text-sm font-mono rounded-lg p-4', { 'bg-gray-800 text-gray-100': isDark, 'bg-gray-100 text-gray-800': !isDark })}>
                    {importCode}
                </pre>
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={h2}>Moveable Props</h2>
                <PropsTable props={moveableProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={h2}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default MoveablePage;
