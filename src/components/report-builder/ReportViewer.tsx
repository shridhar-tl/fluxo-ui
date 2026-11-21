import classNames from 'classnames';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import '../eui-base.scss';
import './report-viewer.scss';
import { DownloadIcon, PrintIcon, RefreshIcon, SettingsIcon } from '../../assets/icons';
import { builtInFieldsToExpressionContext, mergeBuiltInFields } from './built-in-fields';
import type { Dataset } from './report-builder-types';
import type { ReportViewerProps } from './report-builder-types';
import type { ParameterConfig, ReportComponent, VariableConfig } from './report-definition-types';
import { getPageDimensionsPx } from './report-definition-types';
import { evaluateExpression } from './expression/expression-parser';
import { ParameterOptionsContext } from './components/ParameterOptionsContext';
import type { ParameterOptionsContextValue } from './components/ParameterOptionsContext';
import { ParameterPanel } from './components/ParameterPanel';
import { ComponentRenderer } from './viewer/ComponentRenderer';
import { inheritedToConfig } from './data/core-plugins';
import { resolveDatasources } from './data/datasource-engine';
import { validateAllParameters } from './parameter-validation';
import { downloadReportPdf, printReport, waitForStableContent } from './viewer/pdf-export';
import { ViewerContext } from './viewer/ViewerExpressionContext';

type ExportKind = 'pdf' | 'print';

