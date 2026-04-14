import classNames from 'classnames';
import React, {
    forwardRef,
    memo,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';
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
    type ImageDialogResult,
    type LinkDialogResult,
    type ToolbarDropdownOption,
    type UploadImageFn,
    type UploadStrategy,
} from '../editor-core';
import {
    AlignLeftIcon,
    BgColorIcon,
    FontFamilyIcon,
    FontSizeIcon,
    HeadingIcon,
    TableIcon,
    TextColorIcon,
} from '../../assets/icons';
import { HtmlPreview } from './HtmlPreview';
import { sanitizeHtml, type HtmlSanitizerConfig } from './htmlSanitizer';
import {
    BG_COLOR_PALETTE,
    DEFAULT_HTML_TOOLBAR,
    FONT_FAMILY_OPTIONS,
    FONT_SIZE_OPTIONS,
    HTML_ACTION_META,
    TEXT_COLOR_PALETTE,
    type HtmlToolbarAction,
    type HtmlToolbarItem,
} from './htmlToolbarConfig';
import './html-editor.scss';

export interface HtmlEditorHandle {
    focus: () => void;
    getValue: () => string;
    setValue: (value: string) => void;
    flushUploads: () => Promise<string>;
    isUploading: () => boolean;
}

export interface HtmlEditorProps {
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
    toolbar?: HtmlToolbarItem[] | false;
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
    sanitize?: (html: string) => string;
    sanitizerConfig?: HtmlSanitizerConfig;
    id?: string;
    name?: string;
    ariaLabel?: string;
}

const formatImageInsert = ({ url, alt, uploading }: { url: string; alt: string; uploading?: boolean }): string => {
    const safeAlt = (alt || '').replace(/"/g, '&quot;');
    if (uploading) {
        return '<img src="" alt="' + safeAlt + '" data-uploading="true" />';
    }
    return '<img src="' + url + '" alt="' + safeAlt + '" />';
};

function countWords(plain: string): number {
    const trimmed = plain.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
}

interface SavedRange {
    start: { path: number[]; offset: number };
    end: { path: number[]; offset: number };
}

function getPath(root: Node, node: Node): number[] {
    const path: number[] = [];
    let current: Node | null = node;
    while (current && current !== root) {
        const parent: Node | null = current.parentNode;
        if (!parent) break;
        const idx = Array.prototype.indexOf.call(parent.childNodes, current);
        path.unshift(idx);
        current = parent;
    }
    return path;
}

function resolvePath(root: Node, path: number[]): Node | null {
    let current: Node = root;
    for (const idx of path) {
        const next = current.childNodes[idx];
        if (!next) return current;
        current = next;
    }
    return current;
}

function saveRange(root: HTMLElement): SavedRange | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const r = sel.getRangeAt(0);
    if (!root.contains(r.startContainer) || !root.contains(r.endContainer)) return null;
    return {
        start: { path: getPath(root, r.startContainer), offset: r.startOffset },
        end: { path: getPath(root, r.endContainer), offset: r.endOffset },
    };
}

function restoreRange(root: HTMLElement, saved: SavedRange | null): void {
    if (!saved) return;
    const startNode = resolvePath(root, saved.start.path);
    const endNode = resolvePath(root, saved.end.path);
    if (!startNode || !endNode) return;
    try {
        const range = document.createRange();
        const startMax =
            startNode.nodeType === Node.TEXT_NODE
                ? (startNode as Text).length
                : startNode.childNodes.length;
        const endMax =
            endNode.nodeType === Node.TEXT_NODE ? (endNode as Text).length : endNode.childNodes.length;
        range.setStart(startNode, Math.min(saved.start.offset, startMax));
        range.setEnd(endNode, Math.min(saved.end.offset, endMax));
        const sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
        }
    } catch {
        /* noop */
    }
}

function execCmd(cmd: string, value?: string): void {
    try {
        document.execCommand(cmd, false, value);
    } catch {
        /* noop */
    }
}

function selectionIsInside(root: HTMLElement): boolean {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const r = sel.getRangeAt(0);
    return root.contains(r.commonAncestorContainer);
}

function ensureFocusAndSelection(root: HTMLElement, saved: SavedRange | null): void {
    root.focus();
    if (!selectionIsInside(root)) {
        restoreRange(root, saved);
        if (!selectionIsInside(root)) {
            const range = document.createRange();
            range.selectNodeContents(root);
            range.collapse(false);
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }
}

function wrapSelectionWithStyle(prop: 'color' | 'backgroundColor' | 'fontSize' | 'fontFamily', value: string): void {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
    const span = document.createElement('span');
    span.style.setProperty(
        prop === 'backgroundColor'
            ? 'background-color'
            : prop === 'fontSize'
              ? 'font-size'
              : prop === 'fontFamily'
                ? 'font-family'
                : 'color',
        value,
    );
    try {
        span.appendChild(range.extractContents());
        range.insertNode(span);
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.addRange(newRange);
    } catch {
        /* noop */
    }
}

function insertHtmlAtCaret(html: string): void {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
        execCmd('insertHTML', html);
        return;
    }
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const frag = document.createDocumentFragment();
    let lastNode: Node | null = null;
    while (temp.firstChild) {
        lastNode = frag.appendChild(temp.firstChild);
    }
    range.insertNode(frag);
    if (lastNode) {
        const newRange = document.createRange();
        newRange.setStartAfter(lastNode);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
    }
}

