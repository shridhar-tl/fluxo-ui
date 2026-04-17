import React, { useCallback } from 'react';
import { TextInput } from '../../TextInput';
import { BranchIcon, DatabaseIcon } from '../../../assets/icons';
import { useReportBuilderContext, useRBStore } from '../report-builder-context';
import type { ReportBuilderState } from '../report-builder-types';
import type { DatasourceConfig } from '../report-definition-types';
import { DerivedDatasourceConfigPanel } from './DerivedDatasourceConfigPanel';

interface DatasourceConfigPanelProps {
    datasourceId: string;
}

export const DatasourceConfigPanel: React.FC<DatasourceConfigPanelProps> = ({ datasourceId }) => {
    const { store, datasourcePlugins } = useReportBuilderContext();
    const datasources = useRBStore((s) => s.definition.datasources);
    const ds = datasources.find((d) => d.id === datasourceId);

    const updateDs = useCallback(
        (patch: Partial<DatasourceConfig>) => {
            if (!ds) return;
            store.setState((prev: ReportBuilderState) => ({
                ...prev,
                definition: {
                    ...prev.definition,
                    datasources: prev.definition.datasources.map((d: DatasourceConfig) =>
                        d.id === datasourceId ? { ...d, ...patch } : d,
                    ),
                },
            }));
        },
        [store, datasourceId, ds],
    );

    if (!ds) {
        return <div className="eui-rb-props-pallet-empty">Datasource not found.</div>;
    }

    const isDerived = ds.type === 'derived';
    const plugin = isDerived ? null : datasourcePlugins.find((p) => p.type === ds.type);
    const Icon = isDerived ? BranchIcon : (plugin?.icon ?? DatabaseIcon);
    const ConfigUI = plugin?.ConfigUI;

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
                <label htmlFor={`rb-ds-name-${datasourceId}`}>Name</label>
                <TextInput
                    id={`rb-ds-name-${datasourceId}`}
                    value={ds.name}
                    onChange={(e) => updateDs({ name: e.target.value })}
                    placeholder="Datasource name"
                />
            </div>

            {isDerived ? (
                <DerivedDatasourceConfigPanel datasourceId={datasourceId} />
            ) : ConfigUI ? (
                <ConfigUI
                    config={ds.config}
                    onChange={(config) => updateDs({ config })}
                />
            ) : (
                <div style={{ fontSize: 12, color: 'var(--eui-text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
                    No configuration UI registered for this datasource type.
                </div>
            )}
        </div>
    );
};
