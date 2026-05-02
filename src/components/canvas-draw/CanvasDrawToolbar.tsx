import { useState } from 'react';
import classnames from 'classnames';
import type {
    DrawTool,
    DrawColor,
    DrawToolDefaults,
    FontFamily,
    DrawTransition,
    DrawItem,
    DrawGroup,
    CanvasDrawFeatures,
    ToolConfig,
} from './canvas-draw-types';
import { colorMap } from './canvas-draw-types';
import './CanvasDrawToolbar.scss';

const allTools: { id: DrawTool; label: string; icon: string }[] = [
    { id: 'select', label: 'Select', icon: '↖' },
    { id: 'arrow', label: 'Arrow', icon: '→' },
    { id: 'curvedArrow', label: 'Curved Arrow', icon: '↝' },
    { id: 'line', label: 'Line', icon: '╱' },
    { id: 'dimension', label: 'Dimension', icon: '⟷' },
    { id: 'rect', label: 'Rectangle', icon: '▭' },
    { id: 'circle', label: 'Ellipse', icon: '◯' },
    { id: 'freehand', label: 'Freehand', icon: '✏' },
    { id: 'highlighter', label: 'Highlighter', icon: '🖍' },
    { id: 'text', label: 'Text', icon: 'T' },
    { id: 'balloon', label: 'Balloon', icon: '💬' },
    { id: 'step', label: 'Step', icon: '①' },
    { id: 'callout', label: 'Callout', icon: '❶' },
];

const strokeWidthOptions = [1, 2, 3, 5, 8];
const fontSizeOptions = [10, 12, 14, 16, 20, 24, 32];
const fontFamilyOptions: { id: FontFamily; label: string }[] = [
    { id: 'sans-serif', label: 'Sans' },
    { id: 'serif', label: 'Serif' },
    { id: 'monospace', label: 'Mono' },
    { id: 'cursive', label: 'Cursive' },
];
const allColors: DrawColor[] = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'black', 'white'];
const transitionOptions: { id: DrawTransition; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'fade', label: 'Fade' },
    { id: 'scale', label: 'Scale' },
    { id: 'slide-up', label: 'Slide Up' },
    { id: 'slide-down', label: 'Slide Down' },
    { id: 'slide-left', label: 'Slide Left' },
    { id: 'slide-right', label: 'Slide Right' },
];

const textToolSet = new Set<DrawTool>(['text', 'balloon']);
const fillToolSet = new Set<DrawTool>(['rect', 'circle', 'balloon', 'step', 'callout', 'text']);
const strokeToolSet = new Set<DrawTool>(['arrow', 'line', 'rect', 'circle', 'freehand', 'highlighter', 'dimension', 'curvedArrow', 'balloon', 'step', 'callout']);

function hasTextProps(obj: DrawItem['object']): boolean {
    return obj.type === 'text' || obj.type === 'balloon';
}

function hasFillProp(obj: DrawItem['object']): boolean {
    return obj.type === 'rect' || obj.type === 'circle' || obj.type === 'balloon' || obj.type === 'step' || obj.type === 'callout' || obj.type === 'text';
}

function formatTime(ms: number): string {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const milli = ms % 1000;
    return `${m}:${sec.toString().padStart(2, '0')}.${Math.floor(milli / 100)}`;
}

function parseMsInput(val: string): number | null {
    const trimmed = val.trim();
    const parts = trimmed.split(':');
    if (parts.length === 2) {
        const mins = parseInt(parts[0], 10);
        const secParts = parts[1].split('.');
        const secs = parseInt(secParts[0], 10);
        const frac = secParts[1] ? parseInt(secParts[1].padEnd(3, '0').slice(0, 3), 10) : 0;
        if (!isNaN(mins) && !isNaN(secs)) return (mins * 60 + secs) * 1000 + frac;
    }
    const n = parseFloat(trimmed);
    if (!isNaN(n)) return Math.round(n * 1000);
    return null;
}

function resolveToolConfig(config: ToolConfig | undefined): Set<DrawTool> {
    if (!config) return new Set(allTools.map((t) => t.id));
    const enabled = new Set<DrawTool>();
    for (const tool of allTools) {
        const val = config[tool.id];
        if (val === undefined || val === true) enabled.add(tool.id);
    }
    return enabled;
}

