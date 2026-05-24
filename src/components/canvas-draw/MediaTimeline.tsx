import { useCallback, useRef, useState } from 'react';
import classnames from 'classnames';
import type { DrawTransition } from './canvas-draw-types';
import '../eui-base.scss';
import './MediaTimeline.scss';

export interface TimelineItem {
    id: string;
    label?: string;
    color?: string;
    showAtMs: number;
    hideAtMs: number | null;
    groupId: string | null;
    transition: DrawTransition;
}

export interface TimelineGroup {
    id: string;
    label: string;
    color?: string;
    showAtMs: number;
    hideAtMs: number | null;
    transition: DrawTransition;
}

export interface MediaTimelineProps {
    items: TimelineItem[];
    groups: TimelineGroup[];
    durationMs: number;
    currentMs: number;
    selectedItemId: string | null;
    tickCount?: number;
    defaultItemColor?: string;
    zoomLevel?: number;
    onSelectItem: (id: string | null) => void;
    onUpdateItem: (id: string, patch: Partial<TimelineItem>) => void;
    onUpdateGroup: (id: string, patch: Partial<TimelineGroup>) => void;
    onAddGroup: () => void;
    onDeleteGroup: (id: string) => void;
    onSeek: (ms: number) => void;
    onZoomChange?: (zoom: number) => void;
}

const groupPalette = ['#4361ee', '#7209b7', '#2a9d8f', '#f4a261', '#e63946', '#52b788'];

const transitionOptions: { id: DrawTransition; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'fade', label: 'Fade' },
    { id: 'scale', label: 'Scale' },
    { id: 'slide-up', label: '↑ Slide' },
    { id: 'slide-down', label: '↓ Slide' },
    { id: 'slide-left', label: '← Slide' },
    { id: 'slide-right', label: '→ Slide' },
];

function msToPercent(ms: number, durationMs: number): number {
    if (durationMs === 0) return 0;
    return Math.min(100, Math.max(0, (ms / durationMs) * 100));
}

function xToMs(x: number, durationMs: number, width: number): number {
    return Math.round((x / width) * durationMs);
}

