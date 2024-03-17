import type { ReactNode, ComponentType, SyntheticEvent, MouseEvent } from 'react';

export type EventClassNamesFn = (entry: ResolvedCalendarEntry) => string | string[];
export type EntryOrderFn = (a: ResolvedCalendarEntry, b: ResolvedCalendarEntry) => number;
export type SelectAllowFn = (info: { start: Date; end: Date; allDay: boolean }) => boolean;
export type EventAllowFn = (info: { start: Date; end: Date; entry: ResolvedCalendarEntry }) => boolean;
export type EventConstraintFn = (info: { start: Date; end: Date; entry: ResolvedCalendarEntry }) => boolean;
export type EventDataTransformFn = (entry: CalendarEntry) => CalendarEntry;
export type MoreLinkClickHandler = 'popover' | 'day' | ((info: { date: Date; entries: ResolvedCalendarEntry[] }) => void);
export type WeekNumberClickHandler = (weekNumber: number, date: Date, event: MouseEvent) => void;
export type DayHeaderClickHandler = (date: Date, event: MouseEvent) => void;

export const ViewMode = {
  dayGridMonth: 'dayGridMonth',
  timeGridWeek: 'timeGridWeek',
  timeGridDay: 'timeGridDay',
  dayGridWeek: 'dayGridWeek',
  dayGridDay: 'dayGridDay',
  listMonth: 'listMonth',
  listWeek: 'listWeek',
  listDay: 'listDay',
  multiMonth: 'multiMonth',
  scrollMonth: 'scrollMonth',
  yearGrid: 'yearGrid',
  agenda: 'agenda',
  timeGrid3Day: 'timeGrid3Day',
  timeGrid4Day: 'timeGrid4Day',
} as const;

export type CalendarViewMode =
  | typeof ViewMode[keyof typeof ViewMode]
  | string;

export type TimeFormat = '12h' | '24h';
export type EntryId = string | number;
export type EntryType = string | number;

export interface CalendarEntry {
  id: EntryId;
  start: Date | string;
  end: Date | string;
  title: string;
  allDay?: boolean;
  color?: string;
  textColor?: string;
  borderColor?: string;
  className?: string;
  editable?: boolean;
  resizable?: boolean;
  entryType?: EntryType;
  data?: Record<string, unknown>;
}

export interface ResolvedCalendarEntry extends Omit<CalendarEntry, 'start' | 'end'> {
  start: Date;
  end: Date;
  originalEntry: CalendarEntry;
}

export interface DateBackground {
  date: Date | string;
  color: string;
}

export interface DateRangeBackground {
  start: Date | string;
  end: Date | string;
  color: string;
}

export interface ExternalDropInfo {
  date: Date;
  allDay: boolean;
  data: DataTransfer | null;
  modifiers: ModifierKeys;
}

export interface DateLoadingRange {
  start: Date | string;
  end: Date | string;
}

export interface BusinessHours {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface EntryRenderContext {
  view: CalendarViewMode;
  isCompact: boolean;
  width: number;
  height: number;
  isStart: boolean;
  isEnd: boolean;
  isContinuation: boolean;
}

export interface DragInfo {
  entry: ResolvedCalendarEntry;
  newStart: Date;
  newEnd: Date;
  modifiers: ModifierKeys;
}

export interface ResizeInfo {
  entry: ResolvedCalendarEntry;
  newStart: Date;
  newEnd: Date;
  edge: 'top' | 'bottom';
  modifiers: ModifierKeys;
}

export interface ModifierKeys {
  alt: boolean;
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
}

export interface SelectionInfo {
  start: Date;
  end: Date;
  allDay: boolean;
  modifiers: ModifierKeys;
}

export interface EntryCreateInfo {
  start: Date;
  end: Date;
  allDay: boolean;
  view: CalendarViewMode;
}

export interface ToolbarSlotProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  title: string;
  dateRange: DateRange;
}

export interface ToolbarEndRenderProps {
  viewSwitcher: ReactNode;
  pluginActions: ReactNode;
}

export interface CalendarApi {
  changeView: (mode: CalendarViewMode) => void;
  prev: () => void;
  next: () => void;
  today: () => void;
  getView: () => { mode: CalendarViewMode; dateRange: DateRange; title: string };
  gotoDate: (date: Date) => void;
  getEntries: () => ResolvedCalendarEntry[];
  scrollToTime: (time: string) => void;
}

