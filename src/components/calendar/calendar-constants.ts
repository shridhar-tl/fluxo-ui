import type { CalendarConfig } from './calendar-types';

export const defaultConfig: CalendarConfig = {
  slotDuration: 30,
  visibleHoursStart: 0,
  visibleHoursEnd: 24,
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '17:00',
  },
  firstDayOfWeek: 0,
  hiddenDays: [],
  timeFormat: '12h',
  dateFormat: 'MMM d, yyyy',
  rowBanding: false,
  minEntryHeight: 20,
  editable: false,
  selectable: true,
  nowIndicator: true,
  navLinks: true,
  compact: false,
  snapDuration: 15,
  entryOverlapMode: 'stack',
  maxStackCount: 3,
  weekNumbers: false,
  showNonCurrentDates: true,
  creatable: false,
  slotHeight: 36,
  dragThreshold: 5,
  titleFormat: '',
  dayHeaderFormat: 'd',
  weekDayHeaderFormat: 'EEE',
  monthHeaderFormat: 'MMMM yyyy',
  slotLabelFormat: '',
  slotLabelInterval: 0,
  eventMinDuration: 0,
  eventMaxDuration: 0,
  eventDefaultDuration: 60,
  eventDurationEditable: true,
  eventStartEditable: true,
  eventOverlap: true,
  eventClassNames: undefined,
  eventConstraint: undefined,
  eventDataTransform: undefined,
  entryOrder: undefined,
  selectMinDistance: 0,
  selectOverlap: true,
  selectAllow: undefined,
  selectMirror: false,
  eventAllow: undefined,
  scrollTime: '08:00',
  longPressDelay: 1000,
  moreLinkClick: 'popover',
  weekNumberClick: undefined,
  dayHeaderClick: undefined,
  dateAlignment: 0,
  allDaySlotMaxHeight: 0,
  dayMinWidth: 0,
  dayMinHeight: 0,
  weekText: '',
  fixedWeekCount: true,
  expandRows: false,
  multiMonthCount: 3,
  nowIndicatorInterval: 60000,
  dayPopoverFormat: 'EEEE, MMMM d',
  allDayText: 'all-day',
  displayEventTime: true,
  loading: false,
  stickyHeaderDates: true,
};

export const slotHeight = 36;

export const allDayRowHeight = 28;

export const timeGutterWidth = 60;

export const headerHeight = 40;

export const minSlotDuration = 5;

export const maxSlotDuration = 60;
