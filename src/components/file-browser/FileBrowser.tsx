import cn from 'classnames';
import React, { useCallback, useId, useMemo, useRef, useState } from 'react';
import { DetailsViewIcon, GridIcon, ListUlIcon } from '../../assets/icons';
import { FileKindIcon } from './FileKindIcon';
import {
    filterFiles,
    formatFileSize,
    formatModified,
    inferKind,
    type FileBrowserColumn,
    type FileBrowserItem,
    type FileBrowserThumbnailFit,
    type FileBrowserView,
    type FileKind,
    type RejectedFile,
} from './file-browser-utils';
import './FileBrowser.scss';

export interface FileBrowserProps {
    items: FileBrowserItem[];
    selectedIds?: string[];
    onSelectionChange?: (ids: string[]) => void;
    view?: FileBrowserView;
    defaultView?: FileBrowserView;
    onViewChange?: (view: FileBrowserView) => void;
    availableViews?: FileBrowserView[];
    showViewSwitcher?: boolean;
    selectable?: boolean;
    multiple?: boolean;
    maxSelection?: number;
    thumbnailFit?: FileBrowserThumbnailFit;
    minTileWidth?: number;
    columns?: FileBrowserColumn[];
    emptyState?: React.ReactNode;
    renderActions?: (item: FileBrowserItem) => React.ReactNode;
    renderPreview?: (item: FileBrowserItem, kind: FileKind) => React.ReactNode;
    renderItem?: (item: FileBrowserItem, ctx: FileBrowserItemContext) => React.ReactNode;
    onItemOpen?: (item: FileBrowserItem) => void;
    onItemClick?: (item: FileBrowserItem) => void;
    videoPreview?: boolean;
    enableUpload?: boolean;
    accept?: string;
    maxFileSize?: number;
    onUpload?: (files: File[], rejected: RejectedFile[]) => void;
    uploadHint?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    ariaLabel?: string;
    toolbarStart?: React.ReactNode;
    toolbarEnd?: React.ReactNode;
}

export interface FileBrowserItemContext {
    kind: FileKind;
    selected: boolean;
    view: FileBrowserView;
    toggle: () => void;
    open: () => void;
}

const DEFAULT_VIEWS: FileBrowserView[] = ['thumbnail', 'list', 'details'];

const VIEW_META: Record<FileBrowserView, { label: string; Icon: React.FC<React.SVGProps<SVGSVGElement>> }> = {
    thumbnail: { label: 'Thumbnail view', Icon: GridIcon },
    list: { label: 'List view', Icon: ListUlIcon },
    details: { label: 'Details view', Icon: DetailsViewIcon },
};

const DEFAULT_COLUMNS: FileBrowserColumn[] = [
    { key: 'name', header: 'Name' },
    { key: 'kind', header: 'Type' },
    { key: 'size', header: 'Size', align: 'right', width: '110px' },
    { key: 'modified', header: 'Modified', align: 'right', width: '150px' },
];

function fileListToArray(list: FileList | null): File[] {
    return list ? Array.from(list) : [];
}

