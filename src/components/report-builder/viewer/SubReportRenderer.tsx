import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Dataset } from '../report-builder-types';
import type { DerivedDatasourceConfig, ReportComponent, SubReportComponentProps } from '../report-definition-types';
import { evaluateExpression } from '../expression/expression-parser';
import { ComponentRenderer } from './ComponentRenderer';
import { processDerivedDatasource } from './DerivedDatasourceProcessor';
import { ViewerContext, useViewerContext, buildExpressionDatasources } from './ViewerExpressionContext';

interface Props {
    component: ReportComponent;
    styleCss: React.CSSProperties;
}

export const SubReportRenderer: React.FC<Props> = ({ component, styleCss }) => {
    const parentCtx = useViewerContext();
    const p = component.props as unknown as SubReportComponentProps;

    const subDef = useMemo(
        () => parentCtx.subReportDefinitions?.find((sr) => sr.id === p.subReportId),
        [parentCtx.subReportDefinitions, p.subReportId],
    );

    const [datasources, setDatasources] = useState<Record<string, Dataset>>({});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Map<string, string>>(new Map());

    const resolvedParams = useResolvedParams(p.parameterMap ?? {}, parentCtx);

    const fetchDatasources = useCallback(async () => {
        if (!subDef) return;
        const dsConfigs = subDef.definition.datasources;
        if (dsConfigs.length === 0) return;

        setLoading(true);
        const results: Record<string, Dataset> = {};
        const errs = new Map<string, string>();
        const plugins = parentCtx.datasourcePlugins ?? [];

        const regularDs = dsConfigs.filter((d) => d.type !== 'derived');
        const derivedDs = dsConfigs.filter((d) => d.type === 'derived');

        await Promise.allSettled(
            regularDs.map(async (dsConfig) => {
                const plugin = plugins.find((pl) => pl.type === dsConfig.type);
                if (!plugin) {
                    errs.set(dsConfig.id, `No plugin for type "${dsConfig.type}"`);
                    return;
                }
                try {
                    const data = await plugin.fetch(dsConfig.config, resolvedParams);
                    results[dsConfig.name] = data;
                } catch (err) {
                    errs.set(dsConfig.id, err instanceof Error ? err.message : String(err));
                }
            }),
        );

        const nameById: Record<string, string> = {};
        for (const ds of dsConfigs) nameById[ds.id] = ds.name;

        for (const dsConfig of derivedDs) {
            try {
                const derivedCfg = dsConfig.config as unknown as DerivedDatasourceConfig;
                const data = await processDerivedDatasource(derivedCfg, results, nameById, resolvedParams);
                results[dsConfig.name] = data;
            } catch (err) {
                errs.set(dsConfig.id, err instanceof Error ? err.message : String(err));
            }
        }

        setDatasources(results);
        setErrors(errs);
        setLoading(false);
    }, [subDef, parentCtx.datasourcePlugins, resolvedParams]);

    useEffect(() => {
        fetchDatasources();
    }, [fetchDatasources]);

    if (!subDef) {
        const label = p.subReportId ?? 'Unknown';
        return (
            <div
                style={{
                    padding: '16px',
                    background: 'var(--eui-bg-subtle)',
                    border: '1px solid var(--eui-border-subtle)',
                    borderRadius: 6,
                    color: 'var(--eui-text-muted)',
                    fontSize: 13,
                    fontStyle: 'italic',
                    ...styleCss,
                }}
                role="region"
                aria-label={`Sub-report: ${label}`}
            >
                Sub-report definition not found: <strong style={{ fontStyle: 'normal' }}>{label}</strong>
            </div>
        );
    }

    const childCtx: ViewerContext = {
        datasources,
        parameters: resolvedParams,
        loadingDatasources: loading ? new Set(subDef.definition.datasources.map((d) => d.id)) : new Set(),
        errorDatasources: errors,
        datasourceConfigs: subDef.definition.datasources,
        subReportDefinitions: parentCtx.subReportDefinitions,
        datasourcePlugins: parentCtx.datasourcePlugins,
    };

    return (
        <div
            style={{
                border: '1px solid var(--eui-border-subtle)',
                borderRadius: 6,
                overflow: 'hidden',
                ...styleCss,
            }}
            role="region"
            aria-label={`Sub-report: ${subDef.label}`}
        >
            {errors.size > 0 && (
                <div style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.06)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
                    {Array.from(errors.entries()).map(([id, msg]) => (
                        <div key={id} style={{ fontSize: 11, color: '#ef4444' }}>{msg}</div>
                    ))}
                </div>
            )}
            {loading && (
                <div className="eui-rv-loading-bar" aria-hidden="true" />
            )}
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <ViewerContext.Provider value={childCtx}>
                    {subDef.definition.components.map((comp) => (
                        <ComponentRenderer key={comp.id} component={comp} />
                    ))}
                    {subDef.definition.components.length === 0 && (
                        <div style={{ color: 'var(--eui-text-muted)', fontSize: 12, fontStyle: 'italic', textAlign: 'center', padding: 16 }}>
                            Sub-report has no components.
                        </div>
                    )}
                </ViewerContext.Provider>
            </div>
        </div>
    );
};

function useResolvedParams(
    parameterMap: Record<string, string>,
    parentCtx: ViewerContext,
): Record<string, unknown> {
    const [resolved, setResolved] = useState<Record<string, unknown>>({});

    const mapEntries = useMemo(() => Object.entries(parameterMap), [parameterMap]);
    const exprDs = useMemo(() => buildExpressionDatasources(parentCtx.datasources), [parentCtx.datasources]);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            const result: Record<string, unknown> = {};
            for (const [key, value] of mapEntries) {
                if (value.startsWith('=')) {
                    const { result: val } = await evaluateExpression(value.slice(1), {
                        datasources: exprDs,
                        parameters: parentCtx.parameters,
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
    }, [mapEntries, exprDs, parentCtx.parameters]);

    return resolved;
}
