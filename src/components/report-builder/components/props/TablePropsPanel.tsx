import React, { useCallback, useMemo } from 'react';
import { TrashIcon } from '../../../../assets/icons';
import { Button } from '../../../Button';
import { Checkbox } from '../../../Checkbox';
import { Dropdown } from '../../../Dropdown';
import { TextInput } from '../../../TextInput';
import { Sortable } from '../../../drag-drop';
import type { ListItem } from '../../../../types';
import { useReportBuilderContext, useRBStore } from '../../report-builder-context';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import type { ReportComponent, TableComponentProps, TableColumnDef, TableColumnGroup, ConditionalFormat } from '../../report-definition-types';
import { ExpressionField } from './ExpressionField';

interface Props { component: ReportComponent; }

const pivotAggOptions: ListItem[] = [
    { value: 'sum', label: 'Sum' },
    { value: 'count', label: 'Count' },
    { value: 'avg', label: 'Average' },
    { value: 'min', label: 'Min' },
    { value: 'max', label: 'Max' },
];

const alignOptions: ListItem[] = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
];

export const TablePropsPanel: React.FC<Props> = ({ component }) => {
    const { store } = useReportBuilderContext();
    const datasources = useRBStore((s) => s.definition.datasources);
    const p = component.props as unknown as TableComponentProps;
    const columns = p.columns ?? [];

    const update = useCallback((patch: Partial<TableComponentProps>) => {
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

    const updateColumn = useCallback((colId: string, patch: Partial<TableColumnDef>) => {
        update({
            columns: columns.map((c) => c.id === colId ? { ...c, ...patch } : c),
        });
    }, [update, columns]);

    const addColumn = useCallback((field?: string) => {
        const col: TableColumnDef = {
            id: crypto.randomUUID(),
            field: field ?? '',
            label: field ?? `Column ${columns.length + 1}`,
        };
        update({ columns: [...columns, col] });
    }, [update, columns]);

    const removeColumn = useCallback((colId: string) => {
        update({ columns: columns.filter((c) => c.id !== colId) });
    }, [update, columns]);

    const handleColumnsReorder = useCallback((reordered: TableColumnDef[]) => {
        update({ columns: reordered });
    }, [update]);

    const dsOptions: ListItem[] = useMemo(
        () => [
            { value: '', label: '— Select —' },
            ...datasources.map((ds) => ({ value: ds.id, label: ds.name })),
        ],
        [datasources],
    );

    const selectedDs = useMemo(
        () => datasources.find((d) => d.id === p.datasourceId),
        [datasources, p.datasourceId],
    );

    const dsFields = useMemo(() => {
        if (!selectedDs) return [];
        return [] as string[];
    }, [selectedDs]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        const raw = e.dataTransfer.getData('application/rb-field-drag');
        if (!raw) return;
        e.preventDefault();
        try {
            const { fieldName } = JSON.parse(raw) as { datasourceId: string; fieldName: string };
            addColumn(fieldName);
        } catch { /* ignore */ }
    }, [addColumn]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        if (e.dataTransfer.types.includes('application/rb-field-drag')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        }
    }, []);

    return (
        <div className="eui-rb-props-section">
            <div className="eui-rb-props-section-title">Table</div>

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Datasource</label>
                <Dropdown
                    options={dsOptions}
                    value={p.datasourceId ?? ''}
                    onChange={(e) => update({ datasourceId: e.value })}
                    aria-label="Select datasource"
                    size="sm"
                />
            </div>

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Group By</label>
                <TextInput
                    value={Array.isArray(p.groupBy) ? p.groupBy.join(', ') : (p.groupBy ?? '')}
                    onChange={(e) => {
                        const val = e.value.trim();
                        if (!val) {
                            update({ groupBy: undefined });
                        } else if (val.includes(',')) {
                            update({ groupBy: val.split(',').map((s) => s.trim()).filter(Boolean) });
                        } else {
                            update({ groupBy: val });
                        }
                    }}
                    placeholder="Field name (comma-separated for multi-level)"
                    aria-label="Group by field"
                    size="sm"
                    list={dsFields.length > 0 ? `ds-fields-${component.id}` : undefined}
                />
                {dsFields.length > 0 && (
                    <datalist id={`ds-fields-${component.id}`}>
                        {dsFields.map((f) => <option key={f} value={f} />)}
                    </datalist>
                )}
            </div>

            {p.groupBy && (
                <>
                    <div className="eui-rb-prop-field">
                        <Checkbox
                            checked={p.showGroupFooter ?? false}
                            onChange={(e) => update({ showGroupFooter: e.value })}
                            label="Show group footer"
                        />
                    </div>
                    <ExpressionField
                        label="Group Visible"
                        value={p.groupVisibleExpr ?? ''}
                        onChange={(v) => update({ groupVisibleExpr: v || undefined })}
                        placeholder="=Field._groupKey !== 'hidden'"
                        expectedReturnType="boolean"
                        multiline={false}
                    />
                </>
            )}

            <ExpressionField
                label="Row Visible"
                value={p.rowVisibleExpr ?? ''}
                onChange={(v) => update({ rowVisibleExpr: v || undefined })}
                placeholder="=Field.status !== 'deleted'"
                expectedReturnType="boolean"
                multiline={false}
            />

            <div className="eui-rb-prop-field">
                <Checkbox
                    checked={p.pivotMode ?? false}
                    onChange={(e) => update({ pivotMode: e.value })}
                    label="Pivot mode"
                />
            </div>

            {p.pivotMode && (
                <PivotConfig component={component} update={update} p={p} />
            )}

            <div
                className="eui-rb-props-section-title"
                style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
                <span>Columns ({columns.length})</span>
                <Button
                    layout="outlined"
                    size="xs"
                    onClick={() => addColumn()}
                    ariaLabel="Add column"
                    label="+ Add"
                />
            </div>

            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{ minHeight: columns.length === 0 ? 48 : undefined }}
            >
                {columns.length === 0 && (
                    <div style={{
                        padding: '12px',
                        border: '1px dashed var(--eui-border-subtle)',
                        borderRadius: 6,
                        color: 'var(--eui-text-muted)',
                        fontSize: 11,
                        fontStyle: 'italic',
                        textAlign: 'center',
                    }}>
                        Add columns or drag fields from Datasource Explorer
                    </div>
                )}

                {columns.length > 0 && (
                    <Sortable
                        items={columns}
                        idProp="id"
                        onChange={handleColumnsReorder}
                        orientation="vertical"
                        gap="6px"
                        dropIndicator="line"
                    >
                        {(col: TableColumnDef, idx: number) => (
                            <ColumnEditor
                                key={col.id}
                                col={col}
                                index={idx}
                                onUpdate={(patch) => updateColumn(col.id, patch)}
                                onRemove={() => removeColumn(col.id)}
                            />
                        )}
                    </Sortable>
                )}
            </div>

            <ColumnGroupsEditor
                groups={p.columnGroups ?? []}
                columns={columns}
                onChange={(groups) => update({ columnGroups: groups.length > 0 ? groups : undefined })}
            />
        </div>
    );
};

