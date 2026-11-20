import React, { useCallback, useRef, useState } from 'react';
import { Calendar, CalendarNavigation, ViewMode } from '../../../components/calendar';
import type { CalendarApi } from '../../../components/calendar';
import { ComponentDemo } from '../../ComponentDemo';
import { CodeBlock } from '../../CodeBlock';
import { sampleEntries } from './calendar-story-data';

const keyboardCode = `<Calendar
  entries={entries}
  navigationLayout="today-between"
  keyboardShortcuts="focus-within"
/>

// T: today, J or Right arrow: next period, K or Left arrow: previous period.
// keyboardShortcuts={true} listens on the whole page; use it for a full-page calendar.`;

const standaloneCode = `const apiRef = useRef<CalendarApi>(null);
const [title, setTitle] = useState('');

<header>
  <span>{title}</span>
  <CalendarNavigation
    layout="today-between"
    onPrev={() => apiRef.current?.prev()}
    onNext={() => apiRef.current?.next()}
    onToday={() => apiRef.current?.today()}
  />
</header>
<Calendar entries={entries} apiRef={apiRef} hideToolbar onTitleChange={setTitle} />`;

const KeyboardNavigationDemo: React.FC = () => {
  const apiRef = useRef<CalendarApi>(null);
  const [title, setTitle] = useState('');

  const goPrev = useCallback(() => apiRef.current?.prev(), []);
  const goNext = useCallback(() => apiRef.current?.next(), []);
  const goToday = useCallback(() => apiRef.current?.today(), []);

  return (
    <>
      <ComponentDemo
        title="Keyboard Shortcuts"
        description="Set keyboardShortcuts to navigate with T (today), J or Right arrow (next) and K or Left arrow (previous). With 'focus-within' the keys work while focus is inside this calendar, so several calendars can share a page. Keys typed into inputs, or pressed while a dialog or popover is open, are ignored. navigationLayout='today-between' places Today between the arrows."
        centered={false}
      >
        <div style={{ height: 500, width: '100%' }}>
          <Calendar
            entries={sampleEntries}
            initialView={ViewMode.dayGridMonth}
            height="100%"
            navigationLayout="today-between"
            keyboardShortcuts="focus-within"
          />
        </div>
      </ComponentDemo>
      <div className="mt-4">
        <CodeBlock title="Keyboard Shortcuts" code={keyboardCode} />
      </div>
      <ComponentDemo
        title="Standalone Navigation"
        description="Render CalendarNavigation in your own header when the built-in toolbar is hidden, and drive the calendar through apiRef."
        centered={false}
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--eui-text)', fontWeight: 600 }}>{title}</span>
            <CalendarNavigation layout="today-between" onPrev={goPrev} onNext={goNext} onToday={goToday} />
          </div>
          <div style={{ height: 420, width: '100%' }}>
            <Calendar
              entries={sampleEntries}
              initialView={ViewMode.timeGridWeek}
              height="100%"
              apiRef={apiRef}
              hideToolbar
              onTitleChange={setTitle}
            />
          </div>
        </div>
      </ComponentDemo>
      <div className="mt-4">
        <CodeBlock title="Standalone Navigation" code={standaloneCode} />
      </div>
    </>
  );
};

export default KeyboardNavigationDemo;
