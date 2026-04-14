import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from './useFocusTrap';

export type ImageDialogResult =
    | { kind: 'url'; url: string; alt: string }
    | { kind: 'file'; file: File; alt: string };

export interface ImageDialogProps {
    open: boolean;
    allowUpload: boolean;
    acceptedImageTypes?: string[];
    onCancel: () => void;
    onConfirm: (result: ImageDialogResult) => void;
    title?: string;
}

type Tab = 'url' | 'upload';

export const ImageDialog: React.FC<ImageDialogProps> = ({
    open,
    allowUpload,
    acceptedImageTypes,
    onCancel,
    onConfirm,
    title = 'Insert Image',
}) => {
    const [tab, setTab] = useState<Tab>(allowUpload ? 'upload' : 'url');
    const [url, setUrl] = useState('');
    const [alt, setAlt] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const firstInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(open, dialogRef);

    useEffect(() => {
        if (open) {
            setTab(allowUpload ? 'upload' : 'url');
            setUrl('');
            setAlt('');
            setFile(null);
            const t = window.setTimeout(() => firstInputRef.current?.focus(), 20);
            return () => window.clearTimeout(t);
        }
        return undefined;
    }, [open, allowUpload]);

    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onCancel();
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open, onCancel]);

    if (!open) return null;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tab === 'url') {
            if (!url.trim()) return;
            onConfirm({ kind: 'url', url: url.trim(), alt: alt.trim() });
        } else {
            if (!file) return;
            onConfirm({ kind: 'file', file, alt: alt.trim() || file.name.replace(/\.[^.]+$/, '') });
        }
    };

    const acceptAttr = acceptedImageTypes?.join(',') || 'image/*';

    return createPortal(
        <div className="eui-editor-dialog-overlay" onClick={onCancel} role="presentation">
            <div
                ref={dialogRef}
                className="eui-editor-dialog"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <div className="eui-editor-dialog-header">{title}</div>
                {allowUpload && (
                    <div className="eui-editor-dialog-tabs" role="tablist">
                        <button
                            type="button"
                            className={'eui-editor-dialog-tab' + (tab === 'upload' ? ' is-active' : '')}
                            onClick={() => setTab('upload')}
                            role="tab"
                            aria-selected={tab === 'upload'}
                        >
                            Upload
                        </button>
                        <button
                            type="button"
                            className={'eui-editor-dialog-tab' + (tab === 'url' ? ' is-active' : '')}
                            onClick={() => setTab('url')}
                            role="tab"
                            aria-selected={tab === 'url'}
                        >
                            From URL
                        </button>
                    </div>
                )}
                <form onSubmit={submit} className="eui-editor-dialog-body">
                    {tab === 'url' ? (
                        <label className="eui-editor-dialog-field">
                            <span>Image URL</span>
                            <input
                                ref={firstInputRef}
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com/image.png"
                                required
                            />
                        </label>
                    ) : (
                        <div className="eui-editor-dialog-field">
                            <span>Select image</span>
                            <div className="eui-editor-dialog-file-row">
                                <button
                                    type="button"
                                    className="eui-editor-dialog-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Choose File
                                </button>
                                <span className="eui-editor-dialog-file-name">
                                    {file ? file.name : 'No file chosen'}
                                </span>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={acceptAttr}
                                style={{ display: 'none' }}
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            />
                        </div>
                    )}
                    <label className="eui-editor-dialog-field">
                        <span>Alt text</span>
                        <input
                            type="text"
                            value={alt}
                            onChange={(e) => setAlt(e.target.value)}
                            placeholder="Describe the image"
                        />
                    </label>
                    <div className="eui-editor-dialog-actions">
                        <button type="button" className="eui-editor-dialog-btn" onClick={onCancel}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="eui-editor-dialog-btn is-primary"
                            disabled={tab === 'url' ? !url.trim() : !file}
                        >
                            Insert
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body,
    );
};
