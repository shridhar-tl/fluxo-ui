import React from 'react';
import { PlusIcon, TrashIcon } from '../../../../assets/icons';
import { Button } from '../../../Button';
import { Dropdown } from '../../../Dropdown';
import { Multiselect } from '../../../Multiselect';
import { TextInput } from '../../../TextInput';
import { useDatasourceFieldPaths } from '../../builder-hooks';
import { ExpressionEditor } from '../../expression/ExpressionEditor';
import type {
    AggregateFunction,
    DerivedAggregate,
    DerivedGroupKey,
    DerivedJoinCondition,
    DerivedTransformGroup,
    DerivedTransformJoin,
    DerivedTransformPivot,
    DerivedTransformUnion,
    DerivedTransformUnpivot,
    DerivedTransformWindow,
    DerivedWindowColumn,
    JoinType,
    WindowFunction,
} from '../../report-definition-types';
import { FieldPathInput } from '../props/FieldPathInput';
import { FieldPathList } from '../props/FieldPathList';
import { SortKeysEditor } from '../props/SortKeysEditor';
import { aggregateOptions, joinModeOptions, joinTypeOptions, windowFunctionsWithField, windowOptions } from './transform-catalog';
import type { TransformEditorProps } from './transform-editor-types';

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="eui-rb-derived-section-label">{children}</div>
);

export const GroupEditor: React.FC<TransformEditorProps<DerivedTransformGroup>> = ({ transform, onChange, typeContext, idPrefix }) => {
    const updateKey = (i: number, patch: Partial<DerivedGroupKey>) =>
        onChange({ ...transform, keys: transform.keys.map((k, idx) => (idx === i ? { ...k, ...patch } : k)) });
    const updateAgg = (i: number, patch: Partial<DerivedAggregate>) =>
        onChange({ ...transform, aggregates: transform.aggregates.map((a, idx) => (idx === i ? { ...a, ...patch } : a)) });

    return (
        <>
            <SectionLabel>Group by</SectionLabel>
            <div className="eui-rb-list-editor">
                {transform.keys.map((k, i) => (
                    <div key={i} className="eui-rb-list-editor-card">
                        <div className="eui-rb-list-editor-row">
                            <div className="eui-rb-list-editor-grow">
                                <TextInput value={k.name} onChange={(e) => updateKey(i, { name: e.value })} placeholder="Output field name" size="sm" aria-label={`Group key ${i + 1} name`} />
                            </div>
                            <Button layout="plain" size="xs" onClick={() => onChange({ ...transform, keys: transform.keys.filter((_, idx) => idx !== i) })} ariaLabel={`Remove group key ${i + 1}`} leftIcon={<TrashIcon aria-hidden="true" />} />
                        </div>
                        <ExpressionEditor
                            value={k.expression}
                            onChange={(expression) => updateKey(i, { expression })}
                            typeContext={typeContext}
                            placeholder="e.g. Field.assignee or StartOf('month', Field.created)"
                            aria-label={`Group key ${i + 1} expression`}
                        />
                    </div>
                ))}
                <Button layout="plain" size="xs" onClick={() => onChange({ ...transform, keys: [...transform.keys, { name: '', expression: '' }] })} leftIcon={<PlusIcon aria-hidden="true" />} label="Add group key" />
            </div>

            <SectionLabel>Aggregates</SectionLabel>
            <div className="eui-rb-list-editor">
                {transform.aggregates.map((a, i) => (
                    <div key={i} className="eui-rb-list-editor-card">
                        <div className="eui-rb-list-editor-row">
                            <div className="eui-rb-list-editor-grow">
                                <TextInput value={a.name} onChange={(e) => updateAgg(i, { name: e.value })} placeholder="Output field name" size="sm" aria-label={`Aggregate ${i + 1} name`} />
                            </div>
                            <div className="eui-rb-list-editor-grow">
                                <Dropdown options={aggregateOptions} value={a.fn} onChange={(e) => updateAgg(i, { fn: e.value as AggregateFunction })} size="sm" ariaLabel={`Aggregate ${i + 1} function`} />
                            </div>
                            <Button layout="plain" size="xs" onClick={() => onChange({ ...transform, aggregates: transform.aggregates.filter((_, idx) => idx !== i) })} ariaLabel={`Remove aggregate ${i + 1}`} leftIcon={<TrashIcon aria-hidden="true" />} />
                        </div>
                        <ExpressionEditor
                            value={a.expression ?? ''}
                            onChange={(expression) => updateAgg(i, { expression: expression || undefined })}
                            typeContext={typeContext}
                            placeholder={a.fn === 'count' ? 'Leave empty to count rows' : 'e.g. Field.storyPoints'}
                            aria-label={`Aggregate ${i + 1} value expression`}
                        />
                    </div>
                ))}
                <Button layout="plain" size="xs" onClick={() => onChange({ ...transform, aggregates: [...transform.aggregates, { name: '', fn: 'sum' }] })} leftIcon={<PlusIcon aria-hidden="true" />} label="Add aggregate" />
            </div>

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-rows`}>Keep the grouped rows in field (optional)</label>
                <TextInput id={`${idPrefix}-rows`} value={transform.rowsField ?? ''} onChange={(e) => onChange({ ...transform, rowsField: e.value || undefined })} placeholder="e.g. items" size="sm" />
            </div>
        </>
    );
};

export const JoinEditor: React.FC<TransformEditorProps<DerivedTransformJoin>> = ({ transform, onChange, fieldPaths, datasourceOptions, idPrefix }) => {
    const rightPaths = useDatasourceFieldPaths(transform.datasourceId || undefined);
    const updateOn = (i: number, patch: Partial<DerivedJoinCondition>) =>
        onChange({ ...transform, on: transform.on.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });

    return (
        <>
            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-ds`}>Join with</label>
                <Dropdown id={`${idPrefix}-ds`} options={datasourceOptions} value={transform.datasourceId} onChange={(e) => onChange({ ...transform, datasourceId: e.value })} size="sm" placeholder="Choose datasource" />
            </div>
            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-type`}>Join type</label>
                <Dropdown id={`${idPrefix}-type`} options={joinTypeOptions} value={transform.joinType} onChange={(e) => onChange({ ...transform, joinType: e.value as JoinType })} size="sm" />
            </div>
            <SectionLabel>Match rows where</SectionLabel>
            <div className="eui-rb-list-editor">
                {transform.on.map((c, i) => (
                    <div key={i} className="eui-rb-list-editor-row">
                        <div className="eui-rb-list-editor-grow">
                            <FieldPathInput value={c.left} onChange={(left) => updateOn(i, { left })} fieldPaths={fieldPaths} ariaLabel={`Condition ${i + 1} field of this datasource`} placeholder="This field" />
                        </div>
                        <span className="eui-rb-list-editor-index">=</span>
                        <div className="eui-rb-list-editor-grow">
                            <FieldPathInput value={c.right} onChange={(right) => updateOn(i, { right })} fieldPaths={rightPaths} ariaLabel={`Condition ${i + 1} field of the joined datasource`} placeholder="Other field" />
                        </div>
                        <Button layout="plain" size="xs" onClick={() => onChange({ ...transform, on: transform.on.filter((_, idx) => idx !== i) })} ariaLabel={`Remove condition ${i + 1}`} leftIcon={<TrashIcon aria-hidden="true" />} />
                    </div>
                ))}
                <Button layout="plain" size="xs" onClick={() => onChange({ ...transform, on: [...transform.on, { left: '', right: '' }] })} leftIcon={<PlusIcon aria-hidden="true" />} label="Add condition" />
            </div>
            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-mode`}>Result</label>
                <Dropdown id={`${idPrefix}-mode`} options={joinModeOptions} value={transform.mode} onChange={(e) => onChange({ ...transform, mode: e.value as DerivedTransformJoin['mode'] })} size="sm" />
            </div>
            {transform.mode === 'nest' ? (
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-nest`}>List field name</label>
                    <TextInput id={`${idPrefix}-nest`} value={transform.nestAs ?? ''} onChange={(e) => onChange({ ...transform, nestAs: e.value || undefined })} placeholder="Defaults to the datasource name" size="sm" />
                </div>
            ) : (
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-prefix`}>Prefix for joined fields (optional)</label>
                    <TextInput id={`${idPrefix}-prefix`} value={transform.prefix ?? ''} onChange={(e) => onChange({ ...transform, prefix: e.value || undefined })} placeholder="e.g. sprint_" size="sm" />
                </div>
            )}
        </>
    );
};

