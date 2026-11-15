import { useCallback, useEffect, useRef, useState } from 'react';
import type { CalendarConfig, ModifierKeys, ResolvedCalendarEntry } from '../calendar-types';
import { endOfDay, isAfter, isBefore } from 'date-fns';

const dayCellSelector = '[data-date]';
const interactiveSelector = '.eui-cal-entry, button, a, [role="button"]';

export interface DayGridSelectionRange {
  start: string;
  end: string;
}

export interface DayGridSelectionResult {
  start: Date;
  end: Date;
  modifiers: ModifierKeys;
}

interface UseDayGridSelectionOptions {
  config: CalendarConfig;
  entries: ResolvedCalendarEntry[];
  containerRef: React.RefObject<HTMLElement | null>;
  onSelect?: (result: DayGridSelectionResult) => void;
}

function parseCellDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getCellDateAt(container: HTMLElement | null, x: number, y: number): string | null {
  const cell = document.elementFromPoint(x, y)?.closest<HTMLElement>(dayCellSelector);
  if (!cell || !container?.contains(cell)) return null;
  return cell.dataset.date ?? null;
}

function toRange(anchor: string, current: string): DayGridSelectionRange {
  return anchor <= current ? { start: anchor, end: current } : { start: current, end: anchor };
}

function suppressNextClick() {
  const stop = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };
  window.addEventListener('click', stop, { capture: true, once: true });
  setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 0);
}

function overlapsEntries(start: Date, end: Date, entries: ResolvedCalendarEntry[]): boolean {
  const rangeEnd = endOfDay(end);
  return entries.some(e => isBefore(e.start, rangeEnd) && isAfter(e.allDay ? endOfDay(e.end) : e.end, start));
}

export function isDateInSelection(date: string, range: DayGridSelectionRange | null): boolean {
  return !!range && date >= range.start && date <= range.end;
}

export function useDayGridSelection(options: UseDayGridSelectionOptions) {
  const { config, entries, containerRef, onSelect } = options;
  const [selection, setSelection] = useState<DayGridSelectionRange | null>(null);
  const anchorRef = useRef<string | null>(null);
  const currentRef = useRef<string | null>(null);
  const startPoint = useRef({ x: 0, y: 0 });
  const isSelecting = useRef(false);
  const configRef = useRef(config);
  configRef.current = config;
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const reset = () => {
      anchorRef.current = null;
      currentRef.current = null;
      if (isSelecting.current) {
        isSelecting.current = false;
        setSelection(null);
      }
    };

    const handleMove = (e: PointerEvent) => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      if (!isSelecting.current) {
        const distance = Math.max(configRef.current.selectMinDistance, configRef.current.dragThreshold);
        if (Math.abs(e.clientX - startPoint.current.x) < distance && Math.abs(e.clientY - startPoint.current.y) < distance) return;
      }

      const target = getCellDateAt(containerRef.current, e.clientX, e.clientY);
      if (!target) return;
      if (!isSelecting.current && target === anchor) return;

      isSelecting.current = true;
      if (target !== currentRef.current) {
        currentRef.current = target;
        setSelection(toRange(anchor, target));
      }
    };

    const handleUp = (e: PointerEvent) => {
      const anchor = anchorRef.current;
      const current = currentRef.current;
      if (anchor && current && isSelecting.current) {
        suppressNextClick();
        const range = toRange(anchor, current);
        const start = parseCellDate(range.start);
        const end = parseCellDate(range.end);
        const cfg = configRef.current;
        const allowed = (cfg.selectOverlap || !overlapsEntries(start, end, entriesRef.current))
          && (!cfg.selectAllow || cfg.selectAllow({ start, end, allDay: true }));
        if (allowed) {
          onSelectRef.current?.({
            start,
            end,
            modifiers: { alt: e.altKey, ctrl: e.ctrlKey, shift: e.shiftKey, meta: e.metaKey },
          });
        }
      }
      reset();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSelecting.current) {
        suppressNextClick();
        reset();
      }
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
    document.addEventListener('pointercancel', reset);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
      document.removeEventListener('pointercancel', reset);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef]);

  const handleCellPointerDown = useCallback((date: string, event: React.PointerEvent) => {
    if (!configRef.current.selectable || event.button !== 0 || event.pointerType === 'touch') return;
    if ((event.target as HTMLElement).closest(interactiveSelector)) return;
    event.preventDefault();
    anchorRef.current = date;
    currentRef.current = date;
    startPoint.current = { x: event.clientX, y: event.clientY };
    isSelecting.current = false;
  }, []);

  return { selection, handleCellPointerDown };
}
