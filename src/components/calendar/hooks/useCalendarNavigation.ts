import { useState, useCallback, useMemo } from 'react';
import { ViewMode } from '../calendar-types';
import type { CalendarViewMode, DateRange, CalendarViewDefinition } from '../calendar-types';

interface UseCalendarNavigationOptions {
  initialDate?: Date;
  initialView?: CalendarViewMode;
  viewDefinitions: Map<string, CalendarViewDefinition>;
  firstDayOfWeek: number;
  dateAlignment?: number;
  onViewChange?: (view: CalendarViewMode) => void;
  onDateRangeChange?: (range: DateRange) => void;
}

interface UseCalendarNavigationReturn {
  currentDate: Date;
  viewMode: CalendarViewMode;
  dateRange: DateRange;
  title: string;
  setCurrentDate: (date: Date) => void;
  setViewMode: (mode: CalendarViewMode) => void;
  prev: () => void;
  next: () => void;
  today: () => void;
  gotoDate: (date: Date) => void;
}

export function useCalendarNavigation(options: UseCalendarNavigationOptions): UseCalendarNavigationReturn {
  const { initialDate, initialView = ViewMode.timeGridWeek, viewDefinitions, firstDayOfWeek, dateAlignment, onViewChange, onDateRangeChange } = options;

  const [currentDate, setCurrentDateState] = useState<Date>(initialDate ?? new Date());
  const [viewMode, setViewModeState] = useState<CalendarViewMode>(initialView);

  const viewDef = viewDefinitions.get(viewMode);

  const dateRange = useMemo<DateRange>(() => {
    if (!viewDef) return { start: new Date(), end: new Date() };
    return viewDef.getDateRange(currentDate, firstDayOfWeek);
  }, [viewDef, currentDate, firstDayOfWeek]);

  const title = useMemo<string>(() => {
    if (!viewDef) return '';
    return viewDef.getTitle(dateRange);
  }, [viewDef, dateRange]);

  const setCurrentDate = useCallback((date: Date) => {
    setCurrentDateState(date);
    if (viewDef) {
      const newRange = viewDef.getDateRange(date, firstDayOfWeek);
      onDateRangeChange?.(newRange);
    }
  }, [viewDef, firstDayOfWeek, onDateRangeChange]);

  const setViewMode = useCallback((mode: CalendarViewMode) => {
    setViewModeState(mode);
    onViewChange?.(mode);
    const def = viewDefinitions.get(mode);
    if (def) {
      const newRange = def.getDateRange(currentDate, firstDayOfWeek);
      onDateRangeChange?.(newRange);
    }
  }, [viewDefinitions, currentDate, firstDayOfWeek, onViewChange, onDateRangeChange]);

  const prev = useCallback(() => {
    if (!viewDef) return;
    if (dateAlignment && dateAlignment > 0) {
      const newDate = new Date(currentDate.getTime() - dateAlignment * 24 * 60 * 60 * 1000);
      setCurrentDate(newDate);
    } else {
      const newDate = viewDef.navigate(currentDate, 'prev');
      setCurrentDate(newDate);
    }
  }, [viewDef, currentDate, setCurrentDate, dateAlignment]);

  const next = useCallback(() => {
    if (!viewDef) return;
    if (dateAlignment && dateAlignment > 0) {
      const newDate = new Date(currentDate.getTime() + dateAlignment * 24 * 60 * 60 * 1000);
      setCurrentDate(newDate);
    } else {
      const newDate = viewDef.navigate(currentDate, 'next');
      setCurrentDate(newDate);
    }
  }, [viewDef, currentDate, setCurrentDate, dateAlignment]);

  const today = useCallback(() => {
    setCurrentDate(new Date());
  }, [setCurrentDate]);

  const gotoDate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, [setCurrentDate]);

  return {
    currentDate,
    viewMode,
    dateRange,
    title,
    setCurrentDate,
    setViewMode,
    prev,
    next,
    today,
    gotoDate,
  };
}
