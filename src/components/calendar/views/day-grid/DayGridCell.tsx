import React, { useCallback, useMemo } from 'react';
import cn from 'classnames';
import { format, isToday, getDay } from 'date-fns';
import { ViewMode } from '../../calendar-types';
import type { ResolvedCalendarEntry, EntryRenderer, BusinessHours } from '../../calendar-types';
import { getEntriesForDay } from '../../calendar-utils';
import { CalendarEntry } from '../../entries';

interface DayGridCellProps {
  date: Date;
  entries: ResolvedCalendarEntry[];
  renderEntry?: EntryRenderer;
  navLinks: boolean;
  onDateClick?: (date: Date, event: React.MouseEvent) => void;
  onDateDoubleClick?: (date: Date, event: React.MouseEvent) => void;
  onEntryClick?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onEntryContextMenu?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  businessHours?: BusinessHours;
}

const DayGridCell: React.FC<DayGridCellProps> = ({
  date, entries, renderEntry, navLinks,
  onDateClick, onDateDoubleClick, onEntryClick, onEntryContextMenu, businessHours,
}) => {
  const today = isToday(date);
  const isNonBusinessDay = businessHours ? !businessHours.daysOfWeek.includes(getDay(date)) : false;
  const dayEntries = useMemo(() => getEntriesForDay(entries, date), [entries, date]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    onDateClick?.(date, e);
  }, [date, onDateClick]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    onDateDoubleClick?.(date, e);
  }, [date, onDateDoubleClick]);

  return (
    <div
      className={cn('eui-cal-daygrid-cell', {
        'eui-cal-daygrid-cell-today': today,
        'eui-cal-daygrid-cell-nonbusiness': isNonBusinessDay,
      })}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      role="gridcell"
      aria-label={format(date, 'EEEE, MMMM d, yyyy')}
    >
      <div className="eui-cal-daygrid-cell-header">
        {navLinks ? (
          <button
            className={cn('eui-cal-daygrid-cell-day', { 'eui-cal-daygrid-cell-day-today': today })}
            type="button"
          >
            {format(date, 'EEE d')}
          </button>
        ) : (
          <span className={cn('eui-cal-daygrid-cell-day', { 'eui-cal-daygrid-cell-day-today': today })}>
            {format(date, 'EEE d')}
          </span>
        )}
      </div>
      <div className="eui-cal-daygrid-cell-entries">
        {dayEntries.map(entry => (
          <CalendarEntry
            key={entry.id}
            entry={entry}
            isAllDay
            context={{
              view: ViewMode.dayGridWeek,
              isCompact: true,
              width: 100,
              height: 24,
              isStart: true,
              isEnd: true,
              isContinuation: false,
            }}
            renderEntry={renderEntry}
            onClick={onEntryClick}
            onContextMenu={onEntryContextMenu}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(DayGridCell);
