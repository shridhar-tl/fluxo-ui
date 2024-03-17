import { useCallback, useRef, useEffect } from 'react';
import type { ResolvedCalendarEntry, CalendarConfig, DragState } from '../calendar-types';
import { snapToSlot, pixelsToMinuteOffset } from '../calendar-utils';

interface UseDragResizeOptions {
  config: CalendarConfig;
  entries: ResolvedCalendarEntry[];
  onResizeEnd?: (state: DragState) => void;
  setDragState: (state: DragState | null) => void;
}

export function useDragResize(options: UseDragResizeOptions) {
  const { config, entries, onResizeEnd, setDragState } = options;
  const stateRef = useRef<DragState | null>(null);
  const isDragging = useRef(false);
  const onResizeEndRef = useRef(onResizeEnd);
  onResizeEndRef.current = onResizeEnd;
  const setDragStateRef = useRef(setDragState);
  setDragStateRef.current = setDragState;
  const configRef = useRef(config);
  configRef.current = config;
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const state = stateRef.current;
      if (!state || state.type !== 'resize') return;

      const dy = e.clientY - state.startY;

      if (!isDragging.current) {
        if (Math.abs(dy) < configRef.current.dragThreshold) return;
        isDragging.current = true;
      }

      const minutesDelta = snapToSlot(
        pixelsToMinuteOffset(dy, configRef.current.slotDuration, configRef.current.slotHeight),
        configRef.current.snapDuration
      );

      const updated: DragState = {
        ...state,
        currentX: e.clientX,
        currentY: e.clientY,
        offsetMinutes: minutesDelta,
      };

      stateRef.current = updated;
      setDragStateRef.current(updated);
    };

    const handleUp = (_e: PointerEvent) => {
      const state = stateRef.current;
      if (!state || state.type !== 'resize') return;

      if (isDragging.current && state.offsetMinutes !== 0) {
        const cfg = configRef.current;
        let newStart = state.originalStart;
        let newEnd = state.originalEnd;

        if (state.edge === 'top') {
          newStart = new Date(state.originalStart.getTime() + state.offsetMinutes * 60000);
        } else {
          newEnd = new Date(state.originalEnd.getTime() + state.offsetMinutes * 60000);
        }

        const durationMs = newEnd.getTime() - newStart.getTime();
        const durationMinutes = durationMs / 60000;
        let cancelled = false;

        if (cfg.eventMinDuration > 0 && durationMinutes < cfg.eventMinDuration) {
          cancelled = true;
        }
        if (cfg.eventMaxDuration > 0 && durationMinutes > cfg.eventMaxDuration) {
          cancelled = true;
        }

        if (!cancelled && !cfg.eventOverlap) {
          const overlaps = entriesRef.current.some(e => {
            if (e.id === state.entryId) return false;
            return newStart < e.end && newEnd > e.start;
          });
          if (overlaps) cancelled = true;
        }

        if (!cancelled && cfg.eventAllow) {
          const entry = entriesRef.current.find(e => e.id === state.entryId);
          if (entry && !cfg.eventAllow({ start: newStart, end: newEnd, entry })) {
            cancelled = true;
          }
        }

        if (!cancelled) {
          onResizeEndRef.current?.(state);
        }
      }

      stateRef.current = null;
      isDragging.current = false;
      setDragStateRef.current(null);
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
  }, []);

  const handleResizePointerDown = useCallback((
    entry: ResolvedCalendarEntry,
    edge: 'top' | 'bottom',
    event: React.PointerEvent
  ) => {
    const cfg = configRef.current;
    if (!cfg.editable && !entry.editable) return;
    if (entry.editable === false) return;
    if (entry.resizable === false) return;
    if (!cfg.eventDurationEditable) return;

    event.stopPropagation();
    event.preventDefault();

    stateRef.current = {
      entryId: entry.id,
      type: 'resize',
      edge,
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
  }, []);

  return { handleResizePointerDown };
}
