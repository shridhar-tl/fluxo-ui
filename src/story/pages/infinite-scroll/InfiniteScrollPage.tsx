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
import ErrorHandling from './ErrorHandling';

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Auto-loading scrollable list' },
    { id: 'error-handling', title: 'Error Handling', description: 'Error state with retry button' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const infiniteScrollProps = {
    loadMore: { type: '() => Promise<void>', required: true, description: 'Async function to load more data.' },
    hasMore: { type: 'boolean', required: true, description: 'Whether there is more data to load.' },
    isLoading: { type: 'boolean', default: 'false', description: 'External loading state control.' },
    error: { type: 'string | null', description: 'Error message to display.' },
    onRetry: { type: '() => void', description: 'Called when the retry button is clicked.' },
    threshold: { type: 'number', default: '200', description: 'Pixel distance from bottom to trigger loading.' },
    loader: { type: 'ReactNode', description: 'Custom loading indicator.' },
    endMessage: { type: 'ReactNode', description: 'Message shown when all data is loaded.' },
    errorMessage: { type: 'ReactNode', description: 'Custom error display (overrides default).' },
    scrollableTarget: { type: 'string | HTMLElement', description: 'ID or element of the scrollable container.' },
    inverse: { type: 'boolean', default: 'false', description: 'Load content at the top (chat-style).' },
    children: { type: 'ReactNode', required: true, description: 'List content to display.' },
    className: { type: 'string', description: 'Additional CSS class for the container.' },
};

const features: FeatureItem[] = [
    { title: 'Intersection Observer', description: 'Uses IntersectionObserver for efficient scroll detection without scroll event listeners.', icon: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z' },
    { title: 'Error & Retry', description: 'Built-in error state display with a retry button to re-attempt loading.', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z' },
    { title: 'Custom Loader', description: 'Replace the default spinner with any custom loading indicator.', icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99' },
    { title: 'Inverse Mode', description: 'Load content at the top of the container for chat-style interfaces.', icon: 'M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12' },
    { title: 'Scrollable Target', description: 'Attach to any scrollable container by ID or element reference.', icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15' },
    { title: 'End Message', description: 'Display a custom message when all content has been loaded.', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const InfiniteScrollPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>InfiniteScroll</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    An infinite scroll component that automatically loads more content as the user scrolls, with error handling and customizable loading states.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="error-handling" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Error Handling</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Pass an <code>error</code> string to show an error message with a retry button. Use <code>onRetry</code> to clear the error and re-attempt loading.
                </p>
                <ErrorHandling />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { InfiniteScroll } from 'ether-ui';\nimport type { InfiniteScrollProps } from 'ether-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={infiniteScrollProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default InfiniteScrollPage;
