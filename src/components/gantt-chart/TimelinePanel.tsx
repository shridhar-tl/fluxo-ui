import { useCallback, useRef, memo, useMemo, useState } from 'react';
import { useGanttContext } from './GanttContext';
import TimelineHeader from './TimelineHeader';
import TimelineGrid from './TimelineGrid';
import TaskBar from './TaskBar';
import Markers from './Markers';
import DependencyLines from './DependencyLines';
import { getTaskBarPosition, columnToDate } from './gantt-utils';
import { GanttTaskBarInfo } from './gantt-types';

interface TimelinePanelProps {
    bodyRef: React.RefObject<HTMLDivElement | null>;
    onVerticalScroll: (scrollTop: number) => void;
    onHorizontalScroll: (scrollLeft: number) => void;
    headerMeasureRef: React.RefObject<HTMLDivElement | null>;
}

interface CreateDragState {
    startX: number;
    currentX: number;
    rowIndex: number;
}

function TimelinePanel({ bodyRef, onVerticalScroll, onHorizontalScroll, headerMeasureRef }: TimelinePanelProps) {
    const {
        flatTasks, columnWidth, rowHeight, totalWidth, totalHeight,
        startDate, viewMode, allowTaskCreate, readOnly,
        onTaskCreate,
    } = useGanttContext();

    const headerRef = useRef<HTMLDivElement>(null);
    const [createDrag, setCreateDrag] = useState<CreateDragState | null>(null);
    const createDragRef = useRef<CreateDragState | null>(null);

    const visibleTasks = useMemo(() => flatTasks.filter(ft => ft.isVisible), [flatTasks]);

    const taskBars = useMemo(() => {
        const bars: GanttTaskBarInfo[] = [];

        for (let i = 0; i < visibleTasks.length; i++) {
            const ft = visibleTasks[i];
            const pos = getTaskBarPosition(ft.task, startDate, columnWidth, viewMode);
            if (!pos) continue;

            bars.push({
                task: ft.task,
                flatIndex: i,
                depth: ft.depth,
                left: pos.left,
                width: pos.width,
                startCol: pos.startCol,
                endCol: pos.endCol,
                isGroup: ft.task.type === 'group' || ft.hasChildren,
                isMilestone: ft.task.type === 'milestone',
                parentId: ft.parentId,
            });
        }

        return bars;
    }, [visibleTasks, startDate, columnWidth, viewMode]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        onVerticalScroll(target.scrollTop);
        onHorizontalScroll(target.scrollLeft);

        if (headerRef.current) {
            headerRef.current.scrollLeft = target.scrollLeft;
        }
    }, [onVerticalScroll, onHorizontalScroll]);

    const handleCreateMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button !== 0 || !allowTaskCreate || readOnly) return;

        const target = e.target as HTMLElement;
        if (target.closest('.eui-gantt-taskbar, .eui-gantt-milestone, .eui-gantt-taskbar-handle')) return;

        const body = e.currentTarget as HTMLDivElement;
        const rect = body.getBoundingClientRect();
        const scrollLeft = body.scrollLeft;
        const scrollTop = body.scrollTop;
        const x = e.clientX - rect.left + scrollLeft;
        const y = e.clientY - rect.top + scrollTop;
        const rowIndex = Math.max(0, Math.floor(y / rowHeight));

        const state: CreateDragState = { startX: x, currentX: x, rowIndex };
        setCreateDrag(state);
        createDragRef.current = state;

        const handleMove = (me: MouseEvent) => {
            const live = bodyRef.current;
            const liveRect = live ? live.getBoundingClientRect() : rect;
            const liveScrollLeft = live ? live.scrollLeft : scrollLeft;
            const cx = me.clientX - liveRect.left + liveScrollLeft;
            const prev = createDragRef.current;
            if (!prev) return;
            const updated: CreateDragState = { startX: prev.startX, currentX: cx, rowIndex: prev.rowIndex };
            createDragRef.current = updated;
            setCreateDrag(updated);
        };

        const handleUp = () => {
            const ds = createDragRef.current;
            if (ds && Math.abs(ds.currentX - ds.startX) > columnWidth * 0.5 && onTaskCreate) {
                const left = Math.min(ds.startX, ds.currentX);
                const right = Math.max(ds.startX, ds.currentX);
                const start = columnToDate(0, startDate, columnWidth, left, viewMode);
                const end = columnToDate(0, startDate, columnWidth, right, viewMode);
                const targetTask = visibleTasks[ds.rowIndex]?.task;

                onTaskCreate({ start, end, rowIndex: ds.rowIndex, targetTask });
            }

            setCreateDrag(null);
            createDragRef.current = null;
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
    }, [allowTaskCreate, readOnly, columnWidth, startDate, viewMode, onTaskCreate, bodyRef, rowHeight, visibleTasks]);

    const createBarStyle = useMemo(() => {
        if (!createDrag) return null;
        const left = Math.min(createDrag.startX, createDrag.currentX);
        const width = Math.abs(createDrag.currentX - createDrag.startX);
        const barHeight = rowHeight * 0.55;
        const top = createDrag.rowIndex * rowHeight + (rowHeight - barHeight) / 2;
        return { left, width, top, height: barHeight };
    }, [createDrag, rowHeight]);

    return (
        <div className="eui-gantt-timeline">
            <TimelineHeader headerRef={headerRef} measureRef={headerMeasureRef} />
            <div
                className="eui-gantt-timeline-body"
                ref={bodyRef}
                onScroll={handleScroll}
                onMouseDown={handleCreateMouseDown}
            >
                <div className="eui-gantt-timeline-canvas" style={{ width: totalWidth, minHeight: totalHeight }}>
                    <TimelineGrid />

                    {visibleTasks.map((_, i) => (
                        <div
                            key={i}
                            className="eui-gantt-row-line"
                            style={{ top: (i + 1) * rowHeight, width: totalWidth }}
                        />
                    ))}

                    <Markers />
                    <DependencyLines />

                    {taskBars.map(bar => (
                        <TaskBar
                            key={bar.task.id}
                            barInfo={bar}
                            rowTop={bar.flatIndex * rowHeight}
                        />
                    ))}

                    {createBarStyle && (
                        <div
                            className="eui-gantt-create-preview"
                            style={{
                                left: createBarStyle.left,
                                width: createBarStyle.width,
                                height: createBarStyle.height,
                                top: createBarStyle.top,
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default memo(TimelinePanel);
