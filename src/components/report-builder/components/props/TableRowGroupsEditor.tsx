import React, { useCallback } from 'react';
import { TrashIcon } from '../../../../assets/icons';
import { Button } from '../../../Button';
import { Checkbox } from '../../../Checkbox';
import { Dropdown } from '../../../Dropdown';
import { TextInput } from '../../../TextInput';
import type { ListItem } from '../../../../types';
import type { DatasourceConfig, TableRowGroup, TableRowGroupKind } from '../../report-definition-types';
import { ExpressionField } from './ExpressionField';

const groupKindOptions: ListItem[] = [
    { value: 'parent', label: 'Parent (header + nested)' },
    { value: 'details', label: 'Details (repeating rows)' },
];

interface Props {
    rowGroups: TableRowGroup[];
    datasources: DatasourceConfig[];
    onChange: (rowGroups: TableRowGroup[]) => void;
}

export const TableRowGroupsEditor: React.FC<Props> = ({ rowGroups, datasources, onChange }) => {
    const addTopLevelGroup = useCallback(() => {
        onChange([
            ...rowGroups,
            {
                id: crypto.randomUUID(),
                name: `group${rowGroups.length + 1}`,
                groupKind: 'details',
            },
        ]);
    }, [rowGroups, onChange]);

    return (
        <div style={{ marginTop: 12 }}>
            <div
                className="eui-rb-props-section-title"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
                <span>Row Groups ({countAll(rowGroups)})</span>
                <Button layout="outlined" size="xs" onClick={addTopLevelGroup} ariaLabel="Add row group" label="+ Group" />
            </div>
            {rowGroups.length === 0 && (
                <div
                    style={{
                        padding: 10,
                        border: '1px dashed var(--eui-border-subtle)',
                        borderRadius: 4,
                        color: 'var(--eui-text-muted)',
                        fontSize: 11,
                        fontStyle: 'italic',
                        textAlign: 'center',
                    }}
                >
                    Add row groups for multi-level grouping with dataset, filter, sort, keys and variables
                </div>
            )}
            {rowGroups.map((g, idx) => (
                <RowGroupNodeEditor
                    key={g.id}
                    group={g}
                    datasources={datasources}
                    onUpdate={(next) => {
                        const copy = [...rowGroups];
                        copy[idx] = next;
                        onChange(copy);
                    }}
                    onRemove={() => onChange(rowGroups.filter((_, i) => i !== idx))}
                    depth={0}
                />
            ))}
        </div>
    );
};

function countAll(list: TableRowGroup[]): number {
    let n = 0;
    for (const g of list) {
        n += 1;
        if (g.children) n += countAll(g.children);
    }
    return n;
}

