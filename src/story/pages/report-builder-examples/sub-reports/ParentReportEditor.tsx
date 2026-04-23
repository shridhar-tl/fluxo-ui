import React, { useCallback, useMemo } from 'react';
import { ReportBuilder } from '../../../../components/report-builder';
import type { ReportDefinition } from '../../../../components/report-builder';
import { createHook } from '../../../../store';
import { sampleDatasourcePlugins } from '../../report-builder/report-builder-story-data';
import { subReportsToAvailable } from '../shared/available-sub-reports';
import { getSubReportList, reportExamplesStore, updateMainReport } from '../shared/report-examples-store';

const useReportExamples = createHook(reportExamplesStore);

export const ParentReportEditor: React.FC = () => {
    const definition = useReportExamples((state) => state.mainReport);
    // Shallow compare — the selector returns a freshly-built array on every call (see LivePreview).
    const subReports = useReportExamples((state) => getSubReportList(state), true);

    const availableSubReports = useMemo(() => subReportsToAvailable(subReports), [subReports]);

    const handleChange = useCallback((next: ReportDefinition) => {
        updateMainReport(next);
    }, []);

    return (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <ReportBuilder
                definition={definition}
                onChange={handleChange}
                datasourcePlugins={sampleDatasourcePlugins}
                availableSubReports={availableSubReports}
                style={{ flex: 1, minHeight: 0 }}
            />
        </div>
    );
};
