import type React from 'react';
import type { SVGIcon } from '../../assets/icons';
import type { ReportDefinition } from './report-definition-types';

export type SelectedItemType = 'none' | 'datasource' | 'parameter' | 'report-settings' | 'component';

export interface ReportBuilderState {
    definition: ReportDefinition;
    selectedItemId: string | null;
    selectedItemType: SelectedItemType;
}

export interface DatasetField {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
    children?: DatasetField[];
}

export interface Dataset {
    rows: Record<string, unknown>[];
    fields: DatasetField[];
}

export interface DatasourceConfigUIProps {
    config: Record<string, unknown>;
    onChange: (config: Record<string, unknown>) => void;
}

export interface DatasourcePlugin {
    type: string;
    name: string;
    description: string;
    icon: SVGIcon;
    ConfigUI: React.ComponentType<DatasourceConfigUIProps>;
    initialConfig: () => Record<string, unknown>;
    fetch: (config: Record<string, unknown>, parameters: Record<string, unknown>) => Promise<Dataset>;
}

export interface ParameterConfigUIProps {
    config: Record<string, unknown>;
    onChange: (config: Record<string, unknown>) => void;
}

export interface ParameterRuntimeUIProps {
    value: unknown;
    onChange: (value: unknown) => void;
    config: Record<string, unknown>;
    disabled?: boolean;
}

export interface CustomParameterPlugin {
    type: string;
    name: string;
    ConfigUI: React.ComponentType<ParameterConfigUIProps>;
    RuntimeUI: React.ComponentType<ParameterRuntimeUIProps>;
    initialTypeConfig: () => Record<string, unknown>;
    serialize: (value: unknown) => string;
    deserialize: (str: string) => unknown;
    validate?: (value: unknown, config: Record<string, unknown>) => string[] | null;
}

export interface AvailableSubReport {
    id: string;
    label: string;
    parameters?: Array<{ name: string; label: string; type?: string }>;
}

export interface ReportBuilderPanelConfig {
    userCanMove?: boolean;
    userCanClose?: boolean;
}

export interface ReportBuilderProps {
    definition?: ReportDefinition;
    onChange?: (definition: ReportDefinition) => void;
    datasourcePlugins?: DatasourcePlugin[];
    parameterPlugins?: CustomParameterPlugin[];
    availableSubReports?: AvailableSubReport[];
    breakpoints?: Array<{ key: string; maxWidth: number; label: string }>;
    panelConfig?: {
        toolbox?: ReportBuilderPanelConfig;
        datasource?: ReportBuilderPanelConfig;
        parameters?: ReportBuilderPanelConfig;
        properties?: ReportBuilderPanelConfig;
        styles?: ReportBuilderPanelConfig;
        console?: ReportBuilderPanelConfig;
    };
    layoutState?: import('../docked-layout').DockedLayoutState;
    onLayoutChange?: (state: import('../docked-layout').DockedLayoutState) => void;
    templates?: ReportTemplate[];
    onSaveTemplate?: (template: ReportTemplate) => void;
    onDeleteTemplate?: (templateId: string) => void;
    onLoadTemplate?: (template: ReportTemplate) => void;
    enableMultiTab?: boolean;
    tabs?: ReportTab[];
    activeTabId?: string;
    onTabChange?: (tabId: string) => void;
    onTabClose?: (tabId: string) => void;
    className?: string;
    style?: React.CSSProperties;
}

export interface ReportTab {
    id: string;
    label: string;
    definition: import('./report-definition-types').ReportDefinition;
}

export interface SubReportDefinition {
    id: string;
    label: string;
    definition: ReportDefinition;
}

export interface ReportTemplate {
    id: string;
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
    definition: import('./report-definition-types').ReportDefinition;
    createdAt: string;
}

export interface ReportViewerProps {
    definition: ReportDefinition;
    datasourcePlugins: DatasourcePlugin[];
    parameterValues?: Record<string, unknown>;
    onParameterChange?: (values: Record<string, unknown>) => void;
    parameterPanel?: {
        mode: 'popover' | 'docked';
        position?: 'left' | 'right' | 'top';
    };
    subReportDefinitions?: SubReportDefinition[];
    onColumnResize?: (componentId: string, columnId: string, width: number) => void;
    onColumnReorder?: (componentId: string, columnIds: string[]) => void;
    onDrillThrough?: (parameterName: string, value: unknown) => void;
    onCellEdit?: (componentId: string, rowIndex: number, field: string, value: unknown) => void;
    syncParamsToHash?: boolean;
    hideToolbar?: boolean;
    viewerRef?: React.Ref<ReportViewerHandle>;
    className?: string;
    style?: React.CSSProperties;
}

export interface ReportViewerHandle {
    exportPdf: () => Promise<void>;
    print: () => void;
    refresh: () => void;
}
