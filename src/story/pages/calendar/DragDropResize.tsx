import React, { useState } from 'react';
import { Calendar, ViewMode } from '../../../components/calendar';
import type { CalendarEntry } from '../../../components/calendar';
import { ComponentDemo } from '../../ComponentDemo';
import { CodeBlock } from '../../CodeBlock';
import { callbacksCode } from './calendar-story-data';

function today(hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

const initialEntries: CalendarEntry[] = [
  { id: 'drag-1', title: 'Drag Me!', start: today(9, 0), end: today(10, 0), color: '#3b82f6', editable: true },
  { id: 'drag-2', title: 'Resize Me!', start: today(11, 0), end: today(12, 0), color: '#8b5cf6', editable: true },
  { id: 'drag-3', title: 'Fixed Entry', start: today(14, 0), end: today(15, 0), color: '#6b7280', editable: false },
];

const DragDropResize: React.FC = () => {
  const [entries, setEntries] = useState<CalendarEntry[]>(initialEntries);
  const [lastAction, setLastAction] = useState('');

  return (
    <>
      <ComponentDemo title="Drag, Drop & Resize" description="Entries marked as editable can be moved and resized. The fixed entry cannot be moved." centered={false}>
        {lastAction && (
          <div className="mb-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-700 dark:text-blue-300">
            {lastAction}
          </div>
        )}
        <div style={{ height: 550, width: '100%' }}>
          <Calendar
            entries={entries}
            initialView={ViewMode.timeGridDay}
            height="100%"
            editable
            selectable
            nowIndicator
            visibleHoursStart={7}
            visibleHoursEnd={18}
            onEntryDrop={(info) => {
              setEntries(prev => prev.map(e =>
                e.id === info.entry.id
                  ? { ...e, start: info.newStart, end: info.newEnd }
                  : e
              ));
              setLastAction(`Moved "${info.entry.title}" to ${info.newStart.toLocaleTimeString()}`);
            }}
            onEntryResize={(info) => {
              setEntries(prev => prev.map(e =>
                e.id === info.entry.id
                  ? { ...e, start: info.newStart, end: info.newEnd }
                  : e
              ));
              setLastAction(`Resized "${info.entry.title}" to ${info.newStart.toLocaleTimeString()} - ${info.newEnd.toLocaleTimeString()}`);
            }}
            onDateSelect={(info) => {
              setLastAction(`Selected: ${info.start.toLocaleTimeString()} - ${info.end.toLocaleTimeString()}`);
            }}
          />
        </div>
      </ComponentDemo>
      <div className="mt-4">
        <CodeBlock title="Event Callbacks" code={callbacksCode} />
      </div>
    </>
  );
};

export default DragDropResize;
