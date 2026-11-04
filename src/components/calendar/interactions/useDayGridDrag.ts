import { useCallback, useEffect, useRef, useState } from 'react';
import type { ResolvedCalendarEntry, CalendarConfig, DragState } from '../calendar-types';
import { differenceInCalendarDays, isMoveAllowed } from '../calendar-utils';

const dayCellSelector = '[data-date]';

interface UseDayGridDragOptions {
  config: CalendarConfig;
  entries: ResolvedCalendarEntry[];
  containerRef: React.RefObject<HTMLElement | null>;
  onDrop?: (state: DragState) => void;
  setDragState: (state: DragState | null) => void;
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

function suppressNextClick() {
  const stop = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };
  window.addEventListener('click', stop, { capture: true, once: true });
  setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 0);
}

export function useDayGridDrag(options: UseDayGridDragOptions) {
  const { config, entries, containerRef, onDrop, setDragState } = options;
  const [dropTargetDate, setDropTargetDate] = useState<string | null>(null);
  const stateRef = useRef<DragState | null>(null);
  const sourceDateRef = useRef<Date | null>(null);
  const targetDateRef = useRef<string | null>(null);
  const isDragging = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressReady = useRef(false);
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;
  const setDragStateRef = useRef(setDragState);
  setDragStateRef.current = setDragState;
  const configRef = useRef(config);
  configRef.current = config;
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  useEffect(() => {
    const reset = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      const wasActive = stateRef.current !== null;
      stateRef.current = null;
      sourceDateRef.current = null;
      targetDateRef.current = null;
      isDragging.current = false;
      longPressReady.current = false;
      if (wasActive) {
        setDropTargetDate(null);
        setDragStateRef.current(null);
      }
    };

    const handleMove = (e: PointerEvent) => {
      const state = stateRef.current;
      if (!state || !longPressReady.current) return;

      if (!isDragging.current) {
        const threshold = configRef.current.dragThreshold;
        if (Math.abs(e.clientX - state.startX) < threshold && Math.abs(e.clientY - state.startY) < threshold) return;
        isDragging.current = true;
        setDropTargetDate(targetDateRef.current);
        setDragStateRef.current(state);
      }

      const targetDate = getCellDateAt(containerRef.current, e.clientX, e.clientY);
      if (!targetDate || targetDate === targetDateRef.current || !sourceDateRef.current) return;

      targetDateRef.current = targetDate;
      const updated: DragState = {
        ...state,
        currentX: e.clientX,
        currentY: e.clientY,
        dayOffset: differenceInCalendarDays(parseCellDate(targetDate), sourceDateRef.current),
      };
      stateRef.current = updated;
      setDropTargetDate(targetDate);
      setDragStateRef.current(updated);
    };

    const handleUp = (e: PointerEvent) => {
      const state = stateRef.current;
      if (!state) return;

      if (isDragging.current) {
        suppressNextClick();

        if (state.dayOffset !== 0 && isMoveAllowed(state, entriesRef.current, configRef.current)) {
          onDropRef.current?.({
            ...state,
            modifiers: { alt: e.altKey, ctrl: e.ctrlKey, shift: e.shiftKey, meta: e.metaKey },
          });
        }
      }

      reset();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDragging.current) {
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
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, [containerRef]);

  const handlePointerDown = useCallback((entry: ResolvedCalendarEntry, event: React.PointerEvent) => {
    const cfg = configRef.current;
    if (event.button !== 0) return;
    if (!cfg.editable && !entry.editable) return;
    if (entry.editable === false) return;
    if (!cfg.eventStartEditable) return;

    const sourceDate = (event.currentTarget as HTMLElement).closest<HTMLElement>(dayCellSelector)?.dataset.date;
    if (!sourceDate) return;

    event.preventDefault();

    sourceDateRef.current = parseCellDate(sourceDate);
    targetDateRef.current = sourceDate;
    stateRef.current = {
      entryId: entry.id,
      type: 'move',
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      offsetMinutes: 0,
      dayOffset: 0,
      originalStart: entry.start,
      originalEnd: entry.end,
    };
    isDragging.current = false;

    if (event.pointerType === 'touch') {
      longPressReady.current = false;
      longPressTimer.current = setTimeout(() => {
        longPressReady.current = true;
      }, cfg.longPressDelay);
    } else {
      longPressReady.current = true;
    }
  }, []);

  return { handlePointerDown, dropTargetDate };
}
