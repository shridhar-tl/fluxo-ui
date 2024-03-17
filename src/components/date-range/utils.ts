import { addDays, format, getYear, isAfter, isBefore, startOfMonth, startOfWeek } from 'date-fns';

export const defaultDateFormat = 'MMM dd, yyyy';

export const formatDisplayDate = (date: Date, dateFormat = defaultDateFormat): string => {
    return format(date, dateFormat);
};

export const generateCalendarDays = (baseDate: Date, firstDayOfWeek = 0): Date[][] => {
    const mStart = startOfMonth(baseDate);
    const calStart = startOfWeek(mStart, { weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
    const weeks: Date[][] = [];
    let current = calStart;
    for (let week = 0; week < 6; week++) {
        const weekDays: Date[] = [];
        for (let day = 0; day < 7; day++) {
            weekDays.push(current);
            current = addDays(current, 1);
        }
        weeks.push(weekDays);
    }
    return weeks;
};

export const getYearOptions = (minDate?: Date, maxDate?: Date): number[] => {
    const startYear = minDate ? getYear(minDate) : getYear(new Date()) - 10;
    const endYear = maxDate ? getYear(maxDate) : getYear(new Date()) + 10;
    const years: number[] = [];
    for (let y = startYear; y <= endYear; y++) {
        years.push(y);
    }
    return years;
};

export const isDateDisabled = (date: Date, minDate?: Date, maxDate?: Date): boolean => {
    if (minDate && isBefore(date, minDate)) return true;
    if (maxDate && isAfter(date, maxDate)) return true;
    return false;
};

export const getDayHeaders = (firstDayOfWeek = 0): string[] => {
    const base = startOfWeek(new Date(), { weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
    return Array.from({ length: 7 }, (_, i) => format(addDays(base, i), 'EE'));
};
