import React from 'react';
import type { AttachmentDisplayConfig, ChatIcons, ChatMessage as ChatMessageType, FeedbackConfig, MessageAction, ReactionsConfig, ReplyConfig, TypingUser } from '../types';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

interface ChatMessagesProps {
    messages: ChatMessageType[];
    displayComponents: Record<string, React.ComponentType<any>>;
    showTime?: boolean;
    showAvatars?: boolean;
    showLoader?: boolean;
    typingUsers?: TypingUser[];
    icons?: ChatIcons;
    onSendMessage?: (data: any) => void;
    onCallback?: (action: string, payload?: any) => void;
    onUserAction?: (event: any) => void;
    actions?: MessageAction[];
    reactions?: ReactionsConfig;
    feedback?: FeedbackConfig;
    reply?: ReplyConfig;
    attachments?: AttachmentDisplayConfig;
    onReply?: (msg: ChatMessageType) => void;
    onReact?: (id: string, emoji: string) => void;
    onFeedback?: (id: string, value: 'up' | 'down') => void;
    onRetryMessage?: (id: string) => void;
    announcements?: boolean;
}

function ChatMessages(props: ChatMessagesProps) {
    const {
        messages,
        displayComponents,
        showTime,
        showAvatars,
        showLoader,
        typingUsers,
        icons,
        onSendMessage,
        onCallback,
        onUserAction,
        actions,
        reactions,
        feedback,
        reply,
        attachments,
        onReply,
        onReact,
        onFeedback,
        onRetryMessage,
        announcements,
    } = props;

    const containerRef = React.useRef<HTMLDivElement>(null);
    const lastAnnouncedRef = React.useRef<string>('');
    const [liveMessage, setLiveMessage] = React.useState('');

    const [visibleCount, setVisibleCount] = React.useState(messages.length);
    const lastProcessedIndex = React.useRef(0);

    React.useEffect(() => {
        if (!messages?.length) {
            setVisibleCount(0);
            lastProcessedIndex.current = 0;
            return;
        }
        const alreadyVisible = messages.filter((m) => m.delayApplied).length;
        if (alreadyVisible > 0) {
            setVisibleCount((cur) => Math.max(cur, alreadyVisible));
            lastProcessedIndex.current = Math.max(lastProcessedIndex.current, alreadyVisible);
        }
    }, [messages]);

    React.useEffect(() => {
        if (!messages?.length) return;
        const timers: any[] = [];
        let totalDelay = 0;
        for (let index = lastProcessedIndex.current; index < messages.length; index++) {
            const msg = messages[index];
            const delayInMs = msg.role === 'assistant' && typeof msg.delay === 'number' && msg.delay > 0 && !msg.delayApplied ? msg.delay * 1000 : 0;
            totalDelay += delayInMs;
            const timer = setTimeout(() => {
                setVisibleCount((prev) => Math.max(prev, index + 1));
                if (messages[index]) (messages[index] as any).delayApplied = true;
            }, totalDelay);
            timers.push(timer);
        }
        lastProcessedIndex.current = messages.length;
        return () => timers.forEach(clearTimeout);
    }, [messages]);

    React.useEffect(() => {
        const c = containerRef.current;
        if (!c) return;
        const t = setTimeout(() => {
            c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' });
        }, 30);
        return () => clearTimeout(t);
    }, [visibleCount, showLoader, typingUsers?.length]);

    React.useEffect(() => {
        if (!announcements) return;
        const last = messages[messages.length - 1];
        if (!last || last.role !== 'assistant' || !last.id) return;
        if (lastAnnouncedRef.current === last.id) return;
        lastAnnouncedRef.current = last.id;
        const text = typeof last.content === 'string' ? last.content : '';
        if (text) setLiveMessage(text);
    }, [messages, announcements]);

    const scrollToMessage = React.useCallback((id: string) => {
        const c = containerRef.current;
        if (!c) return;
        const el = c.querySelector(`[data-message-id="${CSS.escape(id)}"]`) as HTMLElement | null;
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('eui-chat-msg-flash');
        setTimeout(() => el.classList.remove('eui-chat-msg-flash'), 1500);
    }, []);

    const nextMessage = messages[visibleCount];
    const showDelayLoader = !!nextMessage && nextMessage.role === 'assistant' && typeof nextMessage.delay === 'number' && nextMessage.delay > 0 && !nextMessage.delayApplied;

    return (
        <div className="eui-chat-body" ref={containerRef}>
            {messages.slice(0, visibleCount).map((m, i) => (
                <ChatMessage
                    key={m.id || `${m.createdAt || ''}-${i}`}
                    message={m}
                    displayComponents={displayComponents}
                    showTime={showTime}
                    showAvatars={showAvatars}
                    icons={icons}
                    onSendMessage={onSendMessage}
                    onCallback={onCallback}
                    onUserAction={onUserAction}
                    actions={actions}
                    reactions={reactions}
                    feedback={feedback}
                    reply={reply}
                    attachments={attachments}
                    onReply={onReply}
                    onReact={onReact}
                    onFeedback={onFeedback}
                    onRetryMessage={onRetryMessage}
                    onScrollToMessage={scrollToMessage}
                />
            ))}
            {(showDelayLoader || showLoader || (typingUsers && typingUsers.length > 0)) && (
                <TypingIndicator users={typingUsers} showLoader={showDelayLoader || showLoader} />
            )}
            {announcements && (
                <div className="eui-chat-sr-live" aria-live="polite" aria-atomic="true">
                    {liveMessage}
                </div>
            )}
        </div>
    );
}

export default ChatMessages;
