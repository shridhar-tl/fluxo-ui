import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicUsage from './BasicUsage';

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Hover, click, and zoom-out modes' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const lightboxProps = {
    children: { type: 'ReactNode', required: true, description: 'Trigger element that opens the lightbox.' },
    content: { type: 'ReactNode', required: true, description: 'Content to display inside the lightbox.' },
    trigger: { type: "'hover' | 'click'", default: "'hover'", description: 'How the lightbox is triggered.' },
    position: {
        type: "'auto' | 'top' | 'bottom' | 'left' | 'right' | 'center'",
        default: "'auto'",
        description: 'Position of the lightbox popover. Center shows as a modal.',
    },
    width: { type: 'string | number', default: '400', description: 'Width of the lightbox panel.' },
    height: { type: 'string | number', description: 'Height of the lightbox panel.' },
    zoomOut: {
        type: 'boolean',
        default: 'false',
        description: 'Enable zoomed-out view mode. Content renders at full size but scaled down.',
    },
    zoomScale: { type: 'number', default: '0.5', description: 'Scale factor for zoomed-out view (0.1 to 1).' },
    zoomWidth: { type: 'string | number', default: "'100vw'", description: 'Width of the content container in zoom-out mode.' },
    zoomHeight: { type: 'string | number', default: "'100vh'", description: 'Height of the content container in zoom-out mode.' },
    backdrop: { type: 'boolean', default: 'true', description: 'Show backdrop overlay (center position only).' },
    closeOnBackdropClick: { type: 'boolean', default: 'true', description: 'Close when clicking the backdrop.' },
    closeOnEscape: { type: 'boolean', default: 'true', description: 'Close on Escape key press.' },
    showCloseButton: { type: 'boolean', default: 'true', description: 'Show close button in header.' },
    hoverDelay: { type: 'number', default: '300', description: 'Delay before opening on hover (ms).' },
    hoverCloseDelay: { type: 'number', default: '200', description: 'Delay before closing after mouse leaves (ms).' },
    header: { type: 'ReactNode', description: 'Header content.' },
    footer: { type: 'ReactNode', description: 'Footer content.' },
    disabled: { type: 'boolean', default: 'false', description: 'Disable the lightbox trigger.' },
    onOpen: { type: '() => void', description: 'Called when lightbox opens.' },
    onClose: { type: '() => void', description: 'Called when lightbox closes.' },
};

const features: FeatureItem[] = [
    {
        title: 'Hover & Click',
        description: 'Trigger lightbox on hover for quick previews or click for persistent viewing.',
        icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122',
    },
    {
        title: 'Smart Positioning',
        description: 'Auto-positions based on available space. Supports top, bottom, left, right, and center.',
        icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15',
    },
    {
        title: 'Zoom-Out View',
        description: 'Render large components at full size but display them scaled down for bird-eye previews.',
        icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6',
    },
    {
        title: 'Accessible',
        description: 'Keyboard navigation, Escape to close, ARIA roles, and focus management.',
        icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    },
];

const LightboxPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Lightbox
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A popover/modal component for previewing content on hover or click, with zoom-out support for large layouts.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { Lightbox } from 'fluxo-ui';\nimport type { LightboxProps } from 'fluxo-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={lightboxProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default LightboxPage;
