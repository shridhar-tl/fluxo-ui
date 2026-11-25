import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';

import cn from 'classnames';
import { addDays, addMonths, addYears, endOfMonth, endOfWeek, isSameDay, isSameMonth, startOfDay, startOfMonth, startOfWeek } from 'date-fns';

import { ChevronLeftIcon, ChevronRightIcon } from '../../assets/icons';
import { getCustomToneStyle, resolveToneClass } from '../../utils/color-tone';
import type { DatePickerCalendarProps, DatePickerHighlight, DatePickerView } from './date-picker-types';
import { buildMonthGrid, clampDate, dateKey, fullDateLabel, monthNames, monthYearLabel, weekdayNames, weekNumber } from './date-picker-utils';

const yearsPerPage = 12;

const yearPageStart = (year: number) => Math.floor(year / yearsPerPage) * yearsPerPage;

const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({
    value,
    onSelect,
    locale,
    firstDayOfWeek,
    minDate,
    maxDate,
    isDisabled,
    highlightedDates,
    showWeekNumbers,
    showOutsideDays,
    fixedWeeks,
    numberOfMonths,
    granularity,
    initialMonth,
    yearRange,
    renderDay,
    dayClassName,
    autoFocus = false,
}) => {
    const today = useMemo(() => startOfDay(new Date()), []);
    const seed = value ?? initialMonth ?? today;
    const [viewMonth, setViewMonth] = useState(() => startOfMonth(seed));
    const [view, setView] = useState<DatePickerView>(granularity);
    const [focusedDate, setFocusedDate] = useState<Date>(() => startOfDay(seed));
    const [yearPage, setYearPage] = useState(() => yearPageStart(seed.getFullYear()));
    const [focusTick, setFocusTick] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);

    const valueTime = value ? value.getTime() : null;
    const [syncedTime, setSyncedTime] = useState(valueTime);
    if (syncedTime !== valueTime) {
        setSyncedTime(valueTime);
        if (value) {
            setViewMonth(startOfMonth(value));
            setFocusedDate(startOfDay(value));
            setYearPage(yearPageStart(value.getFullYear()));
        }
    }

    useLayoutEffect(() => {
        if (focusTick === 0) return;
        rootRef.current?.querySelector<HTMLElement>('[data-eui-dp-focus="true"]')?.focus();
    }, [focusTick]);

    useLayoutEffect(() => {
        if (!autoFocus) return;
        rootRef.current?.querySelector<HTMLElement>('[data-eui-dp-focus="true"]')?.focus();
    }, [autoFocus]);

    const highlightMap = useMemo(() => {
        const map = new Map<string, DatePickerHighlight[]>();
        highlightedDates?.forEach((h) => {
            const key = dateKey(h.date);
            map.set(key, [...(map.get(key) ?? []), h]);
        });
        return map;
    }, [highlightedDates]);

    const weekdays = useMemo(() => weekdayNames(locale, firstDayOfWeek), [locale, firstDayOfWeek]);
    const shortMonths = useMemo(() => monthNames(locale, 'short'), [locale]);
    const longMonths = useMemo(() => monthNames(locale, 'long'), [locale]);
    const minYear = yearRange?.[0] ?? minDate?.getFullYear();
    const maxYear = yearRange?.[1] ?? maxDate?.getFullYear();

    const months = useMemo(
        () => Array.from({ length: numberOfMonths }, (_, i) => addMonths(viewMonth, i)),
        [viewMonth, numberOfMonths],
    );

    const requestFocus = () => {
        setFocusTick((tick) => tick + 1);
    };

    const moveFocus = (next: Date) => {
        let target = next;
        if (minDate && target < startOfDay(minDate)) target = startOfDay(minDate);
        if (maxDate && target > startOfDay(maxDate)) target = startOfDay(maxDate);
        setFocusedDate(target);
        const first = viewMonth;
        const last = addMonths(viewMonth, numberOfMonths - 1);
        if (target < first) setViewMonth(startOfMonth(target));
        else if (target > endOfMonth(last)) setViewMonth(startOfMonth(addMonths(target, -(numberOfMonths - 1))));
        requestFocus();
    };

    const monthDisabled = (year: number, month: number) => {
        const start = new Date(year, month, 1);
        const end = endOfMonth(start);
        return Boolean((minDate && end < startOfDay(minDate)) || (maxDate && start > startOfDay(maxDate)));
    };

    const yearDisabled = (year: number) =>
        (minYear !== undefined && year < minYear) || (maxYear !== undefined && year > maxYear);

    const navigate = (direction: 1 | -1) => {
        if (view === 'day') {
            const next = addMonths(viewMonth, direction);
            const visibleEnd = endOfMonth(addMonths(next, numberOfMonths - 1));
            setViewMonth(next);
            setFocusedDate(clampDate(clampDate(addMonths(focusedDate, direction), next, visibleEnd), minDate, maxDate));
        } else if (view === 'month') {
            const nextYear = viewMonth.getFullYear() + direction;
            setViewMonth(new Date(nextYear, viewMonth.getMonth(), 1));
            setFocusedDate(new Date(nextYear, focusedDate.getMonth(), 1));
        } else {
            const nextPage = yearPage + direction * yearsPerPage;
            setYearPage(nextPage);
            setFocusedDate(new Date(nextPage + (((focusedDate.getFullYear() - yearPage) % yearsPerPage) + yearsPerPage) % yearsPerPage, focusedDate.getMonth(), 1));
        }
    };

    const prevDisabled = (() => {
        if (view === 'day') return Boolean(minDate && endOfMonth(addMonths(viewMonth, -1)) < startOfDay(minDate));
        if (view === 'month') return minYear !== undefined && viewMonth.getFullYear() - 1 < minYear;
        return minYear !== undefined && yearPage - 1 < minYear;
    })();

    const nextDisabled = (() => {
        const lastMonth = addMonths(viewMonth, numberOfMonths - 1);
        if (view === 'day') return Boolean(maxDate && addMonths(startOfMonth(lastMonth), 1) > startOfDay(maxDate));
        if (view === 'month') return maxYear !== undefined && viewMonth.getFullYear() + 1 > maxYear;
        return maxYear !== undefined && yearPage + yearsPerPage > maxYear;
    })();

    const switchView = () => {
        if (view === 'day') {
            setViewMonth(startOfMonth(focusedDate));
            setView('month');
        } else if (view === 'month') {
            setYearPage(yearPageStart(focusedDate.getFullYear()));
            setView('year');
        }
        requestFocus();
    };

    const selectDay = (date: Date) => {
        if (isDisabled(date)) return;
        setFocusedDate(date);
        onSelect(date);
    };

    const selectMonth = (month: number) => {
        const year = viewMonth.getFullYear();
        if (monthDisabled(year, month)) return;
        if (granularity === 'month') {
            onSelect(new Date(year, month, 1));
            return;
        }
        const next = new Date(year, month, 1);
        setViewMonth(next);
        const day = Math.min(focusedDate.getDate(), endOfMonth(next).getDate());
        setFocusedDate(new Date(year, month, day));
        setView('day');
        requestFocus();
    };

    const selectYear = (year: number) => {
        if (yearDisabled(year)) return;
        if (granularity === 'year') {
            onSelect(new Date(year, 0, 1));
            return;
        }
        setViewMonth(new Date(year, viewMonth.getMonth(), 1));
        setFocusedDate(new Date(year, focusedDate.getMonth(), Math.min(focusedDate.getDate(), 28)));
        setView('month');
        requestFocus();
    };

    const handleDayKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const keyMap: Record<string, () => Date> = {
            ArrowLeft: () => addDays(focusedDate, -1),
            ArrowRight: () => addDays(focusedDate, 1),
            ArrowUp: () => addDays(focusedDate, -7),
            ArrowDown: () => addDays(focusedDate, 7),
            Home: () => startOfWeek(focusedDate, { weekStartsOn: firstDayOfWeek }),
            End: () => endOfWeek(focusedDate, { weekStartsOn: firstDayOfWeek }),
            PageUp: () => (event.shiftKey ? addYears(focusedDate, -1) : addMonths(focusedDate, -1)),
            PageDown: () => (event.shiftKey ? addYears(focusedDate, 1) : addMonths(focusedDate, 1)),
        };
        const action = keyMap[event.key];
        if (!action) return;
        event.preventDefault();
        moveFocus(startOfDay(action()));
    };

    const handleMonthKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const current = focusedDate.getMonth();
        const deltas: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 };
        let next: number;
        if (event.key in deltas) next = current + deltas[event.key];
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = 11;
        else return;
        event.preventDefault();
        const year = viewMonth.getFullYear() + Math.floor(next / 12);
        const month = ((next % 12) + 12) % 12;
        setViewMonth(new Date(year, viewMonth.getMonth(), 1));
        setFocusedDate(new Date(year, month, 1));
        requestFocus();
    };

    const handleYearKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const current = focusedDate.getFullYear();
        const deltas: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3, PageUp: -yearsPerPage, PageDown: yearsPerPage };
        let next: number;
        if (event.key in deltas) next = current + deltas[event.key];
        else if (event.key === 'Home') next = yearPage;
        else if (event.key === 'End') next = yearPage + yearsPerPage - 1;
        else return;
        event.preventDefault();
        if (yearDisabled(next)) return;
        setFocusedDate(new Date(next, focusedDate.getMonth(), 1));
        setYearPage(yearPageStart(next));
        requestFocus();
    };

    const renderMonthGrid = (month: Date, gridIndex: number) => {
        const weeks = buildMonthGrid(month, firstDayOfWeek, fixedWeeks);
        const caption = monthYearLabel(month, locale);
        return (
            <div className="eui-dp-month" key={gridIndex}>
                {numberOfMonths > 1 && (
                    <div className="eui-dp-month-caption" aria-hidden="true">
                        {caption}
                    </div>
                )}
                <div role="grid" aria-label={caption} className={cn('eui-dp-grid', { 'eui-dp-grid-weeks': showWeekNumbers })} onKeyDown={handleDayKeyDown}>
                    <div role="row" className="eui-dp-row eui-dp-row-head">
                        {showWeekNumbers && (
                            <span role="columnheader" className="eui-dp-weekday eui-dp-weeknum-head" aria-label="Week number">
                                #
                            </span>
                        )}
                        {weekdays.map((day) => (
                            <span role="columnheader" key={day.long} className="eui-dp-weekday" aria-label={day.long}>
                                <abbr title={day.long}>{day.short}</abbr>
                            </span>
                        ))}
                    </div>
                    {weeks.map((week) => (
                        <div role="row" className="eui-dp-row" key={dateKey(week[0])}>
                            {showWeekNumbers && (
                                <span role="rowheader" className="eui-dp-weeknum">
                                    {weekNumber(week)}
                                </span>
                            )}
                            {week.map((day) => {
                                const outside = !isSameMonth(day, month);
                                const key = dateKey(day);
                                if (outside && !showOutsideDays) {
                                    return <span role="gridcell" key={key} className="eui-dp-cell eui-dp-cell-empty" />;
                                }
                                const disabled = isDisabled(day);
                                const selected = value !== null && isSameDay(day, value);
                                const isToday = isSameDay(day, today);
                                const highlights = highlightMap.get(key) ?? [];
                                const focusable = isSameDay(day, focusedDate) && !(outside && numberOfMonths > 1);
                                const highlightLabel = highlights.map((h) => h.label).filter(Boolean).join(', ');
                                return (
                                    <span role="gridcell" key={key} className="eui-dp-cell" aria-selected={selected}>
                                        <button
                                            type="button"
                                            className={cn(
                                                'eui-dp-day',
                                                {
                                                    'eui-dp-day-selected': selected,
                                                    'eui-dp-day-today': isToday,
                                                    'eui-dp-day-outside': outside,
                                                    'eui-dp-day-disabled': disabled,
                                                    'eui-dp-day-highlighted': highlights.length > 0,
                                                    'eui-dp-day-weekend': day.getDay() === 0 || day.getDay() === 6,
                                                },
                                                dayClassName?.(day),
                                            )}
                                            tabIndex={focusable ? 0 : -1}
                                            data-eui-dp-focus={focusable ? 'true' : undefined}
                                            aria-disabled={disabled || undefined}
                                            aria-current={isToday ? 'date' : undefined}
                                            aria-label={`${fullDateLabel(day, locale)}${highlightLabel ? `, ${highlightLabel}` : ''}`}
                                            onClick={() => selectDay(day)}
                                            onFocus={() => {
                                                if (!isSameDay(day, focusedDate)) setFocusedDate(day);
                                            }}
                                        >
                                            {renderDay ? (
                                                renderDay(day, { selected, today: isToday, disabled, outside, highlighted: highlights })
                                            ) : (
                                                <span className="eui-dp-day-num">{day.getDate()}</span>
                                            )}
                                            {highlights.length > 0 && (
                                                <span className="eui-dp-markers" aria-hidden="true">
                                                    {highlights.slice(0, 3).map((h, i) => (
                                                        <span
                                                            key={i}
                                                            className={cn('eui-dp-marker', resolveToneClass('eui-dp-marker', h.color ?? 'primary'))}
                                                            style={getCustomToneStyle(h.color)}
                                                        />
                                                    ))}
                                                </span>
                                            )}
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const year = viewMonth.getFullYear();
        return (
            <div role="grid" aria-label={String(year)} className="eui-dp-picker-grid" onKeyDown={handleMonthKeyDown}>
                {[0, 1, 2, 3].map((row) => (
                    <div role="row" key={row} className="eui-dp-picker-row">
                        {[0, 1, 2].map((col) => {
                            const month = row * 3 + col;
                            const disabled = monthDisabled(year, month);
                            const selected = value !== null && value.getFullYear() === year && value.getMonth() === month;
                            const focusable = focusedDate.getFullYear() === year && focusedDate.getMonth() === month;
                            const current = today.getFullYear() === year && today.getMonth() === month;
                            return (
                                <span role="gridcell" key={month} aria-selected={selected}>
                                    <button
                                        type="button"
                                        className={cn('eui-dp-picker-item', {
                                            'eui-dp-picker-selected': selected,
                                            'eui-dp-picker-current': current,
                                            'eui-dp-picker-disabled': disabled,
                                        })}
                                        tabIndex={focusable ? 0 : -1}
                                        data-eui-dp-focus={focusable ? 'true' : undefined}
                                        aria-disabled={disabled || undefined}
                                        aria-label={`${longMonths[month]} ${year}`}
                                        onClick={() => selectMonth(month)}
                                    >
                                        {shortMonths[month]}
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

    const renderYearView = () => (
        <div role="grid" aria-label={`${yearPage} to ${yearPage + yearsPerPage - 1}`} className="eui-dp-picker-grid" onKeyDown={handleYearKeyDown}>
            {[0, 1, 2, 3].map((row) => (
                <div role="row" key={row} className="eui-dp-picker-row">
                    {[0, 1, 2].map((col) => {
                        const year = yearPage + row * 3 + col;
                        const disabled = yearDisabled(year);
                        const selected = value !== null && value.getFullYear() === year;
                        const focusable = focusedDate.getFullYear() === year;
                        return (
                            <span role="gridcell" key={year} aria-selected={selected}>
                                <button
                                    type="button"
                                    className={cn('eui-dp-picker-item', {
                                        'eui-dp-picker-selected': selected,
                                        'eui-dp-picker-current': today.getFullYear() === year,
                                        'eui-dp-picker-disabled': disabled,
                                    })}
                                    tabIndex={focusable ? 0 : -1}
                                    data-eui-dp-focus={focusable ? 'true' : undefined}
                                    aria-disabled={disabled || undefined}
                                    onClick={() => selectYear(year)}
                                >
                                    {year}
                                </button>
                            </span>
                        );
                    })}
                </div>
            ))}
        </div>
    );

    const title = (() => {
        if (view === 'year') return `${yearPage} – ${yearPage + yearsPerPage - 1}`;
        if (view === 'month') return String(viewMonth.getFullYear());
        if (numberOfMonths > 1) {
            const last = addMonths(viewMonth, numberOfMonths - 1);
            return `${monthYearLabel(viewMonth, locale)} – ${monthYearLabel(last, locale)}`;
        }
        return monthYearLabel(viewMonth, locale);
    })();

    const unitLabel = view === 'day' ? 'month' : view === 'month' ? 'year' : `${yearsPerPage} years`;
    const titleSwitchable = view !== 'year' && !(granularity === 'year');

    return (
        <div ref={rootRef} className={cn('eui-dp-calendar', `eui-dp-view-${view}`, { 'eui-dp-calendar-multi': numberOfMonths > 1 && view === 'day' })}>
            <div className="eui-dp-header">
                <button type="button" className="eui-dp-nav" onClick={() => navigate(-1)} disabled={prevDisabled} aria-label={`Previous ${unitLabel}`}>
                    <ChevronLeftIcon aria-hidden="true" />
                </button>
                {titleSwitchable ? (
                    <button type="button" className="eui-dp-title eui-dp-title-button" onClick={switchView} aria-live="polite">
                        {title}
                    </button>
                ) : (
                    <span className="eui-dp-title" aria-live="polite">
                        {title}
                    </span>
                )}
                <button type="button" className="eui-dp-nav" onClick={() => navigate(1)} disabled={nextDisabled} aria-label={`Next ${unitLabel}`}>
                    <ChevronRightIcon aria-hidden="true" />
                </button>
            </div>
            {view === 'day' && <div className="eui-dp-months">{months.map(renderMonthGrid)}</div>}
            {view === 'month' && renderMonthView()}
            {view === 'year' && renderYearView()}
        </div>
    );
};

export { DatePickerCalendar };