export const UnionEditor: React.FC<TransformEditorProps<DerivedTransformUnion>> = ({ transform, onChange, datasourceOptions, idPrefix }) => (
    <>
        <div className="eui-rb-prop-field">
            <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-ds`}>Append rows of</label>
            <Multiselect
                id={`${idPrefix}-ds`}
                options={datasourceOptions}
                value={transform.datasourceIds}
                onChange={(e) => onChange({ ...transform, datasourceIds: (e.value as string[]) ?? [] })}
                placeholder="Choose datasources"
                size="sm"
            />
        </div>
        <div className="eui-rb-prop-field">
            <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-tag`}>Store the source datasource name in field (optional)</label>
            <TextInput id={`${idPrefix}-tag`} value={transform.sourceField ?? ''} onChange={(e) => onChange({ ...transform, sourceField: e.value || undefined })} placeholder="e.g. source" size="sm" />
        </div>
    </>
);

export const PivotEditor: React.FC<TransformEditorProps<DerivedTransformPivot>> = ({ transform, onChange, fieldPaths, idPrefix }) => (
    <>
        <SectionLabel>Row fields</SectionLabel>
        <FieldPathList values={transform.rowFields} onChange={(rowFields) => onChange({ ...transform, rowFields })} fieldPaths={fieldPaths} addLabel="Add row field" itemLabel="Row field" />
        <div className="eui-rb-prop-field">
            <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-col`}>Field whose values become columns</label>
            <FieldPathInput id={`${idPrefix}-col`} value={transform.columnField} onChange={(columnField) => onChange({ ...transform, columnField })} fieldPaths={fieldPaths} ariaLabel="Column field" />
        </div>
        <div className="eui-rb-list-editor-row">
            <div className="eui-rb-prop-field eui-rb-list-editor-grow">
                <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-agg`}>Aggregate</label>
                <Dropdown id={`${idPrefix}-agg`} options={aggregateOptions} value={transform.aggregation} onChange={(e) => onChange({ ...transform, aggregation: e.value as AggregateFunction })} size="sm" />
            </div>
            <div className="eui-rb-prop-field eui-rb-list-editor-grow">
                <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-val`}>Value field</label>
                <FieldPathInput id={`${idPrefix}-val`} value={transform.valueField ?? ''} onChange={(v) => onChange({ ...transform, valueField: v || undefined })} fieldPaths={fieldPaths} ariaLabel="Value field" placeholder="Empty counts rows" />
            </div>
        </div>
        <div className="eui-rb-prop-field">
            <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-pfx`}>Column name prefix (optional)</label>
            <TextInput id={`${idPrefix}-pfx`} value={transform.columnPrefix ?? ''} onChange={(e) => onChange({ ...transform, columnPrefix: e.value || undefined })} size="sm" />
        </div>
        <div className="eui-rb-list-editor-empty">Pivot columns depend on the data, so they appear in field lists after "Load fields".</div>
    </>
);

