import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { CellEditorProps, FieldDefinition } from './pivot-table-types';

interface PivotCellEditorProps {
    value: unknown;
    field: string;
    row: Record<string, unknown>;
    fieldDef?: FieldDefinition;
    dataType: string;
    onCommit: (newValue: unknown) => void;
    onCancel: () => void;
    customEditor?: React.ComponentType<CellEditorProps>;
}

const StringEditor: React.FC<CellEditorProps> = ({ value, onCommit, onCancel, onChange }) => {
    const [val, setVal] = useState(String(value ?? ''));
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') { onChange(val); onCommit(); }
        if (e.key === 'Escape') onCancel();
    };

    return (
        <input
            ref={ref}
            className="eui-pivot-cell-editor-input"
            value={val}
            onChange={(e) => { setVal(e.target.value); onChange(e.target.value); }}
            onKeyDown={handleKeyDown}
            onBlur={() => { onChange(val); onCommit(); }}
        />
    );
};

const NumberEditor: React.FC<CellEditorProps> = ({ value, onCommit, onCancel, onChange }) => {
    const [val, setVal] = useState(String(value ?? ''));
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') { onChange(Number(val)); onCommit(); }
        if (e.key === 'Escape') onCancel();
    };

    return (
        <input
            ref={ref}
            type="number"
            className="eui-pivot-cell-editor-input eui-pivot-cell-editor-number"
            value={val}
            onChange={(e) => { setVal(e.target.value); onChange(Number(e.target.value)); }}
            onKeyDown={handleKeyDown}
            onBlur={() => { onChange(Number(val)); onCommit(); }}
        />
    );
};

const BooleanEditor: React.FC<CellEditorProps> = ({ value, onCommit, onChange }) => {
    const [val, setVal] = useState(Boolean(value));

    const toggle = () => {
        const next = !val;
        setVal(next);
        onChange(next);
        setTimeout(() => onCommit(), 0);
    };

    return (
        <button
            className="eui-pivot-cell-editor-toggle"
            onClick={toggle}
            type="button"
            aria-pressed={val}
        >
            <span className={`eui-pivot-cell-editor-toggle-track ${val ? 'active' : ''}`}>
                <span className="eui-pivot-cell-editor-toggle-thumb" />
            </span>
        </button>
    );
};

const ObjectEditor: React.FC<CellEditorProps> = ({ value, onCommit, onCancel, onChange }) => {
    const [val, setVal] = useState(JSON.stringify(value, null, 2));
    const ref = useRef<HTMLTextAreaElement>(null);

    useEffect(() => { ref.current?.focus(); }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            try { onChange(JSON.parse(val)); onCommit(); } catch { /* invalid json */ }
        }
        if (e.key === 'Escape') onCancel();
    };

    return (
        <textarea
            ref={ref}
            className="eui-pivot-cell-editor-textarea"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
                try { onChange(JSON.parse(val)); onCommit(); } catch { onCancel(); }
            }}
            rows={4}
        />
    );
};

const defaultEditors: Record<string, React.FC<CellEditorProps>> = {
    string: StringEditor,
    number: NumberEditor,
    boolean: BooleanEditor,
    date: StringEditor,
    object: ObjectEditor,
};

const PivotCellEditor: React.FC<PivotCellEditorProps> = ({
    value,
    field,
    row,
    fieldDef,
    dataType,
    onCommit,
    onCancel,
    customEditor,
}) => {
    const [editValue, setEditValue] = useState<unknown>(value);

    const handleChange = useCallback((newVal: unknown) => {
        setEditValue(newVal);
    }, []);

    const handleCommit = useCallback(() => {
        onCommit(editValue);
    }, [editValue, onCommit]);

    const EditorComponent = customEditor || fieldDef?.editor || defaultEditors[dataType] || StringEditor;

    return (
        <div className="eui-pivot-cell-editor-wrapper" onClick={(e) => e.stopPropagation()}>
            <EditorComponent
                value={value}
                field={field}
                row={row}
                onChange={handleChange}
                onCommit={handleCommit}
                onCancel={onCancel}
            />
        </div>
    );
};

export default PivotCellEditor;
