import React from 'react';
import type { Dataset, DatasourcePlugin, SubReportDefinition } from '../report-builder-types';
import type { DatasourceConfig } from '../report-definition-types';

export interface ViewerContext {
    datasources: Record<string, Dataset>;
    parameters: Record<string, unknown>;
    loadingDatasources: Set<string>;
    errorDatasources: Map<string, string>;
    datasourceConfigs: DatasourceConfig[];
    subReportDefinitions?: SubReportDefinition[];
    datasourcePlugins?: DatasourcePlugin[];
    onColumnResize?: (componentId: string, columnId: string, width: number) => void;
    onColumnReorder?: (componentId: string, columnIds: string[]) => void;
    onDrillThrough?: (parameterName: string, value: unknown) => void;
    onCellEdit?: (componentId: string, rowIndex: number, field: string, value: unknown) => void;
}

export const ViewerContext = React.createContext<ViewerContext>({
    datasources: {},
    parameters: {},
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
