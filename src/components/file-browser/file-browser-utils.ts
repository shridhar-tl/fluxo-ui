import type React from 'react';

export type FileKind =
    | 'folder'
    | 'image'
    | 'video'
    | 'audio'
    | 'pdf'
    | 'document'
    | 'text'
    | 'code'
    | 'archive'
    | 'file';

export type FileBrowserView = 'thumbnail' | 'list' | 'details';

export type FileBrowserThumbnailFit = 'cover' | 'contain';

export interface FileBrowserColumn {
    key: string;
    header: string;
    width?: string;
    align?: 'left' | 'right' | 'center';
    render?: (item: FileBrowserItem) => React.ReactNode;
}

export interface FileBrowserItem {
    id: string;
    name: string;
    kind?: FileKind;
    subtitle?: string;
    thumbnailUrl?: string;
    previewUrl?: string;
    mimeType?: string;
    size?: number;
    modified?: Date | number | string;
    badge?: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
    selectable?: boolean;
    meta?: Record<string, React.ReactNode>;
    data?: unknown;
}

export interface RejectedFile {
    file: File;
    reason: 'type' | 'size' | 'count';
}

const EXTENSION_KIND: Record<string, FileKind> = {
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    webp: 'image',
    avif: 'image',
    bmp: 'image',
    svg: 'image',
    ico: 'image',
    tiff: 'image',
    tif: 'image',
    heic: 'image',
    mp4: 'video',
    webm: 'video',
    mov: 'video',
    mkv: 'video',
    avi: 'video',
    m4v: 'video',
    ogv: 'video',
    mp3: 'audio',
    wav: 'audio',
    flac: 'audio',
    aac: 'audio',
    ogg: 'audio',
    m4a: 'audio',
    pdf: 'pdf',
    doc: 'document',
    docx: 'document',
    ppt: 'document',
    pptx: 'document',
    xls: 'document',
    xlsx: 'document',
    odt: 'document',
    txt: 'text',
    md: 'text',
    rtf: 'text',
    csv: 'text',
    log: 'text',
    js: 'code',
    jsx: 'code',
    ts: 'code',
    tsx: 'code',
    json: 'code',
    html: 'code',
    css: 'code',
    scss: 'code',
    py: 'code',
    rs: 'code',
    go: 'code',
    java: 'code',
    c: 'code',
    cpp: 'code',
    sh: 'code',
    yml: 'code',
    yaml: 'code',
    xml: 'code',
    zip: 'archive',
    rar: 'archive',
    '7z': 'archive',
    tar: 'archive',
    gz: 'archive',
    bz2: 'archive',
};

export function extensionOf(name: string): string {
    const i = name.lastIndexOf('.');
    return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

export function inferKind(item: Pick<FileBrowserItem, 'kind' | 'name' | 'mimeType'>): FileKind {
    if (item.kind) return item.kind;
    const mime = item.mimeType?.toLowerCase() ?? '';
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    if (mime.startsWith('audio/')) return 'audio';
    if (mime === 'application/pdf') return 'pdf';
    if (mime.startsWith('text/')) return 'text';
    return EXTENSION_KIND[extensionOf(item.name)] ?? 'file';
}

export function isPreviewableMedia(kind: FileKind): boolean {
    return kind === 'image' || kind === 'video';
}

export function formatFileSize(bytes?: number): string {
    if (bytes == null || bytes < 0) return '';
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    const value = bytes / 1024 ** i;
    return `${value.toFixed(i === 0 || value >= 100 ? 0 : 1)} ${units[i]}`;
}

export function formatModified(modified?: Date | number | string): string {
    if (modified == null) return '';
    const date = modified instanceof Date ? modified : new Date(modified);
    if (Number.isNaN(date.getTime())) return typeof modified === 'string' ? modified : '';
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function matchesAcceptToken(file: File, token: string): boolean {
    const trimmed = token.trim().toLowerCase();
    if (!trimmed) return false;
    if (trimmed.startsWith('.')) {
        return file.name.toLowerCase().endsWith(trimmed);
    }
    if (trimmed.endsWith('/*')) {
        const prefix = trimmed.slice(0, trimmed.indexOf('/'));
        return file.type.toLowerCase().startsWith(`${prefix}/`);
    }
    return file.type.toLowerCase() === trimmed;
}

export function fileMatchesAccept(file: File, accept?: string): boolean {
    if (!accept) return true;
    return accept.split(',').some((token) => matchesAcceptToken(file, token));
}

export interface FilterFilesOptions {
    accept?: string;
    maxFileSize?: number;
    maxFiles?: number;
    existingCount?: number;
}

export function filterFiles(
    files: File[],
    { accept, maxFileSize, maxFiles, existingCount = 0 }: FilterFilesOptions,
): { accepted: File[]; rejected: RejectedFile[] } {
    const accepted: File[] = [];
    const rejected: RejectedFile[] = [];

    for (const file of files) {
        if (!fileMatchesAccept(file, accept)) {
            rejected.push({ file, reason: 'type' });
            continue;
        }
        if (maxFileSize != null && file.size > maxFileSize) {
            rejected.push({ file, reason: 'size' });
            continue;
        }
        if (maxFiles != null && existingCount + accepted.length >= maxFiles) {
            rejected.push({ file, reason: 'count' });
            continue;
        }
        accepted.push(file);
    }

    return { accepted, rejected };
}
