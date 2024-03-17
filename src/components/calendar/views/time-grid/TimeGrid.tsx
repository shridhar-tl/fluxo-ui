import React, { useMemo, useCallback } from 'react';
import { ViewMode } from '../../calendar-types';
import type { ViewProps, CalendarViewDefinition, SelectionState, DragState } from '../../calendar-types';
import {
  getDaysInRange, getWeekRange, getDayRange,
  format, addWeeks, subWeeks, addDays, subDays,
  isSameMonth, isSameYear, dateFromMinuteOffset,
} from '../../calendar-utils';
import { useNowIndicator } from '../../hooks';
import { useDragMove } from '../../interactions/useDragMove';
import { useDragResize } from '../../interactions/useDragResize';
import { useSelection } from '../../interactions/useSelection';
import { useCalendarContext } from '../../CalendarContext';
import TimeGridHeader from './TimeGridHeader';
import TimeGridAllDay from './TimeGridAllDay';
import TimeGridBody from './TimeGridBody';

interface TimeGridProps extends ViewProps {
  singleDay?: boolean;
}

const TimeGrid: React.FC<TimeGridProps> = ({
  entries, dateRange, config, singleDay,
  onEntryClick, onEntryContextMenu, onDateSelect,
  onEntryDrop, onEntryResize, onDateClick,
  onEntryCreate,
  renderEntry, dateBackgrounds, dateRangeBackgrounds, onExternalDrop,
}) => {
  const { setDragState, setSelectionState } = useCalendarContext();
  const { minuteOfDay } = useNowIndicator({ enabled: config.nowIndicator, intervalMs: config.nowIndicatorInterval });

  const days = useMemo(
    () => getDaysInRange(dateRange, config.hiddenDays),
    [dateRange, config.hiddenDays]
  );

  const dayMinWidthStyle = config.dayMinWidth > 0
    ? { '--eui-cal-day-min-width': `${config.dayMinWidth}px` } as React.CSSProperties
    : undefined;

  const onDragEnd = useCallback((state: DragState) => {
    const entry = entries.find(e => e.id === state.entryId);
    if (!entry) return;
    const minuteDelta = state.offsetMinutes;
    const dayDelta = state.dayOffset * 24 * 60 * 60 * 1000;
    const newStart = new Date(state.originalStart.getTime() + minuteDelta * 60000 + dayDelta);
    const newEnd = new Date(state.originalEnd.getTime() + minuteDelta * 60000 + dayDelta);
    const syntheticEvent = new Event('dragend') as unknown as React.SyntheticEvent;
    const modifiers = state.modifiers || { alt: false, ctrl: false, shift: false, meta: false };
    onEntryDrop?.({ entry, newStart, newEnd, modifiers }, syntheticEvent);
  }, [entries, onEntryDrop]);

  const dragMove = useDragMove({
    config,
    entries,
    setDragState,
    onDragEnd,
  });

  const onResizeEnd = useCallback((state: DragState) => {
    const entry = entries.find(e => e.id === state.entryId);
    if (!entry) return;
    const minuteDelta = state.offsetMinutes;
    const newStart = state.edge === 'top'
      ? new Date(state.originalStart.getTime() + minuteDelta * 60000)
      : state.originalStart;
    const newEnd = state.edge === 'bottom'
      ? new Date(state.originalEnd.getTime() + minuteDelta * 60000)
      : state.originalEnd;
    const syntheticEvent = new Event('resizeend') as unknown as React.SyntheticEvent;
    onEntryResize?.({ entry, newStart, newEnd, edge: state.edge ?? 'bottom', modifiers: { alt: false, ctrl: false, shift: false, meta: false } }, syntheticEvent);
  }, [entries, onEntryResize]);

  const dragResize = useDragResize({
    config,
    entries,
    setDragState,
    onResizeEnd,
  });

  const onSelectionComplete = useCallback((state: SelectionState) => {
    const syntheticEvent = new Event('select') as unknown as React.SyntheticEvent;
    onDateSelect?.({
      start: state.startDate,
      end: state.endDate,
      allDay: state.allDay,
      modifiers: { alt: false, ctrl: false, shift: false, meta: false },
    }, syntheticEvent);

    if (config.creatable && onEntryCreate) {
      onEntryCreate({
        start: state.startDate,
        end: state.endDate,
        allDay: state.allDay,
        view: singleDay ? ViewMode.timeGridDay : ViewMode.timeGridWeek,
      });
    }
  }, [onDateSelect, onEntryCreate, config.creatable, singleDay]);

  const selection = useSelection({
    config,
    entries,
    setSelectionState,
    onSelectionComplete,
  });

  return (
    <div className="eui-cal-time-grid" role="grid" aria-label={singleDay ? 'Day view' : 'Week view'} style={dayMinWidthStyle}>
      <TimeGridHeader days={days} config={config} onDateClick={onDateClick} />
      <TimeGridAllDay
        days={days}
        entries={entries}
        renderEntry={renderEntry}
        onEntryClick={onEntryClick}
        onEntryContextMenu={onEntryContextMenu}
        maxHeight={config.allDaySlotMaxHeight}
        allDayText={config.allDayText}
      />
      <TimeGridBody
        days={days}
        entries={entries}
        config={config}
        nowMinute={minuteOfDay}
        showNowIndicator={config.nowIndicator}
        renderEntry={renderEntry}
        onEntryClick={onEntryClick}
        onEntryContextMenu={onEntryContextMenu}
        onEntryPointerDown={dragMove.handlePointerDown}
        onEntryResizePointerDown={dragResize.handleResizePointerDown}
        onSlotPointerDown={selection.handleSlotPointerDown}
        scrollToTime={config.scrollTime}
        onSlotExternalDrop={onExternalDrop ? (date, slotMinute, allDay, event) => {
          const dropDate = dateFromMinuteOffset(date, slotMinute, config.visibleHoursStart);
          const syntheticEvent = event as unknown as React.SyntheticEvent;
          onExternalDrop({
            date: dropDate,
            allDay,
            data: event.dataTransfer,
            modifiers: { alt: event.altKey, ctrl: event.ctrlKey, shift: event.shiftKey, meta: event.metaKey },
          }, syntheticEvent);
        } : undefined}
        dateBackgrounds={dateBackgrounds}
        dateRangeBackgrounds={dateRangeBackgrounds}
      />
    </div>
  );
};

export default React.memo(TimeGrid);

function weekTitle(range: { start: Date; end: Date }): string {
  const { start, end } = range;
  if (isSameMonth(start, end)) {
    return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`;
  }
  if (isSameYear(start, end)) {
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  }
  return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
}

export const weekTimeGridViewDef: CalendarViewDefinition = {
  name: ViewMode.timeGridWeek,
  label: 'Week',
  component: TimeGrid,
  getDateRange: (date, firstDayOfWeek) => getWeekRange(date, firstDayOfWeek),
  getTitle: weekTitle,
  navigate: (date, dir) => dir === 'prev' ? subWeeks(date, 1) : addWeeks(date, 1),
};

const DayTimeGrid: React.FC<ViewProps> = (props) => <TimeGrid {...props} singleDay />;

export const dayTimeGridViewDef: CalendarViewDefinition = {
  name: ViewMode.timeGridDay,
  label: 'Day',
  component: DayTimeGrid,
  getDateRange: (date) => getDayRange(date),
  getTitle: (range) => format(range.start, 'EEEE, MMMM d, yyyy'),
  navigate: (date, dir) => dir === 'prev' ? subDays(date, 1) : addDays(date, 1),
};
