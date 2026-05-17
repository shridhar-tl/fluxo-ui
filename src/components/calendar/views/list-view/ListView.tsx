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
    const all = days.map(day => ({
      date: day,
      entries: getEntriesForDay(entries, day).sort(
        (a, b) => a.start.getTime() - b.start.getTime()
      ),
    }));
    return config.hideEmptyDays ? all.filter(d => d.entries.length > 0) : all;
  }, [days, entries, config.hideEmptyDays]);

  if (dayData.length === 0) {
    return (
      <div className="eui-cal-list-view eui-cal-list-view-empty" role="list" aria-label="List view">
        {config.renderEmpty ? (
          config.renderEmpty({ dateRange })
        ) : (
          <div className="eui-cal-empty-state">
            <svg className="eui-cal-empty-state-icon" viewBox="0 0 64 64" aria-hidden="true">
              <rect x="8" y="14" width="48" height="42" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path d="M8 24h48" stroke="currentColor" strokeWidth="2.5" />
              <path d="M20 8v12M44 8v12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="22" cy="36" r="2" fill="currentColor" />
              <circle cx="32" cy="36" r="2" fill="currentColor" />
              <circle cx="42" cy="36" r="2" fill="currentColor" />
            </svg>
            <div className="eui-cal-empty-state-message">{config.emptyMessage}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="eui-cal-list-view" role="list" aria-label="List view">
      {dayData.map(({ date, entries: dayEntries }) => (
        <ListViewGroup
          key={date.toISOString()}
          date={date}
          entries={dayEntries}
          emptyDayMessage={config.emptyDayMessage}
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
