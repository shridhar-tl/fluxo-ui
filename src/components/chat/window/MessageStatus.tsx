import React from 'react';
import { checkIcon as defaultCheck, checksIcon as defaultChecks, clockIcon as defaultClock, failedIcon as defaultFailed } from '../icons';
import type { ChatIcons, ChatMessage } from '../types';

interface MessageStatusProps {
    message: ChatMessage;
    icons?: ChatIcons;
    onRetry?: (id: string) => void;
}

export function MessageStatus({ message, icons, onRetry }: MessageStatusProps) {
    const status = message.status;
    if (!status) return null;
    if (message.role !== 'user') return null;

    let icon: React.ReactNode;
    let cls = 'eui-chat-status';
    let label = '';
    switch (status) {
        case 'sending':
            icon = icons?.statusSending ?? defaultClock;
            cls += ' eui-chat-status-sending';
            label = 'Sending';
            break;
        case 'sent':
            icon = icons?.statusSent ?? defaultCheck;
            cls += ' eui-chat-status-sent';
            label = 'Sent';
            break;
        case 'delivered':
            icon = icons?.statusDelivered ?? defaultChecks;
            cls += ' eui-chat-status-delivered';
            label = 'Delivered';
            break;
        case 'read':
            icon = icons?.statusRead ?? defaultChecks;
            cls += ' eui-chat-status-read';
            label = 'Read';
            break;
        case 'failed':
            icon = icons?.statusFailed ?? defaultFailed;
            cls += ' eui-chat-status-failed';
            label = 'Failed (click to retry)';
            break;
    }

    if (status === 'failed' && onRetry && message.id) {
        return (
            <button type="button" className={cls + ' eui-chat-status-clickable'} onClick={() => onRetry(message.id!)} title={label} aria-label={label}>
                {icon}
            </button>
        );
    }
    return (
        <span className={cls} title={label} aria-label={label}>
            {icon}
        </span>
    );
}

export default MessageStatus;
