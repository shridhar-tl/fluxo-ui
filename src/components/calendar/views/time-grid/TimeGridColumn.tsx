import React, { useMemo } from 'react';
import cn from 'classnames';
import { isToday, isSameDay } from 'date-fns';
import { ViewMode } from '../../calendar-types';
import type { ResolvedCalendarEntry, CalendarConfig, EntryRenderer, DateBackground, DateRangeBackground } from '../../calendar-types';
import {
  getTimeSlots, positionTimedEntries, isBusinessHour, getDateBackgroundColor,
} from '../../calendar-utils';
import { CalendarEntry } from '../../entries';
import OverflowPopover from '../../entries/OverflowPopover';
import { useCalendarContext } from '../../CalendarContext';
import TimeGridSlot from './TimeGridSlot';
import NowIndicator from './NowIndicator';

interface TimeGridColumnProps {
  date: Date;
  entries: ResolvedCalendarEntry[];
  config: CalendarConfig;
  effectiveHoursStart: number;
  effectiveHoursEnd: number;
  nowMinute?: number;
  showNowIndicator: boolean;
  renderEntry?: EntryRenderer;
  onEntryClick?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onEntryContextMenu?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onEntryPointerDown?: (entry: ResolvedCalendarEntry, event: React.PointerEvent) => void;
  onEntryResizePointerDown?: (entry: ResolvedCalendarEntry, edge: 'top' | 'bottom', event: React.PointerEvent) => void;
  onSlotPointerDown?: (date: Date, slotMinute: number, allDay: boolean, event: React.PointerEvent) => void;
  onSlotExternalDrop?: (date: Date, slotMinute: number, allDay: boolean, event: React.DragEvent) => void;
  dateBackgrounds?: DateBackground[];
  dateRangeBackgrounds?: DateRangeBackground[];
}

const TimeGridColumn: React.FC<TimeGridColumnProps> = ({
  date, entries, config, effectiveHoursStart, effectiveHoursEnd,
  nowMinute, showNowIndicator,
  renderEntry, onEntryClick, onEntryContextMenu,
  onEntryPointerDown, onEntryResizePointerDown,
  onSlotPointerDown, onSlotExternalDrop,
  dateBackgrounds, dateRangeBackgrounds,
}) => {
  const today = isToday(date);
  const bgColor = getDateBackgroundColor(date, dateBackgrounds, dateRangeBackgrounds);
  const slots = useMemo(
    () => getTimeSlots(effectiveHoursStart, effectiveHoursEnd, config.slotDuration),
    [effectiveHoursStart, effectiveHoursEnd, config.slotDuration]
  );

  const effectiveConfig = useMemo(() => {
    if (effectiveHoursStart === config.visibleHoursStart && effectiveHoursEnd === config.visibleHoursEnd) {
      return config;
    }
    return { ...config, visibleHoursStart: effectiveHoursStart, visibleHoursEnd: effectiveHoursEnd };
  }, [config, effectiveHoursStart, effectiveHoursEnd]);

  const positioned = useMemo(
    () => positionTimedEntries(entries, date, effectiveConfig),
    [entries, date, effectiveConfig]
  );

  const { visible, overflow } = useMemo(() => {
    const max = config.maxStackCount;
    if (positioned.length <= max) {
      return { visible: positioned, overflow: [] as ResolvedCalendarEntry[] };
    }
    const vis = positioned.slice(0, max);
    const ovf = positioned.slice(max).map(p => p.entry);
    return { visible: vis, overflow: ovf };
  }, [positioned, config.maxStackCount]);

  const { selectionState } = useCalendarContext();

  return (
    <div
      className={cn('eui-cal-time-column', { 'eui-cal-time-column-today': today })}
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      <div className="eui-cal-time-column-slots">
        {slots.map((slot, i) => (
          <TimeGridSlot
            key={`${slot.hour}-${slot.minute}`}
            date={date}
            hour={slot.hour}
            minute={slot.minute}
            isBusinessHour={isBusinessHour(date, slot.hour, config.businessHours)}
            isBanded={config.rowBanding && i % 2 === 1}
            onPointerDown={onSlotPointerDown}
            onExternalDrop={onSlotExternalDrop}
          />
        ))}
      </div>
      <div className="eui-cal-time-column-entries">
        {visible.map(pos => (
          <CalendarEntry
            key={pos.entry.id}
            entry={pos.entry}
            position={pos}
            context={{
              view: ViewMode.timeGridWeek,
              isCompact: pos.height < 40,
              width: pos.width,
              height: pos.height,
              isStart: true,
              isEnd: true,
              isContinuation: false,
            }}
            renderEntry={renderEntry}
            onClick={onEntryClick}
            onContextMenu={onEntryContextMenu}
            onPointerDown={onEntryPointerDown}
            onResizePointerDown={onEntryResizePointerDown}
            showResizeHandles
          />
        ))}
        {overflow.length > 0 && (
          <div className="eui-cal-time-column-overflow">
            <OverflowPopover
              entries={overflow}
              triggerLabel={`+${overflow.length} more`}
              renderEntry={renderEntry}
              onEntryClick={onEntryClick}
              onEntryContextMenu={onEntryContextMenu}
            />
          </div>
        )}
      </div>
      {showNowIndicator && today && nowMinute !== undefined && (
        <NowIndicator
          minuteOfDay={nowMinute}
          visibleHoursStart={effectiveHoursStart}
          visibleHoursEnd={effectiveHoursEnd}
          slotDuration={config.slotDuration}
          slotHeight={config.slotHeight}
        />
      )}
      {selectionState && selectionState.isSelecting && !selectionState.allDay && isSameDay(selectionState.startDate, date) && (
        <div
          className={cn('eui-cal-time-selection', { 'eui-cal-time-selection-mirror': config.selectMirror })}
          style={{
            top: `${(Math.min(selectionState.startSlot, selectionState.endSlot) - effectiveHoursStart * 60) / config.slotDuration * config.slotHeight}px`,
            height: `${Math.abs(selectionState.endSlot - selectionState.startSlot) / config.slotDuration * config.slotHeight}px`,
          }}
        >
          {config.selectMirror && <span className="eui-cal-time-selection-label">New Event</span>}
        </div>
      )}
    </div>
  );
};

export default React.memo(TimeGridColumn);
