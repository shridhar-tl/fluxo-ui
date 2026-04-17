import { create } from '../../store';
import { undoRedoMiddleware } from '../../store/middlewares';
import type { ReportBuilderState } from './report-builder-types';

export function createReportBuilderStore(initial: ReportBuilderState) {
    const base = create<ReportBuilderState>(() => initial);
    return undoRedoMiddleware<ReportBuilderState>(50)(base);
}

export type ReportBuilderStore = ReturnType<typeof createReportBuilderStore>;
