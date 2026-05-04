import React from 'react';
import { Carousel } from '../../carousel';
import type { MessageRenderProps } from '../types';
import { LightboxViewer } from './LightboxViewer';

interface ImageMessageProps extends MessageRenderProps {}

interface NormalizedItem {
    url: string;
    name?: string;
    type?: string;
    description?: string;
    price?: any;
    isLink?: boolean;
    value?: string;
}

function normalize(media: any): NormalizedItem[] {
    if (!media) return [];
    const arr = Array.isArray(media) ? media : [media];
    return arr
        .filter((m) => m?.url || m?.imageUrl)
        .map((m) => ({
            url: m.url || m.imageUrl,
            name: m.name,
            type: m.type || 'image',
            description: m.description,
            price: m.price,
            isLink: m.isLink,
            value: m.value,
        }));
}

function ImageMessageTemplate({ message }: ImageMessageProps) {
    const items = React.useMemo(() => normalize(message.media), [message.media]);
    const [lightbox, setLightbox] = React.useState<number | null>(null);
    const [active, setActive] = React.useState(0);
    if (!items.length) return null;

    if (items.length === 1) {
        const it = items[0];
        return (
            <>
                {message.content && <div className="eui-chat-msg-text" style={{ marginBottom: 6 }}>{message.content}</div>}
                <button type="button" className="eui-chat-media-btn" onClick={() => setLightbox(0)} aria-label={it.name || 'Open image'}>
                    <img src={it.url} alt={it.name || ''} className="eui-chat-media-img" />
                </button>
                {lightbox != null && <LightboxViewer items={items} startIndex={lightbox} onClose={() => setLightbox(null)} />}
            </>
        );
    }

    const slides = items.map((item, i) => ({
        id: `slide-${i}`,
        type: 'image' as const,
        src: item.url,
        alt: item.name || '',
        name: item.name,
        description: item.description,
    }));

    return (
        <>
            {message.content && <div className="eui-chat-msg-text" style={{ marginBottom: 6 }}>{message.content}</div>}
            <div className="eui-chat-image-slider" onClick={() => setLightbox(active)} role="presentation">
                <Carousel slides={slides} navigation="dots" showArrows loop activeIndex={active} onSlideChange={setActive} />
            </div>
            {lightbox != null && <LightboxViewer items={items} startIndex={lightbox} onClose={() => setLightbox(null)} />}
        </>
    );
}

(ImageMessageTemplate as any).showTime = true;

export default ImageMessageTemplate;
