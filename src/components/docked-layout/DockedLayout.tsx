import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanelBottomIcon, PanelFloatIcon, PanelLeftIcon, PanelRightIcon, PinIcon, TimesIcon } from '../../assets/icons';
import './docked-layout.scss';
import type {
    Breakpoint,
    DockedLayoutProps,
    DockedLayoutState,
    DockPosition,
    FloatPos,
    PanelConfig,
    PanelRuntimeState,
    PinState,
} from './docked-layout-types';
import {
    defaultActivityBarWidth,
    defaultFloatHeight,
    defaultFloatWidth,
    defaultPanelSize,
} from './docked-layout-types';

const defaultBreakpoints: Breakpoint[] = [
    { key: 'xs', maxWidth: 480, label: 'Mobile' },
    { key: 'sm', maxWidth: 768, label: 'Tablet' },
    { key: 'md', maxWidth: 1024, label: 'Laptop' },
    { key: 'lg', maxWidth: 1440, label: 'Desktop' },
    { key: 'xl', maxWidth: Infinity, label: 'Wide' },
];

function resolveBreakpointKey(width: number, breakpoints: Breakpoint[]): string {
    const sorted = [...breakpoints].sort((a, b) => a.maxWidth - b.maxWidth);
    return sorted.find((bp) => width <= bp.maxWidth)?.key ?? sorted[sorted.length - 1].key;
}

function applyBreakpointOverrides(
    state: DockedLayoutState,
    panels: PanelConfig[],
    breakpointKey: string,
): DockedLayoutState {
    const newPanels = { ...state.panels };
    const newActiveTabs = { ...state.activeTabs };
    let changed = false;

    panels.forEach((config) => {
        const override = config.breakpoints?.find((bp) => bp.breakpointKey === breakpointKey);
        if (!override) return;

        const runtime = state.panels[config.id];
        if (!runtime) return;

        const updated: PanelRuntimeState = { ...runtime };
        if (override.position !== undefined && override.position !== runtime.position) {
            const oldPos = runtime.position as string;
            if (newActiveTabs[oldPos] === config.id) {
                const remaining = Object.values(state.panels).filter(
                    (p) => p.id !== config.id && p.position === runtime.position && p.visible,
                );
                newActiveTabs[oldPos] = remaining[0]?.id ?? null;
            }
            updated.position = override.position;
            if (override.position !== 'float' && updated.visible) {
                const newPos = override.position as string;
                if (!newActiveTabs[newPos]) newActiveTabs[newPos] = config.id;
            }
            changed = true;
        }
        if (override.state !== undefined) { updated.pinState = override.state; changed = true; }
        if (override.size !== undefined) { updated.size = override.size; changed = true; }
        if (override.visible !== undefined) { updated.visible = override.visible; changed = true; }

        if (changed) newPanels[config.id] = updated;
    });

    if (!changed) return state;
    return { panels: newPanels, activeTabs: newActiveTabs };
}

function buildInitialState(panels: PanelConfig[]): DockedLayoutState {
    const panelStates: Record<string, PanelRuntimeState> = {};
    const activeTabs: Record<string, string | null> = { left: null, right: null, bottom: null };

    panels.forEach((p) => {
        const position: DockPosition = p.defaultPosition ?? 'left';
        const pinState: PinState = p.defaultState ?? 'pinned';
        const visible = p.defaultVisible !== false;

        panelStates[p.id] = {
            id: p.id,
            position,
            pinState,
            size: p.defaultSize ?? defaultPanelSize,
            floatPos: p.defaultFloatPos ?? { x: 80, y: 80, width: defaultFloatWidth, height: defaultFloatHeight },
            visible,
        };

        if (visible && position !== 'float') {
            const key = position as string;
            if (!activeTabs[key]) activeTabs[key] = p.id;
        }
    });

    return { panels: panelStates, activeTabs };
}

function getPanelsForPosition(
    state: DockedLayoutState,
    configs: PanelConfig[],
    position: DockPosition,
): Array<{ config: PanelConfig; runtime: PanelRuntimeState }> {
    return configs
        .filter((c) => {
            const r = state.panels[c.id];
            return r && r.position === position && r.visible;
        })
        .map((c) => ({ config: c, runtime: state.panels[c.id] }));
}

interface DragState {
    panelId: string;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    hoveredZone: DockPosition | null;
}

