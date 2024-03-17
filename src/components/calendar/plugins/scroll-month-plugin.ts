import type { CalendarPlugin } from '../calendar-types';
import { scrollMonthViewDef } from '../views/scroll-month';

export function scrollMonthPlugin(): CalendarPlugin {
  return {
    name: 'scroll-month',
    views: [scrollMonthViewDef],
  };
}
