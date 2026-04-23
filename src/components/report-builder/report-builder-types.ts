import type React from 'react';
import type { SVGIcon } from '../../assets/icons';
import type { BuiltInFieldDefinition } from './built-in-fields';
import type { ReportDefinition } from './report-definition-types';

export type SelectedItemType = 'none' | 'datasource' | 'parameter' | 'variable' | 'report-settings' | 'component';

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
    /**
     * Optional design-time schema introspection. Called by the Datasource Explorer to show
     * available fields without running the full `fetch` (which may hit the network).
     *
     * Implementations should be cheap: parse whatever local buffer the config contains (pasted
     * JSON, CSV text, cached sample), sample at most a handful of rows, and return the derived
     * fields. Return an empty array (or throw) when the config has nothing to introspect.
     *
     * Plugins that have no local buffer (HTTP, Jira) should leave this unimplemented — the
     * explorer falls back to "configure + fetch to see fields".
     */
    inferSchema?: (config: Record<string, unknown>) => DatasetField[] | Promise<DatasetField[]>;
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
    /**
     * Per-instance built-in fields. Merged with anything registered via `initReportBuilder`;
     * entries declared here win over the library-wide registry when names collide. Presented
     * to authors under the `BuiltInFields.*` namespace in expressions and in the builder's
     * Global Fields panel.
     */
    builtInFields?: BuiltInFieldDefinition[];
    /** Imperative handle. Lets hosts pull the current definition, parameter state, etc. */
    builderRef?: React.Ref<ReportBuilderHandle>;
    breakpoints?: Array<{ key: string; maxWidth: number; label: string }>;
    panelConfig?: {
        toolbox?: ReportBuilderPanelConfig;
        datasource?: ReportBuilderPanelConfig;
        parameters?: ReportBuilderPanelConfig;
        variables?: ReportBuilderPanelConfig;
        builtInFields?: ReportBuilderPanelConfig;
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
    /** Per-instance built-in fields. Merged with `initReportBuilder({ builtInFields })` registrations. */
    builtInFields?: BuiltInFieldDefinition[];
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
    /** Opens the parameter panel programmatically. No-op if the report has no parameters. */
    showParameters: () => void;
    /** Returns the current parameter values keyed by parameter id. */
    getParameters: () => Record<string, unknown>;
    /** Whether the definition declares any parameters. */
    hasParameters: () => boolean;
}

export interface ReportBuilderHandle {
    /** Returns the current in-memory `ReportDefinition` as a structurally-cloned snapshot. */
    getReportDefinition: () => ReportDefinition;
    /** Replaces the definition. Equivalent to passing a new value through the `definition` prop. */
    setReportDefinition: (definition: ReportDefinition) => void;
}
