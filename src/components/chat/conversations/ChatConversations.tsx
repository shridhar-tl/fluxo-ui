import classNames from 'classnames';
import React from 'react';
import { Splitter, SplitterPanel } from '../../splitter';
import { TextInput } from '../../TextInput';
import { formatRelative } from '../utils/time';
import './chat-conversations.scss';

export interface ChatConversationItem {
    id: string;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    avatar?: React.ReactNode | string;
    lastMessage?: React.ReactNode;
    lastMessageAt?: string | number | Date;
    unreadCount?: number;
    badges?: { label: React.ReactNode; color?: string; bgColor?: string }[];
    pinned?: boolean;
    archived?: boolean;
    [key: string]: any;
}

export interface ChatConversationsProps {
    conversations: ChatConversationItem[];
    activeId?: string;
    onSelect?: (id: string) => void;
    onSearch?: (query: string) => void;
    onPin?: (id: string, pinned: boolean) => void;
    onArchive?: (id: string, archived: boolean) => void;
    onDelete?: (id: string) => void;
    searchable?: boolean;
    sidebarWidth?: number | string;
    minSidebarWidth?: number;
    maxSidebarWidth?: number;
    hideArchived?: boolean;
    emptyState?: React.ReactNode;
    renderItem?: (item: ChatConversationItem, ctx: { active: boolean }) => React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
    title?: React.ReactNode;
}

export function ChatConversations(props: ChatConversationsProps) {
    const {
        conversations,
        activeId,
        onSelect,
        onSearch,
        searchable = true,
        sidebarWidth = '280px',
        hideArchived,
        emptyState,
        renderItem,
        children,
        className,
        style,
        placeholder = 'Search conversations…',
        title,
    } = props;
    const [query, setQuery] = React.useState('');

    const handleSearch = (q: string) => {
        setQuery(q);
        onSearch?.(q);
    };

    const filtered = React.useMemo(() => {
        let list = conversations.slice();
        if (hideArchived) list = list.filter((c) => !c.archived);
        if (query) {
            const q = query.toLowerCase();
            list = list.filter((c) => {
                const title = typeof c.title === 'string' ? c.title.toLowerCase() : '';
                const sub = typeof c.subtitle === 'string' ? c.subtitle.toLowerCase() : '';
                const last = typeof c.lastMessage === 'string' ? c.lastMessage.toLowerCase() : '';
                return title.includes(q) || sub.includes(q) || last.includes(q);
            });
        }
        list.sort((a, b) => {
            if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
            const at = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const bt = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return bt - at;
        });
        return list;
    }, [conversations, query, hideArchived]);

    const sidebarStyle: React.CSSProperties = { minWidth: typeof sidebarWidth === 'number' ? `${sidebarWidth}px` : sidebarWidth };

    return (
        <div className={classNames('eui-chat-conversations', className)} style={style}>
            <Splitter layout="horizontal">
                <SplitterPanel defaultSize={typeof sidebarWidth === 'number' ? `${sidebarWidth}px` : sidebarWidth}>
                    <div className="eui-chat-conv-sidebar" style={sidebarStyle}>
                        {title && <div className="eui-chat-conv-sidebar-title">{title}</div>}
                        {searchable && (
                            <div className="eui-chat-conv-search">
                                <TextInput value={query} onChange={(e) => handleSearch(e?.value ?? '')} placeholder={placeholder} clearable onClear={() => handleSearch('')} />
                            </div>
                        )}
                        <div className="eui-chat-conv-list" role="list">
                            {filtered.length === 0 ? (
                                <div className="eui-chat-conv-empty">{emptyState || 'No conversations'}</div>
                            ) : (
                                filtered.map((c) => {
                                    const active = c.id === activeId;
                                    if (renderItem) return <div key={c.id} role="listitem">{renderItem(c, { active })}</div>;
                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            role="listitem"
                                            className={classNames('eui-chat-conv-item', { 'eui-chat-conv-active': active, 'eui-chat-conv-archived': c.archived })}
                                            onClick={() => onSelect?.(c.id)}
                                            aria-current={active ? 'true' : undefined}
                                        >
                                            <span className="eui-chat-conv-avatar" aria-hidden="true">
                                                {typeof c.avatar === 'string' ? <img src={c.avatar} alt="" /> : c.avatar || (typeof c.title === 'string' ? c.title[0]?.toUpperCase() : '·')}
                                            </span>
                                            <span className="eui-chat-conv-meta">
                                                <span className="eui-chat-conv-row1">
                                                    <span className="eui-chat-conv-title">
                                                        {c.pinned && <span className="eui-chat-conv-pin" aria-label="Pinned">📌 </span>}
                                                        {c.title}
                                                    </span>
                                                    {c.lastMessageAt && <span className="eui-chat-conv-time">{formatRelative(c.lastMessageAt)}</span>}
                                                </span>
                                                {c.subtitle && <span className="eui-chat-conv-subtitle">{c.subtitle}</span>}
                                                <span className="eui-chat-conv-row3">
                                                    {c.lastMessage ? <span className="eui-chat-conv-last">{c.lastMessage}</span> : <span />}
                                                    <span className="eui-chat-conv-trail">
                                                        {c.badges?.map((b, i) => (
                                                            <span key={i} className="eui-chat-conv-badge" style={{ color: b.color, background: b.bgColor }}>
                                                                {b.label}
                                                            </span>
                                                        ))}
                                                        {!!c.unreadCount && c.unreadCount > 0 && <span className="eui-chat-conv-unread">{c.unreadCount > 99 ? '99+' : c.unreadCount}</span>}
                                                    </span>
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </SplitterPanel>
                <SplitterPanel>
                    <div className="eui-chat-conv-detail">{children}</div>
                </SplitterPanel>
            </Splitter>
        </div>
    );
}

export default ChatConversations;
