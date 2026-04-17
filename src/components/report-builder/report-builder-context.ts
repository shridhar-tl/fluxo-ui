import React from 'react';
import type { DatasourcePlugin, CustomParameterPlugin, ReportBuilderState, ReportTemplate, AvailableSubReport } from './report-builder-types';
import type { ReportBuilderStore } from './report-builder-store';

export interface ReportBuilderContextValue {
    store: ReportBuilderStore;
    datasourcePlugins: DatasourcePlugin[];
    parameterPlugins: CustomParameterPlugin[];
    availableSubReports: AvailableSubReport[];
    templates: ReportTemplate[];
    onSaveTemplate?: (template: ReportTemplate) => void;
    onDeleteTemplate?: (templateId: string) => void;
    onLoadTemplate?: (template: ReportTemplate) => void;
}

export const ReportBuilderContext = React.createContext<ReportBuilderContextValue | null>(null);

export function useReportBuilderContext(): ReportBuilderContextValue {
    const ctx = React.useContext(ReportBuilderContext);
    if (!ctx) throw new Error('useReportBuilderContext must be used inside ReportBuilder');
    return ctx;
}

export function useRBStore(): ReportBuilderState;
export function useRBStore<R>(selector: (s: ReportBuilderState) => R): R;
export function useRBStore<R>(selector?: (s: ReportBuilderState) => R): ReportBuilderState | R {
    const { store } = useReportBuilderContext();
    const selectorRef = React.useRef(selector);
    selectorRef.current = selector;

    const [value, setValue] = React.useState<ReportBuilderState | R>(() => {
        const s = store.getState();
        return selector ? selector(s) : s;
    });
    const valueRef = React.useRef(value);
    valueRef.current = value;

    React.useEffect(() => {
        return store.on('change', (newState) => {
            const next = selectorRef.current ? selectorRef.current(newState) : newState;
            if (!Object.is(next, valueRef.current)) {
                valueRef.current = next as ReportBuilderState | R;
                setValue(next as ReportBuilderState | R);
            }
        });
    }, [store]);

    return value;
}
