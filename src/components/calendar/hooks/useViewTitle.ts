import { useMemo } from 'react';
import { format, isSameMonth, isSameYear } from 'date-fns';
import { ViewMode } from '../calendar-types';
import type { DateRange, CalendarViewMode } from '../calendar-types';

export function useViewTitle(viewMode: CalendarViewMode, dateRange: DateRange): string {
  return useMemo(() => {
    const { start, end } = dateRange;

    switch (viewMode) {
      case ViewMode.dayGridMonth:
      case ViewMode.listMonth:
        return format(start, 'MMMM yyyy');

      case ViewMode.timeGridWeek:
      case ViewMode.dayGridWeek:
      case ViewMode.listWeek:
        if (isSameMonth(start, end)) {
          return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`;
        }
        if (isSameYear(start, end)) {
          return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
        }
        return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;

      case ViewMode.timeGridDay:
      case ViewMode.dayGridDay:
      case ViewMode.listDay:
        return format(start, 'EEEE, MMMM d, yyyy');

      default:
        return format(start, 'MMMM yyyy');
    }
  }, [viewMode, dateRange]);
}
