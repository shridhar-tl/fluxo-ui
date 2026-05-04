import type { MessageRenderProps } from '../types';

function pickFirst(media: any): { url?: string; name?: string; type?: string } {
    if (!media) return {};
    if (Array.isArray(media)) return media[0] || {};
    return media;
}

function VideoMessageTemplate({ message }: MessageRenderProps) {
    const item = pickFirst(message.media);
    if (!item.url) return null;
    return (
        <div className="eui-chat-video-block">
            {message.content && <div className="eui-chat-msg-text" style={{ marginBottom: 6 }}>{message.content}</div>}
            <video controls className="eui-chat-media-video" title={item.name}>
                <source src={item.url} type={item.type === 'video' ? undefined : item.type} />
                <track kind="captions" src="" srcLang="en" label="English" />
                Your browser does not support video playback.
            </video>
        </div>
    );
}

(VideoMessageTemplate as any).showTime = true;

export default VideoMessageTemplate;
