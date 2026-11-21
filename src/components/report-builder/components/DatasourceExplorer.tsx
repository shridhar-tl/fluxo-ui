import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { BranchIcon, ChevronRightIcon, CopyIcon, DatabaseIcon, PlusIcon, TimesIcon } from '../../../assets/icons';
import type { SVGIcon } from '../../../assets/icons';
import { Button } from '../../Button';
import { useBuilderDatasources, useDatasourceFields, useInheritedDatasources } from '../builder-hooks';
import { derivedDatasourceType } from '../data/core-plugins';
import { uniqueDatasourceName } from '../data/datasource-naming';
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

const fieldTypeChips: Record<DatasetField['type'], { label: string; className: string }> = {
    number: { label: '#', className: 'is-number' },
    boolean: { label: 'bool', className: 'is-boolean' },
    date: { label: 'date', className: 'is-date' },
    array: { label: '[ ]', className: 'is-array' },
    object: { label: '{ }', className: 'is-object' },
    string: { label: 'txt', className: 'is-string' },
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
    const chip = fieldTypeChips[field.type] ?? fieldTypeChips.string;
    const toggle = () => setOpen((v) => !v);

    return (
        <>
            <div
                className="eui-rb-ds-explorer-source-field"
                style={{ paddingLeft: 8 + depth * 12 }}
                draggable
                role={hasChildren ? 'button' : undefined}
                tabIndex={hasChildren ? 0 : undefined}
                aria-expanded={hasChildren ? open : undefined}
                onDragStart={(e) => {
                    const payload: FieldDragPayload = { datasourceId, datasourceName, fieldName: field.name, path, type: field.type };
                    e.dataTransfer.setData('application/rb-field-drag', JSON.stringify(payload));
                    e.dataTransfer.setData('application/rb-field', path);
                    e.dataTransfer.setData('text/plain', `Datasources.${datasourceName}.${path}`);
                    e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={hasChildren ? toggle : undefined}
                onKeyDown={hasChildren ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } } : undefined}
                title={`${field.label ?? path} (${field.type})`}
            >
                {hasChildren ? (
                    <ChevronRightIcon className={classNames('field-icon', 'eui-rb-ds-chevron', { open })} aria-hidden="true" />
                ) : (
                    <span className="field-icon" aria-hidden="true" />
                )}
                <span className="eui-rb-ds-field-name">{field.name}</span>
                <span className={classNames('eui-rb-ds-field-type', chip.className)}>{chip.label}</span>
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

interface DsNodeProps {
    config: DatasourceConfig;
    pluginIcon?: SVGIcon;
    readOnly?: boolean;
    selected: boolean;
    onSelect: (id: string) => void;
    onRemove?: (id: string) => void;
    onDerive?: (id: string) => void;
    onDuplicate?: (id: string) => void;
}

const DsNode: React.FC<DsNodeProps> = ({ config, pluginIcon, readOnly, selected, onSelect, onRemove, onDerive, onDuplicate }) => {
    const [open, setOpen] = useState(false);
    const Icon = pluginIcon ?? DatabaseIcon;
    const { fields, loading, supported } = useDatasourceFields(open ? config.id : undefined);

    const activate = () => {
        setOpen((v) => !v);
        if (!readOnly) onSelect(config.id);
    };

    return (
        <div>
            <div
                className={classNames('eui-rb-ds-explorer-source-header', { expanded: open, selected })}
                onClick={activate}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } }}
                aria-expanded={open}
                title={config.description ?? config.name}
            >
                <ChevronRightIcon className={classNames('chevron', 'eui-rb-ds-chevron', { open })} aria-hidden="true" />
                <Icon className="ds-icon" aria-hidden="true" />
                <span className="ds-name">{config.name}</span>
                {readOnly && <span className="eui-rb-readonly-badge">parent</span>}
                <div className="ds-actions">
                    {onDerive && (
                        <Button
                            layout="plain"
                            size="xs"
                            className="eui-rb-panel-action-btn"
                            onClick={(e) => { e.stopPropagation(); onDerive(config.id); }}
                            title="Create a derived datasource from this one"
                            ariaLabel={`Derive from ${config.name}`}
                            leftIcon={<BranchIcon aria-hidden="true" />}
                        />
                    )}
                    {onDuplicate && (
                        <Button
                            layout="plain"
                            size="xs"
                            className="eui-rb-panel-action-btn"
                            onClick={(e) => { e.stopPropagation(); onDuplicate(config.id); }}
                            title="Duplicate datasource"
                            ariaLabel={`Duplicate ${config.name}`}
                            leftIcon={<CopyIcon aria-hidden="true" />}
                        />
                    )}
                    {onRemove && (
                        <Button
                            layout="plain"
                            size="xs"
                            className="eui-rb-panel-action-btn"
                            onClick={(e) => { e.stopPropagation(); onRemove(config.id); }}
                            title="Remove datasource"
                            ariaLabel={`Remove ${config.name}`}
                            leftIcon={<TimesIcon aria-hidden="true" />}
                        />
                    )}
                </div>
            </div>
            {open && (
                <div className="eui-rb-ds-explorer-source-fields" aria-live="polite">
                    {loading ? (
                        <div className="eui-rb-ds-explorer-note">Reading schema…</div>
                    ) : fields.length === 0 ? (
                        <div className="eui-rb-ds-explorer-note">
                            {supported
                                ? 'No fields available yet. Complete the datasource configuration.'
                                : 'Fields are known once the datasource runs. Use "Load fields" in its properties to capture them.'}
                        </div>
                    ) : (
                        fields.map((f) => (
                            <FieldNode key={f.name} field={f} depth={0} datasourceId={config.id} datasourceName={config.name} pathPrefix="" />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export const DatasourceExplorer: React.FC = () => {
    const { store, datasourcePlugins, builtInFields } = useReportBuilderContext();
    const [pickerOpen, setPickerOpen] = useState(false);
    const [configureError, setConfigureError] = useState<string | null>(null);

    const datasources = useRBStore((s) => s.definition.datasources);
    const selectedItemId = useRBStore((s) => s.selectedItemId);
    const inherited = useInheritedDatasources();
    const allDatasources = useBuilderDatasources();

    const iconOf = useCallback((type: string) => datasourcePlugins.find((p) => p.type === type)?.icon, [datasourcePlugins]);

    const addDatasource = useCallback((ds: DatasourceConfig) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: { ...prev.definition, datasources: [...prev.definition.datasources, ds] },
            selectedItemId: ds.id,
            selectedItemType: 'datasource',
        }));
    }, [store]);

    const handleSelect = useCallback((id: string) => {
        store.setState((prev: ReportBuilderState) => ({ ...prev, selectedItemId: id, selectedItemType: 'datasource' }));
    }, [store]);

    const handleRemove = useCallback((id: string) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                datasources: prev.definition.datasources.filter((d: DatasourceConfig) => d.id !== id),
            },
            selectedItemId: prev.selectedItemId === id ? null : prev.selectedItemId,
            selectedItemType: prev.selectedItemId === id ? 'none' : prev.selectedItemType,
        }));
    }, [store]);

    const handleDerive = useCallback((id: string) => {
        const source = allDatasources.find((d) => d.id === id);
        if (!source) return;
        const config: DerivedDatasourceConfig = { sourceDatasourceId: id, transforms: [] };
        addDatasource({
            id: crypto.randomUUID(),
            name: uniqueDatasourceName(`${source.name}Derived`, allDatasources),
            type: derivedDatasourceType,
            config: config as unknown as Record<string, unknown>,
        });
    }, [allDatasources, addDatasource]);

    const handleDuplicate = useCallback((id: string) => {
        const source = datasources.find((d) => d.id === id);
        if (!source) return;
        addDatasource({
            ...structuredClone(source),
            id: crypto.randomUUID(),
            name: uniqueDatasourceName(`${source.name}Copy`, allDatasources),
        });
    }, [datasources, allDatasources, addDatasource]);

    const handleAdd = useCallback(async (type: string) => {
        const plugin = datasourcePlugins.find((p) => p.type === type);
        if (!plugin) return;
        setPickerOpen(false);
        setConfigureError(null);
        const draft: DatasourceConfig = {
            id: crypto.randomUUID(),
            name: uniqueDatasourceName(plugin.name, allDatasources),
            type,
            config: plugin.initialConfig(),
        };
        if (!plugin.configure) {
            addDatasource(draft);
            return;
        }
        try {
            const { definition } = store.getState();
            const result = await plugin.configure({
                mode: 'create',
                datasource: draft,
                datasources: allDatasources,
                parameters: [...(definition.parentContext?.parameters ?? []), ...definition.parameters],
                builtInFields,
            });
            if (!result) return;
            addDatasource({
                ...draft,
                config: result.config,
                name: result.name ? uniqueDatasourceName(result.name, allDatasources) : draft.name,
                description: result.description,
                cachedSchema: result.cachedSchema,
            });
        } catch (err) {
            setConfigureError(err instanceof Error ? err.message : String(err));
        }
    }, [datasourcePlugins, allDatasources, addDatasource, store, builtInFields]);

    const total = datasources.length + inherited.length;

    return (
        <div className="eui-rb-ds-explorer">
            <div className="eui-rb-ds-explorer-add-row">
                <span>{total} datasource{total !== 1 ? 's' : ''}</span>
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

            {configureError && <div className="eui-rb-ds-explorer-error" role="alert">{configureError}</div>}

            {total === 0 ? (
                <div className="eui-rb-ds-explorer-empty">
                    <DatabaseIcon aria-hidden="true" />
                    <p>No datasources yet.<br />Click "Add" to connect your data.</p>
                </div>
            ) : (
                <div className="eui-rb-ds-explorer-list">
                    {inherited.length > 0 && (
                        <>
                            <div className="eui-rb-ds-explorer-group-title">From parent report</div>
                            {inherited.map((ds) => (
                                <DsNode
                                    key={ds.id}
                                    config={ds}
                                    readOnly
                                    selected={false}
                                    onSelect={handleSelect}
                                    onDerive={handleDerive}
                                />
                            ))}
                            {datasources.length > 0 && <div className="eui-rb-ds-explorer-group-title">This report</div>}
                        </>
                    )}
                    {datasources.map((ds) => (
                        <DsNode
                            key={ds.id}
                            config={ds}
                            pluginIcon={iconOf(ds.type)}
                            selected={selectedItemId === ds.id}
                            onSelect={handleSelect}
                            onRemove={handleRemove}
                            onDerive={handleDerive}
                            onDuplicate={handleDuplicate}
                        />
                    ))}
                </div>
            )}

            <DatasourcePluginPicker isOpen={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleAdd} />
        </div>
    );
};
