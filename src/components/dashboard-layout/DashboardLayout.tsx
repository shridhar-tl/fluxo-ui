import classNames from 'classnames';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    EditIcon,
    EyeIcon,
    PlusIcon,
    RefreshIcon,
    SettingsIcon,
    TimesIcon,
} from '../../assets/icons';
import { Resizable } from '../resizable';
import '../eui-base.scss';
import './dashboard-layout.scss';
import type {
    DashboardBreakpoint,
    DashboardLayoutChangePayload,
    DashboardLayoutLocale,
    DashboardLayoutPreset,
    DashboardLayoutProps,
    DashboardLayoutState,
    DashboardLayouts,
    DashboardWidget,
    WidgetLayout,
    WidgetSettingsContext,
} from './dashboard-layout-types';
import { defaultBreakpoints } from './dashboard-layout-types';
import {
    addWidgetToLayout,
    compactLayoutVertical,
    ensureLayoutForBreakpoint,
    loadLayoutsFromStorage,
    moveWidget,
    persistLayoutsToStorage,
    resizeWidget,
    resolveActiveBreakpoint,
} from './dashboard-layout-utils';

const COLLAPSED_HEADER_PX = 36;

const defaultLocale: DashboardLayoutLocale = {
    editLayout: 'Edit layout',
    doneEditing: 'Done',
    addWidget: 'Add widget',
    resetLayout: 'Reset layout',
    presets: 'Presets',
    savePreset: 'Save current as preset',
    noPresets: 'No presets available',
    hiddenWidgets: 'Hidden widgets',
    showWidget: 'Show widget',
    hideWidget: 'Hide widget',
    removeWidget: 'Remove widget',
    collapse: 'Collapse',
    expand: 'Expand',
    maximize: 'Maximize',
    restore: 'Restore',
    refresh: 'Refresh',
    settings: 'Widget settings',
    closeSettings: 'Close settings',
    dragHandle: 'Drag to move widget',
    emptyDashboard: 'No widgets to display',
    addWidgetPrompt: 'Add a widget to get started',
    addAll: 'Show all',
    lastUpdated: 'Updated',
};

interface DragState {
    widgetId: string;
    startPointerX: number;
    startPointerY: number;
    startX: number;
    startY: number;
    pointerType: 'mouse' | 'touch';
}

function buildInitialState(
    widgets: DashboardWidget[],
    defaultLayouts: DashboardLayouts | undefined,
    layouts: DashboardLayouts | undefined,
    breakpoints: DashboardBreakpoint[],
    persistKey?: string,
): DashboardLayoutState {
    const initialLayouts = layouts ?? defaultLayouts ?? {};
    let stored: DashboardLayoutState | null = null;
    if (persistKey && !layouts) {
        stored = loadLayoutsFromStorage<DashboardLayoutState>(persistKey);
    }

    const finalLayouts: DashboardLayouts = stored?.layouts ?? initialLayouts;
    const hiddenIds = stored?.hiddenIds ?? widgets.filter((w) => w.hidden).map((w) => w.id);
    const collapsedIds = stored?.collapsedIds ?? widgets.filter((w) => w.defaultCollapsed).map((w) => w.id);

    const widgetIds = new Set(widgets.map((w) => w.id));
    const cleaned: DashboardLayouts = {};
    Object.entries(finalLayouts).forEach(([bpKey, items]) => {
        cleaned[bpKey] = (items ?? []).filter((l) => widgetIds.has(l.id) && !hiddenIds.includes(l.id));
    });

    breakpoints.forEach((bp) => {
        const visibleWidgets = widgets.filter((w) => !hiddenIds.includes(w.id));
        cleaned[bp.key] = ensureLayoutForBreakpoint(cleaned, bp, visibleWidgets, breakpoints);
    });

    return {
        layouts: cleaned,
        hiddenIds,
        collapsedIds,
        maximizedId: stored?.maximizedId ?? null,
        activePresetId: stored?.activePresetId ?? null,
    };
}

