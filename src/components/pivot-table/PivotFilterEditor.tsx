import React, { useCallback, useMemo, useState } from 'react';
import type { ComponentEvent } from '../../types';
import { Checkbox } from '../Checkbox';
import { Dropdown } from '../Dropdown';
import { NumericInput } from '../NumericInput';
import { TextInput } from '../TextInput';
import { getNestedValue } from './pivot-engine';
import type { PivotFilter } from './pivot-table-types';

interface PivotFilterEditorProps {
    filter: PivotFilter;
    fieldType: string;
    data: Record<string, unknown>[];
    onChange: (filter: PivotFilter) => void;
    onRemove: () => void;
    fieldLabel: string;
}

type FilterOperator = PivotFilter['operator'];

const operatorsByType: Record<string, { value: FilterOperator; label: string }[]> = {
    string: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'in', label: 'In' },
        { value: 'notIn', label: 'Not In' },
        { value: 'isEmpty', label: 'Is Empty' },
        { value: 'isNotEmpty', label: 'Is Not Empty' },
    ],
    number: [
        { value: 'eq', label: '=' },
        { value: 'neq', label: '≠' },
        { value: 'gt', label: '>' },
        { value: 'gte', label: '≥' },
        { value: 'lt', label: '<' },
        { value: 'lte', label: '≤' },
        { value: 'between', label: 'Between' },
        { value: 'isEmpty', label: 'Is Empty' },
        { value: 'isNotEmpty', label: 'Is Not Empty' },
    ],
    boolean: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not Equals' },
    ],
    date: [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not Equals' },
        { value: 'gt', label: 'After' },
        { value: 'lt', label: 'Before' },
        { value: 'between', label: 'Between' },
        { value: 'isEmpty', label: 'Is Empty' },
        { value: 'isNotEmpty', label: 'Is Not Empty' },
    ],
};

const noValueOperators: Set<string> = new Set(['isEmpty', 'isNotEmpty']);

const PivotFilterEditor: React.FC<PivotFilterEditorProps> = ({
    filter,
    fieldType,
    data,
    onChange,
    onRemove,
    fieldLabel,
}) => {
    const [expanded, setExpanded] = useState(true);

    const operators = operatorsByType[fieldType] || operatorsByType.string;
    const operatorOptions = operators.map((op) => ({ label: op.label, value: op.value }));

    const uniqueValues = useMemo(() => {
        if (fieldType === 'number' || fieldType === 'boolean') return [];
        const vals = new Set<string>();
        data.slice(0, 500).forEach((row) => {
            const v = getNestedValue(row, filter.field);
            if (v !== null && v !== undefined && v !== '') vals.add(String(v));
        });
        return [...vals].sort();
    }, [data, filter.field, fieldType]);

    const uniqueValueOptions = useMemo(
        () => uniqueValues.map((v) => ({ label: v, value: v })),
        [uniqueValues],
    );

    const handleOperatorChange = useCallback((e: ComponentEvent<FilterOperator>) => {
        const op = e.value;
        let newValue: unknown = filter.value;
        if (noValueOperators.has(op)) {
            newValue = '';
        } else if (op === 'between') {
            newValue = [0, 100];
        } else if (op === 'in' || op === 'notIn') {
            newValue = Array.isArray(filter.value) ? filter.value : [];
        }
        onChange({ ...filter, operator: op, value: newValue });
    }, [filter, onChange]);

    const handleValueChange = useCallback((value: unknown) => {
        onChange({ ...filter, value });
    }, [filter, onChange]);

    const renderValueEditor = () => {
        if (noValueOperators.has(filter.operator)) return null;

        if (filter.operator === 'between') {
            const [min, max] = Array.isArray(filter.value) ? filter.value as [number, number] : [0, 100];
            return (
                <div className="eui-pivot-filter-between">
                    <NumericInput
                        value={min}
                        onChange={(e) => handleValueChange([e.value, max])}
                        size="xs"
                        placeholder="Min"
                    />
                    <span className="eui-pivot-filter-between-sep">to</span>
                    <NumericInput
                        value={max}
                        onChange={(e) => handleValueChange([min, e.value])}
                        size="xs"
                        placeholder="Max"
                    />
                </div>
            );
        }

        if (filter.operator === 'in' || filter.operator === 'notIn') {
            const selected = Array.isArray(filter.value) ? filter.value as (string | number)[] : [];

            if (uniqueValues.length > 0) {
                return (
                    <div className="eui-pivot-filter-multi">
                        <div className="eui-pivot-filter-multi-list">
                            {uniqueValues.map((val) => {
                                const isChecked = selected.includes(val);
                                return (
                                    <Checkbox
                                        key={val}
                                        label={val}
                                        checked={isChecked}
                                        onChange={() => {
                                            const next = isChecked
                                                ? selected.filter((s) => s !== val)
                                                : [...selected, val];
                                            handleValueChange(next);
                                        }}
                                        size="xs"
                                    />
                                );
                            })}
                        </div>
                    </div>
                );
            }

            return (
                <TextInput
                    value={selected.join(', ')}
                    onChange={(e) => handleValueChange(String(e.value).split(',').map((s) => s.trim()).filter(Boolean))}
                    size="xs"
                    placeholder="Comma-separated values"
                />
            );
        }

        if (fieldType === 'boolean') {
            return (
                <Dropdown
                    options={[{ label: 'True', value: 'true' }, { label: 'False', value: 'false' }]}
                    value={String(filter.value)}
                    onChange={(e) => handleValueChange(e.value === 'true')}
                    size="xs"
                    placeholder="Select..."
                />
            );
        }

        if (fieldType === 'number') {
            return (
                <NumericInput
                    value={filter.value as number}
                    onChange={(e) => handleValueChange(e.value)}
                    size="xs"
                    placeholder="Value"
                />
            );
        }

        if (uniqueValueOptions.length > 0 && uniqueValueOptions.length <= 50) {
            return (
                <Dropdown
                    options={uniqueValueOptions}
                    value={filter.value}
                    onChange={(e) => handleValueChange(e.value)}
                    size="xs"
                    placeholder="Select..."
                    searchable
                />
            );
        }

        return (
            <TextInput
                value={String(filter.value ?? '')}
                onChange={(e) => handleValueChange(e.value)}
                size="xs"
                placeholder="Value"
            />
        );
    };

    return (
        <div className="eui-pivot-filter-editor">
            <div className="eui-pivot-filter-header" onClick={() => setExpanded(!expanded)}>
                <span className="eui-pivot-filter-field-name">{fieldLabel}</span>
                <button
                    className="eui-pivot-filter-remove"
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    type="button"
                    aria-label={`Remove ${fieldLabel} filter`}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
            {expanded && (
                <div className="eui-pivot-filter-body">
                    <Dropdown
                        options={operatorOptions}
                        value={filter.operator}
                        onChange={handleOperatorChange}
                        size="xs"
                    />
                    {renderValueEditor()}
                </div>
            )}
        </div>
    );
};

export default PivotFilterEditor;
