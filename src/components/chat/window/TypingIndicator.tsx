import type { TypingUser } from '../types';

interface TypingIndicatorProps {
    users?: TypingUser[];
    showLoader?: boolean;
}

export function TypingIndicator({ users, showLoader }: TypingIndicatorProps) {
    if (showLoader) {
        return (
            <div className="eui-chat-typing-row">
                <span className="eui-chat-typing-dots" aria-label="Typing">
                    <span /><span /><span />
                </span>
            </div>
        );
    }
    if (!users?.length) return null;
    let label = '';
    if (users.length === 1) label = `${users[0].name} is typing…`;
    else if (users.length === 2) label = `${users[0].name} and ${users[1].name} are typing…`;
    else label = `${users[0].name} and ${users.length - 1} others are typing…`;

    return (
        <div className="eui-chat-typing-row" aria-live="polite">
            <div className="eui-chat-typing-avatars">
                {users.slice(0, 3).map((u) => (
                    <span key={u.id} className="eui-chat-typing-avatar" aria-hidden="true">
                        {typeof u.avatar === 'string' ? <img src={u.avatar} alt="" /> : u.avatar || u.name[0]?.toUpperCase()}
                    </span>
                ))}
            </div>
            <span className="eui-chat-typing-label">{label}</span>
            <span className="eui-chat-typing-dots">
                <span /><span /><span />
            </span>
        </div>
    );
}

export default TypingIndicator;
