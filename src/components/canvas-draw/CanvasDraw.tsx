import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import classnames from 'classnames';
import type {
    DrawTool,
    DrawToolDefaults,
    DrawItem,
    DrawGroup,
    DrawTransition,
    CanvasBackground,
    ImageExportFormat,
    CanvasDrawFeatures,
} from './canvas-draw-types';
import { defaultToolDefaults } from './canvas-draw-types';
import CanvasDrawOverlay, { type CanvasDrawOverlayHandle } from './CanvasDrawOverlay';
import CanvasDrawToolbar from './CanvasDrawToolbar';
import './CanvasDraw.scss';

export interface CanvasDrawProps {
    background: CanvasBackground;
    items?: DrawItem[];
    groups?: DrawGroup[];
    currentMs?: number;
    mediaDurationMs?: number;
    isEditing?: boolean;
    toolbarPlacement?: 'top' | 'bottom' | 'left' | 'right' | 'none';
    defaultTool?: DrawTool;
    defaultToolDefaults?: Partial<DrawToolDefaults>;
    features?: CanvasDrawFeatures;
    className?: string;
    style?: React.CSSProperties;
    onItemsChange?: (items: DrawItem[]) => void;
    onExport?: (dataUrl: string, format: ImageExportFormat) => void;
}

export interface CanvasDrawHandle {
    export: (format?: ImageExportFormat) => Promise<string | null>;
    getItems: () => DrawItem[];
    clear: () => void;
}

const maxUndoHistory = 50;

