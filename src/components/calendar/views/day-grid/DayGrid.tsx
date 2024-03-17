import React, { useMemo, useCallback } from 'react';
import { ViewMode } from '../../calendar-types';
import type { ViewProps, CalendarViewDefinition } from '../../calendar-types';
import {
  getDaysInRange, getWeekRange, getDayRange,
  format, addWeeks, subWeeks, addDays, subDays,
  isSameMonth, isSameYear,
} from '../../calendar-utils';
import DayGridCell from './DayGridCell';

interface DayGridProps extends ViewProps {
  singleDay?: boolean;
}

const DayGrid: React.FC<DayGridProps> = ({
  entries, dateRange, config, singleDay,
  onEntryClick, onEntryContextMenu, onDateClick, onDateDoubleClick,
  onEntryCreate,
  renderEntry,
}) => {
  const days = useMemo(
    () => getDaysInRange(dateRange, config.hiddenDays),
    [dateRange, config.hiddenDays]
  );

  const handleDoubleClick = useCallback((date: Date, event: React.MouseEvent) => {
    onDateDoubleClick?.(date, event);
    if (config.creatable && onEntryCreate) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      onEntryCreate({ start, end, allDay: true, view: singleDay ? ViewMode.dayGridDay : ViewMode.dayGridWeek });
    }
  }, [onDateDoubleClick, onEntryCreate, config.creatable, singleDay]);

  return (
    <div className="eui-cal-daygrid" role="grid" aria-label="Day grid view">
      {days.map(day => (
        <DayGridCell
          key={day.toISOString()}
          date={day}
          entries={entries}
          renderEntry={renderEntry}
          navLinks={config.navLinks}
          businessHours={config.businessHours}
          onDateClick={onDateClick}
          onDateDoubleClick={handleDoubleClick}
          onEntryClick={onEntryClick}
          onEntryContextMenu={onEntryContextMenu}
        />
      ))}
    </div>
  );
};

export default React.memo(DayGrid);

function weekDayGridTitle(range: { start: Date; end: Date }): string {
  const { start, end } = range;
  if (isSameMonth(start, end)) {
    return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`;
  }
  if (isSameYear(start, end)) {
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  }
  return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
}

export const weekDayGridViewDef: CalendarViewDefinition = {
  name: ViewMode.dayGridWeek,
  label: 'Week (Day)',
  component: DayGrid,
  getDateRange: (date, firstDayOfWeek) => getWeekRange(date, firstDayOfWeek),
  getTitle: weekDayGridTitle,
  navigate: (date, dir) => dir === 'prev' ? subWeeks(date, 1) : addWeeks(date, 1),
};

const SingleDayGrid: React.FC<ViewProps> = (props) => <DayGrid {...props} singleDay />;

export const dayGridViewDef: CalendarViewDefinition = {
  name: ViewMode.dayGridDay,
  label: 'Day (Grid)',
  component: SingleDayGrid,
  getDateRange: (date) => getDayRange(date),
  getTitle: (range) => format(range.start, 'EEEE, MMMM d, yyyy'),
  navigate: (date, dir) => dir === 'prev' ? subDays(date, 1) : addDays(date, 1),
};
