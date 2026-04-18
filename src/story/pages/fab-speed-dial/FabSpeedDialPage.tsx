import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import FabBasic from './FabBasic';
import FabExtended from './FabExtended';
import FabSizes from './FabSizes';
import SpeedDialBasic from './SpeedDialBasic';
import SpeedDialClick from './SpeedDialClick';
import SpeedDialDirections from './SpeedDialDirections';
import SpeedDialSizes from './SpeedDialSizes';
import SpeedDialVariants from './SpeedDialVariants';

import _Fab_props_json from '../../../components/Fab.props.json';
const { fabProps, speedDialProps } = _Fab_props_json;


const sectionNavItems: SectionNavItem[] = [
    { id: 'fab-basic', title: 'FAB Basic', description: 'Floating action buttons' },
    { id: 'fab-sizes', title: 'FAB Sizes', description: 'Size options' },
    { id: 'fab-extended', title: 'FAB Extended', description: 'With label text' },
    { id: 'speed-dial-basic', title: 'Speed Dial', description: 'Basic speed dial' },
    { id: 'speed-dial-directions', title: 'Directions', description: 'Expand directions' },
    { id: 'speed-dial-variants', title: 'SD Variants', description: 'Color variants' },
    { id: 'speed-dial-sizes', title: 'SD Sizes', description: 'Size options' },
    { id: 'speed-dial-click', title: 'Click & Colors', description: 'Click trigger & colored actions' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'fab-props', title: 'FAB Props', description: 'Fab API reference' },
    { id: 'speed-dial-props', title: 'SpeedDial Props', description: 'SpeedDial API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Multiple Variants',
        description: 'Seven color variants for both FAB and SpeedDial trigger buttons',
        icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z',
    },
    {
        title: 'Directional Expand',
        description: 'Speed dial actions expand up, down, left, or right from the trigger',
        icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15',
    },
    {
        title: 'Hover & Click Triggers',
        description: 'Open on hover for quick access or click for intentional interaction',
        icon: 'M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59',
    },
    {
        title: 'Extended FAB',
        description: 'FAB with both icon and label for clearer action description',
        icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z',
    },
    {
        title: 'Mask Overlay',
        description: 'Optional backdrop overlay to focus attention on the speed dial actions',
        icon: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    },
    {
        title: 'Fixed Positioning',
        description: 'Pin FAB or SpeedDial to any screen corner or center edge',
        icon: 'M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z',
    },
];

const FabSpeedDialPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Fab & Speed Dial
                </h1>
                <p className={cn('text-xl leading-relaxed', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    Floating action buttons for primary actions and speed dial menus that reveal multiple actions on hover or click.
                </p>
            </div>

            <section id="fab-basic" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>FAB Basic</h2>
                <FabBasic />
            </section>

            <section id="fab-sizes" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>FAB Sizes</h2>
                <FabSizes />
            </section>

            <section id="fab-extended" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>FAB Extended</h2>
                <FabExtended />
            </section>

            <section id="speed-dial-basic" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Speed Dial</h2>
                <SpeedDialBasic />
            </section>

            <section id="speed-dial-directions" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Directions</h2>
                <SpeedDialDirections />
            </section>

            <section id="speed-dial-variants" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Speed Dial Variants
                </h2>
                <SpeedDialVariants />
            </section>

            <section id="speed-dial-sizes" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Speed Dial Sizes
                </h2>
                <SpeedDialSizes />
            </section>

            <section id="speed-dial-click" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Click Trigger & Colored Actions
                </h2>
                <SpeedDialClick />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { Fab, SpeedDial } from 'fluxo-ui';\nimport type { SpeedDialItem } from 'fluxo-ui';`} />
            </section>

            <section id="fab-props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Fab Props</h2>
                <PropsTable props={fabProps} />
            </section>

            <section id="speed-dial-props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    SpeedDial Props
                </h2>
                <PropsTable props={speedDialProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default FabSpeedDialPage;
