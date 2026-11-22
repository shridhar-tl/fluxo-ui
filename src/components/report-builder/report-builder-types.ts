import type React from 'react';
import type { SVGIcon } from '../../assets/icons';
import type { BuiltInFieldDefinition } from './built-in-fields';
import type { DatasetField, DatasourceConfig, ParameterConfig, ReportComponent, ReportDefinition, ReportParentContext } from './report-definition-types';

export type SelectedItemType = 'none' | 'datasource' | 'parameter' | 'variable' | 'report-settings' | 'component';

export interface ReportBuilderState {
    definition: ReportDefinition;
    selectedItemId: string | null;
    selectedItemType: SelectedItemType;
}

export type { DatasetField } from './report-definition-types';

export interface Dataset {
    rows: Record<string, unknown>[];
    fields: DatasetField[];
}

export interface DatasourceConfigUIProps {
    datasourceId: string;
    config: Record<string, unknown>;
    onChange: (config: Record<string, unknown>) => void;
    datasources: DatasourceConfig[];
    parameters: ParameterConfig[];
}

export interface DatasourceFetchContext {
    /** Parameter values keyed by parameter name. */
    parameters: Record<string, unknown>;
    /** Datasets already resolved for this report, keyed by datasource name. Includes every declared dependency. */
    datasources: Record<string, Dataset>;
    /** Looks up a resolved dataset by datasource id. */
    getDataset: (datasourceId: string) => Dataset | undefined;
    getDatasourceName: (datasourceId: string) => string;
    builtInFields: Record<string, unknown>;
    /** Evaluates an expression against the report's parameters, datasets and built-in fields. */
    evaluate: (expression: string, currentRow?: Record<string, unknown>) => Promise<unknown>;
    /** Replaces every `{{ expression }}` segment of the template with its evaluated value. */
    interpolate: (template: string, format?: (value: unknown) => string) => Promise<string>;
    signal: AbortSignal;
}

export interface DatasourceSchemaContext {
    datasources: DatasourceConfig[];
    /** Resolves the design-time fields of another datasource of the same report. */
    resolveFields: (datasourceId: string) => Promise<DatasetField[]>;
}

export interface DatasourceConfigureRequest {
    mode: 'create' | 'edit';
    datasource: DatasourceConfig;
    datasources: DatasourceConfig[];
    parameters: ParameterConfig[];
    builtInFields: BuiltInFieldDefinition[];
}

export interface DatasourceConfigureResult {
    config: Record<string, unknown>;
    name?: string;
    description?: string;
    cachedSchema?: DatasetField[];
}

export interface DatasourcePlugin {
    type: string;
    name: string;
    description: string;
    icon: SVGIcon;
    /** Groups plugins in the "Add datasource" picker. */
    category?: string;
    /** Inline editor rendered in the Properties panel when the datasource is selected. */
    ConfigUI?: React.ComponentType<DatasourceConfigUIProps>;
    initialConfig: () => Record<string, unknown>;
    /**
     * Host-driven configuration flow. Called when the user adds a datasource of this type and when
     * they click "Configure" on an existing one. Resolve with the config to apply, or `null` to
     * cancel; cancelling a `create` request discards the new datasource.
     */
    configure?: (request: DatasourceConfigureRequest) => Promise<DatasourceConfigureResult | null>;
    /** One-line human readable summary of the config, shown in the Properties panel. */
    describe?: (config: Record<string, unknown>) => string;
    /** Ids of other datasources this one reads from. They are resolved before `fetch` runs. */
    getDependencies?: (config: Record<string, unknown>) => string[];
    fetch: (config: Record<string, unknown>, context: DatasourceFetchContext) => Promise<Dataset>;
    /**
     * Design-time schema introspection used by the Datasource Explorer, field pickers and expression
     * autocomplete. Must be cheap and must not hit the network. When omitted, the builder uses the
     * schema captured by the "Load fields" action (`DatasourceConfig.cachedSchema`).
     */
    inferSchema?: (config: Record<string, unknown>, context: DatasourceSchemaContext) => DatasetField[] | Promise<DatasetField[]>;
}

export interface ParameterConfigUIProps {
    config: Record<string, unknown>;
    onChange: (config: Record<string, unknown>) => void;
}

export interface ParameterRuntimeUIProps {
    id: string;
    value: unknown;
    onChange: (value: unknown) => void;
    config: Record<string, unknown>;
    allowMultiple?: boolean;
    disabled?: boolean;
    ariaLabel: string;
}

