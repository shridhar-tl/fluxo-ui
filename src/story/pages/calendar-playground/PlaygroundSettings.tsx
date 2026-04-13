import React from 'react';
import cn from 'classnames';
import { TextInput } from '../../../components/TextInput';
import { NumericInput } from '../../../components/NumericInput';
import { Dropdown } from '../../../components/Dropdown';
import { Checkbox } from '../../../components/Checkbox';
import { InputSwitch } from '../../../components/InputSwitch';
import { useStoryTheme } from '../../StoryThemeContext';
import { ViewMode } from '../../../components/calendar';
import type { CalendarViewMode, TimeFormat } from '../../../components/calendar';

const viewModeOptions = [
  { label: 'Month Grid', value: ViewMode.dayGridMonth },
  { label: 'Week Time Grid', value: ViewMode.timeGridWeek },
  { label: 'Day Time Grid', value: ViewMode.timeGridDay },
  { label: 'Week Day Grid', value: ViewMode.dayGridWeek },
  { label: 'Day Grid', value: ViewMode.dayGridDay },
  { label: 'Month List', value: ViewMode.listMonth },
  { label: 'Week List', value: ViewMode.listWeek },
  { label: 'Day List', value: ViewMode.listDay },
  { label: 'Multi-Month', value: ViewMode.multiMonth },
  { label: 'Scroll Month', value: ViewMode.scrollMonth },
  { label: 'Year', value: ViewMode.yearGrid },
  { label: 'Agenda', value: ViewMode.agenda },
  { label: '3 Days', value: ViewMode.timeGrid3Day },
];

const timeFormatOptions = [
  { label: '12 hour', value: '12h' },
  { label: '24 hour', value: '24h' },
];

const slotDurationOptions = [
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '60 min', value: 60 },
];

const snapDurationOptions = [
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
];

const firstDayOptions = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
];

const moreLinkOptions = [
  { label: 'Popover', value: 'popover' },
  { label: 'Navigate to Day', value: 'day' },
];

const dayOfWeekOptions = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export interface PlaygroundState {
  viewMode: CalendarViewMode;
  slotDuration: number;
  snapDuration: number;
  visibleHoursStart: number;
  visibleHoursEnd: number;
  firstDayOfWeek: number;
  timeFormat: TimeFormat;
  editable: boolean;
  selectable: boolean;
  creatable: boolean;
  slotHeight: number;
  nowIndicator: boolean;
  navLinks: boolean;
  compact: boolean;
  rowBanding: boolean;
  showNonCurrentDates: boolean;
  weekNumbers: boolean;
  showNavigationPicker: boolean;
  navigationPickerIconOnly: boolean;
  hideToolbar: boolean;
  hideToolbarNavigation: boolean;
  hideToolbarTitle: boolean;
  hideToolbarViewSwitcher: boolean;
  minEntryHeight: number;
  hiddenDays: number[];
  businessDays: number[];
  businessStartTime: string;
  businessEndTime: string;
  showDateBackgrounds: boolean;
  dayHeaderFormat: string;
  weekDayHeaderFormat: string;
  slotLabelFormat: string;
  eventMinDuration: number;
  eventMaxDuration: number;
  eventDefaultDuration: number;
  eventDurationEditable: boolean;
  eventStartEditable: boolean;
  eventOverlap: boolean;
  selectMinDistance: number;
  selectOverlap: boolean;
  selectMirror: boolean;
  scrollTime: string;
  longPressDelay: number;
  moreLinkClick: 'popover' | 'day';
  dateAlignment: number;
  allDaySlotMaxHeight: number;
  dayMinWidth: number;
  weekText: string;
  fixedWeekCount: boolean;
  expandRows: boolean;
  multiMonthCount: number;
  nowIndicatorInterval: number;
  dayPopoverFormat: string;
  allDayText: string;
  displayEventTime: boolean;
}

interface PlaygroundSettingsProps {
  state: PlaygroundState;
  onChange: (updates: Partial<PlaygroundState>) => void;
}

