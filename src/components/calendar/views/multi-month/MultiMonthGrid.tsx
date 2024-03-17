import React, { useMemo, useCallback } from 'react';
import { ViewMode } from '../../calendar-types';
import type { ViewProps, CalendarViewDefinition } from '../../calendar-types';
import {
  getDaysInRange, getEntriesForDay, getMonthRange, getWeekNumber,
  format, addMonths, subMonths, addDays,
} from '../../calendar-utils';
import MonthGridHeader from '../month-grid/MonthGridHeader';
import MonthGridCell from '../month-grid/MonthGridCell';

const MultiMonthGrid: React.FC<ViewProps> = ({
  currentDate, entries, config,
  onEntryClick, onEntryContextMenu, onDateClick, onDateDoubleClick,
  onEntryCreate,
  renderEntry, dateBackgrounds, dateRangeBackgrounds, loadingRanges,
}) => {
  const handleDoubleClick = useCallback((date: Date, event: React.MouseEvent) => {
    onDateDoubleClick?.(date, event);
    if (config.creatable && onEntryCreate) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      onEntryCreate({ start, end, allDay: true, view: ViewMode.multiMonth });
    }
  }, [onDateDoubleClick, onEntryCreate, config.creatable]);
  const months = useMemo(() => {
    const result: Date[] = [];
    for (let i = 0; i < config.multiMonthCount; i++) {
      result.push(addMonths(currentDate, i));
    }
    return result;
  }, [currentDate, config.multiMonthCount]);

  return (
    <div className="eui-cal-multi-month" role="grid" aria-label="Multi-month view">
      {months.map(monthDate => {
        const range = getMonthRange(monthDate, config.firstDayOfWeek);
        const days = getDaysInRange(range, config.hiddenDays);
        const visibleDaysPerWeek = 7 - config.hiddenDays.length;
        const weeks: Date[][] = [];
        for (let i = 0; i < days.length; i += visibleDaysPerWeek) {
          weeks.push(days.slice(i, i + visibleDaysPerWeek));
        }
        const gridStyle = {
          '--eui-cal-day-cols': config.weekNumbers ? visibleDaysPerWeek + 1 : visibleDaysPerWeek,
        } as React.CSSProperties;

        const entriesByDay = new Map<string, typeof entries>();
        for (const day of days) {
          const key = format(day, 'yyyy-MM-dd');
          entriesByDay.set(key, getEntriesForDay(entries, day));
        }

        return (
          <div key={monthDate.toISOString()} className="eui-cal-multi-month-item" style={gridStyle}>
            <div className="eui-cal-multi-month-title">
              {format(monthDate, config.monthHeaderFormat || 'MMMM yyyy')}
            </div>
            <MonthGridHeader
              firstDayOfWeek={config.firstDayOfWeek}
              hiddenDays={config.hiddenDays}
              weekNumbers={config.weekNumbers}
            />
            <div className="eui-cal-month-body">
              {weeks.map((week, wi) => (
                <div key={wi} className="eui-cal-month-row" role="row">
                  {config.weekNumbers && (
                    <div className="eui-cal-month-weeknum" role="rowheader">
                      {getWeekNumber(week[0], config.firstDayOfWeek)}
                    </div>
                  )}
                  {week.map(day => {
                    const key = format(day, 'yyyy-MM-dd');
                    return (
                      <MonthGridCell
                        key={key}
                        date={day}
                        currentMonth={monthDate}
                        entries={entriesByDay.get(key) ?? []}
                        renderEntry={renderEntry}
                        onDateClick={onDateClick}
                        onDateDoubleClick={handleDoubleClick}
                        onEntryClick={onEntryClick}
                        onEntryContextMenu={onEntryContextMenu}
                        showNonCurrentDates={config.showNonCurrentDates}
                        navLinks={config.navLinks}
                        maxVisible={2}
                        dateBackgrounds={dateBackgrounds}
                        dateRangeBackgrounds={dateRangeBackgrounds}
                        loadingRanges={loadingRanges}
                        businessHours={config.businessHours}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(MultiMonthGrid);

const defaultMultiMonthCount = 3;

function multiMonthRange(date: Date, firstDayOfWeek: number) {
  const start = getMonthRange(date, firstDayOfWeek).start;
  const end = getMonthRange(addMonths(date, defaultMultiMonthCount - 1), firstDayOfWeek).end;
  return { start, end };
}

export const multiMonthViewDef: CalendarViewDefinition = {
  name: ViewMode.multiMonth,
  label: 'Multi-Month',
  component: MultiMonthGrid,
  getDateRange: (date, firstDayOfWeek) => multiMonthRange(date, firstDayOfWeek),
  getTitle: (range) => {
    const s = addDays(range.start, 7);
    const e = addDays(range.end, -7);
    return `${format(s, 'MMM')} – ${format(e, 'MMM yyyy')}`;
  },
  navigate: (date, dir) => dir === 'prev' ? subMonths(date, defaultMultiMonthCount) : addMonths(date, defaultMultiMonthCount),
};
