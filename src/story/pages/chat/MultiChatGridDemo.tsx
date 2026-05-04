import React from 'react';
import { ChatWindow, type ChatColorMode, type ChatTheme } from '../../../components/chat';
import { Dropdown } from '../../../components/Dropdown';
import { SelectButton } from '../../../components/SelectButton';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { CHAT_THEMES, initialMessages } from './chat-story-data';
import { useBotSimulator } from './useBotSimulator';

const themeOptions = CHAT_THEMES.map((t) => ({ value: t.value, label: t.label }));
const modeOptions: { value: ChatColorMode; label: string }[] = [
    { value: 'auto', label: 'Auto' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
];

interface ChatPaneProps {
    botName: string;
    initialTheme: ChatTheme;
    initialMode: ChatColorMode;
}

const ChatPane: React.FC<ChatPaneProps> = ({ botName, initialTheme, initialMode }) => {
    const [theme, setTheme] = React.useState<ChatTheme>(initialTheme);
    const [mode, setMode] = React.useState<ChatColorMode>(initialMode);
    const { messages, typingUsers, handleSend, reset } = useBotSimulator({
        initialMessages: initialMessages(botName),
        botName,
    });

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                border: '1px solid var(--eui-border-subtle)',
                borderRadius: 10,
                background: 'var(--eui-bg)',
                padding: 12,
                minWidth: 0,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                    paddingBottom: 8,
                    borderBottom: '1px solid var(--eui-border-subtle)',
                }}
            >
                <strong style={{ fontSize: 13, color: 'var(--eui-text)' }}>{botName}</strong>
                <div style={{ minWidth: 140 }}>
                    <Dropdown options={themeOptions} value={theme} onChange={(e) => setTheme(e.value as ChatTheme)} />
                </div>
                <SelectButton items={modeOptions} value={mode} onChange={(e) => setMode(e.value as ChatColorMode)} />
                <button
                    type="button"
                    onClick={reset}
                    style={{
                        marginLeft: 'auto',
                        padding: '4px 10px',
                        fontSize: 12,
                        background: 'transparent',
                        color: 'var(--eui-text-muted)',
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 6,
                        cursor: 'pointer',
                    }}
                >
                    Reset
                </button>
            </div>
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: 520,
                    background: 'var(--eui-bg-subtle)',
                    border: '1px solid var(--eui-border-subtle)',
                    borderRadius: 8,
                    overflow: 'hidden',
                }}
            >
                <ChatWindow
                    messages={messages}
                    typingUsers={typingUsers}
                    onSendMessage={handleSend}
                    header={{ title: botName, subtitle: 'Online' }}
                    theme={theme}
                    colorMode={mode}
                    showAvatars
                    showTime
                    width={360}
                    height={500}
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
            </div>
        </div>
    );
};

const code = `// Multiple ChatWindow instances, each with independent state and theme.
// Just instantiate as many as you need — there's no global state to coordinate.

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
    <ChatWindow theme="aurora" messages={support.messages} onSendMessage={support.send} />
    <ChatWindow theme="iris"   messages={sales.messages}   onSendMessage={sales.send}   />
    <ChatWindow theme="modern" messages={success.messages} onSendMessage={success.send} />
</div>`;

const MultiChatGridDemo: React.FC = () => (
    <>
        <ComponentDemo
            title="Three Independent Chats"
            description="Three chat windows on the same screen — each with its own messages, theme, color mode, and bot. Type into any of them to see them animate independently."
            centered={false}
        >
            <div
                style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                    gap: 16,
                }}
            >
                <ChatPane botName="Support" initialTheme="aurora" initialMode="auto" />
                <ChatPane botName="Sales" initialTheme="iris" initialMode="auto" />
                <ChatPane botName="Success" initialTheme="modern" initialMode="auto" />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default MultiChatGridDemo;
