import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import cn from 'classnames';
import { ViewMode } from './calendar-types';
import type {
  CalendarProps, CalendarApi, CalendarConfig,
  DragState, SelectionState, CalendarContextValue,
} from './calendar-types';
import { defaultConfig } from './calendar-constants';
import { CalendarContext } from './CalendarContext';
import { PluginRegistry } from './plugin-registry';
import { useCalendarNavigation } from './hooks/useCalendarNavigation';
import { useCalendarEntries } from './hooks/useCalendarEntries';
import { CalendarToolbar } from './toolbar';
import { ViewRenderer } from './views';
import { defaultPlugins } from './plugins/default-plugins';
import './Calendar.scss';

const Calendar: React.FC<CalendarProps> = ({
  entries: rawEntries = [],
  initialView = ViewMode.timeGridWeek,
  initialDate,
  plugins = [],

  slotDuration,
  visibleHoursStart,
  visibleHoursEnd,
  businessHours,
  firstDayOfWeek,
  hiddenDays,
  timeFormat,
  dateFormat,
  rowBanding,
  minEntryHeight,
  editable,
  selectable,
  nowIndicator,
  navLinks,
  compact,
  snapDuration,
  entryOverlapMode,
  maxStackCount,
  weekNumbers,
  showNonCurrentDates,
  creatable,
  slotHeight,
  dragThreshold,
  titleFormat,
  dayHeaderFormat,
  weekDayHeaderFormat,
  monthHeaderFormat,
  dayHeaderLayout,
  slotLabelFormat,
  slotLabelInterval,
  eventMinDuration,
  eventMaxDuration,
  eventDefaultDuration,
  eventDurationEditable,
  eventStartEditable,
  eventOverlap,
  eventClassNames,
  eventConstraint,
  eventDataTransform,
  entryOrder,
  selectMinDistance,
  selectOverlap,
  selectAllow,
  selectMirror,
  eventAllow,
  scrollTime,
  longPressDelay,
  moreLinkClick,
  weekNumberClick,
  dayHeaderClick,
  dateAlignment,
  allDaySlotMaxHeight,
  dayMinWidth,
  dayMinHeight,
  weekText,
  fixedWeekCount,
  expandRows,
  multiMonthCount,
  nowIndicatorInterval,
  dayPopoverFormat,
  allDayText,
  displayEventTime,
  loading,
  stickyHeaderDates,
  hideEmptyDays,
  emptyMessage,
  emptyDayMessage,
  renderEmpty,
  showAllDayRow,
  headerToolbarViews,

  dateBackgrounds,
  dateRangeBackgrounds,
  loadingRanges,

  onViewChange,
  onDateRangeChange,
  onTitleChange,
  onEntryClick,
  onEntryContextMenu,
  onDateSelect,
  onEntryDrop,
  onEntryResize,
  onDateClick,
  onDateDoubleClick,
  onExternalDrop,
  onEntryCreate,
  onVisibleRangeChange,
  renderEntry,
  renderToolbar,
  renderDateHeader,
  renderDateCell,
  toolbarStart,
  toolbarEnd,
  hideToolbar,
  hideToolbarNavigation,
  hideToolbarTitle,
  hideToolbarViewSwitcher,
  showNavigationPicker,
  navigationPickerIconOnly,
  renderToolbarEnd,

  height = '100%',
  className,
  apiRef,
  ariaLabel = 'Calendar',
}) => {
  const calendarBodyRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState('');
  const announce = (msg: string) => {
    setAnnouncement('');
    window.setTimeout(() => setAnnouncement(msg), 30);
  };
  const config = useMemo<CalendarConfig>(() => ({
    ...defaultConfig,
    ...(slotDuration !== undefined && { slotDuration }),
    ...(visibleHoursStart !== undefined && { visibleHoursStart }),
    ...(visibleHoursEnd !== undefined && { visibleHoursEnd }),
    ...(businessHours !== undefined && { businessHours }),
    ...(firstDayOfWeek !== undefined && { firstDayOfWeek }),
    ...(hiddenDays !== undefined && { hiddenDays }),
    ...(timeFormat !== undefined && { timeFormat }),
    ...(dateFormat !== undefined && { dateFormat }),
    ...(rowBanding !== undefined && { rowBanding }),
    ...(minEntryHeight !== undefined && { minEntryHeight }),
    ...(editable !== undefined && { editable }),
    ...(selectable !== undefined && { selectable }),
    ...(nowIndicator !== undefined && { nowIndicator }),
    ...(navLinks !== undefined && { navLinks }),
    ...(compact !== undefined && { compact }),
    ...(snapDuration !== undefined && { snapDuration }),
    ...(entryOverlapMode !== undefined && { entryOverlapMode }),
    ...(maxStackCount !== undefined && { maxStackCount }),
    ...(weekNumbers !== undefined && { weekNumbers }),
    ...(showNonCurrentDates !== undefined && { showNonCurrentDates }),
    ...(creatable !== undefined && { creatable }),
    ...(slotHeight !== undefined && { slotHeight }),
    ...(dragThreshold !== undefined && { dragThreshold }),
    ...(titleFormat !== undefined && { titleFormat }),
    ...(dayHeaderFormat !== undefined && { dayHeaderFormat }),
    ...(weekDayHeaderFormat !== undefined && { weekDayHeaderFormat }),
    ...(monthHeaderFormat !== undefined && { monthHeaderFormat }),
    ...(dayHeaderLayout !== undefined && { dayHeaderLayout }),
    ...(slotLabelFormat !== undefined && { slotLabelFormat }),
    ...(slotLabelInterval !== undefined && { slotLabelInterval }),
    ...(eventMinDuration !== undefined && { eventMinDuration }),
    ...(eventMaxDuration !== undefined && { eventMaxDuration }),
    ...(eventDefaultDuration !== undefined && { eventDefaultDuration }),
    ...(eventDurationEditable !== undefined && { eventDurationEditable }),
    ...(eventStartEditable !== undefined && { eventStartEditable }),
    ...(eventOverlap !== undefined && { eventOverlap }),
    ...(eventClassNames !== undefined && { eventClassNames }),
    ...(eventConstraint !== undefined && { eventConstraint }),
    ...(eventDataTransform !== undefined && { eventDataTransform }),
    ...(entryOrder !== undefined && { entryOrder }),
    ...(selectMinDistance !== undefined && { selectMinDistance }),
    ...(selectOverlap !== undefined && { selectOverlap }),
    ...(selectAllow !== undefined && { selectAllow }),
    ...(selectMirror !== undefined && { selectMirror }),
    ...(eventAllow !== undefined && { eventAllow }),
    ...(scrollTime !== undefined && { scrollTime }),
    ...(longPressDelay !== undefined && { longPressDelay }),
    ...(moreLinkClick !== undefined && { moreLinkClick }),
    ...(weekNumberClick !== undefined && { weekNumberClick }),
    ...(dayHeaderClick !== undefined && { dayHeaderClick }),
    ...(dateAlignment !== undefined && { dateAlignment }),
    ...(allDaySlotMaxHeight !== undefined && { allDaySlotMaxHeight }),
    ...(dayMinWidth !== undefined && { dayMinWidth }),
    ...(dayMinHeight !== undefined && { dayMinHeight }),
    ...(weekText !== undefined && { weekText }),
    ...(fixedWeekCount !== undefined && { fixedWeekCount }),
    ...(expandRows !== undefined && { expandRows }),
    ...(multiMonthCount !== undefined && { multiMonthCount }),
    ...(nowIndicatorInterval !== undefined && { nowIndicatorInterval }),
    ...(dayPopoverFormat !== undefined && { dayPopoverFormat }),
    ...(allDayText !== undefined && { allDayText }),
    ...(displayEventTime !== undefined && { displayEventTime }),
    ...(loading !== undefined && { loading }),
    ...(stickyHeaderDates !== undefined && { stickyHeaderDates }),
    ...(hideEmptyDays !== undefined && { hideEmptyDays }),
    ...(emptyMessage !== undefined && { emptyMessage }),
    ...(emptyDayMessage !== undefined && { emptyDayMessage }),
    ...(renderEmpty !== undefined && { renderEmpty }),
    ...(showAllDayRow !== undefined && { showAllDayRow }),
  }), [
    slotDuration, visibleHoursStart, visibleHoursEnd, businessHours,
    firstDayOfWeek, hiddenDays, timeFormat, dateFormat, rowBanding,
    minEntryHeight, editable, selectable, nowIndicator, navLinks,
    compact, snapDuration, entryOverlapMode, maxStackCount,
    weekNumbers, showNonCurrentDates, creatable, slotHeight, dragThreshold,
    titleFormat, dayHeaderFormat, weekDayHeaderFormat, monthHeaderFormat,
    dayHeaderLayout, slotLabelFormat, slotLabelInterval,
    eventMinDuration, eventMaxDuration, eventDefaultDuration,
    eventDurationEditable, eventStartEditable, eventOverlap,
    eventClassNames, eventConstraint, eventDataTransform,
    entryOrder, selectMinDistance, selectOverlap,
    selectAllow, selectMirror, eventAllow, scrollTime, longPressDelay,
    moreLinkClick, weekNumberClick, dayHeaderClick, dateAlignment,
    allDaySlotMaxHeight, dayMinWidth, dayMinHeight, weekText, fixedWeekCount,
    expandRows, multiMonthCount, nowIndicatorInterval, dayPopoverFormat,
    allDayText, displayEventTime, loading, stickyHeaderDates,
    hideEmptyDays, emptyMessage, emptyDayMessage, renderEmpty, showAllDayRow,
  ]);

  const [registry] = useState(() => {
    const reg = new PluginRegistry();
    const allPlugins = plugins.length > 0 ? plugins : defaultPlugins;
    for (const plugin of allPlugins) {
      reg.register(plugin);
    }
    return reg;
  });

  const viewDefinitions = useMemo(() => registry.getAllViews(), [registry]);

  const [viewVisibleRange, setViewVisibleRange] = useState<{ start: Date; end: Date } | null>(null);

  const handleNavDateRangeChange = useCallback((range: { start: Date; end: Date }) => {
    setViewVisibleRange(null);
    onDateRangeChange?.(range);
  }, [onDateRangeChange]);

  const nav = useCalendarNavigation({
    initialDate: initialDate ? (typeof initialDate === 'string' ? new Date(initialDate) : initialDate) : undefined,
    initialView,
    viewDefinitions,
    firstDayOfWeek: config.firstDayOfWeek,
    dateAlignment: config.dateAlignment,
    onViewChange,
    onDateRangeChange: handleNavDateRangeChange,
  });

  const effectiveDateRange = useMemo(() => {
    if (!viewVisibleRange) return nav.dateRange;
    return {
      start: viewVisibleRange.start < nav.dateRange.start ? viewVisibleRange.start : nav.dateRange.start,
      end: viewVisibleRange.end > nav.dateRange.end ? viewVisibleRange.end : nav.dateRange.end,
    };
  }, [nav.dateRange, viewVisibleRange]);

  const handleViewVisibleRangeChange = useCallback((range: { start: Date; end: Date }) => {
    setViewVisibleRange(range);
    onVisibleRangeChange?.(range);
  }, [onVisibleRangeChange]);

  const entries = useCalendarEntries({
    entries: rawEntries,
    dateRange: effectiveDateRange,
    eventDataTransform: config.eventDataTransform,
  });

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [selectionState, setSelectionState] = useState<SelectionState | null>(null);

  const navRef = useRef(nav);
  navRef.current = nav;
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  const api = useMemo<CalendarApi>(() => ({
    changeView: (mode) => navRef.current.setViewMode(mode),
    prev: () => navRef.current.prev(),
    next: () => navRef.current.next(),
    today: () => navRef.current.today(),
    gotoDate: (date) => navRef.current.gotoDate(date),
    getView: () => ({
      mode: navRef.current.viewMode,
      dateRange: navRef.current.dateRange,
      title: navRef.current.title,
    }),
    getEntries: () => entriesRef.current,
    scrollToTime: (time) => {
      const body = calendarBodyRef.current;
      if (!body) return;
      const scrollEl = body.querySelector<HTMLElement>('[data-time-grid-scroll]') ?? body.querySelector<HTMLElement>('.eui-cal-time-grid-scroll');
      if (!scrollEl) return;
      const totalSlots = body.querySelectorAll<HTMLElement>('[data-slot-index]');
      let parsed: { hours: number; minutes: number } | null = null;
      if (typeof time === 'string') {
        const match = time.match(/^(\d{1,2}):(\d{2})/);
        if (match) parsed = { hours: parseInt(match[1], 10), minutes: parseInt(match[2], 10) };
      } else if (typeof time === 'number') {
        parsed = { hours: Math.floor(time / 60), minutes: time % 60 };
      }
      if (!parsed) return;
      const slotHeight = parseFloat(getComputedStyle(body).getPropertyValue('--eui-cal-slot-height')) || 36;
      const slotsPerHour = totalSlots.length > 0 ? Math.max(1, totalSlots.length / 24) : 2;
      const offset = (parsed.hours + parsed.minutes / 60) * slotsPerHour * slotHeight;
      const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      scrollEl.scrollTo({ top: offset, behavior: reduce ? 'auto' : 'smooth' });
    },
  }), []);

  useEffect(() => {
    if (apiRef && 'current' in apiRef) {
      (apiRef as React.MutableRefObject<CalendarApi | null>).current = api;
    }
  }, [api, apiRef]);

  useEffect(() => {
    registry.initPlugins(api);
    return () => {
      registry.destroyPlugins();
    };
  }, []);

  const currentViewDef = viewDefinitions.get(nav.viewMode);
  const pluginActions = useMemo(() => registry.getToolbarActions(), [registry]);
  const viewList = useMemo(() => {
    const all = registry.getViewList();
    if (!headerToolbarViews || headerToolbarViews.length === 0) return all;
    return all.filter(v => headerToolbarViews.includes(v.name));
  }, [registry, headerToolbarViews]);

  const contextValue = useMemo<CalendarContextValue>(() => ({
    currentDate: nav.currentDate,
    viewMode: nav.viewMode,
    dateRange: effectiveDateRange,
    config,
    entries,
    viewDefinitions,
    dragState,
    selectionState,
    api,
    setDragState,
    setSelectionState,
  }), [nav.currentDate, nav.viewMode, effectiveDateRange, config, entries, viewDefinitions, dragState, selectionState, api]);

  const containerStyle = useMemo<React.CSSProperties>(() => {
    const s: Record<string, string> = {
      height: typeof height === 'number' ? `${height}px` : height,
    };
    if (config.slotHeight !== 24) {
      s['--eui-cal-slot-height'] = `${config.slotHeight}px`;
    }
    return s as React.CSSProperties;
  }, [height, config.slotHeight]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        nav.prev();
        announce(`Navigated to previous: ${nav.title}`);
        break;
      case 'ArrowRight':
        e.preventDefault();
        nav.next();
        announce(`Navigated to next: ${nav.title}`);
        break;
    }
  };

  useEffect(() => {
    announce(nav.title);
    onTitleChange?.(nav.title);
  }, [nav.title]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    announce(`View changed to ${nav.viewMode}`);
  }, [nav.viewMode]);

  return (
    <CalendarContext.Provider value={contextValue}>
      <div
        className={cn('eui-calendar', {
          'eui-calendar-compact': config.compact,
        }, className)}
        style={containerStyle}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {!hideToolbar && (
          renderToolbar ? (
            renderToolbar(
              { currentDate: nav.currentDate, viewMode: nav.viewMode, title: nav.title, dateRange: nav.dateRange },
              api
            )
          ) : (
            <CalendarToolbar
              title={nav.title}
              currentDate={nav.currentDate}
              currentView={nav.viewMode}
              views={viewList}
              pluginActions={pluginActions}
              api={api}
              firstDayOfWeek={config.firstDayOfWeek}
              onPrev={nav.prev}
              onNext={nav.next}
              onToday={nav.today}
              onViewChange={nav.setViewMode}
              onDateSelect={nav.gotoDate}
              hideNavigation={hideToolbarNavigation}
              hideTitle={hideToolbarTitle}
              hideViewSwitcher={hideToolbarViewSwitcher}
              showNavigationPicker={showNavigationPicker}
              navigationPickerIconOnly={navigationPickerIconOnly}
              compact={config.compact}
              startSlot={toolbarStart}
              endSlot={toolbarEnd}
              renderToolbarEnd={renderToolbarEnd}
            />
          )
        )}
        <div className="eui-calendar-body" ref={calendarBodyRef}>
          <ViewRenderer
            viewDefinition={currentViewDef}
            currentDate={nav.currentDate}
            entries={entries}
            dateRange={effectiveDateRange}
            config={config}
            onEntryClick={onEntryClick}
            onEntryContextMenu={onEntryContextMenu}
            onDateSelect={onDateSelect}
            onEntryDrop={onEntryDrop}
            onEntryResize={onEntryResize}
            onDateClick={(date, event) => {
              if (config.navLinks) {
                nav.gotoDate(date);
                nav.setViewMode(ViewMode.timeGridDay);
              }
              onDateClick?.(date, event);
            }}
            onDateDoubleClick={onDateDoubleClick}
            onExternalDrop={onExternalDrop}
            onEntryCreate={onEntryCreate}
            onVisibleRangeChange={handleViewVisibleRangeChange}
            renderEntry={renderEntry}
            renderDateHeader={renderDateHeader}
            renderDateCell={renderDateCell}
            dateBackgrounds={dateBackgrounds}
            dateRangeBackgrounds={dateRangeBackgrounds}
            loadingRanges={loadingRanges}
          />
        </div>
        <div className="eui-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>
      </div>
    </CalendarContext.Provider>
  );
};

export default Calendar;
