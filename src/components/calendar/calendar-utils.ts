import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addWeeks, addMonths, subDays, subWeeks, subMonths,
  addYears, subYears,
  format, isSameDay, isSameMonth, isSameYear, isToday, isWithinInterval,
  differenceInMinutes, differenceInDays, differenceInCalendarDays,
  setHours, setMinutes, getDay, getHours, getMinutes,
  eachDayOfInterval, startOfDay, endOfDay, isAfter, isBefore,
  parseISO, isValid, max, min, getWeek,
} from 'date-fns';
import type {
  CalendarEntry, ResolvedCalendarEntry, DateRange, TimeFormat,
  PositionedEntry, CalendarConfig, ModifierKeys,
} from './calendar-types';
import { slotHeight } from './calendar-constants';

export function resolveEntry(entry: CalendarEntry): ResolvedCalendarEntry {
  const start = typeof entry.start === 'string' ? parseISO(entry.start) : entry.start;
  const end = typeof entry.end === 'string' ? parseISO(entry.end) : entry.end;
  return {
    ...entry,
    start: isValid(start) ? start : new Date(),
    end: isValid(end) ? end : new Date(),
    originalEntry: entry,
  };
}

export function resolveEntries(entries: CalendarEntry[]): ResolvedCalendarEntry[] {
  return entries.map(resolveEntry);
}

export function getEntriesForRange(
  entries: ResolvedCalendarEntry[],
  range: DateRange
): ResolvedCalendarEntry[] {
  return entries.filter(entry => {
    const entryStart = startOfDay(entry.start);
    const entryEnd = entry.allDay ? endOfDay(entry.end) : entry.end;
    return (
      isBefore(entryStart, range.end) && isAfter(entryEnd, range.start)
    );
  });
}

export function getEntriesForDay(
  entries: ResolvedCalendarEntry[],
  date: Date,
  entryOrder?: (a: ResolvedCalendarEntry, b: ResolvedCalendarEntry) => number
): ResolvedCalendarEntry[] {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  const filtered = entries.filter(entry => {
    const entryEnd = entry.allDay ? endOfDay(entry.end) : entry.end;
    return isBefore(entry.start, dayEnd) && isAfter(entryEnd, dayStart);
  });
  if (entryOrder) filtered.sort(entryOrder);
  return filtered;
}

export function getTimedEntries(entries: ResolvedCalendarEntry[]): ResolvedCalendarEntry[] {
  return entries.filter(e => !e.allDay);
}

export function getAllDayEntries(entries: ResolvedCalendarEntry[]): ResolvedCalendarEntry[] {
  return entries.filter(e => e.allDay);
}

export function getMultiDayEntries(entries: ResolvedCalendarEntry[]): ResolvedCalendarEntry[] {
  return entries.filter(e => !e.allDay && !isSameDay(e.start, e.end));
}

