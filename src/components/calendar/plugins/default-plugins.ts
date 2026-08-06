import type { CalendarPlugin } from '../calendar-types';
import { monthGridPlugin } from './month-grid-plugin';
import { timeGridPlugin } from './time-grid-plugin';
import { dayGridPlugin } from './day-grid-plugin';
import { listViewPlugin } from './list-view-plugin';
import { multiMonthPlugin } from './multi-month-plugin';
import { scrollMonthPlugin } from './scroll-month-plugin';

let cachedDefaultPlugins: CalendarPlugin[] | null = null;

export function getDefaultPlugins(): CalendarPlugin[] {
  if (!cachedDefaultPlugins) {
    cachedDefaultPlugins = [
      monthGridPlugin(),
      timeGridPlugin(),
      dayGridPlugin(),
      listViewPlugin(),
      multiMonthPlugin(),
      scrollMonthPlugin(),
    ];
  }
  return cachedDefaultPlugins;
}

export const defaultPlugins: CalendarPlugin[] = new Proxy([] as CalendarPlugin[], {
  get(_target, prop, receiver) {
    return Reflect.get(getDefaultPlugins(), prop, receiver);
  },
  has(_target, prop) {
    return Reflect.has(getDefaultPlugins(), prop);
  },
  ownKeys() {
    return Reflect.ownKeys(getDefaultPlugins());
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Reflect.getOwnPropertyDescriptor(getDefaultPlugins(), prop);
  },
});
