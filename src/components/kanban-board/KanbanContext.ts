import { createContext, useContext } from 'react';
import { KanbanContextValue } from './kanban-types';

const KanbanContext = createContext<KanbanContextValue | null>(null);

export function useKanban(): KanbanContextValue {
    const ctx = useContext(KanbanContext);
    if (!ctx) {
        throw new Error('useKanban must be used within a KanbanBoard');
    }
    return ctx;
}

export default KanbanContext;