function buildTableHtml(rows: number, cols: number): string {
    const parts: string[] = ['<table class="eui-html-table"><thead><tr>'];
    for (let c = 0; c < cols; c += 1) parts.push('<th>Header ' + (c + 1) + '</th>');
    parts.push('</tr></thead><tbody>');
    for (let r = 0; r < rows; r += 1) {
        parts.push('<tr>');
        for (let c = 0; c < cols; c += 1) parts.push('<td>&nbsp;</td>');
        parts.push('</tr>');
    }
    parts.push('</tbody></table><p><br/></p>');
    return parts.join('');
}

function buildTaskListHtml(): string {
    return (
        '<ul data-task-list="true" class="eui-html-task-list">' +
        '<li data-task-item="true"><input type="checkbox" /> Task item</li>' +
        '</ul>'
    );
}

function buildHeadingValue(level: number): string {
    return 'h' + level;
}

interface ColorPopoverProps {
    open: boolean;
    anchorRef: React.RefObject<HTMLElement | null>;
    palette: string[];
    allowCustom?: boolean;
    onPick: (color: string) => void;
    onClose: () => void;
    label: string;
}

const COLOR_GRID_COLS = 6;

const ColorPopover: React.FC<ColorPopoverProps> = ({ open, anchorRef, palette, allowCustom = true, onPick, onClose, label }) => {
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const panelRef = useRef<HTMLDivElement>(null);
    const swatchRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [customColor, setCustomColor] = useState('#3b82f6');

    const recompute = useCallback(() => {
        const a = anchorRef.current;
        if (!a) return;
        const rect = a.getBoundingClientRect();
        setCoords({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    }, [anchorRef]);

    useLayoutEffect(() => {
        if (open) {
            recompute();
            setActiveIdx(0);
        }
    }, [open, recompute]);

    useEffect(() => {
        if (!open) return;
        const t = window.setTimeout(() => {
            swatchRefs.current[0]?.focus();
        }, 10);
        return () => window.clearTimeout(t);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const h = () => recompute();
        window.addEventListener('scroll', h, true);
        window.addEventListener('resize', h);
        return () => {
            window.removeEventListener('scroll', h, true);
            window.removeEventListener('resize', h);
        };
    }, [open, recompute]);

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            const t = e.target as Node;
            if (anchorRef.current?.contains(t)) return;
            if (panelRef.current?.contains(t)) return;
            onClose();
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
                anchorRef.current?.focus();
            }
        };
        document.addEventListener('mousedown', onDoc);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDoc);
            document.removeEventListener('keydown', onKey);
        };
    }, [anchorRef, onClose, open]);

    const focusIdx = useCallback((idx: number) => {
        const max = swatchRefs.current.length - 1;
        const clamped = Math.max(0, Math.min(max, idx));
        setActiveIdx(clamped);
        swatchRefs.current[clamped]?.focus();
    }, []);

    const handleSwatchKey = useCallback(
        (e: React.KeyboardEvent, idx: number) => {
            const total = palette.length;
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                focusIdx((idx + 1) % total);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                focusIdx((idx - 1 + total) % total);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = idx + COLOR_GRID_COLS;
                focusIdx(next < total ? next : idx);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = idx - COLOR_GRID_COLS;
                focusIdx(prev >= 0 ? prev : idx);
            } else if (e.key === 'Home') {
                e.preventDefault();
                focusIdx(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                focusIdx(total - 1);
            } else if (e.key === 'Tab') {
                return;
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onPick(palette[idx]);
            }
        },
        [focusIdx, onPick, palette],
    );

    if (!open) return null;

    return createPortal(
        <div
            ref={panelRef}
            className="eui-html-color-popover"
            role="dialog"
            aria-modal="true"
            aria-label={label}
            style={{ top: coords.top, left: coords.left }}
        >
            <div
                className="eui-html-color-grid"
                role="grid"
                aria-label={label + ' palette'}
                aria-rowcount={Math.ceil(palette.length / COLOR_GRID_COLS)}
                aria-colcount={COLOR_GRID_COLS}
            >
                {palette.map((c, idx) => (
                    <button
                        key={c + idx}
                        ref={(el) => {
                            swatchRefs.current[idx] = el;
                        }}
                        type="button"
                        role="gridcell"
                        className="eui-html-color-swatch"
                        style={{ background: c === 'transparent' ? 'transparent' : c }}
                        aria-label={c === 'transparent' ? 'No color' : 'Color ' + c}
                        aria-selected={idx === activeIdx}
                        title={c}
                        tabIndex={idx === activeIdx ? 0 : -1}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => onPick(c)}
                        onFocus={() => setActiveIdx(idx)}
                        onKeyDown={(e) => handleSwatchKey(e, idx)}
                    >
                        {c === 'transparent' && (
                            <span className="eui-html-color-none" aria-hidden="true">
                                /
                            </span>
                        )}
                    </button>
                ))}
            </div>
            {allowCustom && (
                <div className="eui-html-color-custom">
                    <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        aria-label="Custom color picker"
                    />
                    <button
                        type="button"
                        className="eui-html-color-apply"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => onPick(customColor)}
                    >
                        Apply
                    </button>
                </div>
            )}
        </div>,
        document.body,
    );
};

