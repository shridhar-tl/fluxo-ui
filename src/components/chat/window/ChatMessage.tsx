import classNames from 'classnames';
import React from 'react';
import { botAvatarIcon, userAvatarIcon } from '../icons';
import type { AttachmentDisplayConfig, ChatAttachment, ChatIcons, ChatMessage as ChatMessageType, FeedbackConfig, MessageAction, ReactionsConfig, ReplyConfig } from '../types';
import { formatBytes, formatTime } from '../utils/time';
import MessageActionsBar from './MessageActionsBar';
import MessageStatus from './MessageStatus';

interface ChatMessageProps {
    message: ChatMessageType;
    displayComponents: Record<string, React.ComponentType<any>>;
    showTime?: boolean;
    showAvatars?: boolean;
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
    onScrollToMessage?: (id: string) => void;
}

function isInteractive(type?: string): boolean {
    return type === 'options';
}

function ChatMessage(props: ChatMessageProps) {
    const {
        message,
        displayComponents,
        showTime,
        showAvatars,
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
        onScrollToMessage,
    } = props;

    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    const Component = displayComponents[message.contentType || message.type || 'default'] || displayComponents.default;
    const noContainer = (Component as any)?.noContainer === true;
    const tplShowTime = (Component as any)?.showTime !== false;
    const isInteractiveType = isInteractive(message.type);

    const innerNode = Component ? (
        <Component
            message={message}
            isUser={isUser}
            isSystem={isSystem}
            onSendMessage={onSendMessage}
            onCallback={onCallback}
            onUserAction={onUserAction}
        />
    ) : null;

    const reactionsRow = renderReactionsRow(message);
    const replyToHint = renderReplyToHint(message, onScrollToMessage);
    const attachmentsBlock = renderAttachments(message.attachments, attachments);

    const bubbleContent = (
        <>
            {replyToHint}
            {message.replyTo?.snippet && reply?.style !== 'pinned' && reply?.enabled !== false && (
                <div className="eui-chat-msg-quoted">
                    <span className="eui-chat-msg-quoted-snippet">{message.replyTo.snippet}</span>
                </div>
            )}
            {innerNode}
            {attachmentsBlock}
            {showTime && tplShowTime && message.createdAt && (
                <div className={'eui-chat-msg-time ' + (isUser ? 'eui-chat-msg-time-user' : 'eui-chat-msg-time-system')}>
                    {formatTime(message.createdAt)}
                </div>
            )}
            {reactionsRow}
        </>
    );

    return (
        <div
            className={classNames('eui-chat-msg', {
                'eui-chat-msg-user': isUser,
                'eui-chat-msg-system': !isUser && !isSystem,
                'eui-chat-msg-sys-notice': isSystem,
                'eui-chat-no-avatar': !showAvatars,
                'eui-chat-msg-interactive': isInteractiveType,
            })}
            data-message-id={message.id}
        >
            {showAvatars && !isUser && !isSystem && (
                <div className="eui-chat-msg-avatar" aria-hidden="true">
                    {icons?.bot ?? botAvatarIcon}
                </div>
            )}
            <div className="eui-chat-msg-body">
                {noContainer ? (
                    bubbleContent
                ) : (
                    <div className="eui-chat-msg-content">{bubbleContent}</div>
                )}
                <MessageActionsBar
                    message={message}
                    actions={actions}
                    reactions={reactions}
                    feedback={feedback}
                    reply={reply}
                    onReply={onReply}
                    onReact={onReact}
                    onFeedback={onFeedback}
                />
                {isUser && message.status && (
                    <div className="eui-chat-msg-status-row">
                        <MessageStatus message={message} icons={icons} onRetry={onRetryMessage} />
                    </div>
                )}
            </div>
            {showAvatars && isUser && (
                <div className="eui-chat-msg-avatar" aria-hidden="true">
                    {icons?.user ?? userAvatarIcon}
                </div>
            )}
        </div>
    );
}

function renderReactionsRow(message: ChatMessageType): React.ReactNode {
    if (!message.reactions) return null;
    const entries = Object.entries(message.reactions).filter(([, ids]) => Array.isArray(ids) && ids.length > 0);
    if (!entries.length) return null;
    return (
        <div className="eui-chat-msg-reactions">
            {entries.map(([emoji, ids]) => (
                <span key={emoji} className="eui-chat-msg-reaction-chip">
                    <span className="eui-chat-msg-reaction-emoji">{emoji}</span>
                    <span className="eui-chat-msg-reaction-count">{ids.length}</span>
                </span>
            ))}
        </div>
    );
}

function renderReplyToHint(message: ChatMessageType, onScrollTo?: (id: string) => void): React.ReactNode {
    if (!message.replyTo?.id) return null;
    return (
        <button
            type="button"
            className="eui-chat-msg-replyto"
            onClick={() => onScrollTo?.(message.replyTo!.id)}
            aria-label="Jump to replied message"
        >
            ↳ <span className="eui-chat-msg-replyto-snippet">{message.replyTo.snippet || 'Original message'}</span>
        </button>
    );
}

function renderAttachments(items: ChatAttachment[] | undefined, config: AttachmentDisplayConfig | undefined): React.ReactNode {
    if (!items?.length || !config?.enabled) return null;
    const display = config.display || 'names';
    const clickable = config.clickable !== false;

    if (display === 'count') {
        return (
            <div className="eui-chat-msg-attachments eui-chat-msg-attachments-count">
                📎 {items.length} {items.length === 1 ? 'file' : 'files'}
            </div>
        );
    }

    if (display === 'thumbnails') {
        return (
            <div className="eui-chat-msg-attachments eui-chat-msg-attachments-thumbs">
                {items.map((it, i) => {
                    const isImage = (it.type || '').startsWith('image') || /\.(jpe?g|png|gif|webp|svg)(\?|$)/i.test(it.url || '');
                    const inner = isImage && it.url ? (
                        <img src={it.thumbnail || it.url} alt={it.name} className="eui-chat-att-thumb-img" />
                    ) : (
                        <span className="eui-chat-att-thumb-file">{it.name}</span>
                    );
                    return clickable && it.url ? (
                        <a key={i} href={it.url} target="_blank" rel="noreferrer" className="eui-chat-att-thumb">
                            {inner}
                        </a>
                    ) : (
                        <span key={i} className="eui-chat-att-thumb">{inner}</span>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="eui-chat-msg-attachments eui-chat-msg-attachments-names">
            {items.map((it, i) =>
                clickable && it.url ? (
                    <a key={i} href={it.url} target="_blank" rel="noreferrer" className="eui-chat-att-name" download>
                        📎 {it.name}
                        {it.size ? <span className="eui-chat-att-size"> ({formatBytes(it.size)})</span> : null}
                    </a>
                ) : (
                    <span key={i} className="eui-chat-att-name">
                        📎 {it.name}
                    </span>
                ),
            )}
        </div>
    );
}

export default ChatMessage;
