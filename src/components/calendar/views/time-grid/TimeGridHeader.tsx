import React from 'react';
import cn from 'classnames';
import { format, isToday, getWeek } from 'date-fns';
import type { CalendarConfig } from '../../calendar-types';

interface TimeGridHeaderProps {
  days: Date[];
  config: CalendarConfig;
  onDateClick?: (date: Date, event: React.MouseEvent) => void;
}

const TimeGridHeader: React.FC<TimeGridHeaderProps> = ({ days, config, onDateClick }) => {
  const weekNum = config.weekNumbers
    ? getWeek(days[0], { weekStartsOn: config.firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 })
    : null;

  return (
    <div className="eui-cal-time-header" role="row">
      <div
        className={cn('eui-cal-time-gutter-header', { 'eui-cal-time-gutter-header-weeknum': config.weekNumbers })}
        role="presentation"
        aria-hidden={!config.weekNumbers}
      >
        {weekNum !== null && <span>{config.weekText}{weekNum}</span>}
      </div>
      {days.map(day => {
        const today = isToday(day);
        const isLink = config.navLinks;
        return (
          <div
            key={day.toISOString()}
            className={cn('eui-cal-time-header-cell', {
              'eui-cal-time-header-cell-today': today,
              'eui-cal-time-header-cell-clickable': config.dayHeaderClick,
            })}
            role="columnheader"
            aria-label={format(day, 'EEEE, MMMM d, yyyy')}
            onClick={config.dayHeaderClick ? (e) => config.dayHeaderClick!(day, e) : undefined}
          >
            <span className="eui-cal-time-header-day-name">{format(day, config.weekDayHeaderFormat || 'EEE')}</span>
            {isLink ? (
              <button
                className={cn(
                  'eui-cal-time-header-day-num',
                  'eui-cal-time-header-day-num-link',
                  { 'eui-cal-time-header-day-num-today': today }
                )}
                type="button"
                onClick={(e) => onDateClick?.(day, e)}
                aria-label={`Go to ${format(day, 'MMMM d')}`}
              >
                {format(day, config.dayHeaderFormat || 'd')}
              </button>
            ) : (
              <span className={cn('eui-cal-time-header-day-num', { 'eui-cal-time-header-day-num-today': today })}>
                {format(day, config.dayHeaderFormat || 'd')}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(TimeGridHeader);
