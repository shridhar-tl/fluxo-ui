import { useCallback, useRef, useEffect } from 'react';
import type { ResolvedCalendarEntry, CalendarConfig, DragState } from '../calendar-types';
import { snapToSlot, pixelsToMinuteOffset } from '../calendar-utils';

interface UseDragMoveOptions {
  config: CalendarConfig;
  entries: ResolvedCalendarEntry[];
  onDragEnd?: (state: DragState) => void;
  setDragState: (state: DragState | null) => void;
}

function wouldOverlap(
  state: DragState, entries: ResolvedCalendarEntry[]
): boolean {
  const dayDelta = state.dayOffset * 24 * 60 * 60 * 1000;
  const newStart = new Date(state.originalStart.getTime() + state.offsetMinutes * 60000 + dayDelta);
  const newEnd = new Date(state.originalEnd.getTime() + state.offsetMinutes * 60000 + dayDelta);
  return entries.some(e => {
    if (e.id === state.entryId) return false;
    return newStart < e.end && newEnd > e.start;
  });
}

export function useDragMove(options: UseDragMoveOptions) {
  const { config, entries, onDragEnd, setDragState } = options;
  const stateRef = useRef<DragState | null>(null);
  const isDragging = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressReady = useRef(false);
  const pointerTypeRef = useRef<string>('');
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;
  const setDragStateRef = useRef(setDragState);
  setDragStateRef.current = setDragState;
  const configRef = useRef(config);
  configRef.current = config;
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  const columnWidthRef = useRef(0);

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const state = stateRef.current;
      if (!state || state.type !== 'move') return;

      if (pointerTypeRef.current === 'touch' && !longPressReady.current) return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;

      if (!isDragging.current) {
        if (Math.abs(dy) < configRef.current.dragThreshold && Math.abs(dx) < configRef.current.dragThreshold) return;
        isDragging.current = true;

        const entryEl = document.querySelector(`[data-entry-id="${state.entryId}"]`);
        const col = entryEl?.closest('.eui-cal-time-column');
        if (col) {
          columnWidthRef.current = col.getBoundingClientRect().width;
        }
      }

      const minutesDelta = snapToSlot(
        pixelsToMinuteOffset(dy, configRef.current.slotDuration, configRef.current.slotHeight),
        configRef.current.snapDuration
      );

      let dayOffset = 0;
      if (columnWidthRef.current > 0) {
        dayOffset = Math.round(dx / columnWidthRef.current);
      }

      const updated: DragState = {
        ...state,
        currentX: e.clientX,
        currentY: e.clientY,
        offsetMinutes: minutesDelta,
        dayOffset,
      };

      stateRef.current = updated;
      setDragStateRef.current(updated);
    };

    const handleUp = (e: PointerEvent) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      const state = stateRef.current;
      if (!state || state.type !== 'move') return;

      if (isDragging.current && (state.offsetMinutes !== 0 || state.dayOffset !== 0)) {
        const cfg = configRef.current;
        let cancelled = false;

        if (!cfg.eventOverlap && wouldOverlap(state, entriesRef.current)) {
          cancelled = true;
        }

        if (!cancelled && cfg.eventAllow) {
          const dayDelta = state.dayOffset * 24 * 60 * 60 * 1000;
          const newStart = new Date(state.originalStart.getTime() + state.offsetMinutes * 60000 + dayDelta);
          const newEnd = new Date(state.originalEnd.getTime() + state.offsetMinutes * 60000 + dayDelta);
          const entry = entriesRef.current.find(e => e.id === state.entryId);
          if (entry && !cfg.eventAllow({ start: newStart, end: newEnd, entry })) {
            cancelled = true;
          }
        }

        if (!cancelled) {
          state.modifiers = { alt: e.altKey, ctrl: e.ctrlKey, shift: e.shiftKey, meta: e.metaKey };
          onDragEndRef.current?.(state);
        }
      }

      stateRef.current = null;
      isDragging.current = false;
      longPressReady.current = false;
      columnWidthRef.current = 0;
      setDragStateRef.current(null);
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
  }, []);

  const handlePointerDown = useCallback((
    entry: ResolvedCalendarEntry,
    event: React.PointerEvent
  ) => {
    const cfg = configRef.current;
    if (!cfg.editable && !entry.editable) return;
    if (entry.editable === false) return;
    if (!cfg.eventStartEditable) return;

    event.preventDefault();
    pointerTypeRef.current = event.pointerType;

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

  return { handlePointerDown };
}
