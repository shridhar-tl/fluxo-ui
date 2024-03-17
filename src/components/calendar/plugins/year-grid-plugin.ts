import type { CalendarPlugin } from '../calendar-types';
import { yearGridViewDef } from '../views/year-grid';

export function yearGridPlugin(): CalendarPlugin {
  return {
    name: 'year-grid',
    views: [yearGridViewDef],
  };
}
