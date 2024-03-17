import React from 'react';
import { format, addDays, startOfWeek } from 'date-fns';

interface MonthGridHeaderProps {
  firstDayOfWeek: number;
  hiddenDays: number[];
  weekNumbers?: boolean;
}

const MonthGridHeader: React.FC<MonthGridHeaderProps> = ({ firstDayOfWeek, hiddenDays, weekNumbers }) => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    if (!hiddenDays.includes(day.getDay())) {
      days.push(day);
    }
  }

  return (
    <div className="eui-cal-month-header" role="row">
      {weekNumbers && (
        <div className="eui-cal-month-header-cell eui-cal-month-header-weeknum" role="columnheader" aria-label="Week number">
          Wk
        </div>
      )}
      {days.map((day, i) => (
        <div key={i} className="eui-cal-month-header-cell" role="columnheader">
          <span className="eui-cal-month-header-day-name">{format(day, 'EEE')}</span>
        </div>
      ))}
    </div>
  );
};

export default React.memo(MonthGridHeader);
