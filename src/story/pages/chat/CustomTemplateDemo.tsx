import React from 'react';
import { ChatWindow, type ChatMessage, type MessageRenderProps } from '../../../components/chat';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import EmbeddedChatFrame from './EmbeddedChatFrame';
import { nextMessageId } from './chat-story-data';

interface ProductCardData {
    name: string;
    image: string;
    price: string;
    rating: number;
}

function ProductCardTemplate({ message, onSendMessage }: MessageRenderProps) {
    const data = message.media as ProductCardData;
    if (!data) return null;
    return (
        <div
            style={{
                display: 'flex',
                gap: 12,
                padding: 12,
                background: 'var(--euic-bg)',
                border: '1px solid var(--euic-border)',
                borderRadius: 12,
                maxWidth: 320,
            }}
        >
            <img
                src={data.image}
                alt={data.name}
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--euic-text)' }}>{data.name}</div>
                <div style={{ fontSize: 13, color: 'var(--euic-text-muted)', marginTop: 2 }}>★ {data.rating.toFixed(1)}</div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 8,
                    }}
                >
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--euic-primary)' }}>{data.price}</span>
                    <button
                        type="button"
                        onClick={() =>
                            onSendMessage?.({
                                type: 'product-action',
                                method: 'add-to-cart',
                                payload: { name: data.name },
                            })
                        }
                        style={{
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            background: 'var(--euic-primary)',
                            color: 'var(--euic-font)',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                        }}
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}

(ProductCardTemplate as any).noContainer = true;

const seed: ChatMessage[] = [
    {
        id: nextMessageId(),
        role: 'assistant',
        type: 'text',
        content: 'Here are a few products you might like:',
        status: 'read',
        createdAt: new Date(Date.now() - 3 * 60_000),
    },
    {
        id: nextMessageId(),
        role: 'assistant',
        type: 'product',
        media: {
            name: 'Wireless Headphones',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
            price: '$129',
            rating: 4.6,
        },
        status: 'read',
        createdAt: new Date(Date.now() - 2 * 60_000),
    },
    {
        id: nextMessageId(),
        role: 'assistant',
        type: 'product',
        media: {
            name: 'Smart Watch',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
            price: '$249',
            rating: 4.8,
        },
        status: 'read',
        createdAt: new Date(Date.now() - 60_000),
    },
];

const code = `function ProductCardTemplate({ message, onSendMessage }) {
    const data = message.media;
    return (
        <div className="product-card">
            <img src={data.image} alt={data.name} />
            <div>{data.name}</div>
            <button onClick={() => onSendMessage({ type: 'product-action', method: 'add-to-cart', payload: data })}>
                Add
            </button>
        </div>
    );
}
ProductCardTemplate.noContainer = true; // skip the standard bubble wrapper

<ChatWindow
    messages={messages}
    onSendMessage={handleSend}
    customMessageTypes={{ product: ProductCardTemplate }}
/>`;

const CustomTemplateDemo: React.FC = () => {
    const [messages, setMessages] = React.useState<ChatMessage[]>(seed);

    return (
        <>
            <ComponentDemo
                title="Custom Message Template"
                description="Plug in any React component as a renderer for a custom message type. Below, a `product` type renders as a fully custom card. Click 'Add' to fire a custom action."
                centered={false}
            >
                <EmbeddedChatFrame height={520}>
                    <ChatWindow
                        messages={messages}
                        onSendMessage={(d) => {
                            const text = (d.text || '').trim();
                            if (!text && !d.method) return;
                            setMessages((prev) => [
                                ...prev,
                                {
                                    id: nextMessageId(),
                                    role: 'user',
                                    type: 'text',
                                    content: text || `Added "${d.payload?.name}" to cart`,
                                    status: 'sent',
                                    createdAt: new Date(),
                                },
                            ]);
                        }}
                        customMessageTypes={{ product: ProductCardTemplate as any }}
                        header={{ title: 'Shop', subtitle: 'Curated picks' }}
                        theme="ember"
                        showAvatars
                        showTime
                        width={400}
                        height={480}
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

export default CustomTemplateDemo;
