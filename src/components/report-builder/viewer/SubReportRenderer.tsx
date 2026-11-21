import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import type { Dataset } from '../report-builder-types';
import type { DatasourceConfig, ReportComponent, ReportDefinition, SubReportComponentProps } from '../report-definition-types';
import { evaluateExpression } from '../expression/expression-parser';
import { inheritedDatasourceType } from '../data/core-plugins';
import { resolveDatasources } from '../data/datasource-engine';
import type { InheritedDatasets } from '../data/datasource-engine';
import { ComponentRenderer } from './ComponentRenderer';
import { ViewerContext, useViewerContext, buildExpressionDatasources } from './ViewerExpressionContext';

interface Props {
    component: ReportComponent;
    styleCss: React.CSSProperties;
}

const maxSubReportDepth = 8;

type DefinitionState =
    | { status: 'loading' }
    | { status: 'missing' }
    | { status: 'error'; message: string }
    | { status: 'ready'; definition: ReportDefinition };

function useSubReportDefinition(subReportId: string | undefined, parentCtx: ViewerContext): DefinitionState {
    const listed = useMemo(
        () => parentCtx.subReportDefinitions?.find((sr) => sr.id === subReportId)?.definition,
        [parentCtx.subReportDefinitions, subReportId],
    );
    const resolver = parentCtx.resolveSubReport;
    const [state, setState] = useState<DefinitionState>(() => (listed ? { status: 'ready', definition: listed } : { status: 'loading' }));

    useEffect(() => {
        if (listed) {
            setState({ status: 'ready', definition: listed });
            return;
        }
        if (!subReportId || !resolver) {
            setState({ status: 'missing' });
            return;
        }
        let cancelled = false;
        setState({ status: 'loading' });
        resolver(subReportId)
            .then((definition) => {
                if (cancelled) return;
                setState(definition ? { status: 'ready', definition } : { status: 'missing' });
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setState({ status: 'error', message: err instanceof Error ? err.message : String(err) });
            });
        return () => { cancelled = true; };
    }, [listed, subReportId, resolver]);

    return state;
}

function useResolvedParams(
    parameterMap: Record<string, string>,
    parentCtx: ViewerContext,
    definition: ReportDefinition | null,
): Record<string, unknown> | null {
    const [resolved, setResolved] = useState<Record<string, unknown> | null>(null);

    const mapEntries = useMemo(() => Object.entries(parameterMap), [parameterMap]);
    const exprDs = useMemo(() => buildExpressionDatasources(parentCtx.datasources), [parentCtx.datasources]);
    const parentParams = parentCtx.parameters;
    const parentVars = parentCtx.variables;
    const builtInFields = parentCtx.builtInFields;
    const currentRow = parentCtx.currentRow;

    useEffect(() => {
        if (!definition) {
            setResolved(null);
            return;
        }
        let cancelled = false;
        const run = async () => {
            const result: Record<string, unknown> = {};
            for (const p of definition.parameters) {
                if (p.defaultValue !== undefined) result[p.name] = p.defaultValue;
            }
            for (const p of definition.parentContext?.parameters ?? []) {
                if (Object.prototype.hasOwnProperty.call(parentParams, p.name)) result[p.name] = parentParams[p.name];
            }
            for (const p of definition.parameters) {
                if (Object.prototype.hasOwnProperty.call(parentParams, p.name)) result[p.name] = parentParams[p.name];
            }
            for (const [key, value] of mapEntries) {
                if (value === undefined || value === '') continue;
                if (typeof value === 'string' && value.startsWith('=')) {
                    const { result: val } = await evaluateExpression(value.slice(1), {
                        datasources: exprDs,
                        parameters: parentParams,
                        variables: parentVars,
                        builtInFields,
                        currentRow,
                    });
                    result[key] = val;
                } else {
                    result[key] = value;
                }
            }
            if (!cancelled) setResolved(result);
        };
        run();
        return () => { cancelled = true; };
    }, [definition, mapEntries, exprDs, parentParams, parentVars, builtInFields, currentRow]);

    return resolved;
}

function buildInheritedDatasets(
    definition: ReportDefinition,
    datasourceMap: Record<string, string>,
    parentConfigs: DatasourceConfig[],
    parentDatasets: Record<string, Dataset>,
    parentLoading: Set<string>,
): InheritedDatasets & { waiting: boolean } {
    const configs: DatasourceConfig[] = [];
    const datasets: Record<string, Dataset> = {};
    let waiting = false;
    for (const inherited of definition.parentContext?.datasources ?? []) {
        const mappedId = datasourceMap[inherited.id];
        const parentCfg = (mappedId ? parentConfigs.find((d) => d.id === mappedId) : undefined)
            ?? parentConfigs.find((d) => d.id === inherited.id)
            ?? parentConfigs.find((d) => d.name === inherited.name);
        configs.push({ id: inherited.id, name: inherited.name, type: inheritedDatasourceType, config: { fields: inherited.fields } });
        if (parentCfg && parentLoading.has(parentCfg.id)) waiting = true;
        const dataset = parentCfg ? parentDatasets[parentCfg.name] : undefined;
        if (dataset) datasets[inherited.name] = dataset;
    }
    return { configs, datasets, waiting };
}

