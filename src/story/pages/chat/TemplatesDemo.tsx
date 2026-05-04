import React from 'react';
import { ChatWindow, type ChatMessage, type ChatSendPayload } from '../../../components/chat';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import EmbeddedChatFrame from './EmbeddedChatFrame';
import { nextMessageId } from './chat-story-data';

const seedMessages = (): ChatMessage[] => [
    {
        id: nextMessageId(),
        role: 'assistant',
        type: 'text',
        content: "Welcome! Here are a few of the message types this chat supports out of the box.",
        status: 'read',
        createdAt: new Date(Date.now() - 9 * 60_000),
    },
    {
        id: nextMessageId(),
        role: 'assistant',
        type: 'text',
        content: 'Plain **text** with *inline formatting*, links like https://fluxo-ui.dev, and even URLs that auto-resolve to media.',
        status: 'read',
        createdAt: new Date(Date.now() - 8 * 60_000),
    },
    {
        id: nextMessageId(),
        role: 'assistant',
        type: 'image',
        content: 'A single image preview with a click-to-zoom lightbox:',
        media: [
            { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600', name: 'Mountain lake' },
        ],
        status: 'read',
        createdAt: new Date(Date.now() - 7 * 60_000),
    },
    {
        id: nextMessageId(),
        role: 'assistant',
        type: 'image',
        content: 'A multi-image carousel:',
        media: [
            { url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600', name: 'Cat' },
            { url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600', name: 'Dog' },
            { url: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600', name: 'Squirrel' },
        ],
        status: 'read',
        createdAt: new Date(Date.now() - 6 * 60_000),
    },
    {
        id: nextMessageId(),
        role: 'assistant',
        type: 'file',
        content: 'A file attachment:',
        attachments: [
            { name: 'roadmap-q4-2026.pdf', size: 2_400_000, type: 'application/pdf' },
        ],
        status: 'read',
        createdAt: new Date(Date.now() - 5 * 60_000),
    },
    {
        id: nextMessageId(),
        role: 'assistant',
        type: 'youtube',
        content: 'A YouTube embed:',
        media: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', name: 'Rick Astley - Never Gonna Give You Up' },
        status: 'read',
        createdAt: new Date(Date.now() - 4 * 60_000),
    },
    {
        id: nextMessageId(),
        role: 'assistant',
        type: 'options',
        content: 'How would you describe your role?',
        media: {
            flowId: 'role-flow',
            options: [
                { title: 'Designer', subTitle: 'I make things look good', value: 'designer' },
                { title: 'Engineer', subTitle: 'I make things work', value: 'engineer' },
                { title: 'Product', subTitle: 'I make things happen', value: 'product' },
                { title: 'Other', subTitle: 'Tell me more', value: 'other' },
            ],
        },
        status: 'read',
        createdAt: new Date(Date.now() - 3 * 60_000),
    },
    {
        id: nextMessageId(),
        role: 'assistant',
        type: 'date',
        content: 'When would you like to schedule a call?',
        status: 'read',
        createdAt: new Date(Date.now() - 2 * 60_000),
    },
];

const code = `// Different message types are routed via \`type\`. The built-in templates
// cover text, image, file, video, youtube, options, date, time, datetime,
// and a typing loader. Plug in your own with customMessageTypes.

const messages = [
    { id: '1', role: 'assistant', type: 'text', content: 'Hello!' },
    { id: '2', role: 'assistant', type: 'image', media: [{ url: '...' }] },
    { id: '3', role: 'assistant', type: 'options', content: 'Pick one:', media: {
        options: [{ title: 'A' }, { title: 'B' }],
    }},
    // …
];

<ChatWindow messages={messages} onSendMessage={handleSend} />`;

const TemplatesDemo: React.FC = () => {
    const [messages, setMessages] = React.useState<ChatMessage[]>(() => seedMessages());

    const handleSend = React.useCallback((data: ChatSendPayload) => {
        const text = (data.text || '').trim();
        if (!text && !data.selected) return;
        setMessages((prev) => [
            ...prev,
            {
                id: nextMessageId(),
                role: 'user',
                type: 'text',
                content: text || (data.selected as any)?.title || 'Selected',
                status: 'sent',
                createdAt: new Date(),
            },
        ]);
        const reply = data.selected
            ? `Got it — "${(data.selected as any).title}". Thanks for letting me know!`
            : "Thanks! Try sending another message or scroll up to see all the message types.";
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: nextMessageId(),
                    role: 'assistant',
                    type: 'text',
                    content: reply,
                    status: 'read',
                    createdAt: new Date(),
                },
            ]);
        }, 800);
    }, []);

    return (
        <>
            <ComponentDemo
                title="Built-in Message Templates"
                description="Scroll through the chat to see text, image, multi-image carousel, file, YouTube, and quick-reply options templates. Click an option to fire the response."
                centered={false}
            >
                <EmbeddedChatFrame height={620}>
                    <ChatWindow
                        messages={messages}
                        onSendMessage={handleSend}
                        header={{ title: 'Templates', subtitle: 'Showcase' }}
                        theme="modern"
                        showAvatars
                        showTime
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
                </EmbeddedChatFrame>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default TemplatesDemo;