interface ResizeState {
    panelId: string;
    axis: 'horizontal' | 'vertical';
    startPos: number;
    startSize: number;
}

export const DockedLayout: React.FC<DockedLayoutProps> = ({
    panels: panelConfigs,
    children,
    layoutState: externalState,
    onChange,
    tabMode = 'icon',
    breakpoints: propBreakpoints,
    contentTabs,
    activeContentTabId: externalActiveTabId,
    onContentTabChange,
    onContentTabClose,
    enableContentTabs = false,
    className,
    style,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(Infinity);
    const [internalState, setInternalState] = useState<DockedLayoutState>(() =>
        externalState ?? buildInitialState(panelConfigs),
    );
    const [internalActiveTabId, setInternalActiveTabId] = useState<string>(
        () => externalActiveTabId ?? contentTabs?.[0]?.id ?? '',
    );
    const activeContentTabId = externalActiveTabId ?? internalActiveTabId;
    const handleContentTabChange = useCallback((tabId: string) => {
        setInternalActiveTabId(tabId);
        onContentTabChange?.(tabId);
    }, [onContentTabChange]);
    const handleContentTabClose = useCallback((tabId: string) => {
        onContentTabClose?.(tabId);
    }, [onContentTabClose]);
    const [autoHideExpanded, setAutoHideExpanded] = useState<Record<string, boolean>>({});
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [resizeState, setResizeState] = useState<ResizeState | null>(null);
    const [resizingPanelId, setResizingPanelId] = useState<string | null>(null);

    const state = externalState ?? internalState;
    const stateRef = useRef(state);
    stateRef.current = state;

    const updateState = useCallback(
        (updater: (prev: DockedLayoutState) => DockedLayoutState) => {
            const newState = updater(stateRef.current);
            setInternalState(newState);
            onChange?.(newState);
        },
        [onChange],
    );

    const bpList = useMemo(() => propBreakpoints?.length ? propBreakpoints : defaultBreakpoints, [propBreakpoints]);

    const activeBreakpointKey = useMemo(
        () => resolveBreakpointKey(containerWidth, bpList),
        [containerWidth, bpList],
    );

    const prevBreakpointKeyRef = useRef<string | null>(null);
    const isFirstBpRef = useRef(true);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const w = container.getBoundingClientRect().width;
        if (w > 0) setContainerWidth(w);
        const observer = new ResizeObserver(([entry]) => {
            setContainerWidth(entry.contentRect.width);
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (prevBreakpointKeyRef.current === activeBreakpointKey) return;
        const isFirst = isFirstBpRef.current;
        isFirstBpRef.current = false;
        prevBreakpointKeyRef.current = activeBreakpointKey;

        const hasOverrides = panelConfigs.some((c) => c.breakpoints?.length);
        if (!hasOverrides) return;

        if (isFirst) {
            setInternalState((prev) => applyBreakpointOverrides(prev, panelConfigs, activeBreakpointKey));
        } else {
            updateState((prev) => applyBreakpointOverrides(prev, panelConfigs, activeBreakpointKey));
        }
    }, [activeBreakpointKey, panelConfigs, updateState]);

    const leftPanels = useMemo(() => getPanelsForPosition(state, panelConfigs, 'left'), [state, panelConfigs]);
    const rightPanels = useMemo(() => getPanelsForPosition(state, panelConfigs, 'right'), [state, panelConfigs]);
    const bottomPanels = useMemo(() => getPanelsForPosition(state, panelConfigs, 'bottom'), [state, panelConfigs]);
    const floatPanels = useMemo(() => getPanelsForPosition(state, panelConfigs, 'float'), [state, panelConfigs]);

    const activeLeftId = state.activeTabs['left'] ?? leftPanels[0]?.config.id ?? null;
    const activeRightId = state.activeTabs['right'] ?? rightPanels[0]?.config.id ?? null;
    const activeBottomId = state.activeTabs['bottom'] ?? bottomPanels[0]?.config.id ?? null;

    const getActivePanelInfo = (id: string | null) => {
        if (!id) return null;
        const config = panelConfigs.find((c) => c.id === id);
        const runtime = state.panels[id];
        if (!config || !runtime) return null;
        return { config, runtime };
    };

    const isPinnedOpen = (id: string | null) => {
        if (!id) return false;
        const r = state.panels[id];
        return r?.pinState === 'pinned';
    };

    const isAutoHideOpen = (id: string | null) => {
        if (!id) return false;
        const r = state.panels[id];
        return r?.pinState === 'auto-hide' && !!autoHideExpanded[id];
    };

    const leftPinnedOpen = isPinnedOpen(activeLeftId);
    const leftAutoHideOpen = isAutoHideOpen(activeLeftId);

    const rightPinnedOpen = isPinnedOpen(activeRightId);
    const rightAutoHideOpen = isAutoHideOpen(activeRightId);

    const bottomPinnedOpen = isPinnedOpen(activeBottomId);
    const bottomAutoHideOpen = isAutoHideOpen(activeBottomId);

    const handleTabClick = useCallback(
        (panelId: string, position: DockPosition) => {
            const runtime = stateRef.current.panels[panelId];
            if (!runtime) return;
            const posKey = position as string;
            const currentActive = stateRef.current.activeTabs[posKey];

            if (runtime.pinState === 'auto-hide') {
                if (currentActive === panelId) {
                    setAutoHideExpanded((prev) => ({ ...prev, [panelId]: !prev[panelId] }));
                } else {
                    updateState((prev) => ({
                        ...prev,
                        activeTabs: { ...prev.activeTabs, [posKey]: panelId },
                    }));
                    setAutoHideExpanded((prev) => {
                        const next: Record<string, boolean> = {};
                        Object.keys(prev).forEach((k) => { next[k] = false; });
                        next[panelId] = true;
                        return next;
                    });
                }
            } else {
                if (currentActive === panelId) {
                    updateState((prev) => ({
                        ...prev,
                        activeTabs: { ...prev.activeTabs, [posKey]: null },
                    }));
                } else {
                    updateState((prev) => ({
                        ...prev,
                        activeTabs: { ...prev.activeTabs, [posKey]: panelId },
                    }));
                }
            }
        },
        [updateState],
    );

    const togglePin = useCallback(
        (panelId: string) => {
            updateState((prev) => {
                const r = prev.panels[panelId];
                if (!r) return prev;
                const newPinState: PinState = r.pinState === 'pinned' ? 'auto-hide' : 'pinned';
                return {
                    ...prev,
                    panels: { ...prev.panels, [panelId]: { ...r, pinState: newPinState } },
                };
            });
            if (state.panels[panelId]?.pinState === 'pinned') {
                setAutoHideExpanded((prev) => ({ ...prev, [panelId]: false }));
            }
        },
        [updateState, state.panels],
    );

    const closePanel = useCallback(
        (panelId: string) => {
            updateState((prev) => {
                const r = prev.panels[panelId];
                if (!r) return prev;
                const newActiveTabs = { ...prev.activeTabs };
                const posKey = r.position as string;
                if (newActiveTabs[posKey] === panelId) {
                    const remaining = Object.values(prev.panels).filter(
                        (p) => p.id !== panelId && p.position === r.position && p.visible,
                    );
                    newActiveTabs[posKey] = remaining[0]?.id ?? null;
                }
                return {
                    ...prev,
                    panels: { ...prev.panels, [panelId]: { ...r, visible: false } },
                    activeTabs: newActiveTabs,
                };
            });
            setAutoHideExpanded((prev) => ({ ...prev, [panelId]: false }));
        },
        [updateState],
    );

    const movePanel = useCallback(
        (panelId: string, newPosition: DockPosition) => {
            updateState((prev) => {
                const r = prev.panels[panelId];
                if (!r) return prev;
                const newActiveTabs = { ...prev.activeTabs };
                const oldPosKey = r.position as string;
                if (newActiveTabs[oldPosKey] === panelId) {
                    const remaining = Object.values(prev.panels).filter(
                        (p) => p.id !== panelId && p.position === r.position && p.visible,
                    );
                    newActiveTabs[oldPosKey] = remaining[0]?.id ?? null;
                }
                if (newPosition !== 'float') {
                    const newPosKey = newPosition as string;
                    newActiveTabs[newPosKey] = panelId;
                }
                const pinState: PinState = newPosition === 'float' ? 'pinned' : r.pinState;
                return {
                    ...prev,
                    panels: { ...prev.panels, [panelId]: { ...r, position: newPosition, pinState } },
                    activeTabs: newActiveTabs,
                };
            });
            setAutoHideExpanded((prev) => ({ ...prev, [panelId]: false }));
        },
        [updateState],
    );

    // ── Resize logic ──────────────────────────────────────────────────────────
    const startResize = useCallback(
        (e: React.MouseEvent, panelId: string, axis: 'horizontal' | 'vertical') => {
            e.preventDefault();
            e.stopPropagation();
            const runtime = state.panels[panelId];
            if (!runtime) return;
            setResizingPanelId(panelId);
            const rs: ResizeState = {
                panelId,
                axis,
                startPos: axis === 'horizontal' ? e.clientX : e.clientY,
                startSize: runtime.size,
            };
            setResizeState(rs);

            const handleMove = (ev: MouseEvent) => {
                const current = stateRef.current;
                const r = current.panels[panelId];
                if (!r) return;
                const delta = (axis === 'horizontal' ? ev.clientX : ev.clientY) - rs.startPos;
                const config = panelConfigs.find((c) => c.id === panelId);
                const minSize = config?.minSize ?? 100;
                const rawSize = r.position === 'right' || r.position === 'bottom'
                    ? rs.startSize - delta
                    : rs.startSize + delta;
                const newSize = Math.max(minSize, Math.min(rawSize, 800));
                updateState((prev) => ({
                    ...prev,
                    panels: { ...prev.panels, [panelId]: { ...prev.panels[panelId], size: newSize } },
                }));
            };

            const handleUp = () => {
                setResizeState(null);
                setResizingPanelId(null);
                document.removeEventListener('mousemove', handleMove);
                document.removeEventListener('mouseup', handleUp);
            };

            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleUp);
        },
        [state.panels, panelConfigs, updateState],
    );

    // ── Float panel move/resize ───────────────────────────────────────────────
    const startFloatMove = useCallback(
        (e: React.MouseEvent, panelId: string) => {
            e.preventDefault();
            const runtime = state.panels[panelId];
            if (!runtime) return;
            const startFpX = runtime.floatPos.x;
            const startFpY = runtime.floatPos.y;
            const startClientX = e.clientX;
            const startClientY = e.clientY;
            const startW = runtime.floatPos.width;
            const cW = containerRef.current?.getBoundingClientRect().width ?? Infinity;
            const cH = containerRef.current?.getBoundingClientRect().height ?? Infinity;

            const handleMove = (ev: MouseEvent) => {
                const rawX = startFpX + (ev.clientX - startClientX);
                const rawY = startFpY + (ev.clientY - startClientY);
                const clampedX = Math.max(-(startW - 80), Math.min(rawX, cW - 80));
                const clampedY = Math.max(0, Math.min(rawY, cH - 32));
                updateState((prev) => {
                    const r = prev.panels[panelId];
                    if (!r) return prev;
                    return {
                        ...prev,
                        panels: {
                            ...prev.panels,
                            [panelId]: {
                                ...r,
                                floatPos: { ...r.floatPos, x: clampedX, y: clampedY },
                            },
                        },
                    };
                });
            };

            const handleUp = () => {
                document.removeEventListener('mousemove', handleMove);
                document.removeEventListener('mouseup', handleUp);
            };

            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleUp);
        },
        [state.panels, updateState],
    );

    const startFloatResize = useCallback(
        (e: React.MouseEvent, panelId: string, dir: 'e' | 'w' | 's' | 'se' | 'sw') => {
            e.preventDefault();
            e.stopPropagation();
            const runtime = state.panels[panelId];
            if (!runtime) return;
            const startClientX = e.clientX;
            const startClientY = e.clientY;
            const startW = runtime.floatPos.width;
            const startH = runtime.floatPos.height;
            const startFpX = runtime.floatPos.x;
            const config = panelConfigs.find((c) => c.id === panelId);
            const minSize = config?.minSize ?? 100;

            const handleMove = (ev: MouseEvent) => {
                const dx = ev.clientX - startClientX;
                const dy = ev.clientY - startClientY;
                updateState((prev) => {
                    const r = prev.panels[panelId];
                    if (!r) return prev;
                    let newWidth = r.floatPos.width;
                    let newHeight = r.floatPos.height;
                    let newX = r.floatPos.x;
                    if (dir === 'e' || dir === 'se') {
                        newWidth = Math.max(minSize, startW + dx);
                    }
                    if (dir === 'w' || dir === 'sw') {
                        const clampedDx = Math.min(dx, startW - minSize);
                        newWidth = startW - clampedDx;
                        newX = startFpX + clampedDx;
                    }
                    if (dir === 's' || dir === 'se' || dir === 'sw') {
                        newHeight = Math.max(minSize, startH + dy);
                    }
                    return {
                        ...prev,
                        panels: {
                            ...prev.panels,
                            [panelId]: {
                                ...r,
                                floatPos: { ...r.floatPos, x: newX, width: newWidth, height: newHeight },
                            },
                        },
                    };
                });
            };

            const handleUp = () => {
                document.removeEventListener('mousemove', handleMove);
                document.removeEventListener('mouseup', handleUp);
            };

            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleUp);
        },
        [state.panels, panelConfigs, updateState],
    );

    // ── Drag-to-redock ────────────────────────────────────────────────────────
    const startPanelDrag = useCallback(
        (e: React.MouseEvent, panelId: string) => {
            if ((e.target as HTMLElement).closest('.eui-dl-panel-action-btn')) return;
            e.preventDefault();
            setDragState({
                panelId,
                startX: e.clientX,
                startY: e.clientY,
                currentX: e.clientX,
                currentY: e.clientY,
                hoveredZone: null,
            });

            const handleMove = (ev: MouseEvent) => {
                const container = containerRef.current;
                if (!container) return;
                const rect = container.getBoundingClientRect();
                const relX = ev.clientX - rect.left;
                const relY = ev.clientY - rect.top;
                const w = rect.width;
                const h = rect.height;
                const zoneW = Math.min(w * 0.25, 160);
                const zoneH = Math.min(h * 0.25, 120);

                let hovered: DockPosition | null = null;
                if (relX < zoneW) hovered = 'left';
                else if (relX > w - zoneW) hovered = 'right';
                else if (relY > h - zoneH) hovered = 'bottom';
                else if (relX > w * 0.3 && relX < w * 0.7 && relY > h * 0.3 && relY < h * 0.7) hovered = 'float';

                setDragState((prev) => prev ? { ...prev, currentX: ev.clientX, currentY: ev.clientY, hoveredZone: hovered } : null);
            };

            const handleUp = (ev: MouseEvent) => {
                setDragState((prev) => {
                    if (prev?.hoveredZone) {
                        const moved = Math.abs(ev.clientX - prev.startX) > 10 || Math.abs(ev.clientY - prev.startY) > 10;
                        if (moved) movePanel(prev.panelId, prev.hoveredZone);
                    }
                    return null;
                });
                document.removeEventListener('mousemove', handleMove);
                document.removeEventListener('mouseup', handleUp);
            };

            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleUp);
        },
        [movePanel],
    );

    const dismissAutoHide = useCallback(() => {
        setAutoHideExpanded({});
    }, []);

    // ── Helpers ────────────────────────────────────────────────────────────────
    const getPanelDockActions = (panelId: string) => {
        const runtime = state.panels[panelId];
        const config = panelConfigs.find((c) => c.id === panelId);
        if (!runtime || !config) return null;
        const canMove = config.userCanMove !== false;
        const canResize = config.userCanResize !== false;
        const canClose = config.userCanClose !== false;
        const canPin = config.userCanTogglePin !== false;
        return { canMove, canResize, canClose, canPin };
    };

    // ── Panel render helper ───────────────────────────────────────────────────
    const renderPanel = (
        panelId: string | null,
        position: DockPosition,
        isOverlay: boolean,
        overlayStyle?: React.CSSProperties,
    ) => {
        if (!panelId) return null;
        const info = getActivePanelInfo(panelId);
        if (!info) return null;
        const { config, runtime } = info;
        const actions = getPanelDockActions(panelId);

        const sizeStyle: React.CSSProperties =
            position === 'left' || position === 'right'
                ? { width: runtime.size }
                : { height: runtime.size };

        return (
            <div
                key={panelId}
                className={classNames('eui-dl-panel-area', `eui-dl-panel-${position}`, {
                    'eui-dl-panel-overlay': isOverlay,
                })}
                style={{ ...sizeStyle, ...overlayStyle }}
                role="complementary"
                aria-label={config.title}
            >
                <div
                    className="eui-dl-panel-header"
                    onMouseDown={(e) => actions?.canMove && startPanelDrag(e, panelId)}
                    title={actions?.canMove ? 'Drag to re-dock' : undefined}
                >
                    <span className="eui-dl-panel-title">{config.title}</span>
                    <div className="eui-dl-panel-actions">
                        {actions?.canPin && (
                            <button
                                className={classNames('eui-dl-panel-action-btn', {
                                    active: runtime.pinState === 'pinned',
                                })}
                                onClick={() => togglePin(panelId)}
                                title={runtime.pinState === 'pinned' ? 'Switch to auto-hide' : 'Pin panel'}
                                aria-pressed={runtime.pinState === 'pinned'}
                                aria-label={runtime.pinState === 'pinned' ? 'Switch to auto-hide' : 'Pin panel'}
                            >
                                <PinIcon aria-hidden="true" />
                            </button>
                        )}
                        {actions?.canClose && (
                            <button
                                className="eui-dl-panel-action-btn"
                                onClick={() => closePanel(panelId)}
                                title="Close panel"
                                aria-label="Close panel"
                            >
                                <TimesIcon aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="eui-dl-panel-body">{config.children}</div>
                {!isOverlay && position === 'left' && actions?.canResize && (
                    <div
                        className={classNames('eui-dl-resize-handle', 'eui-dl-rh-right', {
                            dragging: resizingPanelId === panelId,
                        })}
                        onMouseDown={(e) => startResize(e, panelId, 'horizontal')}
                        role="separator"
                        aria-orientation="vertical"
                        aria-label="Resize panel"
                        tabIndex={0}
                    />
                )}
                {!isOverlay && position === 'right' && actions?.canResize && (
                    <div
                        className={classNames('eui-dl-resize-handle', 'eui-dl-rh-left', {
                            dragging: resizingPanelId === panelId,
                        })}
                        onMouseDown={(e) => startResize(e, panelId, 'horizontal')}
                        role="separator"
                        aria-orientation="vertical"
                        aria-label="Resize panel"
                        tabIndex={0}
                    />
                )}
            </div>
        );
    };

    // ── Activity bar render helper ────────────────────────────────────────────
    const renderActivityBar = (
        panels: Array<{ config: PanelConfig; runtime: PanelRuntimeState }>,
        position: DockPosition,
        activeId: string | null,
    ) => {
        if (panels.length === 0) return null;
        const isBottom = position === 'bottom';
        const isRight = position === 'right';

        return (
            <div
                className={classNames('eui-dl-activity-bar', `eui-dl-activity-bar-${position}`, {
                    'eui-dl-activity-bar-icon-label': tabMode === 'icon-label',
                })}
                role="tablist"
                aria-orientation={isBottom ? 'horizontal' : 'vertical'}
                aria-label={`${position} panel tabs`}
            >
                {panels.map(({ config, runtime }) => {
                    const isActive = activeId === config.id;
                    const isExpanded = isActive && (runtime.pinState === 'pinned' || autoHideExpanded[config.id]);
                    const IconComp = config.icon;
                    return (
                        <button
                            key={config.id}
                            className={classNames('eui-dl-tab-btn', { active: isActive && isExpanded })}
                            onClick={() => handleTabClick(config.id, position)}
                            title={config.title}
                            role="tab"
                            aria-selected={isActive && isExpanded}
                            aria-controls={`eui-dl-panel-${config.id}`}
                        >
                            <IconComp aria-hidden="true" width={18} height={18} />
                            {tabMode === 'icon-label' && (
                                <span className="eui-dl-tab-label">{config.title}</span>
                            )}
                        </button>
                    );
                })}
                {!isBottom && !isRight && <div style={{ flex: 1 }} />}
            </div>
        );
    };

    // ── Drop zones ─────────────────────────────────────────────────────────────
    const renderDropZones = () => {
        if (!dragState) return null;
        const zones: Array<{ id: DockPosition; label: string; icon: React.ReactNode; style: React.CSSProperties }> = [
            {
                id: 'left',
                label: 'Left',
                icon: <PanelLeftIcon aria-hidden="true" />,
                style: { left: 8, top: '10%', bottom: '10%', width: '20%', maxWidth: 160 },
            },
            {
                id: 'right',
                label: 'Right',
                icon: <PanelRightIcon aria-hidden="true" />,
                style: { right: 8, top: '10%', bottom: '10%', width: '20%', maxWidth: 160 },
            },
            {
                id: 'bottom',
                label: 'Bottom',
                icon: <PanelBottomIcon aria-hidden="true" />,
                style: { left: '25%', right: '25%', bottom: 8, height: '20%', maxHeight: 120 },
            },
            {
                id: 'float',
                label: 'Float',
                icon: <PanelFloatIcon aria-hidden="true" />,
                style: { left: '30%', right: '30%', top: '30%', bottom: '30%' },
            },
        ];

        return (
            <div className="eui-dl-drop-overlay" aria-hidden="true">
                {zones.map((z) => (
                    <div
                        key={z.id}
                        className={classNames('eui-dl-drop-zone', {
                            active: true,
                            hover: dragState.hoveredZone === z.id,
                        })}
                        style={{ position: 'absolute', ...z.style }}
                    >
                        <div className="eui-dl-dz-label">
                            {z.icon}
                            {z.label}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // ── Auto-hide overlay position ─────────────────────────────────────────────
    const getAutoHideOverlayStyle = (position: DockPosition): React.CSSProperties => {
        const barW = tabMode === 'icon-label' ? 52 : defaultActivityBarWidth;
        if (position === 'left') return { position: 'absolute', left: barW, top: 0, bottom: 0 };
        if (position === 'right') return { position: 'absolute', right: barW, top: 0, bottom: 0 };
        if (position === 'bottom') return { position: 'absolute', left: 0, right: 0, bottom: 0 };
        return {};
    };

    const hasAutoHideOpen = leftAutoHideOpen || rightAutoHideOpen || bottomAutoHideOpen;

    return (
        <div
            ref={containerRef}
            className={classNames('eui-docked-layout', className)}
            style={style}
        >
            {hasAutoHideOpen && (
                <div
                    className="eui-dl-autohide-backdrop"
                    onClick={dismissAutoHide}
                    aria-hidden="true"
                />
            )}

            {/* Left side */}
            {leftPanels.length > 0 && (
                <div className="eui-dl-side eui-dl-side-left">
                    {renderActivityBar(leftPanels, 'left', activeLeftId)}
                    {leftPinnedOpen && renderPanel(activeLeftId, 'left', false)}
                    {leftAutoHideOpen && renderPanel(
                        activeLeftId,
                        'left',
                        true,
                        getAutoHideOverlayStyle('left'),
                    )}
                </div>
            )}

            {/* Center column */}
            <div className="eui-dl-center">
                {enableContentTabs && contentTabs && contentTabs.length > 0 && (
                    <div className="eui-dl-content-tabs" role="tablist" aria-label="Content tabs">
                        {contentTabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <div
                                    key={tab.id}
                                    className={classNames('eui-dl-content-tab', { active: tab.id === activeContentTabId })}
                                    role="tab"
                                    aria-selected={tab.id === activeContentTabId}
                                    tabIndex={tab.id === activeContentTabId ? 0 : -1}
                                    onClick={() => handleContentTabChange(tab.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleContentTabChange(tab.id); }
                                    }}
                                >
                                    {Icon && <Icon aria-hidden="true" style={{ width: 14, height: 14 }} />}
                                    <span className="eui-dl-content-tab-label">{tab.label}</span>
                                    {tab.closable !== false && onContentTabClose && (
                                        <button
                                            className="eui-dl-content-tab-close"
                                            onClick={(e) => { e.stopPropagation(); handleContentTabClose(tab.id); }}
                                            aria-label={`Close ${tab.label}`}
                                            tabIndex={-1}
                                        >
                                            <TimesIcon aria-hidden="true" style={{ width: 10, height: 10 }} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="eui-dl-content" id="eui-dl-main-content">
                    {enableContentTabs && contentTabs && contentTabs.length > 0
                        ? contentTabs.find((t) => t.id === activeContentTabId)?.content ?? children
                        : children}
                </div>

                {/* Bottom resize handle */}
                {bottomPinnedOpen && activeBottomId &&
                    (panelConfigs.find((c) => c.id === activeBottomId)?.userCanResize !== false) && (
                    <div
                        className={classNames('eui-dl-resize-handle', 'eui-dl-rh-top', {
                            dragging: resizingPanelId === activeBottomId,
                        })}
                        onMouseDown={(e) => startResize(e, activeBottomId, 'vertical')}
                        role="separator"
                        aria-orientation="horizontal"
                        aria-label="Resize bottom panel"
                        tabIndex={0}
                    />
                )}

                {/* Bottom panel */}
                {bottomPanels.length > 0 && (
                    <>
                        {bottomPinnedOpen && renderPanel(activeBottomId, 'bottom', false)}
                        {bottomAutoHideOpen && renderPanel(
                            activeBottomId,
                            'bottom',
                            true,
                            getAutoHideOverlayStyle('bottom'),
                        )}
                        {renderActivityBar(bottomPanels, 'bottom', activeBottomId)}
                    </>
                )}
            </div>

            {/* Right side */}
            {rightPanels.length > 0 && (
                <div className="eui-dl-side eui-dl-side-right">
                    {rightPinnedOpen && renderPanel(activeRightId, 'right', false)}
                    {rightAutoHideOpen && renderPanel(
                        activeRightId,
                        'right',
                        true,
                        getAutoHideOverlayStyle('right'),
                    )}
                    {renderActivityBar(rightPanels, 'right', activeRightId)}
                </div>
            )}

            {/* Floating panels */}
            {floatPanels.map(({ config, runtime }) => {
                const actions = getPanelDockActions(config.id);
                const fp: FloatPos = runtime.floatPos;
                return (
                    <div
                        key={config.id}
                        className="eui-dl-float"
                        style={{ left: fp.x, top: fp.y, width: fp.width, height: fp.height }}
                        role="dialog"
                        aria-label={config.title}
                    >
                        <div
                            className="eui-dl-panel-header"
                            onMouseDown={(e) => actions?.canMove && startFloatMove(e, config.id)}
                            style={{ cursor: actions?.canMove ? 'move' : 'default' }}
                        >
                            <span className="eui-dl-panel-title">{config.title}</span>
                            <div className="eui-dl-panel-actions">
                                {actions?.canMove && (
                                    <>
                                        <button
                                            className="eui-dl-panel-action-btn"
                                            onClick={() => movePanel(config.id, 'left')}
                                            title="Dock left"
                                            aria-label="Dock left"
                                        >
                                            <PanelLeftIcon aria-hidden="true" />
                                        </button>
                                        <button
                                            className="eui-dl-panel-action-btn"
                                            onClick={() => movePanel(config.id, 'right')}
                                            title="Dock right"
                                            aria-label="Dock right"
                                        >
                                            <PanelRightIcon aria-hidden="true" />
                                        </button>
                                        <button
                                            className="eui-dl-panel-action-btn"
                                            onClick={() => movePanel(config.id, 'bottom')}
                                            title="Dock bottom"
                                            aria-label="Dock bottom"
                                        >
                                            <PanelBottomIcon aria-hidden="true" />
                                        </button>
                                    </>
                                )}
                                {actions?.canClose && (
                                    <button
                                        className="eui-dl-panel-action-btn"
                                        onClick={() => closePanel(config.id)}
                                        title="Close"
                                        aria-label="Close panel"
                                    >
                                        <TimesIcon aria-hidden="true" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="eui-dl-panel-body">{config.children}</div>
                        {actions?.canResize && (
                            <>
                                <div className="eui-dl-float-rh-e" onMouseDown={(e) => startFloatResize(e, config.id, 'e')} aria-hidden="true" />
                                <div className="eui-dl-float-rh-w" onMouseDown={(e) => startFloatResize(e, config.id, 'w')} aria-hidden="true" />
                                <div className="eui-dl-float-rh-s" onMouseDown={(e) => startFloatResize(e, config.id, 's')} aria-hidden="true" />
                                <div className="eui-dl-float-rh-se" onMouseDown={(e) => startFloatResize(e, config.id, 'se')} aria-hidden="true" />
                                <div className="eui-dl-float-rh-sw" onMouseDown={(e) => startFloatResize(e, config.id, 'sw')} aria-hidden="true" />
                            </>
                        )}
                    </div>
                );
            })}

            {/* Drag-to-dock overlay */}
            {dragState && renderDropZones()}

            {resizeState && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 300,
                        cursor: resizeState.axis === 'horizontal' ? 'col-resize' : 'row-resize',
                    }}
                    aria-hidden="true"
                />
            )}
        </div>
    );
};

DockedLayout.displayName = 'DockedLayout';
