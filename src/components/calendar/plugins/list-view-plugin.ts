import type { CalendarPlugin } from '../calendar-types';
import { monthListViewDef, weekListViewDef, dayListViewDef } from '../views/list-view';

export function listViewPlugin(): CalendarPlugin {
  return {
    name: 'list-view',
    views: [monthListViewDef, weekListViewDef, dayListViewDef],
  };
}
