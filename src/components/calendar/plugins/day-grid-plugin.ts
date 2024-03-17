import type { CalendarPlugin } from '../calendar-types';
import { weekDayGridViewDef, dayGridViewDef } from '../views/day-grid';

export function dayGridPlugin(): CalendarPlugin {
  return {
    name: 'day-grid',
    views: [weekDayGridViewDef, dayGridViewDef],
  };
}
