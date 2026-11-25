import { addDays, addMonths, endOfMonth, isValid, nextMonday, parseISO, startOfDay, startOfMonth, subDays } from 'date-fns';

import type { DatePickerHighlight, DatePickerPreset, DayOfWeek } from '../../../components';

export const today = startOfDay(new Date());

export const presetList: DatePickerPreset[] = [
    { label: 'Today', value: () => startOfDay(new Date()) },
    { label: 'Tomorrow', value: () => addDays(startOfDay(new Date()), 1) },
    { label: 'Next Monday', value: () => nextMonday(startOfDay(new Date())) },
    { label: 'In 2 weeks', value: () => addDays(startOfDay(new Date()), 14) },
    { label: 'End of month', value: () => startOfDay(endOfMonth(new Date())) },
    { label: 'Start of next month', value: () => startOfMonth(addMonths(new Date(), 1)) },
];

export const highlightList: DatePickerHighlight[] = [
    { date: addDays(today, 2), color: 'primary', label: 'Sprint review' },
    { date: addDays(today, 5), color: 'success', label: 'Release' },
    { date: addDays(today, 9), color: 'danger', label: 'Deadline' },
    { date: addDays(today, 12), color: 'warning', label: 'Maintenance window' },
    { date: subDays(today, 3), color: '#7c3aed', label: 'Retrospective' },
];

export const blockedDates = [addDays(today, 3), addDays(today, 4), addDays(today, 10)];

export const formatOptions = [
    { label: 'MMM d, yyyy', value: 'MMM d, yyyy' },
    { label: 'dd/MM/yyyy', value: 'dd/MM/yyyy' },
    { label: 'yyyy-MM-dd', value: 'yyyy-MM-dd' },
    { label: 'EEEE, MMMM do', value: 'EEEE, MMMM do' },
];

export const localeOptions = [
    { label: 'English (US)', value: 'en-US' },
    { label: 'Deutsch', value: 'de-DE' },
    { label: 'Français', value: 'fr-FR' },
    { label: '日本語', value: 'ja-JP' },
    { label: 'العربية', value: 'ar-EG' },
];

export const weekStartOptions: { label: string; value: string; day: DayOfWeek }[] = [
    { label: 'Sunday', value: '0', day: 0 },
    { label: 'Monday', value: '1', day: 1 },
    { label: 'Saturday', value: '6', day: 6 },
];

export const priceByDay = (date: Date): number => 89 + ((date.getDate() * 7 + date.getMonth() * 3) % 60);

const relativePattern = /^([+-])\s*(\d{1,3})\s*(d|w|m)?$/i;

const relativeWords: Record<string, number> = { today: 0, tomorrow: 1, yesterday: -1 };

export const parseNaturalDate = (text: string): Date | null => {
    const input = text.trim().toLowerCase();
    if (!input) return null;
    const base = startOfDay(new Date());
    if (input in relativeWords) return addDays(base, relativeWords[input]);
    const relative = input.match(relativePattern);
    if (relative) {
        const amount = Number(relative[2]) * (relative[1] === '-' ? -1 : 1);
        const unit = (relative[3] ?? 'd').toLowerCase();
        if (unit === 'm') return addMonths(base, amount);
        return addDays(base, unit === 'w' ? amount * 7 : amount);
    }
    const iso = parseISO(input);
    return isValid(iso) ? startOfDay(iso) : null;
};

export const isWeekendDay = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
