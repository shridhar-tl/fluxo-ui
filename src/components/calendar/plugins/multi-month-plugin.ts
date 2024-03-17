import type { CalendarPlugin } from '../calendar-types';
import { multiMonthViewDef } from '../views/multi-month';

export function multiMonthPlugin(): CalendarPlugin {
  return {
    name: 'multi-month',
    views: [multiMonthViewDef],
  };
}
