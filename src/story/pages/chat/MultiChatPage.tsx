import cn from 'classnames';
import React from 'react';
import PageLayout from '../../PageLayout';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import MultiChatGridDemo from './MultiChatGridDemo';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Multiple chats at once' },
    { id: 'grid', title: 'Independent Chats', description: 'Three chats with independent themes' },
];

const MultiChatPage: React.FC = () => {
    const { isDark } = useStoryTheme();
    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Multi-Chat
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    Need to render more than one chat on a single screen? <code>ChatWindow</code> has zero global state — each instance is
                    fully self-contained. Mix themes, color modes, and message streams freely. The theme switcher above each pane changes
                    only that chat.
                </p>
            </div>

            <section className="scroll-mt-8" id="grid">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Independent Chats</h2>
                <MultiChatGridDemo />
            </section>
        </PageLayout>
    );
};

export default MultiChatPage;