interface TableGridPanelProps {
    open: boolean;
    anchorRef: React.RefObject<HTMLElement | null>;
    onSelect: (rows: number, cols: number) => void;
    onClose: () => void;
}

const TABLE_MAX_ROWS = 10;
const TABLE_MAX_COLS = 10;

const TableGridPanel: React.FC<TableGridPanelProps> = ({ open, anchorRef, onSelect, onClose }) => {
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [hover, setHover] = useState({ r: 2, c: 3 });
    const panelRef = useRef<HTMLDivElement>(null);
    const cellRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    const recompute = useCallback(() => {
        const a = anchorRef.current;
        if (!a) return;
        const rect = a.getBoundingClientRect();
        setCoords({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    }, [anchorRef]);

    useLayoutEffect(() => {
        if (open) {
            recompute();
            setHover({ r: 2, c: 3 });
        }
    }, [open, recompute]);

    useEffect(() => {
        if (!open) return;
        const t = window.setTimeout(() => {
            cellRefs.current.get('2-3')?.focus();
        }, 10);
        return () => window.clearTimeout(t);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const h = () => recompute();
        window.addEventListener('scroll', h, true);
        window.addEventListener('resize', h);
        return () => {
            window.removeEventListener('scroll', h, true);
            window.removeEventListener('resize', h);
        };
    }, [open, recompute]);

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            const t = e.target as Node;
            if (anchorRef.current?.contains(t)) return;
            if (panelRef.current?.contains(t)) return;
            onClose();
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [anchorRef, onClose, open]);

    const moveTo = useCallback((r: number, c: number) => {
        const nr = Math.max(1, Math.min(TABLE_MAX_ROWS, r));
        const nc = Math.max(1, Math.min(TABLE_MAX_COLS, c));
        setHover({ r: nr, c: nc });
        cellRefs.current.get(nr + '-' + nc)?.focus();
    }, []);

    const handleCellKey = useCallback(
        (e: React.KeyboardEvent, r: number, c: number) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
                anchorRef.current?.focus();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                moveTo(r, c + 1);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                moveTo(r, c - 1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                moveTo(r + 1, c);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                moveTo(r - 1, c);
            } else if (e.key === 'Home') {
                e.preventDefault();
                moveTo(r, 1);
            } else if (e.key === 'End') {
                e.preventDefault();
                moveTo(r, TABLE_MAX_COLS);
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(r, c);
            }
        },
        [anchorRef, moveTo, onClose, onSelect],
    );

    if (!open) return null;

    const cells: React.ReactNode[] = [];
    for (let r = 1; r <= TABLE_MAX_ROWS; r += 1) {
        for (let c = 1; c <= TABLE_MAX_COLS; c += 1) {
            const filled = r <= hover.r && c <= hover.c;
            const isActive = r === hover.r && c === hover.c;
            const key = r + '-' + c;
            cells.push(
                <button
                    key={key}
                    ref={(el) => {
                        if (el) cellRefs.current.set(key, el);
                        else cellRefs.current.delete(key);
                    }}
                    type="button"
                    role="gridcell"
                    className={'eui-html-table-grid-cell' + (filled ? ' is-filled' : '')}
                    onMouseEnter={() => setHover({ r, c })}
                    onFocus={() => setHover({ r, c })}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onSelect(r, c)}
                    onKeyDown={(e) => handleCellKey(e, r, c)}
                    aria-label={r + ' by ' + c + ' table'}
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                />,
            );
        }
    }

    return createPortal(
        <div
            ref={panelRef}
            className="eui-html-table-grid-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Insert table"
            style={{ top: coords.top, left: coords.left }}
        >
            <div className="eui-html-table-grid-label" aria-live="polite">
                {hover.r} × {hover.c}
            </div>
            <div
                className="eui-html-table-grid"
                role="grid"
                aria-rowcount={TABLE_MAX_ROWS}
                aria-colcount={TABLE_MAX_COLS}
                style={{ gridTemplateColumns: 'repeat(' + TABLE_MAX_COLS + ', 1fr)' }}
            >
                {cells}
            </div>
        </div>,
        document.body,
    );
};

