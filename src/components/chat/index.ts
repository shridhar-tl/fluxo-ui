export { ChatWindow } from './window/ChatWindow';
export type { ChatWindowProps } from './window/ChatWindow';

export { ChatLauncher } from './launcher/ChatLauncher';
export type { ChatLauncherProps, ChatLauncherVariant, ChatLauncherAlign } from './launcher/ChatLauncher';

export { ChatConversations } from './conversations/ChatConversations';
export type { ChatConversationsProps, ChatConversationItem } from './conversations/ChatConversations';

export type {
    AttachmentDisplayConfig,
    ChatAttachment,
    ChatColorMode,
    ChatHeaderConfig,
    ChatIcons,
    ChatMessage,
    ChatMessageStatus,
    ChatPersist,
    ChatReplyTarget,
    ChatRole,
    ChatSendPayload,
    ChatTheme,
    ChatTooltips,
    ComposerCtx,
    EmojiCategory,
    EmojiConfig,
    EmojiCustomCategory,
    FeedbackConfig,
    HeaderCtx,
    HeaderMenuItem,
    MessageAction,
    MessageActionsConfig,
    MessageRenderProps,
    ReactionsConfig,
    ReplyConfig,
    TypingUser,
    UserActionEvent,
} from './types';

export { builtinTemplates, interactiveMessageTypes } from './templates';
export {
    DateMessageTemplate,
    DateTimeMessageTemplate,
    FileMessageTemplate,
    ImageMessageTemplate,
    LightboxViewer,
    LoaderTemplate,
    OptionsMessageTemplate,
    TextMessageTemplate,
    TimeMessageTemplate,
    VideoMessageTemplate,
    YouTubeMessageTemplate,
} from './templates';

export { COPY_MESSAGE_ACTION } from './window/MessageActionsBar';

export { applyShortcodes, DEFAULT_SHORTCODES, EMOJI_CATEGORIES } from './utils/emoji-data';
