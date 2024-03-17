import classNames from 'classnames';
import { isSameDay, startOfWeek, endOfWeek } from 'date-fns';
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

        return (
            <button
                key={day.toString()}
                type="button"
                onClick={isWeekMode ? undefined : () => onSelectDate(day)}
                disabled={disabled}
                tabIndex={isWeekMode ? -1 : 0}
                className={classNames(
                    'eui-drp-day',
                    disabled && 'eui-drp-day-disabled',
                    isSelected && !isWeekMode && 'eui-drp-day-selected',
                    !isSelected && isInRange && !isWeekMode && 'eui-drp-day-in-range'
                )}
            >
                {day.getDate()}
            </button>
        );
    };

    return (
        <div className="eui-drp-calendar">
            <div className="eui-drp-weekdays">
                {dayHeaders.map((d) => (
                    <div key={d} className="eui-drp-weekday">
                        {d}
                    </div>
                ))}
            </div>
            {weeks.map((week, wi) => {
                if (isWeekMode) {
                    const selected = isWeekInRange(week);
                    return (
                        <button
                            key={wi}
                            type="button"
                            className={classNames('eui-drp-week eui-drp-week-selectable', {
                                'eui-drp-week-selected': selected,
                            })}
                            onClick={() => handleWeekClick(week)}
                        >
                            {week.map((day) => renderDay(day))}
                        </button>
                    );
                }
                return (
                    <div key={wi} className="eui-drp-week">
                        {week.map((day) => renderDay(day))}
                    </div>
                );
            })}
        </div>
    );
}

export default Calendar;
