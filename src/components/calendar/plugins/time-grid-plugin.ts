import type { CalendarPlugin } from '../calendar-types';
import { weekTimeGridViewDef, dayTimeGridViewDef } from '../views/time-grid';

export function timeGridPlugin(): CalendarPlugin {
  return {
    name: 'time-grid',
    views: [weekTimeGridViewDef, dayTimeGridViewDef],
  };
}