const FileBrowser: React.FC<FileBrowserProps> = ({
    items,
    selectedIds,
    onSelectionChange,
    view: controlledView,
    defaultView = 'thumbnail',
    onViewChange,
    availableViews = DEFAULT_VIEWS,
    showViewSwitcher = false,
    selectable = true,
    multiple = true,
    maxSelection,
    thumbnailFit = 'contain',
    minTileWidth = 160,
    columns = DEFAULT_COLUMNS,
    emptyState,
    renderActions,
    renderPreview,
    renderItem,
    onItemOpen,
    onItemClick,
    videoPreview = false,
    enableUpload = false,
    accept,
    maxFileSize,
    onUpload,
    uploadHint,
    className,
    style,
    ariaLabel = 'Files',
    toolbarStart,
    toolbarEnd,
}) => {
    const reactId = useId();
    const [internalSelected, setInternalSelected] = useState<string[]>([]);
    const [internalView, setInternalView] = useState<FileBrowserView>(defaultView);
    const [activeIndex, setActiveIndex] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragDepth = useRef(0);

    const selected = selectedIds ?? internalSelected;
    const view = controlledView ?? internalView;

    const kinds = useMemo(() => items.map((item) => inferKind(item)), [items]);

    const commitSelection = useCallback(
        (next: string[]) => {
            if (selectedIds == null) setInternalSelected(next);
            onSelectionChange?.(next);
        },
        [selectedIds, onSelectionChange],
    );

    const setView = useCallback(
        (next: FileBrowserView) => {
            if (controlledView == null) setInternalView(next);
            onViewChange?.(next);
        },
        [controlledView, onViewChange],
    );

    const toggle = useCallback(
        (item: FileBrowserItem) => {
            if (!selectable || item.disabled || item.selectable === false) return;
            const has = selected.includes(item.id);
            if (!multiple) {
                commitSelection(has ? [] : [item.id]);
                return;
            }
            if (has) {
                commitSelection(selected.filter((id) => id !== item.id));
                return;
            }
            if (maxSelection != null && selected.length >= maxSelection) return;
            commitSelection([...selected, item.id]);
        },
        [selectable, multiple, selected, commitSelection, maxSelection],
    );

    const openItem = useCallback(
        (item: FileBrowserItem) => {
            if (item.disabled) return;
            onItemOpen?.(item);
        },
        [onItemOpen],
    );

    const focusItem = useCallback(
        (index: number) => {
            const count = items.length;
            if (!count) return;
            const next = (index + count) % count;
            setActiveIndex(next);
            itemRefs.current[next]?.focus();
        },
        [items.length],
    );

    const onContainerKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (!items.length) return;
            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    focusItem(activeIndex + 1);
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    focusItem(activeIndex - 1);
                    break;
                case 'Home':
                    e.preventDefault();
                    focusItem(0);
                    break;
                case 'End':
                    e.preventDefault();
                    focusItem(items.length - 1);
                    break;
                default:
                    break;
            }
        },
        [items.length, activeIndex, focusItem],
    );

    const emitUpload = useCallback(
        (files: File[]) => {
            if (!files.length) return;
            const selectedFiles = items.length;
            const { accepted, rejected } = filterFiles(files, {
                accept,
                maxFileSize,
                maxFiles: multiple ? maxSelection : 1,
                existingCount: multiple ? selectedFiles : 0,
            });
            onUpload?.(accepted, rejected);
        },
        [items.length, accept, maxFileSize, multiple, maxSelection, onUpload],
    );

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            if (!enableUpload) return;
            e.preventDefault();
            dragDepth.current = 0;
            setDragActive(false);
            emitUpload(fileListToArray(e.dataTransfer.files));
        },
        [enableUpload, emitUpload],
    );

    const onDragEnter = useCallback(
        (e: React.DragEvent) => {
            if (!enableUpload) return;
            e.preventDefault();
            dragDepth.current += 1;
            setDragActive(true);
        },
        [enableUpload],
    );

    const onDragOver = useCallback(
        (e: React.DragEvent) => {
            if (!enableUpload) return;
            e.preventDefault();
        },
        [enableUpload],
    );

    const onDragLeave = useCallback(
        (e: React.DragEvent) => {
            if (!enableUpload) return;
            e.preventDefault();
            dragDepth.current = Math.max(0, dragDepth.current - 1);
            if (dragDepth.current === 0) setDragActive(false);
        },
        [enableUpload],
    );

    const onFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            emitUpload(fileListToArray(e.target.files));
            e.target.value = '';
        },
        [emitUpload],
    );

    const openFileDialog = useCallback(() => fileInputRef.current?.click(), []);

    const renderThumb = useCallback(
        (item: FileBrowserItem, kind: FileKind) => {
            if (renderPreview) return renderPreview(item, kind);
            if (item.loading) return <span className="eui-fb-thumb-loading" />;
            if (videoPreview && kind === 'video' && item.previewUrl && playingId === item.id) {
                return (
                    <video
                        className="eui-fb-thumb-video"
                        src={item.previewUrl}
                        controls
                        autoPlay
                        onClick={(e) => e.stopPropagation()}
                    />
                );
            }
            if (kind === 'image' && item.thumbnailUrl) {
                return <img src={item.thumbnailUrl} alt={item.name} draggable={false} />;
            }
            if (kind === 'video' && item.thumbnailUrl) {
                return (
                    <>
                        <img src={item.thumbnailUrl} alt={item.name} draggable={false} />
                        <span className="eui-fb-play-overlay" aria-hidden="true">
                            <span className="eui-fb-play-triangle" />
                        </span>
                    </>
                );
            }
            return (
                <span className="eui-fb-thumb-icon">
                    <FileKindIcon kind={kind} size={view === 'thumbnail' ? 34 : 22} />
                </span>
            );
        },
        [renderPreview, videoPreview, playingId, view],
    );

    const renderCell = useCallback(
        (item: FileBrowserItem, kind: FileKind, column: FileBrowserColumn): React.ReactNode => {
            if (column.render) return column.render(item);
            switch (column.key) {
                case 'name':
                    return (
                        <span className="eui-fb-details-name">
                            <span className="eui-fb-details-name-icon">
                                <FileKindIcon kind={kind} size={18} />
                            </span>
                            <span className="eui-fb-details-name-text" title={item.name}>
                                {item.name}
                            </span>
                        </span>
                    );
                case 'kind':
                    return kind;
                case 'size':
                    return formatFileSize(item.size);
                case 'modified':
                    return formatModified(item.modified);
                default:
                    return item.meta?.[column.key] ?? '';
            }
        },
        [],
    );

    const uploadInput = enableUpload ? (
        <input
            ref={fileInputRef}
            type="file"
            className="eui-fb-file-input"
            accept={accept}
            multiple={multiple}
            onChange={onFileInputChange}
            tabIndex={-1}
            aria-hidden="true"
        />
    ) : null;

    const showToolbar = showViewSwitcher || toolbarStart != null || toolbarEnd != null || (enableUpload && view !== 'details');

    const viewSwitcher =
        showViewSwitcher && availableViews.length > 1 ? (
            <div className="eui-fb-view-switch" role="group" aria-label="Change view">
                {availableViews.map((v) => {
                    const meta = VIEW_META[v];
                    const Icon = meta.Icon;
                    const isActive = view === v;
                    return (
                        <button
                            key={v}
                            type="button"
                            className={cn('eui-fb-view-btn', { 'eui-fb-view-btn-active': isActive })}
                            aria-label={meta.label}
                            aria-pressed={isActive}
                            title={meta.label}
                            onClick={() => setView(v)}
                        >
                            <Icon width={16} height={16} aria-hidden="true" />
                        </button>
                    );
                })}
            </div>
        ) : null;

    const toolbar = showToolbar ? (
        <div className="eui-fb-toolbar">
            <div className="eui-fb-toolbar-start">{toolbarStart}</div>
            <div className="eui-fb-toolbar-end">
                {toolbarEnd}
                {viewSwitcher}
            </div>
        </div>
    ) : null;

    const isEmpty = items.length === 0;

    const dropOverlay =
        enableUpload && dragActive ? (
            <div className="eui-fb-drop-overlay" aria-hidden="true">
                <span className="eui-fb-drop-overlay-text">{uploadHint ?? 'Drop files to upload'}</span>
            </div>
        ) : null;

    const body = isEmpty ? (
        <div className="eui-fb-empty">
            {emptyState ?? (
                <div className="eui-fb-empty-default">
                    <FileKindIcon kind="folder" size={40} />
                    <span className="eui-fb-empty-text">No files</span>
                    {enableUpload && (
                        <button type="button" className="eui-fb-empty-action" onClick={openFileDialog}>
                            Add files
                        </button>
                    )}
                </div>
            )}
        </div>
    ) : view === 'details' ? (
        <div
            className="eui-fb-details"
            role="grid"
            aria-label={ariaLabel}
            aria-rowcount={items.length + 1}
            onKeyDown={onContainerKeyDown}
        >
            <div className="eui-fb-details-head" role="row">
                {selectable && <span className="eui-fb-details-cell eui-fb-details-cell-check" role="columnheader" />}
                {columns.map((column) => (
                    <span
                        key={column.key}
                        className={cn('eui-fb-details-cell', `eui-fb-align-${column.align ?? 'left'}`)}
                        style={{ flexBasis: column.width, flexGrow: column.key === 'name' ? 1 : 0 }}
                        role="columnheader"
                    >
                        {column.header}
                    </span>
                ))}
                {renderActions && <span className="eui-fb-details-cell eui-fb-details-cell-actions" role="columnheader" />}
            </div>
            {items.map((item, index) => {
                const kind = kinds[index];
                const isSelected = selected.includes(item.id);
                return (
                    <div
                        key={item.id}
                        ref={(el) => {
                            itemRefs.current[index] = el;
                        }}
                        className={cn('eui-fb-details-row', {
                            'eui-fb-row-selected': isSelected,
                            'eui-fb-row-disabled': item.disabled,
                        })}
                        role="row"
                        aria-selected={isSelected}
                        aria-disabled={item.disabled || undefined}
                        tabIndex={index === activeIndex ? 0 : -1}
                        onFocus={() => setActiveIndex(index)}
                        onClick={() => {
                            onItemClick?.(item);
                            toggle(item);
                        }}
                        onDoubleClick={() => openItem(item)}
                        onKeyDown={(e) => {
                            if (e.key === ' ') {
                                e.preventDefault();
                                toggle(item);
                            } else if (e.key === 'Enter') {
                                e.preventDefault();
                                openItem(item);
                            }
                        }}
                    >
                        {selectable && (
                            <span className="eui-fb-details-cell eui-fb-details-cell-check" role="gridcell">
                                <span className="eui-fb-check" aria-hidden="true" />
                            </span>
                        )}
                        {columns.map((column) => (
                            <span
                                key={column.key}
                                className={cn('eui-fb-details-cell', `eui-fb-align-${column.align ?? 'left'}`)}
                                style={{ flexBasis: column.width, flexGrow: column.key === 'name' ? 1 : 0 }}
                                role="gridcell"
                            >
                                {renderCell(item, kind, column)}
                            </span>
                        ))}
                        {renderActions && (
                            <span
                                className="eui-fb-details-cell eui-fb-details-cell-actions"
                                role="gridcell"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            >
                                {renderActions(item)}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    ) : (
        <div
            className={cn('eui-fb-collection', `eui-fb-${view}`)}
            style={view === 'thumbnail' ? { gridTemplateColumns: `repeat(auto-fill, minmax(${minTileWidth}px, 1fr))` } : undefined}
            role="listbox"
            aria-label={ariaLabel}
            aria-multiselectable={selectable && multiple}
            onKeyDown={onContainerKeyDown}
        >
            {items.map((item, index) => {
                const kind = kinds[index];
                const isSelected = selected.includes(item.id);
                const ctx: FileBrowserItemContext = {
                    kind,
                    selected: isSelected,
                    view,
                    toggle: () => toggle(item),
                    open: () => openItem(item),
                };
                if (renderItem) {
                    return (
                        <div
                            key={item.id}
                            ref={(el) => {
                                itemRefs.current[index] = el;
                            }}
                            className="eui-fb-custom-item"
                            role="option"
                            aria-selected={isSelected}
                            tabIndex={index === activeIndex ? 0 : -1}
                            onFocus={() => setActiveIndex(index)}
                        >
                            {renderItem(item, ctx)}
                        </div>
                    );
                }
                return (
                    <div
                        key={item.id}
                        ref={(el) => {
                            itemRefs.current[index] = el;
                        }}
                        className={cn('eui-fb-item', {
                            'eui-fb-item-selected': isSelected,
                            'eui-fb-item-disabled': item.disabled,
                        })}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={item.disabled || undefined}
                        tabIndex={index === activeIndex ? 0 : -1}
                        onFocus={() => setActiveIndex(index)}
                        onClick={() => {
                            onItemClick?.(item);
                            toggle(item);
                        }}
                        onDoubleClick={() => openItem(item)}
                        onKeyDown={(e) => {
                            if (e.key === ' ') {
                                e.preventDefault();
                                toggle(item);
                            } else if (e.key === 'Enter') {
                                e.preventDefault();
                                openItem(item);
                            }
                        }}
                    >
                        {selectable && item.selectable !== false && (
                            <span className="eui-fb-check" aria-hidden="true" />
                        )}

                        <div
                            className={cn('eui-fb-thumb', `eui-fb-thumb-${thumbnailFit}`, {
                                'eui-fb-thumb-clickable': videoPreview && kind === 'video' && !!item.previewUrl,
                            })}
                            onClick={(e) => {
                                if (videoPreview && kind === 'video' && item.previewUrl) {
                                    e.stopPropagation();
                                    setPlayingId((prev) => (prev === item.id ? null : item.id));
                                }
                            }}
                        >
                            {renderThumb(item, kind)}
                            {item.badge != null && view === 'thumbnail' && (
                                <span className="eui-fb-badge">{item.badge}</span>
                            )}
                        </div>

                        <div className="eui-fb-meta">
                            <div className="eui-fb-title" title={item.name}>
                                {item.name}
                            </div>
                            {(item.subtitle || item.size != null) && (
                                <div className="eui-fb-subtitle">
                                    {item.subtitle ?? formatFileSize(item.size)}
                                </div>
                            )}
                        </div>

                        {renderActions && (
                            <div
                                className="eui-fb-actions"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            >
                                {renderActions(item)}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div
            className={cn('eui-file-browser', { 'eui-fb-drag-active': dragActive }, className)}
            id={reactId}
            style={style}
            onDrop={onDrop}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
        >
            {uploadInput}
            {toolbar}
            <div className="eui-fb-viewport">
                {body}
                {dropOverlay}
            </div>
        </div>
    );
};

export { FileBrowser };
