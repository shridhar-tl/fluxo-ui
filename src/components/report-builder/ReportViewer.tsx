import classNames from 'classnames';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { DownloadIcon, PrintIcon, RefreshIcon, SettingsIcon } from '../../assets/icons';
import type { Dataset } from './report-builder-types';
import type { ReportViewerProps } from './report-builder-types';
import type { DerivedDatasourceConfig } from './report-definition-types';
import { getPageDimensionsPx } from './report-definition-types';
import { ParameterPanel } from './components/ParameterPanel';
import { ComponentRenderer } from './viewer/ComponentRenderer';
import { processDerivedDatasource } from './viewer/DerivedDatasourceProcessor';
import { downloadReportPdf, printReport } from './viewer/pdf-export';
import { ViewerContext } from './viewer/ViewerExpressionContext';

export const ReportViewer: React.FC<ReportViewerProps> = ({
    definition,
    datasourcePlugins,
    parameterValues: externalParamValues,
    onParameterChange,
    parameterPanel,
    subReportDefinitions,
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
    const [paramValues, setParamValues] = useState<Record<string, unknown>>(externalParamValues ?? {});
    const [showParams, setShowParams] = useState(false);
    const [renderKey, setRenderKey] = useState(0);
    const [exporting, setExporting] = useState(false);
    const prevParamRef = useRef(externalParamValues);
    const contentRef = useRef<HTMLDivElement>(null);

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

    const fetchDatasources = useCallback(async () => {
        const dsConfigs = definition.datasources;
        if (dsConfigs.length === 0) return;

        const fetchingIds = new Set(dsConfigs.map((d) => d.id));
        setLoadingDs(fetchingIds);
        setErrorDs(new Map());

        const results: Record<string, Dataset> = {};
        const errors = new Map<string, string>();

        const regularDs = dsConfigs.filter((d) => d.type !== 'derived');
        const derivedDs = dsConfigs.filter((d) => d.type === 'derived');

        await Promise.allSettled(
            regularDs.map(async (dsConfig) => {
                const plugin = datasourcePlugins.find((p) => p.type === dsConfig.type);
                if (!plugin) {
                    errors.set(dsConfig.id, `No plugin found for type "${dsConfig.type}"`);
                    return;
                }
                try {
                    const data = await plugin.fetch(dsConfig.config, paramValues);
                    results[dsConfig.name] = data;
                } catch (err) {
                    errors.set(dsConfig.id, err instanceof Error ? err.message : String(err));
                }
            }),
        );

        const nameById: Record<string, string> = {};
        for (const ds of dsConfigs) {
            nameById[ds.id] = ds.name;
        }

        for (const dsConfig of derivedDs) {
            try {
                const derivedCfg = dsConfig.config as unknown as DerivedDatasourceConfig;
                const data = await processDerivedDatasource(derivedCfg, results, nameById, paramValues);
                results[dsConfig.name] = data;
            } catch (err) {
                errors.set(dsConfig.id, err instanceof Error ? err.message : String(err));
            }
        }

        setDatasources(results);
        setErrorDs(errors);
        setLoadingDs(new Set());
    }, [definition.datasources, datasourcePlugins, paramValues]);

    useEffect(() => {
        fetchDatasources();
    }, [fetchDatasources]);

    const handleParamChange = useCallback((values: Record<string, unknown>) => {
        setParamValues(values);
        onParameterChange?.(values);
    }, [onParameterChange]);

    const handleRefresh = useCallback(() => {
        setRenderKey((k) => k + 1);
        fetchDatasources();
    }, [fetchDatasources]);

    const handleExportPdf = useCallback(async () => {
        if (!contentRef.current || exporting) return;
        setExporting(true);
        try {
            await downloadReportPdf(contentRef.current, {
                title: definition.metadata.title,
                filename: `${definition.metadata.title || 'report'}.pdf`,
                pageSetup: definition.globalStyles.pageSetup,
            });
        } catch {
            // silently fail - html2canvas may not be available
        }
        setExporting(false);
    }, [definition.metadata.title, exporting]);

    const handlePrint = useCallback(() => {
        if (!contentRef.current) return;
        printReport(contentRef.current, definition.metadata.title, definition.globalStyles.pageSetup);
    }, [definition.metadata.title, definition.globalStyles.pageSetup]);

    const handleDrillThrough = useCallback((parameterName: string, value: unknown) => {
        const newParams = { ...paramValues, [parameterName]: value };
        setParamValues(newParams);
        onParameterChange?.(newParams);
        onDrillThrough?.(parameterName, value);
    }, [paramValues, onParameterChange, onDrillThrough]);

    useImperativeHandle(viewerRef, () => ({
        exportPdf: handleExportPdf,
        print: handlePrint,
        refresh: handleRefresh,
    }), [handleExportPdf, handlePrint, handleRefresh]);

    const viewerCtx = useMemo(() => ({
        datasources,
        parameters: paramValues,
        loadingDatasources: loadingDs,
        errorDatasources: errorDs,
        datasourceConfigs: definition.datasources,
        subReportDefinitions,
        datasourcePlugins,
        onColumnResize,
        onColumnReorder,
        onDrillThrough: handleDrillThrough,
        onCellEdit,
    }), [datasources, paramValues, loadingDs, errorDs, definition.datasources, subReportDefinitions, datasourcePlugins, onColumnResize, onColumnReorder, handleDrillThrough, onCellEdit]);

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
                title="Print"
                aria-label="Print report"
            >
                <PrintIcon aria-hidden="true" />
                Print
            </button>
            <button
                className="eui-rv-tool-btn"
                onClick={handleExportPdf}
                disabled={exporting}
                title="Export PDF"
                aria-label="Export report as PDF"
            >
                <DownloadIcon aria-hidden="true" />
                {exporting ? 'Exporting...' : 'PDF'}
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
            <ParameterPanel
                parameters={definition.parameters}
                values={paramValues}
                onChange={handleParamChange}
                onApply={(vals) => { handleParamChange(vals); setShowParams(false); }}
                mode={panelMode === 'docked' ? 'docked' : 'popover'}
                isOpen={showParams}
                onClose={() => setShowParams(false)}
            />
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