export const UnpivotEditor: React.FC<TransformEditorProps<DerivedTransformUnpivot>> = ({ transform, onChange, fieldPaths, idPrefix }) => (
    <>
        <SectionLabel>Fields to turn into rows</SectionLabel>
        <FieldPathList values={transform.fields} onChange={(fields) => onChange({ ...transform, fields })} fieldPaths={fieldPaths} addLabel="Add field" itemLabel="Unpivot field" />
        <div className="eui-rb-list-editor-row">
            <div className="eui-rb-prop-field eui-rb-list-editor-grow">
                <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-name`}>Name field</label>
                <TextInput id={`${idPrefix}-name`} value={transform.nameField} onChange={(e) => onChange({ ...transform, nameField: e.value })} size="sm" />
            </div>
            <div className="eui-rb-prop-field eui-rb-list-editor-grow">
                <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-value`}>Value field</label>
                <TextInput id={`${idPrefix}-value`} value={transform.valueField} onChange={(e) => onChange({ ...transform, valueField: e.value })} size="sm" />
            </div>
        </div>
    </>
);

export const WindowEditor: React.FC<TransformEditorProps<DerivedTransformWindow>> = ({ transform, onChange, fieldPaths, typeContext }) => {
    const updateCol = (i: number, patch: Partial<DerivedWindowColumn>) =>
        onChange({ ...transform, columns: transform.columns.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });

    return (
        <>
            <SectionLabel>Restart for each</SectionLabel>
            <FieldPathList
                values={transform.partitionBy}
                onChange={(partitionBy) => onChange({ ...transform, partitionBy })}
                fieldPaths={fieldPaths}
                addLabel="Add field"
                itemLabel="Partition field"
                emptyText="Calculated over all rows."
            />
            <SectionLabel>Order</SectionLabel>
            <SortKeysEditor keys={transform.orderBy} onChange={(orderBy) => onChange({ ...transform, orderBy })} typeContext={typeContext} />
            <SectionLabel>Columns</SectionLabel>
            <div className="eui-rb-list-editor">
                {transform.columns.map((c, i) => (
                    <div key={i} className="eui-rb-list-editor-card">
                        <div className="eui-rb-list-editor-row">
                            <div className="eui-rb-list-editor-grow">
                                <TextInput value={c.name} onChange={(e) => updateCol(i, { name: e.value })} placeholder="Column name" size="sm" aria-label={`Window column ${i + 1} name`} />
                            </div>
                            <div className="eui-rb-list-editor-grow">
                                <Dropdown options={windowOptions} value={c.fn} onChange={(e) => updateCol(i, { fn: e.value as WindowFunction })} size="sm" ariaLabel={`Window column ${i + 1} function`} />
                            </div>
                            <Button layout="plain" size="xs" onClick={() => onChange({ ...transform, columns: transform.columns.filter((_, idx) => idx !== i) })} ariaLabel={`Remove window column ${i + 1}`} leftIcon={<TrashIcon aria-hidden="true" />} />
                        </div>
                        {windowFunctionsWithField.includes(c.fn) && (
                            <FieldPathInput value={c.field ?? ''} onChange={(field) => updateCol(i, { field: field || undefined })} fieldPaths={fieldPaths} ariaLabel={`Window column ${i + 1} field`} placeholder="Field" />
                        )}
                    </div>
                ))}
                <Button layout="plain" size="xs" onClick={() => onChange({ ...transform, columns: [...transform.columns, { name: '', fn: 'runningSum' }] })} leftIcon={<PlusIcon aria-hidden="true" />} label="Add column" />
            </div>
        </>
    );
};
