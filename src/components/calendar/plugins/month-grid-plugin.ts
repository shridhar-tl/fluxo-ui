import type { CalendarPlugin } from '../calendar-types';
import { monthGridViewDef } from '../views/month-grid';

export function monthGridPlugin(): CalendarPlugin {
  return {
    name: 'month-grid',
    views: [monthGridViewDef],
  };
}
