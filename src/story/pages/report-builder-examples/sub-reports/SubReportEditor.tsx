import React, { useCallback } from 'react';
import { ReportBuilder } from '../../../../components/report-builder';
import type { ReportDefinition } from '../../../../components/report-builder';
import { createHook } from '../../../../store';
import { sampleDatasourcePlugins } from '../../report-builder/report-builder-story-data';
import { reportExamplesStore, updateSubReport } from '../shared/report-examples-store';

const useReportExamples = createHook(reportExamplesStore);

interface Props {
    subReportId: string;
}

export const SubReportEditor: React.FC<Props> = ({ subReportId }) => {
    const subReport = useReportExamples((state) => state.subReports[subReportId]);

    const handleChange = useCallback(
        (next: ReportDefinition) => {
            updateSubReport(subReportId, next);
        },
        [subReportId],
    );

    if (!subReport) {
        return (
            <div
                style={{
                    padding: 24,
                    textAlign: 'center',
                    color: 'var(--eui-text-muted)',
                    fontSize: 13,
                    fontStyle: 'italic',
                }}
            >
                Sub-report "{subReportId}" not found.
            </div>
        );
    }

    return (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div
                style={{
                    padding: '8px 14px',
                    borderBottom: '1px solid var(--eui-border-subtle)',
                    background: 'var(--eui-bg-subtle)',
                    fontSize: 12,
                    color: 'var(--eui-text-muted)',
                    flexShrink: 0,
                }}
            >
                Editing sub-report: <strong style={{ color: 'var(--eui-text)' }}>{subReport.label}</strong> ({subReport.id}). Changes
                here are reflected in the <em>Live Preview</em> tab as soon as you move off a field.
            </div>
            <ReportBuilder
                definition={subReport.definition}
                onChange={handleChange}
                datasourcePlugins={sampleDatasourcePlugins}
                style={{ flex: 1, minHeight: 0 }}
            />
        </div>
    );
};
