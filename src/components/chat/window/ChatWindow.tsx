import classNames from 'classnames';
import React from 'react';
import { builtinTemplates, interactiveMessageTypes } from '../templates';
import type {
    AttachmentDisplayConfig,
    ChatColorMode,
    ChatHeaderConfig,
    ChatIcons,
    ChatMessage as ChatMessageType,
    ChatPersist,
    ChatReplyTarget,
    ChatSendPayload,
    ChatTheme,
    ChatTooltips,
    ComposerCtx,
    EmojiConfig,
    FeedbackConfig,
    HeaderCtx,
    MessageActionsConfig,
    ReactionsConfig,
    ReplyConfig,
    TypingUser,
    UserActionEvent,
} from '../types';
import { useDragResize } from '../utils/useDragResize';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import Composer, { type ComposerHandle } from './Composer';
import '../../eui-base.scss';
import './chat-window.scss';
import '../themes/index.css';

export interface ChatWindowProps {
    messages: ChatMessageType[];
    onSendMessage?: (data: ChatSendPayload) => void;
    onUserAction?: (event: UserActionEvent) => void;

    composerText?: string;
    onComposerTextChange?: (text: string) => void;
    composerPlaceholder?: string;
    composerDisabled?: boolean;
    renderComposer?: (ctx: ComposerCtx) => React.ReactNode;
    showSendButton?: boolean;
    sendOnEnter?: boolean;

    showMic?: boolean;
    onMicClick?: () => void;
    isMicActive?: boolean;

    emoji?: EmojiConfig;
    attachments?: AttachmentDisplayConfig;

    header?: ChatHeaderConfig;
    renderHeader?: (ctx: HeaderCtx) => React.ReactNode;
    icons?: ChatIcons;
    tooltips?: ChatTooltips;

    onMinimize?: () => boolean | Promise<boolean> | void | Promise<void>;
    onClose?: () => boolean | Promise<boolean> | void | Promise<void>;
    onRestart?: () => boolean | Promise<boolean> | void | Promise<void>;
    isMinimized?: boolean;

    headerSlot?: React.ReactNode;
    aboveComposerSlot?: React.ReactNode;
    belowComposerSlot?: React.ReactNode;

    showTime?: boolean;
    showAvatars?: boolean;
    customMessageTypes?: Record<string, React.ComponentType<any>>;
    messageActions?: MessageActionsConfig;
    reactions?: ReactionsConfig;
    feedback?: FeedbackConfig;
    reply?: ReplyConfig;
    typingUsers?: TypingUser[];
    showLoader?: boolean;

    onRetryMessage?: (messageId: string) => void;

    draggable?: boolean;
    resizable?: boolean;
    persist?: ChatPersist;
    persistKey?: string;
    defaultPosition?: { x?: number; y?: number };
    defaultSize?: { width?: number; height?: number };
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number | string;
    maxHeight?: number | string;

    theme?: ChatTheme;
    colorMode?: ChatColorMode;
    cssVars?: Record<string, string>;
    className?: string;
    style?: React.CSSProperties;

    align?: 'bottomRight' | 'bottomLeft';
    spacingCorner?: string;
    spacingBottom?: string;

    ariaLabel?: string;
    announcements?: boolean;
    trapFocus?: boolean;
    shortcutsHelp?: boolean;

    fullscreen?: boolean;
    noShadow?: boolean;
    noAnimation?: boolean;
    fontFamily?: string;

    width?: number | string;
    height?: number | string;
}

const DEFAULT_MIN_WIDTH = 320;
const DEFAULT_MIN_HEIGHT = 420;

function isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
}

function focusableSelector() {
    return 'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';
}