export interface ViewProps {
  currentDate: Date;
  entries: ResolvedCalendarEntry[];
  dateRange: DateRange;
  config: CalendarConfig;
  onEntryClick?: (entry: ResolvedCalendarEntry, event: MouseEvent) => void;
  onEntryContextMenu?: (entry: ResolvedCalendarEntry, event: MouseEvent) => void;
  onDateSelect?: (info: SelectionInfo, event: SyntheticEvent) => void;
  onEntryDrop?: (info: DragInfo, event: SyntheticEvent) => void;
  onEntryResize?: (info: ResizeInfo, event: SyntheticEvent) => void;
  onDateClick?: (date: Date, event: MouseEvent) => void;
  onDateDoubleClick?: (date: Date, event: MouseEvent) => void;
  onExternalDrop?: (info: ExternalDropInfo, event: SyntheticEvent) => void;
  onEntryCreate?: (info: EntryCreateInfo) => void;
  renderEntry?: EntryRenderer;
  renderDateHeader?: (date: Date, view: CalendarViewMode) => ReactNode;
  renderDateCell?: (date: Date, view: CalendarViewMode) => ReactNode;
  dateBackgrounds?: DateBackground[];
  dateRangeBackgrounds?: DateRangeBackground[];
  loadingRanges?: DateLoadingRange[];
}

export type EntryRenderer = (
  entry: ResolvedCalendarEntry,
  context: EntryRenderContext
) => ReactNode;

export interface CalendarViewDefinition {
  name: string;
  label: string;
  component: ComponentType<ViewProps>;
  getDateRange: (date: Date, firstDayOfWeek: number) => DateRange;
  getTitle: (dateRange: DateRange) => string;
  navigate: (date: Date, direction: 'prev' | 'next') => Date;
}

export interface CalendarPluginToolbarAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: (api: CalendarApi) => void;
  position?: 'start' | 'end';
}

export interface CalendarPlugin {
  name: string;
  views?: CalendarViewDefinition[];
  entryRenderers?: Record<string, EntryRenderer>;
  toolbarActions?: CalendarPluginToolbarAction[];
  onInit?: (api: CalendarApi) => void;
  onDestroy?: () => void;
}

export interface CalendarConfig {
  slotDuration: number;
  visibleHoursStart: number;
  visibleHoursEnd: number;
  businessHours: BusinessHours;
  firstDayOfWeek: number;
  hiddenDays: number[];
  timeFormat: TimeFormat;
  dateFormat: string;
  rowBanding: boolean;
  minEntryHeight: number;
  editable: boolean;
  selectable: boolean;
  nowIndicator: boolean;
  navLinks: boolean;
  compact: boolean;
  snapDuration: number;
  entryOverlapMode: 'stack' | 'lane';
  maxStackCount: number;
  weekNumbers: boolean;
  showNonCurrentDates: boolean;
  creatable: boolean;
  slotHeight: number;
  dragThreshold: number;
  titleFormat: string;
  dayHeaderFormat: string;
  weekDayHeaderFormat: string;
  monthHeaderFormat: string;
  slotLabelFormat: string;
  slotLabelInterval: number;
  eventMinDuration: number;
  eventMaxDuration: number;
  eventDefaultDuration: number;
  eventDurationEditable: boolean;
  eventStartEditable: boolean;
  eventOverlap: boolean;
  eventClassNames?: EventClassNamesFn;
  eventConstraint?: EventConstraintFn;
  eventDataTransform?: EventDataTransformFn;
  entryOrder?: EntryOrderFn;
  selectMinDistance: number;
  selectOverlap: boolean;
  selectAllow?: SelectAllowFn;
  selectMirror: boolean;
  eventAllow?: EventAllowFn;
  scrollTime: string;
  longPressDelay: number;
  moreLinkClick: MoreLinkClickHandler;
  weekNumberClick?: WeekNumberClickHandler;
  dayHeaderClick?: DayHeaderClickHandler;
  dateAlignment: number;
  allDaySlotMaxHeight: number;
  dayMinWidth: number;
  dayMinHeight: number;
  weekText: string;
  fixedWeekCount: boolean;
  expandRows: boolean;
  multiMonthCount: number;
  nowIndicatorInterval: number;
  dayPopoverFormat: string;
  allDayText: string;
  displayEventTime: boolean;
  loading: boolean;
  stickyHeaderDates: boolean;
}

export interface CalendarProps {
  entries?: CalendarEntry[];
  initialView?: CalendarViewMode;
  initialDate?: Date | string;
  plugins?: CalendarPlugin[];

