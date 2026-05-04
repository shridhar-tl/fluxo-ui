import React from 'react';
import { fileIcon, pdfFileIcon } from '../icons';
import type { MessageRenderProps } from '../types';
import { formatBytes } from '../utils/time';

function normalize(media: any): { url?: string; name?: string; type?: string; size?: number }[] {
    if (!media) return [];
    if (Array.isArray(media)) return media;
    return [media];
}

function FileMessageTemplate({ message }: MessageRenderProps) {
    const items = React.useMemo(() => normalize(message.media), [message.media]);
    if (!items.length) return null;
    return (
        <div className="eui-chat-file-block">
            {message.content && <div className="eui-chat-msg-text" style={{ marginBottom: 8 }}>{message.content}</div>}
            <div className="eui-chat-file-list">
                {items.map((item, i) => {
                    const isPdf = (item.type || '').toLowerCase().includes('pdf') || /\.pdf(\?|$)/i.test(item.url || '');
                    return (
                        <a key={i} href={item.url} target="_blank" rel="noreferrer" className="eui-chat-file-item" download>
                            <span className="eui-chat-file-icon" aria-hidden="true">{isPdf ? pdfFileIcon : fileIcon}</span>
                            <span className="eui-chat-file-meta">
                                <span className="eui-chat-file-name">{item.name || item.url}</span>
                                {item.size ? <span className="eui-chat-file-size">{formatBytes(item.size)}</span> : null}
                            </span>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}

(FileMessageTemplate as any).showTime = true;

export default FileMessageTemplate;
