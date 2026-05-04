import classNames from 'classnames';
import React from 'react';
import { EmojiPicker } from '../components/EmojiPicker';
import { emojiIcon as defaultEmojiIcon, micIcon as defaultMicIcon, paperclipIcon as defaultAttachIcon, sendIcon as defaultSendIcon, xCircleIcon } from '../icons';
import type {
    AttachmentDisplayConfig,
    ChatIcons,
    ChatReplyTarget,
    ChatSendPayload,
    ChatTooltips,
    EmojiConfig,
} from '../types';
import { applyShortcodes, DEFAULT_SHORTCODES, tryReplaceTrailingShortcode } from '../utils/emoji-data';
import { formatBytes } from '../utils/time';

export interface ComposerHandle {
    focus: () => void;
    insertText: (text: string) => void;
}

interface ComposerProps {
    placeholder?: string;
    text: string;
    onTextChange: (text: string) => void;
    onSend: (payload: ChatSendPayload) => void;
    disabled?: boolean;
    sendOnEnter?: boolean;
    showSendButton?: boolean;
    showMic?: boolean;
    isMicActive?: boolean;
    onMicClick?: () => void;
    icons?: ChatIcons;
    tooltips?: ChatTooltips;
    emoji?: EmojiConfig;
    attachments?: AttachmentDisplayConfig;
    pendingAttachments: File[];
    onPendingAttachmentsChange: (files: File[]) => void;
    replyTo: ChatReplyTarget | null;
    onClearReplyTo: () => void;
}

