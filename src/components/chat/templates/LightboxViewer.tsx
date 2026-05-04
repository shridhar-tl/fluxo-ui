import React from 'react';
import { createPortal } from 'react-dom';
import { angleLeft, angleRight, closeIcon } from '../icons';

export interface LightboxViewerItem {
    url: string;
    type?: string;
    name?: string;
    [key: string]: any;
}

interface LightboxViewerProps {
    items: LightboxViewerItem[];
    startIndex?: number;
    onClose: () => void;
}

export function LightboxViewer({ items, startIndex = 0, onClose }: LightboxViewerProps) {
    const [index, setIndex] = React.useState(startIndex);

    const next = React.useCallback(() => {
        setIndex((i) => (i + 1) % items.length);
    }, [items.length]);

    const prev = React.useCallback(() => {
        setIndex((i) => (i - 1 + items.length) % items.length);
    }, [items.length]);

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowRight') next();
            else if (e.key === 'ArrowLeft') prev();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [next, prev, onClose]);

    if (typeof document === 'undefined') return null;
    const cur = items[index];
    if (!cur) return null;

    const t = resolveType(cur);

    return createPortal(
        <div className="eui-chat-lightbox" role="dialog" aria-modal="true" aria-label="Media viewer">
            <button type="button" className="eui-chat-lightbox-close" onClick={onClose} aria-label="Close">
                {closeIcon}
            </button>
            {items.length > 1 && (
                <button type="button" className="eui-chat-lightbox-nav eui-chat-lightbox-prev" onClick={prev} aria-label="Previous">
                    {angleLeft}
                </button>
            )}
            <div className="eui-chat-lightbox-stage">
                {t === 'image' && <img src={cur.url} alt={cur.name || ''} className="eui-chat-lightbox-media" />}
                {t === 'video' && (
                    <video controls className="eui-chat-lightbox-media" autoPlay>
                        <source src={cur.url} />
                        <track kind="captions" src="" srcLang="en" label="English" />
                    </video>
                )}
                {t === 'pdf' && <iframe src={cur.url} title={cur.name || 'pdf'} className="eui-chat-lightbox-frame" />}
                {t === 'other' && (
                    <a href={cur.url} target="_blank" rel="noreferrer" className="eui-chat-lightbox-link">
                        {cur.name || cur.url}
                    </a>
                )}
            </div>
            {items.length > 1 && (
                <button type="button" className="eui-chat-lightbox-nav eui-chat-lightbox-next" onClick={next} aria-label="Next">
                    {angleRight}
                </button>
            )}
            {items.length > 1 && (
                <div className="eui-chat-lightbox-counter">
                    {index + 1} / {items.length}
                </div>
            )}
        </div>,
        document.body,
    );
}

function resolveType(item: LightboxViewerItem): 'image' | 'video' | 'pdf' | 'other' {
    const t = (item.type || '').toLowerCase();
    if (['image', 'img', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(t)) return 'image';
    if (['video', 'mp4', 'webm', 'mov'].includes(t)) return 'video';
    if (t === 'pdf') return 'pdf';
    const url = item.url?.toLowerCase() || '';
    if (/\.(jpe?g|png|gif|webp|svg)(\?|$)/.test(url)) return 'image';
    if (/\.(mp4|webm|mov)(\?|$)/.test(url)) return 'video';
    if (/\.pdf(\?|$)/.test(url)) return 'pdf';
    return 'other';
}
