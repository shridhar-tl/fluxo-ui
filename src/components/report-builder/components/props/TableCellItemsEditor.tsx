import React, { useCallback, useContext, useMemo } from 'react';
import { TrashIcon } from '../../../../assets/icons';
import { Button } from '../../../Button';
import { Dropdown } from '../../../Dropdown';
import { TextInput } from '../../../TextInput';
import type { ListItem } from '../../../../types';
import { ReportBuilderContext, useRBStore } from '../../report-builder-context';
import type { ReportComponent, TableCellItem, TableCellItemType } from '../../report-definition-types';
import { ExpressionField } from './ExpressionField';

function collectVariableNames(components: ReportComponent[], out: string[] = []): string[] {
    for (const c of components) {
        if (c.variables) for (const v of c.variables) out.push(v.name);
        if (c.children) collectVariableNames(c.children, out);
    }
    return out;
}

function useAvailableVariableNames(): string[] {
    const ctx = useContext(ReportBuilderContext);
    const definition = useRBStore((s) => (ctx ? s.definition : null));
    return useMemo(() => {
        if (!definition) return [];
        return [
            ...definition.variables.map((v) => v.name),
            ...collectVariableNames(definition.components),
        ];
    }, [definition]);
}

const VariableNameInput: React.FC<{
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    ariaLabel?: string;
}> = ({ value, onChange, placeholder, ariaLabel }) => {
    const names = useAvailableVariableNames();
    const listId = React.useId();
    return (
        <>
            <TextInput
                value={value}
                onChange={(e) => onChange(e.value)}
                placeholder={placeholder ?? 'variableName'}
                size="sm"
                aria-label={ariaLabel}
                list={listId}
            />
            {names.length > 0 && (
                <datalist id={listId}>
                    {names.map((n) => <option key={n} value={n} />)}
                </datalist>
            )}
        </>
    );
};

const itemTypeOptions: ListItem[] = [
    { value: 'text', label: 'Static text' },
    { value: 'expression', label: 'Expression' },
    { value: 'field', label: 'Field value' },
    { value: 'parameter', label: 'Parameter value' },
    { value: 'image', label: 'Image' },
    { value: 'menu', label: 'Menu icon' },
];

const clickActionHints: Record<Exclude<TableCellItem['clickAction'], 'none' | undefined>, string> = {
    link: "Opens the URL in a new tab. Start with = to build it from the row, for example =Concat('https://example.com/', Field.id).",
    drill: 'Stores the value in the variable and tells the host application, which can open details for it. Leave the value empty to store the whole row.',
    'set-variable': 'Stores the value in the variable, so expressions reading Variables.name show the change. Leave the value empty to clear the variable.',
};

const clickActionOptions: ListItem[] = [
    { value: 'none', label: 'None' },
    { value: 'link', label: 'Open URL' },
    { value: 'drill', label: 'Drill-through (set variable)' },
    { value: 'set-variable', label: 'Set variable value' },
];

interface Props {
    items: TableCellItem[];
    onChange: (items: TableCellItem[]) => void;
}

export const TableCellItemsEditor: React.FC<Props> = ({ items, onChange }) => {
    const addItem = useCallback(() => {
        onChange([
            ...items,
            {
                id: crypto.randomUUID(),
                type: 'text',
                text: '',
                clickAction: 'none',
            },
        ]);
    }, [items, onChange]);

    const updateItem = useCallback(
        (id: string, patch: Partial<TableCellItem>) => {
            onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
        },
        [items, onChange],
    );

    const removeItem = useCallback(
        (id: string) => {
            onChange(items.filter((it) => it.id !== id));
        },
        [items, onChange],
    );

    return (
        <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)' }}>
                    Cell Items ({items.length})
                </span>
                <Button
                    layout="outlined"
                    size="xs"
                    onClick={addItem}
                    ariaLabel="Add cell item"
                    label="+ Item"
                />
            </div>
            {items.length === 0 && (
                <div style={{ fontSize: 10, color: 'var(--eui-text-muted)', fontStyle: 'italic' }}>
                    Add items to show more than one thing in a cell, such as a link, an image, or a value that sets a variable when clicked. Without items the cell shows the format or the raw value.
                </div>
            )}
            {items.map((item) => (
                <CellItemRow key={item.id} item={item} onUpdate={(patch) => updateItem(item.id, patch)} onRemove={() => removeItem(item.id)} />
            ))}
        </div>
    );
};

