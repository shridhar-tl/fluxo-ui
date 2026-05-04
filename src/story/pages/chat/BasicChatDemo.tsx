import React from 'react';
import { ChatWindow } from '../../../components/chat';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import EmbeddedChatFrame from './EmbeddedChatFrame';
import { initialMessages } from './chat-story-data';
import { useBotSimulator } from './useBotSimulator';

const code = `import { ChatWindow } from 'fluxo-ui';
import { useState } from 'react';

function MyChat() {
    const [messages, setMessages] = useState([
        { id: '1', role: 'assistant', type: 'text', content: 'Hello! How can I help?' },
    ]);

    const handleSend = (data) => {
        setMessages((prev) => [
            ...prev,
            { id: String(Date.now()), role: 'user', type: 'text', content: data.text },
        ]);
        // …call your backend, then push the assistant reply back into messages
    };

    return (
        <ChatWindow
            messages={messages}
            onSendMessage={handleSend}
            header={{ title: 'Support', subtitle: 'Online' }}
            theme="modern"
            showAvatars
            showTime
        />
    );
}`;

const BasicChatDemo: React.FC = () => {
    const { messages, typingUsers, handleSend } = useBotSimulator({
        initialMessages: initialMessages('FluxoBot'),
    });

    return (
        <>
            <ComponentDemo
                title="Basic Chat Window"
                description="A fully working chat window. Type a message — the bot will reply with a stream of canned responses to give you a real chat feel."
                centered={false}
            >
                <EmbeddedChatFrame>
                    <ChatWindow
                        messages={messages}
                        typingUsers={typingUsers}
                        onSendMessage={handleSend}
                        header={{ title: 'FluxoBot', subtitle: 'Online · usually replies instantly' }}
                        theme="classic"
                        showAvatars
                        showTime
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
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicChatDemo;
