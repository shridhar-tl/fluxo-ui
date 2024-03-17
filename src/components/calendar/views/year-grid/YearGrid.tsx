import React, { useMemo } from 'react';
import cn from 'classnames';
import { ViewMode } from '../../calendar-types';
import type { ViewProps, CalendarViewDefinition, ResolvedCalendarEntry } from '../../calendar-types';
import {
  getEntriesForDay, getMonthRange,
  format, addYears, subYears,
  isToday, isSameMonth,
  getDaysInRange,
} from '../../calendar-utils';

function getYearRange(date: Date) {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  return { start, end };
}

interface MiniMonthProps {
  monthDate: Date;
  entries: ResolvedCalendarEntry[];
  firstDayOfWeek: number;
  hiddenDays: number[];
  onDateClick?: (date: Date, event: React.MouseEvent) => void;
  navLinks: boolean;
}

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const MiniMonth: React.FC<MiniMonthProps> = React.memo(({
  monthDate, entries, firstDayOfWeek, hiddenDays,
  onDateClick, navLinks,
}) => {
  const range = useMemo(() => getMonthRange(monthDate, firstDayOfWeek), [monthDate, firstDayOfWeek]);
  const days = useMemo(() => getDaysInRange(range, hiddenDays), [range, hiddenDays]);
  const visibleDaysPerWeek = 7 - hiddenDays.length;

  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += visibleDaysPerWeek) {
      result.push(days.slice(i, i + visibleDaysPerWeek));
    }
    return result;
  }, [days, visibleDaysPerWeek]);

  const entryCountByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const day of days) {
      if (isSameMonth(day, monthDate)) {
        const dayEntries = getEntriesForDay(entries, day);
        if (dayEntries.length > 0) {
          map.set(format(day, 'yyyy-MM-dd'), dayEntries.length);
        }
      }
    }
    return map;
  }, [entries, days, monthDate]);

  const orderedLabels = useMemo(() => {
    const labels: string[] = [];
    for (let i = 0; i < 7; i++) {
      if (!hiddenDays.includes((firstDayOfWeek + i) % 7)) {
        labels.push(dayLabels[(firstDayOfWeek + i) % 7]);
      }
    }
    return labels;
  }, [firstDayOfWeek, hiddenDays]);

  return (
    <div className="eui-cal-year-month">
      <div className="eui-cal-year-month-title">
        {format(monthDate, 'MMMM')}
      </div>
      <div className="eui-cal-year-month-header">
        {orderedLabels.map((label, i) => (
          <div key={i} className="eui-cal-year-month-daylabel">{label}</div>
        ))}
      </div>
      <div className="eui-cal-year-month-body">
        {weeks.map((week, wi) => (
          <div key={wi} className="eui-cal-year-month-row">
            {week.map(day => {
              const key = format(day, 'yyyy-MM-dd');
              const inMonth = isSameMonth(day, monthDate);
              const count = entryCountByDay.get(key) ?? 0;
              const today = isToday(day);

              return (
                <div
                  key={key}
                  className={cn('eui-cal-year-month-day', {
                    'eui-cal-year-day-other': !inMonth,
                    'eui-cal-year-day-today': today,
                    'eui-cal-year-day-has-events': count > 0,
                    'eui-cal-year-day-clickable': navLinks && inMonth,
                  })}
                  role="gridcell"
                  aria-label={format(day, 'EEEE, MMMM d, yyyy')}
                  onClick={navLinks && inMonth && onDateClick ? (e) => onDateClick(day, e) : undefined}
                >
                  <span className="eui-cal-year-day-num">{day.getDate()}</span>
                  {count > 0 && inMonth && (
                    <span
                      className={cn('eui-cal-year-day-dot', {
                        'eui-cal-year-day-dot-multi': count > 2,
                      })}
                      aria-label={`${count} event${count > 1 ? 's' : ''}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});

const YearGrid: React.FC<ViewProps> = ({
  currentDate, entries, config,
  onDateClick,
}) => {
  const year = currentDate.getFullYear();

  const months = useMemo(() => {
    const result: Date[] = [];
    for (let m = 0; m < 12; m++) {
      result.push(new Date(year, m, 1));
    }
    return result;
  }, [year]);

  return (
    <div className="eui-cal-year-grid" role="grid" aria-label={`Year ${year}`}>
      {months.map(monthDate => (
        <MiniMonth
          key={monthDate.getMonth()}
          monthDate={monthDate}
          entries={entries}
          firstDayOfWeek={config.firstDayOfWeek}
          hiddenDays={config.hiddenDays}
          onDateClick={onDateClick}
          navLinks={config.navLinks}
        />
      ))}
    </div>
  );
};

export default React.memo(YearGrid);

export const yearGridViewDef: CalendarViewDefinition = {
  name: ViewMode.yearGrid,
  label: 'Year',
  component: YearGrid,
  getDateRange: (date) => getYearRange(date),
  getTitle: (range) => format(range.start, 'yyyy'),
  navigate: (date, dir) => dir === 'prev' ? subYears(date, 1) : addYears(date, 1),
};
