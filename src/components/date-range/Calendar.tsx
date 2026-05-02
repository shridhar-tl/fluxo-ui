import classNames from 'classnames';
import { isSameDay, isToday, startOfWeek, endOfWeek, format } from 'date-fns';
import type { SelectionMode } from './types';
import { generateCalendarDays, getDayHeaders, isDateDisabled } from './utils';

interface CalendarProps {
    currentMonth: Date;
    selectedFrom: Date;
    selectedTo: Date;
    activeField: 'from' | 'to';
    onSelectDate: (date: Date) => void;
    onSelectWeek?: (weekStart: Date, weekEnd: Date) => void;
    minDate?: Date;
    maxDate?: Date;
    firstDayOfWeek?: number;
    selectionMode?: SelectionMode;
}

function Calendar({
    currentMonth, selectedFrom, selectedTo, activeField, onSelectDate,
    onSelectWeek, minDate, maxDate, firstDayOfWeek = 0, selectionMode = 'day',
}: CalendarProps) {
    const fdow = firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    const weeks = generateCalendarDays(currentMonth, firstDayOfWeek);
    const dayHeaders = getDayHeaders(firstDayOfWeek);

    const isWeekMode = selectionMode === 'week';

    const handleWeekClick = (week: Date[]) => {
        const ws = startOfWeek(week[0], { weekStartsOn: fdow });
        const we = endOfWeek(week[0], { weekStartsOn: fdow });
        onSelectWeek?.(ws, we);
    };

    const isWeekInRange = (week: Date[]): boolean => {
        const ws = startOfWeek(week[0], { weekStartsOn: fdow });
        const we = endOfWeek(week[0], { weekStartsOn: fdow });
        return ws <= selectedTo && we >= selectedFrom;
    };

    const renderDay = (day: Date) => {
        const disabled = isDateDisabled(day, minDate, maxDate);
        const isSelected = (activeField === 'from' && isSameDay(day, selectedFrom)) || (activeField === 'to' && isSameDay(day, selectedTo));
        const isInRange = day >= selectedFrom && day <= selectedTo;
        const fullLabel = format(day, 'EEEE, MMMM d, yyyy');
        const today = isToday(day);

        if (isWeekMode) {
            return (
                <div
                    key={day.toString()}
                    role="gridcell"
                    aria-selected={isInRange}
                    aria-disabled={disabled || undefined}
                    aria-current={today ? 'date' : undefined}
                    aria-label={fullLabel}
                    className={classNames(
                        'eui-drp-day',
                        disabled && 'eui-drp-day-disabled',
                        isInRange && 'eui-drp-day-in-range',
                        today && 'eui-drp-day-today',
                    )}
                >
                    {day.getDate()}
                </div>
            );
        }

        return (
            <div role="gridcell" key={day.toString()}>
                <button
                    type="button"
                    onClick={() => onSelectDate(day)}
                    disabled={disabled}
                    aria-label={fullLabel}
                    aria-selected={isSelected}
                    aria-current={today ? 'date' : undefined}
                    className={classNames(
                        'eui-drp-day',
                        disabled && 'eui-drp-day-disabled',
                        isSelected && 'eui-drp-day-selected',
                        !isSelected && isInRange && 'eui-drp-day-in-range',
                        today && 'eui-drp-day-today',
                    )}
                >
                    {day.getDate()}
                </button>
            </div>
        );
    };

    return (
        <div className="eui-drp-calendar" role="grid" aria-label={`Calendar for ${format(currentMonth, 'MMMM yyyy')}`}>
            <div className="eui-drp-weekdays" role="row">
                {dayHeaders.map((d) => (
                    <div key={d} className="eui-drp-weekday" role="columnheader">
                        {d}
                    </div>
                ))}
            </div>
            {weeks.map((week, wi) => {
                if (isWeekMode) {
                    const selected = isWeekInRange(week);
                    const weekStart = startOfWeek(week[0], { weekStartsOn: fdow });
                    const weekEnd = endOfWeek(week[0], { weekStartsOn: fdow });
                    return (
                        <div
                            key={wi}
                            role="row"
                            aria-selected={selected}
                            aria-label={`Week of ${format(weekStart, 'MMMM d')} to ${format(weekEnd, 'MMMM d, yyyy')}`}
                            tabIndex={0}
                            className={classNames('eui-drp-week eui-drp-week-selectable', {
                                'eui-drp-week-selected': selected,
                            })}
                            onClick={() => handleWeekClick(week)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleWeekClick(week);
                                }
                            }}
                        >
                            {week.map((day) => renderDay(day))}
                        </div>
                    );
                }
                return (
                    <div key={wi} className="eui-drp-week" role="row">
                        {week.map((day) => renderDay(day))}
                    </div>
                );
            })}
        </div>
    );
}

export default Calendar;
