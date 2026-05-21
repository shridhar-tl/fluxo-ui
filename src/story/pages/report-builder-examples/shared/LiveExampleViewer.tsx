import React, { useMemo, useState } from 'react';
import { ReportViewer } from '../../../../components/report-builder/report-viewer-index';
import type { ReportDefinition, SubReportDefinition } from '../../../../components/report-builder/report-viewer-index';
import { createHook } from '../../../../store';
import { CodeBlock } from '../../../CodeBlock';
import { sampleDatasourcePlugins } from '../../report-builder/report-builder-story-data';
import { getSubReportList, reportExamplesStore } from './report-examples-store';

export interface ExpressionHighlight {
    label: string;
    expression: string;
    explanation: string;
}

interface Props {
    title: string;
    description: string;
    definition: ReportDefinition;
    highlights?: ExpressionHighlight[];
    height?: number;
    defaultParameterValues?: Record<string, unknown>;
    useSharedSubReports?: boolean;
    extraSubReports?: SubReportDefinition[];
    onDrillThrough?: (variableName: string, value: unknown) => void;
    onParameterChange?: (values: Record<string, unknown>) => void;
    controlledParameterValues?: Record<string, unknown>;
    showDefinitionTab?: boolean;
}

type Tab = 'viewer' | 'expressions' | 'definition';

const useReportExamples = createHook(reportExamplesStore);

export const LiveExampleViewer: React.FC<Props> = ({
    title,
    description,
    definition,
    highlights,
    height = 560,
    defaultParameterValues,
    useSharedSubReports = false,
    extraSubReports,
    onDrillThrough,
    onParameterChange,
    controlledParameterValues,
    showDefinitionTab = true,
}) => {
    const [tab, setTab] = useState<Tab>('viewer');
    const [internalParams, setInternalParams] = useState<Record<string, unknown>>(defaultParameterValues ?? {});

    // Shallow compare because the selector returns a freshly-built array from Object.values on each call.
    const sharedSubReports = useReportExamples(
        (state) => (useSharedSubReports ? getSubReportList(state) : undefined),
        true,
    );

    const subReportDefinitions = useMemo<SubReportDefinition[] | undefined>(() => {
        if (!useSharedSubReports && !extraSubReports) return undefined;
        const list: SubReportDefinition[] = [];
        if (sharedSubReports) list.push(...sharedSubReports);
        if (extraSubReports) list.push(...extraSubReports);
        return list;
    }, [useSharedSubReports, sharedSubReports, extraSubReports]);

    const paramValues = controlledParameterValues ?? internalParams;
    const handleParamChange = (values: Record<string, unknown>): void => {
        if (onParameterChange) onParameterChange(values);
        if (!controlledParameterValues) setInternalParams(values);
    };

    const defJson = useMemo(() => JSON.stringify(definition, null, 2), [definition]);

    const availableTabs = useMemo<Tab[]>(() => {
        const list: Tab[] = ['viewer'];
        if (highlights && highlights.length > 0) list.push('expressions');
        if (showDefinitionTab) list.push('definition');
        return list;
    }, [highlights, showDefinitionTab]);

    return (
        <section
            style={{
                border: '1px solid var(--eui-border-subtle)',
                borderRadius: 8,
                overflow: 'hidden',
                marginBottom: 28,
                background: 'var(--eui-bg)',
            }}
        >
            <div
                style={{
                    padding: '12px 16px',
                    background: 'var(--eui-bg-subtle)',
                    borderBottom: '1px solid var(--eui-border-subtle)',
                }}
            >
                <h3 style={{ margin: 0, color: 'var(--eui-text)', fontSize: 16, fontWeight: 600 }}>{title}</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--eui-text-muted)', fontSize: 13 }}>{description}</p>
            </div>

            {availableTabs.length > 1 && (
                <div
                    role="tablist"
                    aria-label={`${title} views`}
                    style={{
                        display: 'flex',
                        gap: 4,
                        padding: '6px 10px',
                        borderBottom: '1px solid var(--eui-border-subtle)',
                    }}
                >
                    {availableTabs.map((t) => (
                        <button
                            key={t}
                            role="tab"
                            aria-selected={tab === t}
                            onClick={() => setTab(t)}
                            style={{
                                padding: '4px 12px',
                                border: 'none',
                                borderRadius: 4,
                                background: tab === t ? 'var(--eui-primary-soft)' : 'transparent',
                                color: tab === t ? 'var(--eui-primary)' : 'var(--eui-text-muted)',
                                fontWeight: 600,
                                fontSize: 12,
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                            }}
                        >
                            {t === 'viewer' ? 'Live Viewer' : t}
                        </button>
                    ))}
                </div>
            )}

            {tab === 'viewer' && (
                <div style={{ height, overflow: 'hidden' }}>
                    <ReportViewer
                        definition={definition}
                        datasourcePlugins={sampleDatasourcePlugins}
                        parameterValues={paramValues}
                        onParameterChange={handleParamChange}
                        subReportDefinitions={subReportDefinitions}
                        parameterPanel={{ mode: 'docked', position: 'left' }}
                        onDrillThrough={onDrillThrough}
                        style={{ height: '100%' }}
                    />
                </div>
            )}

            {tab === 'expressions' && highlights && (
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {highlights.map((h, i) => (
                        <div key={i}>
                            <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--eui-text)', marginBottom: 2 }}>
                                {h.label}
                            </div>
                            <div
                                style={{
                                    fontFamily: 'monospace',
                                    fontSize: 12,
                                    padding: '6px 10px',
                                    background: 'var(--eui-bg-subtle)',
                                    border: '1px solid var(--eui-border-subtle)',
                                    borderRadius: 4,
                                    color: 'var(--eui-text)',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all',
                                }}
                            >
                                {h.expression}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--eui-text-muted)', marginTop: 4 }}>
                                {h.explanation}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'definition' && (
                <div style={{ padding: 12 }}>
                    <CodeBlock code={defJson} language="json" />
                </div>
            )}
        </section>
    );
};
