import React, { useMemo, useCallback } from 'react';
import cn from 'classnames';
import { ViewMode } from '../../calendar-types';
import type { ViewProps, CalendarViewDefinition } from '../../calendar-types';
import { getDaysInRange, getEntriesForDay, getMonthRange, format, addMonths, subMonths, addDays, getWeekNumber } from '../../calendar-utils';
import MonthGridHeader from './MonthGridHeader';
import MonthGridCell from './MonthGridCell';

const MonthGrid: React.FC<ViewProps> = ({
  currentDate, entries, dateRange, config,
  onEntryClick, onEntryContextMenu, onDateClick, onDateDoubleClick,
  onEntryCreate,
  renderEntry, dateBackgrounds, dateRangeBackgrounds, loadingRanges,
}) => {
  const days = useMemo(
    () => getDaysInRange(dateRange, config.hiddenDays),
    [dateRange, config.hiddenDays]
  );

  const visibleDaysPerWeek = 7 - config.hiddenDays.length;

  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += visibleDaysPerWeek) {
      result.push(days.slice(i, i + visibleDaysPerWeek));
    }
    if (config.fixedWeekCount) {
      while (result.length < 6) {
        const lastWeek = result[result.length - 1];
        const lastDay = lastWeek[lastWeek.length - 1];
        const nextWeek: Date[] = [];
        for (let d = 1; d <= visibleDaysPerWeek; d++) {
          nextWeek.push(addDays(lastDay, d));
        }
        result.push(nextWeek);
      }
    }
    return result;
  }, [days, visibleDaysPerWeek, config.fixedWeekCount]);

  const entriesByDay = useMemo(() => {
    const map = new Map<string, typeof entries>();
    const allDays = weeks.flat();
    for (const day of allDays) {
      const key = format(day, 'yyyy-MM-dd');
      if (!map.has(key)) {
        map.set(key, getEntriesForDay(entries, day));
      }
    }
    return map;
  }, [entries, weeks]);

  const handleDoubleClick = useCallback((date: Date, event: React.MouseEvent) => {
    onDateDoubleClick?.(date, event);
    if (config.creatable && onEntryCreate) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start.getTime() + config.eventDefaultDuration * 60000);
      onEntryCreate({ start, end, allDay: config.eventDefaultDuration >= 1440, view: ViewMode.dayGridMonth });
    }
  }, [onDateDoubleClick, onEntryCreate, config.creatable, config.eventDefaultDuration]);

  const handleWeekNumberClick = useCallback((weekNumber: number, date: Date, event: React.MouseEvent) => {
    config.weekNumberClick?.(weekNumber, date, event);
  }, [config.weekNumberClick]);

  const cols = config.weekNumbers ? visibleDaysPerWeek + 1 : visibleDaysPerWeek;
  const gridStyle = { '--eui-cal-day-cols': cols } as React.CSSProperties;

  return (
    <div className="eui-cal-month-grid" role="grid" aria-label="Month view" style={gridStyle}>
      <MonthGridHeader
        firstDayOfWeek={config.firstDayOfWeek}
        hiddenDays={config.hiddenDays}
        weekNumbers={config.weekNumbers}
      />
      <div className={cn('eui-cal-month-body', { 'eui-cal-month-body-expand': config.expandRows })}>
        {weeks.map((week, wi) => (
          <div key={wi} className="eui-cal-month-row" role="row">
            {config.weekNumbers && (() => {
              const wn = getWeekNumber(week[0], config.firstDayOfWeek);
              return (
                <div
                  className={cn('eui-cal-month-weeknum', { 'eui-cal-month-weeknum-clickable': config.weekNumberClick })}
                  role="rowheader"
                  aria-label={`Week ${wn}`}
                  onClick={config.weekNumberClick ? (e) => handleWeekNumberClick(wn, week[0], e) : undefined}
                >
                  {config.weekText}{wn}
                </div>
              );
            })()}
            {week.map(day => {
              const key = format(day, 'yyyy-MM-dd');
              return (
                <MonthGridCell
                  key={key}
                  date={day}
                  currentMonth={currentDate}
                  entries={entriesByDay.get(key) ?? []}
                  renderEntry={renderEntry}
                  onDateClick={onDateClick}
                  onDateDoubleClick={handleDoubleClick}
                  onEntryClick={onEntryClick}
                  onEntryContextMenu={onEntryContextMenu}
                  showNonCurrentDates={config.showNonCurrentDates}
                  navLinks={config.navLinks}
                  dateBackgrounds={dateBackgrounds}
                  dateRangeBackgrounds={dateRangeBackgrounds}
                  loadingRanges={loadingRanges}
                  businessHours={config.businessHours}
                  moreLinkClick={config.moreLinkClick}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(MonthGrid);

export const monthGridViewDef: CalendarViewDefinition = {
  name: ViewMode.dayGridMonth,
  label: 'Month',
  component: MonthGrid,
  getDateRange: (date, firstDayOfWeek) => getMonthRange(date, firstDayOfWeek),
  getTitle: (range) => format(addDays(range.start, 7), 'MMMM yyyy'),
  navigate: (date, dir) => dir === 'prev' ? subMonths(date, 1) : addMonths(date, 1),
};
