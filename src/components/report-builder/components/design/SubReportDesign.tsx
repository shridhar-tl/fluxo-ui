import React from 'react';
import { ExternalLinkIcon } from '../../../../assets/icons';
import { useReportBuilderContext } from '../../report-builder-context';
import type { ReportComponent, SubReportComponentProps } from '../../report-definition-types';

interface Props { component: ReportComponent; }

export const SubReportDesign: React.FC<Props> = ({ component }) => {
    const { availableSubReports } = useReportBuilderContext();
    const p = component.props as unknown as SubReportComponentProps;

    const selected = availableSubReports.find((sr) => sr.id === p.subReportId);
    const paramCount = Object.keys(p.parameterMap ?? {}).length;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                background: 'var(--eui-bg-subtle)',
                border: '1px solid var(--eui-border-subtle)',
                borderRadius: 6,
                color: 'var(--eui-text)',
                fontSize: 13,
            }}
        >
            <ExternalLinkIcon aria-hidden="true" style={{ width: 16, height: 16, flexShrink: 0, opacity: 0.6 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selected ? selected.label : 'No sub-report selected'}
                </div>
                {paramCount > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--eui-text-muted)', marginTop: 2 }}>
                        {paramCount} parameter{paramCount !== 1 ? 's' : ''} mapped
                    </div>
                )}
            </div>
        </div>
    );
};
