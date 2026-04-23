import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRightIcon, DatabaseIcon, PlusIcon, TimesIcon } from '../../../assets/icons';
import type { SVGIcon } from '../../../assets/icons';
import { Button } from '../../Button';
import { useReportBuilderContext, useRBStore } from '../report-builder-context';
import type { DatasetField, ReportBuilderState } from '../report-builder-types';
import type { DatasourceConfig, DerivedDatasourceConfig } from '../report-definition-types';
import { DatasourcePluginPicker } from './DatasourcePluginPicker';

interface FieldDragPayload {
    datasourceId: string;
    datasourceName: string;
    fieldName: string;
    path: string;
    type: DatasetField['type'];
}

const fieldTypeChip = (type: DatasetField['type']): { label: string; color: string } => {
    switch (type) {
        case 'number': return { label: '#', color: '#2563eb' };
        case 'boolean': return { label: 'bool', color: '#9333ea' };
        case 'date': return { label: 'date', color: '#0d9488' };
        case 'array': return { label: '[ ]', color: '#d97706' };
        case 'object': return { label: '{ }', color: '#64748b' };
        case 'string':
        default: return { label: 'txt', color: '#64748b' };
    }
};

const FieldNode: React.FC<{
    field: DatasetField;
    depth: number;
    datasourceId: string;
    datasourceName: string;
    pathPrefix: string;
}> = ({ field, depth, datasourceId, datasourceName, pathPrefix }) => {
    const [open, setOpen] = useState(false);
    const hasChildren = !!field.children && field.children.length > 0;
    const path = pathPrefix ? `${pathPrefix}.${field.name}` : field.name;
    const chip = fieldTypeChip(field.type);

    return (
        <>
            <div
                className="eui-rb-ds-explorer-source-field"
                style={{ paddingLeft: 8 + depth * 12 }}
                draggable
                onDragStart={(e) => {
                    const payload: FieldDragPayload = {
                        datasourceId,
                        datasourceName,
                        fieldName: field.name,
                        path,
                        type: field.type,
                    };
                    e.dataTransfer.setData('application/rb-field-drag', JSON.stringify(payload));
                    e.dataTransfer.setData('application/rb-field', path);
                    e.dataTransfer.setData('text/plain', `Datasources.${datasourceName}.${path}`);
                    e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={hasChildren ? () => setOpen((v) => !v) : undefined}
                title={`${path} (${field.type})`}
            >
                {hasChildren ? (
                    <ChevronRightIcon
                        className="field-icon"
                        aria-hidden="true"
                        style={{ transform: open ? 'rotate(90deg)' : undefined, transition: 'transform 0.15s' }}
                    />
                ) : (
                    <span className="field-icon" aria-hidden="true" style={{ width: 12, display: 'inline-block' }} />
                )}
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{field.name}</span>
                <span
                    className="field-type"
                    style={{
                        fontSize: 9,
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: 3,
                        background: 'var(--eui-bg-subtle)',
                        color: chip.color,
                        border: `1px solid ${chip.color}33`,
                        lineHeight: 1.4,
                    }}
                >
                    {chip.label}
                </span>
            </div>
            {open && hasChildren && field.children!.map((child) => (
                <FieldNode
                    key={child.name}
                    field={child}
                    depth={depth + 1}
                    datasourceId={datasourceId}
                    datasourceName={datasourceName}
                    pathPrefix={path}
                />
            ))}
        </>
    );
};

/**
 * Resolve the design-time field list for a datasource without triggering a network fetch.
 *
 * - Normal datasources delegate to `plugin.inferSchema(config)` if the plugin implements it.
 *   Plugins that can't introspect locally (HTTP, Jira remote) return undefined and we show a
 *   hint instead of a stale empty tree.
 * - Derived datasources read the schema of their source datasource by id, recursively.
 * - The result memoizes on the config object identity; the store's setState clones configs
 *   whenever they change, so the recompute only fires on real edits.
 */
function useDatasourceFields(
    ds: DatasourceConfig,
    allDatasources: DatasourceConfig[],
    resolvers: Map<string, (config: Record<string, unknown>) => DatasetField[] | Promise<DatasetField[]>>,
): { fields: DatasetField[]; loading: boolean; supported: boolean } {
    const [asyncFields, setAsyncFields] = useState<DatasetField[] | null>(null);
    const [loading, setLoading] = useState(false);

    const { syncFields, supported, isAsync } = useMemo(() => {
        if (ds.type === 'derived') {
            const cfg = ds.config as unknown as DerivedDatasourceConfig;
            const source = allDatasources.find((d) => d.id === cfg?.sourceDatasourceId);
            // No source picked yet, or the picked source doesn't implement design-time
            // schema introspection — let the panel show the runtime-resolution message.
            if (!source) return { syncFields: [], supported: false, isAsync: false };
            const resolver = resolvers.get(source.type);
            if (!resolver) return { syncFields: [], supported: false, isAsync: false };
            const raw = resolver(source.config);
            if (raw instanceof Promise) return { syncFields: [], supported: true, isAsync: true };
            return { syncFields: raw, supported: true, isAsync: false };
        }
        const resolver = resolvers.get(ds.type);
        if (!resolver) return { syncFields: [], supported: false, isAsync: false };
        try {
            const raw = resolver(ds.config);
            if (raw instanceof Promise) return { syncFields: [], supported: true, isAsync: true };
            return { syncFields: raw, supported: true, isAsync: false };
        } catch {
            // Plugin threw while introspecting (e.g. malformed config) — fall back to runtime.
            return { syncFields: [], supported: false, isAsync: false };
        }
    }, [ds, allDatasources, resolvers]);

    useEffect(() => {
        if (!isAsync) {
            setAsyncFields(null);
            return;
        }
        let cancelled = false;
        setLoading(true);
        const source = ds.type === 'derived'
            ? allDatasources.find((d) => d.id === (ds.config as unknown as DerivedDatasourceConfig).sourceDatasourceId)
            : ds;
        if (!source) {
            setLoading(false);
            return;
        }
        const resolver = resolvers.get(source.type);
        if (!resolver) {
            setLoading(false);
            return;
        }
        try {
            Promise.resolve(resolver(source.config))
                .then((result) => {
                    if (cancelled) return;
                    setAsyncFields(result);
                    setLoading(false);
                })
                .catch(() => {
                    if (cancelled) return;
                    setAsyncFields([]);
                    setLoading(false);
                });
        } catch {
            setAsyncFields([]);
            setLoading(false);
        }
        return () => { cancelled = true; };
    }, [isAsync, ds, allDatasources, resolvers]);

    return {
        fields: isAsync ? (asyncFields ?? []) : syncFields,
        loading: isAsync && loading,
        supported,
    };
}

const DsNode: React.FC<{
    config: DatasourceConfig;
    allDatasources: DatasourceConfig[];
    resolvers: Map<string, (config: Record<string, unknown>) => DatasetField[] | Promise<DatasetField[]>>;
    pluginIcon?: SVGIcon;
    onSelect: (id: string) => void;
    onRemove: (id: string) => void;
}> = ({ config, allDatasources, resolvers, pluginIcon, onSelect, onRemove }) => {
    const [open, setOpen] = useState(false);
    const Icon = pluginIcon ?? DatabaseIcon;
    const { fields, loading, supported } = useDatasourceFields(config, allDatasources, resolvers);

    return (
        <div>
            <div
                className={`eui-rb-ds-explorer-source-header${open ? ' expanded' : ''}`}
                onClick={() => { setOpen((v) => !v); onSelect(config.id); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setOpen((v) => !v); onSelect(config.id); } }}
                aria-expanded={open}
            >
                <ChevronRightIcon
                    className="chevron"
                    aria-hidden="true"
                    style={{ transform: open ? 'rotate(90deg)' : undefined, transition: 'transform 0.15s' }}
                />
                <Icon className="ds-icon" aria-hidden="true" />
                <span className="ds-name">{config.name}</span>
                {fields.length > 0 && (
                    <span style={{ fontSize: 10, color: 'var(--eui-text-muted)', marginLeft: 4 }}>
                        {fields.length}
                    </span>
                )}
                <div className="ds-actions">
                    <Button
                        layout="plain"
                        size="xs"
                        className="eui-rb-panel-action-btn"
                        onClick={(e) => { e.stopPropagation(); onRemove(config.id); }}
                        title="Remove datasource"
                        ariaLabel={`Remove ${config.name}`}
                        leftIcon={<TimesIcon aria-hidden="true" />}
                    />
                </div>
            </div>
            {open && (
                <div className="eui-rb-ds-explorer-source-fields">
                    {loading ? (
                        <div style={{ padding: '4px 12px', fontSize: 11, color: 'var(--eui-text-muted)', fontStyle: 'italic' }}>
                            Reading schema…
                        </div>
                    ) : fields.length === 0 ? (
                        <div style={{ padding: '4px 12px', fontSize: 11, color: 'var(--eui-text-muted)', fontStyle: 'italic' }}>
                            {supported
                                ? 'No design-time data. Fields will be resolved at runtime.'
                                : 'This datasource resolves at runtime. Fields will appear when the report runs.'}
                        </div>
                    ) : (
                        fields.map((f) => (
                            <FieldNode
                                key={f.name}
                                field={f}
                                depth={0}
                                datasourceId={config.id}
                                datasourceName={config.name}
                                pathPrefix=""
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export const DatasourceExplorer: React.FC = () => {
    const { store, datasourcePlugins } = useReportBuilderContext();
    const [pickerOpen, setPickerOpen] = useState(false);

    const datasources = useRBStore((s) => s.definition.datasources);

    // Build the resolver map once per plugin list identity. Plugins that omit `inferSchema`
    // are excluded so the hook can report "not supported" without special-casing callers.
    const resolvers = useMemo(() => {
        const map = new Map<string, (config: Record<string, unknown>) => DatasetField[] | Promise<DatasetField[]>>();
        for (const plugin of datasourcePlugins) {
            if (plugin.inferSchema) map.set(plugin.type, plugin.inferSchema);
        }
        return map;
    }, [datasourcePlugins]);

    const handleSelect = (id: string) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            selectedItemId: id,
            selectedItemType: 'datasource',
        }));
    };

    const handleRemove = (id: string) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                datasources: prev.definition.datasources.filter((d: DatasourceConfig) => d.id !== id),
            },
            selectedItemId: prev.selectedItemId === id ? null : prev.selectedItemId,
            selectedItemType: prev.selectedItemId === id ? 'none' : prev.selectedItemType,
        }));
    };

    const handleAdd = (type: string) => {
        let newDs: DatasourceConfig;
        if (type === 'derived') {
            newDs = {
                id: crypto.randomUUID(),
                name: `Derived ${datasources.length + 1}`,
                type: 'derived',
                config: { sourceDatasourceId: '', transforms: [] },
            };
        } else {
            const plugin = datasourcePlugins.find((p) => p.type === type);
            if (!plugin) return;
            newDs = {
                id: crypto.randomUUID(),
                name: `${plugin.name} ${datasources.length + 1}`,
                type,
                config: plugin.initialConfig(),
            };
        }
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                datasources: [...prev.definition.datasources, newDs],
            },
            selectedItemId: newDs.id,
            selectedItemType: 'datasource',
        }));
        setPickerOpen(false);
    };

    return (
        <div className="eui-rb-ds-explorer">
            <div className="eui-rb-ds-explorer-add-row">
                <span>{datasources.length} datasource{datasources.length !== 1 ? 's' : ''}</span>
                <Button
                    layout="outlined"
                    size="xs"
                    className="eui-report-builder-tool-btn"
                    onClick={() => setPickerOpen(true)}
                    ariaLabel="Add datasource"
                    title="Add datasource"
                    leftIcon={<PlusIcon aria-hidden="true" />}
                    label="Add"
                />
            </div>

            {datasources.length === 0 ? (
                <div className="eui-rb-ds-explorer-empty">
                    <DatabaseIcon aria-hidden="true" />
                    <p>No datasources yet.<br />Click "Add" to connect your data.</p>
                </div>
            ) : (
                <div className="eui-rb-ds-explorer-list">
                    {datasources.map((ds) => (
                        <DsNode
                            key={ds.id}
                            config={ds}
                            allDatasources={datasources}
                            resolvers={resolvers}
                            pluginIcon={datasourcePlugins.find((p) => p.type === ds.type)?.icon}
                            onSelect={handleSelect}
                            onRemove={handleRemove}
                        />
                    ))}
                </div>
            )}

            <DatasourcePluginPicker
                isOpen={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={handleAdd}
            />
        </div>
    );
};
