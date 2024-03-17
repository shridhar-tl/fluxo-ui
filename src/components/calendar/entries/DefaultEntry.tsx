import React from 'react';
import type { ResolvedCalendarEntry, EntryRenderContext } from '../calendar-types';
import { formatTime } from '../calendar-utils';
import { useCalendarContext } from '../CalendarContext';

interface DefaultEntryProps {
  entry: ResolvedCalendarEntry;
  context: EntryRenderContext;
}

const DefaultEntry: React.FC<DefaultEntryProps> = ({ entry, context }) => {
  const { config } = useCalendarContext();
  const { isCompact } = context;

  return (
    <div className="eui-cal-entry-content">
      {config.displayEventTime && !isCompact && !entry.allDay && (
        <span className="eui-cal-entry-time">
          {formatTime(entry.start, config.timeFormat)}
        </span>
      )}
      <span className="eui-cal-entry-title">{entry.title}</span>
    </div>
  );
};

export default React.memo(DefaultEntry);
