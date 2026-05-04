import type { ChatConversationItem, ChatMessage, ChatTheme } from '../../../components/chat';

export const CHAT_THEMES: { value: ChatTheme; label: string; description: string }[] = [
    { value: 'classic', label: 'Classic', description: 'Clean, professional, neutral' },
    { value: 'modern', label: 'Modern', description: 'Crisp, minimal, blue accents' },
    { value: 'iris', label: 'Iris', description: 'Soft purple gradients' },
    { value: 'dusk', label: 'Dusk', description: 'Twilight blues and indigos' },
    { value: 'mist', label: 'Mist', description: 'Airy pastel pinks' },
    { value: 'ember', label: 'Ember', description: 'Warm amber and rose' },
    { value: 'canvas', label: 'Canvas', description: 'Paper-like off-white tones' },
    { value: 'prism', label: 'Prism', description: 'Multi-hue gradient pop' },
    { value: 'aurora', label: 'Aurora', description: 'Northern-lights teal/violet' },
];

export const BOT_REPLIES: string[] = [
    'Hi there! 👋 Thanks for reaching out — how can I help you today?',
    "FluxoUI ships with **80+ production-ready components** — buttons, tables, charts, editors, calendars, and more.",
    'You can install it via npm: `npm install fluxo-ui`. Then import any component from `fluxo-ui`.',
    'The chat component supports **9 built-in themes**: classic, modern, iris, dusk, mist, ember, canvas, prism, and aurora.',
    'Switching themes is as simple as passing a `theme` prop. Try the theme switcher above to see it live!',
    'Need a custom message type? Pass a renderer in `customMessageTypes` keyed by your `type` string.',
    'The composer supports **emoji shortcodes** (`:smile:`), file attachments via drag-and-drop, and Shift+Enter for newlines.',
    'Reactions, replies, feedback (👍/👎), retry-on-failure, typing indicators — all built in and consumer-driven.',
    "I love how the **Aurora** theme animates the gradient — feels alive without being distracting.",
    "Pro tip: enable `draggable` and `resizable` to let users move and resize the chat window. Position can be persisted to localStorage.",
    "The launcher has **7 visual variants**: icon, morph, beacon, pulsar, expand, bar, and spark. Each has its own personality.",
    "Multi-conversation flows are easy: wrap `ChatWindow` inside `ChatConversations` and pass an `activeId`.",
    'Did you know the message renderer accepts markdown-ish text — `**bold**`, `*italic*`, links, and even inline media URLs?',
    'For accessibility, the window supports keyboard shortcuts (`Esc` to close, `Ctrl+/` for help) and trap-focus when fullscreen.',
    "The component is **fully controlled**: you own the messages array. That makes integrating with any backend trivial.",
    "Avatars, timestamps, message status (sending/sent/delivered/read/failed) — all togglable with single boolean props.",
    "Try the `options` message type to render a quick-reply card. Selection emits a `flow-response` event back through `onUserAction`.",
    "Want suggestion chips above the composer? Use the `aboveComposerSlot` — render anything you like there.",
    "Light, dark, and auto color modes are supported. The `colorMode` prop forces one or follows the page theme.",
    "All 9 themes adapt cleanly to dark mode — no extra CSS needed. Just toggle `colorMode='dark'`.",
    "The whole chat surface is **CSS-variable driven**, so you can override `--euic-*` vars to brand it to your product.",
];

let messageIdCounter = 1;
export const nextMessageId = (): string => `msg-${Date.now()}-${messageIdCounter++}`;

export const initialMessages = (assistantName = 'FluxoBot'): ChatMessage[] => [
    {
        id: nextMessageId(),
        role: 'assistant',
        type: 'text',
        content: `Hello! I'm ${assistantName}. Ask me anything about the FluxoUI chat component, or just type "hi" to see me reply with a few sample messages.`,
        status: 'read',
        createdAt: new Date(Date.now() - 60_000),
    },
];

export const initialConversationStarter = (): ChatMessage[] => [
    {
        id: nextMessageId(),
        role: 'assistant',
        type: 'text',
        content: "Welcome! Pick a conversation from the left, or start chatting here. I'll respond with a few sample messages.",
        status: 'read',
        createdAt: new Date(Date.now() - 120_000),
    },
];

export const conversationsSample = (): ChatConversationItem[] => [
    {
        id: 'conv-1',
        title: 'Sarah Wilson',
        subtitle: 'Product Designer',
        avatar: 'https://i.pravatar.cc/80?img=47',
        lastMessage: 'Sure thing! Sending over the mockups now.',
        lastMessageAt: new Date(Date.now() - 5 * 60_000),
        unreadCount: 2,
        pinned: true,
        badges: [{ label: 'Design', color: '#fff', bgColor: '#8b5cf6' }],
    },
    {
        id: 'conv-2',
        title: 'Engineering Team',
        subtitle: '5 members',
        avatar: 'https://i.pravatar.cc/80?img=12',
        lastMessage: 'Mike: Pushed the auth fix to staging.',
        lastMessageAt: new Date(Date.now() - 22 * 60_000),
        unreadCount: 7,
    },
    {
        id: 'conv-3',
        title: 'Customer Support',
        subtitle: 'AI Assistant',
        avatar: 'https://i.pravatar.cc/80?img=33',
        lastMessage: 'Your refund has been processed successfully.',
        lastMessageAt: new Date(Date.now() - 60 * 60_000),
        badges: [{ label: 'AI', color: '#fff', bgColor: '#10b981' }],
    },
    {
        id: 'conv-4',
        title: 'Alex Chen',
        subtitle: 'Engineering Lead',
        avatar: 'https://i.pravatar.cc/80?img=68',
        lastMessage: 'Lets sync up tomorrow at 10.',
        lastMessageAt: new Date(Date.now() - 3 * 60 * 60_000),
    },
    {
        id: 'conv-5',
        title: 'Marketing',
        subtitle: 'Campaign updates',
        avatar: 'https://i.pravatar.cc/80?img=21',
        lastMessage: 'Q4 launch deck is ready for review 🎉',
        lastMessageAt: new Date(Date.now() - 26 * 60 * 60_000),
        archived: false,
    },
    {
        id: 'conv-6',
        title: 'Old project',
        subtitle: 'Archived',
        lastMessage: 'Thanks everyone, closing out the thread.',
        lastMessageAt: new Date(Date.now() - 14 * 24 * 60 * 60_000),
        archived: true,
    },
];
