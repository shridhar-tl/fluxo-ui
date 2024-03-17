import type { CalendarPlugin } from '../calendar-types';
import { monthGridPlugin } from './month-grid-plugin';
import { timeGridPlugin } from './time-grid-plugin';
import { dayGridPlugin } from './day-grid-plugin';
import { listViewPlugin } from './list-view-plugin';
import { multiMonthPlugin } from './multi-month-plugin';
import { scrollMonthPlugin } from './scroll-month-plugin';

export const defaultPlugins: CalendarPlugin[] = [
  monthGridPlugin(),
  timeGridPlugin(),
  dayGridPlugin(),
  listViewPlugin(),
  multiMonthPlugin(),
  scrollMonthPlugin(),
];
