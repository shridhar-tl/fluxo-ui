import type { CalendarPlugin } from '../calendar-types';
import { createTimeGridCustomDaysViewDef } from '../views/time-grid-custom';

export interface TimeGridCustomPluginOptions {
  dayCount: number;
  label?: string;
}

export function timeGridCustomPlugin(options: TimeGridCustomPluginOptions): CalendarPlugin {
  const viewDef = createTimeGridCustomDaysViewDef(options.dayCount, options.label);
  return {
    name: `time-grid-${options.dayCount}day`,
    views: [viewDef],
  };
}