function waitForCommit(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

function collectComponentVariables(
    components: ReportComponent[],
    out: Array<{ componentId: string; variables: VariableConfig[] }> = [],
): Array<{ componentId: string; variables: VariableConfig[] }> {
    for (const comp of components) {
        if (comp.variables && comp.variables.length > 0) {
            out.push({ componentId: comp.id, variables: comp.variables });
        }
        if (comp.children && comp.children.length > 0) {
            collectComponentVariables(comp.children, out);
        }
    }
    return out;
}

async function evaluateDefaultValue(
    raw: string | undefined,
    builtInFields?: Record<string, unknown>,
): Promise<unknown> {
    if (raw === undefined || raw === '') return undefined;
    if (raw.startsWith('=')) {
        const { result } = await evaluateExpression(raw.slice(1), { parameters: {}, builtInFields });
        return result;
    }
    return raw;
}

function seedParameterValues(parameters: ParameterConfig[], external: Record<string, unknown> | undefined): Record<string, unknown> {
    const seeded: Record<string, unknown> = {};
    for (const p of parameters) {
        if (p.defaultValue !== undefined) seeded[p.id] = p.defaultValue;
    }
    return { ...seeded, ...(external ?? {}) };
}

function hasInvalidParameters(parameters: ParameterConfig[], values: Record<string, unknown>): boolean {
    return Object.keys(validateAllParameters(parameters, values)).length > 0;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
    definition,
    datasourcePlugins,
    parameterPlugins,
    componentPlugins,
    resolveSubReport,
    parameterValues: externalParamValues,
    onParameterChange,
    parameterPanel,
    subReportDefinitions,
    builtInFields,
    onColumnResize,
    onColumnReorder,
    onDrillThrough,
    onCellEdit,
    syncParamsToHash,
    hideToolbar,
    viewerRef,
    className,
    style,
}) => {
    const [datasources, setDatasources] = useState<Record<string, Dataset>>({});
    const [loadingDs, setLoadingDs] = useState<Set<string>>(new Set());
    const [errorDs, setErrorDs] = useState<Map<string, string>>(new Map());
    const [paramValues, setParamValues] = useState<Record<string, unknown>>(() => seedParameterValues(definition.parameters, externalParamValues));
    const [globalVariableValues, setGlobalVariableValues] = useState<Record<string, unknown>>({});
    const [componentVariableValues, setComponentVariableValues] = useState<Record<string, Record<string, unknown>>>({});
    const [showParams, setShowParams] = useState(() => hasInvalidParameters(definition.parameters, seedParameterValues(definition.parameters, externalParamValues)));
    const [renderKey, setRenderKey] = useState(0);
    const [exporting, setExporting] = useState<ExportKind | null>(null);
    const [exportError, setExportError] = useState<string | null>(null);
    const exportingRef = useRef(false);
    const prevParamRef = useRef(externalParamValues);
    const contentRef = useRef<HTMLDivElement>(null);

    const globalVariables = definition.variables ?? [];
    const componentScopes = useMemo(
        () => collectComponentVariables(definition.components),
        [definition.components],
    );

    const mergedBuiltInFields = useMemo(
        () => builtInFieldsToExpressionContext(mergeBuiltInFields(builtInFields)),
        [builtInFields],
    );

    const globalVariableNames = useMemo(
        () => new Set(globalVariables.map((v) => v.name)),
        [globalVariables],
    );

    useEffect(() => {
        let cancelled = false;
        const seedGlobalDefaults = async () => {
            const seeded: Record<string, unknown> = {};
            for (const v of globalVariables) {
                seeded[v.name] = await evaluateDefaultValue(v.defaultValueExpression, mergedBuiltInFields);
            }
            if (cancelled) return;
            setGlobalVariableValues((prev) => {
                const next = { ...seeded };
                for (const k of Object.keys(prev)) {
                    if (Object.prototype.hasOwnProperty.call(seeded, k)) {
                        next[k] = prev[k];
                    }
                }
                return next;
            });
        };
        seedGlobalDefaults();
        return () => { cancelled = true; };
    }, [globalVariables, mergedBuiltInFields]);

    useEffect(() => {
        let cancelled = false;
        const seedComponentDefaults = async () => {
            const seeded: Record<string, Record<string, unknown>> = {};
            for (const { componentId, variables } of componentScopes) {
                const bucket: Record<string, unknown> = {};
                for (const v of variables) {
                    bucket[v.name] = await evaluateDefaultValue(v.defaultValueExpression, mergedBuiltInFields);
                }
                seeded[componentId] = bucket;
            }
            if (cancelled) return;
            setComponentVariableValues((prev) => {
                const next: Record<string, Record<string, unknown>> = {};
                for (const cid of Object.keys(seeded)) {
                    const seedBucket = seeded[cid];
                    const prevBucket = prev[cid] ?? {};
                    const merged: Record<string, unknown> = { ...seedBucket };
                    for (const name of Object.keys(prevBucket)) {
                        if (Object.prototype.hasOwnProperty.call(seedBucket, name)) {
                            merged[name] = prevBucket[name];
                        }
                    }
                    next[cid] = merged;
                }
                return next;
            });
        };
        seedComponentDefaults();
        return () => { cancelled = true; };
    }, [componentScopes, mergedBuiltInFields]);

    useEffect(() => {
        if (externalParamValues && externalParamValues !== prevParamRef.current) {
            prevParamRef.current = externalParamValues;
            setParamValues(externalParamValues);
        }
    }, [externalParamValues]);

    useEffect(() => {
        if (!syncParamsToHash) return;
        try {
            const hash = window.location.hash.slice(1);
            if (hash) {
                const decoded = JSON.parse(decodeURIComponent(hash));
                if (typeof decoded === 'object' && decoded !== null) {
                    setParamValues((prev) => ({ ...prev, ...decoded }));
                }
            }
        } catch {
            // ignore invalid hash
        }
    }, [syncParamsToHash]);

    useEffect(() => {
        if (!syncParamsToHash) return;
        const keys = Object.keys(paramValues);
        if (keys.length === 0) return;
        try {
            window.location.hash = encodeURIComponent(JSON.stringify(paramValues));
        } catch {
            // ignore serialization errors
        }
    }, [syncParamsToHash, paramValues]);

    const fetchAbortRef = useRef<AbortController | null>(null);
    const needsParameters = useMemo(
        () => hasInvalidParameters(definition.parameters, paramValues),
        [definition.parameters, paramValues],
    );
    const parentContext = definition.parentContext;
    const inheritedConfigs = useMemo(
        () => (parentContext ? parentContext.datasources.map(inheritedToConfig) : []),
        [parentContext],
    );

    const fetchDatasources = useCallback(async () => {
        fetchAbortRef.current?.abort();
        const dsConfigs = definition.datasources;
        if (dsConfigs.length === 0 || needsParameters) {
            setDatasources({});
            setErrorDs(new Map());
            setLoadingDs(new Set());
            return;
        }
        const controller = new AbortController();
        fetchAbortRef.current = controller;

        const paramsByName: Record<string, unknown> = {};
        for (const p of definition.parameters) {
            paramsByName[p.name] = paramValues[p.id] ?? p.defaultValue;
        }

        setLoadingDs(new Set(dsConfigs.map((d) => d.id)));
        setErrorDs(new Map());

        const { datasets, errors } = await resolveDatasources({
            configs: dsConfigs,
            plugins: datasourcePlugins,
            parameters: paramsByName,
            builtInFields: mergedBuiltInFields,
            inherited: inheritedConfigs.length > 0 ? { configs: inheritedConfigs, datasets: {} } : undefined,
            signal: controller.signal,
        });
        if (controller.signal.aborted) return;

        setDatasources(datasets);
        setErrorDs(errors);
        setLoadingDs(new Set());
    }, [definition.datasources, definition.parameters, datasourcePlugins, paramValues, mergedBuiltInFields, needsParameters, inheritedConfigs]);

    useEffect(() => {
        fetchDatasources();
        return () => fetchAbortRef.current?.abort();
    }, [fetchDatasources]);

    const handleParamChange = useCallback((values: Record<string, unknown>) => {
        setParamValues(values);
        onParameterChange?.(values);
    }, [onParameterChange]);

    const handleRefresh = useCallback(() => {
        setRenderKey((k) => k + 1);
        fetchDatasources();
    }, [fetchDatasources]);

    const runExport = useCallback(async (kind: ExportKind, task: (element: HTMLElement) => Promise<void>) => {
        if (exportingRef.current || !contentRef.current) return;
        exportingRef.current = true;
        setExportError(null);
        setExporting(kind);
        try {
            await waitForCommit();
            const element = contentRef.current;
            if (!element) return;
            await waitForStableContent(element);
            await task(element);
        } catch (err) {
            setExportError(err instanceof Error ? err.message : String(err));
        } finally {
            exportingRef.current = false;
            setExporting(null);
        }
    }, []);

    const reportTitle = definition.metadata.title;
    const pageSetup = definition.globalStyles.pageSetup;

    const handleExportPdf = useCallback(() => runExport('pdf', (element) => downloadReportPdf(element, {
        title: reportTitle,
        filename: `${reportTitle || 'report'}.pdf`,
        pageSetup,
    })), [runExport, reportTitle, pageSetup]);

    const handlePrint = useCallback(() => runExport('print', (element) => printReport(element, reportTitle, pageSetup)), [runExport, reportTitle, pageSetup]);

    const writeGlobalVariable = useCallback((variableName: string, value: unknown) => {
        setGlobalVariableValues((prev) => ({ ...prev, [variableName]: value }));
    }, []);

    const writeComponentVariable = useCallback((componentId: string, variableName: string, value: unknown) => {
        setComponentVariableValues((prev) => ({
            ...prev,
            [componentId]: { ...(prev[componentId] ?? {}), [variableName]: value },
        }));
    }, []);

    const writeVariableByName = useCallback((variableName: string, value: unknown) => {
        if (globalVariableNames.has(variableName)) {
            writeGlobalVariable(variableName, value);
            return;
        }
        for (const { componentId, variables } of componentScopes) {
            if (variables.some((v) => v.name === variableName)) {
                writeComponentVariable(componentId, variableName, value);
                return;
            }
        }
        writeGlobalVariable(variableName, value);
    }, [globalVariableNames, componentScopes, writeGlobalVariable, writeComponentVariable]);

    const handleSetVariable = useCallback((variableName: string, value: unknown) => {
        writeVariableByName(variableName, value);
    }, [writeVariableByName]);

    const handleDrillThrough = useCallback((variableName: string, value: unknown) => {
        writeVariableByName(variableName, value);
        onDrillThrough?.(variableName, value);
    }, [writeVariableByName, onDrillThrough]);

    const notifyVariableChange = useCallback((variableName: string, value: unknown) => {
        onDrillThrough?.(variableName, value);
    }, [onDrillThrough]);

    const hasAnyParams = definition.parameters.length > 0;
    const paramValuesRef = useRef(paramValues);
    paramValuesRef.current = paramValues;

    useImperativeHandle(viewerRef, () => ({
        exportPdf: handleExportPdf,
        print: handlePrint,
        refresh: handleRefresh,
        showParameters: () => {
            if (definition.parameters.length > 0) setShowParams(true);
        },
        getParameters: () => ({ ...paramValuesRef.current }),
        hasParameters: () => hasAnyParams,
    }), [handleExportPdf, handlePrint, handleRefresh, definition.parameters.length, hasAnyParams]);

    const parametersByName = useMemo(() => {
        const out: Record<string, unknown> = {};
        for (const p of definition.parameters) {
            out[p.name] = paramValues[p.id] ?? p.defaultValue;
        }
        return out;
    }, [definition.parameters, paramValues]);

    const viewerCtx = useMemo(() => ({
        datasources,
        parameters: parametersByName,
        variables: globalVariableValues,
        builtInFields: mergedBuiltInFields,
        variableScopeChain: [],
        globalVariableNames,
        componentVariableValues,
        loadingDatasources: loadingDs,
        errorDatasources: errorDs,
        datasourceConfigs: definition.datasources,
        subReportDefinitions,
        resolveSubReport,
        subReportChain: [definition.id],
        datasourcePlugins,
        componentPlugins,
        onColumnResize,
        onColumnReorder,
        onDrillThrough: handleDrillThrough,
        onSetVariable: handleSetVariable,
        notifyVariableChange,
        writeGlobalVariable,
        writeComponentVariable,
        onCellEdit,
        exportMode: exporting !== null,
    }), [exporting, datasources, parametersByName, globalVariableValues, mergedBuiltInFields, globalVariableNames, componentVariableValues, loadingDs, errorDs, definition.datasources, subReportDefinitions, datasourcePlugins, componentPlugins, onColumnResize, onColumnReorder, handleDrillThrough, handleSetVariable, notifyVariableChange, writeGlobalVariable, writeComponentVariable, onCellEdit, resolveSubReport, definition.id]);

    const paramOptionsCtx = useMemo<ParameterOptionsContextValue>(() => ({
        datasources,
        getOptions: (datasetId, displayField, valueField, staticOptions) => {
            if (!datasetId) return staticOptions ?? [];
            const cfg = definition.datasources.find((d) => d.id === datasetId);
            const ds = cfg ? datasources[cfg.name] : undefined;
            if (!ds) return staticOptions ?? [];
            const df = displayField;
            const vf = valueField ?? displayField;
            if (!df) return staticOptions ?? [];
            return ds.rows.map((row) => ({
                label: String(row[df] ?? ''),
                value: vf ? row[vf] : row[df],
            }));
        },
    }), [datasources, definition.datasources]);

    const hasParams = definition.parameters.length > 0;
    const panelMode = parameterPanel?.mode ?? 'docked';
    const panelPos = parameterPanel?.position ?? 'left';

    const toolbar = (
        <div
            className="eui-rv-toolbar"
            role="toolbar"
            aria-label="Report Viewer Toolbar"
        >
            <span className="eui-rv-toolbar-title">{definition.metadata.title}</span>
            <div style={{ flex: 1 }} />
            {hasParams && (
                <button
                    className="eui-rv-tool-btn"
                    onClick={() => setShowParams((v) => !v)}
                    aria-pressed={showParams}
                    title="Parameters"
                    aria-label="Toggle parameters panel"
                >
                    <SettingsIcon aria-hidden="true" />
                    Parameters
                </button>
            )}
            <button
                className="eui-rv-tool-btn"
                onClick={handlePrint}
                disabled={exporting !== null}
                title="Print"
                aria-label="Print report"
            >
                <PrintIcon aria-hidden="true" />
                Print
            </button>
            <button
                className="eui-rv-tool-btn"
                onClick={handleExportPdf}
                disabled={exporting !== null}
                title="Export PDF"
                aria-label="Export report as PDF"
            >
                <DownloadIcon aria-hidden="true" />
                {exporting === 'pdf' ? 'Exporting...' : 'PDF'}
            </button>
            <button
                className="eui-rv-tool-btn"
                onClick={handleRefresh}
                title="Reload"
                aria-label="Reload report"
            >
                <RefreshIcon aria-hidden="true" />
                Reload
            </button>
        </div>
    );

    const hasErrors = errorDs.size > 0;
    const isLoading = loadingDs.size > 0;

    const canvas = (
        <div className="eui-rv-canvas">
            {hasErrors && (
                <div
                    className="eui-rv-ds-errors"
                    role="alert"
                    aria-live="polite"
                >
                    {Array.from(errorDs.entries()).map(([id, msg]) => {
                        const ds = definition.datasources.find((d) => d.id === id);
                        return (
                            <div key={id} className="eui-rv-ds-error">
                                <strong>{ds?.name ?? id}:</strong> {msg}
                            </div>
                        );
                    })}
                </div>
            )}
            {exportError && (
                <div className="eui-rv-ds-errors" role="alert">
                    <div className="eui-rv-ds-error">
                        <strong>Export failed:</strong> {exportError}
                    </div>
                </div>
            )}
            {needsParameters && hasParams && (
                <div className="eui-rv-info" role="note">
                    Enter the required parameters to run this report.
                    {!showParams && (
                        <button type="button" className="eui-rv-info-action" onClick={() => setShowParams(true)}>
                            Enter parameters
                        </button>
                    )}
                </div>
            )}
            {definition.parentContext && definition.parentContext.datasources.length > 0 && (
                <div className="eui-rv-info" role="note">
                    Some data of this report is supplied by "{definition.parentContext.reportTitle}". Open that report to see the complete data.
                </div>
            )}
            {isLoading && (
                <div className="eui-rv-loading-bar" aria-hidden="true" />
            )}
            <div
                className="eui-rv-content"
                ref={contentRef}
                style={definition.globalStyles.pageSetup ? {
                    maxWidth: getPageDimensionsPx(definition.globalStyles.pageSetup).width,
                    margin: '0 auto',
                    padding: (() => {
                        const ps = definition.globalStyles.pageSetup;
                        const mmToPx = 96 / 25.4;
                        return `${Math.round((ps.marginTop ?? 10) * mmToPx)}px ${Math.round((ps.marginRight ?? 10) * mmToPx)}px ${Math.round((ps.marginBottom ?? 10) * mmToPx)}px ${Math.round((ps.marginLeft ?? 10) * mmToPx)}px`;
                    })(),
                } : undefined}
            >
                <ViewerContext.Provider value={viewerCtx}>
                    {definition.components.map((comp) => (
                        <ComponentRenderer key={`${comp.id}-${renderKey}`} component={comp} />
                    ))}
                    {definition.components.length === 0 && (
                        <div className="eui-rv-empty">No components to display.</div>
                    )}
                </ViewerContext.Provider>
            </div>
        </div>
    );

    const paramsPanel = (
        <ViewerContext.Provider value={viewerCtx}>
            <ParameterOptionsContext.Provider value={paramOptionsCtx}>
                <ParameterPanel
                    parameterPlugins={parameterPlugins}
                    parameters={definition.parameters}
                    values={paramValues}
                    onChange={handleParamChange}
                    onApply={(vals) => { handleParamChange(vals); setShowParams(false); }}
                    mode={panelMode === 'docked' ? 'docked' : 'popover'}
                    isOpen={showParams}
                    onClose={() => setShowParams(false)}
                />
            </ParameterOptionsContext.Provider>
        </ViewerContext.Provider>
    );

    return (
        <div
            className={classNames('eui-report-viewer', className)}
            style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', background: 'var(--eui-bg)', ...style }}
            role="main"
            aria-label={`Report: ${definition.metadata.title}`}
        >
            {!hideToolbar && toolbar}
            <div className="eui-rv-body">
                {panelMode === 'docked' && showParams && panelPos === 'left' && (
                    <div className="eui-rv-side-panel">{paramsPanel}</div>
                )}
                {canvas}
                {panelMode === 'docked' && showParams && panelPos === 'right' && (
                    <div className="eui-rv-side-panel">{paramsPanel}</div>
                )}
            </div>
            {panelMode === 'popover' && showParams && paramsPanel}
        </div>
    );
};

ReportViewer.displayName = 'ReportViewer';
