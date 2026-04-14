export interface TimeValue {
    hours: number;
    minutes: number;
    seconds: number;
}

export const pad = (n: number) => n.toString().padStart(2, '0');

export const parseTimeString = (input: string): TimeValue | null => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm|AM|PM)?$/);
    if (!ampmMatch) return null;
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const seconds = ampmMatch[3] ? parseInt(ampmMatch[3], 10) : 0;
    const ampm = ampmMatch[4]?.toLowerCase();
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) return null;
    return { hours, minutes, seconds };
};

export const formatTime = (value: TimeValue, format12: boolean, showSeconds: boolean): string => {
    const { hours, minutes, seconds } = value;
    if (format12) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const h12 = hours % 12 === 0 ? 12 : hours % 12;
        return `${pad(h12)}:${pad(minutes)}${showSeconds ? `:${pad(seconds)}` : ''} ${ampm}`;
    }
    return `${pad(hours)}:${pad(minutes)}${showSeconds ? `:${pad(seconds)}` : ''}`;
};

export const dateToTime = (date: Date): TimeValue => ({
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
});

export const timeToDate = (value: TimeValue, base?: Date): Date => {
    const d = base ? new Date(base) : new Date();
    d.setHours(value.hours, value.minutes, value.seconds, 0);
    return d;
};

export const normalizeValue = (raw: Date | string | TimeValue | null | undefined): TimeValue | null => {
    if (raw == null) return null;
    if (raw instanceof Date) return dateToTime(raw);
    if (typeof raw === 'string') return parseTimeString(raw);
    return raw;
};

export const buildRange = (start: number, end: number, step: number): number[] => {
    const result: number[] = [];
    for (let i = start; i <= end; i += step) result.push(i);
    return result;
};
