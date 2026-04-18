import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import AnimationsDemo from './AnimationsDemo';
import ClickCallback from './ClickCallback';
import LightBackground from './LightBackground';
import PersistentTimeout from './PersistentTimeout';
import PositionsDemo from './PositionsDemo';
import SetupSection from './SetupSection';
import TypesDemo from './TypesDemo';


import _Snackbar_props_json from './../../../components/snackbar/Snackbar.props.json';
const { snackbarProps } = _Snackbar_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'setup', title: 'Setup', description: 'Mount SnackbarManager' },
    { id: 'types', title: 'Types', description: 'Semantic notification types' },
    { id: 'positions', title: 'Positions', description: 'Screen edge placement' },
    { id: 'animations', title: 'Animations', description: 'Entry and exit animations' },
    { id: 'persistent-timeout', title: 'Persistent & Timeout', description: 'Timeout control' },
    { id: 'light-background', title: 'Light Background', description: 'Light variant' },
    { id: 'click-callback', title: 'Click Callback', description: 'Clickable snackbars' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'api-reference', title: 'API Reference', description: 'showSnackbar options' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Global Manager Pattern',
        description:
            'Mount SnackbarManager once at the app root and trigger notifications from anywhere in the codebase with showSnackbar().',
        icon: 'M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3.284 14.253A8.959 8.959 0 0 1 3 12c0-1.306.278-2.546.777-3.668',
    },
    {
        title: 'Four Semantic Types',
        description:
            'Info, success, warning, and error variants each carry a distinct color scheme and icon to communicate intent clearly.',
        icon: 'M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0',
    },
    {
        title: 'Six Screen Positions',
        description:
            'Place notifications at any of six positions: top-left, top-center, top-right, bottom-left, bottom-center, or bottom-right.',
        icon: 'M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z',
    },
    {
        title: 'Four Animations',
        description: 'Choose from slide, fade, zoom, or bounce entry/exit animations to match your application style.',
        icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
    },
    {
        title: 'Auto-Dismiss & Persistent',
        description:
            'Configurable auto-dismiss timeout in milliseconds. Set timeout to 0 for persistent notifications that only close manually.',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
    {
        title: 'Light Background Variant',
        description: 'The lightBg option renders a softer tinted background for a subtler appearance on light-themed interfaces.',
        icon: 'M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z',
    },
    {
        title: 'Click & Close Callbacks',
        description:
            'Attach onClick to navigate or take action when the user taps the notification, and onClose to react to dismissal events.',
        icon: 'M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59',
    },
    {
        title: 'Custom Icons',
        description: 'Override the default type icon with any custom SVG icon component for branded or context-specific notifications.',
        icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z',
    },
    {
        title: 'Theming',
        description: 'Full dark/light mode and all 5 brand themes supported automatically via CSS custom properties.',
        icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z',
    },
];

const SnackbarPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Snackbar
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    Global toast notifications for feedback messages. Mount <code className="text-blue-400">&lt;SnackbarManager /&gt;</code>{' '}
                    once at your app root, then call <code className="text-blue-400">showSnackbar()</code> from anywhere.
                </p>
            </div>

            <section className="scroll-mt-8" id="setup">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Setup</h2>
                <SetupSection />
            </section>

            <section className="scroll-mt-8" id="types">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Types</h2>
                <TypesDemo />
            </section>

            <section className="scroll-mt-8" id="positions">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Positions</h2>
                <PositionsDemo />
            </section>

            <section className="scroll-mt-8" id="animations">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Animations</h2>
                <AnimationsDemo />
            </section>

            <section className="scroll-mt-8" id="persistent-timeout">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Persistent & Custom Timeout
                </h2>
                <PersistentTimeout />
            </section>

            <section className="scroll-mt-8" id="light-background">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Light Background Variant
                </h2>
                <LightBackground />
            </section>

            <section className="scroll-mt-8" id="click-callback">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    With Click Callback
                </h2>
                <ClickCallback />
            </section>

            <section className="scroll-mt-8" id="import">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { SnackbarManager, showSnackbar } from 'fluxo-ui';`} />
            </section>

            <section className="scroll-mt-8" id="api-reference">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>API Reference</h2>
                <h3 className={cn('text-lg font-semibold mb-3', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    showSnackbar(message, title, options?)
                </h3>
                <PropsTable props={snackbarProps} />
            </section>

            <section className="scroll-mt-8" id="features">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default SnackbarPage;