export function getWeekRange(date: Date, firstDayOfWeek: number): DateRange {
  const start = startOfWeek(date, { weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
  const end = endOfWeek(date, { weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
  return { start: startOfDay(start), end: endOfDay(end) };
}

export function getMonthRange(date: Date, firstDayOfWeek: number): DateRange {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const start = startOfWeek(monthStart, { weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
  const end = endOfWeek(monthEnd, { weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
  return { start: startOfDay(start), end: endOfDay(end) };
}

export function getDayRange(date: Date): DateRange {
  return { start: startOfDay(date), end: endOfDay(date) };
}

export function getDaysInRange(range: DateRange, hiddenDays: number[] = []): Date[] {
  const days = eachDayOfInterval({ start: range.start, end: range.end });
  if (hiddenDays.length === 0) return days;
  return days.filter(d => !hiddenDays.includes(getDay(d)));
}

export function navigateMonth(date: Date, direction: 'prev' | 'next'): Date {
  return direction === 'prev' ? subMonths(date, 1) : addMonths(date, 1);
}

export function navigateWeek(date: Date, direction: 'prev' | 'next'): Date {
  return direction === 'prev' ? subWeeks(date, 1) : addWeeks(date, 1);
}

export function navigateDay(date: Date, direction: 'prev' | 'next'): Date {
  return direction === 'prev' ? subDays(date, 1) : addDays(date, 1);
}

export function formatTime(date: Date, timeFormat: TimeFormat): string {
  return timeFormat === '12h' ? format(date, 'h:mm a') : format(date, 'HH:mm');
}

export function formatHour(hour: number, timeFormat: TimeFormat): string {
  const date = setMinutes(setHours(new Date(), hour), 0);
  return timeFormat === '12h' ? format(date, 'h a') : format(date, 'HH:00');
}

export function getTimeSlots(
  startHour: number,
  endHour: number,
  slotDuration: number
): { hour: number; minute: number }[] {
  const slots: { hour: number; minute: number }[] = [];
  const totalMinutes = (endHour - startHour) * 60;
  for (let m = 0; m < totalMinutes; m += slotDuration) {
    const hour = startHour + Math.floor(m / 60);
    const minute = m % 60;
    slots.push({ hour, minute });
  }
  return slots;
}

export function getMinuteOffset(date: Date, startHour: number): number {
  const hours = getHours(date);
  const minutes = getMinutes(date);
  return (hours - startHour) * 60 + minutes;
}

export function minuteOffsetToPixels(
  minutes: number,
  slotDuration: number,
  slotHeightPx: number = slotHeight
): number {
  return (minutes / slotDuration) * slotHeightPx;
}

export function pixelsToMinuteOffset(
  pixels: number,
  slotDuration: number,
  slotHeightPx: number = slotHeight
): number {
  return (pixels / slotHeightPx) * slotDuration;
}

export function snapToSlot(minutes: number, snapDuration: number): number {
  return Math.round(minutes / snapDuration) * snapDuration;
}

export function dateFromMinuteOffset(baseDate: Date, minutes: number, _startHour: number): Date {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return setMinutes(setHours(startOfDay(baseDate), h), m);
}

export function positionTimedEntries(
  entries: ResolvedCalendarEntry[],
  date: Date,
  config: CalendarConfig
): PositionedEntry[] {
  const dayStart = config.visibleHoursStart;
  const dayEntries = getTimedEntries(getEntriesForDay(entries, date)).sort(
    (a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime()
  );

  const bounds = new Map<string | number, { startMin: number; endMin: number }>();
  for (const entry of dayEntries) {
    const startMin = Math.max(getMinuteOffset(entry.start, dayStart), 0);
    const rawEndMin = Math.max(getMinuteOffset(entry.end, dayStart), startMin + config.slotDuration);
    const minHeightMin = pixelsToMinuteOffset(config.minEntryHeight, config.slotDuration, config.slotHeight);
    const endMin = Math.max(rawEndMin, startMin + minHeightMin);
    bounds.set(entry.id, { startMin, endMin });
  }

  const clusters: ResolvedCalendarEntry[][] = [];
  let current: ResolvedCalendarEntry[] = [];
  let clusterEndMin = -Infinity;
  for (const entry of dayEntries) {
    const { startMin, endMin } = bounds.get(entry.id)!;
    if (current.length === 0 || startMin < clusterEndMin) {
      current.push(entry);
      clusterEndMin = Math.max(clusterEndMin, endMin);
    } else {
      clusters.push(current);
      current = [entry];
      clusterEndMin = endMin;
    }
  }
  if (current.length > 0) {
    clusters.push(current);
  }

  const maxStack = config.maxStackCount > 0 ? config.maxStackCount : Infinity;
  const positioned: PositionedEntry[] = [];

  clusters.forEach((cluster, clusterIndex) => {
    const lanes: ResolvedCalendarEntry[][] = [];
    const laneOf = new Map<string | number, number>();
    for (const entry of cluster) {
      const { startMin } = bounds.get(entry.id)!;
      let placed = false;
      for (let l = 0; l < lanes.length; l++) {
        const last = lanes[l][lanes[l].length - 1];
        if (startMin >= bounds.get(last.id)!.endMin) {
          lanes[l].push(entry);
          laneOf.set(entry.id, l);
          placed = true;
          break;
        }
      }
      if (!placed) {
        laneOf.set(entry.id, lanes.length);
        lanes.push([entry]);
      }
    }

    const laneCount = lanes.length;
    const hasOverflow = laneCount > maxStack;
    const entryLaneLimit = hasOverflow ? maxStack - 1 : laneCount;
    const totalSlots = hasOverflow ? maxStack : laneCount;
    const slotWidth = 100 / totalSlots;

    for (const entry of cluster) {
      const { startMin, endMin } = bounds.get(entry.id)!;
      const lane = laneOf.get(entry.id) ?? 0;
      const top = minuteOffsetToPixels(startMin, config.slotDuration, config.slotHeight);
      const height = minuteOffsetToPixels(endMin - startMin, config.slotDuration, config.slotHeight);
      const isOverflow = lane >= entryLaneLimit;
      const left = isOverflow ? 0 : lane * slotWidth;

      positioned.push({
        entry,
        top,
        height,
        left,
        width: slotWidth,
        column: lane,
        totalColumns: laneCount,
        cluster: clusterIndex,
        isOverflow,
      });
    }
  });

  return positioned;
}

export function isBusinessHour(
  date: Date,
  hour: number,
  businessHours: { daysOfWeek: number[]; startTime: string; endTime: string }
): boolean {
  const dayOfWeek = getDay(date);
  if (!businessHours.daysOfWeek.includes(dayOfWeek)) return false;
  const [startH] = businessHours.startTime.split(':').map(Number);
  const [endH] = businessHours.endTime.split(':').map(Number);
  return hour >= startH && hour < endH;
}

export function isCurrentMonth(date: Date, currentDate: Date): boolean {
  return isSameMonth(date, currentDate);
}

export function getModifierKeys(event: { altKey: boolean; ctrlKey: boolean; shiftKey: boolean; metaKey: boolean }): ModifierKeys {
  return {
    alt: event.altKey,
    ctrl: event.ctrlKey,
    shift: event.shiftKey,
    meta: event.metaKey,
  };
}

export function getWeekNumber(date: Date, firstDayOfWeek: number): number {
  return getWeek(date, { weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
}

export function clampHour(hour: number, visibleStart: number, visibleEnd: number): number {
  return Math.max(visibleStart, Math.min(visibleEnd, hour));
}

export function entrySpansDays(entry: ResolvedCalendarEntry): number {
  return differenceInCalendarDays(entry.end, entry.start) + 1;
}

export function getEntryDaySegments(
  entry: ResolvedCalendarEntry,
  range: DateRange
): { date: Date; isStart: boolean; isEnd: boolean }[] {
  const segStart = max([entry.start, range.start]);
  const segEnd = min([entry.end, range.end]);
  const days = eachDayOfInterval({ start: startOfDay(segStart), end: startOfDay(segEnd) });
  return days.map(date => ({
    date,
    isStart: isSameDay(date, entry.start),
    isEnd: isSameDay(date, entry.end),
  }));
}

export function getDateBackgroundColor(
  date: Date,
  dateBackgrounds?: { date: Date | string; color: string }[],
  dateRangeBackgrounds?: { start: Date | string; end: Date | string; color: string }[]
): string | undefined {
  if (dateBackgrounds) {
    for (const bg of dateBackgrounds) {
      const bgDate = typeof bg.date === 'string' ? parseISO(bg.date) : bg.date;
      if (isSameDay(date, bgDate)) return bg.color;
    }
  }
  if (dateRangeBackgrounds) {
    for (const bg of dateRangeBackgrounds) {
      const s = typeof bg.start === 'string' ? parseISO(bg.start) : bg.start;
      const e = typeof bg.end === 'string' ? parseISO(bg.end) : bg.end;
      if (isWithinInterval(date, { start: startOfDay(s), end: endOfDay(e) })) return bg.color;
    }
  }
  return undefined;
}

export function isDateLoading(
  date: Date,
  loadingRanges?: { start: Date | string; end: Date | string }[]
): boolean {
  if (!loadingRanges) return false;
  for (const r of loadingRanges) {
    const s = typeof r.start === 'string' ? parseISO(r.start) : r.start;
    const e = typeof r.end === 'string' ? parseISO(r.end) : r.end;
    if (isWithinInterval(date, { start: startOfDay(s), end: endOfDay(e) })) return true;
  }
  return false;
}

export {
  isSameDay, isSameMonth, isSameYear, isToday, isWithinInterval,
  startOfDay, endOfDay, startOfMonth, endOfMonth,
  addDays, addWeeks, addMonths, subDays, subWeeks, subMonths,
  addYears, subYears,
  format, getDay, getHours, getMinutes, setHours, setMinutes,
  differenceInMinutes, differenceInDays, parseISO,
};
