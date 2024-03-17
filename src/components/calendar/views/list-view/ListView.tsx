import React, { useMemo } from 'react';
import { ViewMode } from '../../calendar-types';
import type { ViewProps, CalendarViewDefinition } from '../../calendar-types';
import {
  getDaysInRange, getEntriesForDay,
  getMonthRange, getWeekRange, getDayRange,
  format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
  isSameMonth, isSameYear,
} from '../../calendar-utils';

function monthTitle(range: { start: Date; end: Date }): string {
  return format(addDays(range.start, 7), 'MMMM yyyy');
}
import ListViewGroup from './ListViewGroup';

const ListView: React.FC<ViewProps> = ({
  entries, dateRange, config,
  onEntryClick, onEntryContextMenu,
  renderEntry,
}) => {
  const days = useMemo(
    () => getDaysInRange(dateRange, config.hiddenDays),
    [dateRange, config.hiddenDays]
  );

  const dayData = useMemo(() => {
    return days.map(day => ({
      date: day,
      entries: getEntriesForDay(entries, day).sort(
        (a, b) => a.start.getTime() - b.start.getTime()
      ),
    }));
  }, [days, entries]);

  return (
    <div className="eui-cal-list-view" role="list" aria-label="List view">
      {dayData.map(({ date, entries: dayEntries }) => (
        <ListViewGroup
          key={date.toISOString()}
          date={date}
          entries={dayEntries}
          renderEntry={renderEntry}
          onEntryClick={onEntryClick}
          onEntryContextMenu={onEntryContextMenu}
        />
      ))}
    </div>
  );
};

export default React.memo(ListView);

export const monthListViewDef: CalendarViewDefinition = {
  name: ViewMode.listMonth,
  label: 'Month (List)',
  component: ListView,
  getDateRange: (date, firstDayOfWeek) => getMonthRange(date, firstDayOfWeek),
  getTitle: monthTitle,
  navigate: (date, dir) => dir === 'prev' ? subMonths(date, 1) : addMonths(date, 1),
};

function weekListTitle(range: { start: Date; end: Date }): string {
  const { start, end } = range;
  if (isSameMonth(start, end)) return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`;
  if (isSameYear(start, end)) return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
}

export const weekListViewDef: CalendarViewDefinition = {
  name: ViewMode.listWeek,
  label: 'Week (List)',
  component: ListView,
  getDateRange: (date, firstDayOfWeek) => getWeekRange(date, firstDayOfWeek),
  getTitle: weekListTitle,
  navigate: (date, dir) => dir === 'prev' ? subWeeks(date, 1) : addWeeks(date, 1),
};

export const dayListViewDef: CalendarViewDefinition = {
  name: ViewMode.listDay,
  label: 'Day (List)',
  component: ListView,
  getDateRange: (date) => getDayRange(date),
  getTitle: (range) => format(range.start, 'EEEE, MMMM d, yyyy'),
  navigate: (date, dir) => dir === 'prev' ? subDays(date, 1) : addDays(date, 1),
};
