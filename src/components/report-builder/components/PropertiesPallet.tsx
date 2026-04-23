import classNames from 'classnames';
import React, { useState } from 'react';
import { useRBStore } from '../report-builder-context';
import { findComponent } from '../report-component-helpers';
import { DatasourceConfigPanel } from './DatasourceConfigPanel';
import { ParameterDesigner } from './ParameterDesigner';
import { ParametersListPanel } from './ParametersListPanel';
import { ReportSettingsPanel } from './ReportSettingsPanel';
import { StylesPallet } from './StylesPallet';
import { VariableDesigner } from './VariableDesigner';
import { VariablesListPanel } from './VariablesListPanel';
import { CanvasPropsPanel } from './props/CanvasPropsPanel';
import { HeaderPropsPanel } from './props/HeaderPropsPanel';
import { TextPropsPanel } from './props/TextPropsPanel';
import { ImagePropsPanel } from './props/ImagePropsPanel';
import { HorizontalLinePropsPanel } from './props/HorizontalLinePropsPanel';
import { ColumnsPropsPanel } from './props/ColumnsPropsPanel';
import { TabPropsPanel } from './props/TabPropsPanel';
import { TablePropsPanel } from './props/TablePropsPanel';
import { SubReportPropsPanel } from './props/SubReportPropsPanel';
import { ChartPropsPanel } from './props/ChartPropsPanel';
import { RepeaterPropsPanel } from './props/RepeaterPropsPanel';

type PanelTab = 'properties' | 'styles';

export const PropertiesPallet: React.FC = () => {
    const [activeTab, setActiveTab] = useState<PanelTab>('properties');
    const selectedItemType = useRBStore((s) => s.selectedItemType);
    const selectedItemId = useRBStore((s) => s.selectedItemId);
    const components = useRBStore((s) => s.definition.components);

    const renderContent = () => {
        if (activeTab === 'styles') {
            return <StylesPallet />;
        }

        switch (selectedItemType) {
            case 'report-settings':
            case 'none':
                return <ReportSettingsPanel />;

            case 'datasource':
                return selectedItemId
                    ? <DatasourceConfigPanel datasourceId={selectedItemId} />
                    : <ReportSettingsPanel />;

            case 'parameter':
                return selectedItemId
                    ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
                            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                                <ParameterDesigner parameterId={selectedItemId} />
                            </div>
                        </div>
                    )
                    : <ParametersListPanel />;

            case 'variable':
                return selectedItemId
                    ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
                            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                                <VariableDesigner variableId={selectedItemId} />
                            </div>
                        </div>
                    )
                    : <VariablesListPanel />;

            case 'component': {
                if (!selectedItemId) return <ReportSettingsPanel />;
                const comp = findComponent(components, selectedItemId);
                if (!comp) return <ReportSettingsPanel />;
                return <ComponentPropsPanel type={comp.type} component={comp} />;
            }

            default:
                return <ReportSettingsPanel />;
        }
    };

    return (
        <div className="eui-rb-props-pallet">
            <div className="eui-rb-props-pallet-tabs" role="tablist" aria-label="Properties pallet tabs">
                {(['properties', 'styles'] as PanelTab[]).map((tab) => (
                    <button
                        key={tab}
                        className={classNames('eui-rb-props-pallet-tab', { active: activeTab === tab })}
                        role="tab"
                        aria-selected={activeTab === tab}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'properties' ? 'Properties' : 'Styles'}
                    </button>
                ))}
            </div>
            <div
                className="eui-rb-props-pallet-content"
                role="tabpanel"
                aria-label={activeTab === 'properties' ? 'Properties' : 'Styles'}
            >
                {renderContent()}
            </div>
        </div>
    );
};

import type { ReportComponent } from '../report-definition-types';

const ComponentPropsPanel: React.FC<{ type: string; component: ReportComponent }> = ({ type, component }) => {
    switch (type) {
        case 'header':
            return <HeaderPropsPanel component={component} />;
        case 'text':
            return <TextPropsPanel component={component} />;
        case 'image':
            return <ImagePropsPanel component={component} />;
        case 'horizontal-line':
            return <HorizontalLinePropsPanel component={component} />;
        case 'columns':
            return <ColumnsPropsPanel component={component} />;
        case 'tab':
            return <TabPropsPanel component={component} />;
        case 'table':
            return <TablePropsPanel component={component} />;
        case 'canvas':
            return <CanvasPropsPanel component={component} />;
        case 'repeater':
            return <RepeaterPropsPanel component={component} />;
        case 'sub-report':
            return <SubReportPropsPanel component={component} />;
        case 'chart-bar':
        case 'chart-horizontal-bar':
        case 'chart-stacked-bar':
        case 'chart-pie':
        case 'chart-donut':
        case 'chart-line':
        case 'chart-area':
        case 'chart-polar-area':
        case 'chart-radar':
        case 'chart-scatter':
        case 'chart-bubble':
            return <ChartPropsPanel component={component} />;
        default:
            return (
                <div className="eui-rb-props-pallet-empty">
                    <span>{type} — Phase 6</span>
                </div>
            );
    }
};
