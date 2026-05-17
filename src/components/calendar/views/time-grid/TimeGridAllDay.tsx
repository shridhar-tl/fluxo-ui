import React, { useMemo } from 'react';
import { ViewMode } from '../../calendar-types';
import type { ResolvedCalendarEntry, EntryRenderer } from '../../calendar-types';
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

function layoutSpannedEntries(
  allDayEntries: ResolvedCalendarEntry[],
  days: Date[]
): SpannedEntry[] {
  const numDays = days.length;
  const dayStarts = days.map(d => startOfDay(d).getTime());
  const lastDayStart = dayStarts[numDays - 1];

  const sorted = [...allDayEntries].sort((a, b) => {
    const aStart = startOfDay(a.start).getTime();
    const bStart = startOfDay(b.start).getTime();
    if (aStart !== bStart) return aStart - bStart;
    const aEnd = startOfDay(a.end).getTime();
    const bEnd = startOfDay(b.end).getTime();
    return bEnd - aEnd;
  });

  const result: SpannedEntry[] = [];
  const rowEndCols: number[] = [];

  for (const entry of sorted) {
    const entryStart = startOfDay(entry.start).getTime();
    const entryEnd = startOfDay(entry.end).getTime();

    let startCol = -1;
    for (let i = 0; i < numDays; i++) {
      if (dayStarts[i] >= entryStart) {
        startCol = i;
        break;
      }
    }
    if (startCol === -1) startCol = 0;

    let endCol = numDays - 1;
    for (let i = numDays - 1; i >= 0; i--) {
      if (dayStarts[i] <= entryEnd || dayStarts[i] <= lastDayStart && entryEnd >= lastDayStart) {
        endCol = i;
        break;
      }
    }
    if (entryEnd > lastDayStart) endCol = numDays - 1;

    const colSpan = endCol - startCol + 1;

    let row = 0;
    for (let r = 0; r < rowEndCols.length; r++) {
      if (rowEndCols[r] <= startCol) {
        row = r;
        break;
      }
      row = r + 1;
    }

    if (row >= rowEndCols.length) {
      rowEndCols.push(startCol + colSpan);
    } else {
      rowEndCols[row] = startCol + colSpan;
    }

    result.push({ entry, startCol, colSpan, row });
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
}

const TimeGridAllDay: React.FC<TimeGridAllDayProps> = ({
  days, entries, renderEntry, onEntryClick, onEntryContextMenu, onSlotClick, maxHeight, allDayText, showAllDayRow,
}) => {
  const allDayEntries = useMemo(
    () => [...getAllDayEntries(entries), ...getMultiDayEntries(entries)],
    [entries]
  );

  const spanned = useMemo(
    () => layoutSpannedEntries(allDayEntries, days),
    [allDayEntries, days]
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