export function ChatWindow(props: ChatWindowProps) {
    const {
        messages,
        onSendMessage,
        onUserAction,
        composerText: composerTextProp,
        onComposerTextChange,
        composerPlaceholder,
        composerDisabled,
        renderComposer,
        showSendButton = true,
        sendOnEnter = true,
        showMic,
        onMicClick,
        isMicActive,
        emoji,
        attachments,
        header,
        renderHeader,
        icons,
        tooltips,
        onMinimize,
        onClose,
        onRestart,
        isMinimized: isMinimizedProp,
        headerSlot,
        aboveComposerSlot,
        belowComposerSlot,
        showTime,
        showAvatars = true,
        customMessageTypes,
        messageActions,
        reactions,
        feedback,
        reply,
        typingUsers,
        showLoader,
        onRetryMessage,
        draggable,
        resizable,
        persist,
        persistKey,
        defaultPosition,
        defaultSize,
        minWidth = DEFAULT_MIN_WIDTH,
        minHeight = DEFAULT_MIN_HEIGHT,
        maxWidth = '95vw',
        maxHeight = '95vh',
        theme = 'classic',
        colorMode,
        cssVars,
        className,
        style,
        align = 'bottomRight',
        spacingCorner = '5px',
        spacingBottom = '5px',
        ariaLabel = 'Chat',
        announcements = true,
        trapFocus,
        shortcutsHelp = true,
        fullscreen,
        noShadow,
        noAnimation,
        fontFamily,
        width,
        height,
    } = props;

    const [internalText, setInternalText] = React.useState('');
    const [pendingAttachments, setPendingAttachments] = React.useState<File[]>([]);
    const [replyTo, setReplyTo] = React.useState<ChatReplyTarget | null>(null);
    const [internalMinimized, setInternalMinimized] = React.useState(false);
    const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
    const [dragOver, setDragOver] = React.useState(false);
    const composerHandleRef = React.useRef<ComposerHandle>(null);
    const shellRef = React.useRef<HTMLDivElement>(null);
    const dragOverCounter = React.useRef(0);
    const lastFocusedRef = React.useRef<HTMLElement | null>(null);

    const composerText = composerTextProp !== undefined ? composerTextProp : internalText;
    const setComposerText = (next: string) => {
        if (composerTextProp === undefined) setInternalText(next);
        onComposerTextChange?.(next);
    };

    const isMinimized = isMinimizedProp !== undefined ? isMinimizedProp : internalMinimized;

    const displayComponents = React.useMemo(
        () => ({ ...builtinTemplates, ...(customMessageTypes || {}) }),
        [customMessageTypes],
    );

    const lastMessage = messages[messages.length - 1];
    const isLastInteractive = lastMessage && interactiveMessageTypes.includes(lastMessage.type || '');

    const handleSend = React.useCallback(
        (payload: ChatSendPayload) => {
            if (!onSendMessage) return;
            onSendMessage({ ...payload, inReplyTo: payload.inReplyTo ?? replyTo?.id });
        },
        [onSendMessage, replyTo],
    );

    const handleMinimize = React.useCallback(async () => {
        if (onMinimize) {
            const result = await onMinimize();
            if (result === false) return;
        }
        if (isMinimizedProp === undefined) setInternalMinimized(true);
    }, [onMinimize, isMinimizedProp]);

    const handleClose = React.useCallback(async () => {
        if (onClose) {
            const result = await onClose();
            if (result === false) return;
        }
    }, [onClose]);

    const handleRestart = React.useCallback(async () => {
        if (onRestart) {
            await onRestart();
        }
    }, [onRestart]);

    const handleReply = React.useCallback((message: ChatMessageType) => {
        if (!message.id) return;
        const snippet = typeof message.content === 'string' ? message.content.slice(0, 80) : '';
        setReplyTo({ id: message.id, role: message.role, type: message.type, snippet });
        composerHandleRef.current?.focus();
    }, []);

    const handleReact = React.useCallback(
        (id: string, em: string) => {
            reactions?.onReact?.(id, em);
        },
        [reactions],
    );

    const handleFeedback = React.useCallback(
        (id: string, value: 'up' | 'down') => {
            feedback?.onFeedback?.(id, value);
        },
        [feedback],
    );

    React.useEffect(() => {
        if (isMinimized) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (shortcutsOpen) {
                    setShortcutsOpen(false);
                    return;
                }
                if (onClose) handleClose();
                else handleMinimize();
            }
            if (shortcutsHelp && (e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                setShortcutsOpen((v) => !v);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isMinimized, onClose, handleClose, handleMinimize, shortcutsHelp, shortcutsOpen]);

    React.useEffect(() => {
        if (isMinimized) return;
        if (typeof document === 'undefined') return;
        lastFocusedRef.current = document.activeElement as HTMLElement | null;
        const shell = shellRef.current;
        if (!shell) return;
        const focusables = shell.querySelectorAll<HTMLElement>(focusableSelector());
        focusables[0]?.focus();
        return () => {
            lastFocusedRef.current?.focus();
        };
    }, [isMinimized]);

    React.useEffect(() => {
        if (!trapFocus && !fullscreen) return;
        const shell = shellRef.current;
        if (!shell) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            const list = shell.querySelectorAll<HTMLElement>(focusableSelector());
            if (!list.length) return;
            const first = list[0];
            const last = list[list.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        shell.addEventListener('keydown', handler);
        return () => shell.removeEventListener('keydown', handler);
    }, [trapFocus, fullscreen]);

    const dragResize = useDragResize({
        enabled: !isMobile() && !fullscreen,
        draggable,
        resizable,
        persist,
        persistKey,
        initialPosition: defaultPosition ? { x: defaultPosition.x ?? 0, y: defaultPosition.y ?? 0 } : undefined,
        initialSize: defaultSize?.width && defaultSize?.height ? { width: defaultSize.width, height: defaultSize.height } : undefined,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
    });

    const onWindowDragOver = (e: React.DragEvent) => {
        if (!attachments?.enabled) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };
    const onWindowDragEnter = (e: React.DragEvent) => {
        if (!attachments?.enabled) return;
        e.preventDefault();
        dragOverCounter.current++;
        setDragOver(true);
    };
    const onWindowDragLeave = (e: React.DragEvent) => {
        if (!attachments?.enabled) return;
        e.preventDefault();
        dragOverCounter.current--;
        if (dragOverCounter.current <= 0) {
            dragOverCounter.current = 0;
            setDragOver(false);
        }
    };
    const onWindowDrop = (e: React.DragEvent) => {
        if (!attachments?.enabled) return;
        e.preventDefault();
        dragOverCounter.current = 0;
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files || []);
        if (!files.length) return;
        let arr = files;
        if (attachments.maxSize) arr = arr.filter((f) => f.size <= attachments.maxSize!);
        if (attachments.maxFiles) {
            const slots = attachments.maxFiles - pendingAttachments.length;
            arr = arr.slice(0, Math.max(0, slots));
        }
        if (!arr.length) return;
        const apply = async () => {
            if (attachments.onAttach) {
                const result = await attachments.onAttach(arr);
                if (result === false) return;
            }
            setPendingAttachments((cur) => [...cur, ...arr]);
        };
        apply();
    };

    if (isMinimized) return null;

    const composerCtx: ComposerCtx = {
        text: composerText,
        setText: setComposerText,
        sendMessage: handleSend,
        attachments: pendingAttachments,
        setAttachments: setPendingAttachments,
        replyTo,
        clearReplyTo: () => setReplyTo(null),
        disabled: composerDisabled || isLastInteractive,
        placeholder: composerPlaceholder,
    };

    const headerCtx: HeaderCtx = {
        minimize: handleMinimize,
        close: handleClose,
        restart: handleRestart,
        openMenu: () => {},
        isMinimized: false,
    };

    const themeClass = `eui-chat-theme-${theme}`;
    const modeClass = colorMode === 'dark' ? 'eui-chat-mode-dark' : colorMode === 'light' ? 'eui-chat-mode-light' : '';

    const positionStyle: React.CSSProperties = {
        bottom: spacingBottom,
        [align === 'bottomLeft' ? 'left' : 'right']: spacingCorner,
    } as React.CSSProperties;

    const sizeStyle: React.CSSProperties = {
        width: dragResize.size?.width ?? width,
        height: dragResize.size?.height ?? height,
        fontFamily,
    };

    const dragOffsetStyle: React.CSSProperties =
        dragResize.position && !isMobile() && !fullscreen
            ? { transform: `translate(${dragResize.position.x}px, ${dragResize.position.y}px)` }
            : {};

    const themeVars: React.CSSProperties = { ...(cssVars as React.CSSProperties), ...(style as React.CSSProperties) };

    const containerStyle: React.CSSProperties = fullscreen
        ? { ...themeVars, fontFamily, width: '100vw', height: '100vh', inset: 0 }
        : { ...positionStyle, ...sizeStyle, ...dragOffsetStyle, ...themeVars };

    return (
        <div
            ref={shellRef}
            className={classNames('eui-chat-container', themeClass, modeClass, 'eui-chat-window-shell', 'eui-chat-window-shell-active', className, {
                'eui-chat-fullscreen': fullscreen,
                'eui-chat-no-shadow': noShadow,
                'eui-chat-no-animation': noAnimation,
                'eui-chat-mobile': isMobile(),
                'eui-chat-dragover': dragOver,
            })}
            style={containerStyle}
            role="dialog"
            aria-modal={fullscreen || trapFocus ? 'true' : undefined}
            aria-label={ariaLabel}
            onDragOver={onWindowDragOver}
            onDragEnter={onWindowDragEnter}
            onDragLeave={onWindowDragLeave}
            onDrop={onWindowDrop}
        >
            <div className={classNames('eui-chat-window', { 'eui-chat-no-shadow': noShadow })}>
                {renderHeader ? (
                    renderHeader(headerCtx)
                ) : (
                    <ChatHeader
                        config={header}
                        icons={icons}
                        tooltips={tooltips}
                        onMinimize={onMinimize !== undefined || isMinimizedProp === undefined ? handleMinimize : undefined}
                        onClose={onClose ? handleClose : undefined}
                        onRestart={onRestart ? handleRestart : undefined}
                        onDragStart={dragResize.onDragStart}
                        draggable={draggable && !isMobile() && !fullscreen}
                    />
                )}
                {headerSlot && <div className="eui-chat-header-slot">{headerSlot}</div>}
                <ChatMessages
                    messages={messages}
                    displayComponents={displayComponents}
                    showTime={showTime}
                    showAvatars={showAvatars}
                    showLoader={showLoader}
                    typingUsers={typingUsers}
                    icons={icons}
                    onSendMessage={handleSend}
                    onCallback={(action, payload) => onUserAction?.({ action, payload })}
                    onUserAction={onUserAction}
                    actions={messageActions?.enabled ? messageActions.items : undefined}
                    reactions={reactions}
                    feedback={feedback}
                    reply={reply}
                    attachments={attachments}
                    onReply={handleReply}
                    onReact={handleReact}
                    onFeedback={handleFeedback}
                    onRetryMessage={onRetryMessage}
                    announcements={announcements}
                />
                {aboveComposerSlot && <div className="eui-chat-above-composer-slot">{aboveComposerSlot}</div>}
                {renderComposer ? (
                    <div className="eui-chat-custom-composer">{renderComposer(composerCtx)}</div>
                ) : (
                    <Composer
                        ref={composerHandleRef}
                        text={composerText}
                        onTextChange={setComposerText}
                        onSend={handleSend}
                        placeholder={composerPlaceholder}
                        disabled={composerDisabled || isLastInteractive}
                        sendOnEnter={sendOnEnter}
                        showSendButton={showSendButton}
                        showMic={showMic ?? !!onMicClick}
                        isMicActive={isMicActive}
                        onMicClick={onMicClick}
                        icons={icons}
                        tooltips={tooltips}
                        emoji={emoji}
                        attachments={attachments}
                        pendingAttachments={pendingAttachments}
                        onPendingAttachmentsChange={setPendingAttachments}
                        replyTo={reply?.enabled ? replyTo : null}
                        onClearReplyTo={() => setReplyTo(null)}
                    />
                )}
                {belowComposerSlot && <div className="eui-chat-below-composer-slot">{belowComposerSlot}</div>}
            </div>
            {resizable && !isMobile() && !fullscreen && (
                <>
                    <span className="eui-chat-resize-handle eui-chat-resize-n" onPointerDown={dragResize.onResizeStart('n')} />
                    <span className="eui-chat-resize-handle eui-chat-resize-s" onPointerDown={dragResize.onResizeStart('s')} />
                    <span className="eui-chat-resize-handle eui-chat-resize-e" onPointerDown={dragResize.onResizeStart('e')} />
                    <span className="eui-chat-resize-handle eui-chat-resize-w" onPointerDown={dragResize.onResizeStart('w')} />
                    <span className="eui-chat-resize-handle eui-chat-resize-ne" onPointerDown={dragResize.onResizeStart('ne')} />
                    <span className="eui-chat-resize-handle eui-chat-resize-nw" onPointerDown={dragResize.onResizeStart('nw')} />
                    <span className="eui-chat-resize-handle eui-chat-resize-se" onPointerDown={dragResize.onResizeStart('se')} />
                    <span className="eui-chat-resize-handle eui-chat-resize-sw" onPointerDown={dragResize.onResizeStart('sw')} />
                </>
            )}
            {shortcutsOpen && (
                <ShortcutsHelp onClose={() => setShortcutsOpen(false)} />
            )}
        </div>
    );
}

function ShortcutsHelp({ onClose }: { onClose: () => void }) {
    return (
        <div className="eui-chat-shortcuts" role="dialog" aria-label="Keyboard shortcuts">
            <div className="eui-chat-shortcuts-panel">
                <div className="eui-chat-shortcuts-title">Keyboard Shortcuts</div>
                <div className="eui-chat-shortcuts-list">
                    <div><kbd>Esc</kbd> Close / minimize</div>
                    <div><kbd>Enter</kbd> Send message</div>
                    <div><kbd>Shift</kbd> + <kbd>Enter</kbd> New line</div>
                    <div><kbd>Ctrl</kbd> + <kbd>/</kbd> This dialog</div>
                </div>
                <button type="button" className="eui-chat-shortcuts-close" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default ChatWindow;
