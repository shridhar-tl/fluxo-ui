import React from 'react';
import { Carousel } from '../../carousel';
import type { MessageRenderProps } from '../types';
import { parseMessageContent, renderInlineFormatting, type ParsedMediaItem, type ParsedNode } from '../utils/parseText';
import { LightboxViewer } from './LightboxViewer';

interface TextMessageProps extends MessageRenderProps {}

function TextMessageTemplate({ message }: TextMessageProps) {
    const content = typeof message.content === 'string' ? message.content : message.content == null ? '' : String(message.content);
    const parsed = React.useMemo(() => parseMessageContent(content), [content]);
    const [lightbox, setLightbox] = React.useState<{ items: ParsedMediaItem[]; index: number } | null>(null);

    return (
        <>
            <div className="eui-chat-msg-text">
                {parsed.map((node, i) => renderNode(node, i, (items, idx) => setLightbox({ items, index: idx })))}
            </div>
            {lightbox && <LightboxViewer items={lightbox.items} startIndex={lightbox.index} onClose={() => setLightbox(null)} />}
        </>
    );
}

(TextMessageTemplate as any).showTime = true;

export default TextMessageTemplate;

function renderNode(node: ParsedNode, key: number, onMediaClick: (items: ParsedMediaItem[], index: number) => void): React.ReactNode {
    switch (node.kind) {
        case 'br':
            return <br key={key} />;
        case 'text':
            return renderInlineFormatting(node.value, key);
        case 'link':
            return (
                <a key={key} href={node.href} target="_blank" rel="noreferrer" className="eui-chat-link">
                    {node.label}
                </a>
            );
        case 'media':
            return <MediaBlock key={key} items={node.items} onClick={(idx) => onMediaClick(node.items, idx)} />;
    }
}

function MediaBlock({ items, onClick }: { items: ParsedMediaItem[]; onClick: (index: number) => void }) {
    const allImages = items.every((it) => isImageType(it.type, it.url));
    if (allImages && items.length > 1) {
        return <InlineSlider items={items} onClick={onClick} />;
    }
    return (
        <div className="eui-chat-media-row">
            {items.map((item, i) => {
                const t = resolveMediaType(item);
                if (t === 'image') {
                    return (
                        <button
                            key={i}
                            type="button"
                            className="eui-chat-media-btn"
                            onClick={() => onClick(i)}
                            aria-label={item.name || 'Open image'}
                        >
                            <img src={item.url} alt={item.name || ''} className="eui-chat-media-img" />
                        </button>
                    );
                }
                if (t === 'video') {
                    return (
                        <video key={i} controls className="eui-chat-media-video" title={item.name}>
                            <source src={item.url} />
                            <track kind="captions" src="" srcLang="en" label="English" />
                        </video>
                    );
                }
                return (
                    <a key={i} href={item.url} target="_blank" rel="noreferrer" className="eui-chat-media-link">
                        {item.name || item.url}
                    </a>
                );
            })}
        </div>
    );
}

function InlineSlider({ items, onClick }: { items: ParsedMediaItem[]; onClick: (index: number) => void }) {
    const [active, setActive] = React.useState(0);
    const slides = React.useMemo(
        () =>
            items.map((item, i) => ({
                id: `slide-${i}`,
                type: 'image' as const,
                src: item.url,
                alt: item.name || '',
            })),
        [items],
    );
    return (
        <div className="eui-chat-inline-slider" onClick={() => onClick(active)} role="presentation">
            <Carousel slides={slides} navigation="dots" showArrows={items.length > 1} loop activeIndex={active} onSlideChange={setActive} />
        </div>
    );
}

function isImageType(type?: string, url?: string): boolean {
    return resolveMediaType({ type, url: url || '' } as ParsedMediaItem) === 'image';
}

function resolveMediaType(item: ParsedMediaItem): 'image' | 'video' | 'pdf' | 'youtube' | 'other' {
    const t = (item.type || '').toLowerCase();
    if (t === 'image' || t === 'img' || t === 'jpg' || t === 'jpeg' || t === 'png' || t === 'gif' || t === 'webp' || t === 'svg') return 'image';
    if (t === 'video' || t === 'mp4' || t === 'webm' || t === 'mov') return 'video';
    if (t === 'youtube') return 'youtube';
    if (t === 'pdf') return 'pdf';
    const url = item.url?.toLowerCase() || '';
    if (/\.(jpe?g|png|gif|webp|svg)(\?|$)/.test(url)) return 'image';
    if (/\.(mp4|webm|mov)(\?|$)/.test(url)) return 'video';
    if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
    if (/\.pdf(\?|$)/.test(url)) return 'pdf';
    return 'other';
}
