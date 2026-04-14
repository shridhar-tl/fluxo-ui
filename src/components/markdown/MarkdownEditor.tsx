import classNames from 'classnames';
import React, {
    forwardRef,
    memo,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    ImageDialog,
    LinkDialog,
    TextEditorShell,
    ToolbarButton,
    ToolbarDivider,
    ToolbarDropdown,
    useImageUpload,
    useUndoHistory,
    type EditorViewMode,
    type EditResult,
    type ImageDialogResult,
    type LinkDialogResult,
    type Range,
    type ToolbarDropdownOption,
    type UploadImageFn,
    type UploadStrategy,
} from '../editor-core';
import { HeadingIcon, TableIcon } from '../../assets/icons';
import { TableGridPicker } from './TableGridPicker';
import { MarkdownPreview } from './MarkdownPreview';
import {
    clearHeading,
    continueListOnEnter,
    indentMarkdown,
    insertCodeBlock,
    insertHorizontalRule,
    insertImage,
    insertLink,
    insertTable,
    outdentMarkdown,
    setHeading,
    toggleBlockquote,
    toggleBold,
    toggleInlineCode,
    toggleItalic,
    toggleOrderedList,
    toggleStrike,
    toggleTaskList,
    toggleUnorderedList,
} from './markdownCommands';
import {
    DEFAULT_MARKDOWN_TOOLBAR,
    MARKDOWN_ACTION_META,
    type MarkdownToolbarAction,
    type MarkdownToolbarItem,
} from './markdownToolbarConfig';
import './markdown.scss';

export interface MarkdownEditorHandle {
    focus: () => void;
    getValue: () => string;
    setValue: (value: string) => void;
    flushUploads: () => Promise<string>;
    isUploading: () => boolean;
}

export interface MarkdownEditorProps {
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    disabled?: boolean;
    className?: string;
    minHeight?: string | number;
    maxHeight?: string | number;
    view?: EditorViewMode;
    defaultView?: EditorViewMode;
    onViewChange?: (view: EditorViewMode) => void;
    allowedViews?: EditorViewMode[];
    toolbar?: MarkdownToolbarItem[] | false;
    showToolbar?: boolean;
    showStatusBar?: boolean;
    showWordCount?: boolean;
    uploadImage?: UploadImageFn;
    uploadStrategy?: UploadStrategy;
    maxImageSize?: number;
    acceptedImageTypes?: string[];
    onUploadError?: (message: string, file?: File) => void;
    autoFocus?: boolean;
    spellCheck?: boolean;
    previewEmptyFallback?: React.ReactNode;
    openLinksInNewTab?: boolean;
    id?: string;
    name?: string;
    ariaLabel?: string;
}

const formatImageInsert = ({ url, alt, uploading }: { url: string; alt: string; uploading?: boolean }): string => {
    if (uploading) return '![' + (alt || 'uploading') + '](uploading...)';
    return '![' + alt + '](' + url + ')';
};

function countWords(s: string): number {
    const trimmed = s.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
}