const Composer = React.forwardRef<ComposerHandle, ComposerProps>(function Composer(props, ref) {
    const {
        placeholder = 'Type your message...',
        text,
        onTextChange,
        onSend,
        disabled,
        sendOnEnter = true,
        showSendButton = true,
        showMic,
        isMicActive,
        onMicClick,
        icons,
        tooltips,
        emoji,
        attachments,
        pendingAttachments,
        onPendingAttachmentsChange,
        replyTo,
        onClearReplyTo,
    } = props;

    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const emojiAnchorRef = React.useRef<HTMLButtonElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [emojiOpen, setEmojiOpen] = React.useState(false);

    React.useImperativeHandle(ref, () => ({
        focus: () => textareaRef.current?.focus(),
        insertText: (more) => onTextChange((text || '') + more),
    }));

    const shortcodeMap = React.useMemo<Record<string, string>>(() => {
        if (!emoji?.shortcodes) return {};
        if (emoji.shortcodes === true) return DEFAULT_SHORTCODES;
        return { ...DEFAULT_SHORTCODES, ...emoji.shortcodes };
    }, [emoji?.shortcodes]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let value = e.currentTarget.value;
        if (emoji?.enabled && emoji.liveReplace !== false && Object.keys(shortcodeMap).length) {
            const replaced = tryReplaceTrailingShortcode(value, shortcodeMap);
            if (replaced) value = replaced;
        }
        onTextChange(value);
        const ta = textareaRef.current;
        if (ta) {
            ta.style.height = 'auto';
            ta.style.height = Math.min(ta.scrollHeight, 96) + 'px';
        }
    };

    const handleSend = () => {
        const trimmed = (text || '').trim();
        const hasFiles = pendingAttachments.length > 0;
        if (!trimmed && !hasFiles) return;
        let outgoing = trimmed;
        if (emoji?.enabled && Object.keys(shortcodeMap).length) {
            outgoing = applyShortcodes(outgoing, shortcodeMap);
        }
        onSend({
            text: outgoing,
            attachments: hasFiles ? pendingAttachments : undefined,
            inReplyTo: replyTo?.id,
        });
        onTextChange('');
        onPendingAttachmentsChange([]);
        if (replyTo) onClearReplyTo();
        const ta = textareaRef.current;
        if (ta) ta.style.height = 'auto';
    };

    const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (sendOnEnter && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEmojiSelect = (em: string) => {
        const ta = textareaRef.current;
        if (ta) {
            const start = ta.selectionStart ?? text.length;
            const end = ta.selectionEnd ?? text.length;
            const next = text.slice(0, start) + em + text.slice(end);
            onTextChange(next);
            requestAnimationFrame(() => {
                ta.focus();
                const pos = start + em.length;
                ta.setSelectionRange(pos, pos);
            });
        } else {
            onTextChange(text + em);
        }
    };

    const handleFilePick = () => fileInputRef.current?.click();

    const handleFiles = async (files: FileList | File[] | null) => {
        if (!files || !attachments?.enabled) return;
        let arr = Array.from(files);
        if (attachments.maxSize) arr = arr.filter((f) => f.size <= attachments.maxSize!);
        if (attachments.maxFiles) {
            const slots = attachments.maxFiles - pendingAttachments.length;
            arr = arr.slice(0, Math.max(0, slots));
        }
        if (!arr.length) return;
        if (attachments.onAttach) {
            const result = await attachments.onAttach(arr);
            if (result === false) return;
        }
        onPendingAttachmentsChange([...pendingAttachments, ...arr]);
    };

    const removeAttachment = (idx: number) => {
        const next = pendingAttachments.slice();
        next.splice(idx, 1);
        onPendingAttachmentsChange(next);
    };

    const showEmoji = !!emoji?.enabled;
    const showAttach = !!attachments?.enabled;

    return (
        <>
            <div className="eui-chat-composer-area">
                {replyTo && (
                    <div className="eui-chat-replyto-chip">
                        <span className="eui-chat-replyto-label">Replying to</span>
                        <span className="eui-chat-replyto-snippet">{replyTo.snippet || ''}</span>
                        <button type="button" className="eui-chat-replyto-close" onClick={onClearReplyTo} aria-label="Cancel reply">
                            {xCircleIcon}
                        </button>
                    </div>
                )}
                {pendingAttachments.length > 0 && (
                    <div className="eui-chat-pending-attachments">
                        {pendingAttachments.map((file, i) => (
                            <span key={i} className="eui-chat-pending-chip">
                                <span className="eui-chat-pending-name">{file.name}</span>
                                {file.size ? <span className="eui-chat-pending-size">{formatBytes(file.size)}</span> : null}
                                <button type="button" className="eui-chat-pending-remove" onClick={() => removeAttachment(i)} aria-label={`Remove ${file.name}`}>
                                    {xCircleIcon}
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                <div className="eui-chat-composer">
                    <textarea
                        ref={textareaRef}
                        value={text}
                        placeholder={placeholder}
                        disabled={disabled}
                        onChange={handleTextChange}
                        onKeyDown={handleKey}
                        rows={1}
                        aria-label="Message input"
                    />
                    <div className="eui-chat-action-btns">
                        {showEmoji && (
                            <button
                                type="button"
                                ref={emojiAnchorRef}
                                className={classNames('eui-chat-emoji-btn', { 'eui-chat-active': emojiOpen })}
                                onClick={() => setEmojiOpen((v) => !v)}
                                aria-label={tooltips?.emoji || 'Emoji'}
                                aria-expanded={emojiOpen}
                                title={tooltips?.emoji || 'Emoji'}
                            >
                                {icons?.emoji ?? defaultEmojiIcon}
                            </button>
                        )}
                        {showAttach && (
                            <>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={attachments?.accept}
                                    multiple={attachments?.multiple ?? true}
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        handleFiles(e.target.files);
                                        e.target.value = '';
                                    }}
                                />
                                <button
                                    type="button"
                                    className="eui-chat-attach-btn"
                                    onClick={handleFilePick}
                                    aria-label={tooltips?.attach || 'Attach file'}
                                    title={tooltips?.attach || 'Attach file'}
                                    disabled={attachments?.maxFiles ? pendingAttachments.length >= attachments.maxFiles : false}
                                >
                                    {icons?.attach ?? defaultAttachIcon}
                                </button>
                            </>
                        )}
                        {showMic && (
                            <button
                                type="button"
                                className={classNames('eui-chat-voice-btn', { 'eui-chat-recording': isMicActive })}
                                onClick={onMicClick}
                                aria-label={tooltips?.mic || 'Voice input'}
                                aria-pressed={!!isMicActive}
                                title={tooltips?.mic || 'Voice input'}
                            >
                                {icons?.mic ?? defaultMicIcon}
                            </button>
                        )}
                        {showSendButton && (
                            <button
                                type="button"
                                className="eui-chat-send-btn"
                                onClick={handleSend}
                                aria-label={tooltips?.send || 'Send'}
                                title={tooltips?.send || 'Send'}
                                disabled={disabled || (!text.trim() && pendingAttachments.length === 0)}
                            >
                                {icons?.send ?? defaultSendIcon}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {showEmoji && (
                <EmojiPicker
                    anchorRef={emojiAnchorRef}
                    open={emojiOpen}
                    onClose={() => setEmojiOpen(false)}
                    onSelect={(em) => {
                        handleEmojiSelect(em);
                    }}
                    categories={emoji?.categories}
                    customCategories={emoji?.customCategories}
                />
            )}
        </>
    );
});

export default Composer;
