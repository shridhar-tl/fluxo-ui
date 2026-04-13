import React, { useState, useCallback, useRef, useMemo } from 'react';
import cn from 'classnames';
import { Calendar, ViewMode } from '../../../components/calendar';
import type { CalendarApi, CalendarEntry, CalendarPlugin, BusinessHours, EntryCreateInfo } from '../../../components/calendar';
import {
  defaultPlugins,
  yearGridPlugin,
  agendaPlugin,
  timeGridCustomPlugin,
} from '../../../components/calendar/plugins';
import { Button } from '../../../components/Button';
import { useStoryTheme } from '../../StoryThemeContext';
import { CodeBlock } from '../../CodeBlock';
import PlaygroundSettings from './PlaygroundSettings';
import type { PlaygroundState } from './PlaygroundSettings';
import { sampleEntries, sampleDateBackgrounds, sampleDateRangeBackgrounds } from '../calendar/calendar-story-data';

const playgroundPlugins: CalendarPlugin[] = [
  ...defaultPlugins,
  yearGridPlugin(),
  agendaPlugin({ dayCount: 14 }),
  timeGridCustomPlugin({ dayCount: 3, label: '3 Days' }),
];

function generateCode(state: PlaygroundState): string {
  const props: string[] = [];
  props.push('  entries={entries}');
  props.push(`  initialView="${state.viewMode}"`);
  props.push('  height="100%"');

  if (state.slotDuration !== 30) props.push(`  slotDuration={${state.slotDuration}}`);
  if (state.snapDuration !== 15) props.push(`  snapDuration={${state.snapDuration}}`);
  if (state.visibleHoursStart !== 0) props.push(`  visibleHoursStart={${state.visibleHoursStart}}`);
  if (state.visibleHoursEnd !== 24) props.push(`  visibleHoursEnd={${state.visibleHoursEnd}}`);
  if (state.firstDayOfWeek !== 0) props.push(`  firstDayOfWeek={${state.firstDayOfWeek}}`);
  if (state.timeFormat !== '12h') props.push(`  timeFormat="${state.timeFormat}"`);
  if (state.editable) props.push('  editable');
  if (state.selectable) props.push('  selectable');
  if (state.creatable) props.push('  creatable');
  if (state.slotHeight !== 36) props.push(`  slotHeight={${state.slotHeight}}`);
  if (state.nowIndicator) props.push('  nowIndicator');
  if (state.navLinks) props.push('  navLinks');
  if (state.compact) props.push('  compact');
  if (state.rowBanding) props.push('  rowBanding');
  if (!state.showNonCurrentDates) props.push('  showNonCurrentDates={false}');
  if (state.weekNumbers) props.push('  weekNumbers');
  if (state.showNavigationPicker) props.push('  showNavigationPicker');
  if (state.navigationPickerIconOnly) props.push('  navigationPickerIconOnly');
  if (state.minEntryHeight !== 20) props.push(`  minEntryHeight={${state.minEntryHeight}}`);
  if (state.hideToolbar) props.push('  hideToolbar');
  if (state.hideToolbarNavigation) props.push('  hideToolbarNavigation');
  if (state.hideToolbarTitle) props.push('  hideToolbarTitle');
  if (state.hideToolbarViewSwitcher) props.push('  hideToolbarViewSwitcher');
  if (state.hiddenDays.length > 0) props.push(`  hiddenDays={[${state.hiddenDays.join(', ')}]}`);
  if (state.dayHeaderFormat && state.dayHeaderFormat !== 'd') props.push(`  dayHeaderFormat="${state.dayHeaderFormat}"`);
  if (state.weekDayHeaderFormat && state.weekDayHeaderFormat !== 'EEE') props.push(`  weekDayHeaderFormat="${state.weekDayHeaderFormat}"`);
  if (state.slotLabelFormat) props.push(`  slotLabelFormat="${state.slotLabelFormat}"`);

  const bh = state.businessDays.join(',') !== '1,2,3,4,5' || state.businessStartTime !== '09:00' || state.businessEndTime !== '17:00';
  if (bh) {
    props.push(`  businessHours={{`);
    props.push(`    daysOfWeek: [${state.businessDays.join(', ')}],`);
    props.push(`    startTime: '${state.businessStartTime}',`);
    props.push(`    endTime: '${state.businessEndTime}',`);
    props.push(`  }}`);
  }

  if (state.eventMinDuration > 0) props.push(`  eventMinDuration={${state.eventMinDuration}}`);
  if (state.eventMaxDuration > 0) props.push(`  eventMaxDuration={${state.eventMaxDuration}}`);
  if (state.eventDefaultDuration !== 60) props.push(`  eventDefaultDuration={${state.eventDefaultDuration}}`);
  if (!state.eventDurationEditable) props.push('  eventDurationEditable={false}');
  if (!state.eventStartEditable) props.push('  eventStartEditable={false}');
  if (!state.eventOverlap) props.push('  eventOverlap={false}');
  if (state.selectMinDistance > 0) props.push(`  selectMinDistance={${state.selectMinDistance}}`);
  if (!state.selectOverlap) props.push('  selectOverlap={false}');
  if (state.selectMirror) props.push('  selectMirror');
  if (state.scrollTime !== '08:00') props.push(`  scrollTime="${state.scrollTime}"`);
  if (state.longPressDelay !== 1000) props.push(`  longPressDelay={${state.longPressDelay}}`);
  if (state.moreLinkClick !== 'popover') props.push(`  moreLinkClick="${state.moreLinkClick}"`);
  if (state.dateAlignment > 0) props.push(`  dateAlignment={${state.dateAlignment}}`);
  if (state.allDaySlotMaxHeight > 0) props.push(`  allDaySlotMaxHeight={${state.allDaySlotMaxHeight}}`);
  if (state.dayMinWidth > 0) props.push(`  dayMinWidth={${state.dayMinWidth}}`);
  if (state.weekText) props.push(`  weekText="${state.weekText}"`);
  if (!state.fixedWeekCount) props.push('  fixedWeekCount={false}');
  if (state.expandRows) props.push('  expandRows');
  if (state.multiMonthCount !== 3) props.push(`  multiMonthCount={${state.multiMonthCount}}`);
  if (state.nowIndicatorInterval !== 60000) props.push(`  nowIndicatorInterval={${state.nowIndicatorInterval}}`);
  if (state.dayPopoverFormat !== 'EEEE, MMMM d') props.push(`  dayPopoverFormat="${state.dayPopoverFormat}"`);
  if (state.allDayText && state.allDayText !== 'all-day') props.push(`  allDayText="${state.allDayText}"`);
  if (!state.displayEventTime) props.push('  displayEventTime={false}');

  if (state.creatable) props.push('  onEntryCreate={(info) => { /* handle new entry */ }}');
  props.push('  onEntryClick={(entry) => { /* handle click */ }}');
  props.push('  onDateSelect={(info) => { /* handle selection */ }}');

  return `<Calendar\n${props.join('\n')}\n/>`;
}

