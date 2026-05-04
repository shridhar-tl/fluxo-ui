import React from 'react';
import { ChatWindow, type ChatColorMode, type ChatMessage } from '../../../components/chat';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { CHAT_THEMES, nextMessageId } from './chat-story-data';

const sampleMessages: ChatMessage[] = [
    {
        id: nextMessageId(),
        role: 'assistant',
        type: 'text',
        content: 'Hey! Welcome to FluxoUI ✨',
        status: 'read',
        createdAt: new Date(Date.now() - 60_000),
    },
    {
        id: nextMessageId(),
        role: 'user',
        type: 'text',
        content: 'How do I switch themes?',
        status: 'read',
        createdAt: new Date(Date.now() - 50_000),
    },
    {
        id: nextMessageId(),
        role: 'assistant',
        type: 'text',
        content: 'Just pass the `theme` prop. Easy as that.',
        status: 'read',
        createdAt: new Date(Date.now() - 40_000),
    },
    {
        id: nextMessageId(),
        role: 'user',
        type: 'text',
        content: 'Nice! Looks great.',
        status: 'read',
        createdAt: new Date(Date.now() - 30_000),
    },
];

const code = `<ChatWindow theme="aurora" colorMode="dark" messages={messages} />`;

const ThemeCard: React.FC<{ themeKey: string; label: string; description: string; mode: ChatColorMode }> = ({
    themeKey,
    label,
    description,
    mode,
}) => (
    <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--eui-border-subtle)',
            borderRadius: 10,
            overflow: 'hidden',
            background: 'var(--eui-bg)',
        }}
    >
        <div
            style={{
                position: 'relative',
                height: 380,
                background: 'var(--eui-bg-subtle)',
            }}
        >
            <ChatWindow
                messages={sampleMessages}
                onSendMessage={() => {}}
                header={{ title: label, subtitle: 'Preview' }}
                theme={themeKey as any}
                colorMode={mode}
                showAvatars
                noShadow
                noAnimation
                showSendButton={false}
                composerDisabled
                composerPlaceholder="Preview"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: 'auto',
                    height: 'auto',
                    maxWidth: 'none',
                    maxHeight: 'none',
                    borderRadius: 0,
                }}
                spacingCorner="0px"
                spacingBottom="0px"
            />
        </div>
        <div style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--eui-text)' }}>{label}</div>
            <div style={{ fontSize: 12, color: 'var(--eui-text-muted)', marginTop: 2 }}>{description}</div>
        </div>
    </div>
);

const ThemeGalleryDemo: React.FC<{ mode: ChatColorMode }> = ({ mode }) => (
    <>
        <ComponentDemo
            title={`All 9 Themes — ${mode === 'dark' ? 'Dark Mode' : mode === 'light' ? 'Light Mode' : 'Auto Mode'}`}
            description="Every theme is shown with the same conversation. Pick the one that matches your brand vibe."
            centered={false}
        >
            <div
                style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 16,
                }}
            >
                {CHAT_THEMES.map((t) => (
                    <ThemeCard key={t.value} themeKey={t.value} label={t.label} description={t.description} mode={mode} />
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default ThemeGalleryDemo;
