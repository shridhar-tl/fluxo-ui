import classNames from 'classnames';
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { useContext, useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../../assets/icons';
import Calendar from './Calendar';
import Footer from './Footer';
import MonthPicker from './MonthPicker';
import QuickRangeList from './QuickRangeList';
import { DatePickerPropsContext, DatePickerStateContext } from './types';
import { formatDisplayDate, isDateDisabled } from './utils';
import YearPicker from './YearPicker';

type ViewMode = 'calendar' | 'year' | 'month';

function CustomDatePicker() {
    const {
        minDate, maxDate, dateFormat, ranges,
        selectionMode = 'day', firstDayOfWeek = 0, range: isRange = true,
    } = useContext(DatePickerPropsContext);
    const { customRange, setCustomDate } = useContext(DatePickerStateContext);
    const [fromDate, setFromDate] = useState<Date>(customRange[0]);
    const [toDate, setToDate] = useState<Date>(customRange[1]);
    const [activeField, setActiveField] = useState<'from' | 'to'>('from');
    const [currentMonth, setCurrentMonth] = useState<Date>(activeField === 'from' ? fromDate : toDate);

    const isSingleDate = !isRange && selectionMode === 'day';
    const isMonthRange = isRange && selectionMode === 'month';
    const isYearRange = isRange && selectionMode === 'year';

    const initialViewMode = (): ViewMode => {
        if (selectionMode === 'year') return 'year';
        if (selectionMode === 'month') return 'month';
        return 'calendar';
    };
    const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
    const [monthRangeField, setMonthRangeField] = useState<'from' | 'to'>('from');
    const [yearRangeField, setYearRangeField] = useState<'from' | 'to'>('from');

    useEffect(() => {
        if (selectionMode !== 'day' && selectionMode !== 'week') return;
        if (isSingleDate) {
            setCurrentMonth(fromDate);
        } else {
            setCurrentMonth(activeField === 'from' ? fromDate : toDate);
        }
    }, [activeField, fromDate, toDate, selectionMode, isSingleDate]);

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const handleDateSelect = (date: Date) => {
        if (isDateDisabled(date, minDate, maxDate)) return;

        if (isSingleDate) {
            setFromDate(date);
            setToDate(date);
            setCustomDate([date, date]);
            return;
        }

        if (activeField === 'from') {
            setFromDate(date);
            setToDate(date);
            setActiveField('to');
        } else {
            setToDate(date);
            if (date < fromDate) {
                setFromDate(date);
            }
        }
    };

    const handleWeekSelect = (weekStart: Date, weekEnd: Date) => {
        if (!isRange) {
            setFromDate(weekStart);
            setToDate(weekEnd);
            setCustomDate([weekStart, weekEnd]);
            return;
        }
        if (monthRangeField === 'from') {
            setFromDate(weekStart);
            setToDate(weekEnd);
            setMonthRangeField('to');
        } else {
            if (weekStart < fromDate) {
                setToDate(endOfMonth(fromDate));
                setFromDate(weekStart);
            } else {
                setToDate(weekEnd);
            }
            setCustomDate([fromDate < weekStart ? fromDate : weekStart, weekEnd > toDate ? weekEnd : toDate]);
            setMonthRangeField('from');
        }
    };

    const handleDone = () => setCustomDate([fromDate, toDate]);

    const handleToday = () => {
        const today = new Date();
        setFromDate(today);
        setToDate(today);
        setCurrentMonth(today);
        if (isSingleDate) {
            setCustomDate([today, today]);
        }
    };

    const handleYearSelect = (year: number) => {
        if (selectionMode === 'year' && !isYearRange) {
            const ys = startOfYear(new Date(year, 0, 1));
            const ye = endOfYear(ys);
            setFromDate(ys);
            setToDate(ye);
            setCustomDate([ys, ye]);
            return;
        }
        if (isYearRange) {
            const ys = startOfYear(new Date(year, 0, 1));
            const ye = endOfYear(ys);
            if (yearRangeField === 'from') {
                setFromDate(ys);
                setToDate(ye);
                setYearRangeField('to');
            } else {
                if (ys < fromDate) {
                    setToDate(endOfYear(fromDate));
                    setFromDate(ys);
                } else {
                    setToDate(ye);
                }
                setCustomDate([fromDate < ys ? fromDate : ys, ye > toDate ? ye : toDate]);
                setYearRangeField('from');
            }
            return;
        }
        const newDate = new Date(currentMonth);
        newDate.setFullYear(year);
        setCurrentMonth(newDate);
        setViewMode('month');
    };

    const handleMonthSelect = (month: number) => {
        if (selectionMode === 'month' && !isMonthRange) {
            const ms = startOfMonth(new Date(currentMonth.getFullYear(), month, 1));
            const me = endOfMonth(ms);
            setFromDate(ms);
            setToDate(me);
            setCustomDate([ms, me]);
            return;
        }
        if (isMonthRange) {
            const ms = startOfMonth(new Date(currentMonth.getFullYear(), month, 1));
            const me = endOfMonth(ms);
            if (monthRangeField === 'from') {
                setFromDate(ms);
                setToDate(me);
                setMonthRangeField('to');
            } else {
                if (ms < fromDate) {
                    setToDate(endOfMonth(fromDate));
                    setFromDate(ms);
                } else {
                    setToDate(me);
                }
                setCustomDate([fromDate < ms ? fromDate : ms, me > toDate ? me : toDate]);
                setMonthRangeField('from');
            }
            return;
        }
        const newDate = new Date(currentMonth);
        newDate.setMonth(month);
        setCurrentMonth(newDate);
        setViewMode('calendar');
    };

    const showFieldHeader = selectionMode === 'day' && isRange;
    const showSingleHeader = isSingleDate;
    const showRangeHeader = isMonthRange || isYearRange;
    const showFooter = selectionMode === 'day' && isRange;
    const showCalendarNav = viewMode === 'calendar' && (selectionMode === 'day' || selectionMode === 'week');

    const rangeHeaderLabel = () => {
        const fmt = isYearRange ? 'yyyy' : 'MMM yyyy';
        return `${formatDisplayDate(fromDate, fmt)} – ${formatDisplayDate(toDate, fmt)}`;
    };

    return (
        <div className="eui-drp-custom-picker">
            {ranges && (
                <div className="eui-drp-quick-sidebar">
                    <QuickRangeList />
                </div>
            )}
            <div className="eui-drp-calendar-col">
                {showSingleHeader && (
                    <div className="eui-drp-field-header">
                        <div className="eui-drp-field-row eui-drp-field-row-single">
                            <span className="eui-drp-field-single-label">
                                {formatDisplayDate(fromDate, dateFormat)}
                            </span>
                        </div>
                    </div>
                )}

                {showRangeHeader && (
                    <div className="eui-drp-field-header">
                        <div className="eui-drp-field-row eui-drp-field-row-single">
                            <span className="eui-drp-field-single-label">
                                {rangeHeaderLabel()}
                            </span>
                        </div>
                    </div>
                )}

                {showFieldHeader && (
                    <div className="eui-drp-field-header">
                        <div className="eui-drp-field-row">
                            <button
                                type="button"
                                className="eui-drp-field-btn"
                                onClick={() => setActiveField('from')}
                            >
                                {formatDisplayDate(fromDate, dateFormat)}
                            </button>
                            <span className="eui-drp-field-sep">~</span>
                            <button
                                type="button"
                                className="eui-drp-field-btn"
                                onClick={() => setActiveField('to')}
                            >
                                {formatDisplayDate(toDate, dateFormat)}
                            </button>
                        </div>
                        <div className="eui-drp-field-bar">
                            <div className={classNames('eui-drp-field-bar-half', activeField === 'from' && 'eui-drp-field-bar-active')} />
                            <div className={classNames('eui-drp-field-bar-half', activeField === 'to' && 'eui-drp-field-bar-active')} />
                        </div>
                    </div>
                )}

                {viewMode === 'year' && (
                    <YearPicker
                        minDate={minDate}
                        maxDate={maxDate}
                        selectedFrom={fromDate}
                        selectedTo={toDate}
                        selectionMode={selectionMode}
                        onCancel={() => {
                            if (selectionMode === 'year') return;
                            setViewMode(selectionMode === 'month' ? 'month' : 'calendar');
                        }}
                        onSelect={handleYearSelect}
                    />
                )}

                {viewMode === 'month' && (
                    <MonthPicker
                        onBackClick={() => setViewMode('year')}
                        onSelect={handleMonthSelect}
                        year={currentMonth.getFullYear()}
                        selectedFrom={fromDate}
                        selectedTo={toDate}
                        selectionMode={selectionMode}
                    />
                )}

                {showCalendarNav && viewMode === 'calendar' && (
                    <div className="eui-drp-month-nav">
                        <button type="button" className="eui-drp-month-nav-btn" onClick={handlePrevMonth}>
                            <ChevronLeftIcon className="eui-drp-nav-icon" />
                        </button>
                        <button type="button" className="eui-drp-month-label" onClick={() => setViewMode('year')}>
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </button>
                        <button type="button" className="eui-drp-month-nav-btn" onClick={handleNextMonth}>
                            <ChevronRightIcon className="eui-drp-nav-icon" />
                        </button>
                    </div>
                )}

                {viewMode === 'calendar' && (
                    <Calendar
                        currentMonth={currentMonth}
                        selectedFrom={fromDate}
                        selectedTo={toDate}
                        activeField={activeField}
                        onSelectDate={handleDateSelect}
                        onSelectWeek={handleWeekSelect}
                        minDate={minDate}
                        maxDate={maxDate}
                        firstDayOfWeek={firstDayOfWeek}
                        selectionMode={selectionMode}
                    />
                )}
                {showFooter && <Footer onDone={handleDone} onSelectToday={handleToday} />}
            </div>
        </div>
    );
}

export default CustomDatePicker;