const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const { isDark } = useStoryTheme();
  return (
    <div className={cn('rounded-lg border p-4', {
      'border-gray-700 bg-gray-800/50': isDark,
      'border-gray-200 bg-gray-50': !isDark,
    })}>
      <h4 className={cn('text-sm font-semibold mb-3', {
        'text-gray-300': isDark,
        'text-gray-700': !isDark,
      })}>{title}</h4>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

const SettingRow: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => {
  const { isDark } = useStoryTheme();
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1 min-w-0">
        <label className={cn('text-xs font-medium whitespace-nowrap', {
          'text-gray-400': isDark,
          'text-gray-600': !isDark,
        })}>{label}</label>
        {hint && (
          <span
            className={cn('inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-bold cursor-help flex-shrink-0', {
              'bg-gray-700 text-gray-400': isDark,
              'bg-gray-200 text-gray-500': !isDark,
            })}
            title={hint}
          >
            ?
          </span>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
};

const PlaygroundSettings: React.FC<PlaygroundSettingsProps> = ({ state, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <SettingSection title="View Settings">
        <SettingRow label="View Mode">
          <Dropdown
            value={state.viewMode}
            options={viewModeOptions}
            onChange={(e) => onChange({ viewMode: e.value })}
            size="sm"
          />
        </SettingRow>
        <SettingRow label="Time Format">
          <Dropdown
            value={state.timeFormat}
            options={timeFormatOptions}
            onChange={(e) => onChange({ timeFormat: e.value })}
            size="sm"
          />
        </SettingRow>
        <SettingRow label="First Day of Week">
          <Dropdown
            value={state.firstDayOfWeek}
            options={firstDayOptions}
            onChange={(e) => onChange({ firstDayOfWeek: e.value })}
            size="sm"
          />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Time Grid">
        <SettingRow label="Slot Duration" hint="Time grid views only (Week, Day)">
          <Dropdown
            value={state.slotDuration}
            options={slotDurationOptions}
            onChange={(e) => onChange({ slotDuration: e.value })}
            size="sm"
          />
        </SettingRow>
        <SettingRow label="Snap Duration" hint="Time grid views only (Week, Day)">
          <Dropdown
            value={state.snapDuration}
            options={snapDurationOptions}
            onChange={(e) => onChange({ snapDuration: e.value })}
            size="sm"
          />
        </SettingRow>
        <SettingRow label="Visible Hours Start" hint="Time grid views only">
          <NumericInput
            value={state.visibleHoursStart}
            onChange={(e) => onChange({ visibleHoursStart: Math.max(0, Math.min(23, e.value ?? 0)) })}
            size="sm"
            min={0}
            max={23}
          />
        </SettingRow>
        <SettingRow label="Visible Hours End" hint="Time grid views only">
          <NumericInput
            value={state.visibleHoursEnd}
            onChange={(e) => onChange({ visibleHoursEnd: Math.max(1, Math.min(24, e.value ?? 24)) })}
            size="sm"
            min={1}
            max={24}
          />
        </SettingRow>
        <SettingRow label="Min Entry Height (px)" hint="Time grid views only">
          <NumericInput
            value={state.minEntryHeight}
            onChange={(e) => onChange({ minEntryHeight: Math.max(10, e.value ?? 20) })}
            size="sm"
            min={10}
            max={100}
          />
        </SettingRow>
        <SettingRow label="Slot Height (px)" hint="Height of each time slot in pixels">
          <NumericInput
            value={state.slotHeight}
            onChange={(e) => onChange({ slotHeight: Math.max(20, Math.min(100, e.value ?? 48)) })}
            size="sm"
            min={20}
            max={100}
          />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Behavior">
        <SettingRow label="Editable">
          <InputSwitch checked={state.editable} onChange={(e) => onChange({ editable: e.value })} />
        </SettingRow>
        <SettingRow label="Selectable">
          <InputSwitch checked={state.selectable} onChange={(e) => onChange({ selectable: e.value })} />
        </SettingRow>
        <SettingRow label="Creatable" hint="Enable entry creation via drag (time grid) or double-click (month/day grid)">
          <InputSwitch checked={state.creatable} onChange={(e) => onChange({ creatable: e.value })} />
        </SettingRow>
        <SettingRow label="Now Indicator" hint="Time grid views only">
          <InputSwitch checked={state.nowIndicator} onChange={(e) => onChange({ nowIndicator: e.value })} />
        </SettingRow>
        <SettingRow label="Nav Links">
          <InputSwitch checked={state.navLinks} onChange={(e) => onChange({ navLinks: e.value })} />
        </SettingRow>
        <SettingRow label="Show Non-Current Dates" hint="Month grid view only">
          <InputSwitch checked={state.showNonCurrentDates} onChange={(e) => onChange({ showNonCurrentDates: e.value })} />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Appearance">
        <SettingRow label="Compact Mode">
          <InputSwitch checked={state.compact} onChange={(e) => onChange({ compact: e.value })} />
        </SettingRow>
        <SettingRow label="Row Banding" hint="Time grid views only">
          <InputSwitch checked={state.rowBanding} onChange={(e) => onChange({ rowBanding: e.value })} />
        </SettingRow>
        <SettingRow label="Week Numbers" hint="Month grid and Week time grid views">
          <InputSwitch checked={state.weekNumbers} onChange={(e) => onChange({ weekNumbers: e.value })} />
        </SettingRow>
        <SettingRow label="Date Backgrounds">
          <InputSwitch checked={state.showDateBackgrounds} onChange={(e) => onChange({ showDateBackgrounds: e.value })} />
        </SettingRow>
        <SettingRow label="Display Event Time" hint="Show time on entries in default renderer">
          <InputSwitch checked={state.displayEventTime} onChange={(e) => onChange({ displayEventTime: e.value })} />
        </SettingRow>
        <SettingRow label="All-Day Text" hint="Label for the all-day row in time grid">
          <TextInput
            value={state.allDayText}
            onChange={(e) => onChange({ allDayText: e.value as string })}
            size="sm"
            placeholder="all-day"
          />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Formatting">
        <SettingRow label="Day Header Format">
          <TextInput
            value={state.dayHeaderFormat}
            onChange={(e) => onChange({ dayHeaderFormat: e.value as string })}
            size="sm"
            placeholder="d"
          />
        </SettingRow>
        <SettingRow label="Weekday Header Format">
          <TextInput
            value={state.weekDayHeaderFormat}
            onChange={(e) => onChange({ weekDayHeaderFormat: e.value as string })}
            size="sm"
            placeholder="EEE"
          />
        </SettingRow>
        <SettingRow label="Slot Label Format" hint="Time grid views only. Uses date-fns format (e.g., 'HH:mm', 'h a')">
          <TextInput
            value={state.slotLabelFormat}
            onChange={(e) => onChange({ slotLabelFormat: e.value as string })}
            size="sm"
            placeholder="h a (auto)"
          />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Toolbar">
        <SettingRow label="Navigation Picker">
          <InputSwitch checked={state.showNavigationPicker} onChange={(e) => onChange({ showNavigationPicker: e.value })} />
        </SettingRow>
        <SettingRow label="Picker Icon Only" hint="Show only icon for navigation picker, keep title visible">
          <InputSwitch checked={state.navigationPickerIconOnly} onChange={(e) => onChange({ navigationPickerIconOnly: e.value })} />
        </SettingRow>
        <SettingRow label="Hide Toolbar">
          <InputSwitch checked={state.hideToolbar} onChange={(e) => onChange({ hideToolbar: e.value })} />
        </SettingRow>
        <SettingRow label="Hide Navigation">
          <InputSwitch checked={state.hideToolbarNavigation} onChange={(e) => onChange({ hideToolbarNavigation: e.value })} />
        </SettingRow>
        <SettingRow label="Hide Title">
          <InputSwitch checked={state.hideToolbarTitle} onChange={(e) => onChange({ hideToolbarTitle: e.value })} />
        </SettingRow>
        <SettingRow label="Hide View Switcher">
          <InputSwitch checked={state.hideToolbarViewSwitcher} onChange={(e) => onChange({ hideToolbarViewSwitcher: e.value })} />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Business Hours">
        <SettingRow label="Start Time">
          <TextInput
            value={state.businessStartTime}
            onChange={(e) => {
              const val = e.value as string;
              if (/^\d{2}:\d{2}$/.test(val)) onChange({ businessStartTime: val });
              else onChange({ businessStartTime: val });
            }}
            size="sm"
            placeholder="HH:MM"
          />
        </SettingRow>
        <SettingRow label="End Time">
          <TextInput
            value={state.businessEndTime}
            onChange={(e) => {
              const val = e.value as string;
              if (/^\d{2}:\d{2}$/.test(val)) onChange({ businessEndTime: val });
              else onChange({ businessEndTime: val });
            }}
            size="sm"
            placeholder="HH:MM"
          />
        </SettingRow>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">Business Days</label>
          <div className="flex flex-wrap gap-2">
            {dayOfWeekOptions.map(day => (
              <Checkbox
                key={day.value}
                label={day.label}
                checked={state.businessDays.includes(day.value)}
                onChange={() => {
                  const next = state.businessDays.includes(day.value)
                    ? state.businessDays.filter(d => d !== day.value)
                    : [...state.businessDays, day.value].sort();
                  onChange({ businessDays: next });
                }}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">Hidden Days</label>
          <div className="flex flex-wrap gap-2">
            {dayOfWeekOptions.map(day => (
              <Checkbox
                key={day.value}
                label={day.label}
                checked={state.hiddenDays.includes(day.value)}
                onChange={() => {
                  const next = state.hiddenDays.includes(day.value)
                    ? state.hiddenDays.filter(d => d !== day.value)
                    : [...state.hiddenDays, day.value].sort();
                  onChange({ hiddenDays: next });
                }}
              />
            ))}
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Entry Constraints">
        <SettingRow label="Min Duration (min)" hint="Minimum entry duration in minutes (0 = no limit)">
          <NumericInput
            value={state.eventMinDuration}
            onChange={(e) => onChange({ eventMinDuration: Math.max(0, e.value ?? 0) })}
            size="sm"
            min={0}
            max={1440}
          />
        </SettingRow>
        <SettingRow label="Max Duration (min)" hint="Maximum entry duration in minutes (0 = no limit)">
          <NumericInput
            value={state.eventMaxDuration}
            onChange={(e) => onChange({ eventMaxDuration: Math.max(0, e.value ?? 0) })}
            size="sm"
            min={0}
            max={1440}
          />
        </SettingRow>
        <SettingRow label="Default Duration (min)" hint="Default duration for click-to-create entries">
          <NumericInput
            value={state.eventDefaultDuration}
            onChange={(e) => onChange({ eventDefaultDuration: Math.max(5, e.value ?? 60) })}
            size="sm"
            min={5}
            max={1440}
          />
        </SettingRow>
        <SettingRow label="Duration Editable" hint="Allow resizing entries">
          <InputSwitch checked={state.eventDurationEditable} onChange={(e) => onChange({ eventDurationEditable: e.value })} />
        </SettingRow>
        <SettingRow label="Start Editable" hint="Allow moving entries">
          <InputSwitch checked={state.eventStartEditable} onChange={(e) => onChange({ eventStartEditable: e.value })} />
        </SettingRow>
        <SettingRow label="Event Overlap" hint="Allow entries to overlap when dragging/resizing">
          <InputSwitch checked={state.eventOverlap} onChange={(e) => onChange({ eventOverlap: e.value })} />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Selection">
        <SettingRow label="Min Distance (px)" hint="Min drag distance before selection starts">
          <NumericInput
            value={state.selectMinDistance}
            onChange={(e) => onChange({ selectMinDistance: Math.max(0, e.value ?? 0) })}
            size="sm"
            min={0}
            max={50}
          />
        </SettingRow>
        <SettingRow label="Select Overlap" hint="Allow selection over existing entries">
          <InputSwitch checked={state.selectOverlap} onChange={(e) => onChange({ selectOverlap: e.value })} />
        </SettingRow>
        <SettingRow label="Select Mirror" hint="Show mirror entry during drag-to-create">
          <InputSwitch checked={state.selectMirror} onChange={(e) => onChange({ selectMirror: e.value })} />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Layout">
        <SettingRow label="All-Day Max Height (px)" hint="Max height for all-day row (0 = unlimited)">
          <NumericInput
            value={state.allDaySlotMaxHeight}
            onChange={(e) => onChange({ allDaySlotMaxHeight: Math.max(0, e.value ?? 0) })}
            size="sm"
            min={0}
            max={300}
          />
        </SettingRow>
        <SettingRow label="Day Min Width (px)" hint="Min column width in time grid (0 = auto)">
          <NumericInput
            value={state.dayMinWidth}
            onChange={(e) => onChange({ dayMinWidth: Math.max(0, e.value ?? 0) })}
            size="sm"
            min={0}
            max={500}
          />
        </SettingRow>
        <SettingRow label="Fixed Week Count" hint="Always show 6 weeks in month grid">
          <InputSwitch checked={state.fixedWeekCount} onChange={(e) => onChange({ fixedWeekCount: e.value })} />
        </SettingRow>
        <SettingRow label="Expand Rows" hint="Expand month grid rows to fill space">
          <InputSwitch checked={state.expandRows} onChange={(e) => onChange({ expandRows: e.value })} />
        </SettingRow>
        <SettingRow label="Multi-Month Count" hint="Number of months in multi-month view">
          <NumericInput
            value={state.multiMonthCount}
            onChange={(e) => onChange({ multiMonthCount: Math.max(1, Math.min(12, e.value ?? 3)) })}
            size="sm"
            min={1}
            max={12}
          />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Navigation & Interaction">
        <SettingRow label="Scroll Time" hint="Initial scroll position for time grid (HH:MM)">
          <TextInput
            value={state.scrollTime}
            onChange={(e) => onChange({ scrollTime: e.value as string })}
            size="sm"
            placeholder="08:00"
          />
        </SettingRow>
        <SettingRow label="Long Press Delay (ms)" hint="Delay before touch becomes drag">
          <NumericInput
            value={state.longPressDelay}
            onChange={(e) => onChange({ longPressDelay: Math.max(0, e.value ?? 1000) })}
            size="sm"
            min={0}
            max={3000}
          />
        </SettingRow>
        <SettingRow label="More Link Click" hint="Behavior when +N more is clicked">
          <Dropdown
            value={state.moreLinkClick}
            options={moreLinkOptions}
            onChange={(e) => onChange({ moreLinkClick: e.value })}
            size="sm"
          />
        </SettingRow>
        <SettingRow label="Date Alignment (days)" hint="Navigation step in days (0 = view default)">
          <NumericInput
            value={state.dateAlignment}
            onChange={(e) => onChange({ dateAlignment: Math.max(0, e.value ?? 0) })}
            size="sm"
            min={0}
            max={365}
          />
        </SettingRow>
        <SettingRow label="Week Text" hint="Prefix for week numbers">
          <TextInput
            value={state.weekText}
            onChange={(e) => onChange({ weekText: e.value as string })}
            size="sm"
            placeholder="W"
          />
        </SettingRow>
        <SettingRow label="Now Indicator Interval (ms)" hint="Update frequency for now indicator">
          <NumericInput
            value={state.nowIndicatorInterval}
            onChange={(e) => onChange({ nowIndicatorInterval: Math.max(1000, e.value ?? 60000) })}
            size="sm"
            min={1000}
            max={300000}
          />
        </SettingRow>
        <SettingRow label="Day Popover Format" hint="Date format in overflow popover header">
          <TextInput
            value={state.dayPopoverFormat}
            onChange={(e) => onChange({ dayPopoverFormat: e.value as string })}
            size="sm"
            placeholder="EEEE, MMMM d"
          />
        </SettingRow>
      </SettingSection>
    </div>
  );
};

export default PlaygroundSettings;
