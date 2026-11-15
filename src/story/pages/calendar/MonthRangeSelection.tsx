import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, ViewMode } from '../../../components/calendar';
import type { CalendarEntry } from '../../../components/calendar';
import { ComponentDemo } from '../../ComponentDemo';
import { CodeBlock } from '../../CodeBlock';
import { monthRangeSelectionCode } from './calendar-story-data';

const MonthRangeSelection: React.FC = () => {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [lastAction, setLastAction] = useState('Drag across days to book them.');

  return (
    <>
      <ComponentDemo title="Day Range Selection" description="In the month view, press on a day and drag across other days to select a range. onDateSelect receives the first and last selected day. Click a day number to open that day." centered={false}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ height: 520 }}>
            <Calendar
              entries={entries}
              initialView={ViewMode.dayGridMonth}
              height="100%"
              selectable
              headerToolbarViews={[ViewMode.dayGridMonth, ViewMode.dayGridWeek, ViewMode.dayGridDay]}
              viewLabels={{ [ViewMode.dayGridWeek]: 'Week', [ViewMode.dayGridDay]: 'Day' }}
              navLinkView={ViewMode.dayGridDay}
              onDateSelect={(info) => {
                setEntries((prev) => [
                  ...prev,
                  { id: `booking-${prev.length + 1}`, title: `Booking ${prev.length + 1}`, start: info.start, end: info.end, allDay: true, color: '#10b981' },
                ]);
                setLastAction(`Selected ${format(info.start, 'MMM d')} to ${format(info.end, 'MMM d')}`);
              }}
            />
          </div>
          <div style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--eui-bg-subtle)', color: 'var(--eui-text)', fontSize: 14 }}>
            {lastAction}
          </div>
        </div>
      </ComponentDemo>
      <div className="mt-4">
        <CodeBlock title="Day Range Selection" code={monthRangeSelectionCode} />
      </div>
    </>
  );
};

export default MonthRangeSelection;
