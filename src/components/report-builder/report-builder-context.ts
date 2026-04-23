import React from 'react';
import type { BuiltInFieldDefinition } from './built-in-fields';
import type { DatasourcePlugin, CustomParameterPlugin, ReportBuilderState, ReportTemplate, AvailableSubReport } from './report-builder-types';
import type { ReportBuilderStore } from './report-builder-store';

export interface ReportBuilderContextValue {
    store: ReportBuilderStore;
    datasourcePlugins: DatasourcePlugin[];
    parameterPlugins: CustomParameterPlugin[];
    availableSubReports: AvailableSubReport[];
    /** Fully merged list of built-in fields (library registry + per-instance overrides). */
    builtInFields: BuiltInFieldDefinition[];
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

function shallowEqual(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const keysA = Object.keys(a as object);
    const keysB = Object.keys(b as object);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b as object, key)) return false;
        if (!Object.is((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) return false;
    }
    return true;
}

/**
 * Subscribe to the report-builder store with an optional selector.
 *
 * Pass `shallow = true` as the second argument when the selector returns a freshly-built
 * array or object derived from state — e.g. `s.definition.variables ?? []` or
 * `Object.values(s.datasources)`. Without shallow comparison a new reference would fire a
 * re-render on every store change even when the underlying values are unchanged; with it,
 * the hook compares element-by-element and only re-renders on real differences.
 *
 * Reference-stable selectors (`s.definition.components`, `s.selectedItemId`) don't need it.
 */
export function useRBStore(): ReportBuilderState;
export function useRBStore<R>(selector: (s: ReportBuilderState) => R, shallow?: boolean): R;
export function useRBStore<R>(
    selector?: (s: ReportBuilderState) => R,
    shallow = false,
): ReportBuilderState | R {
    const { store } = useReportBuilderContext();
    const selectorRef = React.useRef(selector);
    selectorRef.current = selector;
    const eqRef = React.useRef<(a: unknown, b: unknown) => boolean>(shallow ? shallowEqual : Object.is);
    eqRef.current = shallow ? shallowEqual : Object.is;

    const [value, setValue] = React.useState<ReportBuilderState | R>(() => {
        const s = store.getState();
        return selector ? selector(s) : s;
    });
    const valueRef = React.useRef(value);
    valueRef.current = value;

    React.useEffect(() => {
        return store.on('change', (newState) => {
            const next = selectorRef.current ? selectorRef.current(newState) : newState;
            if (!eqRef.current(next, valueRef.current)) {
                valueRef.current = next as ReportBuilderState | R;
                setValue(next as ReportBuilderState | R);
            }
        });
    }, [store]);

    return value;
}
