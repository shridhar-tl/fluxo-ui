import { memo, useCallback, useRef, useState, useEffect } from 'react';
import classNames from 'classnames';
import { GanttTaskBarInfo, GanttTask, GanttDragState } from './gantt-types';
import { useGanttContext } from './GanttContext';
import { columnToDate } from './gantt-utils';

interface TaskBarProps {
    barInfo: GanttTaskBarInfo;
    rowTop: number;
}

function TaskBar({ barInfo, rowTop }: TaskBarProps) {
    const {
        columnWidth, rowHeight, showProgress, allowTaskDrag, allowTaskResize,
        readOnly, startDate, viewMode, taskBarTemplate: Template,
        tooltipTemplate, showTooltip,
        onTaskChange, onTaskClick, onTaskDoubleClick,
    } = useGanttContext();

    const { task, left, width, isMilestone, isGroup } = barInfo;

    const barRef = useRef<HTMLDivElement>(null);
    const [dragState, setDragState] = useState<GanttDragState | null>(null);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const dragStateRef = useRef<GanttDragState | null>(null);

    const canDrag = !readOnly && allowTaskDrag && task.draggable !== false;
    const canResize = !readOnly && allowTaskResize && task.resizable !== false && !isMilestone;

    const progress = task.progress ?? 0;
    const barHeight = isMilestone ? rowHeight * 0.4 : isGroup ? rowHeight * 0.3 : rowHeight * 0.55;
    const barTop = rowTop + (rowHeight - barHeight) / 2;

    const currentLeft = dragState
        ? dragState.type === 'move'
            ? dragState.originalLeft + (dragState.currentX - dragState.startX)
            : dragState.type === 'resize-start'
                ? dragState.originalLeft + (dragState.currentX - dragState.startX)
                : left
        : left;

    const currentWidth = dragState
        ? dragState.type === 'move'
            ? width
            : dragState.type === 'resize-start'
                ? dragState.originalWidth - (dragState.currentX - dragState.startX)
                : dragState.type === 'resize-end'
                    ? dragState.originalWidth + (dragState.currentX - dragState.startX)
                    : width
        : width;

    const clampedWidth = Math.max(currentWidth, columnWidth * 0.25);
    const clampedLeft = dragState?.type === 'resize-start'
        ? currentLeft + (currentWidth - clampedWidth)
        : currentLeft;

    const handleMouseDown = useCallback((e: React.MouseEvent, type: GanttDragState['type']) => {
        if (e.button !== 0 || readOnly) return;
        e.stopPropagation();
        e.preventDefault();

        const state: GanttDragState = {
            type,
            taskBarInfo: barInfo,
            startX: e.clientX,
            currentX: e.clientX,
            startCol: barInfo.startCol,
            currentCol: barInfo.startCol,
            originalLeft: left,
            originalWidth: width,
        };
        setDragState(state);
        dragStateRef.current = state;
    }, [barInfo, left, width, readOnly]);

    useEffect(() => {
        if (!dragState) return;

        const handleMove = (e: MouseEvent) => {
            const updated = {
                ...dragStateRef.current!,
                currentX: e.clientX,
            };
            dragStateRef.current = updated;
            setDragState(updated);
        };

        const handleUp = () => {
            const ds = dragStateRef.current;
            if (ds && onTaskChange) {
                const deltaX = ds.currentX - ds.startX;
                if (Math.abs(deltaX) > 2) {
                    let newLeft: number;
                    let newWidth: number;

                    if (ds.type === 'move') {
                        newLeft = ds.originalLeft + deltaX;
                        newWidth = ds.originalWidth;
                    } else if (ds.type === 'resize-start') {
                        newLeft = ds.originalLeft + deltaX;
                        newWidth = Math.max(ds.originalWidth - deltaX, columnWidth * 0.25);
                        if (ds.originalWidth - deltaX < columnWidth * 0.25) {
                            newLeft = ds.originalLeft + ds.originalWidth - columnWidth * 0.25;
                        }
                    } else {
                        newLeft = ds.originalLeft;
                        newWidth = Math.max(ds.originalWidth + deltaX, columnWidth * 0.25);
                    }

                    const newStart = columnToDate(0, startDate, columnWidth, newLeft, viewMode);
                    const newEnd = columnToDate(0, startDate, columnWidth, newLeft + newWidth, viewMode);
                    newEnd.setDate(newEnd.getDate() - (viewMode === 'day' || viewMode === 'week' ? 1 : 0));

                    if (newEnd >= newStart) {
                        onTaskChange({
                            task: { ...task, start: newStart, end: newEnd },
                            originalTask: task,
                            start: newStart,
                            end: newEnd,
                        });
                    }
                }
            }
            setDragState(null);
            dragStateRef.current = null;
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [!!dragState]);

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (onTaskClick) {
            onTaskClick({ task, event: e });
        }
    }, [task, onTaskClick]);

    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        if (onTaskDoubleClick) {
            onTaskDoubleClick({ task, event: e });
        }
    }, [task, onTaskDoubleClick]);

    const handleMouseEnter = useCallback((e: React.MouseEvent) => {
        if (!showTooltip || dragState) return;
        setTooltipVisible(true);
        setTooltipPos({ x: e.clientX, y: e.clientY });
    }, [showTooltip, dragState]);

    const handleMouseLeave = useCallback(() => {
        setTooltipVisible(false);
    }, []);

    const handleTooltipMouseMove = useCallback((e: React.MouseEvent) => {
        if (tooltipVisible) {
            setTooltipPos({ x: e.clientX, y: e.clientY });
        }
    }, [tooltipVisible]);

    if (isMilestone) {
        const diamondSize = barHeight;
        return (
            <>
                <div
                    ref={barRef}
                    className={classNames('eui-gantt-milestone', { 'is-dragging': !!dragState })}
                    style={{
                        left: clampedLeft + clampedWidth / 2 - diamondSize / 2,
                        top: barTop,
                        width: diamondSize,
                        height: diamondSize,
                        backgroundColor: task.color,
                    }}
                    onMouseDown={canDrag ? (e) => handleMouseDown(e, 'move') : undefined}
                    onClick={handleClick}
                    onDoubleClick={handleDoubleClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleTooltipMouseMove}
                    role="button"
                    tabIndex={0}
                    aria-label={`Milestone: ${task.name}`}
                />
                {tooltipVisible && <TaskTooltip task={task} x={tooltipPos.x} y={tooltipPos.y} template={tooltipTemplate} />}
            </>
        );
    }

    return (
        <>
            <div
                ref={barRef}
                className={classNames('eui-gantt-taskbar', {
                    'is-group': isGroup,
                    'is-dragging': !!dragState,
                    'is-editable': canDrag || canResize,
                })}
                style={{
                    left: clampedLeft,
                    top: barTop,
                    width: clampedWidth,
                    height: barHeight,
                    backgroundColor: task.color,
                    color: task.textColor,
                }}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleTooltipMouseMove}
                role="button"
                tabIndex={0}
                aria-label={`Task: ${task.name}, ${progress}% complete`}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                {canResize && (
                    <div
                        className="eui-gantt-taskbar-handle eui-gantt-taskbar-handle-left"
                        onMouseDown={(e) => handleMouseDown(e, 'resize-start')}
                    />
                )}

                {showProgress && progress > 0 && (
                    <div
                        className="eui-gantt-taskbar-progress"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                )}

                <div className="eui-gantt-taskbar-content" onMouseDown={canDrag ? (e) => handleMouseDown(e, 'move') : undefined}>
                    {Template ? (
                        <Template task={task} width={clampedWidth} isGroup={isGroup} isMilestone={false} />
                    ) : (
                        <span className="eui-gantt-taskbar-label">{task.name}</span>
                    )}
                </div>

                {canResize && (
                    <div
                        className="eui-gantt-taskbar-handle eui-gantt-taskbar-handle-right"
                        onMouseDown={(e) => handleMouseDown(e, 'resize-end')}
                    />
                )}

                {isGroup && (
                    <>
                        <div className="eui-gantt-group-cap eui-gantt-group-cap-left" />
                        <div className="eui-gantt-group-cap eui-gantt-group-cap-right" />
                    </>
                )}
            </div>
            {tooltipVisible && <TaskTooltip task={task} x={tooltipPos.x} y={tooltipPos.y} template={tooltipTemplate} />}
        </>
    );
}

export default memo(TaskBar);

interface TaskTooltipProps {
    task: GanttTask;
    x: number;
    y: number;
    template?: (task: GanttTask) => React.ReactNode;
}

const TaskTooltip = memo(function TaskTooltip({ task, x, y, template }: TaskTooltipProps) {
    const formatDate = (d: Date | string) => {
        const date = typeof d === 'string' ? new Date(d) : d;
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const content = template ? template(task) : (
        typeof task.tooltip === 'function' ? task.tooltip(task) : task.tooltip
    );

    return (
        <div
            className="eui-gantt-tooltip"
            style={{ left: x + 12, top: y - 10, position: 'fixed' }}
        >
            {content ?? (
                <>
                    <div className="eui-gantt-tooltip-title">{task.name}</div>
                    <div className="eui-gantt-tooltip-dates">
                        {formatDate(task.start)} — {formatDate(task.end)}
                    </div>
                    {task.progress !== undefined && (
                        <div className="eui-gantt-tooltip-progress">Progress: {task.progress}%</div>
                    )}
                    {task.assignee && (
                        <div className="eui-gantt-tooltip-assignee">Assignee: {task.assignee}</div>
                    )}
                </>
            )}
        </div>
    );
});
