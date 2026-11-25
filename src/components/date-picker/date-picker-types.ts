import type React from 'react';

import type { ToneColor } from '../../utils/color-tone';
import type { IconProp } from '../../utils/render-icon';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type DatePickerSize = 'sm' | 'md' | 'lg';
export type DatePickerVariant = 'input' | 'inline';
export type DatePickerGranularity = 'day' | 'month' | 'year';
export type DatePickerView = 'day' | 'month' | 'year';
export type DatePickerPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
export type DatePickerStatus = 'error' | 'warning' | 'success';
export type DatePickerDisabledDates = Date[] | ((date: Date) => boolean);

export interface DatePickerHighlight {
    date: Date;
    color?: ToneColor | (string & {});
    label?: string;
}

export interface DatePickerPreset {
    label: string;
    value: Date | (() => Date);
}

export interface DatePickerDayState {
    selected: boolean;
    today: boolean;
    disabled: boolean;
    outside: boolean;
    highlighted: DatePickerHighlight[];
}

export interface DatePickerCalendarProps {
    value: Date | null;
    onSelect: (date: Date) => void;
    locale?: string;
    firstDayOfWeek: DayOfWeek;
    minDate?: Date;
    maxDate?: Date;
    isDisabled: (date: Date) => boolean;
    highlightedDates?: DatePickerHighlight[];
    showWeekNumbers: boolean;
    showOutsideDays: boolean;
    fixedWeeks: boolean;
    numberOfMonths: 1 | 2;
    granularity: DatePickerGranularity;
    initialMonth?: Date;
    yearRange?: [number, number];
    renderDay?: (date: Date, state: DatePickerDayState) => React.ReactNode;
    dayClassName?: (date: Date) => string | undefined;
    autoFocus?: boolean;
}

export interface DatePickerProps {
    value?: Date | null;
    defaultValue?: Date | null;
    onChange?: (date: Date | null) => void;
    format?: string;
    formatDate?: (date: Date) => string;
    parseDate?: (text: string) => Date | null;
    locale?: string;
    firstDayOfWeek?: DayOfWeek;
    placeholder?: string;
    size?: DatePickerSize;
    variant?: DatePickerVariant;
    granularity?: DatePickerGranularity;
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: DatePickerDisabledDates;
    disabledDaysOfWeek?: number[];
    highlightedDates?: DatePickerHighlight[];
    showWeekNumbers?: boolean;
    showOutsideDays?: boolean;
    fixedWeeks?: boolean;
    numberOfMonths?: 1 | 2;
    yearRange?: [number, number];
    presets?: DatePickerPreset[];
    showTodayButton?: boolean;
    todayLabel?: string;
    clearable?: boolean;
    clearLabel?: string;
    closeOnSelect?: boolean;
    editable?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    required?: boolean;
    status?: DatePickerStatus;
    fullWidth?: boolean;
    icon?: IconProp | false;
    iconPosition?: 'start' | 'end';
    placement?: DatePickerPlacement;
    responsive?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    renderDay?: (date: Date, state: DatePickerDayState) => React.ReactNode;
    dayClassName?: (date: Date) => string | undefined;
    name?: string;
    id?: string;
    ariaLabel?: string;
    ariaDescribedBy?: string;
    autoFocus?: boolean;
    className?: string;
    popoverClassName?: string;
    style?: React.CSSProperties;
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}
