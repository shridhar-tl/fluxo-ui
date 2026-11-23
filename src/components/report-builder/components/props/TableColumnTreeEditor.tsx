import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from '../../../../assets/icons';
import { Button } from '../../../Button';
import { Checkbox } from '../../../Checkbox';
import { ColorPicker } from '../../../color-picker';
import { Dropdown } from '../../../Dropdown';
import { TextInput } from '../../../TextInput';
import type { ListItem } from '../../../../types';
import type {
    ConditionalFormat,
    TableCellItem,
    TableColumnDef,
    TableColumnGroupNode,
    TableColumnNode,
} from '../../report-definition-types';
import type { SuggestedColumn } from '../../data/value-utils';
import { flattenColumns, isGroupColumn, isLeafColumn } from '../../table-helpers';
import { CollapsibleCard, CollapsibleSection } from './CollapsibleCard';
import { ExpressionField } from './ExpressionField';
import { FieldPathInput } from './FieldPathInput';
import { TableCellItemsEditor } from './TableCellItemsEditor';

const alignOptions: ListItem[] = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
];

const widthPattern = /^(auto|\d+(\.\d+)?(px|%|em|rem|ch|vw)?)$/;

function widthError(width: string | undefined): string | null {
    if (!width?.trim()) return null;
    return widthPattern.test(width.trim()) ? null : 'Use a number, or a size such as 120px, 20% or 8rem.';
}

interface Props {
    tree: TableColumnNode[];
    onChange: (tree: TableColumnNode[]) => void;
    /** Field paths of the bound datasource, offered as suggestions and for adding columns in bulk. */
    fieldPaths?: string[];
    /** One readable column per datasource field, added by the "+ N fields" button. */
    suggestedColumns?: SuggestedColumn[];
}

interface ExpansionState {
    isOpen: (id: string) => boolean;
    toggle: (id: string) => void;
}

interface NodeCallbacks {
    expansion: ExpansionState;
    fieldPaths: string[];
    onCreated: (id: string) => void;
}

function collectIds(nodes: TableColumnNode[], out: string[] = []): string[] {
    for (const node of nodes) {
        out.push(node.id);
        if (isGroupColumn(node)) collectIds(node.children, out);
    }
    return out;
}

function newLeaf(label: string, field = ''): TableColumnDef {
    return { kind: 'column', id: crypto.randomUUID(), field, label };
}

function newGroup(label: string): TableColumnGroupNode {
    return { kind: 'group', id: crypto.randomUUID(), label, children: [] };
}

export const TableColumnTreeEditor: React.FC<Props> = ({ tree, onChange, fieldPaths = [], suggestedColumns = [] }) => {
    const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

    const expansion = useMemo<ExpansionState>(() => ({
        isOpen: (id) => openIds.has(id),
        toggle: (id) => setOpenIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        }),
    }), [openIds]);

    const onCreated = useCallback((id: string) => setOpenIds((prev) => new Set(prev).add(id)), []);
    const callbacks = useMemo<NodeCallbacks>(() => ({ expansion, fieldPaths, onCreated }), [expansion, fieldPaths, onCreated]);

    const usedFields = useMemo(() => new Set(flattenColumns(tree).map((c) => c.field).filter(Boolean)), [tree]);
    const unusedFields = useMemo(() => suggestedColumns.filter((c) => !usedFields.has(c.path)), [suggestedColumns, usedFields]);
    const allIds = useMemo(() => collectIds(tree), [tree]);
    const allOpen = allIds.length > 0 && allIds.every((id) => openIds.has(id));

    const addLeaf = () => {
        const col = newLeaf(`Column ${tree.length + 1}`);
        onCreated(col.id);
        onChange([...tree, col]);
    };

    const addGroup = () => {
        const grp = newGroup(`Group ${tree.length + 1}`);
        onCreated(grp.id);
        onChange([...tree, grp]);
    };

    const addAllFields = () => onChange([...tree, ...unusedFields.map((c) => ({ ...newLeaf(c.label, c.path), formatExpr: c.formatExpr }))]);

    return (
        <div className="eui-rb-col-editor">
            <div className="eui-rb-col-editor-toolbar">
                <Button layout="outlined" size="xs" onClick={addLeaf} label="+ Column" ariaLabel="Add column" />
                <Button layout="outlined" size="xs" onClick={addGroup} label="+ Group" ariaLabel="Add column group" />
                {unusedFields.length > 0 && (
                    <Button
                        layout="outlined"
                        size="xs"
                        onClick={addAllFields}
                        label={`+ ${unusedFields.length} field${unusedFields.length === 1 ? '' : 's'}`}
                        title="Add a column for every datasource field that is not shown yet"
                        ariaLabel="Add a column for every unused datasource field"
                    />
                )}
                {allIds.length > 0 && (
                    <Button
                        layout="plain"
                        size="xs"
                        className="eui-rb-col-editor-expand"
                        onClick={() => setOpenIds(allOpen ? new Set() : new Set(allIds))}
                        label={allOpen ? 'Collapse all' : 'Expand all'}
                    />
                )}
            </div>
            {tree.length === 0 ? (
                <div className="eui-rb-list-editor-empty">No columns yet. Add columns, or add every datasource field at once.</div>
            ) : (
                <ColumnNodeList nodes={tree} onChange={onChange} callbacks={callbacks} />
            )}
        </div>
    );
};

