import React from 'react';
import type { ChatMessage, ChatSendPayload, TypingUser } from '../../../components/chat';
import { BOT_REPLIES, nextMessageId } from './chat-story-data';

interface UseBotSimulatorOptions {
    initialMessages: ChatMessage[];
    botName?: string;
    botAvatar?: string;
    minDelay?: number;
    maxDelay?: number;
    repliesPerMessage?: number;
}

interface UseBotSimulatorResult {
    messages: ChatMessage[];
    typingUsers: TypingUser[];
    handleSend: (data: ChatSendPayload) => void;
    reset: () => void;
    pushAssistant: (content: string) => void;
}

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export function useBotSimulator(options: UseBotSimulatorOptions): UseBotSimulatorResult {
    const {
        initialMessages: initial,
        botName = 'FluxoBot',
        botAvatar,
        minDelay = 700,
        maxDelay = 1500,
        repliesPerMessage = 3,
    } = options;

    const [messages, setMessages] = React.useState<ChatMessage[]>(initial);
    const [typingUsers, setTypingUsers] = React.useState<TypingUser[]>([]);

    const replyIndexRef = React.useRef(0);
    const timeoutsRef = React.useRef<number[]>([]);

    const clearAll = React.useCallback(() => {
        timeoutsRef.current.forEach((t) => window.clearTimeout(t));
        timeoutsRef.current = [];
    }, []);

    React.useEffect(() => {
        return () => clearAll();
    }, [clearAll]);

    const startTyping = React.useCallback(() => {
        setTypingUsers([{ id: 'bot', name: botName, avatar: botAvatar }]);
    }, [botName, botAvatar]);

    const stopTyping = React.useCallback(() => {
        setTypingUsers([]);
    }, []);

    const queueReply = React.useCallback(
        (atDelay: number) => {
            const t = window.setTimeout(() => {
                const idx = replyIndexRef.current % BOT_REPLIES.length;
                replyIndexRef.current += 1;
                const text = BOT_REPLIES[idx];
                stopTyping();
                setMessages((prev) => [
                    ...prev,
                    {
                        id: nextMessageId(),
                        role: 'assistant',
                        type: 'text',
                        content: text,
                        status: 'read',
                        createdAt: new Date(),
                    },
                ]);
            }, atDelay);
            timeoutsRef.current.push(t);
        },
        [stopTyping],
    );

    const handleSend = React.useCallback(
        (data: ChatSendPayload) => {
            const text = (data.text || '').trim();
            const hasAttachments = Array.isArray(data.attachments) && data.attachments.length > 0;
            if (!text && !hasAttachments) return;

            const userMessage: ChatMessage = {
                id: nextMessageId(),
                role: 'user',
                type: text ? 'text' : 'file',
                content: text || undefined,
                attachments: hasAttachments
                    ? (data.attachments as File[]).map((f) => ({
                          name: f.name,
                          size: f.size,
                          type: f.type,
                      }))
                    : undefined,
                status: 'sent',
                createdAt: new Date(),
            };

            setMessages((prev) => [...prev, userMessage]);

            // Schedule a stream of bot replies
            const count = random(1, Math.max(1, repliesPerMessage));
            let cumulativeDelay = 0;
            for (let i = 0; i < count; i++) {
                const typingDelay = random(minDelay, maxDelay);
                cumulativeDelay += typingDelay;
                const startTypingDelay = cumulativeDelay - random(400, 700);
                const showTypingAt = Math.max(150, startTypingDelay);
                const tStart = window.setTimeout(() => startTyping(), showTypingAt);
                timeoutsRef.current.push(tStart);
                queueReply(cumulativeDelay);
            }
        },
        [queueReply, startTyping, repliesPerMessage, minDelay, maxDelay],
    );

    const reset = React.useCallback(() => {
        clearAll();
        replyIndexRef.current = 0;
        stopTyping();
        setMessages(initial);
    }, [clearAll, initial, stopTyping]);

    const pushAssistant = React.useCallback((content: string) => {
        setMessages((prev) => [
            ...prev,
            {
                id: nextMessageId(),
                role: 'assistant',
                type: 'text',
                content,
                status: 'read',
                createdAt: new Date(),
            },
        ]);
    }, []);

    return { messages, typingUsers, handleSend, reset, pushAssistant };
}
