import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import PageLayout from '../../PageLayout';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import ThemeGalleryDemo from './ThemeGalleryDemo';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Theme system summary' },
    { id: 'light', title: 'Light Mode', description: 'All 9 themes in light mode' },
    { id: 'dark', title: 'Dark Mode', description: 'All 9 themes in dark mode' },
    { id: 'custom', title: 'CSS Variables', description: 'Override --euic-* vars' },
];

const cssVarsCode = `// Override any --euic-* variable to customize a theme.
// Pass as either cssVars prop or via parent CSS scope.

<ChatWindow
    theme="modern"
    cssVars={{
        '--euic-primary': '#7c3aed',
        '--euic-secondary': '#5b21b6',
        '--euic-bubble-user-bg': '#7c3aed',
        '--euic-bubble-user-fg': '#ffffff',
    }}
    messages={messages}
/>`;

const ChatThemesPage: React.FC = () => {
    const { isDark } = useStoryTheme();
    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Chat Themes
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    9 fully-designed themes ship with the chat component — each with a distinct personality, header treatment, bubble style,
                    and accent palette. Every theme works in both light and dark modes out of the box.
                </p>
            </div>

            <section className="scroll-mt-8" id="light">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Light Mode</h2>
                <ThemeGalleryDemo mode="light" />
            </section>

            <section className="scroll-mt-8" id="dark">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Dark Mode</h2>
                <ThemeGalleryDemo mode="dark" />
            </section>

            <section className="scroll-mt-8" id="custom">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Custom Branding via CSS Variables
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Each theme is fully driven by <code>--euic-*</code> CSS variables. Override any of them via the <code>cssVars</code> prop
                    or in your own stylesheet to brand the chat to match your product.
                </p>
                <CodeBlock code={cssVarsCode} language="tsx" />
            </section>
        </PageLayout>
    );
};

export default ChatThemesPage;