function getWidget(widgets: DashboardWidget[], id: string): DashboardWidget | undefined {
    return widgets.find((w) => w.id === id);
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    widgets,
    layouts: controlledLayouts,
    defaultLayouts,
    onLayoutChange,
    breakpoints = defaultBreakpoints,
    rowHeight = 64,
    margin = [12, 12],
    containerPadding = [12, 12],
    minWidgetWidth = 1,
    minWidgetHeight = 1,
    editMode: controlledEditMode,
    defaultEditMode = false,
    onEditModeChange,
    persistKey,
    presets,
    onPresetChange,
    showToolbar = true,
    toolbarTitle,
    toolbarSlotStart,
    toolbarSlotEnd,
    addWidgetLabel,
    compactType = 'vertical',
    allowOverlap = false,
    emptyState,
    locale: localeOverrides,
    className,
    style,
    widgetClassName,
}) => {
    const locale = useMemo(() => ({ ...defaultLocale, ...(localeOverrides ?? {}) }), [localeOverrides]);
    const containerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const [containerWidth, setContainerWidth] = useState<number>(1024);
    const [state, setState] = useState<DashboardLayoutState>(() =>
        buildInitialState(widgets, defaultLayouts, controlledLayouts, breakpoints, persistKey),
    );
    const stateRef = useRef(state);
    stateRef.current = state;

    const [internalEditMode, setInternalEditMode] = useState<boolean>(defaultEditMode);
    const editing = controlledEditMode ?? internalEditMode;

    const [dragState, setDragState] = useState<DragState | null>(null);
    const lastCommittedDragPosRef = useRef<{ x: number; y: number } | null>(null);

    const [addPanelOpen, setAddPanelOpen] = useState<boolean>(false);
    const [presetsOpen, setPresetsOpen] = useState<boolean>(false);
    const [openSettingsFor, setOpenSettingsFor] = useState<string | null>(null);
    const [settingsAnchor, setSettingsAnchor] = useState<{ x: number; y: number } | null>(null);
    const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());

    const isControlledLayouts = controlledLayouts !== undefined;
    const layouts = isControlledLayouts ? controlledLayouts ?? {} : state.layouts;

    const activeBreakpoint = useMemo(
        () => resolveActiveBreakpoint(containerWidth, breakpoints),
        [containerWidth, breakpoints],
    );

    const visibleWidgets = useMemo(
        () => widgets.filter((w) => !state.hiddenIds.includes(w.id)),
        [widgets, state.hiddenIds],
    );
    const hiddenWidgets = useMemo(
        () => widgets.filter((w) => state.hiddenIds.includes(w.id)),
        [widgets, state.hiddenIds],
    );

    const currentLayout: WidgetLayout[] = useMemo(() => {
        const fromLayouts = layouts[activeBreakpoint.key];
        if (fromLayouts && fromLayouts.length) return fromLayouts;
        return ensureLayoutForBreakpoint(layouts, activeBreakpoint, visibleWidgets, breakpoints);
    }, [layouts, activeBreakpoint, visibleWidgets, breakpoints]);

    const collapsedRowSpan = useMemo(
        () => Math.max(1, Math.ceil(COLLAPSED_HEADER_PX / rowHeight)),
        [rowHeight],
    );

    const displayLayout: WidgetLayout[] = useMemo(() => {
        if (compactType !== 'vertical' || state.collapsedIds.length === 0) return currentLayout;
        const shrunk = currentLayout.map((item) =>
            state.collapsedIds.includes(item.id) && item.h > collapsedRowSpan
                ? { ...item, h: collapsedRowSpan }
                : item,
        );
        return compactLayoutVertical(shrunk);
    }, [currentLayout, state.collapsedIds, collapsedRowSpan, compactType]);

    const columnWidth = useMemo(() => {
        const innerWidth = Math.max(0, containerWidth - containerPadding[0] * 2);
        const totalMargin = (activeBreakpoint.columns - 1) * margin[0];
        return Math.max(0, (innerWidth - totalMargin) / activeBreakpoint.columns);
    }, [containerWidth, containerPadding, activeBreakpoint.columns, margin]);

    const gridHeight = useMemo(() => {
        if (!displayLayout.length) return 0;
        const maxY = displayLayout.reduce((max, l) => Math.max(max, l.y + l.h), 0);
        return maxY * rowHeight + (maxY - 1) * margin[1] + containerPadding[1] * 2;
    }, [displayLayout, rowHeight, margin, containerPadding]);

    useLayoutEffect(() => {
        const node = containerRef.current;
        if (!node) return;
        const apply = () => {
            const rect = node.getBoundingClientRect();
            if (rect.width > 0) setContainerWidth(rect.width);
        };
        apply();
        const observer = new ResizeObserver(apply);
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const commitState = useCallback(
        (nextState: DashboardLayoutState, payload: Omit<DashboardLayoutChangePayload, 'state'>) => {
            if (!isControlledLayouts) setState(nextState);
            stateRef.current = nextState;
            if (persistKey) persistLayoutsToStorage(persistKey, nextState);
            onLayoutChange?.({ ...payload, state: nextState });
        },
        [isControlledLayouts, onLayoutChange, persistKey],
    );

    const setEditMode = useCallback(
        (next: boolean) => {
            if (controlledEditMode === undefined) setInternalEditMode(next);
            onEditModeChange?.(next);
            if (!next) {
                setOpenSettingsFor(null);
                setAddPanelOpen(false);
                setPresetsOpen(false);
            }
        },
        [controlledEditMode, onEditModeChange],
    );

    const computePositionStyle = useCallback(
        (item: WidgetLayout): React.CSSProperties => {
            const x = containerPadding[0] + item.x * (columnWidth + margin[0]);
            const y = containerPadding[1] + item.y * (rowHeight + margin[1]);
            const w = item.w * columnWidth + (item.w - 1) * margin[0];
            const h = item.h * rowHeight + (item.h - 1) * margin[1];
            return {
                position: 'absolute',
                transform: `translate(${x}px, ${y}px)`,
                width: w,
                height: h,
            };
        },
        [columnWidth, margin, rowHeight, containerPadding],
    );

    // ── Drag handling ─────────────────────────────────────────────────────────
    const onDragHandlePointerDown = useCallback(
        (widgetId: string, clientX: number, clientY: number, pointerType: 'mouse' | 'touch') => {
            if (!editing) return;
            const widget = getWidget(widgets, widgetId);
            if (widget?.canDrag === false) return;
            const layoutItem = stateRef.current.layouts[activeBreakpoint.key]?.find((l) => l.id === widgetId);
            if (!layoutItem || layoutItem.static) return;
            setDragState({
                widgetId,
                startPointerX: clientX,
                startPointerY: clientY,
                startX: layoutItem.x,
                startY: layoutItem.y,
                pointerType,
            });
            lastCommittedDragPosRef.current = { x: layoutItem.x, y: layoutItem.y };
        },
        [activeBreakpoint.key, editing, widgets],
    );

    useEffect(() => {
        if (!dragState) return;
        const cellW = columnWidth + margin[0];
        const cellH = rowHeight + margin[1];
        const ds = dragState;

        const computeTargetCell = (clientX: number, clientY: number): { x: number; y: number } => {
            const deltaX = clientX - ds.startPointerX;
            const deltaY = clientY - ds.startPointerY;
            const rawX = ds.startX + deltaX / cellW;
            const rawY = ds.startY + deltaY / cellH;
            const item = stateRef.current.layouts[activeBreakpoint.key]?.find((l) => l.id === ds.widgetId);
            const widgetW = item?.w ?? 1;
            return {
                x: Math.max(0, Math.min(activeBreakpoint.columns - widgetW, Math.round(rawX))),
                y: Math.max(0, Math.round(rawY)),
            };
        };

        const handleMove = (clientX: number, clientY: number) => {
            const target = computeTargetCell(clientX, clientY);
            const last = lastCommittedDragPosRef.current;
            if (last && last.x === target.x && last.y === target.y) return;
            lastCommittedDragPosRef.current = target;

            const current = stateRef.current.layouts[activeBreakpoint.key] ?? [];
            const next = moveWidget(
                current,
                ds.widgetId,
                target.x,
                target.y,
                activeBreakpoint.columns,
                allowOverlap,
            );
            commitState(
                {
                    ...stateRef.current,
                    layouts: { ...stateRef.current.layouts, [activeBreakpoint.key]: next },
                },
                { reason: 'drag' },
            );
        };

        const handleEnd = () => {
            setDragState(null);
            lastCommittedDragPosRef.current = null;
        };

        if (ds.pointerType === 'touch') {
            const onTouchMove = (e: TouchEvent) => {
                if (!e.touches.length) return;
                e.preventDefault();
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
            };
            const onTouchEnd = () => {
                document.removeEventListener('touchmove', onTouchMove);
                document.removeEventListener('touchend', onTouchEnd);
                document.removeEventListener('touchcancel', onTouchEnd);
                handleEnd();
            };
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onTouchEnd);
            document.addEventListener('touchcancel', onTouchEnd);
            return () => {
                document.removeEventListener('touchmove', onTouchMove);
                document.removeEventListener('touchend', onTouchEnd);
                document.removeEventListener('touchcancel', onTouchEnd);
            };
        }
        const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            handleEnd();
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [dragState, columnWidth, rowHeight, margin, activeBreakpoint.key, activeBreakpoint.columns, allowOverlap, commitState]);

    // ── Resize via Resizable ──────────────────────────────────────────────────
    const handleResizeEnd = useCallback(
        (widgetId: string, size: { width: number; height: number }) => {
            const cellW = columnWidth + margin[0];
            const cellH = rowHeight + margin[1];
            const newW = Math.max(minWidgetWidth, Math.round((size.width + margin[0]) / cellW));
            const newH = Math.max(minWidgetHeight, Math.round((size.height + margin[1]) / cellH));
            const current = stateRef.current.layouts[activeBreakpoint.key] ?? [];
            const next = resizeWidget(current, widgetId, newW, newH, activeBreakpoint.columns, allowOverlap);
            commitState(
                {
                    ...stateRef.current,
                    layouts: { ...stateRef.current.layouts, [activeBreakpoint.key]: next },
                },
                { reason: 'resize' },
            );
        },
        [activeBreakpoint.columns, activeBreakpoint.key, allowOverlap, columnWidth, commitState, margin, minWidgetHeight, minWidgetWidth, rowHeight],
    );

    // ── Keyboard rearrangement ────────────────────────────────────────────────
    const handleWidgetKeyDown = useCallback(
        (e: React.KeyboardEvent, widgetId: string) => {
            if (!editing) return;
            const layout = stateRef.current.layouts[activeBreakpoint.key];
            const item = layout?.find((l) => l.id === widgetId);
            if (!item || item.static) return;
            const widget = getWidget(widgets, widgetId);
            if (widget?.canDrag === false) return;

            let dx = 0;
            let dy = 0;
            if (e.key === 'ArrowLeft') dx = -1;
            else if (e.key === 'ArrowRight') dx = 1;
            else if (e.key === 'ArrowUp') dy = -1;
            else if (e.key === 'ArrowDown') dy = 1;
            else return;

            e.preventDefault();
            const next = moveWidget(
                layout ?? [],
                widgetId,
                item.x + dx,
                item.y + dy,
                activeBreakpoint.columns,
                allowOverlap,
            );
            commitState(
                {
                    ...stateRef.current,
                    layouts: { ...stateRef.current.layouts, [activeBreakpoint.key]: next },
                },
                { reason: 'drag' },
            );
        },
        [editing, activeBreakpoint.key, activeBreakpoint.columns, widgets, allowOverlap, commitState],
    );

    // ── Widget actions ────────────────────────────────────────────────────────
    const hideWidget = useCallback(
        (widgetId: string) => {
            const nextHidden = [...stateRef.current.hiddenIds, widgetId];
            const nextLayouts: DashboardLayouts = {};
            Object.entries(stateRef.current.layouts).forEach(([bp, items]) => {
                nextLayouts[bp] = compactLayoutVertical((items ?? []).filter((l) => l.id !== widgetId));
            });
            commitState(
                {
                    ...stateRef.current,
                    hiddenIds: nextHidden,
                    layouts: nextLayouts,
                    maximizedId: stateRef.current.maximizedId === widgetId ? null : stateRef.current.maximizedId,
                },
                { reason: 'remove' },
            );
        },
        [commitState],
    );

    const showWidget = useCallback(
        (widgetId: string) => {
            const widget = getWidget(widgets, widgetId);
            if (!widget) return;
            const nextHidden = stateRef.current.hiddenIds.filter((id) => id !== widgetId);
            const nextLayouts: DashboardLayouts = {};
            breakpoints.forEach((bp) => {
                const layout = stateRef.current.layouts[bp.key] ?? [];
                nextLayouts[bp.key] = addWidgetToLayout(layout, widget, bp.columns);
            });
            commitState({ ...stateRef.current, hiddenIds: nextHidden, layouts: nextLayouts }, { reason: 'add' });
        },
        [breakpoints, commitState, widgets],
    );

    const toggleCollapse = useCallback(
        (widgetId: string) => {
            const isCollapsed = stateRef.current.collapsedIds.includes(widgetId);
            const next = isCollapsed
                ? stateRef.current.collapsedIds.filter((id) => id !== widgetId)
                : [...stateRef.current.collapsedIds, widgetId];
            commitState(
                { ...stateRef.current, collapsedIds: next },
                { reason: isCollapsed ? 'expand' : 'collapse' },
            );
        },
        [commitState],
    );

    const toggleMaximize = useCallback(
        (widgetId: string) => {
            const isMax = stateRef.current.maximizedId === widgetId;
            commitState(
                { ...stateRef.current, maximizedId: isMax ? null : widgetId },
                { reason: isMax ? 'restore' : 'maximize' },
            );
        },
        [commitState],
    );

    const resetLayout = useCallback(() => {
        const fresh = buildInitialState(widgets, defaultLayouts, undefined, breakpoints, undefined);
        commitState(fresh, { reason: 'reset' });
    }, [breakpoints, commitState, defaultLayouts, widgets]);

    const applyPreset = useCallback(
        (preset: DashboardLayoutPreset) => {
            const cleanedLayouts: DashboardLayouts = {};
            const hiddenIds = preset.hiddenIds ?? [];
            breakpoints.forEach((bp) => {
                const visible = widgets.filter((w) => !hiddenIds.includes(w.id));
                cleanedLayouts[bp.key] = ensureLayoutForBreakpoint(preset.layouts, bp, visible, breakpoints);
            });
            commitState(
                {
                    layouts: cleanedLayouts,
                    hiddenIds,
                    collapsedIds: stateRef.current.collapsedIds,
                    maximizedId: null,
                    activePresetId: preset.id,
                },
                { reason: 'preset' },
            );
            onPresetChange?.(preset);
            setPresetsOpen(false);
        },
        [breakpoints, commitState, onPresetChange, widgets],
    );

    const handleRefresh = useCallback(
        async (widget: DashboardWidget) => {
            if (!widget.onRefresh) return;
            setRefreshingIds((prev) => {
                const next = new Set(prev);
                next.add(widget.id);
                return next;
            });
            try {
                await widget.onRefresh();
            } finally {
                setRefreshingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(widget.id);
                    return next;
                });
            }
        },
        [],
    );

    const openSettings = useCallback((widgetId: string, target: HTMLElement) => {
        const rect = target.getBoundingClientRect();
        setSettingsAnchor({
            x: rect.right + window.scrollX,
            y: rect.bottom + window.scrollY,
        });
        setOpenSettingsFor(widgetId);
    }, []);

    useEffect(() => {
        if (!openSettingsFor) return;
        const onScroll = () => {
            const trigger = document.querySelector(
                `[data-eui-widget-id="${openSettingsFor}"] [data-eui-settings-trigger]`,
            );
            if (trigger instanceof HTMLElement) {
                const rect = trigger.getBoundingClientRect();
                setSettingsAnchor({ x: rect.right + window.scrollX, y: rect.bottom + window.scrollY });
            }
        };
        const onResize = () => onScroll();
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpenSettingsFor(null);
        };
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onResize);
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [openSettingsFor]);

    const settingsContext = useMemo<WidgetSettingsContext | null>(() => {
        if (!openSettingsFor) return null;
        return {
            widgetId: openSettingsFor,
            closeSettings: () => setOpenSettingsFor(null),
        };
    }, [openSettingsFor]);

    const renderWidget = useCallback(
        (widget: DashboardWidget, item: WidgetLayout) => {
            const isCollapsed = state.collapsedIds.includes(widget.id);
            const isMaximized = state.maximizedId === widget.id;
            const isRefreshing = refreshingIds.has(widget.id) || widget.loading;
            const isDragging = dragState?.widgetId === widget.id;
            const isOpenSettings = openSettingsFor === widget.id;
            const chrome = widget.chrome ?? 'card';
            const canDrag = widget.canDrag !== false && !item.static;
            const canResize = widget.canResize !== false && !item.static;
            const canRemove = widget.canRemove !== false;
            const canCollapse = widget.canCollapse !== false;
            const canMaximize = widget.canMaximize !== false;
            const Icon = widget.icon;

            const headerBar = (
                <div
                    className={classNames('eui-dashboard-widget-header', {
                        'eui-dashboard-widget-header-draggable': canDrag && editing,
                    })}
                    onMouseDown={(e) => {
                        if ((e.target as HTMLElement).closest('.eui-dashboard-widget-action')) return;
                        if (!canDrag) return;
                        onDragHandlePointerDown(widget.id, e.clientX, e.clientY, 'mouse');
                    }}
                    onTouchStart={(e) => {
                        if ((e.target as HTMLElement).closest('.eui-dashboard-widget-action')) return;
                        if (!canDrag || e.touches.length === 0) return;
                        const t = e.touches[0];
                        onDragHandlePointerDown(widget.id, t.clientX, t.clientY, 'touch');
                    }}
                    role={canDrag && editing ? 'button' : undefined}
                    aria-label={canDrag && editing ? locale.dragHandle : undefined}
                    tabIndex={canDrag && editing ? 0 : -1}
                    onKeyDown={(e) => handleWidgetKeyDown(e, widget.id)}
                >
                    <div className="eui-dashboard-widget-title">
                        {Icon && <Icon className="eui-dashboard-widget-icon" aria-hidden="true" width={14} height={14} />}
                        <span className="eui-dashboard-widget-title-text">{widget.title}</span>
                        {widget.badge && <span className="eui-dashboard-widget-badge">{widget.badge}</span>}
                    </div>
                    <div className="eui-dashboard-widget-actions" onMouseDown={(e) => e.stopPropagation()}>
                        {widget.headerActions}
                        {widget.onRefresh && (
                            <button
                                type="button"
                                className={classNames('eui-dashboard-widget-action', {
                                    'eui-dashboard-widget-action-spinning': isRefreshing,
                                })}
                                onClick={() => handleRefresh(widget)}
                                aria-label={locale.refresh}
                                title={locale.refresh}
                            >
                                <RefreshIcon aria-hidden="true" width={14} height={14} />
                            </button>
                        )}
                        {widget.renderSettings && (
                            <button
                                type="button"
                                className="eui-dashboard-widget-action"
                                data-eui-settings-trigger
                                aria-label={locale.settings}
                                aria-haspopup="dialog"
                                aria-expanded={isOpenSettings}
                                title={locale.settings}
                                onClick={(e) => {
                                    if (isOpenSettings) {
                                        setOpenSettingsFor(null);
                                    } else {
                                        openSettings(widget.id, e.currentTarget);
                                    }
                                }}
                            >
                                <SettingsIcon aria-hidden="true" width={14} height={14} />
                            </button>
                        )}
                        {canCollapse && (
                            <button
                                type="button"
                                className="eui-dashboard-widget-action"
                                onClick={() => toggleCollapse(widget.id)}
                                aria-label={isCollapsed ? locale.expand : locale.collapse}
                                aria-pressed={isCollapsed}
                                title={isCollapsed ? locale.expand : locale.collapse}
                            >
                                {isCollapsed ? (
                                    <ChevronDownIcon aria-hidden="true" width={14} height={14} />
                                ) : (
                                    <ChevronUpIcon aria-hidden="true" width={14} height={14} />
                                )}
                            </button>
                        )}
                        {canMaximize && (
                            <button
                                type="button"
                                className="eui-dashboard-widget-action"
                                onClick={() => toggleMaximize(widget.id)}
                                aria-label={isMaximized ? locale.restore : locale.maximize}
                                aria-pressed={isMaximized}
                                title={isMaximized ? locale.restore : locale.maximize}
                            >
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 16 16"
                                    width={14}
                                    height={14}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    {isMaximized ? (
                                        <path d="M5 5h6v6H5z" />
                                    ) : (
                                        <path d="M3 3h4M3 3v4M13 13h-4M13 13v-4M3 13h4M3 13v-4M13 3h-4M13 3v4" />
                                    )}
                                </svg>
                            </button>
                        )}
                        {editing && canRemove && (
                            <button
                                type="button"
                                className="eui-dashboard-widget-action eui-dashboard-widget-action-remove"
                                onClick={() => hideWidget(widget.id)}
                                aria-label={locale.removeWidget}
                                title={locale.removeWidget}
                            >
                                <TimesIcon aria-hidden="true" width={14} height={14} />
                            </button>
                        )}
                    </div>
                </div>
            );

            const body = (
                <div
                    className={classNames('eui-dashboard-widget-body', {
                        'eui-dashboard-widget-body-collapsed': isCollapsed,
                    })}
                >
                    {widget.error ? (
                        <div className="eui-dashboard-widget-error" role="alert">
                            {widget.error}
                        </div>
                    ) : (
                        widget.children
                    )}
                    {isRefreshing && (
                        <div className="eui-dashboard-widget-loading" aria-hidden="true">
                            <div className="eui-dashboard-widget-spinner" />
                        </div>
                    )}
                </div>
            );

            const footer = widget.lastUpdated ? (
                <div className="eui-dashboard-widget-footer">
                    <span>
                        {locale.lastUpdated}: {formatLastUpdated(widget.lastUpdated)}
                    </span>
                </div>
            ) : null;

            const positionStyle = isMaximized
                ? ({
                    position: 'absolute',
                    transform: `translate(${containerPadding[0]}px, ${containerPadding[1]}px)`,
                    width: containerWidth - containerPadding[0] * 2,
                    height: Math.max(rowHeight * 6, gridHeight - containerPadding[1] * 2),
                } as React.CSSProperties)
                : computePositionStyle(item);

            const innerContent = (
                <>
                    {headerBar}
                    {body}
                    {footer}
                </>
            );

            const widgetClass = classNames(
                'eui-dashboard-widget',
                `eui-dashboard-widget-chrome-${chrome}`,
                {
                    'eui-dashboard-widget-editing': editing,
                    'eui-dashboard-widget-collapsed': isCollapsed,
                    'eui-dashboard-widget-maximized': isMaximized,
                    'eui-dashboard-widget-dragging': isDragging,
                    'eui-dashboard-widget-static': item.static,
                },
                widgetClassName,
            );

            const canResizeNow = canResize && editing && !isMaximized && !isCollapsed;

            return (
                <div
                    key={widget.id}
                    className="eui-dashboard-widget-slot"
                    style={positionStyle}
                    data-eui-widget-id={widget.id}
                >
                    {canResizeNow ? (
                        <Resizable
                            defaultWidth={Math.max(1, (positionStyle.width as number) ?? 1)}
                            defaultHeight={Math.max(1, (positionStyle.height as number) ?? 1)}
                            width={positionStyle.width as number}
                            height={positionStyle.height as number}
                            minWidth={(item.minW ?? minWidgetWidth) * columnWidth}
                            minHeight={(item.minH ?? minWidgetHeight) * rowHeight}
                            handles={['e', 's', 'se']}
                            handleSize={10}
                            showHandles="hover"
                            ariaLabel={widget.title}
                            onResizeEnd={(e) => handleResizeEnd(widget.id, e.size)}
                            className={widgetClass}
                        >
                            {innerContent}
                        </Resizable>
                    ) : (
                        <div className={widgetClass} style={{ width: '100%', height: '100%' }}>
                            {innerContent}
                        </div>
                    )}
                </div>
            );
        },
        [
            state.collapsedIds,
            state.maximizedId,
            refreshingIds,
            dragState,
            openSettingsFor,
            editing,
            widgetClassName,
            minWidgetWidth,
            minWidgetHeight,
            columnWidth,
            rowHeight,
            containerWidth,
            containerPadding,
            gridHeight,
            computePositionStyle,
            handleResizeEnd,
            handleRefresh,
            handleWidgetKeyDown,
            hideWidget,
            locale,
            onDragHandlePointerDown,
            openSettings,
            toggleCollapse,
            toggleMaximize,
        ],
    );

    const renderToolbar = () => {
        if (!showToolbar) return null;
        return (
            <div className="eui-dashboard-toolbar" role="toolbar" aria-label="Dashboard toolbar">
                <div className="eui-dashboard-toolbar-start">
                    {toolbarTitle && <h3 className="eui-dashboard-toolbar-title">{toolbarTitle}</h3>}
                    {toolbarSlotStart}
                </div>
                <div className="eui-dashboard-toolbar-end">
                    {toolbarSlotEnd}
                    {presets && presets.length > 0 && (
                        <div className="eui-dashboard-presets-wrapper">
                            <button
                                type="button"
                                className="eui-dashboard-toolbar-btn"
                                aria-haspopup="menu"
                                aria-expanded={presetsOpen}
                                onClick={() => setPresetsOpen((v) => !v)}
                            >
                                {locale.presets}
                                <ChevronDownIcon aria-hidden="true" width={12} height={12} />
                            </button>
                            {presetsOpen && (
                                <div className="eui-dashboard-presets-menu" role="menu">
                                    {presets.map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            role="menuitem"
                                            className={classNames('eui-dashboard-presets-item', {
                                                active: state.activePresetId === p.id,
                                            })}
                                            onClick={() => applyPreset(p)}
                                        >
                                            <div className="eui-dashboard-presets-item-name">{p.name}</div>
                                            {p.description && (
                                                <div className="eui-dashboard-presets-item-desc">{p.description}</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {editing && (
                        <button
                            type="button"
                            className="eui-dashboard-toolbar-btn"
                            onClick={() => setAddPanelOpen(true)}
                            disabled={hiddenWidgets.length === 0}
                        >
                            <PlusIcon aria-hidden="true" width={12} height={12} />
                            {addWidgetLabel ?? locale.addWidget}
                            {hiddenWidgets.length > 0 && (
                                <span className="eui-dashboard-toolbar-count">{hiddenWidgets.length}</span>
                            )}
                        </button>
                    )}
                    {editing && (
                        <button
                            type="button"
                            className="eui-dashboard-toolbar-btn"
                            onClick={resetLayout}
                            title={locale.resetLayout}
                        >
                            {locale.resetLayout}
                        </button>
                    )}
                    <button
                        type="button"
                        className={classNames('eui-dashboard-toolbar-btn eui-dashboard-toolbar-btn-primary', {
                            'eui-dashboard-toolbar-btn-active': editing,
                        })}
                        onClick={() => setEditMode(!editing)}
                        aria-pressed={editing}
                    >
                        <EditIcon aria-hidden="true" width={12} height={12} />
                        {editing ? locale.doneEditing : locale.editLayout}
                    </button>
                </div>
            </div>
        );
    };

    const renderAddPanel = () => {
        if (!addPanelOpen) return null;
        return ReactDOM.createPortal(
            <div className="eui-dashboard-add-panel-overlay" role="dialog" aria-modal="true" aria-label={locale.hiddenWidgets}>
                <div className="eui-dashboard-add-panel-backdrop" onClick={() => setAddPanelOpen(false)} aria-hidden="true" />
                <div className="eui-dashboard-add-panel">
                    <div className="eui-dashboard-add-panel-header">
                        <h4>{locale.hiddenWidgets}</h4>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {hiddenWidgets.length > 1 && (
                                <button
                                    type="button"
                                    className="eui-dashboard-toolbar-btn"
                                    onClick={() => {
                                        hiddenWidgets.forEach((w) => showWidget(w.id));
                                        setAddPanelOpen(false);
                                    }}
                                >
                                    {locale.addAll}
                                </button>
                            )}
                            <button
                                type="button"
                                className="eui-dashboard-add-panel-close"
                                onClick={() => setAddPanelOpen(false)}
                                aria-label={locale.closeSettings}
                            >
                                <TimesIcon aria-hidden="true" width={14} height={14} />
                            </button>
                        </div>
                    </div>
                    <div className="eui-dashboard-add-panel-body">
                        {hiddenWidgets.length === 0 ? (
                            <p className="eui-dashboard-add-panel-empty">{locale.addWidgetPrompt}</p>
                        ) : (
                            <ul className="eui-dashboard-add-panel-list">
                                {hiddenWidgets.map((w) => {
                                    const Icon = w.icon;
                                    return (
                                        <li key={w.id} className="eui-dashboard-add-panel-item">
                                            <div className="eui-dashboard-add-panel-item-info">
                                                {Icon && (
                                                    <Icon
                                                        aria-hidden="true"
                                                        width={16}
                                                        height={16}
                                                        className="eui-dashboard-add-panel-item-icon"
                                                    />
                                                )}
                                                <div>
                                                    <div className="eui-dashboard-add-panel-item-title">{w.title}</div>
                                                    {w.description && (
                                                        <div className="eui-dashboard-add-panel-item-desc">{w.description}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="eui-dashboard-toolbar-btn"
                                                onClick={() => showWidget(w.id)}
                                            >
                                                <EyeIcon aria-hidden="true" width={14} height={14} />
                                                {locale.showWidget}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>,
            document.body,
        );
    };

    const renderSettingsPopover = () => {
        if (!openSettingsFor || !settingsAnchor || !settingsContext) return null;
        const widget = getWidget(widgets, openSettingsFor);
        if (!widget || !widget.renderSettings) return null;
        return ReactDOM.createPortal(
            <div
                className="eui-dashboard-settings-popover"
                role="dialog"
                aria-modal="false"
                aria-label={`${widget.title} ${locale.settings}`}
                style={{ top: settingsAnchor.y + 4, left: Math.max(8, settingsAnchor.x - 280) }}
            >
                <div className="eui-dashboard-settings-popover-header">
                    <span>{widget.title}</span>
                    <button
                        type="button"
                        className="eui-dashboard-widget-action"
                        onClick={() => setOpenSettingsFor(null)}
                        aria-label={locale.closeSettings}
                    >
                        <TimesIcon aria-hidden="true" width={14} height={14} />
                    </button>
                </div>
                <div className="eui-dashboard-settings-popover-body">{widget.renderSettings(settingsContext)}</div>
            </div>,
            document.body,
        );
    };

    const maximizedWidget = state.maximizedId
        ? visibleWidgets.find((w) => w.id === state.maximizedId)
        : null;

    return (
        <div
            ref={containerRef}
            className={classNames('eui-dashboard-layout', className, {
                'eui-dashboard-layout-editing': editing,
                'eui-dashboard-layout-maximized': state.maximizedId,
                'eui-dashboard-layout-compact-vertical': compactType === 'vertical',
            })}
            style={style}
            data-active-breakpoint={activeBreakpoint.key}
        >
            {renderToolbar()}
            <div
                ref={gridRef}
                className="eui-dashboard-grid"
                style={{
                    position: 'relative',
                    minHeight: visibleWidgets.length === 0 ? 220 : gridHeight,
                }}
                role="grid"
                aria-label={toolbarTitle ?? 'Dashboard'}
                aria-rowcount={Math.max(1, Math.ceil(gridHeight / rowHeight))}
                aria-colcount={activeBreakpoint.columns}
            >
                {visibleWidgets.length === 0 ? (
                    <div className="eui-dashboard-empty">
                        {emptyState ?? (
                            <div className="eui-dashboard-empty-default">
                                <p className="eui-dashboard-empty-title">{locale.emptyDashboard}</p>
                                <p className="eui-dashboard-empty-desc">{locale.addWidgetPrompt}</p>
                                {hiddenWidgets.length > 0 && (
                                    <button
                                        type="button"
                                        className="eui-dashboard-toolbar-btn eui-dashboard-toolbar-btn-primary"
                                        onClick={() => {
                                            setEditMode(true);
                                            setAddPanelOpen(true);
                                        }}
                                    >
                                        {locale.addWidget}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : maximizedWidget ? (
                    <>
                        {(() => {
                            const item = displayLayout.find((l) => l.id === maximizedWidget.id);
                            const fallback: WidgetLayout = item ?? {
                                id: maximizedWidget.id,
                                x: 0,
                                y: 0,
                                w: activeBreakpoint.columns,
                                h: 6,
                            };
                            return renderWidget(maximizedWidget, fallback);
                        })()}
                    </>
                ) : (
                    <>
                        {displayLayout.map((item) => {
                            const widget = getWidget(visibleWidgets, item.id);
                            if (!widget) return null;
                            return renderWidget(widget, item);
                        })}
                    </>
                )}
            </div>
            {renderAddPanel()}
            {renderSettingsPopover()}
        </div>
    );
};

function formatLastUpdated(value: Date | string | number): string {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    const now = Date.now();
    const diff = (now - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
}

DashboardLayout.displayName = 'DashboardLayout';