const HtmlEditorInner = forwardRef<HtmlEditorHandle, HtmlEditorProps>((props, ref) => {
    const {
        value: controlledValue,
        defaultValue = '',
        onChange,
        placeholder = 'Start writing...',
        readOnly = false,
        disabled = false,
        className,
        minHeight = '320px',
        maxHeight,
        view: controlledView,
        defaultView = 'edit',
        onViewChange,
        allowedViews,
        toolbar = DEFAULT_HTML_TOOLBAR,
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
        sanitize,
        sanitizerConfig,
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

    const editableRef = useRef<HTMLDivElement | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const savedRangeRef = useRef<SavedRange | null>(null);
    const syncingRef = useRef<'none' | 'editor' | 'preview'>('none');
    const isSettingContentRef = useRef<boolean>(false);
    const currentValueRef = useRef<string>(currentValue);
    currentValueRef.current = currentValue;

    const history = useUndoHistory({ value: currentValue, selection: { start: 0, end: 0 } });

    const setEditableRef = useCallback((el: HTMLDivElement | null) => {
        editableRef.current = el;
        if (el && el.innerHTML !== currentValueRef.current) {
            isSettingContentRef.current = true;
            el.innerHTML = currentValueRef.current;
            isSettingContentRef.current = false;
        }
    }, []);

    useLayoutEffect(() => {
        const el = editableRef.current;
        if (!el) return;
        if (isSettingContentRef.current) return;
        if (el.innerHTML !== currentValue) {
            isSettingContentRef.current = true;
            el.innerHTML = currentValue;
            isSettingContentRef.current = false;
        }
    }, [currentValue]);

    useEffect(() => {
        if (autoFocus) {
            editableRef.current?.focus();
        }
    }, [autoFocus]);

    const imageUpload = useImageUpload({
        uploadImage,
        strategy: uploadStrategy,
        maxImageSize,
        acceptedImageTypes,
        formatInsert: formatImageInsert,
        onError: onUploadError,
    });

    const captureSelection = useCallback(() => {
        const el = editableRef.current;
        if (!el) return;
        const s = saveRange(el);
        if (s) savedRangeRef.current = s;
    }, []);

    const handleValueChange = useCallback(
        (nextValue: string, immediate = false) => {
            if (!isControlled) setInternalValue(nextValue);
            onChange?.(nextValue);
            history.record({ value: nextValue, selection: { start: 0, end: 0 } }, immediate);
        },
        [history, isControlled, onChange],
    );

    const commitFromDom = useCallback(
        (immediate = false) => {
            const el = editableRef.current;
            if (!el) return;
            const next = el.innerHTML;
            if (next === currentValue) return;
            handleValueChange(next, immediate);
        },
        [currentValue, handleValueChange],
    );

    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [tableOpen, setTableOpen] = useState(false);
    const [textColorOpen, setTextColorOpen] = useState(false);
    const [bgColorOpen, setBgColorOpen] = useState(false);
    const [sourceMode, setSourceMode] = useState(false);
    const linkInitialRef = useRef<{ text: string; url: string }>({ text: '', url: '' });
    const tableBtnRef = useRef<HTMLButtonElement>(null);
    const textColorBtnRef = useRef<HTMLButtonElement>(null);
    const bgColorBtnRef = useRef<HTMLButtonElement>(null);

    const runCommand = useCallback(
        (fn: () => void, immediate = true) => {
            if (readOnly || disabled) return;
            const el = editableRef.current;
            if (!el) return;
            ensureFocusAndSelection(el, savedRangeRef.current);
            fn();
            captureSelection();
            commitFromDom(immediate);
        },
        [captureSelection, commitFromDom, disabled, readOnly],
    );

    const handleHeading = useCallback(
        (level: number | 'p') => {
            runCommand(() => {
                execCmd('formatBlock', level === 'p' ? 'p' : buildHeadingValue(level));
            });
        },
        [runCommand],
    );

    const handleAction = useCallback(
        (action: HtmlToolbarAction) => {
            if (readOnly || disabled) return;
            switch (action) {
                case 'bold':
                    runCommand(() => execCmd('bold'));
                    return;
                case 'italic':
                    runCommand(() => execCmd('italic'));
                    return;
                case 'underline':
                    runCommand(() => execCmd('underline'));
                    return;
                case 'strike':
                    runCommand(() => execCmd('strikeThrough'));
                    return;
                case 'superscript':
                    runCommand(() => execCmd('superscript'));
                    return;
                case 'subscript':
                    runCommand(() => execCmd('subscript'));
                    return;
                case 'code':
                    runCommand(() => {
                        const sel = window.getSelection();
                        if (!sel || sel.rangeCount === 0) return;
                        const range = sel.getRangeAt(0);
                        if (range.collapsed) {
                            execCmd('insertHTML', '<code>code</code>');
                            return;
                        }
                        const code = document.createElement('code');
                        try {
                            code.appendChild(range.extractContents());
                            range.insertNode(code);
                            sel.removeAllRanges();
                            const nr = document.createRange();
                            nr.selectNodeContents(code);
                            sel.addRange(nr);
                        } catch {
                            /* noop */
                        }
                    });
                    return;
                case 'highlight':
                    runCommand(() => {
                        const sel = window.getSelection();
                        if (!sel || sel.rangeCount === 0) return;
                        const range = sel.getRangeAt(0);
                        if (range.collapsed) return;
                        const mark = document.createElement('mark');
                        try {
                            mark.appendChild(range.extractContents());
                            range.insertNode(mark);
                        } catch {
                            /* noop */
                        }
                    });
                    return;
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                    handleHeading(parseInt(action.slice(1), 10));
                    return;
                case 'paragraph':
                    handleHeading('p');
                    return;
                case 'quote':
                    runCommand(() => execCmd('formatBlock', 'blockquote'));
                    return;
                case 'ul':
                    runCommand(() => execCmd('insertUnorderedList'));
                    return;
                case 'ol':
                    runCommand(() => execCmd('insertOrderedList'));
                    return;
                case 'task':
                    runCommand(() => insertHtmlAtCaret(buildTaskListHtml()));
                    return;
                case 'link': {
                    if (readOnly || disabled) return;
                    const el = editableRef.current;
                    if (el) ensureFocusAndSelection(el, savedRangeRef.current);
                    captureSelection();
                    const sel = window.getSelection();
                    const selectedText = sel ? sel.toString() : '';
                    linkInitialRef.current = { text: selectedText, url: '' };
                    setLinkDialogOpen(true);
                    return;
                }
                case 'unlink':
                    runCommand(() => execCmd('unlink'));
                    return;
                case 'image':
                    captureSelection();
                    setImageDialogOpen(true);
                    return;
                case 'codeblock':
                    runCommand(() => {
                        insertHtmlAtCaret('<pre><code>code</code></pre><p><br/></p>');
                    });
                    return;
                case 'table':
                    captureSelection();
                    setTableOpen(true);
                    return;
                case 'hr':
                    runCommand(() => execCmd('insertHorizontalRule'));
                    return;
                case 'indent':
                    runCommand(() => execCmd('indent'));
                    return;
                case 'outdent':
                    runCommand(() => execCmd('outdent'));
                    return;
                case 'alignLeft':
                    runCommand(() => execCmd('justifyLeft'));
                    return;
                case 'alignCenter':
                    runCommand(() => execCmd('justifyCenter'));
                    return;
                case 'alignRight':
                    runCommand(() => execCmd('justifyRight'));
                    return;
                case 'alignJustify':
                    runCommand(() => execCmd('justifyFull'));
                    return;
                case 'textColor':
                    captureSelection();
                    setTextColorOpen((o) => !o);
                    return;
                case 'bgColor':
                    captureSelection();
                    setBgColorOpen((o) => !o);
                    return;
                case 'clearFormat':
                    runCommand(() => {
                        execCmd('removeFormat');
                        execCmd('formatBlock', 'p');
                    });
                    return;
                case 'source':
                    setSourceMode((s) => !s);
                    return;
                case 'undo': {
                    const entry = history.undo();
                    if (entry) {
                        if (!isControlled) setInternalValue(entry.value);
                        onChange?.(entry.value);
                    }
                    return;
                }
                case 'redo': {
                    const entry = history.redo();
                    if (entry) {
                        if (!isControlled) setInternalValue(entry.value);
                        onChange?.(entry.value);
                    }
                    return;
                }
                default:
                    return;
            }
        },
        [captureSelection, disabled, handleHeading, history, isControlled, onChange, readOnly, runCommand],
    );

    const handleFontFamily = useCallback(
        (id: string) => {
            const opt = FONT_FAMILY_OPTIONS.find((o) => o.id === id);
            if (!opt) return;
            runCommand(() => {
                if (!opt.value) {
                    execCmd('removeFormat');
                    return;
                }
                wrapSelectionWithStyle('fontFamily', opt.value);
            });
        },
        [runCommand],
    );

    const handleFontSize = useCallback(
        (id: string) => {
            const opt = FONT_SIZE_OPTIONS.find((o) => o.id === id);
            if (!opt) return;
            runCommand(() => {
                if (!opt.value) return;
                wrapSelectionWithStyle('fontSize', opt.value);
            });
        },
        [runCommand],
    );

    const handleTextColor = useCallback(
        (color: string) => {
            setTextColorOpen(false);
            runCommand(() => {
                if (!color) return;
                wrapSelectionWithStyle('color', color);
            });
        },
        [runCommand],
    );

    const handleBgColor = useCallback(
        (color: string) => {
            setBgColorOpen(false);
            runCommand(() => {
                if (color === 'transparent') {
                    execCmd('removeFormat');
                    return;
                }
                wrapSelectionWithStyle('backgroundColor', color);
            });
        },
        [runCommand],
    );

    const handleTableSelect = useCallback(
        (rows: number, cols: number) => {
            setTableOpen(false);
            runCommand(() => insertHtmlAtCaret(buildTableHtml(rows, cols)));
        },
        [runCommand],
    );

    const handleLinkConfirm = useCallback(
        (result: LinkDialogResult) => {
            setLinkDialogOpen(false);
            runCommand(() => {
                const text = result.text || result.url;
                const safeUrl = result.url.replace(/"/g, '&quot;');
                const safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                insertHtmlAtCaret('<a href="' + safeUrl + '">' + safeText + '</a>');
            });
        },
        [runCommand],
    );

    const handleImageConfirm = useCallback(
        async (result: ImageDialogResult) => {
            setImageDialogOpen(false);
            if (result.kind === 'url') {
                runCommand(() =>
                    insertHtmlAtCaret(formatImageInsert({ url: result.url, alt: result.alt })),
                );
                return;
            }
            const inserts = await imageUpload.handleFiles([result.file]);
            if (inserts.length === 0) return;
            runCommand(() => insertHtmlAtCaret(inserts.join('')));
        },
        [imageUpload, runCommand],
    );

    const handleInput = useCallback(() => {
        if (isSettingContentRef.current) return;
        commitFromDom(false);
        captureSelection();
    }, [captureSelection, commitFromDom]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
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
                if (key === 'u') {
                    e.preventDefault();
                    handleAction('underline');
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
                if (key === 's') {
                    e.preventDefault();
                    handleAction('source');
                    return;
                }
                if (key === 'c') {
                    e.preventDefault();
                    handleAction('codeblock');
                    return;
                }
                if (e.code === 'Period') {
                    e.preventDefault();
                    handleAction('quote');
                    return;
                }
            }
            if (mod && e.altKey && !e.shiftKey) {
                if (e.code === 'Digit0') {
                    e.preventDefault();
                    handleAction('paragraph');
                    return;
                }
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
        },
        [disabled, handleAction, readOnly],
    );

    const handlePaste = useCallback(
        async (e: React.ClipboardEvent<HTMLDivElement>) => {
            if (readOnly || disabled) return;
            const dt = e.clipboardData;
            if (!dt) return;
            const files = Array.from(dt.items)
                .filter((it) => it.kind === 'file' && it.type.startsWith('image/'))
                .map((it) => it.getAsFile())
                .filter((f): f is File => Boolean(f));
            if (files.length > 0) {
                e.preventDefault();
                const inserts = await imageUpload.handleFiles(files);
                if (inserts.length === 0) return;
                runCommand(() => insertHtmlAtCaret(inserts.join('')));
                return;
            }
            const html = dt.getData('text/html');
            if (html) {
                e.preventDefault();
                const cleaned = sanitize ? sanitize(html) : sanitizeHtml(html, sanitizerConfig);
                runCommand(() => insertHtmlAtCaret(cleaned));
                return;
            }
            const text = dt.getData('text/plain');
            if (text) {
                e.preventDefault();
                const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
                runCommand(() => insertHtmlAtCaret(escaped));
            }
        },
        [disabled, imageUpload, readOnly, runCommand, sanitize, sanitizerConfig],
    );

    const handleDrop = useCallback(
        async (e: React.DragEvent<HTMLDivElement>) => {
            if (readOnly || disabled) return;
            const files = Array.from(e.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'));
            if (files.length === 0) return;
            e.preventDefault();
            const inserts = await imageUpload.handleFiles(files);
            if (inserts.length === 0) return;
            runCommand(() => insertHtmlAtCaret(inserts.join('')));
        },
        [disabled, imageUpload, readOnly, runCommand],
    );

    const handleClickEditor = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' && target.getAttribute('type') === 'checkbox') {
                const input = target as HTMLInputElement;
                setTimeout(() => {
                    if (input.checked) {
                        input.setAttribute('checked', 'checked');
                    } else {
                        input.removeAttribute('checked');
                    }
                    commitFromDom(true);
                }, 0);
            }
        },
        [commitFromDom],
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
            focus: () => editableRef.current?.focus(),
            getValue: () => (editableRef.current ? editableRef.current.innerHTML : currentValue),
            setValue: (v: string) => {
                if (!isControlled) setInternalValue(v);
                onChange?.(v);
                history.reset({ value: v, selection: { start: 0, end: 0 } });
            },
            flushUploads: () => {
                const v = editableRef.current ? editableRef.current.innerHTML : currentValue;
                return imageUpload.flushUploads(v).then((result) => {
                    if (!isControlled) setInternalValue(result);
                    if (editableRef.current) {
                        isSettingContentRef.current = true;
                        editableRef.current.innerHTML = result;
                        isSettingContentRef.current = false;
                    }
                    onChange?.(result);
                    return result;
                });
            },
            isUploading: () => imageUpload.isUploading,
        }),
        [currentValue, history, imageUpload, isControlled, onChange],
    );

    const toolbarItems = toolbar === false ? [] : toolbar;

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

    const fontFamilyOptions = useMemo<ToolbarDropdownOption[]>(
        () => FONT_FAMILY_OPTIONS.map((o) => ({ id: o.id, label: o.label })),
        [],
    );

    const fontSizeOptions = useMemo<ToolbarDropdownOption[]>(
        () => FONT_SIZE_OPTIONS.map((o) => ({ id: o.id, label: o.label })),
        [],
    );

    const alignOptions = useMemo<ToolbarDropdownOption[]>(
        () => [
            { id: 'alignLeft', label: 'Align left' },
            { id: 'alignCenter', label: 'Align center' },
            { id: 'alignRight', label: 'Align right' },
            { id: 'alignJustify', label: 'Justify' },
        ],
        [],
    );

    const handleHeadingSelect = useCallback(
        (optId: string) => {
            if (optId === 'paragraph') {
                handleHeading('p');
                return;
            }
            const lvl = parseInt(optId.replace('h', ''), 10);
            if (lvl >= 1 && lvl <= 6) handleHeading(lvl);
        },
        [handleHeading],
    );

    const handleAlignSelect = useCallback(
        (optId: string) => handleAction(optId as HtmlToolbarAction),
        [handleAction],
    );

    const toolbarNode = useMemo(() => {
        if (!showToolbar || toolbarItems.length === 0) return null;
        return (
            <div className="eui-html-toolbar" role="toolbar" aria-label="HTML formatting">
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
                    if (item === 'fontFamily') {
                        return (
                            <ToolbarDropdown
                                key={'ff' + idx}
                                label="Font family"
                                icon={<FontFamilyIcon />}
                                options={fontFamilyOptions}
                                onSelect={handleFontFamily}
                                disabled={readOnly || disabled}
                                title="Font family"
                            />
                        );
                    }
                    if (item === 'fontSize') {
                        return (
                            <ToolbarDropdown
                                key={'fs' + idx}
                                label="Font size"
                                icon={<FontSizeIcon />}
                                options={fontSizeOptions}
                                onSelect={handleFontSize}
                                disabled={readOnly || disabled}
                                title="Font size"
                            />
                        );
                    }
                    if (item === 'align') {
                        return (
                            <ToolbarDropdown
                                key={'align' + idx}
                                label="Alignment"
                                icon={<AlignLeftIcon />}
                                options={alignOptions}
                                onSelect={handleAlignSelect}
                                disabled={readOnly || disabled}
                                title="Alignment"
                            />
                        );
                    }
                    if (item === 'table') {
                        return (
                            <button
                                key={'table' + idx}
                                ref={tableBtnRef}
                                type="button"
                                className={'eui-editor-toolbar-btn' + (tableOpen ? ' is-active' : '')}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    captureSelection();
                                    setTableOpen((o) => !o);
                                }}
                                disabled={readOnly || disabled}
                                aria-label="Insert table"
                                aria-haspopup="dialog"
                                aria-expanded={tableOpen}
                                title="Insert table"
                            >
                                <span className="eui-editor-toolbar-btn-icon">
                                    <TableIcon />
                                </span>
                            </button>
                        );
                    }
                    if (item === 'textColor') {
                        return (
                            <button
                                key={'tc' + idx}
                                ref={textColorBtnRef}
                                type="button"
                                className={'eui-editor-toolbar-btn' + (textColorOpen ? ' is-active' : '')}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    captureSelection();
                                    setTextColorOpen((o) => !o);
                                }}
                                disabled={readOnly || disabled}
                                aria-label="Text color"
                                aria-haspopup="dialog"
                                aria-expanded={textColorOpen}
                                title="Text color"
                            >
                                <span className="eui-editor-toolbar-btn-icon">
                                    <TextColorIcon />
                                </span>
                            </button>
                        );
                    }
                    if (item === 'bgColor') {
                        return (
                            <button
                                key={'bc' + idx}
                                ref={bgColorBtnRef}
                                type="button"
                                className={'eui-editor-toolbar-btn' + (bgColorOpen ? ' is-active' : '')}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    captureSelection();
                                    setBgColorOpen((o) => !o);
                                }}
                                disabled={readOnly || disabled}
                                aria-label="Background color"
                                aria-haspopup="dialog"
                                aria-expanded={bgColorOpen}
                                title="Background color"
                            >
                                <span className="eui-editor-toolbar-btn-icon">
                                    <BgColorIcon />
                                </span>
                            </button>
                        );
                    }
                    const meta = HTML_ACTION_META[item];
                    if (!meta) return null;
                    const Icon = meta.icon;
                    const isDisabled =
                        disabled ||
                        (item !== 'source' && readOnly) ||
                        (item === 'undo' && !history.canUndo) ||
                        (item === 'redo' && !history.canRedo);
                    const isActive = item === 'source' && sourceMode;
                    return (
                        <ToolbarButton
                            key={item + idx}
                            icon={<Icon />}
                            label={meta.label}
                            shortcut={meta.shortcut}
                            onClick={() => handleAction(item)}
                            disabled={isDisabled}
                            active={isActive}
                        />
                    );
                })}
            </div>
        );
    }, [
        alignOptions,
        bgColorOpen,
        captureSelection,
        disabled,
        fontFamilyOptions,
        fontSizeOptions,
        handleAction,
        handleAlignSelect,
        handleFontFamily,
        handleFontSize,
        handleHeadingSelect,
        headingOptions,
        history.canRedo,
        history.canUndo,
        readOnly,
        showToolbar,
        sourceMode,
        tableOpen,
        textColorOpen,
        toolbarItems,
    ]);

    const handleSourceChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const next = e.target.value;
            if (!isControlled) setInternalValue(next);
            onChange?.(next);
            history.record({ value: next, selection: { start: 0, end: 0 } }, false);
        },
        [history, isControlled, onChange],
    );

    const editorNode = sourceMode ? (
        <div className="eui-html-editable-wrap">
            <textarea
                id={id}
                aria-label={(ariaLabel ?? 'Rich text editor') + ' — HTML source mode'}
                aria-describedby={id ? id + '-source-desc' : undefined}
                className="eui-html-source"
                value={currentValue}
                onChange={handleSourceChange}
                readOnly={readOnly}
                disabled={disabled}
                spellCheck={false}
                placeholder={placeholder}
            />
            {id && (
                <span id={id + '-source-desc'} className="eui-html-visually-hidden">
                    Raw HTML source. Edits here update the rich text editor when you toggle back.
                </span>
            )}
            {name && <input type="hidden" name={name} value={currentValue} />}
        </div>
    ) : (
        <div className="eui-html-editable-wrap">
            <div
                ref={setEditableRef}
                id={id}
                role="textbox"
                aria-multiline="true"
                aria-label={ariaLabel ?? 'Rich text editor'}
                aria-placeholder={placeholder}
                aria-readonly={readOnly || undefined}
                aria-disabled={disabled || undefined}
                className={classNames('eui-html-editable', {
                    'is-empty': !currentValue,
                    'is-disabled': disabled,
                })}
                contentEditable={!readOnly && !disabled}
                suppressContentEditableWarning
                spellCheck={spellCheck}
                data-placeholder={placeholder}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onKeyUp={captureSelection}
                onMouseUp={captureSelection}
                onClick={handleClickEditor}
            />
            {name && <input type="hidden" name={name} value={currentValue} />}
        </div>
    );

    const previewNode = (
        <HtmlPreview
            ref={previewRef}
            value={currentValue}
            sanitize={sanitize}
            sanitizerConfig={sanitizerConfig}
            openLinksInNewTab={openLinksInNewTab}
            emptyFallback={previewEmptyFallback ?? <span className="eui-html-preview-empty">Nothing to preview</span>}
        />
    );

    useEffect(() => {
        if (view !== 'split') return;
        const ed = editableRef.current;
        const pv = previewRef.current;
        if (!ed || !pv) return;

        const getRatio = (el: HTMLElement): number => {
            const max = el.scrollHeight - el.clientHeight;
            return max > 0 ? el.scrollTop / max : 0;
        };
        const setRatio = (el: HTMLElement, ratio: number): void => {
            const max = el.scrollHeight - el.clientHeight;
            if (max > 0) el.scrollTop = max * ratio;
        };

        const onEd = () => {
            if (syncingRef.current === 'preview') {
                syncingRef.current = 'none';
                return;
            }
            syncingRef.current = 'editor';
            setRatio(pv, getRatio(ed));
        };
        const onPv = () => {
            if (syncingRef.current === 'editor') {
                syncingRef.current = 'none';
                return;
            }
            syncingRef.current = 'preview';
            setRatio(ed, getRatio(pv));
        };

        ed.addEventListener('scroll', onEd, { passive: true });
        pv.addEventListener('scroll', onPv, { passive: true });
        return () => {
            ed.removeEventListener('scroll', onEd);
            pv.removeEventListener('scroll', onPv);
        };
    }, [view, sourceMode]);

    const plainText = useMemo(() => {
        if (typeof document === 'undefined') return '';
        const tmp = document.createElement('div');
        tmp.innerHTML = currentValue;
        return tmp.textContent || '';
    }, [currentValue]);

    const statusBar =
        showStatusBar && (
            <div className="eui-html-statusbar">
                {showWordCount && (
                    <span>
                        {countWords(plainText)} words · {plainText.length} chars
                    </span>
                )}
                {imageUpload.isUploading && (
                    <span role="status" aria-live="polite" className="eui-html-uploading">
                        Uploading image...
                    </span>
                )}
            </div>
        );

    return (
        <>
            <TextEditorShell
                className={classNames('eui-html-editor', className)}
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
            <TableGridPanel
                open={tableOpen}
                anchorRef={tableBtnRef}
                onSelect={handleTableSelect}
                onClose={() => setTableOpen(false)}
            />
            <ColorPopover
                open={textColorOpen}
                anchorRef={textColorBtnRef}
                palette={TEXT_COLOR_PALETTE}
                onPick={handleTextColor}
                onClose={() => setTextColorOpen(false)}
                label="Text color"
            />
            <ColorPopover
                open={bgColorOpen}
                anchorRef={bgColorBtnRef}
                palette={BG_COLOR_PALETTE}
                onPick={handleBgColor}
                onClose={() => setBgColorOpen(false)}
                label="Background color"
            />
        </>
    );
});

HtmlEditorInner.displayName = 'HtmlEditor';

export const HtmlEditor = memo(HtmlEditorInner);
