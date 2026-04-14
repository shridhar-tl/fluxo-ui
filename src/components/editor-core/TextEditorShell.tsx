import classNames from 'classnames';
import React, { memo, useCallback, useEffect, useState } from 'react';
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
                    <div className="eui-editor-shell-toolbar-main">{toolbar}</div>
                    {showViewSwitcher && preview && (
                        <div className="eui-editor-shell-view-switcher" role="tablist" aria-label="View mode">
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
        </div>
    );
};

export const TextEditorShell = memo(TextEditorShellInner);
