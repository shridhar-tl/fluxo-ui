import classNames from 'classnames';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import '../eui-base.scss';
import './editor-core.scss';
import { EditIcon, EyeIcon, SplitViewIcon } from '../../assets/icons';

export type EditorViewMode = 'edit' | 'preview' | 'split';

export interface TextEditorShellProps {
    toolbar?: React.ReactNode;
    editor: React.ReactNode;
    preview?: React.ReactNode;
    view: EditorViewMode;
    onViewChange?: (view: EditorViewMode) => void;
    showViewSwitcher?: boolean;
    allowedViews?: EditorViewMode[];
    className?: string;
    minHeight?: string | number;
    maxHeight?: string | number;
    disabled?: boolean;
    readOnly?: boolean;
    statusBar?: React.ReactNode;
}

const VIEW_META: Record<EditorViewMode, { label: string; icon: React.FC }> = {
    edit: { label: 'Edit', icon: EditIcon },
    split: { label: 'Split', icon: SplitViewIcon },
    preview: { label: 'Preview', icon: EyeIcon },
};

const DEFAULT_VIEWS: EditorViewMode[] = ['edit', 'split', 'preview'];

const TextEditorShellInner: React.FC<TextEditorShellProps> = ({
    toolbar,
    editor,
    preview,
    view,
    onViewChange,
    showViewSwitcher = true,
    allowedViews = DEFAULT_VIEWS,
    className,
    minHeight = '300px',
    maxHeight,
    disabled,
    readOnly,
    statusBar,
}) => {
    const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
    const [isMobile, setIsMobile] = useState<boolean>(() =>
        typeof window !== 'undefined' ? window.matchMedia('(max-width: 640px)').matches : false,
    );
    const previousViewRef = useRef<EditorViewMode>(view);
    const [viewAnnouncement, setViewAnnouncement] = useState('');

    useEffect(() => {
        if (previousViewRef.current !== view) {
            setViewAnnouncement(`View changed to ${VIEW_META[view]?.label.toLowerCase() || view}`);
            previousViewRef.current = view;
        }
    }, [view]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mq = window.matchMedia('(max-width: 640px)');
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const selectView = useCallback(
        (next: EditorViewMode) => {
            if (next === view) return;
            onViewChange?.(next);
        },
        [onViewChange, view],
    );

    const effectiveView: EditorViewMode = preview ? view : 'edit';
    const showEditor = effectiveView === 'edit' || effectiveView === 'split';
    const showPreview = (effectiveView === 'preview' || effectiveView === 'split') && Boolean(preview);

    const showMobileSplitTabs = isMobile && effectiveView === 'split' && preview;

    const style: React.CSSProperties = {};
    if (maxHeight !== undefined && maxHeight !== null) {
        const mh = typeof maxHeight === 'number' ? maxHeight + 'px' : maxHeight;
        style.height = mh;
        style.maxHeight = mh;
    } else if (minHeight !== undefined && minHeight !== null) {
        style.minHeight = typeof minHeight === 'number' ? minHeight + 'px' : minHeight;
    }

    return (
        <div
            className={classNames('eui-editor-shell', className, {
                'is-disabled': disabled,
                'is-readonly': readOnly,
                'view-edit': effectiveView === 'edit',
                'view-split': effectiveView === 'split',
                'view-preview': effectiveView === 'preview',
            })}
        >
            {(toolbar || showViewSwitcher) && (
                <div className="eui-editor-shell-toolbar">
                    <div
                        className="eui-editor-shell-toolbar-main"
                        role="toolbar"
                        aria-label="Editor formatting toolbar"
                        onKeyDown={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.tagName !== 'BUTTON') return;
                            if (target.closest('select, input, textarea')) return;
                            const focusable = Array.from(
                                e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not([disabled])'),
                            );
                            const idx = focusable.indexOf(target as HTMLButtonElement);
                            if (idx < 0) return;
                            let next = -1;
                            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % focusable.length;
                            else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + focusable.length) % focusable.length;
                            else if (e.key === 'Home') next = 0;
                            else if (e.key === 'End') next = focusable.length - 1;
                            else return;
                            e.preventDefault();
                            focusable[next]?.focus();
                        }}
                    >
                        {toolbar}
                    </div>
                    {showViewSwitcher && preview && (
                        <div
                            className="eui-editor-shell-view-switcher"
                            role="tablist"
                            aria-label="View mode"
                            onKeyDown={(e) => {
                                if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                                const idx = allowedViews.indexOf(effectiveView);
                                if (idx < 0) return;
                                const dir = e.key === 'ArrowRight' ? 1 : -1;
                                const next = allowedViews[(idx + dir + allowedViews.length) % allowedViews.length];
                                e.preventDefault();
                                selectView(next);
                            }}
                        >
                            {allowedViews.map((v) => {
                                const { label, icon: Icon } = VIEW_META[v];
                                const active = effectiveView === v;
                                return (
                                    <button
                                        key={v}
                                        type="button"
                                        className={classNames('eui-editor-shell-view-btn', { 'is-active': active })}
                                        onClick={() => selectView(v)}
                                        role="tab"
                                        aria-selected={active}
                                        tabIndex={active ? 0 : -1}
                                        title={label}
                                        aria-label={label + ' view'}
                                    >
                                        <span className="eui-editor-shell-view-btn-icon">
                                            <Icon />
                                        </span>
                                        <span className="eui-editor-shell-view-btn-label">{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
            {showMobileSplitTabs && (
                <div className="eui-editor-shell-mobile-tabs" role="tablist">
                    <button
                        type="button"
                        className={'eui-editor-shell-mobile-tab' + (mobileTab === 'edit' ? ' is-active' : '')}
                        onClick={() => setMobileTab('edit')}
                        role="tab"
                        aria-selected={mobileTab === 'edit'}
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        className={'eui-editor-shell-mobile-tab' + (mobileTab === 'preview' ? ' is-active' : '')}
                        onClick={() => setMobileTab('preview')}
                        role="tab"
                        aria-selected={mobileTab === 'preview'}
                    >
                        Preview
                    </button>
                </div>
            )}
            <div className="eui-editor-shell-body" style={style}>
                {showEditor && (
                    <div
                        className={classNames('eui-editor-shell-pane eui-editor-shell-edit-pane', {
                            'is-hidden-mobile': showMobileSplitTabs && mobileTab !== 'edit',
                        })}
                    >
                        {editor}
                    </div>
                )}
                {showPreview && (
                    <div
                        className={classNames('eui-editor-shell-pane eui-editor-shell-preview-pane', {
                            'is-hidden-mobile': showMobileSplitTabs && mobileTab !== 'preview',
                        })}
                    >
                        {preview}
                    </div>
                )}
            </div>
            {statusBar && <div className="eui-editor-shell-statusbar">{statusBar}</div>}
            <div
                className="eui-editor-shell-sr-only"
                aria-live="polite"
                aria-atomic="true"
                role="status"
            >
                {viewAnnouncement}
            </div>
        </div>
    );
};

export const TextEditorShell = memo(TextEditorShellInner);
