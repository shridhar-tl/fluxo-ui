import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '../../../../components';
import { ReportViewer } from '../../../../components/report-builder';
import { createHook } from '../../../../store';
import { sampleDatasourcePlugins } from '../../report-builder/report-builder-story-data';
import { getSubReportList, reportExamplesStore, resetReportExamples } from '../shared/report-examples-store';

const useReportExamples = createHook(reportExamplesStore);

export const LivePreview: React.FC = () => {
    const mainReport = useReportExamples((state) => state.mainReport);
    // `getSubReportList` returns `Object.values(state.subReports)` — a new array on every call.
    // Without shallow compare, each store change re-renders LivePreview with a fresh reference,
    // which then cascades into ReportViewer's viewerCtx memo, re-runs its effects, re-fetches
    // datasources, and the sub-reports tab hangs when tool windows are switched.
    const subReports = useReportExamples((state) => getSubReportList(state), true);

    const [paramValues, setParamValues] = useState<Record<string, unknown>>({ region: '', minRevenue: 0 });
    const [lastDrill, setLastDrill] = useState<string | null>(null);

    const handleDrill = useCallback((variableName: string, value: unknown) => {
        setLastDrill(`${variableName} = ${JSON.stringify(value)}`);
    }, []);

    const subReportIds = useMemo(() => subReports.map((s) => s.id).join(', '), [subReports]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div
                style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--eui-border-subtle)',
                    background: 'var(--eui-bg-subtle)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 12,
                    flexShrink: 0,
                }}
            >
                <div style={{ fontSize: 12, color: 'var(--eui-text-muted)', flex: '1 1 280px' }}>
                    Live viewer of the parent report. Sub-reports passed in: <strong style={{ color: 'var(--eui-text)' }}>{subReportIds}</strong>.
                    Click an Order id in the table to drill into the <em>Order Details</em> sub-report.
                </div>
                {lastDrill && (
                    <div
                        style={{
                            fontSize: 12,
                            padding: '4px 10px',
                            borderRadius: 4,
                            background: 'var(--eui-primary-soft)',
                            color: 'var(--eui-primary)',
                            fontFamily: 'monospace',
                        }}
                        role="status"
                        aria-live="polite"
                    >
                        onDrillThrough → {lastDrill}
                    </div>
                )}
                <Button size="sm" layout="outlined" onClick={() => resetReportExamples()} aria-label="Reset all example state">
                    Reset
                </Button>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
                <ReportViewer
                    definition={mainReport}
                    datasourcePlugins={sampleDatasourcePlugins}
                    subReportDefinitions={subReports}
                    parameterValues={paramValues}
                    onParameterChange={setParamValues}
                    parameterPanel={{ mode: 'docked', position: 'left' }}
                    onDrillThrough={handleDrill}
                    style={{ height: '100%' }}
                />
            </div>
        </div>
    );
};
