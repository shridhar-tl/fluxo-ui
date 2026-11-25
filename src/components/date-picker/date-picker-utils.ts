import { addDays, format as formatDateFns, getISOWeek, isValid, parse, startOfDay, startOfMonth, startOfWeek } from 'date-fns';

import type { DatePickerDisabledDates, DayOfWeek } from './date-picker-types';

export const defaultFormat = 'MMM d, yyyy';

export const buildMonthGrid = (month: Date, firstDayOfWeek: DayOfWeek, fixedWeeks: boolean): Date[][] => {
    const first = startOfMonth(month);
    let cursor = startOfWeek(first, { weekStartsOn: firstDayOfWeek });
    const weeks: Date[][] = [];
    const targetMonth = first.getMonth();
    for (let w = 0; w < 6; w++) {
        const week: Date[] = [];
        for (let d = 0; d < 7; d++) {
            week.push(cursor);
            cursor = addDays(cursor, 1);
        }
        weeks.push(week);
        if (!fixedWeeks && cursor.getMonth() !== targetMonth && w >= 3) break;
    }
    return weeks;
};

export const weekNumber = (week: Date[]): number => getISOWeek(week.find((day) => day.getDay() === 4) ?? week[0]);

const formatterCache = new Map<string, Intl.DateTimeFormat>();

const getFormatter = (locale: string | undefined, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat => {
    const key = `${locale ?? ''}|${JSON.stringify(options)}`;
    let formatter = formatterCache.get(key);
    if (!formatter) {
        formatter = new Intl.DateTimeFormat(locale, options);
        formatterCache.set(key, formatter);
    }
    return formatter;
};

export const weekdayNames = (locale: string | undefined, firstDayOfWeek: DayOfWeek): { short: string; long: string }[] => {
    const base = startOfWeek(new Date(2024, 0, 10), { weekStartsOn: firstDayOfWeek });
    const shortFormatter = getFormatter(locale, { weekday: 'short' });
    const longFormatter = getFormatter(locale, { weekday: 'long' });
    return Array.from({ length: 7 }, (_, i) => {
        const day = addDays(base, i);
        return { short: shortFormatter.format(day).slice(0, 2), long: longFormatter.format(day) };
    });
};

export const monthNames = (locale: string | undefined, style: 'short' | 'long'): string[] => {
    const formatter = getFormatter(locale, { month: style });
    return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2024, i, 1)));
};

export const monthYearLabel = (date: Date, locale: string | undefined): string =>
    getFormatter(locale, { month: 'long', year: 'numeric' }).format(date);

export const fullDateLabel = (date: Date, locale: string | undefined): string =>
    getFormatter(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(date);

export const formatDisplay = (date: Date, pattern: string | undefined, locale: string | undefined): string => {
    if (pattern) return formatDateFns(date, pattern);
    if (locale) return getFormatter(locale, { dateStyle: 'medium' }).format(date);
    return formatDateFns(date, defaultFormat);
};

const fallbackPatterns = ['yyyy-MM-dd', 'MM/dd/yyyy', 'M/d/yyyy', 'dd.MM.yyyy', 'MMM d, yyyy', 'MMMM d, yyyy', 'd MMM yyyy'];

const normalizeWord = (word: string): string => word.toLocaleLowerCase().replace(/\./g, '');

const localePartOrder = (locale: string): ('day' | 'month' | 'year')[] =>
    getFormatter(locale, { dateStyle: 'medium' })
        .formatToParts(new Date(2024, 10, 25))
        .map((part) => part.type)
        .filter((type): type is 'day' | 'month' | 'year' => type === 'day' || type === 'month' || type === 'year');

const buildDate = (year: number, month: number, day: number): Date | null => {
    if (year < 1000 || month < 0 || month > 11 || day < 1) return null;
    const date = new Date(year, month, day);
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? date : null;
};

const parseLocaleInput = (text: string, locale: string): Date | null => {
    const tokens = text.match(/\p{L}+\.?|\d+/gu);
    if (!tokens) return null;
    const monthLookup = new Map<string, number>();
    monthNames(locale, 'long').forEach((name, i) => monthLookup.set(normalizeWord(name), i));
    monthNames(locale, 'short').forEach((name, i) => monthLookup.set(normalizeWord(name), i));
    const numbers: number[] = [];
    let wordMonth: number | null = null;
    for (const token of tokens) {
        if (/^\d+$/.test(token)) numbers.push(Number(token));
        else if (wordMonth === null) {
            const match = monthLookup.get(normalizeWord(token));
            if (match !== undefined) wordMonth = match;
        }
    }
    const order = localePartOrder(locale);
    const slots = wordMonth === null ? order : order.filter((type) => type !== 'month');
    if (numbers.length !== slots.length) return null;
    const parts: Record<'day' | 'month' | 'year', number> = { day: 0, month: wordMonth ?? 0, year: 0 };
    slots.forEach((type, i) => {
        parts[type] = type === 'month' ? numbers[i] - 1 : numbers[i];
    });
    return buildDate(parts.year, parts.month, parts.day);
};

export const parseInput = (text: string, pattern: string | undefined, locale?: string): Date | null => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const reference = new Date();
    if (!pattern && locale) {
        const localized = parseLocaleInput(trimmed, locale);
        if (localized) return startOfDay(localized);
    }
    const patterns = pattern ? [pattern, ...fallbackPatterns] : [defaultFormat, ...fallbackPatterns];
    for (const p of patterns) {
        const parsed = parse(trimmed, p, reference);
        if (isValid(parsed) && parsed.getFullYear() > 999) return startOfDay(parsed);
    }
    return null;
};

export const toIsoDate = (date: Date): string => formatDateFns(date, 'yyyy-MM-dd');

export const clampDate = (date: Date, minDate?: Date, maxDate?: Date): Date => {
    if (minDate && date < startOfDay(minDate)) return startOfDay(minDate);
    if (maxDate && date > startOfDay(maxDate)) return startOfDay(maxDate);
    return date;
};

export const isOutOfRange = (date: Date, minDate?: Date, maxDate?: Date): boolean =>
    Boolean((minDate && date < startOfDay(minDate)) || (maxDate && date > startOfDay(maxDate)));

export const createDisabledMatcher = (
    minDate: Date | undefined,
    maxDate: Date | undefined,
    disabledDates: DatePickerDisabledDates | undefined,
    disabledDaysOfWeek: number[] | undefined,
): ((date: Date) => boolean) => {
    const disabledSet =
        Array.isArray(disabledDates) ? new Set(disabledDates.map((d) => startOfDay(d).getTime())) : null;
    const daySet = disabledDaysOfWeek?.length ? new Set(disabledDaysOfWeek) : null;
    return (date: Date) => {
        if (isOutOfRange(date, minDate, maxDate)) return true;
        if (daySet && daySet.has(date.getDay())) return true;
        if (disabledSet && disabledSet.has(startOfDay(date).getTime())) return true;
        if (typeof disabledDates === 'function' && disabledDates(date)) return true;
        return false;
    };
};

export const dateKey = (date: Date): string => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
