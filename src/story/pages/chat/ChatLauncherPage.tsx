import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import LauncherVariantsDemo from './LauncherVariantsDemo';
import LauncherWithWindowDemo from './LauncherWithWindowDemo';
import _props_json from './../../../components/chat/launcher/ChatLauncher.props.json';

const { chatLauncherProps } = _props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'About the launcher' },
    { id: 'variants', title: 'Variants', description: '7 visual styles' },
    { id: 'flow', title: 'Launcher → Window', description: 'Click to open the chat' },
    { id: 'props', title: 'Props', description: 'ChatLauncher API reference' },
];

const ChatLauncherPage: React.FC = () => {
    const { isDark } = useStoryTheme();
    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Chat Launcher
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A floating button that invites users to start a chat. Choose from 7 distinct visual styles, customize the colors, anchor
                    it to either bottom corner, and pair it with a <code>ChatWindow</code> for a complete flow.
                </p>
            </div>

            <section className="scroll-mt-8" id="variants">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Variants</h2>
                <LauncherVariantsDemo />
            </section>

            <section className="scroll-mt-8" id="flow">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Launcher → Window</h2>
                <LauncherWithWindowDemo />
            </section>

            <section className="scroll-mt-8" id="props">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>ChatLauncher Props</h2>
                <PropsTable props={chatLauncherProps} />
                <div className="mt-6">
                    <CodeBlock
                        code={`import { ChatLauncher } from 'fluxo-ui';

import type { ChatLauncherProps, ChatLauncherVariant, ChatLauncherAlign } from 'fluxo-ui';`}
                        language="tsx"
                    />
                </div>
            </section>
        </PageLayout>
    );
};

export default ChatLauncherPage;
