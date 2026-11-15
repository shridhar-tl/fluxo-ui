import type { PlacedEvent, ResourceTimelineEvent } from './resource-timeline-types';

const dayMs = 24 * 60 * 60 * 1000;

export function toDay(value: Date | string): Date {
    const date = typeof value === 'string' ? new Date(value) : new Date(value.getTime());
    date.setHours(0, 0, 0, 0);
    return date;
}

export function addDays(date: Date, days: number): Date {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
}

export function diffDays(a: Date, b: Date): number {
    const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((utcA - utcB) / dayMs);
}

export function eachDay(start: Date, end: Date): Date[] {
    const days: Date[] = [];
    const count = Math.max(0, diffDays(end, start));
    for (let i = 0; i <= count; i++) {
        days.push(addDays(start, i));
    }
    return days;
}

export function isSameDay(a: Date, b: Date): boolean {
    return diffDays(a, b) === 0;
}

/** Places the events of one resource into lanes so that bars overlapping in time never cover each other. */
export function packLanes(events: ResourceTimelineEvent[], rangeStart: Date, dayCount: number): { placed: PlacedEvent[]; laneCount: number } {
    const items = events
        .map((item) => {
            const start = toDay(item.start);
            const end = toDay(item.end);
            const startIndex = diffDays(start, rangeStart);
            const endIndex = diffDays(end < start ? start : end, rangeStart);
            return { item, startIndex, endIndex };
        })
        .filter((e) => e.endIndex >= 0 && e.startIndex < dayCount)
        .sort((a, b) => a.startIndex - b.startIndex || b.endIndex - a.endIndex);

    const laneEnds: number[] = [];
    const placed: PlacedEvent[] = items.map((e) => {
        let lane = laneEnds.findIndex((end) => end < e.startIndex);
        if (lane < 0) {
            lane = laneEnds.length;
            laneEnds.push(e.endIndex);
        } else {
            laneEnds[lane] = e.endIndex;
        }
        return { ...e, lane };
    });

    return { placed, laneCount: Math.max(1, laneEnds.length) };
}

export function groupMonths(days: Date[], locale?: string): { label: string; span: number }[] {
    const groups: { label: string; span: number }[] = [];
    for (const day of days) {
        const label = day.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
        const last = groups[groups.length - 1];
        if (last && last.label === label) {
            last.span++;
        } else {
            groups.push({ label, span: 1 });
        }
    }
    return groups;
}
