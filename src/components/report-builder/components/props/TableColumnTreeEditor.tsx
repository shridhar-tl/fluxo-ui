import React, { useCallback } from 'react';
import { TrashIcon } from '../../../../assets/icons';
import { Button } from '../../../Button';
import { Checkbox } from '../../../Checkbox';
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
import { isGroupColumn, isLeafColumn } from '../../table-helpers';
import { ExpressionField } from './ExpressionField';
import { TableCellItemsEditor } from './TableCellItemsEditor';

const alignOptions: ListItem[] = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
];

interface Props {
    tree: TableColumnNode[];
    onChange: (tree: TableColumnNode[]) => void;
}

export const TableColumnTreeEditor: React.FC<Props> = ({ tree, onChange }) => {
    const addLeaf = useCallback(() => {
        const col: TableColumnDef = {
            kind: 'column',
            id: crypto.randomUUID(),
            field: '',
            label: `Column ${tree.length + 1}`,
        };
        onChange([...tree, col]);
    }, [tree, onChange]);

    const addGroup = useCallback(() => {
        const grp: TableColumnGroupNode = {
            kind: 'group',
            id: crypto.randomUUID(),
            label: `Group ${tree.length + 1}`,
            children: [],
        };
        onChange([...tree, grp]);
    }, [tree, onChange]);

    return (
        <div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                <Button layout="outlined" size="xs" onClick={addLeaf} label="+ Column" ariaLabel="Add column" />
                <Button layout="outlined" size="xs" onClick={addGroup} label="+ Group" ariaLabel="Add column group" />
            </div>
            <ColumnNodeList
                nodes={tree}
                onChange={onChange}
                depth={0}
            />
        </div>
    );
};

const ColumnNodeList: React.FC<{
    nodes: TableColumnNode[];
    onChange: (nodes: TableColumnNode[]) => void;
    depth: number;
}> = ({ nodes, onChange, depth }) => {
    const update = useCallback(
        (index: number, next: TableColumnNode) => {
            const copy = [...nodes];
            copy[index] = next;
            onChange(copy);
        },
        [nodes, onChange],
    );
    const remove = useCallback(
        (index: number) => {
            onChange(nodes.filter((_, i) => i !== index));
        },
        [nodes, onChange],
    );
    const move = useCallback(
        (index: number, dir: -1 | 1) => {
            const next = [...nodes];
            const target = index + dir;
            if (target < 0 || target >= next.length) return;
            [next[index], next[target]] = [next[target], next[index]];
            onChange(next);
        },
        [nodes, onChange],
    );
    return (
        <>
            {nodes.map((node, idx) => (
                <ColumnNodeItem
                    key={node.id}
                    node={node}
                    depth={depth}
                    onUpdate={(next) => update(idx, next)}
                    onRemove={() => remove(idx)}
                    onMoveUp={idx > 0 ? () => move(idx, -1) : undefined}
                    onMoveDown={idx < nodes.length - 1 ? () => move(idx, 1) : undefined}
                />
            ))}
        </>
    );
};

const ColumnNodeItem: React.FC<{
    node: TableColumnNode;
    depth: number;
    onUpdate: (node: TableColumnNode) => void;
    onRemove: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
}> = ({ node, depth, onUpdate, onRemove, onMoveUp, onMoveDown }) => {
    if (isGroupColumn(node)) {
        return (
            <GroupNodeBody
                node={node}
                depth={depth}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
            />
        );
    }
    if (isLeafColumn(node)) {
        return (
            <LeafNodeBody
                node={node}
                depth={depth}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
            />
        );
    }
    return null;
};

const GroupNodeBody: React.FC<{
    node: TableColumnGroupNode;
    depth: number;
    onUpdate: (node: TableColumnNode) => void;
    onRemove: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
}> = ({ node, depth, onUpdate, onRemove, onMoveUp, onMoveDown }) => {
    const update = (patch: Partial<TableColumnGroupNode>) => onUpdate({ ...node, ...patch });
    const addChildLeaf = () => {
        const col: TableColumnDef = {
            kind: 'column',
            id: crypto.randomUUID(),
            field: '',
            label: `Column ${node.children.length + 1}`,
        };
        update({ children: [...node.children, col] });
    };
    const addChildGroup = () => {
        const grp: TableColumnGroupNode = {
            kind: 'group',
            id: crypto.randomUUID(),
            label: `Group ${node.children.length + 1}`,
            children: [],
        };
        update({ children: [...node.children, grp] });
    };

    return (
        <div
            style={{
                border: '1px solid var(--eui-border-subtle)',
                borderLeft: `3px solid var(--eui-success, #10b981)`,
                borderRadius: 4,
                padding: 8,
                marginTop: 6,
                marginLeft: depth * 8,
                background: 'var(--eui-bg)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--eui-text-muted)', fontWeight: 600 }}>GROUP</span>
                <TextInput
                    value={node.label}
                    onChange={(e) => update({ label: e.value })}
                    placeholder="Group label"
                    size="sm"
                    style={{ flex: 1 }}
                />
                {onMoveUp && <Button layout="plain" size="xs" onClick={onMoveUp} ariaLabel="Move up">↑</Button>}
                {onMoveDown && <Button layout="plain" size="xs" onClick={onMoveDown} ariaLabel="Move down">↓</Button>}
                <Button
                    layout="plain"
                    size="xs"
                    variant="danger"
                    onClick={onRemove}
                    ariaLabel="Remove group"
                    leftIcon={<TrashIcon aria-hidden="true" />}
                />
            </div>
            <ExpressionField
                label="Visible"
                value={typeof node.visible === 'string' ? node.visible : ''}
                onChange={(v) => update({ visible: v || undefined })}
                placeholder="=Parameters.showGroup"
                expectedReturnType="boolean"
                multiline={false}
            />
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                <Button layout="outlined" size="xs" onClick={addChildLeaf} label="+ Column" />
                <Button layout="outlined" size="xs" onClick={addChildGroup} label="+ Group" />
            </div>
            <ColumnNodeList
                nodes={node.children}
                onChange={(children) => update({ children })}
                depth={depth + 1}
            />
        </div>
    );
};

