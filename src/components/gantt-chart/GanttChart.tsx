import { useState, useMemo, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import classNames from 'classnames';
import { GanttContext } from './GanttContext';
import {
    GanttProps,
    GanttViewMode,
    GanttContextValue,
    GanttColumn,
    GanttDateCell,
    GanttTaskBarInfo,
    GanttTask,
    GanttMarker,
    GanttBand,
} from './gantt-types';
import {
    generateDateCells, generateMonthCells, generateQuarterCells,
    generateYearCells, flattenTasks, getTaskBarPosition,
    getTodayColumnIndex, getDefaultColumnWidth, computeDateRange, getMarkerPosition,
} from './gantt-utils';
import FieldsPanel from './FieldsPanel';
import TimelinePanel from './TimelinePanel';
import { Splitter, SplitterPanel } from '../splitter';
import '../eui-base.scss';
import './GanttChart.scss';

const defaultColumns: GanttColumn[] = [
    { field: 'name', headerText: 'Task Name', width: 200 },
];

const defaultIsHoliday = () => false;
const noMarkers: GanttMarker[] = [];
const noBands: GanttBand[] = [];

interface LinkDragState {
    task: GanttTask;
    startX: number;
    startY: number;
    x: number;
    y: number;
}

function GanttChart({
    tasks,
    columns = defaultColumns,
    viewMode: controlledViewMode,
    startDate: startDateProp,
    endDate: endDateProp,
    height = 500,
    rowHeight = 40,
    columnWidth: columnWidthProp,
    fillWidth = true,
    fieldsPanelWidth = 300,
    showFieldsPanel = true,
    showToday = true,
    showWeekends: _showWeekends = true,
    showGrid: _showGrid = true,
    showDependencies = true,
    showProgress = true,
    showTooltip = true,
    markers = noMarkers,
    bands = noBands,
    isHoliday = defaultIsHoliday,
    allowTaskDrag = true,
    allowTaskResize = true,
    allowTaskCreate = false,
    allowDependencyCreate = false,
    allowSort: _allowSort = false,
    readOnly = false,
    todayColor,
    weekendColor,
    holidayColor,
    className,
    taskBarTemplate,
    tooltipTemplate,
    onTaskChange,
    onTaskClick,
    onTaskDoubleClick,
    onTaskCreate,
    onSegmentChange,
    onSegmentClick,
    onSegmentDoubleClick,
    onDependencyCreate,
    onDependencyClick,
    onViewModeChange,
    onScroll,
    onExpandToggle,
}: GanttProps) {
    const [linkDrag, setLinkDrag] = useState<LinkDragState | null>(null);
    const linkDragRef = useRef<LinkDragState | null>(null);
    const [internalViewMode, setInternalViewMode] = useState<GanttViewMode>(controlledViewMode ?? 'day');
    const viewMode = controlledViewMode ?? internalViewMode;

    const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => {
        const set = new Set<string>();
        function walk(items: typeof tasks) {
            for (const t of items) {
                if (t.collapsed) set.add(t.id);
                if (t.children) walk(t.children);
            }
        }
        walk(tasks);
        return set;
    });

    const [availableWidth, setAvailableWidth] = useState(0);
    const minColumnWidth = columnWidthProp ?? getDefaultColumnWidth(viewMode);

    const dateRange = useMemo(
        () => computeDateRange(tasks, viewMode, startDateProp, endDateProp),
        [tasks, viewMode, startDateProp, endDateProp]
    );

    const dateCells = useMemo((): GanttDateCell[] => {
        switch (viewMode) {
            case 'day':
            case 'week':
                return generateDateCells(dateRange.start, dateRange.end, isHoliday);
            case 'month':
                return generateMonthCells(dateRange.start, dateRange.end, isHoliday);
            case 'quarter':
                return generateQuarterCells(dateRange.start, dateRange.end);
            case 'year':
                return generateYearCells(dateRange.start, dateRange.end);
        }
    }, [dateRange, viewMode, isHoliday]);

    const columnWidth = fillWidth && dateCells.length && availableWidth > minColumnWidth * dateCells.length
        ? Math.floor((availableWidth / dateCells.length) * 100) / 100
        : minColumnWidth;

    const flatTasks = useMemo(
        () => flattenTasks(tasks, collapsedIds),
        [tasks, collapsedIds]
    );

    const visibleCount = useMemo(
        () => flatTasks.filter(ft => ft.isVisible).length,
        [flatTasks]
    );

    const totalWidth = dateCells.length * columnWidth;
    const totalHeight = visibleCount * rowHeight;

    const todayColumnIndex = useMemo(
        () => showToday ? getTodayColumnIndex(dateRange.start, dateCells) : -1,
        [showToday, dateRange.start, dateCells]
    );

    const todayLeft = useMemo(() => {
        if (todayColumnIndex < 0) return -1;
        return viewMode === 'day' || viewMode === 'week'
            ? todayColumnIndex * columnWidth + columnWidth / 2
            : getMarkerPosition(new Date(), dateRange.start, columnWidth, viewMode);
    }, [todayColumnIndex, columnWidth, viewMode, dateRange.start]);

    const toggleCollapse = useCallback((taskId: string) => {
        setCollapsedIds(prev => {
            const next = new Set(prev);
            if (next.has(taskId)) {
                next.delete(taskId);
            } else {
                next.add(taskId);
            }
            return next;
        });
    }, []);

    const getTaskBarInfo = useCallback((task: typeof tasks[0]): GanttTaskBarInfo | null => {
        const pos = getTaskBarPosition(task, dateRange.start, columnWidth, viewMode);
        if (!pos) return null;
        const ft = flatTasks.find(f => f.task.id === task.id);
        return {
            task,
            flatIndex: ft?.index ?? 0,
            depth: ft?.depth ?? 0,
            left: pos.left,
            width: pos.width,
            startCol: pos.startCol,
            endCol: pos.endCol,
            isGroup: task.type === 'group' || !!task.children?.length,
            isMilestone: task.type === 'milestone',
            parentId: ft?.parentId,
        };
    }, [flatTasks, dateRange.start, columnWidth, viewMode]);

    const startDependencyDrag = useCallback((task: GanttTask, clientX: number, clientY: number) => {
        const state = { task, startX: clientX, startY: clientY, x: clientX, y: clientY };
        linkDragRef.current = state;
        setLinkDrag(state);
    }, []);

    useEffect(() => {
        if (!linkDrag) return;

        const handleMove = (e: MouseEvent) => {
            const prev = linkDragRef.current;
            if (!prev) return;
            const updated = { ...prev, x: e.clientX, y: e.clientY };
            linkDragRef.current = updated;
            setLinkDrag(updated);
        };

        const handleUp = (e: MouseEvent) => {
            const ds = linkDragRef.current;
            linkDragRef.current = null;
            setLinkDrag(null);
            if (!ds || !onDependencyCreate) return;

            const element = document.elementFromPoint(e.clientX, e.clientY);
            const targetId = (element?.closest('[data-gantt-task-id]') as HTMLElement | null)?.dataset.ganttTaskId;
            if (!targetId || targetId === ds.task.id) return;

            const target = flatTasks.find(ft => ft.task.id === targetId)?.task;
            if (target) {
                onDependencyCreate({ fromTask: ds.task, toTask: target });
            }
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [!!linkDrag, flatTasks, onDependencyCreate]);

    const contextValue = useMemo((): GanttContextValue => ({
        viewMode,
        dateCells,
        weekGroups: [],
        flatTasks,
        columnWidth,
        rowHeight,
        totalWidth,
        totalHeight,
        startDate: dateRange.start,
        endDate: dateRange.end,
        showProgress,
        showDependencies,
        showTooltip,
        allowTaskDrag: !readOnly && allowTaskDrag,
        allowTaskResize: !readOnly && allowTaskResize,
        allowTaskCreate: !readOnly && allowTaskCreate,
        allowDependencyCreate: !readOnly && allowDependencyCreate && !!onDependencyCreate,
        readOnly,
        todayColumnIndex,
        todayLeft,
        collapsedIds,
        toggleCollapse,
        getTaskBarInfo,
        taskBarTemplate,
        tooltipTemplate,
        onTaskChange,
        onTaskClick,
        onTaskDoubleClick,
        onTaskCreate,
        onSegmentChange,
        onSegmentClick,
        onSegmentDoubleClick,
        onDependencyCreate,
        onDependencyClick,
        startDependencyDrag,
        onExpandToggle,
        markers,
        bands,
        weekendColor: weekendColor ?? 'var(--eui-bg-subtle)',
        holidayColor: holidayColor ?? 'var(--eui-primary-subtle)',
        todayColor: todayColor ?? 'rgba(59, 130, 246, 0.08)',
        isHoliday,
    }), [
        viewMode, dateCells, flatTasks, columnWidth, rowHeight, totalWidth, totalHeight,
        dateRange, showProgress, showDependencies, showTooltip, allowTaskDrag, allowTaskResize,
        allowTaskCreate, readOnly, todayColumnIndex, todayLeft, collapsedIds, toggleCollapse, getTaskBarInfo,
        taskBarTemplate, tooltipTemplate, onTaskChange, onTaskClick, onTaskDoubleClick,
        onTaskCreate, onSegmentChange, onSegmentClick, onSegmentDoubleClick, onDependencyCreate, onDependencyClick,
        startDependencyDrag, allowDependencyCreate, onExpandToggle, markers, bands, weekendColor, holidayColor, todayColor, isHoliday,
    ]);

    const fieldsPanelBodyRef = useRef<HTMLDivElement>(null);
    const timelinePanelBodyRef = useRef<HTMLDivElement>(null);
    const timelineHeaderRef = useRef<HTMLDivElement>(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [scrollbarGutter, setScrollbarGutter] = useState(0);

    useLayoutEffect(() => {
        if (timelineHeaderRef.current) {
            const h = timelineHeaderRef.current.getBoundingClientRect().height;
            setHeaderHeight(h);
        }
    }, [viewMode, dateCells]);

    useLayoutEffect(() => {
        const body = timelinePanelBodyRef.current;
        if (!body) return;
        const measure = () => {
            const gutter = body.offsetHeight - body.clientHeight;
            setScrollbarGutter(prev => (prev === gutter ? prev : gutter));
            const width = body.clientWidth;
            setAvailableWidth(prev => (prev === width ? prev : width));
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(body);
        return () => observer.disconnect();
    }, [totalWidth, totalHeight, viewMode]);

    const handleTimelineVerticalScroll = useCallback((scrollTop: number) => {
        if (fieldsPanelBodyRef.current) {
            fieldsPanelBodyRef.current.scrollTop = scrollTop;
        }
    }, []);

    const handleTimelineHorizontalScroll = useCallback((scrollLeft: number) => {
        if (onScroll && timelinePanelBodyRef.current) {
            onScroll(scrollLeft, timelinePanelBodyRef.current.scrollTop);
        }
    }, [onScroll]);

    const handleViewModeChange = useCallback((mode: GanttViewMode) => {
        if (!controlledViewMode) {
            setInternalViewMode(mode);
        }
        onViewModeChange?.(mode);
    }, [controlledViewMode, onViewModeChange]);

    const scrollToToday = useCallback(() => {
        if (todayLeft >= 0 && timelinePanelBodyRef.current) {
            const scrollLeft = todayLeft - timelinePanelBodyRef.current.clientWidth / 3;
            timelinePanelBodyRef.current.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
        }
    }, [todayLeft]);

    useEffect(() => {
        if (todayColumnIndex >= 0) {
            const timer = setTimeout(scrollToToday, 100);
            return () => clearTimeout(timer);
        }
    }, []);

    const viewModes: GanttViewMode[] = ['day', 'week', 'month', 'quarter', 'year'];

    return (
        <GanttContext.Provider value={contextValue}>
            <div className={classNames('eui-gantt', className)} style={{ height }}>
                <div className="eui-gantt-toolbar">
                    <div className="eui-gantt-toolbar-left">
                        <div className="eui-gantt-view-switcher">
                            {viewModes.map(mode => (
                                <button
                                    key={mode}
                                    className={classNames('eui-gantt-view-btn', { active: viewMode === mode })}
                                    onClick={() => handleViewModeChange(mode)}
                                >
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="eui-gantt-toolbar-right">
                        {showToday && todayColumnIndex >= 0 && (
                            <button className="eui-gantt-today-btn" onClick={scrollToToday}>
                                Today
                            </button>
                        )}
                    </div>
                </div>
                <div className="eui-gantt-body">
                    {showFieldsPanel ? (
                        <Splitter layout="horizontal" gutterSize={4}>
                            <SplitterPanel defaultSize={`${fieldsPanelWidth}px`} minSize="150px">
                                <FieldsPanel
                                    columns={columns}
                                    bodyRef={fieldsPanelBodyRef}
                                    headerHeight={headerHeight}
                                    scrollbarGutter={scrollbarGutter}
                                />
                            </SplitterPanel>
                            <SplitterPanel minSize="200px">
                                <TimelinePanel
                                    bodyRef={timelinePanelBodyRef}
                                    onVerticalScroll={handleTimelineVerticalScroll}
                                    onHorizontalScroll={handleTimelineHorizontalScroll}
                                    headerMeasureRef={timelineHeaderRef}
                                />
                            </SplitterPanel>
                        </Splitter>
                    ) : (
                        <TimelinePanel
                            bodyRef={timelinePanelBodyRef}
                            onVerticalScroll={handleTimelineVerticalScroll}
                            onHorizontalScroll={handleTimelineHorizontalScroll}
                            headerMeasureRef={timelineHeaderRef}
                        />
                    )}
                </div>
                {linkDrag && (
                    <svg className="eui-gantt-link-preview" aria-hidden="true">
                        <line x1={linkDrag.startX} y1={linkDrag.startY} x2={linkDrag.x} y2={linkDrag.y} />
                    </svg>
                )}
            </div>
        </GanttContext.Provider>
    );
}

export { GanttChart };