const defaultState: PlaygroundState = {
  viewMode: ViewMode.timeGridWeek,
  slotDuration: 30,
  snapDuration: 15,
  visibleHoursStart: 0,
  visibleHoursEnd: 24,
  firstDayOfWeek: 0,
  timeFormat: '12h',
  editable: true,
  selectable: true,
  creatable: true,
  slotHeight: 36,
  nowIndicator: true,
  navLinks: true,
  compact: false,
  rowBanding: false,
  showNonCurrentDates: true,
  weekNumbers: false,
  showNavigationPicker: true,
  navigationPickerIconOnly: false,
  showDateBackgrounds: false,
  dayHeaderFormat: 'd',
  weekDayHeaderFormat: 'EEE',
  slotLabelFormat: '',
  hideToolbar: false,
  hideToolbarNavigation: false,
  hideToolbarTitle: false,
  hideToolbarViewSwitcher: false,
  minEntryHeight: 20,
  hiddenDays: [],
  businessDays: [1, 2, 3, 4, 5],
  businessStartTime: '09:00',
  businessEndTime: '17:00',
  eventMinDuration: 0,
  eventMaxDuration: 0,
  eventDefaultDuration: 60,
  eventDurationEditable: true,
  eventStartEditable: true,
  eventOverlap: true,
  selectMinDistance: 0,
  selectOverlap: true,
  selectMirror: false,
  scrollTime: '08:00',
  longPressDelay: 1000,
  moreLinkClick: 'popover',
  dateAlignment: 0,
  allDaySlotMaxHeight: 0,
  dayMinWidth: 0,
  weekText: '',
  fixedWeekCount: true,
  expandRows: false,
  multiMonthCount: 3,
  nowIndicatorInterval: 60000,
  dayPopoverFormat: 'EEEE, MMMM d',
  allDayText: 'all-day',
  displayEventTime: true,
};

