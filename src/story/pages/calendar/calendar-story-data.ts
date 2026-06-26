import type { CalendarEntry, DateBackground, DateRangeBackground } from '../../../components/calendar';

function daysFromNow(days: number, hour = 0, minute = 0): Date {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, minute, 0, 0);
    return d;
}

function today(hour: number, minute = 0): Date {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d;
}

export const sampleEntries: CalendarEntry[] = [
    {
        id: '1',
        title: 'Team Standup',
        start: today(9, 0),
        end: today(9, 30),
        color: '#3b82f6',
        editable: true,
        entryType: 'meeting',
    },
    {
        id: '2',
        title: 'Sprint Planning',
        start: today(10, 0),
        end: today(11, 30),
        color: '#8b5cf6',
        editable: true,
        entryType: 'meeting',
    },
    {
        id: '3',
        title: 'Lunch Break',
        start: today(12, 0),
        end: today(13, 0),
        color: '#10b981',
        entryType: 'personal',
    },
    {
        id: '4',
        title: 'Code Review',
        start: today(14, 0),
        end: today(15, 0),
        color: '#f59e0b',
        editable: true,
        entryType: 'task',
    },
    {
        id: '5',
        title: 'Design Sync',
        start: today(15, 30),
        end: today(16, 0),
        color: '#ec4899',
        editable: true,
        entryType: 'meeting',
    },
    {
        id: 'ad1',
        title: 'Company Holiday',
        start: daysFromNow(0),
        end: daysFromNow(0),
        allDay: true,
        color: '#10b981',
        entryType: 'event',
    },
    {
        id: 'ad2',
        title: 'All Day Conference',
        start: daysFromNow(1),
        end: daysFromNow(1),
        allDay: true,
        color: '#6366f1',
        entryType: 'event',
    },
    {
        id: 'ad3',
        title: 'Project Deadline',
        start: daysFromNow(2),
        end: daysFromNow(2),
        allDay: true,
        color: '#ef4444',
        entryType: 'deadline',
    },
    {
        id: 'ad4',
        title: 'Team Offsite (3 days)',
        start: daysFromNow(1),
        end: daysFromNow(3),
        allDay: true,
        color: '#f59e0b',
        entryType: 'event',
    },
    {
        id: 'ad5',
        title: 'Annual Review Period',
        start: daysFromNow(-2),
        end: daysFromNow(5),
        allDay: true,
        color: '#8b5cf6',
        entryType: 'event',
    },
    {
        id: 'ad6',
        title: 'Q2 Sprint (10+ days)',
        start: daysFromNow(0),
        end: daysFromNow(12),
        allDay: true,
        color: '#06b6d4',
        entryType: 'task',
    },
    {
        id: '8',
        title: 'Workshop',
        start: daysFromNow(1, 10, 0),
        end: daysFromNow(1, 12, 0),
        color: '#14b8a6',
        editable: true,
        entryType: 'event',
    },
    {
        id: '9',
        title: 'Client Call',
        start: daysFromNow(-1, 11, 0),
        end: daysFromNow(-1, 11, 45),
        color: '#f97316',
        entryType: 'meeting',
    },
    {
        id: '10',
        title: '1:1 with Manager',
        start: daysFromNow(3, 14, 0),
        end: daysFromNow(3, 14, 30),
        color: '#06b6d4',
        editable: true,
        entryType: 'meeting',
    },
    {
        id: '11',
        title: 'Multi-day Training',
        start: daysFromNow(4),
        end: daysFromNow(6),
        allDay: true,
        color: '#a855f7',
        entryType: 'event',
    },
    {
        id: '12',
        title: 'Morning Yoga',
        start: daysFromNow(0, 7, 0),
        end: daysFromNow(0, 7, 45),
        color: '#84cc16',
        entryType: 'personal',
    },
    {
        id: '13',
        title: 'Bug Triage',
        start: daysFromNow(2, 9, 0),
        end: daysFromNow(2, 10, 0),
        color: '#ef4444',
        editable: true,
        entryType: 'task',
    },
    {
        id: '14',
        title: 'Team Lunch',
        start: daysFromNow(-2, 12, 0),
        end: daysFromNow(-2, 13, 30),
        color: '#10b981',
        entryType: 'personal',
    },
    {
        id: '15',
        title: 'Release Review',
        start: daysFromNow(4, 15, 0),
        end: daysFromNow(4, 16, 30),
        color: '#f59e0b',
        editable: true,
        entryType: 'meeting',
    },
    {
        id: '16',
        title: 'Parallel Meeting A',
        start: today(10, 0),
        end: today(11, 0),
        color: '#ec4899',
        editable: true,
        entryType: 'meeting',
    },
    {
        id: '17',
        title: 'Parallel Meeting B',
        start: today(10, 30),
        end: today(11, 30),
        color: '#14b8a6',
        editable: true,
        entryType: 'meeting',
    },
    {
        id: '18',
        title: 'Parallel Meeting C',
        start: today(10, 15),
        end: today(11, 15),
        color: '#f43f5e',
        editable: true,
        entryType: 'meeting',
    },
    {
        id: '19',
        title: 'Parallel Meeting D',
        start: today(10, 45),
        end: today(11, 45),
        color: '#0ea5e9',
        editable: true,
        entryType: 'meeting',
    },
];