const RowGroupNodeEditor: React.FC<{
    group: TableRowGroup;
    datasources: DatasourceConfig[];
    onUpdate: (group: TableRowGroup) => void;
    onRemove: () => void;
    depth: number;
}> = ({ group, datasources, onUpdate, onRemove, depth }) => {
    const update = useCallback(
        (patch: Partial<TableRowGroup>) => onUpdate({ ...group, ...patch }),
        [group, onUpdate],
    );

    const dsOptions: ListItem[] = [
        { value: '', label: '(inherit parent rows)' },
        ...datasources.map((d) => ({ value: d.id, label: d.name })),
        { value: '__expression__', label: 'Expression dataset' },
    ];

    const addKey = () => update({ keys: [...(group.keys ?? []), ''] });
    const updateKey = (i: number, v: string) => update({ keys: (group.keys ?? []).map((k, idx) => (idx === i ? v : k)) });
    const removeKey = (i: number) => update({ keys: (group.keys ?? []).filter((_, idx) => idx !== i) });

    const addVariable = () =>
        update({ variables: [...(group.variables ?? []), { key: `var${(group.variables ?? []).length + 1}`, expression: '' }] });
    const updateVariable = (i: number, patch: { key?: string; expression?: string }) =>
        update({ variables: (group.variables ?? []).map((v, idx) => (idx === i ? { ...v, ...patch } : v)) });
    const removeVariable = (i: number) => update({ variables: (group.variables ?? []).filter((_, idx) => idx !== i) });

    const addChild = () =>
        update({
            children: [
                ...(group.children ?? []),
                {
                    id: crypto.randomUUID(),
                    name: `child${(group.children ?? []).length + 1}`,
                    groupKind: 'details',
                },
            ],
        });

    return (
        <div
            style={{
                border: '1px solid var(--eui-border-subtle)',
                borderLeft: `3px solid var(--eui-primary)`,
                borderRadius: 4,
                padding: 8,
                marginTop: 6,
                marginLeft: depth * 8,
                background: 'var(--eui-bg)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <TextInput
                    value={group.name}
                    onChange={(e) => update({ name: e.value })}
                    placeholder="Group name (used in RowGroup('name'))"
                    size="sm"
                    style={{ flex: 1 }}
                    aria-label="Row group name"
                />
                <Dropdown
                    options={groupKindOptions}
                    value={group.groupKind}
                    onChange={(e) => update({ groupKind: e.value as TableRowGroupKind })}
                    size="sm"
                    aria-label="Group kind"
                />
                <Button
                    layout="plain"
                    size="xs"
                    variant="danger"
                    onClick={onRemove}
                    ariaLabel="Remove group"
                    leftIcon={<TrashIcon aria-hidden="true" />}
                />
            </div>

            <div style={{ marginBottom: 6 }}>
                <label style={{ fontSize: 10, color: 'var(--eui-text-muted)' }}>Dataset</label>
                <Dropdown
                    options={dsOptions}
                    value={group.datasetId ?? ''}
                    onChange={(e) => update({ datasetId: e.value || undefined })}
                    size="sm"
                />
                {group.datasetId === '__expression__' && (
                    <ExpressionField
                        label="Dataset Expression"
                        value={group.datasetExpression ?? ''}
                        onChange={(v) => update({ datasetExpression: v || undefined })}
                        placeholder="Datasources.orders"
                        expectedReturnType="any"
                        multiline={false}
                    />
                )}
            </div>

            <ExpressionField
                label="Filter"
                value={group.filter ?? ''}
                onChange={(v) => update({ filter: v || undefined })}
                placeholder="Field.amount > 100"
                expectedReturnType="boolean"
                multiline={false}
            />

            <ExpressionField
                label="Sort By"
                value={group.sortBy ?? ''}
                onChange={(v) => update({ sortBy: v || undefined })}
                placeholder="Field.createdAt"
                expectedReturnType="any"
                multiline={false}
            />

            <ExpressionField
                label="Visible"
                value={group.visible ?? ''}
                onChange={(v) => update({ visible: v || undefined })}
                placeholder="Parameters.showGroup"
                expectedReturnType="boolean"
                multiline={false}
            />

            <div style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: 'var(--eui-text-muted)' }}>Group Keys ({(group.keys ?? []).length})</span>
                    <Button layout="plain" size="xs" onClick={addKey} label="+ Key" />
                </div>
                {(group.keys ?? []).map((k, i) => (
                    <div key={i} style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        <ExpressionField
                            label=""
                            value={k}
                            onChange={(v) => updateKey(i, v)}
                            placeholder="Field.category"
                            expectedReturnType="any"
                            multiline={false}
                        />
                        <Button
                            layout="plain"
                            size="xs"
                            variant="danger"
                            onClick={() => removeKey(i)}
                            ariaLabel="Remove key"
                            leftIcon={<TrashIcon aria-hidden="true" />}
                        />
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: 'var(--eui-text-muted)' }}>Variables ({(group.variables ?? []).length})</span>
                    <Button layout="plain" size="xs" onClick={addVariable} label="+ Variable" />
                </div>
                {(group.variables ?? []).map((v, i) => (
                    <div key={i} style={{ display: 'flex', gap: 4, marginTop: 4, alignItems: 'flex-start' }}>
                        <TextInput
                            value={v.key}
                            onChange={(e) => updateVariable(i, { key: e.value })}
                            placeholder="varName"
                            size="sm"
                            style={{ maxWidth: 120 }}
                        />
                        <ExpressionField
                            label=""
                            value={v.expression}
                            onChange={(val) => updateVariable(i, { expression: val })}
                            placeholder="Sum(Field.amount)"
                            expectedReturnType="any"
                            multiline={false}
                        />
                        <Button
                            layout="plain"
                            size="xs"
                            variant="danger"
                            onClick={() => removeVariable(i)}
                            ariaLabel="Remove variable"
                            leftIcon={<TrashIcon aria-hidden="true" />}
                        />
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 6 }}>
                <Checkbox
                    checked={group.showFooter === true}
                    onChange={(e) => update({ showFooter: e.value || undefined })}
                    label="Show footer row"
                />
            </div>

            <div style={{ marginTop: 10 }}>
                <Button layout="outlined" size="xs" onClick={addChild} label="+ Nested Group" ariaLabel="Add nested group" />
            </div>
            {(group.children ?? []).map((child, idx) => (
                <RowGroupNodeEditor
                    key={child.id}
                    group={child}
                    datasources={datasources}
                    onUpdate={(next) =>
                        update({
                            children: (group.children ?? []).map((c, i) => (i === idx ? next : c)),
                        })
                    }
                    onRemove={() => update({ children: (group.children ?? []).filter((_, i) => i !== idx) })}
                    depth={depth + 1}
                />
            ))}
        </div>
    );
};
