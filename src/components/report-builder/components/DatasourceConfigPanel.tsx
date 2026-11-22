import React, { useCallback, useMemo, useState } from 'react';
import { DatabaseIcon, EditIcon, RefreshIcon } from '../../../assets/icons';
import { Button } from '../../Button';
import { TextInput } from '../../TextInput';
import { builtInFieldsToExpressionContext } from '../built-in-fields';
import { useBuilderDatasources, useDatasourceFields } from '../builder-hooks';
import { derivedDatasourceType, withCorePlugins } from '../data/core-plugins';
import { resolveDatasources } from '../data/datasource-engine';
import { findDependents } from '../data/datasource-naming';
import { inferFieldsFromRows, mergeFields } from '../dataset-schema';
import { useReportBuilderContext, useRBStore } from '../report-builder-context';
import type { DatasourcePlugin, ReportBuilderState } from '../report-builder-types';
import type { DatasourceConfig } from '../report-definition-types';
import { DerivedDatasourceEditor } from './derived/DerivedDatasourceEditor';

interface DatasourceConfigPanelProps {
    datasourceId: string;
}

const identifierPattern = /^[A-Za-z_][A-Za-z0-9_]*$/;
const maxFieldChips = 24;

function collectDependencyIds(id: string, all: DatasourceConfig[], plugins: DatasourcePlugin[], out = new Set<string>()): Set<string> {
    if (out.has(id)) return out;
    out.add(id);
    const cfg = all.find((d) => d.id === id);
    const plugin = cfg ? plugins.find((p) => p.type === cfg.type) : undefined;
    for (const dep of (cfg && plugin?.getDependencies?.(cfg.config)) ?? []) collectDependencyIds(dep, all, plugins, out);
    return out;
}

