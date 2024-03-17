import React, { useMemo, useCallback } from 'react';
import cn from 'classnames';
import { ViewMode } from '../../calendar-types';
import type { ViewProps, CalendarViewDefinition, ResolvedCalendarEntry } from '../../calendar-types';
import {
  getDaysInRange, getEntriesForDay,
  format, addDays, subDays, startOfDay, endOfDay,
  isToday, formatTime,
} from '../../calendar-utils';

const defaultAgendaDays = 14;

const AgendaView: React.FC<ViewProps> = ({
  entries, dateRange, config,
  onEntryClick, onEntryContextMenu, onDateClick,
  renderEntry,
}) => {
  const days = useMemo(
    () => getDaysInRange(dateRange, config.hiddenDays),
    [dateRange, config.hiddenDays]
  );

  const dayData = useMemo(() => {
    return days
      .map(day => ({
        date: day,
        entries: getEntriesForDay(entries, day).sort(
          (a, b) => a.start.getTime() - b.start.getTime()
        ),
      }))
      .filter(d => d.entries.length > 0);
  }, [days, entries]);

  const handleEntryClick = useCallback((entry: ResolvedCalendarEntry, event: React.MouseEvent) => {
    onEntryClick?.(entry, event);
  }, [onEntryClick]);

  const handleEntryContextMenu = useCallback((entry: ResolvedCalendarEntry, event: React.MouseEvent) => {
    onEntryContextMenu?.(entry, event);
  }, [onEntryContextMenu]);

  if (dayData.length === 0) {
    return (
      <div className="eui-cal-agenda" role="list" aria-label="Agenda view">
        <div className="eui-cal-agenda-empty">
          No events in this period
        </div>
      </div>
    );
  }

  return (
    <div className="eui-cal-agenda" role="list" aria-label="Agenda view">
      {dayData.map(({ date, entries: dayEntries }) => {
        const today = isToday(date);

        return (
          <div
            key={date.toISOString()}
            className={cn('eui-cal-agenda-day', {
              'eui-cal-agenda-day-today': today,
            })}
          >
            <div
              className={cn('eui-cal-agenda-date', {
                'eui-cal-agenda-date-clickable': config.navLinks,
              })}
              onClick={config.navLinks && onDateClick ? (e) => onDateClick(date, e) : undefined}
              role="heading"
              aria-level={3}
            >
              <span className="eui-cal-agenda-date-day">{format(date, 'EEEE')}</span>
              <span className="eui-cal-agenda-date-full">
                {format(date, 'MMMM d, yyyy')}
              </span>
              {today && <span className="eui-cal-agenda-date-badge">Today</span>}
            </div>
            <div className="eui-cal-agenda-entries" role="list">
              {dayEntries.map(entry => {
                if (renderEntry) {
                  return (
                    <div
                      key={entry.id}
                      className="eui-cal-agenda-entry"
                      role="listitem"
                      onClick={(e) => handleEntryClick(entry, e)}
                      onContextMenu={(e) => handleEntryContextMenu(entry, e)}
                    >
                      {renderEntry(entry, {
                        view: ViewMode.agenda,
                        isCompact: false,
                        width: 0,
                        height: 0,
                        isStart: true,
                        isEnd: true,
                        isContinuation: false,
                      })}
                    </div>
                  );
                }

                const timeStr = entry.allDay
                  ? 'All day'
                  : `${formatTime(entry.start, config.timeFormat)} – ${formatTime(entry.end, config.timeFormat)}`;

                return (
                  <div
                    key={entry.id}
                    className="eui-cal-agenda-entry"
                    role="listitem"
                    onClick={(e) => handleEntryClick(entry, e)}
                    onContextMenu={(e) => handleEntryContextMenu(entry, e)}
                    style={{
                      '--eui-cal-entry-color': entry.color,
                    } as React.CSSProperties}
                  >
                    <div
                      className="eui-cal-agenda-entry-indicator"
                      style={{ backgroundColor: entry.color }}
                    />
                    <div className="eui-cal-agenda-entry-time">{timeStr}</div>
                    <div className="eui-cal-agenda-entry-title">{entry.title}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(AgendaView);

function getAgendaRange(date: Date, dayCount: number) {
  const start = startOfDay(date);
  const end = endOfDay(addDays(date, dayCount - 1));
  return { start, end };
}

export function createAgendaViewDef(dayCount: number = defaultAgendaDays, label?: string): CalendarViewDefinition {
  return {
    name: ViewMode.agenda,
    label: label ?? 'Agenda',
    component: AgendaView,
    getDateRange: (date) => getAgendaRange(date, dayCount),
    getTitle: (range) => {
      const startStr = format(range.start, 'MMM d');
      const endStr = format(range.end, 'MMM d, yyyy');
      return `${startStr} – ${endStr}`;
    },
    navigate: (date, dir) => dir === 'prev' ? subDays(date, dayCount) : addDays(date, dayCount),
  };
}

export const agendaViewDef = createAgendaViewDef();
