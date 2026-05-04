import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicChatDemo from './BasicChatDemo';
import FeaturesDemo from './FeaturesDemo';
import ThemeSwitchDemo from './ThemeSwitchDemo';
import _props_json from './../../../components/chat/window/ChatWindow.props.json';

const { chatWindowProps } = _props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Introduction and key features' },
    { id: 'basic', title: 'Basic Usage', description: 'Working chat window with simulated bot replies' },
    { id: 'theme-switcher', title: 'Live Theme Switcher', description: 'Switch theme + color mode while chatting' },
    { id: 'features', title: 'Rich Features', description: 'Reactions, replies, actions, feedback' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'ChatWindow API reference' },
    { id: 'features-grid', title: 'Capabilities', description: 'Feature highlights' },
];

const features: FeatureItem[] = [
    {
        title: 'Fully Controlled',
        description: 'You own the messages array. Send/receive/update is just state.',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
        title: '9 Themes Built-In',
        description: 'Classic, modern, iris, dusk, mist, ember, canvas, prism, aurora.',
        icon: 'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z',
    },
    {
        title: 'Light & Dark',
        description: 'Auto, light, or dark color mode — every theme adapts cleanly.',
        icon: 'M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z',
    },
    {
        title: 'Reactions & Replies',
        description: 'Emoji reactions, threaded replies (pinned/quoted), message actions.',
        icon: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z',
    },
    {
        title: 'Attachments',
        description: 'Drag-and-drop files, accept filters, max size, custom display modes.',
        icon: 'M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13',
    },
    {
        title: 'Emoji + Shortcodes',
        description: 'Built-in picker, recents, and live `:smile:` → 😄 replacement.',
        icon: 'M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z',
    },
    {
        title: 'Drag & Resize',
        description: 'Move and resize the floating window; persist position to local/session storage.',
        icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15',
    },
    {
        title: 'Custom Templates',
        description: 'Plug in any message type via `customMessageTypes` keyed by `type`.',
        icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5',
    },
    {
        title: 'Accessibility',
        description: 'Trap-focus, ARIA labels, keyboard shortcuts, live announcements.',
        icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z',
    },
];

const ChatWindowPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Chat Window
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A complete, fully-controlled chat surface. Bring your own messages and backend; the component handles rendering, the
                    composer, theming, attachments, reactions, replies, accessibility, and a whole lot more.
                </p>
            </div>

            <section className="scroll-mt-8" id="basic">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Type any message — the bot will stream a few canned replies back to mimic a real conversation.
                </p>
                <BasicChatDemo />
            </section>

            <section className="scroll-mt-8" id="theme-switcher">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Live Theme Switcher
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Switch between any of the 9 built-in themes and the color mode (auto/light/dark) on a running chat. Every surface,
                    bubble, and gradient updates instantly.
                </p>
                <ThemeSwitchDemo />
            </section>

            <section className="scroll-mt-8" id="features">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Rich Features</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Reactions, replies, the actions menu, feedback, emoji picker, and drag-drop attachments — all enabled at once. Hover or
                    long-press a message to interact.
                </p>
                <FeaturesDemo />
            </section>

            <section className="scroll-mt-8" id="import">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock
                    code={`import { ChatWindow } from 'fluxo-ui';

import type {
  ChatWindowProps,
  ChatMessage,
  ChatRole,
  ChatTheme,
  ChatColorMode,
  ChatSendPayload,
} from 'fluxo-ui';`}
                />
            </section>

            <section className="scroll-mt-8" id="props">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>ChatWindow Props</h2>
                <PropsTable props={chatWindowProps} />
            </section>

            <section className="scroll-mt-8" id="features-grid">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Capabilities</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default ChatWindowPage;