function formatTime(ms: number): string {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

type DragType =
    | 'item-move'
    | 'item-resize-end'
    | 'group-move'
    | 'group-resize-start'
    | 'group-resize-end';

interface DragState {
    type: DragType;
    id: string;
    startX: number;
    origShowAt: number;
    origHideAt: number | null;
}

export default function MediaTimeline({
    items,
    groups,
    durationMs,
    currentMs,
    selectedItemId,
    tickCount = 10,
    defaultItemColor = '#89b4fa',
    onSelectItem,
    onUpdateItem,
    onUpdateGroup,
    onAddGroup,
    onDeleteGroup,
    onSeek,
    zoomLevel: controlledZoom,
    onZoomChange,
}: MediaTimelineProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
    const [internalZoom, setInternalZoom] = useState(1);

    const zoom = controlledZoom ?? internalZoom;

    const getTrackWidth = useCallback(() => trackRef.current?.clientWidth ?? 600, []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.max(0.1, Math.min(10, zoom + delta));
        if (onZoomChange) {
            onZoomChange(newZoom);
        } else {
            setInternalZoom(newZoom);
        }
    }, [zoom, onZoomChange]);

    const selectedItem = selectedItemId ? items.find((it) => it.id === selectedItemId) : null;

    const onTrackMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === trackRef.current) {
            const rect = trackRef.current!.getBoundingClientRect();
            const ms = xToMs(e.clientX - rect.left, durationMs, getTrackWidth());
            onSeek(ms);
        }
    }, [durationMs, getTrackWidth, onSeek]);

    const startDrag = useCallback((
        type: DragType,
        id: string,
        e: React.MouseEvent,
        origShowAt: number,
        origHideAt: number | null,
    ) => {
        e.stopPropagation();
        e.preventDefault();
        setDragState({ type, id, startX: e.clientX, origShowAt, origHideAt });
    }, []);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!dragState) return;
        const dx = e.clientX - dragState.startX;
        const dMs = Math.round((dx / getTrackWidth()) * durationMs);
        const { type, id, origShowAt, origHideAt } = dragState;

        if (type === 'item-move') {
            const newShow = Math.max(0, Math.min(origShowAt + dMs, durationMs));
            const dur = origHideAt !== null ? origHideAt - origShowAt : null;
            const newHide = dur !== null ? Math.min(newShow + dur, durationMs) : null;
            onUpdateItem(id, { showAtMs: newShow, hideAtMs: newHide });
        } else if (type === 'item-resize-end') {
            const base = origHideAt ?? origShowAt;
            const newHide = Math.max(origShowAt + 100, Math.min(base + dMs, durationMs));
            onUpdateItem(id, { hideAtMs: newHide });
        } else if (type === 'group-move') {
            const newShow = Math.max(0, Math.min(origShowAt + dMs, durationMs));
            const dur = origHideAt !== null ? origHideAt - origShowAt : null;
            const newHide = dur !== null ? Math.min(newShow + dur, durationMs) : null;
            onUpdateGroup(id, { showAtMs: newShow, hideAtMs: newHide });
        } else if (type === 'group-resize-end') {
            const base = origHideAt ?? origShowAt;
            const newHide = Math.max(origShowAt + 100, Math.min(base + dMs, durationMs));
            onUpdateGroup(id, { hideAtMs: newHide });
        } else if (type === 'group-resize-start') {
            const newShow = Math.max(0, Math.min(origShowAt + dMs, (origHideAt ?? durationMs) - 100));
            onUpdateGroup(id, { showAtMs: newShow });
        }
    }, [dragState, durationMs, getTrackWidth, onUpdateItem, onUpdateGroup]);

    const onMouseUp = useCallback(() => setDragState(null), []);

    const ticks = Array.from({ length: tickCount + 1 }, (_, i) =>
        Math.round((i / tickCount) * durationMs),
    );

    return (
        <div
            className="eui-media-timeline"
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
        >
            <div className="eui-mt-header">
                <span className="eui-mt-title">Timeline</span>
                {selectedItem && (
                    <span className="eui-mt-selected-info">
                        {formatTime(selectedItem.showAtMs)}
                        {selectedItem.hideAtMs !== null ? ` – ${formatTime(selectedItem.hideAtMs)}` : ' – end'}
                    </span>
                )}
                <span className="eui-mt-zoom-label">{Math.round(zoom * 100)}%</span>
                <button className="eui-mt-add-group" onClick={onAddGroup} aria-label="Add group">
                    + Group
                </button>
            </div>

            <div className="eui-mt-track-wrap" ref={trackRef} onMouseDown={onTrackMouseDown} onWheel={handleWheel} style={{ width: `${zoom * 100}%`, minWidth: '100%' }}>
                <div className="eui-mt-ticks">
                    {ticks.map((ms) => (
                        <div
                            key={ms}
                            className="eui-mt-tick"
                            style={{ left: `${msToPercent(ms, durationMs)}%` }}
                        >
                            <span className="eui-mt-tick-label">{formatTime(ms)}</span>
                        </div>
                    ))}
                </div>

                <div
                    className="eui-mt-playhead"
                    style={{ left: `${msToPercent(currentMs, durationMs)}%` }}
                    aria-hidden="true"
                />

                {groups.map((group, gi) => {
                    const gColor = group.color ?? groupPalette[gi % groupPalette.length];
                    const startPct = msToPercent(group.showAtMs, durationMs);
                    const endPct = group.hideAtMs !== null
                        ? msToPercent(group.hideAtMs, durationMs)
                        : 100;
                    const wPct = Math.max(endPct - startPct, 0.3);
                    const isExpanded = expandedGroupId === group.id;

                    return (
                        <div key={group.id} className="eui-mt-group-row">
                            <div
                                className="eui-mt-group-block"
                                style={{ left: `${startPct}%`, width: `${wPct}%`, borderColor: gColor, background: `${gColor}22` }}
                                onMouseDown={(e) => startDrag('group-move', group.id, e, group.showAtMs, group.hideAtMs)}
                                onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                                title={group.label}
                                role="button"
                                aria-label={`Group: ${group.label}`}
                            >
                                <div
                                    className="eui-mt-resize-handle eui-mt-resize-handle--start"
                                    onMouseDown={(e) => startDrag('group-resize-start', group.id, e, group.showAtMs, group.hideAtMs)}
                                    aria-hidden="true"
                                />
                                <span className="eui-mt-group-label" style={{ color: gColor }}>{group.label}</span>
                                <div
                                    className="eui-mt-resize-handle eui-mt-resize-handle--end"
                                    onMouseDown={(e) => startDrag('group-resize-end', group.id, e, group.showAtMs, group.hideAtMs)}
                                    aria-hidden="true"
                                />
                            </div>

                            {isExpanded && (
                                <div className="eui-mt-group-props">
                                    <input
                                        className="eui-mt-group-name-input"
                                        value={group.label}
                                        onChange={(e) => onUpdateGroup(group.id, { label: e.target.value })}
                                        placeholder="Group name"
                                        aria-label="Group name"
                                    />
                                    <select
                                        className="eui-mt-select"
                                        value={group.transition}
                                        onChange={(e) => onUpdateGroup(group.id, { transition: e.target.value as DrawTransition })}
                                        aria-label="Group transition"
                                    >
                                        {transitionOptions.map((t) => (
                                            <option key={t.id} value={t.id}>{t.label}</option>
                                        ))}
                                    </select>
                                    <button
                                        className="eui-mt-delete-group"
                                        onClick={() => { onDeleteGroup(group.id); setExpandedGroupId(null); }}
                                        aria-label={`Delete group ${group.label}`}
                                    >
                                        Delete group
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="eui-mt-items-row">
                    {items.map((item) => {
                        const startPct = msToPercent(item.showAtMs, durationMs);
                        const endPct = item.hideAtMs !== null
                            ? msToPercent(item.hideAtMs, durationMs)
                            : 100;
                        const wPct = Math.max(endPct - startPct, 0.3);
                        const isSelected = item.id === selectedItemId;
                        const groupIndex = groups.findIndex((g) => g.id === item.groupId);
                        const blockColor = groupIndex >= 0
                            ? (groups[groupIndex].color ?? groupPalette[groupIndex % groupPalette.length])
                            : (item.color ?? defaultItemColor);

                        return (
                            <div
                                key={item.id}
                                className={classnames('eui-mt-item-block', { 'eui-mt-item-block--selected': isSelected })}
                                style={{ left: `${startPct}%`, width: `${wPct}%`, background: blockColor, opacity: isSelected ? 1 : 0.65 }}
                                title={item.label ?? `${item.showAtMs}ms${item.hideAtMs !== null ? ` – ${item.hideAtMs}ms` : ''}`}
                                role="button"
                                aria-selected={isSelected}
                                onClick={() => onSelectItem(isSelected ? null : item.id)}
                                onMouseDown={(e) => {
                                    onSelectItem(item.id);
                                    startDrag('item-move', item.id, e, item.showAtMs, item.hideAtMs);
                                }}
                            >
                                <div
                                    className="eui-mt-resize-handle eui-mt-resize-handle--end"
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        startDrag('item-resize-end', item.id, e, item.showAtMs, item.hideAtMs);
                                    }}
                                    aria-hidden="true"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