  slotDuration?: number;
  visibleHoursStart?: number;
  visibleHoursEnd?: number;
  businessHours?: BusinessHours;
  firstDayOfWeek?: number;
  hiddenDays?: number[];
  timeFormat?: TimeFormat;
  dateFormat?: string;
  rowBanding?: boolean;
  minEntryHeight?: number;
  editable?: boolean;
  selectable?: boolean;
  nowIndicator?: boolean;
  navLinks?: boolean;
  compact?: boolean;
  snapDuration?: number;
  entryOverlapMode?: 'stack' | 'lane';
  maxStackCount?: number;
  weekNumbers?: boolean;
  showNonCurrentDates?: boolean;
  creatable?: boolean;
  slotHeight?: number;
  dragThreshold?: number;
  titleFormat?: string;
  dayHeaderFormat?: string;
  weekDayHeaderFormat?: string;
  monthHeaderFormat?: string;
  slotLabelFormat?: string;
  slotLabelInterval?: number;
  eventMinDuration?: number;
  eventMaxDuration?: number;
  eventDefaultDuration?: number;
  eventDurationEditable?: boolean;
  eventStartEditable?: boolean;
  eventOverlap?: boolean;
  eventClassNames?: EventClassNamesFn;
  eventConstraint?: EventConstraintFn;
  eventDataTransform?: EventDataTransformFn;
  entryOrder?: EntryOrderFn;
  selectMinDistance?: number;
  selectOverlap?: boolean;
  selectAllow?: SelectAllowFn;
  selectMirror?: boolean;
  eventAllow?: EventAllowFn;
  scrollTime?: string;
  longPressDelay?: number;
  moreLinkClick?: MoreLinkClickHandler;
  weekNumberClick?: WeekNumberClickHandler;
  dayHeaderClick?: DayHeaderClickHandler;
  dateAlignment?: number;
  allDaySlotMaxHeight?: number;
  dayMinWidth?: number;
  dayMinHeight?: number;
  weekText?: string;
  fixedWeekCount?: boolean;
  expandRows?: boolean;
  multiMonthCount?: number;
  nowIndicatorInterval?: number;
  dayPopoverFormat?: string;
  allDayText?: string;
  displayEventTime?: boolean;
  loading?: boolean;
  stickyHeaderDates?: boolean;
  headerToolbarViews?: string[];

  dateBackgrounds?: DateBackground[];
  dateRangeBackgrounds?: DateRangeBackground[];
  loadingRanges?: DateLoadingRange[];

  onViewChange?: (view: CalendarViewMode) => void;
  onDateRangeChange?: (range: DateRange) => void;
  onEntryClick?: (entry: ResolvedCalendarEntry, event: MouseEvent) => void;
  onEntryContextMenu?: (entry: ResolvedCalendarEntry, event: MouseEvent) => void;
  onDateSelect?: (info: SelectionInfo, event: SyntheticEvent) => void;
  onEntryDrop?: (info: DragInfo, event: SyntheticEvent) => void;
  onEntryResize?: (info: ResizeInfo, event: SyntheticEvent) => void;
  onDateClick?: (date: Date, event: MouseEvent) => void;
  onDateDoubleClick?: (date: Date, event: MouseEvent) => void;
  onExternalDrop?: (info: ExternalDropInfo, event: SyntheticEvent) => void;
  onEntryCreate?: (info: EntryCreateInfo) => void;
  onEntryMouseEnter?: (entry: ResolvedCalendarEntry, event: MouseEvent) => void;
  onEntryMouseLeave?: (entry: ResolvedCalendarEntry, event: MouseEvent) => void;

  renderEntry?: EntryRenderer;
  renderToolbar?: (defaults: ToolbarSlotProps, api: CalendarApi) => ReactNode;
  renderDateHeader?: (date: Date, view: CalendarViewMode) => ReactNode;
  renderDateCell?: (date: Date, view: CalendarViewMode) => ReactNode;
  toolbarStart?: ReactNode;
  toolbarEnd?: ReactNode;
  hideToolbar?: boolean;
  hideToolbarNavigation?: boolean;
  hideToolbarTitle?: boolean;
  hideToolbarViewSwitcher?: boolean;
  showNavigationPicker?: boolean;
  navigationPickerIconOnly?: boolean;
  renderToolbarEnd?: (components: ToolbarEndRenderProps) => ReactNode;

  height?: string | number;
  className?: string;
  apiRef?: React.RefObject<CalendarApi | null>;
}

export interface PositionedEntry {
  entry: ResolvedCalendarEntry;
  top: number;
  height: number;
  left: number;
  width: number;
  column: number;
  totalColumns: number;
}

export interface DragState {
  entryId: EntryId;
  type: 'move' | 'resize';
  edge?: 'top' | 'bottom';
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  offsetMinutes: number;
  dayOffset: number;
  originalStart: Date;
  originalEnd: Date;
  modifiers?: ModifierKeys;
}

export interface SelectionState {
  startDate: Date;
  endDate: Date;
  startSlot: number;
  endSlot: number;
  isSelecting: boolean;
  allDay: boolean;
}

export interface CalendarContextValue {
  currentDate: Date;
  viewMode: CalendarViewMode;
  dateRange: DateRange;
  config: CalendarConfig;
  entries: ResolvedCalendarEntry[];
  viewDefinitions: Map<string, CalendarViewDefinition>;
  dragState: DragState | null;
  selectionState: SelectionState | null;
  api: CalendarApi;
  setDragState: (state: DragState | null) => void;
  setSelectionState: (state: SelectionState | null) => void;
}
