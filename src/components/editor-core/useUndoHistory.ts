import { useCallback, useRef, useState } from 'react';
import type { Range } from './textareaCommands';

export interface HistoryEntry {
    value: string;
    selection: Range;
}

export interface UseUndoHistoryOptions {
    limit?: number;
    debounceMs?: number;
}

export interface UseUndoHistoryResult {
    record: (entry: HistoryEntry, immediate?: boolean) => void;
    undo: () => HistoryEntry | null;
    redo: () => HistoryEntry | null;
    canUndo: boolean;
    canRedo: boolean;
    reset: (entry: HistoryEntry) => void;
}

export function useUndoHistory(initial: HistoryEntry, options: UseUndoHistoryOptions = {}): UseUndoHistoryResult {
    const { limit = 200, debounceMs = 350 } = options;
    const stackRef = useRef<HistoryEntry[]>([initial]);
    const indexRef = useRef<number>(0);
    const pendingTimerRef = useRef<number | null>(null);
    const pendingRef = useRef<HistoryEntry | null>(null);
    const [, forceRender] = useState(0);

    const flush = useCallback(() => {
        if (pendingTimerRef.current != null) {
            window.clearTimeout(pendingTimerRef.current);
            pendingTimerRef.current = null;
        }
        const pending = pendingRef.current;
        if (pending) {
            pendingRef.current = null;
            const stack = stackRef.current;
            stack.splice(indexRef.current + 1);
            stack.push(pending);
            if (stack.length > limit) stack.shift();
            indexRef.current = stack.length - 1;
            forceRender((n) => n + 1);
        }
    }, [limit]);

    const record = useCallback(
        (entry: HistoryEntry, immediate = false) => {
            const current = stackRef.current[indexRef.current];
            if (current && current.value === entry.value) {
                pendingRef.current = entry;
                return;
            }
            pendingRef.current = entry;
            if (pendingTimerRef.current != null) {
                window.clearTimeout(pendingTimerRef.current);
                pendingTimerRef.current = null;
            }
            if (immediate) {
                flush();
            } else {
                pendingTimerRef.current = window.setTimeout(flush, debounceMs);
            }
        },
        [debounceMs, flush],
    );

    const undo = useCallback((): HistoryEntry | null => {
        flush();
        if (indexRef.current <= 0) return null;
        indexRef.current -= 1;
        forceRender((n) => n + 1);
        return stackRef.current[indexRef.current];
    }, [flush]);

    const redo = useCallback((): HistoryEntry | null => {
        flush();
        if (indexRef.current >= stackRef.current.length - 1) return null;
        indexRef.current += 1;
        forceRender((n) => n + 1);
        return stackRef.current[indexRef.current];
    }, [flush]);

    const reset = useCallback((entry: HistoryEntry) => {
        stackRef.current = [entry];
        indexRef.current = 0;
        pendingRef.current = null;
        if (pendingTimerRef.current != null) {
            window.clearTimeout(pendingTimerRef.current);
            pendingTimerRef.current = null;
        }
        forceRender((n) => n + 1);
    }, []);

    return {
        record,
        undo,
        redo,
        canUndo: indexRef.current > 0,
        canRedo: indexRef.current < stackRef.current.length - 1,
        reset,
    };
}
