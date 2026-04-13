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
import Sizes from './Sizes';
import WithoutTitle from './WithoutTitle';
import ScrollableContent from './ScrollableContent';
import NonClosable from './NonClosable';
import NestedModals from './NestedModals';
import CustomLayout from './CustomLayout';
import FormExample from './FormExample';

const modalProps = {
    isOpen: {
        type: 'boolean',
        required: true,
        description: 'Controls whether the modal is visible',
    },
    onClose: {
        type: '() => void',
        required: true,
        description: 'Callback function triggered when modal should close',
    },
    title: {
        type: 'string',
        description: 'Modal title displayed in the header. If not provided, close button appears in top-right corner',
    },
    children: {
        type: 'React.ReactNode',
        required: true,
        description: 'Modal content (scrollable when it overflows)',
    },
    footer: {
        type: 'React.ReactNode',
        description: 'Footer content rendered below the scrollable area. Always visible on screen regardless of content height',
    },
    size: {
        type: "'sm' | 'md' | 'lg' | 'xl'",
        default: "'md'",
        description: 'Modal width size (sm: 28rem, md: 32rem, lg: 42rem, xl: 56rem)',
    },
    closeOnBackdrop: {
        type: 'boolean',
        default: 'true',
        description: 'Whether clicking the backdrop (overlay) closes the modal',
    },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Default modal example' },
    { id: 'sizes', title: 'Sizes', description: 'sm, md, lg, xl width options' },
    { id: 'without-title', title: 'Without Title', description: 'Full layout control' },
    { id: 'scrollable', title: 'Scrollable Content', description: 'Long content with sticky footer' },
    { id: 'non-closable', title: 'Non-closable', description: 'Disable backdrop close' },
    { id: 'nested', title: 'Nested Modals', description: 'Stacked modal support' },
    { id: 'custom-layout', title: 'Custom Layout', description: 'Custom header and footer' },
    { id: 'form-example', title: 'Form Example', description: 'Form inside a modal' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Portal Rendering', description: 'Rendered via React portals so modals always appear above all other content', icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15' },
    { title: 'Multiple Sizes', description: 'Four preset widths — sm, md, lg, xl — to fit any content need', icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15' },
    { title: 'Scrollable Body', description: 'Content area scrolls independently while the footer stays fixed on screen', icon: 'M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25' },
    { title: 'Sticky Footer', description: 'Optional footer prop always visible at the bottom, even with long content', icon: 'M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12' },
    { title: 'Keyboard Support', description: 'Escape key closes the modal; focus is trapped inside while open', icon: 'M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z' },
    { title: 'Backdrop Control', description: 'closeOnBackdrop prop disables click-outside for critical confirmations', icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z' },
    { title: 'Nested Modals', description: 'Multiple modals can be stacked with independent close handlers', icon: 'M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' },
    { title: 'Scroll Lock', description: 'Body scrolling is locked while the modal is open to prevent background movement', icon: 'M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z' },
    { title: 'Smooth Animations', description: 'Scale and opacity transitions on open and close for a polished feel', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z' },
    { title: 'Accessibility', description: 'ARIA dialog role, focus management, and screen reader labels built in', icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z' },
];

const ModalPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Modal</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A dialog component that displays content in a layer above the main application. Modals can be used for
                    confirmations, forms, detailed information, or any content that requires focused user attention.
                </p>
            </div>

            <section className="scroll-mt-8" id="basic-usage">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section className="scroll-mt-8" id="sizes">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Sizes</h2>
                <Sizes />
            </section>

            <section className="scroll-mt-8" id="without-title">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Without Title</h2>
                <WithoutTitle />
            </section>

            <section className="scroll-mt-8" id="scrollable">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Scrollable Content</h2>
                <ScrollableContent />
            </section>

            <section className="scroll-mt-8" id="non-closable">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Non-closable Modal</h2>
                <NonClosable />
            </section>

            <section className="scroll-mt-8" id="nested">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Nested Modals</h2>
                <NestedModals />
            </section>

            <section className="scroll-mt-8" id="custom-layout">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom Header and Footer</h2>
                <CustomLayout />
            </section>

            <section className="scroll-mt-8" id="form-example">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Form Example</h2>
                <FormExample />
            </section>

            <section className="scroll-mt-8" id="import">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { Modal } from 'ether-ui';`} />
            </section>

            <section className="scroll-mt-8" id="props">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={modalProps} />
            </section>

            <section className="scroll-mt-8" id="features">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default ModalPage;
