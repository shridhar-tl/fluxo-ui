import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../../../Button';
import { Modal } from '../../../Modal';
import { useBuilderDatasources, useSchemaResolver } from '../../builder-hooks';
import { buildParentContext } from '../../data/parent-context';
import { useReportBuilderContext } from '../../report-builder-context';
import type { ReportDefinition, ReportParentContext } from '../../report-definition-types';

interface SubReportEditorModalProps {
    initialDefinition: ReportDefinition;
    subReportId: string | null;
    onClose: () => void;
    onSave: (definition: ReportDefinition) => Promise<void>;
}

export const SubReportEditorModal: React.FC<SubReportEditorModalProps> = ({ initialDefinition, subReportId, onClose, onSave }) => {
    const ctx = useReportBuilderContext();
    const { store, BuilderComponent, hostDatasourcePlugins, parameterPlugins, componentPlugins, availableSubReports, subReportHooks, builtInFields } = ctx;
    const datasources = useBuilderDatasources();
    const resolver = useSchemaResolver();
    const [definition, setDefinition] = useState<ReportDefinition>(initialDefinition);
    const [parentContext, setParentContext] = useState<ReportParentContext | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        buildParentContext(store.getState().definition, datasources, resolver).then((pc) => {
            if (!cancelled) setParentContext(pc);
        });
        return () => { cancelled = true; };
    }, [store, datasources, resolver]);

    const childSubReports = useMemo(
        () => availableSubReports.filter((sr) => sr.id !== subReportId && sr.id !== store.getState().definition.id),
        [availableSubReports, subReportId, store],
    );

    const handleSave = useCallback(async () => {
        setSaving(true);
        setError(null);
        try {
            await onSave(parentContext ? { ...definition, parentContext } : definition);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setSaving(false);
        }
    }, [definition, parentContext, onSave]);

    const footer = (
        <div className="eui-rb-subreport-editor-footer">
            {error && <span className="eui-rb-ds-config-error" role="alert">{error}</span>}
            <Button layout="outlined" onClick={onClose} label="Cancel" disabled={saving} />
            <Button variant="primary" onClick={handleSave} label={saving ? 'Saving…' : 'Save sub-report'} disabled={saving || !parentContext} />
        </div>
    );

    return (
        <Modal isOpen onClose={onClose} title={`Sub-report: ${definition.metadata.title}`} size="fullScreen" footer={footer} closeOnBackdrop={false}>
            <div className="eui-rb-subreport-editor">
                {parentContext ? (
                    <BuilderComponent
                        definition={definition}
                        onChange={setDefinition}
                        parentContext={parentContext}
                        datasourcePlugins={hostDatasourcePlugins}
                        parameterPlugins={parameterPlugins}
                        componentPlugins={componentPlugins}
                        availableSubReports={childSubReports}
                        builtInFields={builtInFields}
                        resolveSubReport={subReportHooks.resolveSubReport}
                        onSaveSubReport={subReportHooks.onSaveSubReport}
                        onCreateSubReport={subReportHooks.onCreateSubReport}
                    />
                ) : (
                    <div className="eui-rb-ds-config-hint">Preparing the parent report's parameters and datasources…</div>
                )}
            </div>
        </Modal>
    );
};
