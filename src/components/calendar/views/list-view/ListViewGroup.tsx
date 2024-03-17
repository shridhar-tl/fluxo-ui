import React from 'react';
import cn from 'classnames';
import { format, isToday } from 'date-fns';
import type { ResolvedCalendarEntry, EntryRenderer } from '../../calendar-types';
import ListViewItem from './ListViewItem';

interface ListViewGroupProps {
  date: Date;
  entries: ResolvedCalendarEntry[];
  renderEntry?: EntryRenderer;
  onEntryClick?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onEntryContextMenu?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
}

const ListViewGroup: React.FC<ListViewGroupProps> = ({
  date, entries, renderEntry, onEntryClick, onEntryContextMenu,
}) => {
  const today = isToday(date);

  return (
    <div className={cn('eui-cal-list-group', { 'eui-cal-list-group-today': today })}>
      <div className="eui-cal-list-group-header">
        <span className="eui-cal-list-group-day-name">{format(date, 'EEEE')}</span>
        <span className={cn('eui-cal-list-group-date', { 'eui-cal-list-group-date-today': today })}>
          {format(date, 'MMM d, yyyy')}
        </span>
      </div>
      <div className="eui-cal-list-group-items" role="list">
        {entries.length === 0 ? (
          <div className="eui-cal-list-empty">No entries</div>
        ) : (
          entries.map(entry => (
            <ListViewItem
              key={entry.id}
              entry={entry}
              renderEntry={renderEntry}
              onClick={onEntryClick}
              onContextMenu={onEntryContextMenu}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(ListViewGroup);