export interface CustomParameterPlugin {
    type: string;
    name: string;
    ConfigUI?: React.ComponentType<ParameterConfigUIProps>;
    RuntimeUI: React.ComponentType<ParameterRuntimeUIProps>;
    initialTypeConfig: () => Record<string, unknown>;
    /** Whether the parameter designer offers the "Allow multiple" switch for this type. */
    supportsMultiple?: boolean;
    serialize: (value: unknown) => string;
    deserialize: (str: string) => unknown;
    validate?: (value: unknown, config: Record<string, unknown>) => string[] | null;
}

export interface AvailableSubReport {
    id: string;
    label: string;
    parameters?: Array<{ name: string; label: string; type?: string }>;
}

export interface SubReportHooks {
    /** Loads the definition of a sub-report. Used for rendering, parameter mapping and nested editing. */
    resolveSubReport?: (subReportId: string) => Promise<ReportDefinition | null>;
    /** Persists a sub-report edited from inside the parent builder. */
    onSaveSubReport?: (subReportId: string, definition: ReportDefinition) => Promise<void>;
    /** Persists a sub-report created from inside the parent builder and returns its listing entry. */
    onCreateSubReport?: (definition: ReportDefinition) => Promise<AvailableSubReport>;
}

export interface ReportBuilderPanelConfig {
    userCanMove?: boolean;
    userCanClose?: boolean;
}

export interface ReportComponentDesignProps {
    component: ReportComponent;
}

export interface ReportComponentPropsPanelProps {
    component: ReportComponent;
    /** Merges the patch into the component's props. */
    onChange: (patch: Record<string, unknown>) => void;
    /** Datasources the component can bind to: the report's own plus those supplied by a parent report. */
    datasources: DatasourceConfig[];
}

export interface ReportComponentRenderProps {
    component: ReportComponent;
    /** CSS resolved from the component's style properties. */
    style: React.CSSProperties;
    /** Rows of a datasource by id; empty while it loads or when it failed. */
    getRows: (datasourceId: string | undefined) => Record<string, unknown>[];
    isLoading: (datasourceId: string | undefined) => boolean;
    getError: (datasourceId: string | undefined) => string | undefined;
    /** Evaluates an expression in the component's scope. A row, when given, is available as `Field`. */
    evaluate: (expression: string, row?: Record<string, unknown>) => Promise<unknown>;
    /** True while the report is rendered for PDF export or printing; render everything without scrolling. */
    exportMode: boolean;
}

/** A report component supplied by the host application: listed in the toolbox, designed, configured and rendered like a built-in one. */
export interface ReportComponentPlugin {
    /** Unique component type stored in the definition. */
    type: string;
    label: string;
    /** Toolbox group the component is listed under. */
    category: string;
    icon: SVGIcon;
    description?: string;
    /** Props of a newly added component. */
    createProps: () => Record<string, unknown>;
    /** Preview shown in the design area. Defaults to an icon and label placeholder. */
    Design?: React.ComponentType<ReportComponentDesignProps>;
    Renderer: React.ComponentType<ReportComponentRenderProps>;
    /** Properties panel shown when the component is selected. */
    PropsPanel?: React.ComponentType<ReportComponentPropsPanelProps>;
}

export interface ReportBuilderProps extends SubReportHooks {
    definition?: ReportDefinition;
    onChange?: (definition: ReportDefinition) => void;
    datasourcePlugins?: DatasourcePlugin[];
    parameterPlugins?: CustomParameterPlugin[];
    /** Host-supplied report components. */
    componentPlugins?: ReportComponentPlugin[];
    availableSubReports?: AvailableSubReport[];
    /**
     * Parameters and datasources of the report that embeds this one as a sub-report. They are
     * available to this report at design time and are supplied by the parent at runtime.
     */
    parentContext?: ReportParentContext;
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
        functions?: ReportBuilderPanelConfig;
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
    parameterPlugins?: CustomParameterPlugin[];
    /** Host-supplied report components, rendered wherever the definition uses their type. */
    componentPlugins?: ReportComponentPlugin[];
    /** Loads sub-report definitions that are not listed in `subReportDefinitions`. */
    resolveSubReport?: (subReportId: string) => Promise<ReportDefinition | null>;
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
    print: () => Promise<void>;
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