const CalendarPlaygroundPage: React.FC = () => {
  const { isDark } = useStoryTheme();
  const [state, setState] = useState<PlaygroundState>(defaultState);
  const [entries, setEntries] = useState<CalendarEntry[]>(sampleEntries);
  const [lastAction, setLastAction] = useState('');
  const apiRef = useRef<CalendarApi>(null);

  const handleChange = useCallback((updates: Partial<PlaygroundState>) => {
    setState(prev => {
      const next = { ...prev, ...updates };
      if (updates.viewMode && apiRef.current) {
        apiRef.current.changeView(updates.viewMode);
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setState(defaultState);
    setEntries(sampleEntries);
    setLastAction('Settings reset to defaults');
  }, []);

  const nextId = useRef(1000);

  const handleEntryCreate = useCallback((info: EntryCreateInfo) => {
    const id = `new-${nextId.current++}`;
    const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const title = info.allDay ? 'New Event' : `New Event (${fmt(info.start)} – ${fmt(info.end)})`;
    const newEntry: CalendarEntry = {
      id,
      title,
      start: info.start,
      end: info.end,
      allDay: info.allDay,
      color: '#6366f1',
    };
    setEntries(prev => [...prev, newEntry]);
    setLastAction(`Created entry: "${title}" on ${info.view} view`);
  }, []);

  const [showCode, setShowCode] = useState(false);
  const generatedCode = useMemo(() => generateCode(state), [state]);

  const businessHours = useMemo<BusinessHours>(() => ({
    daysOfWeek: state.businessDays,
    startTime: state.businessStartTime,
    endTime: state.businessEndTime,
  }), [state.businessDays, state.businessStartTime, state.businessEndTime]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className={cn('text-2xl md:text-3xl font-bold mb-2', { 'text-white': isDark, 'text-gray-900': !isDark })}>
          Calendar Playground
        </h1>
        <p className={cn('text-base', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
          Configure every property of the Calendar component in real time.
        </p>
      </div>

      {lastAction && (
        <div className={cn('px-4 py-2 rounded text-sm', {
          'bg-blue-900/30 text-blue-300 border border-blue-800': isDark,
          'bg-blue-50 text-blue-700 border border-blue-200': !isDark,
        })}>
          {lastAction}
        </div>
      )}

      <div style={{ height: 600, width: '100%' }}>
        <Calendar
          entries={entries}
          initialView={state.viewMode}
          height="100%"
          apiRef={apiRef}
          plugins={playgroundPlugins}
          slotDuration={state.slotDuration}
          snapDuration={state.snapDuration}
          visibleHoursStart={state.visibleHoursStart}
          visibleHoursEnd={state.visibleHoursEnd}
          firstDayOfWeek={state.firstDayOfWeek}
          timeFormat={state.timeFormat}
          editable={state.editable}
          selectable={state.selectable}
          creatable={state.creatable}
          slotHeight={state.slotHeight}
          nowIndicator={state.nowIndicator}
          navLinks={state.navLinks}
          compact={state.compact}
          rowBanding={state.rowBanding}
          showNonCurrentDates={state.showNonCurrentDates}
          weekNumbers={state.weekNumbers}
          showNavigationPicker={state.showNavigationPicker}
          navigationPickerIconOnly={state.navigationPickerIconOnly}
          dateBackgrounds={state.showDateBackgrounds ? sampleDateBackgrounds : undefined}
          dateRangeBackgrounds={state.showDateBackgrounds ? sampleDateRangeBackgrounds : undefined}
          dayHeaderFormat={state.dayHeaderFormat || undefined}
          weekDayHeaderFormat={state.weekDayHeaderFormat || undefined}
          slotLabelFormat={state.slotLabelFormat || undefined}
          hideToolbar={state.hideToolbar}
          hideToolbarNavigation={state.hideToolbarNavigation}
          hideToolbarTitle={state.hideToolbarTitle}
          hideToolbarViewSwitcher={state.hideToolbarViewSwitcher}
          minEntryHeight={state.minEntryHeight}
          hiddenDays={state.hiddenDays}
          businessHours={businessHours}
          eventMinDuration={state.eventMinDuration || undefined}
          eventMaxDuration={state.eventMaxDuration || undefined}
          eventDefaultDuration={state.eventDefaultDuration}
          eventDurationEditable={state.eventDurationEditable}
          eventStartEditable={state.eventStartEditable}
          eventOverlap={state.eventOverlap}
          selectMinDistance={state.selectMinDistance || undefined}
          selectOverlap={state.selectOverlap}
          selectMirror={state.selectMirror}
          scrollTime={state.scrollTime}
          longPressDelay={state.longPressDelay}
          moreLinkClick={state.moreLinkClick}
          dateAlignment={state.dateAlignment || undefined}
          allDaySlotMaxHeight={state.allDaySlotMaxHeight || undefined}
          dayMinWidth={state.dayMinWidth || undefined}
          weekText={state.weekText || undefined}
          fixedWeekCount={state.fixedWeekCount}
          expandRows={state.expandRows}
          multiMonthCount={state.multiMonthCount}
          nowIndicatorInterval={state.nowIndicatorInterval}
          dayPopoverFormat={state.dayPopoverFormat || undefined}
          allDayText={state.allDayText || undefined}
          displayEventTime={state.displayEventTime}
          onViewChange={(view) => {
            setState(prev => ({ ...prev, viewMode: view }));
          }}
          onEntryClick={(entry) => {
            setLastAction(`Clicked: "${entry.title}"`);
          }}
          onEntryContextMenu={(entry) => {
            setLastAction(`Right-clicked: "${entry.title}"`);
          }}
          onDateSelect={(info) => {
            const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setLastAction(`Selected: ${fmt(info.start)} – ${fmt(info.end)}${info.allDay ? ' (all day)' : ''}`);
          }}
          onEntryDrop={(info) => {
            setEntries(prev => prev.map(e =>
              e.id === info.entry.id ? { ...e, start: info.newStart, end: info.newEnd } : e
            ));
            setLastAction(`Moved "${info.entry.title}" to ${info.newStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
          }}
          onEntryResize={(info) => {
            setEntries(prev => prev.map(e =>
              e.id === info.entry.id ? { ...e, start: info.newStart, end: info.newEnd } : e
            ));
            const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setLastAction(`Resized "${info.entry.title}" to ${fmt(info.newStart)} – ${fmt(info.newEnd)}`);
          }}
          onDateClick={(date) => {
            setLastAction(`Date clicked: ${date.toLocaleDateString()}`);
          }}
          onEntryCreate={handleEntryCreate}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className={cn('text-xl font-semibold', { 'text-white': isDark, 'text-gray-900': !isDark })}>
            Settings
          </h2>
          <Button
            label={showCode ? 'Hide Code' : 'Show Code'}
            size="sm"
            layout="outlined"
            onClick={() => setShowCode(prev => !prev)}
          />
        </div>
        <Button label="Reset to Defaults" size="sm" layout="outlined" variant="warning" onClick={handleReset} />
      </div>

      {showCode && (
        <CodeBlock title="Generated Code" code={generatedCode} />
      )}

      <PlaygroundSettings state={state} onChange={handleChange} />
    </div>
  );
};

export default CalendarPlaygroundPage;
