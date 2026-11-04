import React, { useMemo } from 'react';
import type { ResolvedCalendarEntry, EntryRenderContext, PositionedEntry, EntryRenderer } from '../calendar-types';
import { getDragRange } from '../calendar-utils';
import { useCalendarContext } from '../CalendarContext';
import DefaultEntry from './DefaultEntry';
import EntryContainer from './EntryContainer';

interface CalendarEntryProps {
  entry: ResolvedCalendarEntry;
  context: EntryRenderContext;
  position?: PositionedEntry;
  isAllDay?: boolean;
  style?: React.CSSProperties;
  className?: string;
  renderEntry?: EntryRenderer;
  onClick?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onContextMenu?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onMouseEnter?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onMouseLeave?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onPointerDown?: (entry: ResolvedCalendarEntry, event: React.PointerEvent) => void;
  onResizePointerDown?: (entry: ResolvedCalendarEntry, edge: 'top' | 'bottom', event: React.PointerEvent) => void;
  showResizeHandles?: boolean;
}

const CalendarEntryComponent: React.FC<CalendarEntryProps> = ({
  entry, context, position, isAllDay, style, className,
  renderEntry, onClick, onContextMenu, onMouseEnter, onMouseLeave,
  onPointerDown, onResizePointerDown, showResizeHandles,
}) => {
  const { dragState } = useCalendarContext();
  const activeDrag = dragState?.entryId === entry.id ? dragState : null;

  const displayEntry = useMemo<ResolvedCalendarEntry>(
    () => (activeDrag ? { ...entry, ...getDragRange(activeDrag) } : entry),
    [entry, activeDrag]
  );

  const content = renderEntry
    ? renderEntry(displayEntry, context)
    : <DefaultEntry entry={displayEntry} context={context} />;

  return (
    <EntryContainer
      entry={entry}
      position={position}
      isAllDay={isAllDay}
      style={style}
      className={className}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPointerDown={onPointerDown}
      onResizePointerDown={onResizePointerDown}
      showResizeHandles={showResizeHandles}
    >
      {content}
    </EntryContainer>
  );
};

export default React.memo(CalendarEntryComponent);
