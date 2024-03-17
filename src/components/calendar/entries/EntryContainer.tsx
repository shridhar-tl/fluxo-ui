import React, { useCallback, useMemo } from 'react';
import cn from 'classnames';
import type { ResolvedCalendarEntry, PositionedEntry } from '../calendar-types';
import { useCalendarContext } from '../CalendarContext';

function minutesToPx(minutes: number, slotDuration: number, slotHeightPx: number): number {
  return (minutes / slotDuration) * slotHeightPx;
}

interface EntryContainerProps {
  entry: ResolvedCalendarEntry;
  position?: PositionedEntry;
  isAllDay?: boolean;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
  onClick?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onContextMenu?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onMouseEnter?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onMouseLeave?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onPointerDown?: (entry: ResolvedCalendarEntry, event: React.PointerEvent) => void;
  onResizePointerDown?: (entry: ResolvedCalendarEntry, edge: 'top' | 'bottom', event: React.PointerEvent) => void;
  showResizeHandles?: boolean;
}

const EntryContainer: React.FC<EntryContainerProps> = ({
  entry, position, isAllDay, style, className,
  children, onClick, onContextMenu, onMouseEnter, onMouseLeave,
  onPointerDown, onResizePointerDown, showResizeHandles,
}) => {
  const { config, dragState } = useCalendarContext();
  const isDragging = dragState?.entryId === entry.id;
  const isEditable = entry.editable ?? config.editable;

  const entryStyle = useMemo<React.CSSProperties>(() => {
    const base: React.CSSProperties = { ...style };

    if (entry.color) (base as Record<string, string>)['--eui-cal-entry-bg'] = entry.color;
    if (entry.textColor) (base as Record<string, string>)['--eui-cal-entry-text'] = entry.textColor;
    if (entry.borderColor) (base as Record<string, string>)['--eui-cal-entry-border'] = entry.borderColor;

    if (!position || isAllDay) return base;

    let top = position.top;
    let height = position.height;

    if (isDragging && dragState) {
      const pxDelta = minutesToPx(dragState.offsetMinutes, config.slotDuration, config.slotHeight);
      if (dragState.type === 'move') {
        top += pxDelta;
      } else if (dragState.type === 'resize') {
        if (dragState.edge === 'bottom') {
          height += pxDelta;
          height = Math.max(height, config.minEntryHeight);
        } else if (dragState.edge === 'top') {
          top += pxDelta;
          height -= pxDelta;
          height = Math.max(height, config.minEntryHeight);
        }
      }
    }

    base.position = 'absolute';
    base.top = `${top}px`;
    base.height = `${height}px`;
    base.left = `${position.left}%`;
    base.width = `${position.width}%`;

    if (isDragging && dragState) {
      base.zIndex = 100;
      base.transition = 'none';
      if (dragState.type === 'move' && dragState.dayOffset !== 0) {
        base.transform = `translateX(${dragState.dayOffset * 100}%)`;
        base.width = '100%';
        base.left = '0%';
      }
    }

    return base;
  }, [style, entry, position, isAllDay, isDragging, dragState, config]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return;
    e.stopPropagation();
    onClick?.(entry, e);
  }, [entry, onClick, isDragging]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu?.(entry, e);
  }, [entry, onContextMenu]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    onPointerDown?.(entry, e);
  }, [entry, onPointerDown]);

  const handleTopResize = useCallback((e: React.PointerEvent) => {
    onResizePointerDown?.(entry, 'top', e);
  }, [entry, onResizePointerDown]);

  const handleBottomResize = useCallback((e: React.PointerEvent) => {
    onResizePointerDown?.(entry, 'bottom', e);
  }, [entry, onResizePointerDown]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(entry, e as unknown as React.MouseEvent);
    }
  }, [entry, onClick]);

  return (
    <div
      className={cn(
        'eui-cal-entry',
        {
          'eui-cal-entry-allday': isAllDay,
          'eui-cal-entry-dragging': isDragging,
          'eui-cal-entry-editable': isEditable,
        },
        entry.className,
        className,
        config.eventClassNames ? config.eventClassNames(entry) : undefined,
      )}
      style={entryStyle}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      onPointerDown={isEditable ? handlePointerDown : undefined}
      onMouseEnter={onMouseEnter ? (e) => onMouseEnter(entry, e) : undefined}
      onMouseLeave={onMouseLeave ? (e) => onMouseLeave(entry, e) : undefined}
      role="button"
      tabIndex={0}
      aria-label={entry.title}
      aria-grabbed={isDragging || undefined}
      data-entry-id={entry.id}
    >
      {showResizeHandles && isEditable && !isAllDay && (
        <div
          className="eui-cal-entry-resize-handle eui-cal-entry-resize-top"
          onPointerDown={handleTopResize}
          role="separator"
          aria-label={`Resize ${entry.title} start time`}
          aria-orientation="horizontal"
          tabIndex={-1}
        />
      )}
      {children}
      {showResizeHandles && isEditable && !isAllDay && (
        <div
          className="eui-cal-entry-resize-handle eui-cal-entry-resize-bottom"
          onPointerDown={handleBottomResize}
          role="separator"
          aria-label={`Resize ${entry.title} end time`}
          aria-orientation="horizontal"
          tabIndex={-1}
        />
      )}
    </div>
  );
};

export default React.memo(EntryContainer);