const ColumnEditor: React.FC<{
    col: TableColumnDef;
    index: number;
    onUpdate: (patch: Partial<TableColumnDef>) => void;
    onRemove: () => void;
}> = ({ col, index, onUpdate, onRemove }) => (
    <div style={{
        border: '1px solid var(--eui-border-subtle)',
        borderRadius: 6,
        padding: 8,
        background: 'var(--eui-bg)',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--eui-text-muted)', fontWeight: 600, flex: 1, cursor: 'grab' }}>
                ☰ #{index + 1}
            </span>
            <Button
                layout="plain"
                size="xs"
                variant="danger"
                onClick={onRemove}
                title="Remove column"
                ariaLabel="Remove column"
                leftIcon={<TrashIcon aria-hidden="true" />}
            />
        </div>

        <div className="eui-rb-prop-field" style={{ marginBottom: 4 }}>
            <label className="eui-rb-prop-field-label">Field</label>
            <TextInput
                value={col.field}
                onChange={(e) => onUpdate({ field: e.value })}
                placeholder="Field name"
                aria-label="Column field"
                size="sm"
            />
        </div>

        <div className="eui-rb-prop-field" style={{ marginBottom: 4 }}>
            <label className="eui-rb-prop-field-label">Label</label>
            <TextInput
                value={col.label}
                onChange={(e) => onUpdate({ label: e.value })}
                placeholder="Header label"
                aria-label="Column label"
                size="sm"
            />
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
            <div className="eui-rb-prop-field" style={{ flex: 1 }}>
                <label className="eui-rb-prop-field-label">Width</label>
                <TextInput
                    value={col.width ?? ''}
                    onChange={(e) => onUpdate({ width: e.value || undefined })}
                    placeholder="e.g. 120px"
                    aria-label="Column width"
                    size="sm"
                />
            </div>
            <div className="eui-rb-prop-field" style={{ flex: 1 }}>
                <label className="eui-rb-prop-field-label">Align</label>
                <Dropdown
                    options={alignOptions}
                    value={col.align ?? 'left'}
                    onChange={(e) => onUpdate({ align: e.value as TableColumnDef['align'] })}
                    aria-label="Column alignment"
                    size="sm"
                />
            </div>
        </div>

        <ExpressionField
            label="Format"
            value={col.formatExpr ?? ''}
            onChange={(v) => onUpdate({ formatExpr: v || undefined })}
            placeholder="=expression or plain text"
            expectedReturnType="string"
            multiline={false}
        />

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Checkbox
                checked={col.frozen ?? false}
                onChange={(e) => onUpdate({ frozen: e.value || undefined })}
                label="Frozen"
            />
        </div>

        <ExpressionField
            label="Visible"
            value={typeof col.visible === 'string' ? col.visible : ''}
            onChange={(v) => onUpdate({ visible: v ? v : undefined })}
            placeholder="=Parameters.showColumn"
            expectedReturnType="boolean"
            multiline={false}
        />

        <ConditionalFormatsEditor
            formats={col.conditionalFormats ?? []}
            onChange={(formats) => onUpdate({ conditionalFormats: formats.length > 0 ? formats : undefined })}
        />
    </div>
);

const ConditionalFormatsEditor: React.FC<{
    formats: ConditionalFormat[];
    onChange: (formats: ConditionalFormat[]) => void;
}> = ({ formats, onChange }) => {
    const addFormat = useCallback(() => {
        onChange([...formats, {
            id: crypto.randomUUID(),
            expression: '',
            backgroundColor: '#fef3c7',
            textColor: '',
            fontWeight: 'normal',
            fontStyle: 'normal',
        }]);
    }, [formats, onChange]);

    const updateFormat = useCallback((id: string, patch: Partial<ConditionalFormat>) => {
        onChange(formats.map((f) => f.id === id ? { ...f, ...patch } : f));
    }, [formats, onChange]);

    const removeFormat = useCallback((id: string) => {
        onChange(formats.filter((f) => f.id !== id));
    }, [formats, onChange]);

    return (
        <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)' }}>
                    Formatting ({formats.length})
                </span>
                <Button
                    layout="outlined"
                    size="xs"
                    onClick={addFormat}
                    ariaLabel="Add formatting rule"
                    label="+ Rule"
                />
            </div>
            {formats.map((fmt) => (
                <div key={fmt.id} style={{ border: '1px solid var(--eui-border-subtle)', borderRadius: 4, padding: 6, marginBottom: 4, background: 'var(--eui-bg-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: 'var(--eui-text-muted)' }}>Condition</span>
                        <Button
                            layout="plain"
                            size="xs"
                            variant="danger"
                            onClick={() => removeFormat(fmt.id)}
                            ariaLabel="Remove rule"
                            leftIcon={<TrashIcon aria-hidden="true" />}
                        />
                    </div>
                    <ExpressionField
                        label=""
                        value={fmt.expression ? `=${fmt.expression}` : ''}
                        onChange={(v) => updateFormat(fmt.id, { expression: v.startsWith('=') ? v.slice(1) : v })}
                        placeholder="=Field.amount > 100"
                        expectedReturnType="boolean"
                        multiline={false}
                    />
                    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10, color: 'var(--eui-text-muted)' }}>BG</label>
                            <input
                                type="color"
                                value={fmt.backgroundColor ?? '#fef3c7'}
                                onChange={(e) => updateFormat(fmt.id, { backgroundColor: e.target.value })}
                                style={{ width: '100%', height: 22, border: '1px solid var(--eui-border-subtle)', borderRadius: 3, cursor: 'pointer', padding: 1, background: 'var(--eui-input-bg)' }}
                                aria-label="Background color"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10, color: 'var(--eui-text-muted)' }}>Text</label>
                            <input
                                type="color"
                                value={fmt.textColor ?? '#000000'}
                                onChange={(e) => updateFormat(fmt.id, { textColor: e.target.value })}
                                style={{ width: '100%', height: 22, border: '1px solid var(--eui-border-subtle)', borderRadius: 3, cursor: 'pointer', padding: 1, background: 'var(--eui-input-bg)' }}
                                aria-label="Text color"
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        <Checkbox
                            checked={fmt.fontWeight === 'bold'}
                            onChange={(e) => updateFormat(fmt.id, { fontWeight: e.value ? 'bold' : 'normal' })}
                            label="Bold"
                        />
                        <Checkbox
                            checked={fmt.fontStyle === 'italic'}
                            onChange={(e) => updateFormat(fmt.id, { fontStyle: e.value ? 'italic' : 'normal' })}
                            label="Italic"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

const ColumnGroupsEditor: React.FC<{
    groups: TableColumnGroup[];
    columns: TableColumnDef[];
    onChange: (groups: TableColumnGroup[]) => void;
}> = ({ groups, columns, onChange }) => {
    const addGroup = useCallback(() => {
        onChange([...groups, {
            id: crypto.randomUUID(),
            label: `Group ${groups.length + 1}`,
            columnIds: [],
        }]);
    }, [groups, onChange]);

    const updateGroup = useCallback((id: string, patch: Partial<TableColumnGroup>) => {
        onChange(groups.map((g) => g.id === id ? { ...g, ...patch } : g));
    }, [groups, onChange]);

    const removeGroup = useCallback((id: string) => {
        onChange(groups.filter((g) => g.id !== id));
    }, [groups, onChange]);

    const toggleColumnInGroup = useCallback((groupId: string, colId: string) => {
        onChange(groups.map((g) => {
            if (g.id !== groupId) return g;
            const has = g.columnIds.includes(colId);
            return { ...g, columnIds: has ? g.columnIds.filter((c) => c !== colId) : [...g.columnIds, colId] };
        }));
    }, [groups, onChange]);

    return (
        <div style={{ marginTop: 12 }}>
            <div className="eui-rb-props-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Column Groups ({groups.length})</span>
                <Button
                    layout="outlined"
                    size="xs"
                    onClick={addGroup}
                    ariaLabel="Add column group"
                    label="+ Group"
                />
            </div>
            {groups.map((group) => (
                <div key={group.id} style={{
                    border: '1px solid var(--eui-border-subtle)',
                    borderRadius: 6,
                    padding: 8,
                    marginBottom: 6,
                    background: 'var(--eui-bg)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                        <TextInput
                            value={group.label}
                            onChange={(e) => updateGroup(group.id, { label: e.value })}
                            placeholder="Group label"
                            aria-label="Column group label"
                            size="sm"
                            style={{ flex: 1 }}
                        />
                        <Button
                            layout="plain"
                            size="xs"
                            variant="danger"
                            onClick={() => removeGroup(group.id)}
                            ariaLabel="Remove group"
                            leftIcon={<TrashIcon aria-hidden="true" />}
                        />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--eui-text-muted)', marginBottom: 4 }}>
                        Select columns:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {columns.map((col) => (
                            <Checkbox
                                key={col.id}
                                checked={group.columnIds.includes(col.id)}
                                onChange={() => toggleColumnInGroup(group.id, col.id)}
                                label={col.label || col.field || col.id}
                            />
                        ))}
                    </div>
                    <ExpressionField
                        label="Group Visible"
                        value={typeof group.visible === 'string' ? group.visible : ''}
                        onChange={(v) => updateGroup(group.id, { visible: v ? v : undefined })}
                        placeholder="=Parameters.showGroup"
                        expectedReturnType="boolean"
                        multiline={false}
                    />
                </div>
            ))}
        </div>
    );
};

const PivotConfig: React.FC<{
    component: ReportComponent;
    update: (patch: Partial<TableComponentProps>) => void;
    p: TableComponentProps;
}> = ({ update, p }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0', borderTop: '1px solid var(--eui-border-subtle)' }}>
        <div className="eui-rb-props-section-title">Pivot Configuration</div>
        <div className="eui-rb-prop-field">
            <label className="eui-rb-prop-field-label">Row Field</label>
            <TextInput
                value={p.pivotRowField ?? ''}
                onChange={(e) => update({ pivotRowField: e.value || undefined })}
                placeholder="Field for row headers"
                size="sm"
            />
        </div>
        <div className="eui-rb-prop-field">
            <label className="eui-rb-prop-field-label">Column Field</label>
            <TextInput
                value={p.pivotColumnField ?? ''}
                onChange={(e) => update({ pivotColumnField: e.value || undefined })}
                placeholder="Field for column headers"
                size="sm"
            />
        </div>
        <div className="eui-rb-prop-field">
            <label className="eui-rb-prop-field-label">Value Field</label>
            <TextInput
                value={p.pivotValueField ?? ''}
                onChange={(e) => update({ pivotValueField: e.value || undefined })}
                placeholder="Field to aggregate"
                size="sm"
            />
        </div>
        <div className="eui-rb-prop-field">
            <label className="eui-rb-prop-field-label">Aggregation</label>
            <Dropdown
                options={pivotAggOptions}
                value={p.pivotAggregation ?? 'sum'}
                onChange={(e) => update({ pivotAggregation: e.value as TableComponentProps['pivotAggregation'] })}
                size="sm"
            />
        </div>
    </div>
);
