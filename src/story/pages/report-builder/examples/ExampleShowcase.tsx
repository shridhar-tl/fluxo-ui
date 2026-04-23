import React, { useMemo, useState } from 'react';
import { ReportViewer } from '../../../../components/report-builder';
import type {
    DatasourcePlugin,
    ReportDefinition,
    SubReportDefinition,
} from '../../../../components/report-builder';
import { CodeBlock } from '../../../CodeBlock';
import { sampleDatasourcePlugins } from '../report-builder-story-data';

export interface ExpressionHighlight {
    label: string;
    expression: string;
    explanation: string;
}

interface Props {
    title: string;
    description: string;
    definition: ReportDefinition;
    highlights: ExpressionHighlight[];
    height?: number;
    plugins?: DatasourcePlugin[];
    defaultParameterValues?: Record<string, unknown>;
    onDrillThrough?: (variableName: string, value: unknown) => void;
    subReportDefinitions?: SubReportDefinition[];
}

type Tab = 'viewer' | 'expressions' | 'definition';

export const ExampleShowcase: React.FC<Props> = ({
    title,
    description,
    definition,
    highlights,
    height = 560,
    plugins,
    defaultParameterValues,
    onDrillThrough,
    subReportDefinitions,
}) => {
    const [tab, setTab] = useState<Tab>('viewer');
    const [paramValues, setParamValues] = useState<Record<string, unknown>>(
        defaultParameterValues ?? {},
    );

    const defJson = useMemo(() => JSON.stringify(definition, null, 2), [definition]);

    const effectivePlugins = plugins ?? sampleDatasourcePlugins;

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

            <div
                role="tablist"
                style={{
                    display: 'flex',
                    gap: 4,
                    padding: '6px 10px',
                    borderBottom: '1px solid var(--eui-border-subtle)',
                }}
            >
                {(['viewer', 'expressions', 'definition'] as Tab[]).map((t) => (
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

            {tab === 'viewer' && (
                <div style={{ height, overflow: 'hidden' }}>
                    <ReportViewer
                        definition={definition}
                        datasourcePlugins={effectivePlugins}
                        parameterValues={paramValues}
                        onParameterChange={setParamValues}
                        parameterPanel={{ mode: 'docked', position: 'left' }}
                        onDrillThrough={onDrillThrough}
                        subReportDefinitions={subReportDefinitions}
                        style={{ height: '100%' }}
                    />
                </div>
            )}

            {tab === 'expressions' && (
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
