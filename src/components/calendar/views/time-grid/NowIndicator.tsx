import React from 'react';
import { minuteOffsetToPixels } from '../../calendar-utils';

interface NowIndicatorProps {
  minuteOfDay: number;
  visibleHoursStart: number;
  visibleHoursEnd: number;
  slotDuration: number;
  slotHeight: number;
}

const NowIndicator: React.FC<NowIndicatorProps> = ({ minuteOfDay, visibleHoursStart, visibleHoursEnd, slotDuration, slotHeight }) => {
  const startMinute = visibleHoursStart * 60;
  const endMinute = visibleHoursEnd * 60;
  if (minuteOfDay < startMinute || minuteOfDay > endMinute) return null;

  const offset = minuteOfDay - startMinute;
  const top = minuteOffsetToPixels(offset, slotDuration, slotHeight);

  return (
    <div className="eui-cal-now-indicator" style={{ top: `${top}px` }}>
      <div className="eui-cal-now-indicator-dot" />
      <div className="eui-cal-now-indicator-line" />
    </div>
  );
};

export default React.memo(NowIndicator);
