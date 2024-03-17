import React, { useCallback, useMemo } from 'react';
import cn from 'classnames';
import { ViewMode } from '../calendar-types';
import type { CalendarViewMode, CalendarViewDefinition, CalendarPluginToolbarAction, CalendarApi, ToolbarEndRenderProps } from '../calendar-types';
import type { SelectionMode } from '../../date-range/types';
import DateRangePicker from '../../date-range/DateRangePicker';
import ToolbarNavigation from './ToolbarNavigation';
import ToolbarTitle from './ToolbarTitle';
import ToolbarViewSwitcher from './ToolbarViewSwitcher';

function getSelectionModeForView(view: CalendarViewMode): SelectionMode {
  if (view === ViewMode.dayGridMonth || view === ViewMode.listMonth) return 'month';
  if (view === ViewMode.timeGridWeek || view === ViewMode.dayGridWeek || view === ViewMode.listWeek) return 'week';
  return 'day';
}

interface CalendarToolbarProps {
  title: string;
  currentDate: Date;
  currentView: CalendarViewMode;
  views: CalendarViewDefinition[];
  pluginActions: CalendarPluginToolbarAction[];
  api: CalendarApi;
  firstDayOfWeek: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarViewMode) => void;
  onDateSelect: (date: Date) => void;
  hideNavigation?: boolean;
  hideTitle?: boolean;
  hideViewSwitcher?: boolean;
  showNavigationPicker?: boolean;
  navigationPickerIconOnly?: boolean;
  compact?: boolean;
  startSlot?: React.ReactNode;
  endSlot?: React.ReactNode;
  renderToolbarEnd?: (components: ToolbarEndRenderProps) => React.ReactNode;
}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  title, currentDate, currentView, views, pluginActions, api,
  firstDayOfWeek, onPrev, onNext, onToday, onViewChange, onDateSelect,
  hideNavigation, hideTitle, hideViewSwitcher, showNavigationPicker,
  navigationPickerIconOnly, compact, startSlot, endSlot, renderToolbarEnd,
}) => {
  const startActions = pluginActions.filter(a => a.position === 'start');
  const endActions = pluginActions.filter(a => a.position !== 'start');

  const selectionMode = useMemo(() => getSelectionModeForView(currentView), [currentView]);
  const isPickerRange = false;

  const handlePickerChange = useCallback((selection: { value: [Date, Date] }) => {
    onDateSelect(selection.value[0]);
  }, [onDateSelect]);

  const pickerValue: [Date, Date] = useMemo(() => [currentDate, currentDate], [currentDate]);

  const showPickerAsHeader = showNavigationPicker && !navigationPickerIconOnly;
  const showPickerAsIcon = showNavigationPicker && navigationPickerIconOnly;

  const viewSwitcherNode = !hideViewSwitcher ? (
    <ToolbarViewSwitcher
      currentView={currentView}
      views={views}
      onViewChange={onViewChange}
    />
  ) : null;

  const endPluginActionsNode = endActions.length > 0 ? (
    <>
      {endActions.map(action => (
        <button
          key={action.id}
          className="eui-cal-toolbar-btn"
          onClick={() => action.onClick(api)}
          type="button"
          aria-label={action.label}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </>
  ) : null;

  return (
    <div className={cn('eui-cal-toolbar', { 'eui-cal-toolbar-compact': compact })}>
      <div className="eui-cal-toolbar-start">
        {!hideNavigation && (
          <ToolbarNavigation onPrev={onPrev} onNext={onNext} onToday={onToday} />
        )}
        {showPickerAsHeader && (
          <div className="eui-cal-toolbar-picker eui-cal-toolbar-picker-header">
            <DateRangePicker
              value={pickerValue}
              onChange={handlePickerChange}
              selectionMode={selectionMode}
              firstDayOfWeek={firstDayOfWeek}
              range={isPickerRange}
              dateFormat="MMM dd, yyyy"
            />
          </div>
        )}
        {showPickerAsIcon && (
          <div className="eui-cal-toolbar-picker">
            <DateRangePicker
              value={pickerValue}
              onChange={handlePickerChange}
              selectionMode={selectionMode}
              firstDayOfWeek={firstDayOfWeek}
              range={isPickerRange}
              dateFormat="MMM dd, yyyy"
              iconOnly
            />
          </div>
        )}
        {!hideTitle && !showPickerAsHeader && <ToolbarTitle title={title} />}
        {startSlot}
        {startActions.map(action => (
          <button
            key={action.id}
            className="eui-cal-toolbar-btn"
            onClick={() => action.onClick(api)}
            type="button"
            aria-label={action.label}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
      <div className="eui-cal-toolbar-end">
        {renderToolbarEnd ? (
          renderToolbarEnd({
            viewSwitcher: viewSwitcherNode,
            pluginActions: endPluginActionsNode,
          })
        ) : (
          <>
            {endPluginActionsNode}
            {endSlot}
            {viewSwitcherNode}
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(CalendarToolbar);
