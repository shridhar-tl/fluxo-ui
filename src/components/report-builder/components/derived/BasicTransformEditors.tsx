import React from 'react';
import { PlusIcon, TrashIcon } from '../../../../assets/icons';
import { Button } from '../../../Button';
import { Checkbox } from '../../../Checkbox';
import { NumericInput } from '../../../NumericInput';
import { TextInput } from '../../../TextInput';
import { ExpressionEditor } from '../../expression/ExpressionEditor';
import type {
    DerivedTransformComputed,
    DerivedTransformDistinct,
    DerivedTransformFilter,
    DerivedTransformFlatten,
    DerivedTransformLimit,
    DerivedTransformPick,
    DerivedTransformSort,
} from '../../report-definition-types';
import { FieldPathInput } from '../props/FieldPathInput';
import { FieldPathList } from '../props/FieldPathList';
import { SortKeysEditor } from '../props/SortKeysEditor';
import type { TransformEditorProps } from './transform-editor-types';

export const FilterEditor: React.FC<TransformEditorProps<DerivedTransformFilter>> = ({ transform, onChange, typeContext, idPrefix }) => (
    <div className="eui-rb-prop-field">
        <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-filter`}>Keep rows where</label>
        <ExpressionEditor
            id={`${idPrefix}-filter`}
            value={transform.expression}
            onChange={(expression) => onChange({ ...transform, expression })}
            typeContext={{ ...typeContext, expectedReturnType: 'boolean' }}
            placeholder="e.g. Field.status != 'Done' && Field.points > 0"
            multiline
        />
    </div>
);

export const ComputedEditor: React.FC<TransformEditorProps<DerivedTransformComputed>> = ({ transform, onChange, typeContext }) => {
    const cols = transform.columns;
    const updateCol = (i: number, patch: Partial<{ name: string; expression: string }>) =>
        onChange({ ...transform, columns: cols.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });

    return (
        <div className="eui-rb-list-editor">
            {cols.map((c, i) => (
                <div key={i} className="eui-rb-list-editor-card">
                    <div className="eui-rb-list-editor-row">
                        <div className="eui-rb-list-editor-grow">
                            <TextInput value={c.name} onChange={(e) => updateCol(i, { name: e.value })} placeholder="Column name" size="sm" aria-label={`Column ${i + 1} name`} />
                        </div>
                        <Button layout="plain" size="xs" onClick={() => onChange({ ...transform, columns: cols.filter((_, idx) => idx !== i) })} ariaLabel={`Remove column ${i + 1}`} leftIcon={<TrashIcon aria-hidden="true" />} />
                    </div>
                    <ExpressionEditor
                        value={c.expression}
                        onChange={(expression) => updateCol(i, { expression })}
                        typeContext={typeContext}
                        placeholder="e.g. Field.timeSpent / 3600"
                        aria-label={`Column ${i + 1} expression`}
                    />
                </div>
            ))}
            <Button layout="plain" size="xs" onClick={() => onChange({ ...transform, columns: [...cols, { name: '', expression: '' }] })} leftIcon={<PlusIcon aria-hidden="true" />} label="Add column" />
            <div className="eui-rb-list-editor-empty">Columns are computed in order, so a column can use the ones above it.</div>
        </div>
    );
};

export const PickEditor: React.FC<TransformEditorProps<DerivedTransformPick>> = ({ transform, onChange, fieldPaths }) => {
    const fields = transform.fields;
    const updateField = (i: number, patch: Partial<{ source: string; alias: string }>) =>
        onChange({ ...transform, fields: fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) });

    return (
        <div className="eui-rb-list-editor">
            {fields.map((f, i) => (
                <div key={i} className="eui-rb-list-editor-row">
                    <div className="eui-rb-list-editor-grow">
                        <FieldPathInput value={f.source} onChange={(source) => updateField(i, { source })} fieldPaths={fieldPaths} ariaLabel={`Field ${i + 1}`} />
                    </div>
                    <div className="eui-rb-list-editor-grow">
                        <TextInput value={f.alias ?? ''} onChange={(e) => updateField(i, { alias: e.value || undefined })} placeholder="Rename to" size="sm" aria-label={`Field ${i + 1} new name`} />
                    </div>
                    <Button layout="plain" size="xs" onClick={() => onChange({ ...transform, fields: fields.filter((_, idx) => idx !== i) })} ariaLabel={`Remove field ${i + 1}`} leftIcon={<TrashIcon aria-hidden="true" />} />
                </div>
            ))}
            <div className="eui-rb-list-editor-row">
                <Button layout="plain" size="xs" onClick={() => onChange({ ...transform, fields: [...fields, { source: '' }] })} leftIcon={<PlusIcon aria-hidden="true" />} label="Add field" />
                {fieldPaths.length > 0 && (
                    <Button
                        layout="plain"
                        size="xs"
                        onClick={() => onChange({ ...transform, fields: fieldPaths.filter((p) => !p.includes('.')).map((source) => ({ source })) })}
                        label="Add all fields"
                    />
                )}
            </div>
        </div>
    );
};

export const SortEditor: React.FC<TransformEditorProps<DerivedTransformSort>> = ({ transform, onChange, typeContext }) => (
    <SortKeysEditor keys={transform.keys} onChange={(keys) => onChange({ ...transform, keys })} typeContext={typeContext} />
);

export const FlattenEditor: React.FC<TransformEditorProps<DerivedTransformFlatten>> = ({ transform, onChange, fieldPaths, idPrefix }) => (
    <>
        <div className="eui-rb-prop-field">
            <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-child`}>List field to expand</label>
            <FieldPathInput id={`${idPrefix}-child`} value={transform.childField} onChange={(childField) => onChange({ ...transform, childField })} fieldPaths={fieldPaths} ariaLabel="List field to expand" placeholder="e.g. worklogs" />
        </div>
        <div className="eui-rb-prop-field">
            <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-prefix`}>Prefix for item fields (optional)</label>
            <TextInput id={`${idPrefix}-prefix`} value={transform.childPrefix ?? ''} onChange={(e) => onChange({ ...transform, childPrefix: e.value || undefined })} placeholder="e.g. worklog_" size="sm" />
        </div>
        <Checkbox
            label="Keep rows whose list is empty"
            checked={transform.keepEmpty !== false}
            onChange={(e) => onChange({ ...transform, keepEmpty: e.value })}
        />
    </>
);

export const DistinctEditor: React.FC<TransformEditorProps<DerivedTransformDistinct>> = ({ transform, onChange, fieldPaths }) => (
    <FieldPathList
        values={transform.fields}
        onChange={(fields) => onChange({ ...transform, fields })}
        fieldPaths={fieldPaths}
        addLabel="Add field"
        itemLabel="Distinct field"
        emptyText="No fields chosen: rows that are identical in every field are removed."
    />
);

export const LimitEditor: React.FC<TransformEditorProps<DerivedTransformLimit>> = ({ transform, onChange, idPrefix }) => (
    <div className="eui-rb-list-editor-row">
        <div className="eui-rb-prop-field eui-rb-list-editor-grow">
            <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-offset`}>Skip rows</label>
            <NumericInput id={`${idPrefix}-offset`} value={transform.offset ?? 0} min={0} onChange={(e) => onChange({ ...transform, offset: e.value ?? 0 })} size="sm" />
        </div>
        <div className="eui-rb-prop-field eui-rb-list-editor-grow">
            <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-count`}>Keep rows (0 = all)</label>
            <NumericInput id={`${idPrefix}-count`} value={transform.count ?? 0} min={0} onChange={(e) => onChange({ ...transform, count: e.value || undefined })} size="sm" />
        </div>
    </div>
);
