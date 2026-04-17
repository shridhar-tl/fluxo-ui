import React, { useCallback, useMemo } from 'react';
import { Dropdown } from '../../../Dropdown';
import type { ListItem } from '../../../../types';
import { useReportBuilderContext } from '../../report-builder-context';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import type { ReportComponent, SubReportComponentProps } from '../../report-definition-types';
import { ExpressionField } from './ExpressionField';

interface Props { component: ReportComponent; }

export const SubReportPropsPanel: React.FC<Props> = ({ component }) => {
    const { store, availableSubReports } = useReportBuilderContext();
    const p = component.props as unknown as SubReportComponentProps;

    const update = useCallback((patch: Partial<SubReportComponentProps>) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                components: updateComponentInTree(prev.definition.components, component.id, (c) => ({
                    ...c,
                    props: { ...c.props, ...patch },
                })),
                metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
            },
        }));
    }, [store, component.id]);

    const selectedSubReport = useMemo(
        () => availableSubReports.find((sr) => sr.id === p.subReportId),
        [availableSubReports, p.subReportId],
    );

    const subReportParams = selectedSubReport?.parameters ?? [];
    const paramMap = p.parameterMap ?? {};

    const handleSubReportChange = useCallback((id: string) => {
        const sr = availableSubReports.find((s) => s.id === id);
        const newParamMap: Record<string, string> = {};
        if (sr?.parameters) {
            for (const param of sr.parameters) {
                newParamMap[param.name] = paramMap[param.name] ?? '';
            }
        }
        update({ subReportId: id, parameterMap: newParamMap });
    }, [availableSubReports, paramMap, update]);

    const handleParamValueChange = useCallback((paramName: string, value: string) => {
        update({ parameterMap: { ...paramMap, [paramName]: value } });
    }, [update, paramMap]);

    const subReportOptions: ListItem[] = useMemo(
        () => [
            { value: '', label: '— Select —' },
            ...availableSubReports.map((sr) => ({ value: sr.id, label: sr.label })),
        ],
        [availableSubReports],
    );

    return (
        <div className="eui-rb-props-section">
            <div className="eui-rb-props-section-title">Sub-report</div>

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Sub-report</label>
                <Dropdown
                    options={subReportOptions}
                    value={p.subReportId ?? ''}
                    onChange={(e) => handleSubReportChange(e.value)}
                    aria-label="Select sub-report"
                    size="sm"
                />
            </div>

            {p.subReportId && (
                <>
                    <div className="eui-rb-props-section-title" style={{ marginTop: 12 }}>Parameter Mapping</div>

                    {subReportParams.length === 0 && (
                        <div style={{ fontSize: 11, color: 'var(--eui-text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                            {selectedSubReport ? 'This sub-report has no parameters.' : 'Select a sub-report to see its parameters.'}
                        </div>
                    )}

                    {subReportParams.map((param) => (
                        <div key={param.name} style={{ marginBottom: 8 }}>
                            <ExpressionField
                                label={param.label || param.name}
                                value={paramMap[param.name] ?? ''}
                                onChange={(v) => handleParamValueChange(param.name, v)}
                                placeholder="Value or =expression"
                                expectedReturnType={(param.type ?? 'string') as 'string' | 'number' | 'boolean' | 'any'}
                                multiline={false}
                            />
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};
