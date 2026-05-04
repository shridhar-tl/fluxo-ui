import type { MessageRenderProps } from '../types';

function getEmbedUrl(url: string): string | null {
    try {
        const u = new URL(url);
        if (u.hostname === 'youtu.be') return `https://www.youtube.com/embed${u.pathname}`;
        const v = u.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}`;
        if (u.pathname.startsWith('/embed/')) return url;
    } catch {
        return null;
    }
    return null;
}

function pickFirst(media: any): { url?: string; name?: string } {
    if (!media) return {};
    if (Array.isArray(media)) return media[0] || {};
    return media;
}

function YouTubeMessageTemplate({ message }: MessageRenderProps) {
    const item = pickFirst(message.media);
    const embed = item.url ? getEmbedUrl(item.url) : null;
    if (!embed) return null;
    return (
        <div className="eui-chat-youtube-block">
            {message.content && <div className="eui-chat-msg-text" style={{ marginBottom: 6 }}>{message.content}</div>}
            <iframe
                className="eui-chat-youtube-iframe"
                src={embed}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={item.name || 'YouTube video player'}
            />
        </div>
    );
}

(YouTubeMessageTemplate as any).showTime = true;

export default YouTubeMessageTemplate;
