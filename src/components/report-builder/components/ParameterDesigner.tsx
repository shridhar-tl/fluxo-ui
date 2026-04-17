import classNames from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '../../Button';
import { Checkbox } from '../../Checkbox';
import { NumericInput } from '../../NumericInput';
import { TextInput } from '../../TextInput';
import type { ComponentEvent } from '../../../types/index';
import { useReportBuilderContext, useRBStore } from '../report-builder-context';
import type { ReportBuilderState } from '../report-builder-types';
import type { ParameterConfig, ParameterType, SelectOption } from '../report-definition-types';

const parameterTypes: Array<{ type: ParameterType; label: string }> = [
    { type: 'text', label: 'Text' },
    { type: 'masked-edit', label: 'Masked Edit' },
    { type: 'numeric', label: 'Numeric' },
    { type: 'date-picker', label: 'Date Picker' },
    { type: 'date-range-picker', label: 'Date Range Picker' },
    { type: 'dropdown', label: 'Dropdown' },
    { type: 'radio-button', label: 'Radio Button' },
    { type: 'multi-select', label: 'Multi-select' },
    { type: 'chips', label: 'Chips' },
    { type: 'checkbox', label: 'Checkbox' },
];

interface OptionsEditorProps {
    options: SelectOption[];
    onChange: (options: SelectOption[]) => void;
}

const OptionsEditor: React.FC<OptionsEditorProps> = ({ options, onChange }) => {
    const addOption = () => {
        onChange([...options, { label: '', value: '' }]);
    };

    const updateOption = (index: number, key: 'label' | 'value', value: string) => {
        const next = options.map((opt, i) => (i === index ? { ...opt, [key]: value } : opt));
        onChange(next);
    };

    const removeOption = (index: number) => {
        onChange(options.filter((_, i) => i !== index));
    };

    return (
        <div className="eui-rb-param-designer-options-list">
            {options.map((opt, i) => (
                <div key={i} className="eui-rb-param-designer-options-list-item">
                    <TextInput
                        value={opt.label}
                        onChange={(e) => updateOption(i, 'label', e.value)}
                        placeholder="Label"
                        aria-label={`Option ${i + 1} label`}
                        size="sm"
                    />
                    <TextInput
                        value={String(opt.value)}
                        onChange={(e) => updateOption(i, 'value', e.value)}
                        placeholder="Value"
                        aria-label={`Option ${i + 1} value`}
                        size="sm"
                    />
                    <Button
                        layout="plain"
                        size="xs"
                        onClick={() => removeOption(i)}
                        ariaLabel={`Remove option ${i + 1}`}
                        title="Remove"
                    >
                        ×
                    </Button>
                </div>
            ))}
            <div className="eui-rb-param-designer-options-list-add">
                <Button size="sm" layout="plain" onClick={addOption}>+ Add Option</Button>
            </div>
        </div>
    );
};

interface ParameterDesignerProps {
    parameterId: string;
}

