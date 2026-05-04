import React from 'react';
import { ChatConversations, ChatWindow, type ChatMessage, type ChatTheme } from '../../../components/chat';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { conversationsSample, nextMessageId } from './chat-story-data';
import { useBotSimulator } from './useBotSimulator';

const conversationThemeMap: Record<string, ChatTheme> = {
    'conv-1': 'iris',
    'conv-2': 'modern',
    'conv-3': 'aurora',
    'conv-4': 'classic',
    'conv-5': 'ember',
    'conv-6': 'canvas',
};

const seedFor = (title: string): ChatMessage[] => [
    {
        id: nextMessageId(),
        role: 'assistant',
        type: 'text',
        content: `This is the **${title}** thread. Try sending a message — bot responses are simulated.`,
        status: 'read',
        createdAt: new Date(Date.now() - 60_000),
    },
];

const code = `<ChatConversations
    conversations={conversations}
    activeId={activeId}
    onSelect={setActiveId}
    title="Inbox"
>
    <ChatWindow messages={messagesFor(activeId)} onSendMessage={handleSend} />
</ChatConversations>`;

const ConversationsDemo: React.FC = () => {
    const conversations = React.useMemo(() => conversationsSample(), []);
    const [activeId, setActiveId] = React.useState<string>(conversations[0].id);
    const [hideArchived, setHideArchived] = React.useState(true);

    const active = conversations.find((c) => c.id === activeId);
    const seedMessages = React.useMemo(() => seedFor(String(active?.title ?? '')), [active?.title]);

    const sim = useBotSimulator({
        initialMessages: seedMessages,
        botName: typeof active?.title === 'string' ? active.title : 'Bot',
    });

    React.useEffect(() => {
        sim.reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeId]);

    const theme = conversationThemeMap[activeId] || 'modern';

    return (
        <>
            <ComponentDemo
                title="Multi-Conversation Inbox"
                description="A working inbox with multiple conversations. Click any thread on the left to switch — the right pane updates instantly. Each conversation gets its own theme to make context-switching obvious."
                centered={false}
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <label
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 13,
                            color: 'var(--eui-text)',
                            cursor: 'pointer',
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={hideArchived}
                            onChange={(e) => setHideArchived(e.target.checked)}
                        />
                        Hide archived conversations
                    </label>
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: 620,
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 8,
                            overflow: 'hidden',
                            background: 'var(--eui-bg)',
                        }}
                    >
                        <ChatConversations
                            conversations={conversations}
                            activeId={activeId}
                            onSelect={setActiveId}
                            title="Inbox"
                            hideArchived={hideArchived}
                            sidebarWidth="300px"
                        >
                            <div style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--eui-bg-subtle)' }}>
                                {active && (
                                    <ChatWindow
                                        key={activeId}
                                        messages={sim.messages}
                                        typingUsers={sim.typingUsers}
                                        onSendMessage={sim.handleSend}
                                        header={{
                                            title: active.title,
                                            subtitle: active.subtitle,
                                            logo: typeof active.avatar === 'string' ? { url: active.avatar } : undefined,
                                        }}
                                        theme={theme}
                                        showAvatars
                                        showTime
                                        reactions={{ enabled: true }}
                                        feedback={{ enabled: true }}
                                        width={420}
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
                                )}
                            </div>
                        </ChatConversations>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default ConversationsDemo;
