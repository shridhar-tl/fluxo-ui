import React, { useCallback, useMemo } from 'react';
import { PlusIcon, TrashIcon } from '../../../assets/icons';
import { Button } from '../../Button';
import { Dropdown } from '../../Dropdown';
import { TextInput } from '../../TextInput';
import type { ListItem } from '../../../types';
import { useReportBuilderContext, useRBStore } from '../report-builder-context';
import type { ReportBuilderState } from '../report-builder-types';
import type {
    DatasourceConfig,
    DerivedDatasourceConfig,
    DerivedTransform,
    DerivedTransformComputed,
    DerivedTransformFlatten,
    DerivedTransformFilter,
    DerivedTransformPick,
} from '../report-definition-types';

interface Props {
    datasourceId: string;
}

const transformTypeOptions: ListItem[] = [
    { value: 'flatten', label: 'Flatten Nested' },
    { value: 'pick', label: 'Pick / Rename Fields' },
    { value: 'filter', label: 'Filter Rows' },
    { value: 'computed', label: 'Computed Columns' },
];

export const DerivedDatasourceConfigPanel: React.FC<Props> = ({ datasourceId }) => {
    const { store } = useReportBuilderContext();
    const datasources = useRBStore((s) => s.definition.datasources);

    const ds = useMemo(() => datasources.find((d) => d.id === datasourceId), [datasources, datasourceId]);
    const derivedConfig = ds?.config as unknown as DerivedDatasourceConfig | undefined;

    const sourceOptions: ListItem[] = useMemo(
        () => [
            { value: '', label: '— Select source —' },
            ...datasources
                .filter((d) => d.id !== datasourceId && d.type !== 'derived')
                .map((d) => ({ value: d.id, label: d.name })),
        ],
        [datasources, datasourceId],
    );

    const updateDerivedConfig = useCallback((patch: Partial<DerivedDatasourceConfig>) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                datasources: prev.definition.datasources.map((d: DatasourceConfig) =>
                    d.id === datasourceId ? { ...d, config: { ...d.config, ...patch } } : d,
                ),
            },
        }));
    }, [store, datasourceId]);

    const addTransform = useCallback((type: DerivedTransform['type']) => {
        const transforms = derivedConfig?.transforms ?? [];
        let newTransform: DerivedTransform;
        switch (type) {
            case 'flatten':
                newTransform = { type: 'flatten', childField: '' };
                break;
            case 'pick':
                newTransform = { type: 'pick', fields: [] };
                break;
            case 'filter':
                newTransform = { type: 'filter', expression: '' };
                break;
            case 'computed':
                newTransform = { type: 'computed', columns: [] };
                break;
            default:
                return;
        }
        updateDerivedConfig({ transforms: [...transforms, newTransform] });
    }, [derivedConfig, updateDerivedConfig]);

    const updateTransform = useCallback((index: number, transform: DerivedTransform) => {
        const transforms = [...(derivedConfig?.transforms ?? [])];
        transforms[index] = transform;
        updateDerivedConfig({ transforms });
    }, [derivedConfig, updateDerivedConfig]);

    const removeTransform = useCallback((index: number) => {
        const transforms = (derivedConfig?.transforms ?? []).filter((_, i) => i !== index);
        updateDerivedConfig({ transforms });
    }, [derivedConfig, updateDerivedConfig]);

    if (!ds || !derivedConfig) return null;

    const transforms = derivedConfig.transforms ?? [];

    return (
        <div className="eui-rb-props-section">
            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Source Datasource</label>
                <Dropdown
                    options={sourceOptions}
                    value={derivedConfig.sourceDatasourceId ?? ''}
                    onChange={(e) => updateDerivedConfig({ sourceDatasourceId: e.value })}
                    size="sm"
                />
            </div>

            <div className="eui-rb-props-section-title" style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Transforms ({transforms.length})</span>
                <Dropdown
                    options={transformTypeOptions}
                    value=""
                    placeholder="+ Add transform"
                    onChange={(e) => { if (e.value) addTransform(e.value as DerivedTransform['type']); }}
                    size="sm"
                    className="eui-rb-derived-transform-add"
                />
            </div>

            {transforms.length === 0 && (
                <div style={{ fontSize: 11, color: 'var(--eui-text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
                    No transforms. Data will pass through unchanged.
                </div>
            )}

            {transforms.map((t, i) => (
                <TransformEditor
                    key={i}
                    index={i}
                    transform={t}
                    onUpdate={(updated) => updateTransform(i, updated)}
                    onRemove={() => removeTransform(i)}
                />
            ))}
        </div>
    );
};

const TransformEditor: React.FC<{
    index: number;
    transform: DerivedTransform;
    onUpdate: (t: DerivedTransform) => void;
    onRemove: () => void;
}> = ({ index, transform, onUpdate, onRemove }) => (
    <div style={{
        border: '1px solid var(--eui-border-subtle)',
        borderRadius: 6,
        padding: 8,
        marginBottom: 6,
        background: 'var(--eui-bg)',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', flex: 1 }}>
                #{index + 1} {transform.type.charAt(0).toUpperCase() + transform.type.slice(1)}
            </span>
            <Button
                layout="plain"
                size="xs"
                variant="danger"
                onClick={onRemove}
                ariaLabel="Remove transform"
                leftIcon={<TrashIcon aria-hidden="true" />}
            />
        </div>

        {transform.type === 'flatten' && (
            <FlattenEditor transform={transform} onUpdate={onUpdate} />
        )}
        {transform.type === 'pick' && (
            <PickEditor transform={transform} onUpdate={onUpdate} />
        )}
        {transform.type === 'filter' && (
            <FilterEditor transform={transform} onUpdate={onUpdate} />
        )}
        {transform.type === 'computed' && (
            <ComputedEditor transform={transform} onUpdate={onUpdate} />
        )}
    </div>
);

const FlattenEditor: React.FC<{
    transform: DerivedTransformFlatten;
    onUpdate: (t: DerivedTransform) => void;
}> = ({ transform, onUpdate }) => (
    <div className="eui-rb-prop-field">
        <label className="eui-rb-prop-field-label">Child Field</label>
        <TextInput
            value={transform.childField}
            onChange={(e) => onUpdate({ ...transform, childField: e.value })}
            placeholder="e.g. items, children"
            size="sm"
        />
    </div>
);

const PickEditor: React.FC<{
    transform: DerivedTransformPick;
    onUpdate: (t: DerivedTransform) => void;
}> = ({ transform, onUpdate }) => {
    const fields = transform.fields;

    const addField = () => {
        onUpdate({ ...transform, fields: [...fields, { source: '' }] });
    };

    const updateField = (i: number, patch: Partial<{ source: string; alias: string }>) => {
        const next = fields.map((f, idx) => idx === i ? { ...f, ...patch } : f);
        onUpdate({ ...transform, fields: next });
    };

    const removeField = (i: number) => {
        onUpdate({ ...transform, fields: fields.filter((_, idx) => idx !== i) });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {fields.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <TextInput
                        value={f.source}
                        onChange={(e) => updateField(i, { source: e.value })}
                        placeholder="Source field"
                        size="sm"
                        style={{ flex: 1 }}
                    />
                    <TextInput
                        value={f.alias ?? ''}
                        onChange={(e) => updateField(i, { alias: e.value || undefined })}
                        placeholder="Alias (optional)"
                        size="sm"
                        style={{ flex: 1 }}
                    />
                    <Button
                        layout="plain"
                        size="xs"
                        onClick={() => removeField(i)}
                        ariaLabel="Remove field"
                        leftIcon={<TrashIcon aria-hidden="true" />}
                    />
                </div>
            ))}
            <Button layout="plain" size="xs" onClick={addField} leftIcon={<PlusIcon aria-hidden="true" />}>
                Add Field
            </Button>
        </div>
    );
};

const FilterEditor: React.FC<{
    transform: DerivedTransformFilter;
    onUpdate: (t: DerivedTransform) => void;
}> = ({ transform, onUpdate }) => (
    <div className="eui-rb-prop-field">
        <label className="eui-rb-prop-field-label">Filter Expression</label>
        <TextInput
            value={transform.expression}
            onChange={(e) => onUpdate({ ...transform, expression: e.value })}
            placeholder="e.g. Field.status == 'active'"
            size="sm"
        />
        <span style={{ fontSize: 10, color: 'var(--eui-text-muted)' }}>
            Use Field.fieldName to reference current row fields
        </span>
    </div>
);

const ComputedEditor: React.FC<{
    transform: DerivedTransformComputed;
    onUpdate: (t: DerivedTransform) => void;
}> = ({ transform, onUpdate }) => {
    const cols = transform.columns;

    const addColumn = () => {
        onUpdate({ ...transform, columns: [...cols, { name: '', expression: '' }] });
    };

    const updateCol = (i: number, patch: Partial<{ name: string; expression: string }>) => {
        const next = cols.map((c, idx) => idx === i ? { ...c, ...patch } : c);
        onUpdate({ ...transform, columns: next });
    };

    const removeCol = (i: number) => {
        onUpdate({ ...transform, columns: cols.filter((_, idx) => idx !== i) });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {cols.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <TextInput
                        value={c.name}
                        onChange={(e) => updateCol(i, { name: e.value })}
                        placeholder="Column name"
                        size="sm"
                        style={{ flex: 1 }}
                    />
                    <TextInput
                        value={c.expression}
                        onChange={(e) => updateCol(i, { expression: e.value })}
                        placeholder="Expression"
                        size="sm"
                        style={{ flex: 2 }}
                    />
                    <Button
                        layout="plain"
                        size="xs"
                        onClick={() => removeCol(i)}
                        ariaLabel="Remove column"
                        leftIcon={<TrashIcon aria-hidden="true" />}
                    />
                </div>
            ))}
            <Button layout="plain" size="xs" onClick={addColumn} leftIcon={<PlusIcon aria-hidden="true" />}>
                Add Column
            </Button>
        </div>
    );
};
