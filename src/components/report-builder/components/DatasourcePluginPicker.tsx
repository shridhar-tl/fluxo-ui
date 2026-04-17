import React from 'react';
import { BranchIcon } from '../../../assets/icons';
import { Modal } from '../../Modal';
import { useReportBuilderContext } from '../report-builder-context';

interface DatasourcePluginPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: string) => void;
}

export const DatasourcePluginPicker: React.FC<DatasourcePluginPickerProps> = ({ isOpen, onClose, onSelect }) => {
    const { datasourcePlugins } = useReportBuilderContext();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Datasource" size="sm">
            {datasourcePlugins.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--eui-text-muted)', fontSize: 13 }}>
                    No datasource plugins registered. Pass <code>datasourcePlugins</code> prop to ReportBuilder.
                </div>
            ) : (
                <div className="eui-rb-ds-picker-grid" role="list">
                    {datasourcePlugins.map((plugin) => {
                        const Icon = plugin.icon;
                        return (
                            <button
                                key={plugin.type}
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
                    <button
                        className="eui-rb-ds-picker-card"
                        onClick={() => onSelect('derived')}
                        role="listitem"
                        aria-label="Add derived datasource"
                    >
                        <div className="eui-rb-ds-picker-card-header">
                            <div className="eui-rb-ds-picker-card-icon" aria-hidden="true"><BranchIcon /></div>
                            <div className="eui-rb-ds-picker-card-name">Derived</div>
                        </div>
                        <div className="eui-rb-ds-picker-card-desc">Transform data from another datasource with filters, computed columns, and more.</div>
                    </button>
                </div>
            )}
        </Modal>
    );
};
