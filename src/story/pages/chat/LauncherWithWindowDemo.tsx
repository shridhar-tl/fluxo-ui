import React from 'react';
import { ChatLauncher, ChatWindow, type ChatLauncherVariant } from '../../../components/chat';
import { Dropdown } from '../../../components/Dropdown';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import EmbeddedChatFrame from './EmbeddedChatFrame';
import { initialMessages } from './chat-story-data';
import { useBotSimulator } from './useBotSimulator';

const variantOptions = [
    { value: 'spark', label: 'Spark' },
    { value: 'icon', label: 'Icon' },
    { value: 'morph', label: 'Morph' },
    { value: 'beacon', label: 'Beacon' },
    { value: 'pulsar', label: 'Pulsar' },
    { value: 'expand', label: 'Expand' },
];

const code = `const [open, setOpen] = useState(false);

<>
  {!open && (
    <ChatLauncher
        variant="spark"
        text="Chat with us"
        onClick={() => setOpen(true)}
    />
  )}
  {open && (
    <ChatWindow
        messages={messages}
        onSendMessage={handleSend}
        onMinimize={() => setOpen(false)}
        onClose={() => setOpen(false)}
    />
  )}
</>`;

const LauncherWithWindowDemo: React.FC = () => {
    const [variant, setVariant] = React.useState<ChatLauncherVariant>('spark');
    const [open, setOpen] = React.useState(false);
    const sim = useBotSimulator({ initialMessages: initialMessages('Concierge'), botName: 'Concierge' });
    const frameRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (open || variant !== 'expand') return;
        const t = window.setTimeout(() => {
            frameRef.current
                ?.querySelectorAll('.eui-chat-expand-collapsed')
                .forEach((el) => el.classList.remove('eui-chat-expand-collapsed'));
        }, 50);
        return () => window.clearTimeout(t);
    }, [open, variant]);

    return (
        <>
            <ComponentDemo
                title="Launcher → Window Flow"
                description="Click the launcher to open the chat window. Minimize or close to return to the launcher."
                centered={false}
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div
                        style={{
                            display: 'flex',
                            gap: 12,
                            alignItems: 'center',
                            padding: '10px 14px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 8,
                        }}
                    >
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--eui-text)' }}>Launcher variant:</span>
                        <div style={{ minWidth: 200 }}>
                            <Dropdown
                                options={variantOptions}
                                value={variant}
                                onChange={(e) => setVariant(e.value as ChatLauncherVariant)}
                            />
                        </div>
                        {open && (
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
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
                                Close window
                            </button>
                        )}
                    </div>
                    <EmbeddedChatFrame height={520}>
                        <div ref={frameRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                            {!open && (
                                <div style={{ pointerEvents: 'auto' }}>
                                    <ChatLauncher
                                        variant={variant}
                                        text="Chat with us"
                                        autoAnimate={false}
                                        onClick={() => setOpen(true)}
                                        style={{ position: 'absolute', bottom: 16, right: 16 }}
                                    />
                                </div>
                            )}
                        </div>
                        {open && (
                            <ChatWindow
                                messages={sim.messages}
                                typingUsers={sim.typingUsers}
                                onSendMessage={sim.handleSend}
                                onMinimize={() => {
                                    setOpen(false);
                                    return true;
                                }}
                                onClose={() => {
                                    setOpen(false);
                                    return true;
                                }}
                                header={{ title: 'Concierge', subtitle: 'Online' }}
                                theme="modern"
                                showAvatars
                                showTime
                                width={380}
                                height={480}
                                style={{
                                    position: 'absolute',
                                    bottom: 16,
                                    right: 16,
                                    top: 'auto',
                                    left: 'auto',
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                }}
                            />
                        )}
                    </EmbeddedChatFrame>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default LauncherWithWindowDemo;
