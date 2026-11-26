import React, { useMemo } from 'react';
import { ViewMode } from '../../calendar-types';
import type { ResolvedCalendarEntry, EntryRenderer, EntryOrderFn } from '../../calendar-types';
import { getAllDayEntries, getMultiDayEntries, isSameDay } from '../../calendar-utils';
import { CalendarEntry } from '../../entries';
import OverflowPopover from '../../entries/OverflowPopover';
import { startOfDay } from 'date-fns';

const maxVisibleRows = 2;
const allDayRowHeight = 24;
const allDayRowGap = 2;

interface SpannedEntry {
  entry: ResolvedCalendarEntry;
  startCol: number;
  colSpan: number;
  row: number;
}

function defaultSpanOrder(a: ResolvedCalendarEntry, b: ResolvedCalendarEntry): number {
  const startDiff = startOfDay(a.start).getTime() - startOfDay(b.start).getTime();
  if (startDiff) return startDiff;
  return startOfDay(b.end).getTime() - startOfDay(a.end).getTime();
}

function layoutSpannedEntries(
  allDayEntries: ResolvedCalendarEntry[],
  days: Date[],
  entryOrder?: EntryOrderFn
): SpannedEntry[] {
  const dayStarts = days.map(d => startOfDay(d).getTime());
  const sorted = [...allDayEntries].sort(entryOrder || defaultSpanOrder);

  const result: SpannedEntry[] = [];
  const occupiedRows: boolean[][] = [];

  for (const entry of sorted) {
    const entryStart = startOfDay(entry.start).getTime();
    const entryEnd = startOfDay(entry.end).getTime();

    const startCol = dayStarts.findIndex(d => d >= entryStart);
    const endCol = dayStarts.filter(d => d <= entryEnd).length - 1;
    if (startCol === -1 || endCol < startCol) continue;

    let row = occupiedRows.findIndex(cells => !cells.slice(startCol, endCol + 1).some(Boolean));
    if (row === -1) {
      row = occupiedRows.length;
      occupiedRows.push(new Array<boolean>(days.length).fill(false));
    }
    occupiedRows[row].fill(true, startCol, endCol + 1);

    result.push({ entry, startCol, colSpan: endCol - startCol + 1, row });
  }

  return result;
}

interface TimeGridAllDayProps {
  days: Date[];
  entries: ResolvedCalendarEntry[];
  renderEntry?: EntryRenderer;
  onEntryClick?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onEntryContextMenu?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onSlotClick?: (date: Date, event: React.MouseEvent) => void;
  maxHeight?: number;
  allDayText?: string;
  showAllDayRow?: 'auto' | 'always';
  entryOrder?: EntryOrderFn;
}

const TimeGridAllDay: React.FC<TimeGridAllDayProps> = ({
  days, entries, renderEntry, onEntryClick, onEntryContextMenu, onSlotClick, maxHeight, allDayText, showAllDayRow, entryOrder,
}) => {
  const allDayEntries = useMemo(
    () => [...getAllDayEntries(entries), ...getMultiDayEntries(entries)],
    [entries]
  );

  const spanned = useMemo(
    () => layoutSpannedEntries(allDayEntries, days, entryOrder),
    [allDayEntries, days, entryOrder]
  );

  const maxRow = useMemo(() => {
    if (spanned.length === 0) return -1;
    return Math.max(...spanned.map(s => s.row));
  }, [spanned]);

  const overflowByDay = useMemo(() => {
    const map = new Map<number, ResolvedCalendarEntry[]>();
    for (const s of spanned) {
      if (s.row >= maxVisibleRows) {
        for (let c = s.startCol; c < s.startCol + s.colSpan; c++) {
          const list = map.get(c) || [];
          list.push(s.entry);
          map.set(c, list);
        }
      }
    }
    return map;
  }, [spanned]);

  if (allDayEntries.length === 0 && showAllDayRow !== 'always') return null;

  const numDays = days.length;
  const visibleRows = Math.max(1, Math.min(maxRow + 1, maxVisibleRows));
  const hasOverflow = maxRow >= maxVisibleRows;
  const totalRows = visibleRows + (hasOverflow ? 1 : 0);
  const contentHeight = totalRows * allDayRowHeight + Math.max(0, totalRows - 1) * allDayRowGap + 4;

  return (
    <div
      className="eui-cal-allday-row"
      role="row"
      style={{
        minHeight: contentHeight,
        ...(maxHeight && maxHeight > 0 ? { maxHeight, overflowY: 'auto' } : {}),
      }}
    >
      <div className="eui-cal-time-gutter-header eui-cal-allday-label" role="rowheader">
        {allDayText || 'all-day'}
      </div>
      <div className="eui-cal-allday-grid" style={{ position: 'relative' }}>
        {days.map((day, colIdx) => (
          <div
            key={day.toISOString()}
            className="eui-cal-allday-cell"
            onClick={(e) => onSlotClick?.(day, e)}
            role="gridcell"
            aria-label={`All day events for ${day.toLocaleDateString()}`}
            style={{
              position: 'absolute',
              left: `${(colIdx / numDays) * 100}%`,
              width: `${(1 / numDays) * 100}%`,
              top: 0,
              bottom: 0,
            }}
          >
            {overflowByDay.has(colIdx) && (
              <div style={{
                position: 'absolute',
                bottom: 2,
                left: 2,
                right: 2,
                zIndex: 3,
              }}>
                <OverflowPopover
                  entries={overflowByDay.get(colIdx)!}
                  triggerLabel={`+${overflowByDay.get(colIdx)!.length}`}
                  renderEntry={renderEntry}
                  onEntryClick={onEntryClick}
                  onEntryContextMenu={onEntryContextMenu}
                />
              </div>
            )}
          </div>
        ))}

        {spanned
          .filter(s => s.row < maxVisibleRows)
          .map(({ entry, startCol, colSpan, row }) => {
            const leftPct = (startCol / numDays) * 100;
            const widthPct = (colSpan / numDays) * 100;
            const top = row * (allDayRowHeight + allDayRowGap) + 2;
            const isStart = startCol === 0 || isSameDay(entry.start, days[startCol]);
            const isEnd = (startCol + colSpan - 1) === numDays - 1 || isSameDay(entry.end, days[startCol + colSpan - 1]);

            return (
              <div
                key={`${entry.id}-${startCol}`}
                style={{
                  position: 'absolute',
                  left: `calc(${leftPct}% + 2px)`,
                  width: `calc(${widthPct}% - 4px)`,
                  top,
                  height: allDayRowHeight,
                  zIndex: 2,
                }}
              >
                <CalendarEntry
                  entry={entry}
                  isAllDay
                  context={{
                    view: ViewMode.timeGridWeek,
                    isCompact: true,
                    width: 100,
                    height: allDayRowHeight,
                    isStart,
                    isEnd,
                    isContinuation: !isStart,
                  }}
                  style={{ height: '100%' }}
                  renderEntry={renderEntry}
                  onClick={onEntryClick}
                  onContextMenu={onEntryContextMenu}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default React.memo(TimeGridAllDay);