const MarkdownEditorInner = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>((props, ref) => {
    const {
        value: controlledValue,
        defaultValue = '',
        onChange,
        placeholder = 'Write markdown...',
        readOnly = false,
        disabled = false,
        className,
        minHeight = '320px',
        maxHeight,
        view: controlledView,
        defaultView = 'edit',
        onViewChange,
        allowedViews,
        toolbar = DEFAULT_MARKDOWN_TOOLBAR,
        showToolbar = true,
        showStatusBar = true,
        showWordCount = true,
        uploadImage,
        uploadStrategy = 'immediate',
        maxImageSize,
        acceptedImageTypes,
        onUploadError,
        autoFocus = false,
        spellCheck = true,
        previewEmptyFallback,
        openLinksInNewTab = true,
        id,
        name,
        ariaLabel,
    } = props;

    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<string>(controlledValue ?? defaultValue);
    const currentValue = isControlled ? (controlledValue as string) : internalValue;

    const [view, setView] = useState<EditorViewMode>(controlledView ?? defaultView);
    useEffect(() => {
        if (controlledView !== undefined) setView(controlledView);
    }, [controlledView]);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const pendingSelectionRef = useRef<Range | null>(null);
    const syncingRef = useRef<'none' | 'editor' | 'preview'>('none');

    const history = useUndoHistory({ value: currentValue, selection: { start: 0, end: 0 } });

    const applyEdit = useCallback(
        (result: EditResult, recordImmediate = true) => {
            if (!isControlled) setInternalValue(result.value);
            onChange?.(result.value);
            pendingSelectionRef.current = result.selection;
            history.record({ value: result.value, selection: result.selection }, recordImmediate);
        },
        [history, isControlled, onChange],
    );

    useEffect(() => {
        const ta = textareaRef.current;
        const sel = pendingSelectionRef.current;
        if (ta && sel) {
            ta.focus();
            ta.setSelectionRange(sel.start, sel.end);
            pendingSelectionRef.current = null;
        }
    }, [currentValue]);

    const imageUpload = useImageUpload({
        uploadImage,
        strategy: uploadStrategy,
        maxImageSize,
        acceptedImageTypes,
        formatInsert: formatImageInsert,
        onError: onUploadError,
    });

    const getRange = useCallback((): Range => {
        const ta = textareaRef.current;
        if (!ta) return { start: currentValue.length, end: currentValue.length };
        return { start: ta.selectionStart ?? 0, end: ta.selectionEnd ?? 0 };
    }, [currentValue.length]);

    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [tablePickerOpen, setTablePickerOpen] = useState(false);
    const linkInitialRef = useRef<{ text: string; url: string }>({ text: '', url: '' });
    const tableBtnRef = useRef<HTMLButtonElement>(null);

    const handleAction = useCallback(
        (action: MarkdownToolbarAction) => {
            if (readOnly || disabled) return;
            const range = getRange();
            const val = currentValue;
            let result: EditResult | null = null;
            switch (action) {
                case 'bold':
                    result = toggleBold(val, range);
                    break;
                case 'italic':
                    result = toggleItalic(val, range);
                    break;
                case 'strike':
                    result = toggleStrike(val, range);
                    break;
                case 'code':
                    result = toggleInlineCode(val, range);
                    break;
                case 'h1':
                    result = setHeading(val, range, 1);
                    break;
                case 'h2':
                    result = setHeading(val, range, 2);
                    break;
                case 'h3':
                    result = setHeading(val, range, 3);
                    break;
                case 'h4':
                    result = setHeading(val, range, 4);
                    break;
                case 'h5':
                    result = setHeading(val, range, 5);
                    break;
                case 'h6':
                    result = setHeading(val, range, 6);
                    break;
                case 'heading':
                    result = setHeading(val, range, 2);
                    break;
                case 'quote':
                    result = toggleBlockquote(val, range);
                    break;
                case 'ul':
                    result = toggleUnorderedList(val, range);
                    break;
                case 'ol':
                    result = toggleOrderedList(val, range);
                    break;
                case 'task':
                    result = toggleTaskList(val, range);
                    break;
                case 'link': {
                    const selected = val.slice(range.start, range.end);
                    linkInitialRef.current = { text: selected, url: '' };
                    setLinkDialogOpen(true);
                    return;
                }
                case 'image':
                    setImageDialogOpen(true);
                    return;
                case 'codeblock':
                    result = insertCodeBlock(val, range);
                    break;
                case 'table':
                    setTablePickerOpen(true);
                    return;
                case 'hr':
                    result = insertHorizontalRule(val, range);
                    break;
                case 'indent':
                    result = indentMarkdown(val, range);
                    break;
                case 'outdent':
                    result = outdentMarkdown(val, range);
                    break;
                case 'undo': {
                    const entry = history.undo();
                    if (entry) {
                        if (!isControlled) setInternalValue(entry.value);
                        onChange?.(entry.value);
                        pendingSelectionRef.current = entry.selection;
                    }
                    return;
                }
                case 'redo': {
                    const entry = history.redo();
                    if (entry) {
                        if (!isControlled) setInternalValue(entry.value);
                        onChange?.(entry.value);
                        pendingSelectionRef.current = entry.selection;
                    }
                    return;
                }
                default:
                    return;
            }
            if (result) applyEdit(result, true);
        },
        [applyEdit, currentValue, disabled, getRange, history, isControlled, onChange, readOnly],
    );

    const handleTextareaChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const nextValue = e.target.value;
            const selection: Range = { start: e.target.selectionStart ?? 0, end: e.target.selectionEnd ?? 0 };
            if (!isControlled) setInternalValue(nextValue);
            onChange?.(nextValue);
            history.record({ value: nextValue, selection }, false);
        },
        [history, isControlled, onChange],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (readOnly || disabled) return;
            const mod = e.ctrlKey || e.metaKey;
            const key = e.key.toLowerCase();
            if (mod && !e.shiftKey && !e.altKey) {
                if (key === 'b') {
                    e.preventDefault();
                    handleAction('bold');
                    return;
                }
                if (key === 'i') {
                    e.preventDefault();
                    handleAction('italic');
                    return;
                }
                if (key === 'k') {
                    e.preventDefault();
                    handleAction('link');
                    return;
                }
                if (key === 'e') {
                    e.preventDefault();
                    handleAction('code');
                    return;
                }
                if (key === 'z') {
                    e.preventDefault();
                    handleAction('undo');
                    return;
                }
                if (key === 'y') {
                    e.preventDefault();
                    handleAction('redo');
                    return;
                }
            }
            if (mod && e.shiftKey && !e.altKey) {
                if (key === 'z') {
                    e.preventDefault();
                    handleAction('redo');
                    return;
                }
                if (key === 'x') {
                    e.preventDefault();
                    handleAction('strike');
                    return;
                }
                if (e.code === 'Digit8') {
                    e.preventDefault();
                    handleAction('ul');
                    return;
                }
                if (e.code === 'Digit7') {
                    e.preventDefault();
                    handleAction('ol');
                    return;
                }
                if (e.code === 'Digit9') {
                    e.preventDefault();
                    handleAction('task');
                    return;
                }
                if (key === 'c') {
                    e.preventDefault();
                    handleAction('codeblock');
                    return;
                }
                if (e.key === '>' || e.code === 'Period') {
                    e.preventDefault();
                    handleAction('quote');
                    return;
                }
            }
            if (mod && e.altKey && !e.shiftKey) {
                if (e.code === 'Digit1') {
                    e.preventDefault();
                    handleAction('h1');
                    return;
                }
                if (e.code === 'Digit2') {
                    e.preventDefault();
                    handleAction('h2');
                    return;
                }
                if (e.code === 'Digit3') {
                    e.preventDefault();
                    handleAction('h3');
                    return;
                }
                if (e.code === 'Digit4') {
                    e.preventDefault();
                    handleAction('h4');
                    return;
                }
                if (e.code === 'Digit5') {
                    e.preventDefault();
                    handleAction('h5');
                    return;
                }
                if (e.code === 'Digit6') {
                    e.preventDefault();
                    handleAction('h6');
                    return;
                }
            }
            if (e.key === 'Tab') {
                e.preventDefault();
                handleAction(e.shiftKey ? 'outdent' : 'indent');
                return;
            }
            if (e.key === 'Enter' && !e.shiftKey && !mod) {
                const range = getRange();
                const result = continueListOnEnter(currentValue, range);
                if (result) {
                    e.preventDefault();
                    applyEdit(result, true);
                }
            }
        },
        [applyEdit, currentValue, disabled, getRange, handleAction, readOnly],
    );

    const handlePaste = useCallback(
        async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
            if (readOnly || disabled) return;
            const items = Array.from(e.clipboardData?.items ?? []);
            const files = items
                .filter((it) => it.kind === 'file' && it.type.startsWith('image/'))
                .map((it) => it.getAsFile())
                .filter((f): f is File => Boolean(f));
            if (files.length === 0) return;
            if (!imageUpload.hasUploader && uploadStrategy === 'immediate') return;
            e.preventDefault();
            const inserts = await imageUpload.handleFiles(files);
            if (inserts.length === 0) return;
            const range = getRange();
            const text = inserts.join('\n\n');
            const result: EditResult = {
                value: currentValue.slice(0, range.start) + text + currentValue.slice(range.end),
                selection: { start: range.start + text.length, end: range.start + text.length },
            };
            applyEdit(result, true);
        },
        [applyEdit, currentValue, disabled, getRange, imageUpload, readOnly, uploadStrategy],
    );

    const handleDrop = useCallback(
        async (e: React.DragEvent<HTMLTextAreaElement>) => {
            if (readOnly || disabled) return;
            const files = Array.from(e.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'));
            if (files.length === 0) return;
            e.preventDefault();
            const inserts = await imageUpload.handleFiles(files);
            if (inserts.length === 0) return;
            const range = getRange();
            const text = inserts.join('\n\n');
            const result: EditResult = {
                value: currentValue.slice(0, range.start) + text + currentValue.slice(range.end),
                selection: { start: range.start + text.length, end: range.start + text.length },
            };
            applyEdit(result, true);
        },
        [applyEdit, currentValue, disabled, getRange, imageUpload, readOnly],
    );

    const handleLinkConfirm = useCallback(
        (result: LinkDialogResult) => {
            setLinkDialogOpen(false);
            const range = getRange();
            applyEdit(insertLink(currentValue, range, result.text, result.url), true);
        },
        [applyEdit, currentValue, getRange],
    );

    const handleImageConfirm = useCallback(
        async (result: ImageDialogResult) => {
            setImageDialogOpen(false);
            const range = getRange();
            if (result.kind === 'url') {
                applyEdit(insertImage(currentValue, range, result.alt, result.url), true);
                return;
            }
            const inserts = await imageUpload.handleFiles([result.file]);
            if (inserts.length === 0) return;
            const text = inserts.join('');
            const edit: EditResult = {
                value: currentValue.slice(0, range.start) + text + currentValue.slice(range.end),
                selection: { start: range.start + text.length, end: range.start + text.length },
            };
            applyEdit(edit, true);
        },
        [applyEdit, currentValue, getRange, imageUpload],
    );

    const handleViewChange = useCallback(
        (next: EditorViewMode) => {
            if (controlledView === undefined) setView(next);
            onViewChange?.(next);
        },
        [controlledView, onViewChange],
    );

    useImperativeHandle(
        ref,
        () => ({
            focus: () => textareaRef.current?.focus(),
            getValue: () => currentValue,
            setValue: (v: string) => {
                if (!isControlled) setInternalValue(v);
                onChange?.(v);
                history.reset({ value: v, selection: { start: 0, end: 0 } });
            },
            flushUploads: () => imageUpload.flushUploads(currentValue),
            isUploading: () => imageUpload.isUploading,
        }),
        [currentValue, history, imageUpload, isControlled, onChange],
    );

    const toolbarItems = toolbar === false ? [] : toolbar;

    const handleHeadingSelect = useCallback(
        (id: string) => {
            if (readOnly || disabled) return;
            const range = getRange();
            const val = currentValue;
            if (id === 'paragraph') {
                applyEdit(clearHeading(val, range), true);
                return;
            }
            const level = parseInt(id.replace('h', ''), 10);
            if (level >= 1 && level <= 6) {
                applyEdit(setHeading(val, range, level as 1 | 2 | 3 | 4 | 5 | 6), true);
            }
        },
        [applyEdit, currentValue, disabled, getRange, readOnly],
    );

    const handleTableSelect = useCallback(
        (rows: number, cols: number) => {
            setTablePickerOpen(false);
            const range = getRange();
            applyEdit(insertTable(currentValue, range, cols, rows), true);
        },
        [applyEdit, currentValue, getRange],
    );

    const headingOptions = useMemo<ToolbarDropdownOption[]>(
        () => [
            { id: 'paragraph', label: 'Paragraph' },
            { id: 'h1', label: 'Heading 1', shortcut: 'Ctrl+Alt+1' },
            { id: 'h2', label: 'Heading 2', shortcut: 'Ctrl+Alt+2' },
            { id: 'h3', label: 'Heading 3', shortcut: 'Ctrl+Alt+3' },
            { id: 'h4', label: 'Heading 4', shortcut: 'Ctrl+Alt+4' },
            { id: 'h5', label: 'Heading 5', shortcut: 'Ctrl+Alt+5' },
            { id: 'h6', label: 'Heading 6', shortcut: 'Ctrl+Alt+6' },
        ],
        [],
    );

    const toolbarNode = useMemo(() => {
        if (!showToolbar || toolbarItems.length === 0) return null;
        return (
            <div className="eui-md-toolbar" role="toolbar" aria-label="Markdown formatting">
                {toolbarItems.map((item, idx) => {
                    if (item === 'divider') return <ToolbarDivider key={'d' + idx} />;
                    if (item === 'heading') {
                        return (
                            <ToolbarDropdown
                                key={'heading' + idx}
                                label="Heading"
                                icon={<HeadingIcon />}
                                options={headingOptions}
                                onSelect={handleHeadingSelect}
                                disabled={readOnly || disabled}
                                title="Heading"
                            />
                        );
                    }
                    if (item === 'table') {
                        return (
                            <button
                                key={'table' + idx}
                                ref={tableBtnRef}
                                type="button"
                                className={'eui-editor-toolbar-btn' + (tablePickerOpen ? ' is-active' : '')}
                                onClick={() => setTablePickerOpen((o) => !o)}
                                onMouseDown={(e) => e.preventDefault()}
                                disabled={readOnly || disabled}
                                aria-label="Insert table"
                                aria-haspopup="dialog"
                                aria-expanded={tablePickerOpen}
                                title="Insert table"
                            >
                                <span className="eui-editor-toolbar-btn-icon">
                                    <TableIcon />
                                </span>
                            </button>
                        );
                    }
                    const meta = MARKDOWN_ACTION_META[item];
                    if (!meta) return null;
                    const Icon = meta.icon;
                    const isDisabled =
                        readOnly ||
                        disabled ||
                        (item === 'undo' && !history.canUndo) ||
                        (item === 'redo' && !history.canRedo);
                    return (
                        <ToolbarButton
                            key={item + idx}
                            icon={<Icon />}
                            label={meta.label}
                            shortcut={meta.shortcut}
                            onClick={() => handleAction(item)}
                            disabled={isDisabled}
                        />
                    );
                })}
            </div>
        );
    }, [
        disabled,
        handleAction,
        handleHeadingSelect,
        headingOptions,
        history.canRedo,
        history.canUndo,
        readOnly,
        showToolbar,
        tablePickerOpen,
        toolbarItems,
    ]);

    const editorNode = (
        <textarea
            ref={textareaRef}
            id={id}
            name={name}
            aria-label={ariaLabel ?? 'Markdown editor'}
            className="eui-md-textarea"
            value={currentValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            placeholder={placeholder}
            readOnly={readOnly}
            disabled={disabled}
            spellCheck={spellCheck}
            autoFocus={autoFocus}
        />
    );

    const previewNode = (
        <MarkdownPreview
            ref={previewRef}
            value={currentValue}
            openLinksInNewTab={openLinksInNewTab}
            emptyFallback={previewEmptyFallback ?? <span className="eui-md-preview-empty">Nothing to preview</span>}
        />
    );

    useEffect(() => {
        if (view !== 'split') return;
        const ta = textareaRef.current;
        const pv = previewRef.current;
        if (!ta || !pv) return;

        const getRatio = (el: HTMLElement): number => {
            const max = el.scrollHeight - el.clientHeight;
            return max > 0 ? el.scrollTop / max : 0;
        };
        const setRatio = (el: HTMLElement, ratio: number): void => {
            const max = el.scrollHeight - el.clientHeight;
            if (max > 0) el.scrollTop = max * ratio;
        };

        const handleEditorScroll = () => {
            if (syncingRef.current === 'preview') {
                syncingRef.current = 'none';
                return;
            }
            syncingRef.current = 'editor';
            setRatio(pv, getRatio(ta));
        };
        const handlePreviewScroll = () => {
            if (syncingRef.current === 'editor') {
                syncingRef.current = 'none';
                return;
            }
            syncingRef.current = 'preview';
            setRatio(ta, getRatio(pv));
        };

        ta.addEventListener('scroll', handleEditorScroll, { passive: true });
        pv.addEventListener('scroll', handlePreviewScroll, { passive: true });
        return () => {
            ta.removeEventListener('scroll', handleEditorScroll);
            pv.removeEventListener('scroll', handlePreviewScroll);
        };
    }, [view]);

    const statusBar =
        showStatusBar && (
            <div className="eui-md-statusbar">
                {showWordCount && (
                    <span>
                        {countWords(currentValue)} words · {currentValue.length} chars
                    </span>
                )}
                {imageUpload.isUploading && (
                    <span role="status" aria-live="polite" className="eui-md-uploading">
                        Uploading image...
                    </span>
                )}
            </div>
        );

    return (
        <>
            <TextEditorShell
                className={classNames('eui-md-editor', className)}
                toolbar={toolbarNode}
                editor={editorNode}
                preview={previewNode}
                view={view}
                onViewChange={handleViewChange}
                allowedViews={allowedViews}
                minHeight={minHeight}
                maxHeight={maxHeight}
                disabled={disabled}
                readOnly={readOnly}
                statusBar={statusBar || undefined}
            />
            <LinkDialog
                open={linkDialogOpen}
                initialText={linkInitialRef.current.text}
                initialUrl={linkInitialRef.current.url}
                onCancel={() => setLinkDialogOpen(false)}
                onConfirm={handleLinkConfirm}
            />
            <ImageDialog
                open={imageDialogOpen}
                allowUpload={imageUpload.hasUploader}
                acceptedImageTypes={acceptedImageTypes}
                onCancel={() => setImageDialogOpen(false)}
                onConfirm={handleImageConfirm}
            />
            <TableGridPicker
                open={tablePickerOpen}
                anchorRef={tableBtnRef}
                onClose={() => setTablePickerOpen(false)}
                onSelect={handleTableSelect}
            />
        </>
    );
});

MarkdownEditorInner.displayName = 'MarkdownEditor';

export const MarkdownEditor = memo(MarkdownEditorInner);
