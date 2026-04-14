import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from './useFocusTrap';

export interface LinkDialogResult {
    text: string;
    url: string;
}

export interface LinkDialogProps {
    open: boolean;
    initialText?: string;
    initialUrl?: string;
    onCancel: () => void;
    onConfirm: (result: LinkDialogResult) => void;
    title?: string;
}

export const LinkDialog: React.FC<LinkDialogProps> = ({
    open,
    initialText = '',
    initialUrl = '',
    onCancel,
    onConfirm,
    title = 'Insert Link',
}) => {
    const [text, setText] = useState(initialText);
    const [url, setUrl] = useState(initialUrl);
    const firstInputRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(open, dialogRef);

    useEffect(() => {
        if (open) {
            setText(initialText);
            setUrl(initialUrl);
            const t = window.setTimeout(() => firstInputRef.current?.focus(), 20);
            return () => window.clearTimeout(t);
        }
        return undefined;
    }, [open, initialText, initialUrl]);

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
        if (!url.trim()) return;
        onConfirm({ text: text.trim() || url.trim(), url: url.trim() });
    };

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
                <form onSubmit={submit} className="eui-editor-dialog-body">
                    <label className="eui-editor-dialog-field">
                        <span>Text</span>
                        <input
                            ref={firstInputRef}
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Link label"
                        />
                    </label>
                    <label className="eui-editor-dialog-field">
                        <span>URL</span>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            required
                        />
                    </label>
                    <div className="eui-editor-dialog-actions">
                        <button type="button" className="eui-editor-dialog-btn" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="eui-editor-dialog-btn is-primary">
                            Insert
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body,
    );
};
