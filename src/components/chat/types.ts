import type React from 'react';

export type ChatRole = 'user' | 'assistant' | 'system';
export type ChatMessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ChatAttachment {
    id?: string;
    name: string;
    url?: string;
    size?: number;
    type?: string;
    thumbnail?: string;
    [key: string]: any;
}

export interface ChatReplyTarget {
    id: string;
    role?: ChatRole;
    type?: string;
    snippet?: string;
}

export interface ChatMessage {
    id?: string;
    role: ChatRole;
    type?: string;
    content?: any;
    media?: any;
    attachments?: ChatAttachment[];
    status?: ChatMessageStatus;
    reactions?: Record<string, string[]>;
    feedback?: { value: 'up' | 'down'; comment?: string };
    inReplyTo?: string;
    replyTo?: ChatReplyTarget;
    createdAt?: string | number | Date;
    delay?: number;
    delayApplied?: boolean;
    [key: string]: any;
}

export interface TypingUser {
    id: string;
    name: string;
    avatar?: React.ReactNode | string;
}

export interface HeaderMenuItem {
    id?: string;
    label?: React.ReactNode;
    icon?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    divider?: boolean;
    submenu?: HeaderMenuItem[];
}

export interface MessageAction {
    id: string;
    label?: React.ReactNode;
    icon?: React.ReactNode;
    onClick: (message: ChatMessage) => void;
    appliesTo?: ChatRole | 'all';
    disabled?: (message: ChatMessage) => boolean;
    visible?: (message: ChatMessage) => boolean;
    title?: string;
}

export type EmojiCategory =
    | 'recent'
    | 'smileys'
    | 'gestures'
    | 'objects'
    | 'symbols'
    | 'nature'
    | 'food'
    | 'hearts'
    | 'flags'
    | 'activities';

export interface EmojiCustomCategory {
    id: string;
    label: string;
    icon?: React.ReactNode;
    emojis: string[];
    replace?: EmojiCategory;
}

export interface ChatIcons {
    minimize?: React.ReactNode;
    close?: React.ReactNode;
    restart?: React.ReactNode;
    menu?: React.ReactNode;
    send?: React.ReactNode;
    mic?: React.ReactNode;
    attach?: React.ReactNode;
    emoji?: React.ReactNode;
    bot?: React.ReactNode;
    user?: React.ReactNode;
    statusSending?: React.ReactNode;
    statusSent?: React.ReactNode;
    statusDelivered?: React.ReactNode;
    statusRead?: React.ReactNode;
    statusFailed?: React.ReactNode;
}

export interface ChatTooltips {
    minimize?: string;
    close?: string;
    restart?: string;
    menu?: string;
    send?: string;
    mic?: string;
    attach?: string;
    emoji?: string;
}

export interface UserActionEvent {
    action: string;
    messageId?: string;
    payload?: any;
    [key: string]: any;
}

export interface MessageRenderProps<T = any> {
    message: ChatMessage;
    isUser: boolean;
    isSystem?: boolean;
    contentStyle?: React.CSSProperties;
    onSendMessage?: (data: ChatSendPayload) => void;
    onUserAction?: (event: UserActionEvent) => void;
    onCallback?: (action: string, payload?: any) => void;
    extraData?: T;
}

export interface ChatSendPayload {
    text?: string;
    attachments?: File[] | ChatAttachment[];
    inReplyTo?: string;
    type?: string;
    method?: string;
    answer?: string;
    selected?: any;
    selectedIndex?: number;
    flowId?: string;
    customForm?: any;
    [key: string]: any;
}

export interface ComposerCtx {
    text: string;
    setText: (next: string) => void;
    sendMessage: (data: ChatSendPayload) => void;
    attachments: File[];
    setAttachments: (files: File[]) => void;
    replyTo: ChatReplyTarget | null;
    clearReplyTo: () => void;
    disabled?: boolean;
    placeholder?: string;
}

export interface HeaderCtx {
    minimize: () => void;
    close: () => void;
    restart: () => void;
    openMenu: (event: React.MouseEvent) => void;
    isMinimized: boolean;
}

export interface AttachmentDisplayConfig {
    enabled?: boolean;
    accept?: string;
    maxFiles?: number;
    maxSize?: number;
    multiple?: boolean;
    display?: 'count' | 'names' | 'thumbnails';
    clickable?: boolean;
    onAttach?: (files: File[]) => void | false | Promise<void | false>;
}

export interface EmojiConfig {
    enabled?: boolean;
    categories?: EmojiCategory[];
    customCategories?: EmojiCustomCategory[];
    shortcodes?: boolean | Record<string, string>;
    liveReplace?: boolean;
}

export interface ReactionsConfig {
    enabled?: boolean;
    allowedEmojis?: string[];
    onReact?: (messageId: string, emoji: string) => void;
}

export interface FeedbackConfig {
    enabled?: boolean;
    onFeedback?: (messageId: string, value: 'up' | 'down', comment?: string) => void;
    askForComment?: boolean;
}

export interface ReplyConfig {
    enabled?: boolean;
    style?: 'pinned' | 'quoted' | 'both';
}

export interface MessageActionsConfig {
    enabled?: boolean;
    items?: MessageAction[];
}

export interface ChatHeaderConfig {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    logo?: { url: string; width?: string; height?: string; margin?: string };
    bgColor?: string;
    secBgColor?: string;
    fontColor?: string;
    fontSize?: string;
    padding?: string;
    showMinimize?: boolean;
    showClose?: boolean;
    showRestart?: boolean;
    showMenu?: boolean;
    menuItems?: HeaderMenuItem[];
}

export type ChatTheme = 'classic' | 'modern' | 'iris' | 'dusk' | 'mist' | 'ember' | 'canvas' | 'prism' | 'aurora';
export type ChatColorMode = 'light' | 'dark' | 'auto';
export type ChatPersist = boolean | 'session';
