import React, { useCallback } from 'react';
import { useBuilderDatasources } from '../../builder-hooks';
import { useReportBuilderContext } from '../../report-builder-context';
import type { ReportBuilderState } from '../../report-builder-types';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportComponent } from '../../report-definition-types';

export const PluginPropsPanel: React.FC<{ component: ReportComponent }> = ({ component }) => {
    const { store, componentPlugins } = useReportBuilderContext();
    const datasources = useBuilderDatasources();
    const plugin = componentPlugins.find((p) => p.type === component.type);

    const handleChange = useCallback(
        (patch: Record<string, unknown>) => {
            store.setState((prev: ReportBuilderState) => ({
                ...prev,
                definition: {
                    ...prev.definition,
                    components: updateComponentInTree(prev.definition.components, component.id, (c) => ({ ...c, props: { ...c.props, ...patch } })),
                    metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
                },
            }));
        },
        [store, component.id],
    );

    if (!plugin?.PropsPanel) {
        return (
            <div className="eui-rb-props-pallet-empty">
                <span>{plugin ? `${plugin.label} has no properties.` : `The "${component.type}" component is not available in this application.`}</span>
            </div>
        );
    }

    const PropsPanel = plugin.PropsPanel;
    return <PropsPanel component={component} onChange={handleChange} datasources={datasources} />;
};