export interface CanvasDrawToolbarProps {
    activeTool: DrawTool;
    defaults: DrawToolDefaults;
    currentMs: number;
    mediaDurationMs: number;
    showAtMs: number;
    hideAtMs: number | null;
    transition: DrawTransition;
    selectedItem: DrawItem | null;
    groups: DrawGroup[];
    features: CanvasDrawFeatures;
    onToolChange: (tool: DrawTool) => void;
    onDefaultsChange: (d: DrawToolDefaults) => void;
    onShowAtChange: (ms: number) => void;
    onHideAtChange: (ms: number | null) => void;
    onTransitionChange: (t: DrawTransition) => void;
    onDeleteSelected: () => void;
    onDuplicateSelected: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onClearAll: () => void;
    onSetCurrentAsShowAt: () => void;
    onSetCurrentAsHideAt: () => void;
    onUpdateSelectedTiming: (showAtMs: number, hideAtMs: number | null, transition: DrawTransition) => void;
    onAssignGroup: (groupId: string | null) => void;
    onUpdateStepNumber?: (stepNumber: number) => void;
    canUndo?: boolean;
    canRedo?: boolean;
    onExport?: (format: 'png' | 'jpg' | 'webp' | 'svg') => void;
}

export default function CanvasDrawToolbar({
    activeTool, defaults, mediaDurationMs,
    showAtMs, hideAtMs, transition, selectedItem, groups, features,
    onToolChange, onDefaultsChange, onShowAtChange, onHideAtChange, onTransitionChange,
    onDeleteSelected, onDuplicateSelected, onUndo, onRedo, onClearAll,
    onSetCurrentAsShowAt, onSetCurrentAsHideAt,
    onUpdateSelectedTiming, onAssignGroup, onUpdateStepNumber, canUndo, canRedo, onExport,
}: CanvasDrawToolbarProps) {
    const [showAtInput, setShowAtInput] = useState('');
    const [hideAtInput, setHideAtInput] = useState('');
    const [editingShowAt, setEditingShowAt] = useState(false);
    const [editingHideAt, setEditingHideAt] = useState(false);

    const enabledTools = resolveToolConfig(features.tools);
    const visibleTools = allTools.filter((t) => enabledTools.has(t.id));

    const setColor = (c: DrawColor) => onDefaultsChange({ ...defaults, strokeColor: c });
    const setFill = (c: DrawColor | 'transparent') => onDefaultsChange({ ...defaults, fillColor: c });
    const setWidth = (w: number) => onDefaultsChange({ ...defaults, strokeWidth: w });
    const setFontSize = (s: number) => onDefaultsChange({ ...defaults, fontSize: s });
    const setFontColor = (c: DrawColor) => onDefaultsChange({ ...defaults, fontColor: c });
    const setFontFamily = (f: FontFamily) => onDefaultsChange({ ...defaults, fontFamily: f });
    const toggleBold = () => onDefaultsChange({ ...defaults, fontBold: !defaults.fontBold });
    const toggleItalic = () => onDefaultsChange({ ...defaults, fontItalic: !defaults.fontItalic });
    const toggleUnderline = () => onDefaultsChange({ ...defaults, fontUnderline: !defaults.fontUnderline });
    const toggleRounded = () => onDefaultsChange({ ...defaults, rounded: !defaults.rounded });

    const handleShowAtCommit = () => {
        const ms = parseMsInput(showAtInput);
        if (ms !== null) {
            const clamped = Math.max(0, Math.min(ms, mediaDurationMs));
            onShowAtChange(clamped);
            if (selectedItem) onUpdateSelectedTiming(clamped, selectedItem.hideAtMs, selectedItem.transition);
        }
        setEditingShowAt(false);
    };

    const handleHideAtCommit = () => {
        if (hideAtInput.trim() === '' || hideAtInput.trim() === '—') {
            onHideAtChange(null);
            if (selectedItem) onUpdateSelectedTiming(selectedItem.showAtMs, null, selectedItem.transition);
        } else {
            const ms = parseMsInput(hideAtInput);
            if (ms !== null) {
                const clamped = Math.max(0, Math.min(ms, mediaDurationMs));
                onHideAtChange(clamped);
                if (selectedItem) onUpdateSelectedTiming(selectedItem.showAtMs, clamped, selectedItem.transition);
            }
        }
        setEditingHideAt(false);
    };

    const handleTransitionChange = (t: DrawTransition) => {
        onTransitionChange(t);
        if (selectedItem) onUpdateSelectedTiming(selectedItem.showAtMs, selectedItem.hideAtMs, t);
    };

    const effectiveShowAt = selectedItem ? selectedItem.showAtMs : showAtMs;
    const effectiveHideAt = selectedItem ? selectedItem.hideAtMs : hideAtMs;
    const effectiveTransition = selectedItem ? selectedItem.transition : transition;

    const showStrokeSection = (features.strokeColor !== false) &&
        (selectedItem != null ? selectedItem.object.type !== 'text' : strokeToolSet.has(activeTool) || activeTool === 'select');
    const showStrokeWidthSection = (features.strokeWidth !== false) &&
        (selectedItem != null ? selectedItem.object.type !== 'text' : strokeToolSet.has(activeTool) || activeTool === 'select');
    const showFontSection = (features.fontControls !== false) &&
        (textToolSet.has(activeTool) || (selectedItem != null && hasTextProps(selectedItem.object)));
    const showFillSection = (features.fillColor !== false) &&
        (fillToolSet.has(activeTool) || (selectedItem != null && hasFillProp(selectedItem.object)));
    const showRounded = (features.roundedCorners !== false) &&
        (activeTool === 'rect' || (selectedItem != null && selectedItem.object.type === 'rect'));
    const showStepNumber = selectedItem != null && (selectedItem.object.type === 'step' || selectedItem.object.type === 'callout');
    const showTiming = features.timing !== false;
    const showTransitions = features.transitions !== false;
    const showGroups = features.groups !== false && selectedItem != null && groups.length > 0;
    const showUndo = features.undo !== false;
    const showExport = features.export !== false;
    const showClear = features.clearAll !== false;

    const handleToolbarKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'BUTTON' && target.getAttribute('role') !== 'radio') return;
        if (target.closest('select, input, textarea')) return;
        const focusable = Array.from(
            e.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled])'),
        );
        const idx = focusable.indexOf(target);
        if (idx < 0) return;
        let next = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % focusable.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + focusable.length) % focusable.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = focusable.length - 1;
        else return;
        e.preventDefault();
        focusable[next]?.focus();
    };

    return (
        <div
            className="eui-canvas-draw-toolbar"
            role="toolbar"
            aria-label="Canvas draw tools"
            onKeyDown={handleToolbarKey}
        >
            <div className="eui-cdt-section eui-cdt-section--tools">
                {visibleTools.map((t) => (
                    <button
                        key={t.id}
                        className={classnames('eui-cdt-tool', { 'eui-cdt-tool--active': activeTool === t.id })}
                        title={t.label}
                        onClick={() => onToolChange(t.id)}
                        aria-pressed={activeTool === t.id}
                        aria-label={t.label}
                    >
                        {t.icon}
                    </button>
                ))}
            </div>

            <div className="eui-cdt-divider" />

            {showStrokeSection && (
                <div className="eui-cdt-section">
                    <span className="eui-cdt-label">Color</span>
                    <div className="eui-cdt-colors">
                        {allColors.map((c) => (
                            <button
                                key={c}
                                className={classnames('eui-cdt-color', { 'eui-cdt-color--active': defaults.strokeColor === c, 'eui-cdt-color--white': c === 'white' })}
                                style={{ background: colorMap[c] }}
                                title={c}
                                aria-label={`Stroke: ${c}`}
                                aria-pressed={defaults.strokeColor === c}
                                onClick={() => setColor(c)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {(showStrokeWidthSection || showRounded) && (
                <>
                    <div className="eui-cdt-divider" />
                    <div className="eui-cdt-section">
                        <span className="eui-cdt-label">Stroke</span>
                        {showStrokeWidthSection && (
                            <div className="eui-cdt-widths">
                                {strokeWidthOptions.map((w) => (
                                    <button
                                        key={w}
                                        className={classnames('eui-cdt-width', { 'eui-cdt-width--active': defaults.strokeWidth === w })}
                                        title={`${w}px`}
                                        aria-pressed={defaults.strokeWidth === w}
                                        onClick={() => setWidth(w)}
                                    >
                                        <span style={{ display: 'block', height: Math.max(w, 1), background: 'currentColor', borderRadius: 2, width: '100%' }} />
                                    </button>
                                ))}
                            </div>
                        )}
                        {showRounded && (
                            <button
                                className={classnames('eui-cdt-rounded-toggle', { 'eui-cdt-rounded-toggle--active': defaults.rounded })}
                                title="Rounded corners"
                                aria-pressed={defaults.rounded}
                                onClick={toggleRounded}
                            >
                                <span>◰</span>
                                <span>Rounded</span>
                            </button>
                        )}
                    </div>
                </>
            )}

            {showFillSection && (
                <>
                    <div className="eui-cdt-divider" />
                    <div className="eui-cdt-section">
                        <span className="eui-cdt-label">Fill</span>
                        <button
                            className={classnames('eui-cdt-fill-none', { 'eui-cdt-fill-none--active': defaults.fillColor === 'transparent' })}
                            title="Transparent"
                            aria-label="Fill: transparent"
                            aria-pressed={defaults.fillColor === 'transparent'}
                            onClick={() => setFill('transparent')}
                        >
                            <span className="eui-cdt-fill-none-icon">∅</span>
                            <span>No fill</span>
                        </button>
                        <div className="eui-cdt-colors">
                            {allColors.map((c) => (
                                <button
                                    key={c}
                                    className={classnames('eui-cdt-color', { 'eui-cdt-color--active': defaults.fillColor === c, 'eui-cdt-color--white': c === 'white' })}
                                    style={{ background: colorMap[c] }}
                                    title={c}
                                    aria-label={`Fill: ${c}`}
                                    aria-pressed={defaults.fillColor === c}
                                    onClick={() => setFill(c)}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}

            {showStepNumber && (
                <>
                    <div className="eui-cdt-divider" />
                    <div className="eui-cdt-section">
                        <span className="eui-cdt-label">Number</span>
                        <div className="eui-cdt-step-number">
                            <button
                                className="eui-cdt-step-number-btn"
                                onClick={() => {
                                    const obj = selectedItem!.object;
                                    if ('stepNumber' in obj) onUpdateStepNumber?.(Math.max(1, obj.stepNumber - 1));
                                }}
                                aria-label="Decrease step number"
                            >
                                −
                            </button>
                            <input
                                className="eui-cdt-step-number-input"
                                type="number"
                                min={1}
                                value={'stepNumber' in selectedItem!.object ? (selectedItem!.object as { stepNumber: number }).stepNumber : 1}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (!isNaN(val) && val >= 1) onUpdateStepNumber?.(val);
                                }}
                                aria-label="Step number"
                            />
                            <button
                                className="eui-cdt-step-number-btn"
                                onClick={() => {
                                    const obj = selectedItem!.object;
                                    if ('stepNumber' in obj) onUpdateStepNumber?.(obj.stepNumber + 1);
                                }}
                                aria-label="Increase step number"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </>
            )}

            {showFontSection && (
                <>
                    <div className="eui-cdt-divider" />
                    <div className="eui-cdt-section">
                        <span className="eui-cdt-label">Font</span>
                        <div className="eui-cdt-font-selects">
                            <select
                                className="eui-cdt-select"
                                value={defaults.fontFamily}
                                onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                                title="Font family"
                                aria-label="Font family"
                            >
                                {fontFamilyOptions.map((f) => (
                                    <option key={f.id} value={f.id}>{f.label}</option>
                                ))}
                            </select>
                            <select
                                className="eui-cdt-select"
                                value={defaults.fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                title="Font size"
                                aria-label="Font size"
                            >
                                {fontSizeOptions.map((s) => (
                                    <option key={s} value={s}>{s}px</option>
                                ))}
                            </select>
                        </div>
                        <div className="eui-cdt-biu">
                            <button
                                className={classnames('eui-cdt-biu-btn', { 'eui-cdt-biu-btn--active': defaults.fontBold })}
                                title="Bold"
                                aria-pressed={defaults.fontBold}
                                onClick={toggleBold}
                            >
                                <strong>B</strong>
                            </button>
                            <button
                                className={classnames('eui-cdt-biu-btn', { 'eui-cdt-biu-btn--active': defaults.fontItalic })}
                                title="Italic"
                                aria-pressed={defaults.fontItalic}
                                onClick={toggleItalic}
                            >
                                <em>I</em>
                            </button>
                            <button
                                className={classnames('eui-cdt-biu-btn', { 'eui-cdt-biu-btn--active': defaults.fontUnderline })}
                                title="Underline"
                                aria-pressed={defaults.fontUnderline}
                                onClick={toggleUnderline}
                            >
                                <span style={{ textDecoration: 'underline' }}>U</span>
                            </button>
                        </div>
                    </div>
                    <div className="eui-cdt-divider" />
                    <div className="eui-cdt-section">
                        <span className="eui-cdt-label">Font Color</span>
                        <div className="eui-cdt-colors">
                            {allColors.map((c) => (
                                <button
                                    key={c}
                                    className={classnames('eui-cdt-color', { 'eui-cdt-color--active': defaults.fontColor === c, 'eui-cdt-color--white': c === 'white' })}
                                    style={{ background: colorMap[c] }}
                                    title={`Font: ${c}`}
                                    aria-label={`Font color: ${c}`}
                                    aria-pressed={defaults.fontColor === c}
                                    onClick={() => setFontColor(c)}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}

            {showTiming && (
                <>
                    <div className="eui-cdt-divider" />
                    <div className="eui-cdt-section eui-cdt-section--timing">
                        <span className="eui-cdt-label">Timing</span>

                        <div className="eui-cdt-timing-row">
                            <span className="eui-cdt-timing-label">Show at</span>
                            {editingShowAt ? (
                                <input
                                    className="eui-cdt-timing-input"
                                    value={showAtInput}
                                    autoFocus
                                    onChange={(e) => setShowAtInput(e.target.value)}
                                    onBlur={handleShowAtCommit}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleShowAtCommit();
                                        if (e.key === 'Escape') setEditingShowAt(false);
                                    }}
                                    placeholder="0:00.0"
                                    aria-label="Show at time"
                                />
                            ) : (
                                <button
                                    className="eui-cdt-timing-val"
                                    onClick={() => { setShowAtInput(formatTime(effectiveShowAt)); setEditingShowAt(true); }}
                                    aria-label={`Show at ${formatTime(effectiveShowAt)}`}
                                >
                                    {formatTime(effectiveShowAt)}
                                </button>
                            )}
                            <button className="eui-cdt-timing-now" title="Set to current time" aria-label="Set show time to current" onClick={onSetCurrentAsShowAt}>▸</button>
                        </div>

                        <div className="eui-cdt-timing-row">
                            <span className="eui-cdt-timing-label">Hide at</span>
                            {editingHideAt ? (
                                <input
                                    className="eui-cdt-timing-input"
                                    value={hideAtInput}
                                    autoFocus
                                    onChange={(e) => setHideAtInput(e.target.value)}
                                    onBlur={handleHideAtCommit}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleHideAtCommit();
                                        if (e.key === 'Escape') setEditingHideAt(false);
                                    }}
                                    placeholder="never"
                                    aria-label="Hide at time"
                                />
                            ) : (
                                <button
                                    className="eui-cdt-timing-val"
                                    onClick={() => { setHideAtInput(effectiveHideAt !== null ? formatTime(effectiveHideAt) : ''); setEditingHideAt(true); }}
                                    aria-label={effectiveHideAt !== null ? `Hide at ${formatTime(effectiveHideAt)}` : 'No hide time set'}
                                >
                                    {effectiveHideAt !== null ? formatTime(effectiveHideAt) : '—'}
                                </button>
                            )}
                            <button className="eui-cdt-timing-now" title="Set to current time" aria-label="Set hide time to current" onClick={onSetCurrentAsHideAt}>▸</button>
                        </div>

                        {showTransitions && (
                            <div className="eui-cdt-timing-row">
                                <span className="eui-cdt-timing-label">Transition</span>
                                <select
                                    className="eui-cdt-select"
                                    value={effectiveTransition}
                                    onChange={(e) => handleTransitionChange(e.target.value as DrawTransition)}
                                    aria-label="Transition type"
                                >
                                    {transitionOptions.map((t) => (
                                        <option key={t.id} value={t.id}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </>
            )}

            {showGroups && (
                <>
                    <div className="eui-cdt-divider" />
                    <div className="eui-cdt-section eui-cdt-section--timing">
                        <span className="eui-cdt-label">Group</span>
                        <select
                            className="eui-cdt-select"
                            value={selectedItem!.groupId ?? ''}
                            onChange={(e) => onAssignGroup(e.target.value || null)}
                            aria-label="Assign group"
                        >
                            <option value="">No group</option>
                            {groups.map((g) => (
                                <option key={g.id} value={g.id}>{g.label}</option>
                            ))}
                        </select>
                    </div>
                </>
            )}

            <div className="eui-cdt-divider" />

            <div className="eui-cdt-section eui-cdt-section--actions">
                {showUndo && (
                    <>
                        <button className="eui-cdt-action" title="Undo (Ctrl+Z)" aria-label="Undo" onClick={onUndo} disabled={!canUndo}>↩</button>
                        <button className="eui-cdt-action" title="Redo (Ctrl+Y)" aria-label="Redo" onClick={onRedo} disabled={!canRedo}>↪</button>
                    </>
                )}
                <button className="eui-cdt-action" title="Duplicate selected" aria-label="Duplicate selected" onClick={onDuplicateSelected} disabled={!selectedItem}>⧉</button>
                <button className="eui-cdt-action eui-cdt-action--danger" title="Delete selected (Del)" aria-label="Delete selected" onClick={onDeleteSelected} disabled={!selectedItem}>✕</button>
                {showClear && (
                    <button className="eui-cdt-action eui-cdt-action--danger" title="Clear all" aria-label="Clear all drawings" onClick={onClearAll}>🗑</button>
                )}
                {showExport && onExport && (
                    <button className="eui-cdt-action eui-cdt-action--export" title="Export" aria-label="Export as image" onClick={() => onExport('png')}>⬇</button>
                )}
            </div>
        </div>
    );
}
