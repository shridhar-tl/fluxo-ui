import React, { useCallback } from 'react';
import cn from 'classnames';

interface TimeGridSlotProps {
  date: Date;
  hour: number;
  minute: number;
  isBusinessHour: boolean;
  isBanded: boolean;
  onPointerDown?: (date: Date, slotMinute: number, allDay: boolean, event: React.PointerEvent) => void;
  onExternalDrop?: (date: Date, slotMinute: number, allDay: boolean, event: React.DragEvent) => void;
}

const TimeGridSlot: React.FC<TimeGridSlotProps> = ({
  date, hour, minute, isBusinessHour, isBanded,
  onPointerDown, onExternalDrop,
}) => {
  const slotMinute = (hour * 60) + minute;
  const isHourStart = minute === 0;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    onPointerDown?.(date, slotMinute, false, e);
  }, [date, slotMinute, onPointerDown]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!onExternalDrop) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, [onExternalDrop]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onExternalDrop?.(date, slotMinute, false, e);
  }, [date, slotMinute, onExternalDrop]);

  return (
    <div
      className={cn('eui-cal-time-slot', {
        'eui-cal-time-slot-hour': isHourStart,
        'eui-cal-time-slot-business': isBusinessHour,
        'eui-cal-time-slot-banded': isBanded,
      })}
      data-hour={hour}
      data-minute={minute}
      onPointerDown={handlePointerDown}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="gridcell"
    />
  );
};

export default React.memo(TimeGridSlot);
