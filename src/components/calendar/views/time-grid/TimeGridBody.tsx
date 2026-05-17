import React, { useMemo, useRef, useEffect } from 'react';
import cn from 'classnames';
import type { ResolvedCalendarEntry, CalendarConfig, EntryRenderer, DateBackground, DateRangeBackground } from '../../calendar-types';
import { formatHour, getEntriesForDay, getTimedEntries, format as fnsFormat, setHours, setMinutes, getHours, getMinutes as getMinutesFn } from '../../calendar-utils';
import TimeGridColumn from './TimeGridColumn';

interface TimeGridBodyProps {
  days: Date[];
  entries: ResolvedCalendarEntry[];
  config: CalendarConfig;
  nowMinute?: number;
  showNowIndicator: boolean;
  renderEntry?: EntryRenderer;
  onEntryClick?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onEntryContextMenu?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onEntryPointerDown?: (entry: ResolvedCalendarEntry, event: React.PointerEvent) => void;
  onEntryResizePointerDown?: (entry: ResolvedCalendarEntry, edge: 'top' | 'bottom', event: React.PointerEvent) => void;
  onSlotPointerDown?: (date: Date, slotMinute: number, allDay: boolean, event: React.PointerEvent) => void;
  scrollToTime?: string;
  onSlotExternalDrop?: (date: Date, slotMinute: number, allDay: boolean, event: React.DragEvent) => void;
  dateBackgrounds?: DateBackground[];
  dateRangeBackgrounds?: DateRangeBackground[];
}

const TimeGridBody: React.FC<TimeGridBodyProps> = ({
  days, entries, config, nowMinute, showNowIndicator,
  renderEntry, onEntryClick, onEntryContextMenu,
  onEntryPointerDown, onEntryResizePointerDown,
  onSlotPointerDown,
  scrollToTime,
  onSlotExternalDrop,
  dateBackgrounds, dateRangeBackgrounds,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  const entriesByDay = useMemo(() => {
    const map = new Map<string, ResolvedCalendarEntry[]>();
    for (const day of days) {
      map.set(day.toISOString(), getEntriesForDay(entries, day, config.entryOrder));
    }
    return map;
  }, [entries, days, config.entryOrder]);

  const effectiveHours = useMemo(() => {
    let minHour = config.visibleHoursStart;
    let maxHour = config.visibleHoursEnd;

    for (const dayEntries of entriesByDay.values()) {
      const timed = getTimedEntries(dayEntries);
      for (const entry of timed) {
        const startH = getHours(entry.start);
        const endH = getHours(entry.end);
        const endM = getMinutesFn(entry.end);
        const effectiveEnd = endM > 0 ? endH + 1 : endH;

        if (startH < minHour) minHour = startH;
        if (effectiveEnd > maxHour) maxHour = Math.min(effectiveEnd, 24);
      }
    }

    return { start: minHour, end: maxHour };
  }, [entriesByDay, config.visibleHoursStart, config.visibleHoursEnd]);

  const hourSlots = useMemo(() => {
    const slots: number[] = [];
    for (let h = effectiveHours.start; h < effectiveHours.end; h++) {
      slots.push(h);
    }
    return slots;
  }, [effectiveHours]);

  const labelInterval = useMemo(() => {
    const interval = config.slotLabelInterval;
    if (!interval || interval <= 0) return 60;
    if (60 % interval !== 0) return 60;
    return Math.min(interval, 60);
  }, [config.slotLabelInterval]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (!hasScrolled.current) {
      hasScrolled.current = true;
      let targetHour = 8;
      if (scrollToTime) {
        const [h] = scrollToTime.split(':').map(Number);
        if (!isNaN(h)) targetHour = h;
      } else if (showNowIndicator && nowMinute !== undefined) {
        targetHour = Math.floor(nowMinute / 60) - 1;
      }
      const slotsPerHour = 60 / config.slotDuration;
      const scrollTop = (targetHour - effectiveHours.start) * slotsPerHour * config.slotHeight;
      el.scrollTop = Math.max(0, scrollTop);
    }

    const sbWidth = el.offsetWidth - el.clientWidth;
    const grid = el.closest('.eui-cal-time-grid');
    if (grid) {
      (grid as HTMLElement).style.setProperty('--eui-cal-scrollbar-w', `${sbWidth}px`);
    }
  }, []);

  return (
    <div className="eui-cal-time-body" ref={scrollRef}>
      <div className="eui-cal-time-body-inner">
        <div className="eui-cal-time-gutter">
          {hourSlots.map(hour => {
            const slotsInHour = 60 / config.slotDuration;
            return Array.from({ length: slotsInHour }).map((_, slotIdx) => {
              const minute = slotIdx * config.slotDuration;
              const showLabel = minute % labelInterval === 0;
              const labelDate = setMinutes(setHours(new Date(), hour), minute);
              const text = !showLabel
                ? ''
                : config.slotLabelFormat
                  ? fnsFormat(labelDate, config.slotLabelFormat)
                  : (minute === 0
                      ? formatHour(hour, config.timeFormat)
                      : fnsFormat(labelDate, config.timeFormat === '12h' ? 'h:mm a' : 'HH:mm'));
              const isSub = showLabel && minute !== 0;
              return (
                <div
                  key={`${hour}-${minute}`}
                  className="eui-cal-time-gutter-cell"
                  style={{ height: `${config.slotHeight}px` }}
                >
                  {showLabel && (
                    <span
                      className={cn('eui-cal-time-gutter-label', {
                        'eui-cal-time-gutter-label-sub': isSub,
                      })}
                    >
                      {text}
                    </span>
                  )}
                </div>
              );
            });
          })}
        </div>
        <div className="eui-cal-time-columns">
          {days.map(day => (
            <TimeGridColumn
              key={day.toISOString()}
              date={day}
              entries={entriesByDay.get(day.toISOString()) ?? []}
              config={config}
              effectiveHoursStart={effectiveHours.start}
              effectiveHoursEnd={effectiveHours.end}
              nowMinute={nowMinute}
              showNowIndicator={showNowIndicator}
              renderEntry={renderEntry}
              onEntryClick={onEntryClick}
              onEntryContextMenu={onEntryContextMenu}
              onEntryPointerDown={onEntryPointerDown}
              onEntryResizePointerDown={onEntryResizePointerDown}
              onSlotPointerDown={onSlotPointerDown}
              onSlotExternalDrop={onSlotExternalDrop}
              dateBackgrounds={dateBackgrounds}
              dateRangeBackgrounds={dateRangeBackgrounds}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(TimeGridBody);
