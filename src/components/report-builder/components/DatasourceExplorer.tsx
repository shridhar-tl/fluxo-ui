import React, { useState } from 'react';
import { ChevronRightIcon, DatabaseIcon, PlusIcon, TimesIcon } from '../../../assets/icons';
import type { SVGIcon } from '../../../assets/icons';
import { Button } from '../../Button';
import { useReportBuilderContext, useRBStore } from '../report-builder-context';
import type { ReportBuilderState } from '../report-builder-types';
import type { DatasourceConfig } from '../report-definition-types';
import { DatasourcePluginPicker } from './DatasourcePluginPicker';

interface ExplorerField {
    name: string;
    type: string;
    children?: ExplorerField[];
}

interface DsNodeProps {
    config: DatasourceConfig;
    fields: ExplorerField[];
    pluginIcon?: SVGIcon;
    onSelect: (id: string) => void;
    onRemove: (id: string) => void;
}

const FieldNode: React.FC<{ field: ExplorerField; depth: number; datasourceId: string }> = ({ field, depth, datasourceId }) => {
    const [open, setOpen] = useState(false);
    const hasChildren = field.children && field.children.length > 0;

    return (
        <>
            <div
                className="eui-rb-ds-explorer-source-field"
                style={{ paddingLeft: 8 + depth * 12 }}
                draggable
                onDragStart={(e) => {
                    e.dataTransfer.setData('application/rb-field-drag', JSON.stringify({ datasourceId, fieldName: field.name }));
                    e.dataTransfer.setData('application/rb-field', field.name);
                    e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={hasChildren ? () => setOpen((v) => !v) : undefined}
                title={field.name}
            >
                {hasChildren && (
                    <ChevronRightIcon
                        className="field-icon"
                        aria-hidden="true"
                        style={{ transform: open ? 'rotate(90deg)' : undefined, transition: 'transform 0.15s' }}
                    />
                )}
                <span style={{ flex: 1 }}>{field.name}</span>
                <span className="field-type">{field.type}</span>
            </div>
            {open && hasChildren && field.children!.map((child) => (
                <FieldNode key={child.name} field={child} depth={depth + 1} datasourceId={datasourceId} />
            ))}
        </>
    );
};

const DsNode: React.FC<DsNodeProps> = ({ config, fields, pluginIcon, onSelect, onRemove }) => {
    const [open, setOpen] = useState(false);
    const Icon = pluginIcon ?? DatabaseIcon;

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
                <ChevronRightIcon className="chevron" aria-hidden="true" />
                <Icon className="ds-icon" aria-hidden="true" />
                <span className="ds-name">{config.name}</span>
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
                    {fields.length === 0 ? (
                        <div style={{ padding: '4px 12px', fontSize: 11, color: 'var(--eui-text-muted)', fontStyle: 'italic' }}>
                            No fields available. Configure the datasource.
                        </div>
                    ) : (
                        fields.map((f) => <FieldNode key={f.name} field={f} depth={0} datasourceId={config.id} />)
                    )}
                </div>
            )}
        </div>
    );
};

export const DatasourceExplorer: React.FC = () => {
    const { store, datasourcePlugins } = useReportBuilderContext();
    const [pickerOpen, setPickerOpen] = useState(false);
    const [fieldMap] = useState<Record<string, ExplorerField[]>>({});

    const datasources = useRBStore((s) => s.definition.datasources);

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
                            fields={fieldMap[ds.id] ?? []}
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
