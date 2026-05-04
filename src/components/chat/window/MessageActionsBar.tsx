import React from 'react';
import { copyIcon, replyIcon, thumbsDownIcon, thumbsUpIcon } from '../icons';
import type { ChatMessage, FeedbackConfig, MessageAction, ReactionsConfig, ReplyConfig } from '../types';

interface MessageActionsBarProps {
    message: ChatMessage;
    actions?: MessageAction[];
    reactions?: ReactionsConfig;
    feedback?: FeedbackConfig;
    reply?: ReplyConfig;
    onReply?: (msg: ChatMessage) => void;
    onReact?: (id: string, emoji: string) => void;
    onFeedback?: (id: string, value: 'up' | 'down') => void;
}

const COPY_ACTION: MessageAction = {
    id: 'copy',
    label: 'Copy',
    icon: copyIcon,
    onClick: (msg) => {
        const text = typeof msg.content === 'string' ? msg.content : '';
        if (text && typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(text).catch(() => {});
        }
    },
};

export function MessageActionsBar({ message, actions, reactions, feedback, reply, onReply, onReact, onFeedback }: MessageActionsBarProps) {
    const [reactOpen, setReactOpen] = React.useState(false);

    const filtered = (actions || []).filter((a) => {
        if (a.appliesTo && a.appliesTo !== 'all' && a.appliesTo !== message.role) return false;
        if (a.visible && !a.visible(message)) return false;
        return true;
    });

    const replyEnabled = !!reply?.enabled && !!onReply;
    const reactEnabled = !!reactions?.enabled && !!message.id;
    const feedbackEnabled = !!feedback?.enabled && message.role === 'assistant' && !!message.id;

    if (!filtered.length && !replyEnabled && !reactEnabled && !feedbackEnabled) return null;

    return (
        <div className="eui-chat-msg-actions">
            {filtered.map((a) => (
                <button
                    key={a.id}
                    type="button"
                    className="eui-chat-msg-action"
                    onClick={() => a.onClick(message)}
                    disabled={a.disabled?.(message)}
                    title={a.title || (typeof a.label === 'string' ? a.label : a.id)}
                    aria-label={a.title || a.id}
                >
                    {a.icon}
                    {a.label && <span className="eui-chat-msg-action-label">{a.label}</span>}
                </button>
            ))}
            {replyEnabled && (
                <button type="button" className="eui-chat-msg-action" onClick={() => onReply!(message)} title="Reply" aria-label="Reply">
                    {replyIcon}
                </button>
            )}
            {reactEnabled && (
                <div className="eui-chat-msg-react-wrap">
                    <button type="button" className="eui-chat-msg-action" onClick={() => setReactOpen((v) => !v)} title="React" aria-label="React" aria-expanded={reactOpen}>
                        😊
                    </button>
                    {reactOpen && (
                        <div className="eui-chat-msg-react-menu" role="menu">
                            {(reactions?.allowedEmojis || ['👍', '❤️', '😂', '😮', '😢', '🙏']).map((em) => (
                                <button
                                    key={em}
                                    type="button"
                                    className="eui-chat-msg-react-item"
                                    onClick={() => {
                                        onReact?.(message.id!, em);
                                        setReactOpen(false);
                                    }}
                                    aria-label={`React with ${em}`}
                                >
                                    {em}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {feedbackEnabled && (
                <>
                    <button
                        type="button"
                        className={'eui-chat-msg-action ' + (message.feedback?.value === 'up' ? 'eui-chat-msg-action-active' : '')}
                        onClick={() => onFeedback?.(message.id!, 'up')}
                        title="Thumbs up"
                        aria-label="Thumbs up"
                        aria-pressed={message.feedback?.value === 'up'}
                    >
                        {thumbsUpIcon}
                    </button>
                    <button
                        type="button"
                        className={'eui-chat-msg-action ' + (message.feedback?.value === 'down' ? 'eui-chat-msg-action-active' : '')}
                        onClick={() => onFeedback?.(message.id!, 'down')}
                        title="Thumbs down"
                        aria-label="Thumbs down"
                        aria-pressed={message.feedback?.value === 'down'}
                    >
                        {thumbsDownIcon}
                    </button>
                </>
            )}
        </div>
    );
}

export const COPY_MESSAGE_ACTION = COPY_ACTION;

export default MessageActionsBar;
