import cn from 'classnames';
import React from 'react';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import AspectRatioGrid from './AspectRatioGrid';
import AxisAndHandles from './AxisAndHandles';
import BasicUsage from './BasicUsage';
import Controlled from './Controlled';
import ImageResizer from './ImageResizer';

import _Resizable_props_json from './../../../components/resizable/Resizable.props.json';
const { resizableProps } = _Resizable_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Wrap any element to make it resizable' },
    { id: 'basic-usage', title: 'Basic Usage', description: '8 handles, mouse & keyboard' },
    { id: 'axis-handles', title: 'Axis & Handles', description: 'Restrict direction or handle set' },
    { id: 'aspect-grid', title: 'Aspect & Grid', description: 'Aspect ratio lock and grid snap' },
    { id: 'image-resizer', title: 'Resizable Media', description: 'Hover-revealed handles for media' },
    { id: 'controlled', title: 'Controlled Mode', description: 'Two-way binding with external state' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Resizable API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Wraps Any Element',
        description: 'Drop the Resizable wrapper around any React element — images, iframes, charts, divs.',
        icon: 'M3 3h7v7H3zm0 11h7v7H3zM14 3h7v7h-7zm0 11h7v7h-7z',
    },
    {
        title: '8 Handles or Subset',
        description: 'All edges and corners by default. Pick "edges", "corners", or your own list.',
        icon: 'M4 12h16M12 4v16',
    },
    {
        title: 'Aspect Ratio Lock',
        description: 'Number for a fixed ratio (16:9, 1:1) or true to keep the starting ratio.',
        icon: 'M3 5h18v14H3zM7 9h10v6H7z',
    },
    {
        title: 'Grid Snap',
        description: 'Provide [stepX, stepY] for perfectly-aligned resize values.',
        icon: 'M4 4h6v6H4zm10 0h6v6h-6zm0 10h6v6h-6zM4 14h6v6H4z',
    },
    {
        title: 'Touch + Keyboard',
        description: 'Mouse, touch, and arrow keys all supported. Shift + arrow for big steps.',
        icon: 'M6 2v8h12V2M6 14v8h12v-8',
    },
    {
        title: 'Bounds Aware',
        description: 'Constrain to parent, window, or a custom { width, height } bound.',
        icon: 'M3 3h18v18H3z',
    },
    {
        title: 'Controlled or Uncontrolled',
        description: 'Use defaultWidth/defaultHeight for autonomous control, or width/height for two-way binding.',
        icon: 'M2 12h20M12 2v20',
    },
    {
        title: 'Themed Handles',
        description: 'Handles use --eui-* tokens — flip automatically across brand themes and dark mode.',
        icon: 'M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z',
    },
];

const importCode = `import { Resizable } from 'fluxo-ui';
import type { ResizableProps, ResizableSize } from 'fluxo-ui';`;

const ResizablePage: React.FC = () => {
    const { isDark } = useStoryTheme();
    const h2 = cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark });
    const desc = cn('text-sm mb-4', { 'text-gray-400': isDark, 'text-gray-500': !isDark });

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Resizable
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A generic resize wrapper. Drop it around any React node to gain 8-direction resizing with min/max,
                    aspect-ratio lock, grid snap, keyboard support, and bounds-awareness — all themeable and dark-mode ready.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={h2}>Basic Usage</h2>
                <p className={desc}>
                    Eight handles by default. Drag to resize, or focus a handle with Tab and use arrow keys (Shift for bigger steps).
                </p>
                <BasicUsage />
            </section>

            <section id="axis-handles" className="scroll-mt-8">
                <h2 className={h2}>Axis & Handle Sets</h2>
                <p className={desc}>
                    Lock resizing to a single axis or render only a subset of handles.
                </p>
                <AxisAndHandles />
            </section>

            <section id="aspect-grid" className="scroll-mt-8">
                <h2 className={h2}>Aspect Ratio & Grid Snap</h2>
                <p className={desc}>
                    Pass <code className="font-mono">aspectRatio={'{16 / 9}'}</code> for a fixed ratio, or{' '}
                    <code className="font-mono">grid={'{[20, 20]}'}</code> to snap to a pixel grid.
                </p>
                <AspectRatioGrid />
            </section>

            <section id="image-resizer" className="scroll-mt-8">
                <h2 className={h2}>Resizable Media</h2>
                <p className={desc}>
                    Wrap an <code className="font-mono">{'<img>'}</code>, iframe, or anything else. Use <code className="font-mono">showHandles="hover"</code> for a cleaner UX.
                </p>
                <ImageResizer />
            </section>

            <section id="controlled" className="scroll-mt-8">
                <h2 className={h2}>Controlled Mode</h2>
                <p className={desc}>
                    Pass <code className="font-mono">width</code> + <code className="font-mono">height</code> + <code className="font-mono">onSizeChange</code> for full two-way binding.
                </p>
                <Controlled />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={h2}>Import</h2>
                <pre className={cn('text-sm font-mono rounded-lg p-4', { 'bg-gray-800 text-gray-100': isDark, 'bg-gray-100 text-gray-800': !isDark })}>
                    {importCode}
                </pre>
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={h2}>Resizable Props</h2>
                <PropsTable props={resizableProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={h2}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default ResizablePage;
