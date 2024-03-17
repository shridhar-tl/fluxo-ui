import { useCallback, useRef, useEffect } from 'react';
import type { CalendarConfig, SelectionState, ResolvedCalendarEntry } from '../calendar-types';
import { snapToSlot, pixelsToMinuteOffset, dateFromMinuteOffset } from '../calendar-utils';
import { isBefore, isAfter } from 'date-fns';

interface UseSelectionOptions {
  config: CalendarConfig;
  entries: ResolvedCalendarEntry[];
  setSelectionState: (state: SelectionState | null) => void;
  onSelectionComplete?: (state: SelectionState) => void;
}

function rangeOverlapsEntries(start: Date, end: Date, entries: ResolvedCalendarEntry[]): boolean {
  return entries.some(e => isBefore(e.start, end) && isAfter(e.end, start));
}

export function useSelection(options: UseSelectionOptions) {
  const { config, entries, setSelectionState, onSelectionComplete } = options;
  const stateRef = useRef<SelectionState | null>(null);
  const startY = useRef(0);
  const startX = useRef(0);
  const distanceMet = useRef(false);
  const baseDateRef = useRef<Date>(new Date());
  const setSelRef = useRef(setSelectionState);
  setSelRef.current = setSelectionState;
  const onCompleteRef = useRef(onSelectionComplete);
  onCompleteRef.current = onSelectionComplete;
  const configRef = useRef(config);
  configRef.current = config;
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const state = stateRef.current;
      if (!state || !state.isSelecting || state.allDay) return;

      const cfg = configRef.current;

      if (!distanceMet.current && cfg.selectMinDistance > 0) {
        const dx = e.clientX - startX.current;
        const dy = e.clientY - startY.current;
        if (Math.sqrt(dx * dx + dy * dy) < cfg.selectMinDistance) return;
        distanceMet.current = true;
      }

      const dy = e.clientY - startY.current;
      const minutesDelta = snapToSlot(
        pixelsToMinuteOffset(dy, cfg.slotDuration, cfg.slotHeight),
        cfg.snapDuration
      );

      let endSlot = state.startSlot + minutesDelta + cfg.snapDuration;
      let actualEnd = Math.max(endSlot, state.startSlot + cfg.snapDuration);

      const durationMinutes = actualEnd - state.startSlot;
      if (cfg.eventMinDuration > 0 && durationMinutes < cfg.eventMinDuration) {
        actualEnd = state.startSlot + cfg.eventMinDuration;
      }
      if (cfg.eventMaxDuration > 0 && durationMinutes > cfg.eventMaxDuration) {
        actualEnd = state.startSlot + cfg.eventMaxDuration;
      }

      const endDate = dateFromMinuteOffset(baseDateRef.current, actualEnd, cfg.visibleHoursStart);

      const updated: SelectionState = {
        ...state,
        endDate,
        endSlot: actualEnd,
      };

      stateRef.current = updated;
      setSelRef.current(updated);
    };

    const handleUp = () => {
      const state = stateRef.current;
      if (!state) return;

      if (state.isSelecting) {
        const cfg = configRef.current;

        const correctedEndDate = state.allDay
          ? state.endDate
          : dateFromMinuteOffset(baseDateRef.current, state.endSlot, cfg.visibleHoursStart);

        let cancelled = false;

        if (!cfg.selectOverlap && rangeOverlapsEntries(state.startDate, correctedEndDate, entriesRef.current)) {
          cancelled = true;
        }

        if (!cancelled && cfg.selectAllow) {
          const allowed = cfg.selectAllow({ start: state.startDate, end: correctedEndDate, allDay: state.allDay });
          if (!allowed) cancelled = true;
        }

        if (!cancelled) {
          const finalState: SelectionState = { ...state, endDate: correctedEndDate, isSelecting: false };
          onCompleteRef.current?.(finalState);
        }
      }

      stateRef.current = null;
      setSelRef.current(null);
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
  }, []);

  const handleSlotPointerDown = useCallback((
    date: Date,
    slotMinute: number,
    allDay: boolean,
    event: React.PointerEvent
  ) => {
    if (!configRef.current.selectable) return;

    event.preventDefault();
    startY.current = event.clientY;
    startX.current = event.clientX;
    distanceMet.current = configRef.current.selectMinDistance <= 0;
    baseDateRef.current = date;

    const cfg = configRef.current;
    const snapped = snapToSlot(slotMinute, cfg.snapDuration);
    const startDate = allDay ? date : dateFromMinuteOffset(date, snapped, cfg.visibleHoursStart);

    const state: SelectionState = {
      startDate,
      endDate: startDate,
      startSlot: snapped,
      endSlot: snapped + cfg.snapDuration,
      isSelecting: true,
      allDay,
    };

    stateRef.current = state;
    setSelRef.current(state);
  }, []);

  return { handleSlotPointerDown };
}
