import React from 'react';
import { ViewMode } from '../../calendar-types';
import type { ViewProps, CalendarViewDefinition } from '../../calendar-types';
import { format, addDays, subDays, startOfDay, endOfDay, isSameMonth, isSameYear } from '../../calendar-utils';
import TimeGrid from '../time-grid/TimeGrid';

function getNDayRange(date: Date, dayCount: number) {
  const start = startOfDay(date);
  const end = endOfDay(addDays(date, dayCount - 1));
  return { start, end };
}

function nDayTitle(range: { start: Date; end: Date }): string {
  const { start, end } = range;
  if (isSameMonth(start, end)) {
    return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`;
  }
  if (isSameYear(start, end)) {
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  }
  return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
}

const TimeGridCustomDays: React.FC<ViewProps> = (props) => (
  <TimeGrid {...props} />
);

export default React.memo(TimeGridCustomDays);

const knownNames: Record<number, string> = {
  3: ViewMode.timeGrid3Day,
  4: ViewMode.timeGrid4Day,
};

export function createTimeGridCustomDaysViewDef(dayCount: number, label?: string): CalendarViewDefinition {
  return {
    name: knownNames[dayCount] ?? `timeGrid${dayCount}Day`,
    label: label ?? `${dayCount} Days`,
    component: TimeGridCustomDays,
    getDateRange: (date) => getNDayRange(date, dayCount),
    getTitle: nDayTitle,
    navigate: (date, dir) => dir === 'prev' ? subDays(date, dayCount) : addDays(date, dayCount),
  };
}

export const threeDay = createTimeGridCustomDaysViewDef(3, '3 Days');
export const fourDay = createTimeGridCustomDaysViewDef(4, '4 Days');