function loadImageFromUrl(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

async function composeImageExport(bgSrc: string, canvasWrapper: HTMLElement, mime: string): Promise<string | null> {
    const bg = await loadImageFromUrl(bgSrc);
    const width = bg.naturalWidth;
    const height = bg.naturalHeight;
    if (!width || !height) return null;
    const out = document.createElement('canvas');
    out.width = width;
    out.height = height;
    const ctx = out.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(bg, 0, 0, width, height);
    const svg = canvasWrapper.querySelector('svg');
    if (svg) {
        const clone = svg.cloneNode(true) as SVGSVGElement;
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.setAttribute('width', String(width));
        clone.setAttribute('height', String(height));
        if (!clone.getAttribute('viewBox')) {
            const vbW = parseFloat(svg.getAttribute('width') || '0') || svg.clientWidth;
            const vbH = parseFloat(svg.getAttribute('height') || '0') || svg.clientHeight;
            clone.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
        }
        const svgStr = new XMLSerializer().serializeToString(clone);
        const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        try {
            const overlayImg = await loadImageFromUrl(url);
            ctx.drawImage(overlayImg, 0, 0, width, height);
        } finally {
            setTimeout(() => URL.revokeObjectURL(url), 0);
        }
    }
    return out.toDataURL(mime, 0.92);
}

function CanvasDrawInner({
    background,
    items: controlledItems,
    groups: controlledGroups,
    currentMs = 0,
    mediaDurationMs = 0,
    isEditing = true,
    toolbarPlacement = 'top',
    defaultTool = 'select',
    defaultToolDefaults: partialDefaults,
    features = {},
    className,
    style,
    onItemsChange,
    onExport,
}: CanvasDrawProps, ref: React.Ref<CanvasDrawHandle>) {
    const mergedDefaults = useMemo<DrawToolDefaults>(
        () => ({ ...defaultToolDefaults, ...partialDefaults }),
        [partialDefaults],
    );

    const isControlled = controlledItems !== undefined;

    const [internalItems, setInternalItems] = useState<DrawItem[]>([]);
    const [internalGroups] = useState<DrawGroup[]>(controlledGroups ?? []);
    const [activeTool, setActiveTool] = useState<DrawTool>(defaultTool);
    const [toolDefaults, setToolDefaults] = useState<DrawToolDefaults>(mergedDefaults);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [showAtMs, setShowAtMs] = useState(0);
    const [hideAtMs, setHideAtMs] = useState<number | null>(null);
    const [drawTransition, setDrawTransition] = useState<DrawTransition>('none');
    const [drawGroupId] = useState<string | null>(null);

    const items = isControlled ? (controlledItems ?? []) : internalItems;
    const groups = controlledGroups ?? internalGroups;

    const undoStackRef = useRef<DrawItem[][]>([]);
    const redoStackRef = useRef<DrawItem[][]>([]);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const preDrawSnapshotRef = useRef<DrawItem[] | null>(null);

    const overlayRef = useRef<CanvasDrawOverlayHandle | null>(null);

    const setItems = useCallback((next: DrawItem[]) => {
        if (!isControlled) setInternalItems(next);
        onItemsChange?.(next);
    }, [isControlled, onItemsChange]);

    const handleItemsChange = useCallback((next: DrawItem[]) => {
        if (preDrawSnapshotRef.current === null) {
            preDrawSnapshotRef.current = items.slice();
        }
        setItems(next);
    }, [items, setItems]);

    const handleItemsCommit = useCallback(() => {
        if (preDrawSnapshotRef.current !== null) {
            undoStackRef.current = [...undoStackRef.current.slice(-maxUndoHistory + 1), preDrawSnapshotRef.current];
            redoStackRef.current = [];
            preDrawSnapshotRef.current = null;
            setCanUndo(true);
            setCanRedo(false);
        }
    }, []);

    const handleUndo = useCallback(() => {
        if (undoStackRef.current.length === 0) return;
        const prev = undoStackRef.current[undoStackRef.current.length - 1];
        undoStackRef.current = undoStackRef.current.slice(0, -1);
        redoStackRef.current = [...redoStackRef.current, items.slice()];
        setItems(prev);
        setSelectedItemId(null);
        setCanUndo(undoStackRef.current.length > 0);
        setCanRedo(true);
    }, [items, setItems]);

    const handleRedo = useCallback(() => {
        if (redoStackRef.current.length === 0) return;
        const next = redoStackRef.current[redoStackRef.current.length - 1];
        redoStackRef.current = redoStackRef.current.slice(0, -1);
        undoStackRef.current = [...undoStackRef.current, items.slice()];
        setItems(next);
        setSelectedItemId(null);
        setCanUndo(true);
        setCanRedo(redoStackRef.current.length > 0);
    }, [items, setItems]);

    const handleDeleteSelected = useCallback(() => {
        if (!selectedItemId) return;
        undoStackRef.current = [...undoStackRef.current.slice(-maxUndoHistory + 1), items.slice()];
        redoStackRef.current = [];
        setItems(items.filter((it) => it.id !== selectedItemId));
        setSelectedItemId(null);
        setCanUndo(true);
        setCanRedo(false);
    }, [selectedItemId, items, setItems]);

    const handleDuplicateSelected = useCallback(() => {
        if (!selectedItemId) return;
        const original = items.find((it) => it.id === selectedItemId);
        if (!original) return;
        const copy: DrawItem = {
            ...original,
            id: `cd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            xPct: original.xPct + 0.02,
            yPct: original.yPct + 0.02,
            object: { ...original.object, id: `cd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
        };
        undoStackRef.current = [...undoStackRef.current.slice(-maxUndoHistory + 1), items.slice()];
        redoStackRef.current = [];
        setItems([...items, copy]);
        setSelectedItemId(copy.id);
        setCanUndo(true);
        setCanRedo(false);
    }, [selectedItemId, items, setItems]);

    const handleClearAll = useCallback(() => {
        undoStackRef.current = [...undoStackRef.current.slice(-maxUndoHistory + 1), items.slice()];
        redoStackRef.current = [];
        setItems([]);
        setSelectedItemId(null);
        setCanUndo(true);
        setCanRedo(false);
    }, [items, setItems]);

    const handleDefaultsChange = useCallback((d: DrawToolDefaults) => {
        setToolDefaults(d);
        if (selectedItemId) {
            const updated = items.map((it) => {
                if (it.id !== selectedItemId) return it;
                const obj = it.object;
                const base = { strokeColor: d.strokeColor, strokeWidth: d.strokeWidth };
                if (obj.type === 'rect' || obj.type === 'circle') {
                    return { ...it, object: { ...obj, ...base, fillColor: d.fillColor, ...(obj.type === 'rect' ? { rounded: d.rounded } : {}) } };
                }
                if (obj.type === 'text') {
                    return { ...it, object: { ...obj, ...base, fillColor: d.fillColor, fontFamily: d.fontFamily, fontSize: d.fontSize, fontColor: d.fontColor, fontBold: d.fontBold, fontItalic: d.fontItalic, fontUnderline: d.fontUnderline } };
                }
                if (obj.type === 'balloon') {
                    return { ...it, object: { ...obj, ...base, fillColor: d.fillColor, fontFamily: d.fontFamily, fontSize: d.fontSize, fontColor: d.fontColor, fontBold: d.fontBold, fontItalic: d.fontItalic, fontUnderline: d.fontUnderline } };
                }
                if (obj.type === 'step') {
                    const stepFill = d.fillColor === 'transparent' ? obj.fillColor : d.fillColor;
                    return { ...it, object: { ...obj, ...base, fillColor: stepFill, fontColor: d.fontColor } };
                }
                if (obj.type === 'callout') {
                    const calloutFill = d.fillColor === 'transparent' ? obj.fillColor : d.fillColor;
                    return { ...it, object: { ...obj, ...base, fillColor: calloutFill, fontColor: d.fontColor } };
                }
                return { ...it, object: { ...obj, ...base } };
            });
            setItems(updated);
        }
    }, [selectedItemId, items, setItems]);

    const handleUpdateSelectedTiming = useCallback((newShowAt: number, newHideAt: number | null, newTransition: DrawTransition) => {
        if (!selectedItemId) return;
        setItems(items.map((it) => it.id !== selectedItemId ? it : { ...it, showAtMs: newShowAt, hideAtMs: newHideAt, transition: newTransition }));
    }, [selectedItemId, items, setItems]);

    const handleAssignGroup = useCallback((groupId: string | null) => {
        if (!selectedItemId) return;
        setItems(items.map((it) => it.id !== selectedItemId ? it : { ...it, groupId }));
    }, [selectedItemId, items, setItems]);

    const handleUpdateStepNumber = useCallback((stepNumber: number) => {
        if (!selectedItemId) return;
        setItems(items.map((it) => {
            if (it.id !== selectedItemId) return it;
            const obj = it.object;
            if (obj.type === 'step' || obj.type === 'callout') {
                return { ...it, object: { ...obj, stepNumber } };
            }
            return it;
        }));
    }, [selectedItemId, items, setItems]);

    const canvasRef = useRef<HTMLDivElement>(null);

    const runExport = useCallback(async (format: ImageExportFormat): Promise<string | null> => {
        if (format === 'svg') {
            const svgStr = overlayRef.current?.exportSvgString() ?? '';
            const blob = new Blob([svgStr], { type: 'image/svg+xml' });
            return URL.createObjectURL(blob);
        }

        const wrapper = canvasRef.current;
        if (!wrapper) return null;

        const mime = format === 'jpg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';

        if (background.type === 'image') {
            try {
                const dataUrl = await composeImageExport(background.src, wrapper, mime);
                if (dataUrl) return dataUrl;
            } catch {
                /* fall through to html2canvas fallback */
            }
        }

        try {
            const { default: renderToCanvas } = await import(/* @vite-ignore */ 'html2canvas');
            const canvas = await renderToCanvas(wrapper, { useCORS: true, scale: 2 });
            return canvas.toDataURL(mime, 0.92);
        } catch (err) {
            console.error('[CanvasDraw] Image background export failed and html2canvas fallback is missing. For video/non-image backgrounds install html2canvas.', err);
            return null;
        }
    }, [background]);

    const handleExport = useCallback(async (format: ImageExportFormat) => {
        const dataUrl = await runExport(format);
        if (dataUrl && onExport) onExport(dataUrl, format);
    }, [runExport, onExport]);

    useImperativeHandle(ref, () => ({
        export: async (format: ImageExportFormat = 'png') => runExport(format),
        getItems: () => items,
        clear: () => {
            undoStackRef.current = [...undoStackRef.current.slice(-maxUndoHistory + 1), items.slice()];
            redoStackRef.current = [];
            setItems([]);
            setSelectedItemId(null);
            setCanUndo(true);
            setCanRedo(false);
        },
    }), [runExport, items, setItems]);

    const handleDrawComplete = useCallback(() => {
        setActiveTool('select');
    }, []);

    const wrapRef = useRef<HTMLDivElement>(null);

    const handleUndoRef = useRef(handleUndo);
    handleUndoRef.current = handleUndo;
    const handleRedoRef = useRef(handleRedo);
    handleRedoRef.current = handleRedo;
    const handleDeleteSelectedRef = useRef(handleDeleteSelected);
    handleDeleteSelectedRef.current = handleDeleteSelected;

    useEffect(() => {
        if (!isEditing) return;
        const el = wrapRef.current;
        if (!el) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                handleDeleteSelectedRef.current();
            } else if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
                e.preventDefault();
                handleUndoRef.current();
            } else if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
                e.preventDefault();
                handleRedoRef.current();
            }
        };

        el.addEventListener('keydown', onKeyDown);
        return () => el.removeEventListener('keydown', onKeyDown);
    }, [isEditing]);

    const selectedItem = useMemo(
        () => items.find((it) => it.id === selectedItemId) ?? null,
        [items, selectedItemId],
    );

    const toolbarVisible = isEditing && toolbarPlacement !== 'none';
    const isVerticalToolbar = toolbarPlacement === 'left' || toolbarPlacement === 'right';

    const wrapClass = classnames('eui-canvas-draw', {
        [`eui-canvas-draw--tb-${toolbarPlacement}`]: toolbarVisible,
        'eui-canvas-draw--vertical-tb': isVerticalToolbar,
        'eui-canvas-draw--editing': isEditing,
    }, className);

    const backgroundEl = useMemo(() => {
        if (background.type === 'image') {
            return (
                <img
                    src={background.src}
                    className="eui-canvas-draw__bg-img"
                    alt=""
                    draggable={false}
                />
            );
        }
        if (background.type === 'color') {
            return (
                <div
                    className="eui-canvas-draw__bg-color"
                    style={{ background: background.color }}
                />
            );
        }
        return null;
    }, [background]);

    return (
        <div ref={wrapRef} className={wrapClass} style={style} tabIndex={-1}>
            {toolbarVisible && (toolbarPlacement === 'top' || toolbarPlacement === 'left') && (
                <CanvasDrawToolbar
                    activeTool={activeTool}
                    defaults={toolDefaults}
                    currentMs={currentMs}
                    mediaDurationMs={mediaDurationMs}
                    showAtMs={showAtMs}
                    hideAtMs={hideAtMs}
                    transition={drawTransition}
                    selectedItem={selectedItem}
                    groups={groups}
                    features={features}
                    onToolChange={setActiveTool}
                    onDefaultsChange={handleDefaultsChange}
                    onShowAtChange={setShowAtMs}
                    onHideAtChange={setHideAtMs}
                    onTransitionChange={setDrawTransition}
                    onDeleteSelected={handleDeleteSelected}
                    onDuplicateSelected={handleDuplicateSelected}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onClearAll={handleClearAll}
                    onSetCurrentAsShowAt={() => setShowAtMs(currentMs)}
                    onSetCurrentAsHideAt={() => setHideAtMs(currentMs)}
                    onUpdateSelectedTiming={handleUpdateSelectedTiming}
                    onAssignGroup={handleAssignGroup}
                    onUpdateStepNumber={handleUpdateStepNumber}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onExport={onExport ? handleExport : undefined}
                />
            )}

            <div
                ref={canvasRef}
                className="eui-canvas-draw__canvas"
                role="img"
                aria-label={items.length === 0 ? 'Drawing canvas (empty)' : `Drawing canvas (${items.length} ${items.length === 1 ? 'object' : 'objects'})`}
            >
                {backgroundEl}

                <CanvasDrawOverlay
                    ref={overlayRef}
                    background={background}
                    currentMs={currentMs}
                    isEditing={isEditing}
                    items={items}
                    groups={groups}
                    selectedItemId={selectedItemId}
                    defaults={toolDefaults}
                    activeTool={activeTool}
                    currentDrawShowAt={showAtMs}
                    currentDrawHideAt={hideAtMs}
                    currentDrawTransition={drawTransition}
                    currentDrawGroupId={drawGroupId}
                    onItemsChange={handleItemsChange}
                    onItemsCommit={handleItemsCommit}
                    onSelectItem={setSelectedItemId}
                    onDrawComplete={handleDrawComplete}
                />

                {(features.export !== false) && onExport && (
                    <div className="eui-canvas-draw__export-bar">
                        {(['png', 'jpg', 'webp', 'svg'] as ImageExportFormat[]).map((fmt) => (
                            <button
                                key={fmt}
                                className="eui-canvas-draw__export-btn"
                                onClick={() => handleExport(fmt)}
                                aria-label={`Export as ${fmt.toUpperCase()}`}
                            >
                                {fmt.toUpperCase()}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {toolbarVisible && (toolbarPlacement === 'bottom' || toolbarPlacement === 'right') && (
                <CanvasDrawToolbar
                    activeTool={activeTool}
                    defaults={toolDefaults}
                    currentMs={currentMs}
                    mediaDurationMs={mediaDurationMs}
                    showAtMs={showAtMs}
                    hideAtMs={hideAtMs}
                    transition={drawTransition}
                    selectedItem={selectedItem}
                    groups={groups}
                    features={features}
                    onToolChange={setActiveTool}
                    onDefaultsChange={handleDefaultsChange}
                    onShowAtChange={setShowAtMs}
                    onHideAtChange={setHideAtMs}
                    onTransitionChange={setDrawTransition}
                    onDeleteSelected={handleDeleteSelected}
                    onDuplicateSelected={handleDuplicateSelected}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onClearAll={handleClearAll}
                    onSetCurrentAsShowAt={() => setShowAtMs(currentMs)}
                    onSetCurrentAsHideAt={() => setHideAtMs(currentMs)}
                    onUpdateSelectedTiming={handleUpdateSelectedTiming}
                    onAssignGroup={handleAssignGroup}
                    onUpdateStepNumber={handleUpdateStepNumber}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onExport={onExport ? handleExport : undefined}
                />
            )}
        </div>
    );
}

const CanvasDraw = forwardRef<CanvasDrawHandle, CanvasDrawProps>(CanvasDrawInner);
CanvasDraw.displayName = 'CanvasDraw';

export default CanvasDraw;
