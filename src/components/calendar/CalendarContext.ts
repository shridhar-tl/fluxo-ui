import { createContext, useContext } from 'react';
import type { CalendarContextValue } from './calendar-types';

export const CalendarContext = createContext<CalendarContextValue | null>(null);

export function useCalendarContext(): CalendarContextValue {
  const ctx = useContext(CalendarContext);
  if (!ctx) {
    throw new Error('useCalendarContext must be used within a CalendarProvider');
  }
  return ctx;
}
