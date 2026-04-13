import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { FeatureGrid } from '../../FeatureCard';
import type { FeatureItem } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import UndoRedoDemo from './UndoRedoDemo';
import PersistDemo from './PersistDemo';
import ValidationDemo from './ValidationDemo';
import LoggingDemo from './LoggingDemo';
import ThrottleDemo from './ThrottleDemo';
import DebounceDemo from './DebounceDemo';
import BroadcastDemo from './BroadcastDemo';

const sectionNavItems: SectionNavItem[] = [
    { id: 'undo-redo', title: 'Undo / Redo', description: 'History navigation' },
    { id: 'persist', title: 'Persistence', description: 'localStorage/sessionStorage' },
    { id: 'validation', title: 'Validation', description: 'Reject invalid state' },
    { id: 'logging', title: 'Logger', description: 'Console logging' },
    { id: 'throttle', title: 'Throttle', description: 'Rate-limit updates' },
    { id: 'debounce', title: 'Debounce', description: 'Delay until idle' },
    { id: 'broadcast', title: 'Broadcast', description: 'Cross-tab sync' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Undo / Redo',
        description: 'Navigate state history with configurable max history size and one-call undo/redo',
        icon: 'M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3',
    },
    {
        title: 'Persistence',
        description: 'Auto-save state to localStorage or sessionStorage with a configurable key',
        icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375',
    },
    {
        title: 'Validation',
        description: 'Intercept setState calls and reject updates that fail validation rules',
        icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z',
    },
    {
        title: 'Logger',
        description: 'Log state changes to the console with optional predicate filtering',
        icon: 'M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6V7.5Z',
    },
    {
        title: 'Throttle',
        description: 'Batch rapid setState calls within a configurable delay window to reduce noise',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
    {
        title: 'Debounce',
        description: 'Delay state updates until activity stops — ideal for search inputs and auto-save',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
    {
        title: 'Broadcast',
        description: 'Sync state across browser tabs in real-time using the BroadcastChannel API',
        icon: 'M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z',
    },
    {
        title: 'Composable',
        description: 'Middlewares are composable — stack multiple middlewares to combine behaviors',
        icon: 'M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0L21.75 16.5 12 21.75 2.25 16.5l4.179-2.25m0 0 5.571 3 5.571-3',
    },
];

const StoreMiddlewarePage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Store Middleware</h1>
                <p className={cn('text-xl leading-relaxed', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    Composable middleware functions that extend store behavior. Add undo/redo, persistence, validation, logging, and throttling with a single line.
                </p>
            </div>

            <section id="undo-redo" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Undo / Redo</h2>
                <UndoRedoDemo />
            </section>

            <section id="persist" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Persistence</h2>
                <PersistDemo />
            </section>

            <section id="validation" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Validation</h2>
                <ValidationDemo />
            </section>

            <section id="logging" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Logger</h2>
                <LoggingDemo />
            </section>

            <section id="throttle" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Throttle</h2>
                <ThrottleDemo />
            </section>

            <section id="debounce" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Debounce</h2>
                <DebounceDemo />
            </section>

            <section id="broadcast" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Broadcast</h2>
                <BroadcastDemo />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import {\n  persistMiddleware,\n  undoRedoMiddleware,\n  validationMiddleware,\n  loggerMiddleware,\n  throttleMiddleware,\n  debounceMiddleware,\n  broadcastMiddleware,\n  devToolsMiddleware,\n  immerMiddleware,\n} from 'ether-ui/store/middlewares';`} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default StoreMiddlewarePage;
