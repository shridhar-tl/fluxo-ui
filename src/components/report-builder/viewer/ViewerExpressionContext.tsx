import React from 'react';
import type { Dataset, DatasourcePlugin, SubReportDefinition } from '../report-builder-types';
import type { DatasourceConfig } from '../report-definition-types';

export interface VariableScopeFrame {
    componentId: string;
    names: Set<string>;
}

export interface ViewerContext {
    datasources: Record<string, Dataset>;
    parameters: Record<string, unknown>;
    /** Row bound at the current scope (e.g. by a repeater). Exposed in expressions as Field.<name>. */
    currentRow?: Record<string, unknown>;
    /** Merged read view: closest-scope shadowing applied. Always reflects what `Variables.<name>` resolves to at this point in the tree. */
    variables: Record<string, unknown>;
    /** Fully merged built-in fields map (library registry + per-instance overrides). Keyed by field name. */
    builtInFields?: Record<string, unknown>;
    /** Stack of component-scoped declarations from outermost to innermost. Used by setVariable to find the right bucket. */
    variableScopeChain: VariableScopeFrame[];
    /** Names declared at the global (definition.variables) scope. */
    globalVariableNames: Set<string>;
    /** Per-component-id buckets of writable values. Used by ComponentRenderer to materialise a scoped view for descendants. */
    componentVariableValues?: Record<string, Record<string, unknown>>;
    loadingDatasources: Set<string>;
    errorDatasources: Map<string, string>;
    datasourceConfigs: DatasourceConfig[];
    subReportDefinitions?: SubReportDefinition[];
    datasourcePlugins?: DatasourcePlugin[];
    onColumnResize?: (componentId: string, columnId: string, width: number) => void;
    onColumnReorder?: (componentId: string, columnIds: string[]) => void;
    /** Drill-through. Performs the variable write AND fires the host notification. */
    onDrillThrough?: (variableName: string, value: unknown) => void;
    /** Writes a variable. Resolves to the nearest scope on the current scope chain that declares the name; falls back to global. */
    onSetVariable?: (variableName: string, value: unknown) => void;
    /** Pure notification to the host that a variable was written. Provided by ReportViewer; renderers do not call this directly. */
    notifyVariableChange?: (variableName: string, value: unknown) => void;
    /** Low-level writers used by scope-aware setters; not intended for renderers to call directly. */
    writeGlobalVariable?: (variableName: string, value: unknown) => void;
    writeComponentVariable?: (componentId: string, variableName: string, value: unknown) => void;
    onCellEdit?: (componentId: string, rowIndex: number, field: string, value: unknown) => void;
}

export const ViewerContext = React.createContext<ViewerContext>({
    datasources: {},
    parameters: {},
    variables: {},
    variableScopeChain: [],
    globalVariableNames: new Set(),
    loadingDatasources: new Set(),
    errorDatasources: new Map(),
    datasourceConfigs: [],
});

export function useViewerContext() {
    return React.useContext(ViewerContext);
}

export function buildExpressionDatasources(
    datasources: Record<string, Dataset>,
): Record<string, Record<string, unknown>[]> {
    const result: Record<string, Record<string, unknown>[]> = {};
    for (const [name, dataset] of Object.entries(datasources)) {
        result[name] = dataset.rows;
    }
    return result;
}
