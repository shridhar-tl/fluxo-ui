import React, { useCallback } from 'react';
import { ViewMode } from '../../calendar-types';
import type { ResolvedCalendarEntry, EntryRenderer } from '../../calendar-types';
import { formatTime } from '../../calendar-utils';
import { useCalendarContext } from '../../CalendarContext';

interface ListViewItemProps {
  entry: ResolvedCalendarEntry;
  renderEntry?: EntryRenderer;
  onClick?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onContextMenu?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
}

const ListViewItem: React.FC<ListViewItemProps> = ({
  entry, renderEntry, onClick, onContextMenu,
}) => {
  const { config } = useCalendarContext();

  const handleClick = useCallback((e: React.MouseEvent) => {
    onClick?.(entry, e);
  }, [entry, onClick]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(entry, e);
  }, [entry, onContextMenu]);

  if (renderEntry) {
    return (
      <div
        className="eui-cal-list-item"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        role="listitem"
        style={{
          ...(entry.color ? { '--eui-cal-entry-bg': entry.color } as React.CSSProperties : {}),
          ...(entry.borderColor ? { '--eui-cal-entry-border': entry.borderColor } as React.CSSProperties : {}),
        }}
      >
        {renderEntry(entry, {
          view: ViewMode.listMonth,
          isCompact: false,
          width: 100,
          height: 40,
          isStart: true,
          isEnd: true,
          isContinuation: false,
        })}
      </div>
    );
  }

  return (
    <div
      className="eui-cal-list-item"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      role="listitem"
      tabIndex={0}
      style={{
        ...(entry.color ? { '--eui-cal-entry-bg': entry.color } as React.CSSProperties : {}),
        ...(entry.borderColor ? { '--eui-cal-entry-border': entry.borderColor } as React.CSSProperties : {}),
      }}
    >
      <div className="eui-cal-list-item-indicator" />
      <div className="eui-cal-list-item-time">
        {entry.allDay ? (
          <span className="eui-cal-list-item-allday">All day</span>
        ) : (
          <>
            <span>{formatTime(entry.start, config.timeFormat)}</span>
            <span className="eui-cal-list-item-separator">–</span>
            <span>{formatTime(entry.end, config.timeFormat)}</span>
          </>
        )}
      </div>
      <div className="eui-cal-list-item-content">
        <span className="eui-cal-list-item-title">{entry.title}</span>
      </div>
    </div>
  );
};

export default React.memo(ListViewItem);
