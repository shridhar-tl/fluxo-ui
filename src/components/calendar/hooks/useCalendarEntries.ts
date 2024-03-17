import { useMemo } from 'react';
import type { CalendarEntry, ResolvedCalendarEntry, DateRange, EventDataTransformFn } from '../calendar-types';
import { resolveEntries, getEntriesForRange } from '../calendar-utils';

interface UseCalendarEntriesOptions {
  entries: CalendarEntry[];
  dateRange: DateRange;
  eventDataTransform?: EventDataTransformFn;
}

export function useCalendarEntries(options: UseCalendarEntriesOptions): ResolvedCalendarEntry[] {
  const { entries, dateRange, eventDataTransform } = options;

  const transformed = useMemo(
    () => eventDataTransform ? entries.map(eventDataTransform) : entries,
    [entries, eventDataTransform]
  );

  const resolved = useMemo(() => resolveEntries(transformed), [transformed]);

  const filtered = useMemo(
    () => getEntriesForRange(resolved, dateRange),
    [resolved, dateRange]
  );

  return filtered;
}
