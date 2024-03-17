import React from 'react';
import type { ResolvedCalendarEntry, EntryRenderContext, PositionedEntry, EntryRenderer } from '../calendar-types';
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
  const content = renderEntry
    ? renderEntry(entry, context)
    : <DefaultEntry entry={entry} context={context} />;

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