export const DatasourceConfigPanel: React.FC<DatasourceConfigPanelProps> = ({ datasourceId }) => {
    const { store, datasourcePlugins, builtInFields } = useReportBuilderContext();
    const datasources = useRBStore((s) => s.definition.datasources);
    const parameters = useRBStore((s) => s.definition.parameters);
    const allDatasources = useBuilderDatasources();
    const ds = datasources.find((d) => d.id === datasourceId);
    const [sampleState, setSampleState] = useState<{ loading: boolean; message: string | null; error: string | null }>({ loading: false, message: null, error: null });
    const [configureError, setConfigureError] = useState<string | null>(null);
    const { fields } = useDatasourceFields(datasourceId);

    const plugins = useMemo(() => withCorePlugins(datasourcePlugins), [datasourcePlugins]);
    const plugin = ds ? plugins.find((p) => p.type === ds.type) : undefined;

    const updateDs = useCallback(
        (patch: Partial<DatasourceConfig>) => {
            store.setState((prev: ReportBuilderState) => ({
                ...prev,
                definition: {
                    ...prev.definition,
                    datasources: prev.definition.datasources.map((d: DatasourceConfig) => (d.id === datasourceId ? { ...d, ...patch } : d)),
                },
            }));
        },
        [store, datasourceId],
    );

    const nameError = useMemo(() => {
        if (!ds) return null;
        if (!identifierPattern.test(ds.name)) return 'Use letters, digits and underscores only, starting with a letter.';
        if (allDatasources.some((d) => d.id !== ds.id && d.name.toLowerCase() === ds.name.toLowerCase())) return 'Another datasource already uses this name.';
        return null;
    }, [ds, allDatasources]);

    const getDeps = useCallback((d: DatasourceConfig) => plugins.find((p) => p.type === d.type)?.getDependencies?.(d.config) ?? [], [plugins]);
    const dependencies = useMemo(
        () => (ds ? getDeps(ds).map((id) => allDatasources.find((d) => d.id === id)?.name ?? id) : []),
        [ds, getDeps, allDatasources],
    );
    const dependents = useMemo(() => (ds ? findDependents(ds.id, datasources, getDeps).map((d) => d.name) : []), [ds, datasources, getDeps]);

    const handleConfigure = useCallback(async () => {
        if (!ds || !plugin?.configure) return;
        setConfigureError(null);
        try {
            const { definition } = store.getState();
            const result = await plugin.configure({
                mode: 'edit',
                datasource: ds,
                datasources: allDatasources,
                parameters: [...(definition.parentContext?.parameters ?? []), ...definition.parameters],
                builtInFields,
            });
            if (!result) return;
            updateDs({
                config: result.config,
                ...(result.name ? { name: result.name } : {}),
                ...(result.description !== undefined ? { description: result.description } : {}),
                ...(result.cachedSchema ? { cachedSchema: result.cachedSchema } : {}),
            });
        } catch (err) {
            setConfigureError(err instanceof Error ? err.message : String(err));
        }
    }, [ds, plugin, store, allDatasources, builtInFields, updateDs]);

    const handleLoadFields = useCallback(async () => {
        if (!ds) return;
        setSampleState({ loading: true, message: null, error: null });
        const ids = collectDependencyIds(ds.id, allDatasources, plugins);
        const configs = datasources.filter((d) => ids.has(d.id));
        const paramsByName: Record<string, unknown> = {};
        for (const p of parameters) paramsByName[p.name] = p.defaultValue;
        const controller = new AbortController();
        const { datasets, errors } = await resolveDatasources({
            configs,
            plugins: datasourcePlugins,
            parameters: paramsByName,
            builtInFields: builtInFieldsToExpressionContext(builtInFields),
            signal: controller.signal,
        });
        const dataset = datasets[ds.name];
        if (!dataset) {
            const message = errors.get(ds.id) ?? Array.from(errors.values())[0] ?? 'The datasource returned no data.';
            setSampleState({ loading: false, message: null, error: message });
            return;
        }
        const sampled = mergeFields(dataset.fields, inferFieldsFromRows(dataset.rows));
        updateDs({ cachedSchema: sampled });
        setSampleState({
            loading: false,
            error: null,
            message: `${dataset.rows.length} row${dataset.rows.length === 1 ? '' : 's'} returned using the default parameter values.`,
        });
    }, [ds, allDatasources, plugins, datasources, parameters, datasourcePlugins, builtInFields, updateDs]);

    if (!ds) {
        return <div className="eui-rb-props-pallet-empty">Datasource not found.</div>;
    }

    const Icon = plugin?.icon ?? DatabaseIcon;
    const ConfigUI = ds.type === derivedDatasourceType ? DerivedDatasourceEditor : plugin?.ConfigUI;
    const summary = plugin?.describe?.(ds.config);
    const nameInputId = `rb-ds-name-${datasourceId}`;
    const descInputId = `rb-ds-desc-${datasourceId}`;

    return (
        <div className="eui-rb-ds-config">
            <div className="eui-rb-ds-config-header">
                <Icon aria-hidden="true" />
                <div className="eui-rb-ds-config-header-info">
                    <div className="eui-rb-ds-config-header-name">{ds.name}</div>
                    <div className="eui-rb-ds-config-header-type">{plugin?.name ?? ds.type}</div>
                </div>
            </div>

            <div className="eui-rb-ds-config-field">
                <label htmlFor={nameInputId}>Name (used in expressions as Datasources.{ds.name || 'Name'})</label>
                <TextInput
                    id={nameInputId}
                    value={ds.name}
                    onChange={(e) => updateDs({ name: e.value })}
                    placeholder="DatasourceName"
                    aria-invalid={!!nameError}
                    aria-describedby={nameError ? `${nameInputId}-err` : undefined}
                />
                {nameError && <span id={`${nameInputId}-err`} className="eui-rb-ds-config-error">{nameError}</span>}
            </div>

            <div className="eui-rb-ds-config-field">
                <label htmlFor={descInputId}>Description</label>
                <TextInput
                    id={descInputId}
                    value={ds.description ?? ''}
                    onChange={(e) => updateDs({ description: e.value || undefined })}
                    placeholder="What this data is used for"
                />
            </div>

            {(summary || plugin?.configure) && (
                <div className="eui-rb-ds-config-field">
                    {summary && <div className="eui-rb-ds-config-summary">{summary}</div>}
                    {plugin?.configure && (
                        <div className="eui-rb-ds-config-actions">
                            <Button size="sm" variant="primary" leftIcon={<EditIcon aria-hidden="true" />} onClick={handleConfigure} label="Configure…" />
                        </div>
                    )}
                    {configureError && <span className="eui-rb-ds-config-error" role="alert">{configureError}</span>}
                </div>
            )}

            {ConfigUI && (
                <ConfigUI
                    datasourceId={datasourceId}
                    config={ds.config}
                    onChange={(config) => updateDs({ config })}
                    datasources={allDatasources}
                    parameters={parameters}
                />
            )}

            {(dependencies.length > 0 || dependents.length > 0) && (
                <div className="eui-rb-ds-config-field">
                    {dependencies.length > 0 && <span className="eui-rb-ds-config-hint">Reads from: {dependencies.join(', ')}</span>}
                    {dependents.length > 0 && <span className="eui-rb-ds-config-hint">Used by: {dependents.join(', ')}</span>}
                </div>
            )}

            <div className="eui-rb-ds-config-field">
                <label>Fields ({fields.length})</label>
                {fields.length > 0 ? (
                    <div className="eui-rb-ds-config-fields">
                        {fields.slice(0, maxFieldChips).map((f) => (
                            <span key={f.name} className="eui-rb-ds-config-field-chip" title={f.type}>{f.name}</span>
                        ))}
                        {fields.length > maxFieldChips && <span className="eui-rb-ds-config-field-chip">+{fields.length - maxFieldChips} more</span>}
                    </div>
                ) : (
                    <span className="eui-rb-ds-config-hint">No fields known yet.</span>
                )}
                <div className="eui-rb-ds-config-actions">
                    <Button
                        size="sm"
                        layout="outlined"
                        leftIcon={<RefreshIcon aria-hidden="true" />}
                        onClick={handleLoadFields}
                        disabled={sampleState.loading}
                        label={sampleState.loading ? 'Loading…' : 'Load fields'}
                        title="Run this datasource once with the default parameter values and remember its fields"
                    />
                </div>
                <div aria-live="polite">
                    {sampleState.message && <span className="eui-rb-ds-config-hint">{sampleState.message}</span>}
                    {sampleState.error && <span className="eui-rb-ds-config-error">{sampleState.error}</span>}
                </div>
            </div>
        </div>
    );
};
