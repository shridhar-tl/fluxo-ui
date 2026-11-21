import React from 'react';
import { useReportBuilderContext } from '../../report-builder-context';
import type { ReportComponent } from '../../report-definition-types';

export const PluginDesign: React.FC<{ component: ReportComponent }> = ({ component }) => {
    const { componentPlugins } = useReportBuilderContext();
    const plugin = componentPlugins.find((p) => p.type === component.type);

    if (plugin?.Design) {
        const Design = plugin.Design;
        return <Design component={component} />;
    }

    const Icon = plugin?.icon;
    return (
        <div className="eui-rb-plugin-design">
            {Icon && <Icon aria-hidden="true" />}
            <span>{plugin ? plugin.label : `${component.type} (component not available)`}</span>
        </div>
    );
};
