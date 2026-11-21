import React, { useMemo } from 'react';
import { Modal } from '../../Modal';
import { inheritedDatasourceType } from '../data/core-plugins';
import { useReportBuilderContext } from '../report-builder-context';
import type { DatasourcePlugin } from '../report-builder-types';

interface DatasourcePluginPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: string) => void;
}

const defaultCategory = 'Datasources';

function groupPlugins(plugins: DatasourcePlugin[]): Array<{ category: string; plugins: DatasourcePlugin[] }> {
    const groups = new Map<string, DatasourcePlugin[]>();
    for (const plugin of plugins) {
        if (plugin.type === inheritedDatasourceType) continue;
        const category = plugin.category ?? defaultCategory;
        const list = groups.get(category);
        if (list) list.push(plugin);
        else groups.set(category, [plugin]);
    }
    return Array.from(groups.entries()).map(([category, list]) => ({ category, plugins: list }));
}

export const DatasourcePluginPicker: React.FC<DatasourcePluginPickerProps> = ({ isOpen, onClose, onSelect }) => {
    const { datasourcePlugins } = useReportBuilderContext();
    const groups = useMemo(() => groupPlugins(datasourcePlugins), [datasourcePlugins]);
    const showHeadings = groups.length > 1;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Datasource" size="md">
            <div className="eui-rb-ds-picker">
                {groups.map(({ category, plugins }) => (
                    <section key={category} className="eui-rb-ds-picker-section" aria-label={category}>
                        {showHeadings && <h3 className="eui-rb-ds-picker-heading">{category}</h3>}
                        <div className="eui-rb-ds-picker-grid" role="list">
                            {plugins.map((plugin) => {
                                const Icon = plugin.icon;
                                return (
                                    <button
                                        key={plugin.type}
                                        type="button"
                                        className="eui-rb-ds-picker-card"
                                        onClick={() => onSelect(plugin.type)}
                                        role="listitem"
                                        aria-label={`Add ${plugin.name} datasource`}
                                    >
                                        <div className="eui-rb-ds-picker-card-header">
                                            <div className="eui-rb-ds-picker-card-icon" aria-hidden="true"><Icon /></div>
                                            <div className="eui-rb-ds-picker-card-name">{plugin.name}</div>
                                        </div>
                                        <div className="eui-rb-ds-picker-card-desc">{plugin.description}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
        </Modal>
    );
};
