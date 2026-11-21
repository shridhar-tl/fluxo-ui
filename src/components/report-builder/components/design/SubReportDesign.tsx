import React from 'react';
import { ExternalLinkIcon } from '../../../../assets/icons';
import { useReportBuilderContext } from '../../report-builder-context';
import type { ReportComponent, SubReportComponentProps } from '../../report-definition-types';
import { useBuilderSubReportDefinition } from '../subreport/useSubReportDefinition';

interface Props { component: ReportComponent; }

export const SubReportDesign: React.FC<Props> = ({ component }) => {
    const { availableSubReports } = useReportBuilderContext();
    const p = component.props as unknown as SubReportComponentProps;
    const { definition } = useBuilderSubReportDefinition(p.subReportId || undefined);

    const listing = availableSubReports.find((sr) => sr.id === p.subReportId);
    const title = definition?.metadata.title ?? listing?.label;
    const paramCount = Object.values(p.parameterMap ?? {}).filter((v) => v !== '').length;
    const componentCount = definition?.components.length;

    return (
        <div className="eui-rb-subreport-design">
            <ExternalLinkIcon aria-hidden="true" className="eui-rb-subreport-design-icon" />
            <div className="eui-rb-subreport-design-info">
                <div className="eui-rb-subreport-design-title">{title ?? 'No sub-report selected'}</div>
                {(paramCount > 0 || componentCount !== undefined) && (
                    <div className="eui-rb-subreport-design-meta">
                        {componentCount !== undefined && `${componentCount} component${componentCount !== 1 ? 's' : ''}`}
                        {componentCount !== undefined && paramCount > 0 && ' · '}
                        {paramCount > 0 && `${paramCount} parameter${paramCount !== 1 ? 's' : ''} mapped`}
                    </div>
                )}
            </div>
        </div>
    );
};
