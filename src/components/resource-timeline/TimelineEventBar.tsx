import classNames from 'classnames';
import { memo, useCallback } from 'react';
import type { DragMode, PlacedEvent, ResourceTimelineEvent } from './resource-timeline-types';

interface TimelineEventBarProps {
    placed: PlacedEvent;
    dayWidth: number;
    laneHeight: number;
    dayCount: number;
    canDrag: boolean;
    canResize: boolean;
    isDragging: boolean;
    dragOffsetDays: number;
    dragMode: DragMode | null;
    template?: (item: ResourceTimelineEvent, width: number) => React.ReactNode;
    onPointerDown: (e: React.PointerEvent, item: ResourceTimelineEvent, mode: DragMode) => void;
    onKeyDown: (e: React.KeyboardEvent, item: ResourceTimelineEvent) => void;
    onClick: (e: React.MouseEvent, item: ResourceTimelineEvent) => void;
    onDoubleClick: (e: React.MouseEvent, item: ResourceTimelineEvent) => void;
}

function TimelineEventBar({
    placed,
    dayWidth,
    laneHeight,
    dayCount,
    canDrag,
    canResize,
    isDragging,
    dragOffsetDays,
    dragMode,
    template,
    onPointerDown,
    onKeyDown,
    onClick,
    onDoubleClick,
}: TimelineEventBarProps) {
    const { item, lane } = placed;
    let startIndex = placed.startIndex;
    let endIndex = placed.endIndex;

    if (isDragging) {
        if (dragMode === 'move') {
            startIndex += dragOffsetDays;
            endIndex += dragOffsetDays;
        } else if (dragMode === 'resize-start') {
            startIndex = Math.min(endIndex, startIndex + dragOffsetDays);
        } else if (dragMode === 'resize-end') {
            endIndex = Math.max(startIndex, endIndex + dragOffsetDays);
        }
    }

    const visibleStart = Math.max(0, startIndex);
    const visibleEnd = Math.min(dayCount - 1, endIndex);
    const left = visibleStart * dayWidth + 1;
    const width = Math.max(dayWidth * 0.5, (visibleEnd - visibleStart + 1) * dayWidth - 2);

    const handleMove = useCallback((e: React.PointerEvent) => canDrag && onPointerDown(e, item, 'move'), [canDrag, onPointerDown, item]);

    return (
        <div
            className={classNames('eui-rt-event', {
                'is-dragging': isDragging,
                'is-editable': canDrag || canResize,
                'is-clipped-start': startIndex < 0,
                'is-clipped-end': endIndex >= dayCount,
            })}
            style={{
                left,
                width,
                top: lane * laneHeight + 2,
                height: laneHeight - 4,
                backgroundColor: item.color,
                color: item.textColor,
            }}
            onPointerDown={handleMove}
            onKeyDown={(e) => onKeyDown(e, item)}
            onClick={(e) => onClick(e, item)}
            onDoubleClick={(e) => onDoubleClick(e, item)}
            role="button"
            tabIndex={0}
            title={item.title}
            aria-label={`${item.title}. Use arrow keys to move, Alt and arrow keys to change the end, Ctrl and arrow keys to change the start, up and down arrows to move to another row.`}
            data-rt-event={item.id}
        >
            {canResize && (
                <span className="eui-rt-event-handle eui-rt-event-handle-start" onPointerDown={(e) => onPointerDown(e, item, 'resize-start')} />
            )}
            <span className="eui-rt-event-content">{template ? template(item, width) : <span className="eui-rt-event-title">{item.title}</span>}</span>
            {canResize && <span className="eui-rt-event-handle eui-rt-event-handle-end" onPointerDown={(e) => onPointerDown(e, item, 'resize-end')} />}
        </div>
    );
}

export default memo(TimelineEventBar);
