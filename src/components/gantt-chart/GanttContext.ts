import { createContext, useContext } from 'react';
import { GanttContextValue } from './gantt-types';

export const GanttContext = createContext<GanttContextValue | null>(null);

export function useGanttContext(): GanttContextValue {
    const ctx = useContext(GanttContext);
    if (!ctx) {
        throw new Error('useGanttContext must be used within a GanttChart');
    }
    return ctx;
}
