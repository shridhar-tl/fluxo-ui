import '../eui-base.scss';
import './ResourceTimeline.scss';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TimelineEventBar from './TimelineEventBar';
import type { DragMode, DragState, ResourceTimelineEvent, ResourceTimelineProps } from './resource-timeline-types';
import { addDays, diffDays, eachDay, groupMonths, isSameDay, packLanes, toDay } from './resource-timeline-utils';

const clickThreshold = 3;

function ResourceTimeline({
    resources,
    events,
    startDate,
    endDate,
    dayWidth = 32,
    laneHeight = 28,
    resourceWidth = 200,
    height = 480,
    markers = [],
    readOnly = false,
    allowResourceChange = true,
    showToday = true,
    isNonWorkingDay,
    resourceTemplate,
    eventTemplate,
    dayCellTemplate,
    dayCellHeight = 24,
    emptyMessage = 'No resources',
    className,
    ariaLabel = 'Resource timeline',
    onEventChange,
    onEventClick,
    onEventDoubleClick,
    onExternalDrop,
}: ResourceTimelineProps) {
    const rangeStart = useMemo(() => toDay(startDate), [startDate]);
    const rangeEnd = useMemo(() => toDay(endDate), [endDate]);
    const days = useMemo(() => eachDay(rangeStart, rangeEnd), [rangeStart, rangeEnd]);
    const months = useMemo(() => groupMonths(days), [days]);
    const today = useMemo(() => toDay(new Date()), []);
    const todayIndex = diffDays(today, rangeStart);
    const timelineWidth = days.length * dayWidth;

    const [drag, setDrag] = useState<DragState | null>(null);
    const dragRef = useRef<DragState | null>(null);
    const suppressClickRef = useRef(false);
    const [dropTarget, setDropTarget] = useState<string | null>(null);

    const eventsByResource = useMemo(() => {
        const map = new Map<string, ResourceTimelineEvent[]>();
        for (const item of events) {
            const list = map.get(item.resourceId);
            if (list) list.push(item);
            else map.set(item.resourceId, [item]);
        }
        return map;
    }, [events]);

    const rows = useMemo(
        () => resources.map((resource) => ({ resource, ...packLanes(eventsByResource.get(resource.id) || [], rangeStart, days.length) })),
        [resources, eventsByResource, rangeStart, days.length],
    );

    const eventMap = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

    const emitChange = useCallback(
        (item: ResourceTimelineEvent, mode: DragMode, offsetDays: number, resourceId: string) => {
            if (!onEventChange) return;
            let start = toDay(item.start);
            let end = toDay(item.end);
            if (mode === 'move') {
                start = addDays(start, offsetDays);
                end = addDays(end, offsetDays);
            } else if (mode === 'resize-start') {
                start = addDays(start, offsetDays);
                if (start > end) start = end;
            } else {
                end = addDays(end, offsetDays);
                if (end < start) end = start;
            }
            if (offsetDays === 0 && resourceId === item.resourceId) return;
            onEventChange({ item, start, end, resourceId, previousResourceId: item.resourceId });
        },
        [onEventChange],
    );

    const handlePointerDown = useCallback(
        (e: React.PointerEvent, item: ResourceTimelineEvent, mode: DragMode) => {
            if (e.button !== 0 || readOnly) return;
            e.stopPropagation();
            const state: DragState = {
                eventId: item.id,
                mode,
                startX: e.clientX,
                deltaX: 0,
                sourceResourceId: item.resourceId,
                targetResourceId: item.resourceId,
                moved: false,
            };
            dragRef.current = state;
            setDrag(state);
        },
        [readOnly],
    );

    useEffect(() => {
        if (!drag) return;

        const handleMove = (e: PointerEvent) => {
            const prev = dragRef.current;
            if (!prev) return;
            let targetResourceId = prev.targetResourceId;
            if (prev.mode === 'move' && allowResourceChange) {
                const row = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-rt-resource]') as HTMLElement | null;
                if (row?.dataset.rtResource) targetResourceId = row.dataset.rtResource;
            }
            const deltaX = e.clientX - prev.startX;
            const updated = { ...prev, deltaX, targetResourceId, moved: prev.moved || Math.abs(deltaX) > clickThreshold || targetResourceId !== prev.sourceResourceId };
            dragRef.current = updated;
            setDrag(updated);
        };

        const handleUp = () => {
            const state = dragRef.current;
            dragRef.current = null;
            setDrag(null);
            if (!state || !state.moved) return;
            suppressClickRef.current = true;
            const item = eventMap.get(state.eventId);
            if (item) emitChange(item, state.mode, Math.round(state.deltaX / dayWidth), state.targetResourceId);
        };

        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
        return () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
        };
    }, [!!drag, allowResourceChange, dayWidth, eventMap, emitChange]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent, item: ResourceTimelineEvent) => {
            if (e.key === 'Enter') {
                onEventDoubleClick?.({ item, event: e });
                return;
            }
            if (readOnly) return;
            const step = e.shiftKey ? 7 : 1;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const offset = e.key === 'ArrowRight' ? step : -step;
                const canResize = item.resizable !== false;
                e.preventDefault();
                if (e.altKey && canResize) emitChange(item, 'resize-end', offset, item.resourceId);
                else if (e.ctrlKey && canResize) emitChange(item, 'resize-start', offset, item.resourceId);
                else if (item.draggable !== false) emitChange(item, 'move', offset, item.resourceId);
            } else if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && allowResourceChange && item.draggable !== false) {
                const index = resources.findIndex((r) => r.id === item.resourceId);
                const target = resources[index + (e.key === 'ArrowDown' ? 1 : -1)];
                if (target) {
                    e.preventDefault();
                    emitChange(item, 'move', 0, target.id);
                }
            }
        },
        [readOnly, allowResourceChange, resources, emitChange, onEventDoubleClick],
    );

    const handleClick = useCallback(
        (e: React.MouseEvent, item: ResourceTimelineEvent) => {
            if (suppressClickRef.current) {
                suppressClickRef.current = false;
                return;
            }
            onEventClick?.({ item, event: e });
        },
        [onEventClick],
    );

    const handleDoubleClick = useCallback((e: React.MouseEvent, item: ResourceTimelineEvent) => onEventDoubleClick?.({ item, event: e }), [onEventDoubleClick]);

    const handleDragOver = useCallback(
        (e: React.DragEvent, resourceId: string) => {
            if (!onExternalDrop || readOnly) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setDropTarget(resourceId);
        },
        [onExternalDrop, readOnly],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>, resourceId: string) => {
            setDropTarget(null);
            if (!onExternalDrop || readOnly) return;
            e.preventDefault();
            const rect = e.currentTarget.getBoundingClientRect();
            const index = Math.max(0, Math.min(days.length - 1, Math.floor((e.clientX - rect.left) / dayWidth)));
            onExternalDrop({ resourceId, date: days[index], dataTransfer: e.dataTransfer });
        },
        [onExternalDrop, readOnly, days, dayWidth],
    );

    const dragOffsetDays = drag ? Math.round(drag.deltaX / dayWidth) : 0;
    const resourceColumnWidth = typeof resourceWidth === 'number' ? `${resourceWidth}px` : resourceWidth;

    return (
        <div className={classNames('eui-rt', className, { 'is-dragging': !!drag })} style={{ height }} role="grid" aria-label={ariaLabel}>
            <div className="eui-rt-scroll" style={{ ['--eui-rt-resource-width' as string]: resourceColumnWidth }}>
                <div className="eui-rt-header" role="row">
                    <div className="eui-rt-corner" role="columnheader" />
                    <div className="eui-rt-header-days" style={{ width: timelineWidth }}>
                        <div className="eui-rt-months">
                            {months.map((m, i) => (
                                <div key={`${m.label}-${i}`} className="eui-rt-month" style={{ width: m.span * dayWidth }}>
                                    {m.label}
                                </div>
                            ))}
                        </div>
                        <div className="eui-rt-days">
                            {days.map((day, i) => (
                                <div
                                    key={i}
                                    role="columnheader"
                                    className={classNames('eui-rt-day', { 'is-today': showToday && isSameDay(day, today), 'is-weekend': day.getDay() === 0 || day.getDay() === 6 })}
                                    style={{ width: dayWidth }}
                                    title={day.toDateString()}
                                >
                                    <span className="eui-rt-day-name">{day.toLocaleDateString(undefined, { weekday: 'narrow' })}</span>
                                    <span className="eui-rt-day-number">{day.getDate()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {!rows.length && <div className="eui-rt-empty">{emptyMessage}</div>}

                {rows.map(({ resource, placed, laneCount }) => {
                    const lanesHeight = laneCount * laneHeight;
                    const isTarget = (drag && drag.targetResourceId === resource.id && drag.targetResourceId !== drag.sourceResourceId) || dropTarget === resource.id;
                    return (
                        <div key={resource.id} className={classNames('eui-rt-row', { 'is-drop-target': isTarget })} role="row">
                            <div className="eui-rt-resource" role="rowheader">
                                {resourceTemplate ? resourceTemplate(resource) : <span className="eui-rt-resource-name">{resource.name}</span>}
                            </div>
                            <div
                                className="eui-rt-track"
                                style={{ width: timelineWidth, height: lanesHeight + (dayCellTemplate ? dayCellHeight : 0) }}
                                data-rt-resource={resource.id}
                                onDragOver={(e) => handleDragOver(e, resource.id)}
                                onDragLeave={() => setDropTarget((current) => (current === resource.id ? null : current))}
                                onDrop={(e) => handleDrop(e, resource.id)}
                            >
                                {isNonWorkingDay &&
                                    days.map((day, i) =>
                                        isNonWorkingDay(day, resource.id) ? (
                                            <div key={i} className="eui-rt-nonworking" style={{ left: i * dayWidth, width: dayWidth, height: lanesHeight }} />
                                        ) : null,
                                    )}
                                {showToday && todayIndex >= 0 && todayIndex < days.length && (
                                    <div className="eui-rt-today" style={{ left: todayIndex * dayWidth + dayWidth / 2 }} />
                                )}
                                {markers.map((marker, i) => {
                                    const index = diffDays(toDay(marker.date), rangeStart);
                                    if (index < 0 || index >= days.length) return null;
                                    return (
                                        <div
                                            key={marker.id || i}
                                            className="eui-rt-marker"
                                            style={{ left: index * dayWidth, borderColor: marker.color }}
                                            title={marker.label}
                                        />
                                    );
                                })}
                                {placed.map((p) => (
                                    <TimelineEventBar
                                        key={p.item.id}
                                        placed={p}
                                        dayWidth={dayWidth}
                                        laneHeight={laneHeight}
                                        dayCount={days.length}
                                        canDrag={!readOnly && p.item.draggable !== false && !!onEventChange}
                                        canResize={!readOnly && p.item.resizable !== false && !!onEventChange}
                                        isDragging={drag?.eventId === p.item.id}
                                        dragOffsetDays={drag?.eventId === p.item.id ? dragOffsetDays : 0}
                                        dragMode={drag?.eventId === p.item.id ? drag.mode : null}
                                        template={eventTemplate}
                                        onPointerDown={handlePointerDown}
                                        onKeyDown={handleKeyDown}
                                        onClick={handleClick}
                                        onDoubleClick={handleDoubleClick}
                                    />
                                ))}
                                {dayCellTemplate && (
                                    <div className="eui-rt-day-cells" style={{ top: lanesHeight, height: dayCellHeight }}>
                                        {days.map((day, i) => (
                                            <div key={i} className="eui-rt-day-cell" style={{ width: dayWidth }}>
                                                {dayCellTemplate(resource, day)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export { ResourceTimeline };
