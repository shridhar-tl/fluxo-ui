import React, { useState, useCallback } from 'react';
import { Calendar, ViewMode } from '../../../components/calendar';
import type { CalendarEntry } from '../../../components/calendar';
import { ComponentDemo } from '../../ComponentDemo';
import { CodeBlock } from '../../CodeBlock';
import { externalDragItems, externalDragCode } from './calendar-story-data';

function today(hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

const initialEntries: CalendarEntry[] = [
  { id: 'existing-1', title: 'Existing Meeting', start: today(10, 0), end: today(11, 0), color: '#6b7280' },
];

let nextId = 100;

const ExternalDragDrop: React.FC = () => {
  const [entries, setEntries] = useState<CalendarEntry[]>(initialEntries);
  const [lastAction, setLastAction] = useState('');

  const handleDragStart = useCallback((e: React.DragEvent, item: typeof externalDragItems[0]) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleExternalDrop = useCallback((info: { date: Date; allDay: boolean; data: DataTransfer | null }) => {
    if (!info.data) return;
    try {
      const raw = info.data.getData('application/json');
      if (!raw) return;
      const item = JSON.parse(raw);
      const start = info.date;
      const end = new Date(start.getTime() + (item.duration || 60) * 60000);
      const newEntry: CalendarEntry = {
        id: `ext-drop-${nextId++}`,
        title: item.title,
        start,
        end,
        color: item.color,
        allDay: info.allDay,
        editable: true,
      };
      setEntries(prev => [...prev, newEntry]);
      setLastAction(`Dropped "${item.title}" at ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    } catch {
      setLastAction('Invalid drop data');
    }
  }, []);

  return (
    <>
      <ComponentDemo title="External Drag & Drop" description="Drag items from the sidebar into the calendar to create new entries." centered={false}>
        <div className="flex flex-col md:flex-row gap-4" style={{ width: '100%' }}>
          <div className="flex-shrink-0 md:w-48 space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Drag these into calendar</h4>
            {externalDragItems.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing select-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="text-sm font-medium">{item.title}</span>
                <span className="text-xs text-gray-400 ml-auto">{item.duration}m</span>
              </div>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            {lastAction && (
              <div className="mb-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                {lastAction}
              </div>
            )}
            <div style={{ height: 500, width: '100%' }}>
              <Calendar
                entries={entries}
                initialView={ViewMode.timeGridDay}
                height="100%"
                editable
                visibleHoursStart={7}
                visibleHoursEnd={19}
                nowIndicator
                onExternalDrop={handleExternalDrop}
                onEntryDrop={(info) => {
                  setEntries(prev => prev.map(e =>
                    e.id === info.entry.id ? { ...e, start: info.newStart, end: info.newEnd } : e
                  ));
                }}
              />
            </div>
          </div>
        </div>
      </ComponentDemo>
      <div className="mt-4">
        <CodeBlock title="External Drag & Drop" code={externalDragCode} />
      </div>
    </>
  );
};

export default ExternalDragDrop;
