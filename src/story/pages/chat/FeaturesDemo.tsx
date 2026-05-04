import React from 'react';
import { ChatWindow, type ChatMessage } from '../../../components/chat';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import EmbeddedChatFrame from './EmbeddedChatFrame';
import { initialMessages, nextMessageId } from './chat-story-data';
import { useBotSimulator } from './useBotSimulator';

const code = `<ChatWindow
    messages={messages}
    onSendMessage={handleSend}
    showAvatars
    showTime
    reactions={{ enabled: true, onReact: (id, emoji) => mutateReaction(id, emoji) }}
    feedback={{ enabled: true, onFeedback: (id, value) => recordFeedback(id, value) }}
    reply={{ enabled: true, style: 'pinned' }}
    messageActions={{
        enabled: true,
        items: [
            { id: 'copy', label: 'Copy', onClick: copyToClipboard },
            { id: 'delete', label: 'Delete', onClick: deleteMessage, appliesTo: 'user' },
        ],
    }}
    emoji={{ enabled: true, shortcodes: true }}
    attachments={{ enabled: true, maxFiles: 5, maxSize: 10 * 1024 * 1024 }}
/>`;

const seedMessages = (): ChatMessage[] => [
    ...initialMessages('Sasha'),
    {
        id: nextMessageId(),
        role: 'user',
        type: 'text',
        content: 'Hi Sasha! Quick question about the reactions feature.',
        status: 'read',
        createdAt: new Date(Date.now() - 50_000),
    },
    {
        id: nextMessageId(),
        role: 'assistant',
        type: 'text',
        content: 'Sure thing! Hover or long-press any message to see the reaction shelf, reply, and the actions menu.',
        status: 'read',
        createdAt: new Date(Date.now() - 40_000),
        reactions: { '👍': ['user-1'], '❤️': ['user-2', 'user-3'] },
    },
];

const FeaturesDemo: React.FC = () => {
    const sim = useBotSimulator({ initialMessages: seedMessages(), botName: 'Sasha' });
    const [reactions, setReactions] = React.useState<Record<string, Record<string, string[]>>>({});

    const messagesWithReactions = React.useMemo(
        () =>
            sim.messages.map((m) => {
                const local = m.id ? reactions[m.id] : undefined;
                if (!local) return m;
                const merged = { ...(m.reactions || {}) };
                for (const [emoji, users] of Object.entries(local)) {
                    merged[emoji] = users;
                }
                return { ...m, reactions: merged };
            }),
        [sim.messages, reactions],
    );

    const onReact = React.useCallback((id: string, emoji: string) => {
        setReactions((prev) => {
            const cur = { ...(prev[id] || {}) };
            const list = cur[emoji] ? [...cur[emoji]] : [];
            const me = 'me';
            if (list.includes(me)) {
                cur[emoji] = list.filter((u) => u !== me);
                if (cur[emoji].length === 0) delete cur[emoji];
            } else {
                cur[emoji] = [...list, me];
            }
            return { ...prev, [id]: cur };
        });
    }, []);

    return (
        <>
            <ComponentDemo
                title="Rich Features"
                description="Reactions, replies, message actions, feedback (👍/👎), emoji picker, attachments — all enabled. Hover any message to see the action bar."
                centered={false}
            >
                <EmbeddedChatFrame height={620}>
                    <ChatWindow
                        messages={messagesWithReactions}
                        typingUsers={sim.typingUsers}
                        onSendMessage={sim.handleSend}
                        header={{ title: 'Sasha', subtitle: 'Senior Designer' }}
                        theme="iris"
                        showAvatars
                        showTime
                        reactions={{ enabled: true, onReact }}
                        feedback={{ enabled: true }}
                        reply={{ enabled: true, style: 'pinned' }}
                        messageActions={{
                            enabled: true,
                            items: [
                                {
                                    id: 'copy',
                                    label: 'Copy',
                                    onClick: (m) => {
                                        if (typeof m.content === 'string') {
                                            navigator.clipboard?.writeText(m.content);
                                        }
                                    },
                                },
                            ],
                        }}
                        emoji={{ enabled: true, shortcodes: true }}
                        attachments={{ enabled: true, maxFiles: 5, maxSize: 10 * 1024 * 1024 }}
                        width={400}
                        height={580}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            bottom: 'auto',
                            right: 'auto',
                            maxWidth: '100%',
                            maxHeight: '100%',
                        }}
                    />
                </EmbeddedChatFrame>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default FeaturesDemo;