const Notice: React.FC<{ styleCss: React.CSSProperties; label: string; children: React.ReactNode }> = ({ styleCss, label, children }) => (
    <div className="eui-rv-subreport-notice" style={styleCss} role="region" aria-label={`Sub-report: ${label}`}>
        {children}
    </div>
);

export const SubReportRenderer: React.FC<Props> = ({ component, styleCss }) => {
    const parentCtx = useViewerContext();
    const p = component.props as unknown as SubReportComponentProps;
    const defState = useSubReportDefinition(p.subReportId, parentCtx);
    const definition = defState.status === 'ready' ? defState.definition : null;
    const chain = useMemo(() => parentCtx.subReportChain ?? [], [parentCtx.subReportChain]);
    const isCycle = !!definition && (chain.includes(definition.id) || chain.length >= maxSubReportDepth);

    const [datasources, setDatasources] = useState<Record<string, Dataset>>({});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Map<string, string>>(new Map());

    const resolvedParams = useResolvedParams(p.parameterMap ?? {}, parentCtx, isCycle ? null : definition);
    const parentConfigs = parentCtx.datasourceConfigs;
    const parentDatasets = parentCtx.datasources;
    const parentLoading = parentCtx.loadingDatasources;
    const inherited = useMemo(
        () => (definition ? buildInheritedDatasets(definition, p.datasourceMap ?? {}, parentConfigs, parentDatasets, parentLoading) : null),
        [definition, p.datasourceMap, parentConfigs, parentDatasets, parentLoading],
    );

    useEffect(() => {
        if (!definition || !resolvedParams || !inherited || inherited.waiting || isCycle) return;
        const controller = new AbortController();
        setLoading(definition.datasources.length > 0);
        resolveDatasources({
            configs: definition.datasources,
            plugins: parentCtx.datasourcePlugins ?? [],
            parameters: resolvedParams,
            builtInFields: parentCtx.builtInFields ?? {},
            inherited,
            signal: controller.signal,
        }).then(({ datasets, errors: errs }) => {
            if (controller.signal.aborted) return;
            setDatasources(datasets);
            setErrors(errs);
            setLoading(false);
        });
        return () => controller.abort();
    }, [definition, resolvedParams, inherited, isCycle, parentCtx.datasourcePlugins, parentCtx.builtInFields]);

    const busy = loading || !!inherited?.waiting;

    const childCtx = useMemo<ViewerContext | null>(() => {
        if (!definition || !resolvedParams || !inherited) return null;
        return {
            ...parentCtx,
            datasources,
            parameters: resolvedParams,
            currentRow: undefined,
            loadingDatasources: busy ? new Set(definition.datasources.map((d) => d.id)) : new Set(),
            errorDatasources: errors,
            datasourceConfigs: [...inherited.configs, ...definition.datasources],
            subReportChain: [...chain, definition.id],
        };
    }, [definition, resolvedParams, inherited, parentCtx, datasources, busy, errors, chain]);

    const label = definition?.metadata.title ?? p.subReportId ?? 'Sub-report';

    if (!p.subReportId) {
        return <Notice styleCss={styleCss} label={label}>No sub-report selected.</Notice>;
    }
    if (defState.status === 'loading') {
        return <Notice styleCss={styleCss} label={label}><div className="eui-rv-loading-bar" aria-hidden="true" />Loading sub-report…</Notice>;
    }
    if (defState.status === 'missing') {
        return <Notice styleCss={styleCss} label={label}>The sub-report is not available.</Notice>;
    }
    if (defState.status === 'error') {
        return <Notice styleCss={styleCss} label={label}>The sub-report could not be loaded: {defState.message}</Notice>;
    }
    if (isCycle) {
        return <Notice styleCss={styleCss} label={label}>"{label}" is not rendered because it would include itself.</Notice>;
    }
    if (!childCtx || !definition) {
        return <Notice styleCss={styleCss} label={label}><div className="eui-rv-loading-bar" aria-hidden="true" /></Notice>;
    }

    return (
        <div
            className={classNames('eui-rv-subreport', { 'eui-rv-subreport-bordered': p.showBorder !== false })}
            style={styleCss}
            role="region"
            aria-label={`Sub-report: ${label}`}
            aria-busy={busy}
        >
            {errors.size > 0 && (
                <div className="eui-rv-subreport-errors" role="alert">
                    {Array.from(errors.entries()).map(([id, msg]) => (
                        <div key={id}>
                            <strong>{definition.datasources.find((d) => d.id === id)?.name ?? id}:</strong> {msg}
                        </div>
                    ))}
                </div>
            )}
            {busy && <div className="eui-rv-loading-bar" aria-hidden="true" />}
            <div className="eui-rv-subreport-body">
                <ViewerContext.Provider value={childCtx}>
                    {definition.components.map((comp) => (
                        <ComponentRenderer key={comp.id} component={comp} />
                    ))}
                    {definition.components.length === 0 && (
                        <div className="eui-rv-subreport-empty">Sub-report has no components.</div>
                    )}
                </ViewerContext.Provider>
            </div>
        </div>
    );
};