const CellItemRow: React.FC<{
    item: TableCellItem;
    onUpdate: (patch: Partial<TableCellItem>) => void;
    onRemove: () => void;
}> = ({ item, onUpdate, onRemove }) => {
    return (
        <div
            style={{
                border: '1px solid var(--eui-border-subtle)',
                borderRadius: 4,
                padding: 6,
                marginBottom: 4,
                background: 'var(--eui-bg-subtle)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <Dropdown
                    options={itemTypeOptions}
                    value={item.type}
                    onChange={(e) => onUpdate({ type: e.value as TableCellItemType })}
                    size="sm"
                    ariaLabel="Cell item type"
                />
                <Button
                    layout="plain"
                    size="xs"
                    variant="danger"
                    onClick={onRemove}
                    ariaLabel="Remove cell item"
                    leftIcon={<TrashIcon aria-hidden="true" />}
                />
            </div>

            {item.type === 'text' && (
                <TextInput
                    value={item.text ?? ''}
                    onChange={(e) => onUpdate({ text: e.value })}
                    placeholder="Static text"
                    size="sm"
                    aria-label="Cell item text"
                />
            )}

            {item.type === 'expression' && (
                <ExpressionField
                    label=""
                    value={item.expression ?? ''}
                    onChange={(v) => onUpdate({ expression: v })}
                    placeholder="Field.name + ' - ' + Parameters.suffix"
                    expectedReturnType="any"
                    multiline={false}
                />
            )}

            {item.type === 'field' && (
                <TextInput
                    value={item.fieldPath ?? ''}
                    onChange={(e) => onUpdate({ fieldPath: e.value })}
                    placeholder="fieldName or nested.path"
                    size="sm"
                    aria-label="Cell item field"
                />
            )}

            {item.type === 'parameter' && (
                <TextInput
                    value={item.parameterName ?? ''}
                    onChange={(e) => onUpdate({ parameterName: e.value })}
                    placeholder="parameterName"
                    size="sm"
                    aria-label="Cell item parameter"
                />
            )}

            {item.type === 'image' && (
                <>
                    <TextInput
                        value={item.src ?? ''}
                        onChange={(e) => onUpdate({ src: e.value })}
                        placeholder="Image URL (https:// or data:image/...)"
                        size="sm"
                        aria-label="Cell item image URL"
                    />
                    <TextInput
                        value={item.alt ?? ''}
                        onChange={(e) => onUpdate({ alt: e.value })}
                        placeholder="Alt text"
                        size="sm"
                        aria-label="Cell item image alt text"
                    />
                </>
            )}

            {item.type === 'menu' && (
                <TextInput
                    value={item.menuId ?? ''}
                    onChange={(e) => onUpdate({ menuId: e.value })}
                    placeholder="Menu identifier"
                    size="sm"
                    aria-label="Cell item menu identifier"
                />
            )}

            <div style={{ marginTop: 6 }}>
                <label style={{ fontSize: 10, color: 'var(--eui-text-muted)' }}>Click Action</label>
                <Dropdown
                    options={clickActionOptions}
                    value={item.clickAction ?? 'none'}
                    onChange={(e) => onUpdate({ clickAction: e.value as TableCellItem['clickAction'] })}
                    size="sm"
                    ariaLabel="Cell item click action"
                />
                {item.clickAction && item.clickAction !== 'none' && (
                    <div className="eui-rb-prop-hint">{clickActionHints[item.clickAction]}</div>
                )}
            </div>

            {item.clickAction === 'link' && (
                <TextInput
                    value={item.href ?? ''}
                    onChange={(e) => onUpdate({ href: e.value })}
                    placeholder="https://... or =expression"
                    size="sm"
                    aria-label="Cell item link URL"
                />
            )}

            {item.clickAction === 'drill' && (
                <>
                    <VariableNameInput
                        value={item.drillVariable ?? ''}
                        onChange={(v) => onUpdate({ drillVariable: v })}
                        placeholder="variableName to set"
                        ariaLabel="Drill-through variable name"
                    />
                    <ExpressionField
                        label="Drill Value"
                        value={item.drillValueExpr ?? ''}
                        onChange={(v) => onUpdate({ drillValueExpr: v || undefined })}
                        placeholder="Field.id"
                        expectedReturnType="any"
                        multiline={false}
                    />
                </>
            )}

            {item.clickAction === 'set-variable' && (
                <>
                    <VariableNameInput
                        value={item.setVariableName ?? ''}
                        onChange={(v) => onUpdate({ setVariableName: v })}
                        placeholder="variableName"
                        ariaLabel="Set-variable target name"
                    />
                    <ExpressionField
                        label="Value"
                        value={item.setVariableValueExpr ?? ''}
                        onChange={(v) => onUpdate({ setVariableValueExpr: v || undefined })}
                        placeholder="Field.value"
                        expectedReturnType="any"
                        multiline={false}
                    />
                </>
            )}
        </div>
    );
};
