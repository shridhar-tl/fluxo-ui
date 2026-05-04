import React from 'react';

export interface ParsedMediaItem {
    type: string;
    url: string;
    name?: string;
    [key: string]: any;
}

export type ParsedNode =
    | { kind: 'text'; value: string }
    | { kind: 'br' }
    | { kind: 'link'; href: string; label: string }
    | { kind: 'media'; items: ParsedMediaItem[] };

const URL_REGEX = /https?:\/\/[^\s]+/g;
const MD_LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;
const MD_MEDIA_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/g;

function trimTrailingPunct(url: string): string {
    while (url.length && '.,;:!?)\\]'.includes(url[url.length - 1])) {
        url = url.slice(0, -1);
    }
    return url;
}

export function parseMessageContent(text: string): ParsedNode[] {
    if (typeof text !== 'string') return [];
    const out: ParsedNode[] = [];
    const lines = text.split(/\n/);
    let pendingMedia: ParsedMediaItem[] = [];

    const flushMedia = () => {
        if (pendingMedia.length) {
            out.push({ kind: 'media', items: pendingMedia });
            pendingMedia = [];
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const line = raw.trim();
        if (!line) {
            flushMedia();
            out.push({ kind: 'br' });
            continue;
        }
        const mediaMatches = [...line.matchAll(MD_MEDIA_REGEX)];
        if (mediaMatches.length === 1 && mediaMatches[0][0] === line) {
            pendingMedia.push({ type: mediaMatches[0][1] || 'image', url: mediaMatches[0][2] });
            continue;
        }
        flushMedia();
        out.push(...parseLineInline(line));
        if (i !== lines.length - 1) out.push({ kind: 'br' });
    }
    flushMedia();
    return out;
}

function parseLineInline(line: string): ParsedNode[] {
    const tokens: ParsedNode[] = [];
    let cursor = 0;
    const matches: { idx: number; len: number; node: ParsedNode }[] = [];

    line.replace(MD_LINK_REGEX, (full, label, href, idx: number) => {
        matches.push({ idx, len: full.length, node: { kind: 'link', label, href: trimTrailingPunct(href) } });
        return full;
    });

    line.replace(URL_REGEX, (url, idx: number) => {
        const insideMd = matches.some((m) => idx >= m.idx && idx < m.idx + m.len);
        if (!insideMd) {
            const trimmed = trimTrailingPunct(url);
            matches.push({ idx, len: trimmed.length, node: { kind: 'link', label: trimmed, href: trimmed } });
        }
        return url;
    });

    matches.sort((a, b) => a.idx - b.idx);

    for (const m of matches) {
        if (m.idx > cursor) tokens.push({ kind: 'text', value: line.slice(cursor, m.idx) });
        tokens.push(m.node);
        cursor = m.idx + m.len;
    }
    if (cursor < line.length) tokens.push({ kind: 'text', value: line.slice(cursor) });
    return tokens;
}

export function renderInlineFormatting(text: string, key: number | string): React.ReactNode {
    if (!text) return null;
    const parts = text.split(/([*_~][^*_~\n]+[*_~])/g).filter(Boolean);
    if (parts.length === 1) return <React.Fragment key={key}>{text}</React.Fragment>;
    return (
        <React.Fragment key={key}>
            {parts.map((part, i) => {
                if (part.length > 2 && part[0] === '*' && part[part.length - 1] === '*') {
                    return <b key={i}>{part.slice(1, -1)}</b>;
                }
                if (part.length > 2 && part[0] === '_' && part[part.length - 1] === '_') {
                    return <i key={i}>{part.slice(1, -1)}</i>;
                }
                if (part.length > 2 && part[0] === '~' && part[part.length - 1] === '~') {
                    return <s key={i}>{part.slice(1, -1)}</s>;
                }
                return <React.Fragment key={i}>{part}</React.Fragment>;
            })}
        </React.Fragment>
    );
}
