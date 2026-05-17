import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { ViewMode } from '../../calendar-types';
import type { ViewProps, CalendarViewDefinition } from '../../calendar-types';
import {
  getDaysInRange, getEntriesForDay, getMonthRange, getWeekNumber,
  format, addMonths, subMonths, addDays,
} from '../../calendar-utils';
import MonthGridHeader from '../month-grid/MonthGridHeader';
import MonthGridCell from '../month-grid/MonthGridCell';

const initialMonthsBefore = 2;
const initialMonthsAfter = 4;
const loadThreshold = 200;

const ScrollMonthView: React.FC<ViewProps> = ({
  currentDate, entries, config,
  onEntryClick, onEntryContextMenu, onDateClick, onDateDoubleClick,
  onEntryCreate, onVisibleRangeChange,
  renderEntry, dateBackgrounds, dateRangeBackgrounds, loadingRanges,
}) => {
  const handleDoubleClick = useCallback((date: Date, event: React.MouseEvent) => {
    onDateDoubleClick?.(date, event);
    if (config.creatable && onEntryCreate) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      onEntryCreate({ start, end, allDay: true, view: ViewMode.scrollMonth });
    }
  }, [onDateDoubleClick, onEntryCreate, config.creatable]);

  const [monthOffsets, setMonthOffsets] = useState<number[]>(() => {
    const offsets: number[] = [];
    for (let i = -initialMonthsBefore; i <= initialMonthsAfter; i++) {
      offsets.push(i);
    }
    return offsets;
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const months = useMemo(() => {
    return monthOffsets.map(offset => addMonths(currentDate, offset));
  }, [currentDate, monthOffsets]);

  const onVisibleRangeChangeRef = useRef(onVisibleRangeChange);
  onVisibleRangeChangeRef.current = onVisibleRangeChange;

  useEffect(() => {
    if (!onVisibleRangeChangeRef.current || months.length === 0) return;
    const firstMonth = months[0];
    const lastMonth = months[months.length - 1];
    const start = getMonthRange(firstMonth, config.firstDayOfWeek).start;
    const end = getMonthRange(lastMonth, config.firstDayOfWeek).end;
    onVisibleRangeChangeRef.current({ start, end });
  }, [months, config.firstDayOfWeek]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || loadingRef.current) return;

    if (el.scrollTop < loadThreshold) {
      loadingRef.current = true;
      setMonthOffsets(prev => {
        const min = Math.min(...prev);
        return [min - 2, min - 1, ...prev];
      });
      requestAnimationFrame(() => {
        loadingRef.current = false;
      });
    }

    if (el.scrollHeight - el.scrollTop - el.clientHeight < loadThreshold) {
      loadingRef.current = true;
      setMonthOffsets(prev => {
        const max = Math.max(...prev);
        return [...prev, max + 1, max + 2];
      });
      requestAnimationFrame(() => {
        loadingRef.current = false;
      });
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const currentMonthEl = el.querySelector('[data-month-offset="0"]');
    if (currentMonthEl) {
      currentMonthEl.scrollIntoView({ block: 'start' });
    }
  }, []);

  const visibleDaysPerWeek = 7 - config.hiddenDays.length;
  const cols = config.weekNumbers ? visibleDaysPerWeek + 1 : visibleDaysPerWeek;
  const gridStyle = { '--eui-cal-day-cols': cols } as React.CSSProperties;

  return (
    <div className="eui-cal-scroll-month" ref={scrollRef} onScroll={handleScroll} style={gridStyle}>
      {months.map((monthDate, idx) => {
        const offset = monthOffsets[idx];
        const range = getMonthRange(monthDate, config.firstDayOfWeek);
        const days = getDaysInRange(range, config.hiddenDays);
        const weeks: Date[][] = [];
        for (let i = 0; i < days.length; i += visibleDaysPerWeek) {
          weeks.push(days.slice(i, i + visibleDaysPerWeek));
        }

        const entriesByDay = new Map<string, typeof entries>();
        for (const day of days) {
          const key = format(day, 'yyyy-MM-dd');
          entriesByDay.set(key, getEntriesForDay(entries, day));
        }

        return (
          <div key={monthDate.toISOString()} className="eui-cal-scroll-month-section" data-month-offset={offset}>
            <div className="eui-cal-scroll-month-title" role="heading" aria-level={3}>
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
                        maxVisible={3}
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

export default React.memo(ScrollMonthView);

function scrollMonthRange(date: Date, firstDayOfWeek: number) {
  const start = getMonthRange(subMonths(date, initialMonthsBefore), firstDayOfWeek).start;
  const end = getMonthRange(addMonths(date, initialMonthsAfter), firstDayOfWeek).end;
  return { start, end };
}

export const scrollMonthViewDef: CalendarViewDefinition = {
  name: ViewMode.scrollMonth,
  label: 'Scroll Month',
  component: ScrollMonthView,
  getDateRange: (date, firstDayOfWeek) => scrollMonthRange(date, firstDayOfWeek),
  getTitle: (range) => {
    const s = addDays(range.start, 7);
    return format(s, 'MMMM yyyy');
  },
  navigate: (date, dir) => dir === 'prev' ? subMonths(date, 1) : addMonths(date, 1),
};
