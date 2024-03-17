import React from 'react';
import { minuteOffsetToPixels } from '../../calendar-utils';

interface NowIndicatorProps {
  minuteOfDay: number;
  visibleHoursStart: number;
  slotDuration: number;
  slotHeight: number;
}

const NowIndicator: React.FC<NowIndicatorProps> = ({ minuteOfDay, visibleHoursStart, slotDuration, slotHeight }) => {
  const startMinute = visibleHoursStart * 60;
  const offset = minuteOfDay - startMinute;
  if (offset < 0) return null;

  const top = minuteOffsetToPixels(offset, slotDuration, slotHeight);

  return (
    <div className="eui-cal-now-indicator" style={{ top: `${top}px` }}>
      <div className="eui-cal-now-indicator-dot" />
      <div className="eui-cal-now-indicator-line" />
    </div>
  );
};

export default React.memo(NowIndicator);
