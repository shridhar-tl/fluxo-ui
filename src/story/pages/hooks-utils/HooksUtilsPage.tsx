import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import UseClickOutsideDemo from './UseClickOutsideDemo';
import UseDebounceDemo from './UseDebounceDemo';
import UseKeyboardDemo from './UseKeyboardDemo';
import UseMobileDemo from './UseMobileDemo';
import UtilFunctionsDemo from './UtilFunctionsDemo';
import WithFieldLabelDemo from './WithFieldLabelDemo';

const sectionNavItems: SectionNavItem[] = [
    { id: 'use-debounce', title: 'useDebounce', description: 'Debounce value changes' },
    { id: 'use-mobile', title: 'useMobile', description: 'Detect mobile viewport' },
    { id: 'use-click-outside', title: 'useClickOutside', description: 'Click outside detection' },
    { id: 'use-keyboard', title: 'useKeyboard', description: 'Keyboard event handlers' },
    { id: 'with-field-label', title: 'withFieldLabel', description: 'HOC for field labels' },
    { id: 'utility-functions', title: 'Utility Functions', description: 'Common helpers' },
    { id: 'import', title: 'Import', description: 'Import statements' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Hooks',
        description: 'Custom React hooks for debouncing, responsive detection, keyboard, click-outside, and positioning.',
        icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    },
    {
        title: 'Utilities',
        description: 'Pure utility functions for deep property access, immutable updates, nil checking, and debouncing.',
        icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
    },
    {
        title: 'TypeScript',
        description: 'Full type safety with generic hooks and properly typed utility functions.',
        icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    },
    {
        title: 'Tree-Shakeable',
        description: 'Import only what you need from separate entry points for hooks and utils.',
        icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
    },
    {
        title: 'HOC Pattern',
        description: 'withFieldLabel wraps any input component to add label, error, and hint support.',
        icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    },
    {
        title: 'Zero Dependencies',
        description: 'All hooks and utilities are self-contained with no external dependencies.',
        icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
];

const HooksUtilsPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Hooks & Utilities
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    Custom React hooks and utility functions available through separate entry points for optimal tree-shaking.
                </p>
            </div>

            <section id="use-debounce" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>useDebounce</h2>
                <UseDebounceDemo />
            </section>

            <section id="use-mobile" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>useMobile</h2>
                <UseMobileDemo />
            </section>

            <section id="use-click-outside" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    useClickOutside
                </h2>
                <UseClickOutsideDemo />
            </section>

            <section id="use-keyboard" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>useKeyboard</h2>
                <UseKeyboardDemo />
            </section>

            <section id="with-field-label" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>withFieldLabel</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    A higher-order component that wraps any input component with a <code>FieldLabel</code>.
                </p>
                <WithFieldLabelDemo />
            </section>

            <section id="utility-functions" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Utility Functions
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Pure utility functions for common operations like deep property access, immutable updates, and nil checks.
                </p>
                <UtilFunctionsDemo />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock
                    code={`// Hooks\nimport { useDebounce, useMobile } from 'fluxo-ui/hooks';\n\n// Utilities\nimport { withFieldLabel } from 'fluxo-ui/utils';`}
                />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default HooksUtilsPage;
