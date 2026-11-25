import React, { useId, useState } from 'react';

import { TextInput } from '../TextInput';
import type { TreeTableColumn, TreeTableKey, TreeTableRowData } from './tree-table-types';
import { valueToText } from './tree-table-utils';

interface TreeTableCellEditorProps<T extends TreeTableRowData> {
    row: T;
    rowKey: TreeTableKey;
    column: TreeTableColumn<T>;
    value: unknown;
    error: string | null;
    ariaLabel: string;
    onCommit: (value: unknown) => void;
    onCancel: () => void;
}

const parseInput = <T extends TreeTableRowData>(input: string, original: unknown, column: TreeTableColumn<T>, row: T): unknown => {
    if (column.parseValue) return column.parseValue(input, row);
    if (typeof original === 'number') {
        if (input.trim() === '') return null;
        const numeric = Number(input);
        return Number.isFinite(numeric) ? numeric : input;
    }
    if (typeof original === 'boolean') return input.trim().toLowerCase() === 'true';
    return input;
};

function TreeTableCellEditorInner<T extends TreeTableRowData>({
    row,
    rowKey,
    column,
    value,
    error,
    ariaLabel,
    onCommit,
    onCancel,
}: TreeTableCellEditorProps<T>) {
    const [draft, setDraft] = useState(() => valueToText(value));
    const [settled, setSettled] = useState(false);
    const errorId = useId();

    const stop = (event: React.SyntheticEvent) => event.stopPropagation();

    if (column.editor) {
        return (
            <div className="eui-tree-table-editor" onKeyDown={stop} onClick={stop} onDoubleClick={stop}>
                {column.editor({ row, rowKey, column, value, error, commit: onCommit, cancel: onCancel, ariaLabel })}
            </div>
        );
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.stopPropagation();
        if (event.key === 'Enter') {
            event.preventDefault();
            setSettled(true);
            onCommit(parseInput(draft, value, column, row));
        } else if (event.key === 'Escape') {
            event.preventDefault();
            setSettled(true);
            onCancel();
        }
    };

    const handleBlur = () => {
        if (settled) return;
        onCommit(parseInput(draft, value, column, row));
    };

    return (
        <div className="eui-tree-table-editor" onClick={stop} onDoubleClick={stop}>
            <TextInput
                size="sm"
                value={draft}
                autoFocus
                invalid={Boolean(error)}
                aria-label={ariaLabel}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                onChange={(event) => {
                    setSettled(false);
                    setDraft(event.value);
                }}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
            />
            {error && (
                <span id={errorId} role="alert" className="eui-tree-table-editor-error">
                    {error}
                </span>
            )}
        </div>
    );
}

export const TreeTableCellEditor = TreeTableCellEditorInner as <T extends TreeTableRowData>(props: TreeTableCellEditorProps<T>) => React.ReactElement;
