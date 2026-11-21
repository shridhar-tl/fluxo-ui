import React, { useCallback, useMemo, useState } from 'react';
import { EditIcon, PlusIcon } from '../../../../assets/icons';
import { Button } from '../../../Button';
import { Checkbox } from '../../../Checkbox';
import { Dropdown } from '../../../Dropdown';
import type { ListItem } from '../../../../types';
import { useBuilderDatasources } from '../../builder-hooks';
import { useReportBuilderContext } from '../../report-builder-context';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import { createEmptyDefinition } from '../../report-definition-types';
import type { ReportComponent, ReportDefinition, SubReportComponentProps } from '../../report-definition-types';
import { SubReportEditorModal } from '../subreport/SubReportEditorModal';
import { useBuilderSubReportDefinition } from '../subreport/useSubReportDefinition';
import { ExpressionField } from './ExpressionField';

interface Props { component: ReportComponent; }

interface MappableParameter {
    name: string;
    label: string;
    type?: string;
    inherited: boolean;
}

type EditorState = { mode: 'edit'; definition: ReportDefinition } | { mode: 'create'; definition: ReportDefinition } | null;

export const SubReportPropsPanel: React.FC<Props> = ({ component }) => {
    const { store, availableSubReports, subReportHooks } = useReportBuilderContext();
    const parentDatasources = useBuilderDatasources();
    const p = component.props as unknown as SubReportComponentProps;
    const { definition: childDef, loading, error, reload } = useBuilderSubReportDefinition(p.subReportId || undefined);
    const [editor, setEditor] = useState<EditorState>(null);

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

    const listing = useMemo(() => availableSubReports.find((sr) => sr.id === p.subReportId), [availableSubReports, p.subReportId]);
    const paramMap = useMemo(() => p.parameterMap ?? {}, [p.parameterMap]);
    const dsMap = useMemo(() => p.datasourceMap ?? {}, [p.datasourceMap]);

    const mappableParams: MappableParameter[] = useMemo(() => {
        if (childDef) {
            return [
                ...(childDef.parentContext?.parameters ?? []).map((x) => ({ name: x.name, label: x.label, type: x.type, inherited: true })),
                ...childDef.parameters.map((x) => ({ name: x.name, label: x.label, type: x.type, inherited: false })),
            ];
        }
        return (listing?.parameters ?? []).map((x) => ({ ...x, inherited: false }));
    }, [childDef, listing]);

    const inheritedDatasources = childDef?.parentContext?.datasources ?? [];

    const parentDsOptions: ListItem[] = useMemo(
        () => [{ value: '', label: '(match by name)' }, ...parentDatasources.map((d) => ({ value: d.id, label: d.name }))],
        [parentDatasources],
    );

    const subReportOptions: ListItem[] = useMemo(
        () => availableSubReports
            .filter((sr) => sr.id !== store.getState().definition.id)
            .map((sr) => ({ value: sr.id, label: sr.label })),
        [availableSubReports, store],
    );

    const canEdit = !!subReportHooks.resolveSubReport && !!subReportHooks.onSaveSubReport && !!p.subReportId;
    const canCreate = !!subReportHooks.onCreateSubReport;

    const handleSave = useCallback(async (definition: ReportDefinition) => {
        if (!editor) return;
        if (editor.mode === 'create') {
            const created = await subReportHooks.onCreateSubReport!(definition);
            update({ subReportId: created.id, parameterMap: {}, datasourceMap: {} });
        } else {
            await subReportHooks.onSaveSubReport!(p.subReportId, definition);
            reload();
        }
        setEditor(null);
    }, [editor, subReportHooks, p.subReportId, update, reload]);

    return (
        <div className="eui-rb-props-section">
            <div className="eui-rb-props-section-title">Sub-report</div>

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label" htmlFor={`rb-subreport-${component.id}`}>Report</label>
                <Dropdown
                    id={`rb-subreport-${component.id}`}
                    options={subReportOptions}
                    value={p.subReportId ?? ''}
                    placeholder={subReportOptions.length > 0 ? 'Choose a report' : 'No reports available'}
                    onChange={(e) => update({ subReportId: e.value, parameterMap: {}, datasourceMap: {} })}
                    size="sm"
                />
                {!p.subReportId && (
                    <span className="eui-rb-ds-config-error">Choose the report to embed.</span>
                )}
                {!!p.subReportId && !loading && !listing && !childDef && (
                    <span className="eui-rb-ds-config-error">The selected report no longer exists. Choose another one.</span>
                )}
            </div>

            {(canEdit || canCreate) && (
                <div className="eui-rb-ds-config-actions">
                    {canEdit && (
                        <Button
                            size="sm"
                            layout="outlined"
                            leftIcon={<EditIcon aria-hidden="true" />}
                            disabled={!childDef}
                            onClick={() => {
                                if (childDef) setEditor({ mode: 'edit', definition: childDef });
                            }}
                            label="Edit sub-report"
                        />
                    )}
                    {canCreate && (
                        <Button
                            size="sm"
                            layout="outlined"
                            leftIcon={<PlusIcon aria-hidden="true" />}
                            onClick={() => setEditor({ mode: 'create', definition: createEmptyDefinition('New sub-report') })}
                            label="New sub-report"
                        />
                    )}
                </div>
            )}

            {loading && <div className="eui-rb-ds-config-hint">Loading sub-report…</div>}
            {error && <div className="eui-rb-ds-config-error" role="alert">{error}</div>}

            <Checkbox
                label="Show border"
                checked={p.showBorder !== false}
                onChange={(e) => update({ showBorder: e.value })}
            />

            {p.subReportId && (
                <>
                    <div className="eui-rb-props-section-title eui-rb-props-section-spaced">Parameters</div>
                    {mappableParams.length === 0 ? (
                        <div className="eui-rb-ds-config-hint">This sub-report has no parameters.</div>
                    ) : (
                        <div className="eui-rb-ds-config-hint">Parameters with the same name as a parameter of this report get its value automatically.</div>
                    )}
                    {mappableParams.map((param) => (
                        <ExpressionField
                            key={param.name}
                            label={`${param.label || param.name}${param.inherited ? ' (from parent)' : ''}`}
                            value={paramMap[param.name] ?? ''}
                            onChange={(v) => update({ parameterMap: { ...paramMap, [param.name]: v } })}
                            placeholder={`Value, or =Parameters.${param.name}`}
                            expectedReturnType="any"
                        />
                    ))}

                    {inheritedDatasources.length > 0 && (
                        <>
                            <div className="eui-rb-props-section-title eui-rb-props-section-spaced">Datasources supplied to the sub-report</div>
                            {inheritedDatasources.map((ds) => (
                                <div key={ds.id} className="eui-rb-prop-field">
                                    <label className="eui-rb-prop-field-label" htmlFor={`rb-subreport-ds-${component.id}-${ds.id}`}>{ds.name}</label>
                                    <Dropdown
                                        id={`rb-subreport-ds-${component.id}-${ds.id}`}
                                        options={parentDsOptions}
                                        value={dsMap[ds.id] ?? ''}
                                        onChange={(e) => {
                                            const next = { ...dsMap };
                                            if (e.value) next[ds.id] = e.value;
                                            else delete next[ds.id];
                                            update({ datasourceMap: next });
                                        }}
                                        size="sm"
                                    />
                                </div>
                            ))}
                        </>
                    )}
                </>
            )}

            {editor && (
                <SubReportEditorModal
                    initialDefinition={editor.definition}
                    subReportId={editor.mode === 'edit' ? p.subReportId : null}
                    onClose={() => setEditor(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};