export const ParameterDesigner: React.FC<ParameterDesignerProps> = ({ parameterId }) => {
    const { store, parameterPlugins } = useReportBuilderContext();
    const [nameError, setNameError] = useState('');

    const parameters = useRBStore((s) => s.definition.parameters);
    const param = useMemo(
        () => parameters.find((p: ParameterConfig) => p.id === parameterId),
        [parameters, parameterId],
    );

    const updateParam = useCallback(
        (patch: Partial<ParameterConfig>) => {
            store.setState((prev: ReportBuilderState) => ({
                ...prev,
                definition: {
                    ...prev.definition,
                    parameters: prev.definition.parameters.map((p: ParameterConfig) =>
                        p.id === parameterId ? { ...p, ...patch } : p,
                    ),
                },
            }));
        },
        [store, parameterId],
    );

    const updateTypeConfig = useCallback(
        (patch: Record<string, unknown>) => {
            store.setState((prev: ReportBuilderState) => ({
                ...prev,
                definition: {
                    ...prev.definition,
                    parameters: prev.definition.parameters.map((p: ParameterConfig) =>
                        p.id === parameterId
                            ? { ...p, typeConfig: { ...p.typeConfig, ...patch } }
                            : p,
                    ),
                },
            }));
        },
        [store, parameterId],
    );

    if (!param) {
        return (
            <div className="eui-rb-props-pallet-empty">
                Parameter not found.
            </div>
        );
    }

    const tc = param.typeConfig;
    const options: SelectOption[] = (tc.options as SelectOption[]) ?? [];

    const handleNameChange = (value: string) => {
        const existing = parameters.find(
            (p) => p.id !== parameterId && p.name === value,
        );
        setNameError(existing ? 'Name already used' : '');
        updateParam({ name: value });
    };

    const allTypes = [
        ...parameterTypes,
        ...parameterPlugins.map((pl) => ({ type: pl.type as ParameterType, label: pl.name })),
    ];

    return (
        <div className="eui-rb-param-designer">
            <div className="eui-rb-param-designer-field">
                <label htmlFor={`rb-param-label-${parameterId}`}>Label</label>
                <TextInput
                    id={`rb-param-label-${parameterId}`}
                    value={param.label}
                    onChange={(e) => updateParam({ label: e.target.value })}
                    placeholder="Display label"
                />
            </div>

            <div className="eui-rb-param-designer-field">
                <label htmlFor={`rb-param-name-${parameterId}`}>Name (identifier)</label>
                <TextInput
                    id={`rb-param-name-${parameterId}`}
                    value={param.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="myParameter"
                    aria-invalid={!!nameError}
                    aria-describedby={nameError ? `rb-name-err-${parameterId}` : undefined}
                />
                {nameError && <span id={`rb-name-err-${parameterId}`} style={{ fontSize: 11, color: 'var(--eui-danger)' }}>{nameError}</span>}
            </div>

            <div className="eui-rb-param-designer-field">
                <label htmlFor={`rb-param-desc-${parameterId}`}>Description</label>
                <TextInput
                    id={`rb-param-desc-${parameterId}`}
                    value={param.description ?? ''}
                    onChange={(e) => updateParam({ description: e.target.value })}
                    placeholder="Optional description"
                />
            </div>

            <div className="eui-rb-param-designer-field">
                <label>Type</label>
                <div className="eui-rb-param-designer-type-selector">
                    {allTypes.map(({ type, label }) => (
                        <button
                            key={type}
                            className={classNames('eui-rb-param-designer-type-btn', { active: param.type === type })}
                            onClick={() => updateParam({ type, typeConfig: {} })}
                            aria-pressed={param.type === type}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="eui-rb-param-designer-field">
                <label htmlFor={`rb-param-width-${parameterId}`}>Width (0–1, e.g. 0.5 = half row)</label>
                <NumericInput
                    id={`rb-param-width-${parameterId}`}
                    value={param.width ?? 1}
                    onChange={(e: ComponentEvent<number>) => updateParam({ width: e.value ?? 1 })}
                    min={0.1}
                    max={1}
                    step={0.1}
                    maxDecimals={1}
                />
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Checkbox
                    label="Mandatory"
                    checked={param.mandatory}
                    onChange={(e) => updateParam({ mandatory: e.target.checked })}
                />
                <Checkbox
                    label="Read Only"
                    checked={param.readOnly === true}
                    onChange={(e) => updateParam({ readOnly: e.target.checked })}
                />
                <Checkbox
                    label="Hidden"
                    checked={param.hidden === true}
                    onChange={(e) => updateParam({ hidden: e.target.checked })}
                />
            </div>

            {/* Type-specific config */}
            {param.type === 'text' && (
                <div className="eui-rb-param-designer-section">
                    <div className="eui-rb-param-designer-section-title">Text Options</div>
                    <div className="eui-rb-param-designer-field">
                        <label>Placeholder</label>
                        <TextInput
                            value={(tc.placeholder as string) ?? ''}
                            onChange={(e) => updateTypeConfig({ placeholder: e.target.value })}
                            placeholder="Hint text..."
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div className="eui-rb-param-designer-field" style={{ flex: 1 }}>
                            <label>Min Length</label>
                            <NumericInput
                                value={(tc.minLength as number) ?? undefined}
                                onChange={(v) => updateTypeConfig({ minLength: v })}
                                min={0}
                            />
                        </div>
                        <div className="eui-rb-param-designer-field" style={{ flex: 1 }}>
                            <label>Max Length</label>
                            <NumericInput
                                value={(tc.maxLength as number) ?? undefined}
                                onChange={(v) => updateTypeConfig({ maxLength: v })}
                                min={0}
                            />
                        </div>
                    </div>
                    <Checkbox
                        label="Multiline"
                        checked={(tc.multiline as boolean) ?? false}
                        onChange={(e) => updateTypeConfig({ multiline: e.target.checked })}
                    />
                </div>
            )}

            {param.type === 'masked-edit' && (
                <div className="eui-rb-param-designer-section">
                    <div className="eui-rb-param-designer-section-title">Mask Options</div>
                    <div className="eui-rb-param-designer-field">
                        <label>Mask Pattern</label>
                        <TextInput
                            value={(tc.mask as string) ?? ''}
                            onChange={(e) => updateTypeConfig({ mask: e.target.value })}
                            placeholder="e.g. 999-999-9999"
                        />
                    </div>
                </div>
            )}

            {param.type === 'numeric' && (
                <div className="eui-rb-param-designer-section">
                    <div className="eui-rb-param-designer-section-title">Numeric Options</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {(['min', 'max', 'step'] as const).map((key) => (
                            <div key={key} className="eui-rb-param-designer-field" style={{ flex: '1 1 80px' }}>
                                <label style={{ textTransform: 'capitalize' }}>{key}</label>
                                <NumericInput
                                    value={(tc[key] as number) ?? undefined}
                                    onChange={(v) => updateTypeConfig({ [key]: v })}
                                />
                            </div>
                        ))}
                        <div className="eui-rb-param-designer-field" style={{ flex: '1 1 80px' }}>
                            <label>Decimal Places</label>
                            <NumericInput
                                value={(tc.decimalPlaces as number) ?? undefined}
                                onChange={(v) => updateTypeConfig({ decimalPlaces: v })}
                                min={0}
                                max={10}
                            />
                        </div>
                    </div>
                </div>
            )}

            {(param.type === 'date-picker' || param.type === 'date-range-picker') && (
                <div className="eui-rb-param-designer-section">
                    <div className="eui-rb-param-designer-section-title">Date Options</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <div className="eui-rb-param-designer-field" style={{ flex: 1 }}>
                            <label>Min Date</label>
                            <TextInput
                                type="date"
                                value={(tc.minDate as string) ?? ''}
                                onChange={(e) => updateTypeConfig({ minDate: e.target.value })}
                            />
                        </div>
                        <div className="eui-rb-param-designer-field" style={{ flex: 1 }}>
                            <label>Max Date</label>
                            <TextInput
                                type="date"
                                value={(tc.maxDate as string) ?? ''}
                                onChange={(e) => updateTypeConfig({ maxDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="eui-rb-param-designer-field">
                        <label>Format</label>
                        <TextInput
                            value={(tc.format as string) ?? ''}
                            onChange={(e) => updateTypeConfig({ format: e.target.value })}
                            placeholder="e.g. MM/dd/yyyy"
                        />
                    </div>
                </div>
            )}

            {(param.type === 'dropdown' || param.type === 'radio-button' || param.type === 'multi-select' || param.type === 'chips') && (
                <div className="eui-rb-param-designer-section">
                    <div className="eui-rb-param-designer-section-title">Options</div>
                    <OptionsEditor
                        options={options}
                        onChange={(opts) => updateTypeConfig({ options: opts })}
                    />
                </div>
            )}

            {param.type === 'dropdown' && (
                <div className="eui-rb-param-designer-section">
                    <Checkbox
                        label="Searchable"
                        checked={(tc.searchable as boolean) ?? false}
                        onChange={(e) => updateTypeConfig({ searchable: e.target.checked })}
                    />
                </div>
            )}

            {(param.type === 'multi-select' || param.type === 'chips') && (
                <div className="eui-rb-param-designer-section">
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div className="eui-rb-param-designer-field" style={{ flex: 1 }}>
                            <label>Min Items</label>
                            <NumericInput
                                value={(tc.minItems as number) ?? undefined}
                                onChange={(v) => updateTypeConfig({ minItems: v })}
                                min={0}
                            />
                        </div>
                        <div className="eui-rb-param-designer-field" style={{ flex: 1 }}>
                            <label>Max Items</label>
                            <NumericInput
                                value={(tc.maxItems as number) ?? undefined}
                                onChange={(v) => updateTypeConfig({ maxItems: v })}
                                min={0}
                            />
                        </div>
                    </div>
                    {param.type === 'chips' && (
                        <Checkbox
                            label="Allow Free Text"
                            checked={(tc.allowFreeText as boolean) ?? false}
                            onChange={(e) => updateTypeConfig({ allowFreeText: e.target.checked })}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
