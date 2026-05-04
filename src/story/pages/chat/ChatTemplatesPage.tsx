import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import PageLayout from '../../PageLayout';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import CustomTemplateDemo from './CustomTemplateDemo';
import TemplatesDemo from './TemplatesDemo';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Built-in + custom message types' },
    { id: 'builtin', title: 'Built-in Templates', description: 'Text, image, file, options, video, etc.' },
    { id: 'custom', title: 'Custom Template', description: 'Plug in your own renderer' },
    { id: 'reference', title: 'Type Reference', description: 'Available built-in types' },
];

const referenceCode = `// Built-in message types
type BuiltInType =
    | 'text'        // Default. \`content\` is a string with markdown-ish formatting.
    | 'image'       // \`media\` is an item or array of { url, name, description }.
    | 'file' | 'pdf' // \`attachments\` array.
    | 'video'       // \`media: { url }\`.
    | 'youtube'     // \`media: { url }\` (any YouTube URL).
    | 'options'     // \`media: { flowId, options: [{ title, value, ... }] }\`.
    | 'date'        // Date picker — emits selected date back via onSendMessage.
    | 'time'        // Time picker.
    | 'datetime'    // Date + time.
    | 'loader';     // Typing indicator (usually managed via typingUsers / showLoader).`;

const ChatTemplatesPage: React.FC = () => {
    const { isDark } = useStoryTheme();
    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Chat Templates
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    Each message has a <code>type</code>. The chat routes it to a renderer. Use the built-in templates for common cases —
                    text, images, files, options, video — or plug in your own React component for richer message types.
                </p>
            </div>

            <section className="scroll-mt-8" id="builtin">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Built-in Templates</h2>
                <TemplatesDemo />
            </section>

            <section className="scroll-mt-8" id="custom">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom Template</h2>
                <CustomTemplateDemo />
            </section>

            <section className="scroll-mt-8" id="reference">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Type Reference</h2>
                <CodeBlock code={referenceCode} language="tsx" />
            </section>
        </PageLayout>
    );
};

export default ChatTemplatesPage;
