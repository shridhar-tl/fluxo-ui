import { useState, useMemo, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import classNames from 'classnames';
import { GanttContext } from './GanttContext';
import {
    GanttProps, GanttViewMode, GanttContextValue,
    GanttColumn, GanttDateCell, GanttTaskBarInfo,
} from './gantt-types';
import {
    generateDateCells, generateMonthCells, generateQuarterCells,
    generateYearCells, flattenTasks, getTaskBarPosition,
    getTodayColumnIndex, getDefaultColumnWidth, computeDateRange,
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

function GanttChart({
    tasks,
    columns = defaultColumns,
    viewMode: controlledViewMode,
    startDate: startDateProp,
    endDate: endDateProp,
    height = 500,
    rowHeight = 40,
    columnWidth: columnWidthProp,
    fieldsPanelWidth = 300,
    showFieldsPanel = true,
    showToday = true,
    showWeekends: _showWeekends = true,
    showGrid: _showGrid = true,
    showDependencies = true,
    showProgress = true,
    showTooltip = true,
    markers = [],
    isHoliday = defaultIsHoliday,
    allowTaskDrag = true,
    allowTaskResize = true,
    allowTaskCreate = false,
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
    onViewModeChange,
    onScroll,
    onExpandToggle,
}: GanttProps) {
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

    const columnWidth = columnWidthProp ?? getDefaultColumnWidth(viewMode);

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
        readOnly,
        todayColumnIndex,
        collapsedIds,
        toggleCollapse,
        getTaskBarInfo,
        taskBarTemplate,
        tooltipTemplate,
        onTaskChange,
        onTaskClick,
        onTaskDoubleClick,
        onTaskCreate,
        onExpandToggle,
        markers,
        weekendColor: weekendColor ?? 'var(--eui-bg-subtle)',
        holidayColor: holidayColor ?? 'var(--eui-primary-subtle)',
        todayColor: todayColor ?? 'rgba(59, 130, 246, 0.08)',
        isHoliday,
    }), [
        viewMode, dateCells, flatTasks, columnWidth, rowHeight, totalWidth, totalHeight,
        dateRange, showProgress, showDependencies, showTooltip, allowTaskDrag, allowTaskResize,
        allowTaskCreate, readOnly, todayColumnIndex, collapsedIds, toggleCollapse, getTaskBarInfo,
        taskBarTemplate, tooltipTemplate, onTaskChange, onTaskClick, onTaskDoubleClick,
        onTaskCreate, onExpandToggle, markers, weekendColor, holidayColor, todayColor, isHoliday,
    ]);

    const fieldsPanelBodyRef = useRef<HTMLDivElement>(null);
    const timelinePanelBodyRef = useRef<HTMLDivElement>(null);
    const timelineHeaderRef = useRef<HTMLDivElement>(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    useLayoutEffect(() => {
        if (timelineHeaderRef.current) {
            const h = timelineHeaderRef.current.getBoundingClientRect().height;
            setHeaderHeight(h);
        }
    }, [viewMode, dateCells]);

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
        if (todayColumnIndex >= 0 && timelinePanelBodyRef.current) {
            const scrollLeft = todayColumnIndex * columnWidth - timelinePanelBodyRef.current.clientWidth / 3;
            timelinePanelBodyRef.current.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
        }
    }, [todayColumnIndex, columnWidth]);

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
            </div>
        </GanttContext.Provider>
    );
}

export { GanttChart };