const ColumnNodeList: React.FC<{
    nodes: TableColumnNode[];
    onChange: (nodes: TableColumnNode[]) => void;
    callbacks: NodeCallbacks;
}> = ({ nodes, onChange, callbacks }) => {
    const update = (index: number, next: TableColumnNode) => onChange(nodes.map((n, i) => (i === index ? next : n)));
    const remove = (index: number) => onChange(nodes.filter((_, i) => i !== index));
    const move = (index: number, dir: -1 | 1) => {
        const target = index + dir;
        if (target < 0 || target >= nodes.length) return;
        const next = [...nodes];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    return (
        <div className="eui-rb-col-editor-list">
            {nodes.map((node, idx) => {
                const actions = (
                    <>
                        <Button layout="plain" size="xs" onClick={() => move(idx, -1)} disabled={idx === 0} ariaLabel={`Move ${node.label || 'column'} up`} leftIcon={<ChevronUpIcon aria-hidden="true" />} />
                        <Button layout="plain" size="xs" onClick={() => move(idx, 1)} disabled={idx === nodes.length - 1} ariaLabel={`Move ${node.label || 'column'} down`} leftIcon={<ChevronDownIcon aria-hidden="true" />} />
                        <Button layout="plain" size="xs" variant="danger" onClick={() => remove(idx)} ariaLabel={`Remove ${node.label || 'column'}`} leftIcon={<TrashIcon aria-hidden="true" />} />
                    </>
                );
                if (isGroupColumn(node)) {
                    return <GroupNode key={node.id} node={node} actions={actions} callbacks={callbacks} onUpdate={(next) => update(idx, next)} />;
                }
                if (isLeafColumn(node)) {
                    return <LeafNode key={node.id} node={node} actions={actions} callbacks={callbacks} onUpdate={(next) => update(idx, next)} />;
                }
                return null;
            })}
        </div>
    );
};

interface NodeProps<T extends TableColumnNode> {
    node: T;
    actions: React.ReactNode;
    callbacks: NodeCallbacks;
    onUpdate: (node: TableColumnNode) => void;
}

const GroupNode: React.FC<NodeProps<TableColumnGroupNode>> = ({ node, actions, callbacks, onUpdate }) => {
    const update = (patch: Partial<TableColumnGroupNode>) => onUpdate({ ...node, ...patch });
    const leafCount = flattenColumns(node.children).length;
    const labelError = node.label.trim() ? null : 'Enter the text shown above the grouped columns.';

    const addChild = (child: TableColumnNode) => {
        callbacks.onCreated(child.id);
        update({ children: [...node.children, child] });
    };

    return (
        <CollapsibleCard
            id={`rb-col-${node.id}`}
            variant="group"
            className={labelError ? 'invalid' : undefined}
            badge="Group"
            title={node.label || 'Untitled group'}
            subtitle={`${leafCount} column${leafCount === 1 ? '' : 's'}`}
            open={callbacks.expansion.isOpen(node.id)}
            onToggle={() => callbacks.expansion.toggle(node.id)}
            actions={actions}
        >
            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label" htmlFor={`rb-col-${node.id}-label`}>Label</label>
                <TextInput id={`rb-col-${node.id}-label`} value={node.label} onChange={(e) => update({ label: e.value })} placeholder="Group label" size="sm" invalid={!!labelError} />
                {labelError && <span className="eui-rb-ds-config-error">{labelError}</span>}
            </div>
            <ExpressionField
                label="Visible"
                value={typeof node.visible === 'string' ? node.visible : ''}
                onChange={(v) => update({ visible: v || undefined })}
                placeholder="=Parameters.showGroup"
                expectedReturnType="boolean"
                multiline={false}
            />
            <div className="eui-rb-col-editor-toolbar">
                <Button layout="outlined" size="xs" onClick={() => addChild(newLeaf(`Column ${node.children.length + 1}`))} label="+ Column" ariaLabel={`Add column to ${node.label}`} />
                <Button layout="outlined" size="xs" onClick={() => addChild(newGroup(`Group ${node.children.length + 1}`))} label="+ Group" ariaLabel={`Add group to ${node.label}`} />
            </div>
            {node.children.length > 0 && (
                <ColumnNodeList nodes={node.children} onChange={(children) => update({ children })} callbacks={callbacks} />
            )}
        </CollapsibleCard>
    );
};

const LeafNode: React.FC<NodeProps<TableColumnDef>> = ({ node, actions, callbacks, onUpdate }) => {
    const update = (patch: Partial<TableColumnDef>) => onUpdate({ ...node, ...patch, kind: 'column' });
    const idPrefix = `rb-col-${node.id}`;
    const formatCount = node.conditionalFormats?.length ?? 0;
    const itemCount = node.cellItems?.length ?? 0;
    const subtitle = [node.field || 'No field', node.frozen ? 'frozen' : '', node.visible ? 'conditional' : ''].filter(Boolean).join(' · ');
    const fieldError = node.field.trim() ? null : 'Choose the field shown in this column.';
    const unknownField = !fieldError && callbacks.fieldPaths.length > 0 && !callbacks.fieldPaths.includes(node.field.trim());
    const sizeError = widthError(node.width);
    const invalid = !!fieldError || !!sizeError;

    return (
        <CollapsibleCard
            id={idPrefix}
            className={invalid ? 'invalid' : undefined}
            badge="Col"
            title={node.label || node.field || 'Untitled column'}
            subtitle={subtitle}
            open={callbacks.expansion.isOpen(node.id)}
            onToggle={() => callbacks.expansion.toggle(node.id)}
            actions={actions}
        >
            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-field`}>Field</label>
                {callbacks.fieldPaths.length > 0 ? (
                    <FieldPathInput
                        id={`${idPrefix}-field`}
                        value={node.field}
                        onChange={(field) => update({ field })}
                        fieldPaths={callbacks.fieldPaths}
                        placeholder="Field name"
                        ariaLabel="Column field"
                    />
                ) : (
                    <TextInput id={`${idPrefix}-field`} value={node.field} onChange={(e) => update({ field: e.value })} placeholder="Field name" size="sm" invalid={!!fieldError} />
                )}
                {fieldError && <span className="eui-rb-ds-config-error">{fieldError}</span>}
                {unknownField && <span className="eui-rb-ds-config-hint">The datasource has no field "{node.field}". Rows show it empty unless the field appears when the report runs.</span>}
            </div>
            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-label`}>Label</label>
                <TextInput id={`${idPrefix}-label`} value={node.label} onChange={(e) => update({ label: e.value })} placeholder="Header label" size="sm" />
            </div>
            <div className="eui-rb-prop-row">
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-width`}>Width</label>
                    <TextInput id={`${idPrefix}-width`} value={node.width ?? ''} onChange={(e) => update({ width: e.value || undefined })} placeholder="e.g. 120px" size="sm" invalid={!!sizeError} />
                    {sizeError && <span className="eui-rb-ds-config-error">{sizeError}</span>}
                </div>
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label" htmlFor={`${idPrefix}-align`}>Align</label>
                    <Dropdown
                        id={`${idPrefix}-align`}
                        options={alignOptions}
                        value={node.align ?? 'left'}
                        onChange={(e) => update({ align: e.value as TableColumnDef['align'] })}
                        size="sm"
                    />
                </div>
            </div>
            <Checkbox
                checked={node.frozen ?? false}
                onChange={(e) => update({ frozen: e.value || undefined })}
                label="Freeze column while scrolling"
            />
            <ExpressionField
                label="Format"
                value={node.formatExpr ?? ''}
                onChange={(v) => update({ formatExpr: v || undefined })}
                placeholder="=expression or plain text"
                expectedReturnType="string"
                multiline={false}
                hint="Text shown in place of the raw value. Start with = to compute it, for example =FormatNumber(Field.hours, 2)."
            />
            <ExpressionField
                label="Visible"
                value={typeof node.visible === 'string' ? node.visible : ''}
                onChange={(v) => update({ visible: v ? v : undefined })}
                placeholder="=Parameters.showColumn"
                expectedReturnType="boolean"
                multiline={false}
                hint="The column is hidden when this is false. Leave it empty to always show the column."
            />
            <CollapsibleSection title="Conditional formatting" count={formatCount}>
                <ConditionalFormatsEditor
                    formats={node.conditionalFormats ?? []}
                    onChange={(formats) => update({ conditionalFormats: formats.length > 0 ? formats : undefined })}
                />
            </CollapsibleSection>
            <CollapsibleSection title="Cell content" count={itemCount}>
                <TableCellItemsEditor
                    items={node.cellItems ?? []}
                    onChange={(cellItems: TableCellItem[]) => update({ cellItems: cellItems.length > 0 ? cellItems : undefined })}
                />
            </CollapsibleSection>
        </CollapsibleCard>
    );
};

const ConditionalFormatsEditor: React.FC<{
    formats: ConditionalFormat[];
    onChange: (formats: ConditionalFormat[]) => void;
}> = ({ formats, onChange }) => {
    const add = () =>
        onChange([
            ...formats,
            {
                id: crypto.randomUUID(),
                expression: '',
                backgroundColor: '#fef3c7',
                textColor: '',
                fontWeight: 'normal',
                fontStyle: 'normal',
            },
        ]);
    const updateOne = (id: string, patch: Partial<ConditionalFormat>) =>
        onChange(formats.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    const removeOne = (id: string) => onChange(formats.filter((f) => f.id !== id));

    return (
        <div className="eui-rb-cond-formats">
            {formats.length === 0 && <div className="eui-rb-list-editor-empty">No rules. Rules change a cell's colors when their condition is true.</div>}
            {formats.map((fmt, index) => (
                <div key={fmt.id} className="eui-rb-cond-format">
                    <div className="eui-rb-cond-format-header">
                        <span>Rule {index + 1}</span>
                        <Button
                            layout="plain"
                            size="xs"
                            variant="danger"
                            onClick={() => removeOne(fmt.id)}
                            ariaLabel={`Remove rule ${index + 1}`}
                            leftIcon={<TrashIcon aria-hidden="true" />}
                        />
                    </div>
                    <ExpressionField
                        label="When"
                        value={fmt.expression ? `=${fmt.expression}` : ''}
                        onChange={(v) => updateOne(fmt.id, { expression: v.startsWith('=') ? v.slice(1) : v })}
                        placeholder="=Field.amount > 100"
                        expectedReturnType="boolean"
                        multiline={false}
                    />
                    <div className="eui-rb-prop-row">
                        <div className="eui-rb-cond-format-color">
                            <span>Background</span>
                            <ColorPicker
                                variant="input"
                                editable
                                size="sm"
                                showAlpha={false}
                                value={fmt.backgroundColor || '#fef3c7'}
                                onChange={(color) => updateOne(fmt.id, { backgroundColor: color })}
                                ariaLabel="Background color"
                            />
                        </div>
                        <div className="eui-rb-cond-format-color">
                            <span>Text</span>
                            <ColorPicker
                                variant="input"
                                editable
                                size="sm"
                                showAlpha={false}
                                value={fmt.textColor || '#000000'}
                                onChange={(color) => updateOne(fmt.id, { textColor: color })}
                                ariaLabel="Text color"
                            />
                        </div>
                    </div>
                    <div className="eui-rb-prop-row">
                        <Checkbox
                            checked={fmt.fontWeight === 'bold'}
                            onChange={(e) => updateOne(fmt.id, { fontWeight: e.value ? 'bold' : 'normal' })}
                            label="Bold"
                        />
                        <Checkbox
                            checked={fmt.fontStyle === 'italic'}
                            onChange={(e) => updateOne(fmt.id, { fontStyle: e.value ? 'italic' : 'normal' })}
                            label="Italic"
                        />
                    </div>
                </div>
            ))}
            <Button layout="outlined" size="xs" onClick={add} ariaLabel="Add formatting rule" label="+ Rule" />
        </div>
    );
};
