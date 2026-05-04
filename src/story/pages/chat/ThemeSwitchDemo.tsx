import React from 'react';
import { ChatWindow, type ChatColorMode, type ChatTheme } from '../../../components/chat';
import { Dropdown } from '../../../components/Dropdown';
import { SelectButton } from '../../../components/SelectButton';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import EmbeddedChatFrame from './EmbeddedChatFrame';
import { CHAT_THEMES, initialMessages } from './chat-story-data';
import { useBotSimulator } from './useBotSimulator';

const themeOptions = CHAT_THEMES.map((t) => ({ value: t.value, label: `${t.label} — ${t.description}` }));
const modeOptions = [
    { value: 'auto', label: 'Auto' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
];

const code = `const [theme, setTheme] = useState('classic');
const [colorMode, setColorMode] = useState('auto');

<ChatWindow
    theme={theme}
    colorMode={colorMode}
    messages={messages}
    onSendMessage={handleSend}
/>`;

const ThemeSwitchDemo: React.FC = () => {
    const [theme, setTheme] = React.useState<ChatTheme>('aurora');
    const [colorMode, setColorMode] = React.useState<ChatColorMode>('auto');

    const { messages, typingUsers, handleSend, reset } = useBotSimulator({
        initialMessages: initialMessages('Aria'),
    });

    return (
        <>
            <ComponentDemo
                title="Live Theme Switcher"
                description="Switch between any of the 9 built-in themes on a running chat — colors, gradients, bubble shapes, and surfaces update instantly. Try sending a message to feel the theme in motion."
                centered={false}
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div
                        style={{
                            display: 'flex',
                            gap: 12,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            padding: '12px 14px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 8,
                        }}
                    >
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--eui-text)' }}>Theme:</span>
                        <div style={{ minWidth: 280 }}>
                            <Dropdown options={themeOptions} value={theme} onChange={(e) => setTheme(e.value as ChatTheme)} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--eui-text)', marginLeft: 12 }}>Mode:</span>
                        <SelectButton
                            items={modeOptions}
                            value={colorMode}
                            onChange={(e) => setColorMode(e.value as ChatColorMode)}
                        />
                        <button
                            type="button"
                            onClick={reset}
                            style={{
                                marginLeft: 'auto',
                                padding: '6px 12px',
                                fontSize: 13,
                                background: 'var(--eui-primary)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                            }}
                        >
                            Reset chat
                        </button>
                    </div>
                    <EmbeddedChatFrame height={580}>
                        <ChatWindow
                            messages={messages}
                            typingUsers={typingUsers}
                            onSendMessage={handleSend}
                            header={{ title: 'Aria', subtitle: 'AI Concierge' }}
                            theme={theme}
                            colorMode={colorMode}
                            showAvatars
                            showTime
                            reactions={{ enabled: true }}
                            feedback={{ enabled: true }}
                            width={400}
                            height={540}
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
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default ThemeSwitchDemo;
