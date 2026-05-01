import React, { useCallback } from 'react';
import { TrashIcon } from '../../../../assets/icons';
import { Button } from '../../../Button';
import { Dropdown } from '../../../Dropdown';
import { NumericInput } from '../../../NumericInput';
import type { ComponentEvent, ListItem } from '../../../../types';
import type { TableExtraRow, TableExtraRowCell } from '../../report-definition-types';
import { ExpressionField } from './ExpressionField';

const alignOptions: ListItem[] = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
];

interface Props {
    title: string;
    rows: TableExtraRow[];
    totalLeafColumns: number;
    onChange: (rows: TableExtraRow[]) => void;
}

export const TableExtraRowsEditor: React.FC<Props> = ({ title, rows, totalLeafColumns, onChange }) => {
    const addRow = useCallback(() => {
        onChange([
            ...rows,
            {
                id: crypto.randomUUID(),
                cells: [{ colSpan: Math.max(1, totalLeafColumns), align: 'left', textExpression: '' }],
            },
        ]);
    }, [rows, onChange, totalLeafColumns]);

    return (
        <div style={{ marginTop: 12 }}>
            <div
                className="eui-rb-props-section-title"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
                <span>{title} ({rows.length})</span>
                <Button layout="outlined" size="xs" onClick={addRow} label="+ Row" ariaLabel={`Add ${title} row`} />
            </div>
            {rows.map((row, rIdx) => (
                <ExtraRowEditor
                    key={row.id}
                    row={row}
                    totalLeafColumns={totalLeafColumns}
                    onUpdate={(next) => {
                        const copy = [...rows];
                        copy[rIdx] = next;
                        onChange(copy);
                    }}
                    onRemove={() => onChange(rows.filter((_, i) => i !== rIdx))}
                />
            ))}
        </div>
    );
};

const ExtraRowEditor: React.FC<{
    row: TableExtraRow;
    totalLeafColumns: number;
    onUpdate: (row: TableExtraRow) => void;
    onRemove: () => void;
}> = ({ row, onUpdate, onRemove, totalLeafColumns }) => {
    const addCell = () =>
        onUpdate({
            ...row,
            cells: [...row.cells, { colSpan: 1, align: 'left', textExpression: '' }],
        });
    const updateCell = (i: number, patch: Partial<TableExtraRowCell>) =>
        onUpdate({
            ...row,
            cells: row.cells.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
        });
    const removeCell = (i: number) =>
        onUpdate({ ...row, cells: row.cells.filter((_, idx) => idx !== i) });

    return (
        <div
            style={{
                border: '1px solid var(--eui-border-subtle)',
                borderRadius: 4,
                padding: 8,
                marginTop: 6,
                background: 'var(--eui-bg)',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--eui-text-muted)' }}>
                    Cells ({row.cells.length}) — total leaf columns: {totalLeafColumns}
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                    <Button layout="plain" size="xs" onClick={addCell} label="+ Cell" />
                    <Button
                        layout="plain"
                        size="xs"
                        variant="danger"
                        onClick={onRemove}
                        ariaLabel="Remove row"
                        leftIcon={<TrashIcon aria-hidden="true" />}
                    />
                </div>
            </div>
            {row.cells.map((cell, i) => (
                <div
                    key={i}
                    style={{
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 3,
                        padding: 6,
                        marginTop: 4,
                        background: 'var(--eui-bg-subtle)',
                    }}
                >
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', marginBottom: 4 }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10, color: 'var(--eui-text-muted)' }}>Col Span</label>
                            <NumericInput
                                value={cell.colSpan ?? 1}
                                onChange={(e: ComponentEvent<number | undefined>) => updateCell(i, { colSpan: e.value ?? 1 })}
                                min={1}
                                max={Math.max(1, totalLeafColumns)}
                                size="sm"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10, color: 'var(--eui-text-muted)' }}>Align</label>
                            <Dropdown
                                options={alignOptions}
                                value={cell.align ?? 'left'}
                                onChange={(e) => updateCell(i, { align: e.value as TableExtraRowCell['align'] })}
                                size="sm"
                            />
                        </div>
                        <Button
                            layout="plain"
                            size="xs"
                            variant="danger"
                            onClick={() => removeCell(i)}
                            ariaLabel="Remove cell"
                            leftIcon={<TrashIcon aria-hidden="true" />}
                        />
                    </div>
                    <ExpressionField
                        label=""
                        value={cell.textExpression ?? ''}
                        onChange={(v) => updateCell(i, { textExpression: v || undefined })}
                        placeholder="=Concat('Total: ', Sum(Field.amount))"
                        expectedReturnType="any"
                        multiline={false}
                    />
                </div>
            ))}
        </div>
    );
};