const LeafNodeBody: React.FC<{
    node: TableColumnDef;
    depth: number;
    onUpdate: (node: TableColumnNode) => void;
    onRemove: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
}> = ({ node, depth, onUpdate, onRemove, onMoveUp, onMoveDown }) => {
    const update = (patch: Partial<TableColumnDef>) =>
        onUpdate({ ...node, ...patch, kind: 'column' });
    return (
        <div
            style={{
                border: '1px solid var(--eui-border-subtle)',
                borderRadius: 4,
                padding: 8,
                marginTop: 6,
                marginLeft: depth * 8,
                background: 'var(--eui-bg)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--eui-text-muted)', fontWeight: 600 }}>COL</span>
                {onMoveUp && <Button layout="plain" size="xs" onClick={onMoveUp} ariaLabel="Move up">↑</Button>}
                {onMoveDown && <Button layout="plain" size="xs" onClick={onMoveDown} ariaLabel="Move down">↓</Button>}
                <div style={{ flex: 1 }} />
                <Button
                    layout="plain"
                    size="xs"
                    variant="danger"
                    onClick={onRemove}
                    ariaLabel="Remove column"
                    leftIcon={<TrashIcon aria-hidden="true" />}
                />
            </div>
            <div className="eui-rb-prop-field" style={{ marginBottom: 4 }}>
                <label className="eui-rb-prop-field-label">Field</label>
                <TextInput value={node.field} onChange={(e) => update({ field: e.value })} placeholder="Field name" size="sm" />
            </div>
            <div className="eui-rb-prop-field" style={{ marginBottom: 4 }}>
                <label className="eui-rb-prop-field-label">Label</label>
                <TextInput value={node.label} onChange={(e) => update({ label: e.value })} placeholder="Header label" size="sm" />
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                <div className="eui-rb-prop-field" style={{ flex: 1 }}>
                    <label className="eui-rb-prop-field-label">Width</label>
                    <TextInput value={node.width ?? ''} onChange={(e) => update({ width: e.value || undefined })} placeholder="e.g. 120px" size="sm" />
                </div>
                <div className="eui-rb-prop-field" style={{ flex: 1 }}>
                    <label className="eui-rb-prop-field-label">Align</label>
                    <Dropdown
                        options={alignOptions}
                        value={node.align ?? 'left'}
                        onChange={(e) => update({ align: e.value as TableColumnDef['align'] })}
                        size="sm"
                    />
                </div>
            </div>
            <ExpressionField
                label="Format"
                value={node.formatExpr ?? ''}
                onChange={(v) => update({ formatExpr: v || undefined })}
                placeholder="=expression or plain text"
                expectedReturnType="string"
                multiline={false}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <Checkbox
                    checked={node.frozen ?? false}
                    onChange={(e) => update({ frozen: e.value || undefined })}
                    label="Frozen"
                />
            </div>
            <ExpressionField
                label="Visible"
                value={typeof node.visible === 'string' ? node.visible : ''}
                onChange={(v) => update({ visible: v ? v : undefined })}
                placeholder="=Parameters.showColumn"
                expectedReturnType="boolean"
                multiline={false}
            />
            <ConditionalFormatsEditor
                formats={node.conditionalFormats ?? []}
                onChange={(formats) => update({ conditionalFormats: formats.length > 0 ? formats : undefined })}
            />
            <TableCellItemsEditor
                items={node.cellItems ?? []}
                onChange={(cellItems: TableCellItem[]) => update({ cellItems: cellItems.length > 0 ? cellItems : undefined })}
            />
        </div>
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
        <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)' }}>
                    Formatting ({formats.length})
                </span>
                <Button layout="outlined" size="xs" onClick={add} ariaLabel="Add formatting rule" label="+ Rule" />
            </div>
            {formats.map((fmt) => (
                <div
                    key={fmt.id}
                    style={{
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 4,
                        padding: 6,
                        marginBottom: 4,
                        background: 'var(--eui-bg-subtle)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: 'var(--eui-text-muted)' }}>Condition</span>
                        <Button
                            layout="plain"
                            size="xs"
                            variant="danger"
                            onClick={() => removeOne(fmt.id)}
                            ariaLabel="Remove rule"
                            leftIcon={<TrashIcon aria-hidden="true" />}
                        />
                    </div>
                    <ExpressionField
                        label=""
                        value={fmt.expression ? `=${fmt.expression}` : ''}
                        onChange={(v) =>
                            updateOne(fmt.id, { expression: v.startsWith('=') ? v.slice(1) : v })
                        }
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
                                onChange={(e) => updateOne(fmt.id, { backgroundColor: e.target.value })}
                                style={{ width: '100%', height: 22 }}
                                aria-label="Background color"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10, color: 'var(--eui-text-muted)' }}>Text</label>
                            <input
                                type="color"
                                value={fmt.textColor ?? '#000000'}
                                onChange={(e) => updateOne(fmt.id, { textColor: e.target.value })}
                                style={{ width: '100%', height: 22 }}
                                aria-label="Text color"
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
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
        </div>
    );
};
