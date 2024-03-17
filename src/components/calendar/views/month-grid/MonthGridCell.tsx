import React, { useCallback } from 'react';
import cn from 'classnames';
import { format, isToday, isSameMonth } from 'date-fns';
import { ViewMode } from '../../calendar-types';
import type { ResolvedCalendarEntry, EntryRenderer, DateBackground, DateRangeBackground, DateLoadingRange, BusinessHours, MoreLinkClickHandler } from '../../calendar-types';
import { getDateBackgroundColor, isDateLoading, getDay } from '../../calendar-utils';
import { useCalendarContext } from '../../CalendarContext';
import { CalendarEntry } from '../../entries';
import OverflowPopover from '../../entries/OverflowPopover';

interface MonthGridCellProps {
  date: Date;
  currentMonth: Date;
  entries: ResolvedCalendarEntry[];
  renderEntry?: EntryRenderer;
  onDateClick?: (date: Date, event: React.MouseEvent) => void;
  onDateDoubleClick?: (date: Date, event: React.MouseEvent) => void;
  onEntryClick?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onEntryContextMenu?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  showNonCurrentDates: boolean;
  navLinks: boolean;
  maxVisible?: number;
  dateBackgrounds?: DateBackground[];
  dateRangeBackgrounds?: DateRangeBackground[];
  loadingRanges?: DateLoadingRange[];
  businessHours?: BusinessHours;
  moreLinkClick?: MoreLinkClickHandler;
}

const MonthGridCell: React.FC<MonthGridCellProps> = ({
  date, currentMonth, entries, renderEntry,
  onDateClick, onDateDoubleClick, onEntryClick, onEntryContextMenu,
  showNonCurrentDates, navLinks, maxVisible = 3,
  dateBackgrounds, dateRangeBackgrounds, loadingRanges, businessHours,
  moreLinkClick,
}) => {
  const { api } = useCalendarContext();
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const today = isToday(date);
  const dayNumber = format(date, 'd');
  const hiddenCount = Math.max(0, entries.length - maxVisible);
  const visibleEntries = entries.slice(0, maxVisible);
  const hiddenEntries = entries.slice(maxVisible);
  const bgColor = getDateBackgroundColor(date, dateBackgrounds, dateRangeBackgrounds);
  const isNonBusinessDay = businessHours ? !businessHours.daysOfWeek.includes(getDay(date)) : false;
  const loading = isDateLoading(date, loadingRanges);

  const handleDateClick = useCallback((e: React.MouseEvent) => {
    onDateClick?.(date, e);
  }, [date, onDateClick]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    onDateDoubleClick?.(date, e);
  }, [date, onDateDoubleClick]);

  if (!showNonCurrentDates && !isCurrentMonth) {
    return <div className="eui-cal-month-cell eui-cal-month-cell-hidden" role="gridcell" />;
  }

  const cellStyle = bgColor ? { backgroundColor: bgColor } as React.CSSProperties : undefined;

  return (
    <div
      className={cn('eui-cal-month-cell', {
        'eui-cal-month-cell-today': today,
        'eui-cal-month-cell-other': !isCurrentMonth,
        'eui-cal-month-cell-nonbusiness': isNonBusinessDay,
        'eui-cal-month-cell-loading': loading,
      })}
      style={cellStyle}
      onClick={handleDateClick}
      onDoubleClick={handleDoubleClick}
      role="gridcell"
      aria-label={format(date, 'EEEE, MMMM d, yyyy')}
    >
      <div className="eui-cal-month-cell-header">
        {navLinks ? (
          <button
            className={cn('eui-cal-month-cell-day', { 'eui-cal-month-cell-day-today': today })}
            type="button"
            tabIndex={0}
            aria-label={`Go to ${format(date, 'MMMM d')}`}
          >
            {dayNumber}
          </button>
        ) : (
          <span className={cn('eui-cal-month-cell-day', { 'eui-cal-month-cell-day-today': today })}>
            {dayNumber}
          </span>
        )}
      </div>
      {loading ? (
        <div className="eui-cal-month-cell-loader">
          <div className="eui-cal-loader-bar" />
          <div className="eui-cal-loader-bar" />
        </div>
      ) : (
        <div className="eui-cal-month-cell-entries">
          {visibleEntries.map(entry => (
            <CalendarEntry
              key={entry.id}
              entry={entry}
              context={{
                view: ViewMode.dayGridMonth,
                isCompact: true,
                width: 100,
                height: 20,
                isStart: true,
                isEnd: true,
                isContinuation: false,
              }}
              isAllDay
              renderEntry={renderEntry}
              onClick={onEntryClick}
              onContextMenu={onEntryContextMenu}
            />
          ))}
          {hiddenCount > 0 && (
            moreLinkClick === 'day' ? (
              <button
                className="eui-cal-overflow-trigger"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  api.gotoDate(date);
                  api.changeView(ViewMode.timeGridDay);
                }}
                aria-label={`Show ${hiddenCount} more entries`}
              >
                +{hiddenCount} more
              </button>
            ) : typeof moreLinkClick === 'function' ? (
              <button
                className="eui-cal-overflow-trigger"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  moreLinkClick({ date, entries: hiddenEntries });
                }}
                aria-label={`Show ${hiddenCount} more entries`}
              >
                +{hiddenCount} more
              </button>
            ) : (
              <OverflowPopover
                entries={hiddenEntries}
                triggerLabel={`+${hiddenCount} more`}
                onEntryClick={onEntryClick}
                onEntryContextMenu={onEntryContextMenu}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(MonthGridCell);