export const sampleDateBackgrounds: DateBackground[] = [
    { date: daysFromNow(0), color: 'rgba(59, 130, 246, 0.08)' },
    { date: daysFromNow(2), color: 'rgba(239, 68, 68, 0.08)' },
    { date: daysFromNow(5), color: 'rgba(16, 185, 129, 0.08)' },
];

export const sampleDateRangeBackgrounds: DateRangeBackground[] = [
    { start: daysFromNow(-3), end: daysFromNow(-1), color: 'rgba(139, 92, 246, 0.06)' },
];

export const externalDragItems = [
    { id: 'ext-1', title: 'Team Meeting', duration: 60, color: '#3b82f6' },
    { id: 'ext-2', title: 'Quick Call', duration: 30, color: '#10b981' },
    { id: 'ext-3', title: 'Workshop', duration: 120, color: '#f59e0b' },
    { id: 'ext-4', title: 'Review Session', duration: 45, color: '#8b5cf6' },
];

export const basicCalendarCode = `import { Calendar } from 'fluxo-ui';
import type { CalendarEntry } from 'fluxo-ui';

const entries: CalendarEntry[] = [
  {
    id: '1',
    title: 'Team Standup',
    start: new Date(2025, 8, 15, 9, 0),
    end: new Date(2025, 8, 15, 9, 30),
    color: '#3b82f6',
  },
  {
    id: '2',
    title: 'Sprint Planning',
    start: new Date(2025, 8, 15, 10, 0),
    end: new Date(2025, 8, 15, 11, 30),
    color: '#8b5cf6',
    editable: true,
  },
];

<Calendar
  entries={entries}
  initialView="timeGridWeek"
  height={600}
  editable
  selectable
  nowIndicator
  showNavigationPicker
/>`;

export const pluginSystemCode = `import { Calendar } from 'fluxo-ui';
import type { CalendarPlugin, CalendarViewDefinition } from 'fluxo-ui';

const myPlugin: CalendarPlugin = {
  name: 'my-custom-plugin',
  views: [myCustomView],
  toolbarActions: [
    {
      id: 'export',
      label: 'Export',
      position: 'end',
      onClick: (api) => {
        const entries = api.getEntries();
        console.log('Exporting', entries.length, 'entries');
      },
    },
  ],
  onInit: (api) => console.log('Plugin initialized'),
};

<Calendar
  entries={entries}
  plugins={[myPlugin]}
/>`;

export const customRenderCode = `<Calendar
  entries={entries}
  renderEntry={(entry, context) => (
    <div style={{ padding: '2px 4px' }}>
      <strong>{entry.title}</strong>
      {!context.isCompact && (
        <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
          {entry.data?.location}
        </div>
      )}
    </div>
  )}
/>`;

export const callbacksCode = `<Calendar
  entries={entries}
  onEntryClick={(entry, event) => {
    console.log('Clicked:', entry.title);
  }}
  onDateSelect={(info, event) => {
    console.log('Selected:', info.start, '-', info.end);
  }}
  onEntryDrop={(info, event) => {
    console.log('Moved:', info.entry.title, 'to', info.newStart);
  }}
  onEntryResize={(info, event) => {
    console.log('Resized:', info.entry.title);
  }}
  onEntryContextMenu={(entry, event) => {
    console.log('Right-click:', entry.title);
  }}
/>`;

export const configCode = `<Calendar
  entries={entries}
  slotDuration={15}
  visibleHoursStart={8}
  visibleHoursEnd={20}
  firstDayOfWeek={1}
  timeFormat="24h"
  businessHours={{
    daysOfWeek: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '17:00',
  }}
  hiddenDays={[0, 6]}
  rowBanding
  nowIndicator
  navLinks
/>`;

export const imperativeApiCode = `import { useRef } from 'react';
import { Calendar } from 'fluxo-ui';
import type { CalendarApi } from 'fluxo-ui';

const MyComponent = () => {
  const calendarRef = useRef<CalendarApi>(null);

  return (
    <>
      <button onClick={() => calendarRef.current?.prev()}>
        Previous
      </button>
      <button onClick={() => calendarRef.current?.today()}>
        Today
      </button>
      <button onClick={() => calendarRef.current?.changeView('dayGridMonth')}>
        Month View
      </button>

      <Calendar
        entries={entries}
        apiRef={calendarRef}
      />
    </>
  );
};`;

export const dateBackgroundCode = `<Calendar
  entries={entries}
  dateBackgrounds={[
    { date: new Date(2026, 3, 8), color: 'rgba(59, 130, 246, 0.1)' },
    { date: new Date(2026, 3, 10), color: 'rgba(239, 68, 68, 0.1)' },
  ]}
  dateRangeBackgrounds={[
    { start: new Date(2026, 3, 5), end: new Date(2026, 3, 7), color: 'rgba(139, 92, 246, 0.08)' },
  ]}
/>`;

export const externalDragCode = `<Calendar
  entries={entries}
  editable
  onExternalDrop={(info) => {
    console.log('Dropped at', info.date, 'allDay:', info.allDay);
    // Create new entry from the dropped data
  }}
/>`;
