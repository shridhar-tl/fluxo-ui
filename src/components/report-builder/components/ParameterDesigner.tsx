import classNames from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '../../Button';
import { Checkbox } from '../../Checkbox';
import { Chips } from '../../Chips';
import { Dropdown } from '../../Dropdown';
import { Multiselect } from '../../Multiselect';
import { NumericInput } from '../../NumericInput';
import { TextInput } from '../../TextInput';
import { TextArea } from '../../TextArea';
import type { ComponentEvent, ListItem } from '../../../types/index';
import { useReportBuilderContext, useRBStore } from '../report-builder-context';
import type { ReportBuilderState } from '../report-builder-types';
import type { ParameterConfig, ParameterType, ParameterValidation, SelectOption } from '../report-definition-types';

const parameterTypes: Array<{ type: ParameterType; label: string }> = [
    { type: 'text', label: 'Text' },
    { type: 'masked-edit', label: 'Masked Edit' },
    { type: 'numeric', label: 'Numeric' },
    { type: 'date-picker', label: 'Date' },
    { type: 'date-range-picker', label: 'Date Range' },
    { type: 'dropdown', label: 'Dropdown' },
    { type: 'autocomplete', label: 'Autocomplete' },
    { type: 'radio-button', label: 'Radio Button' },
    { type: 'multi-select', label: 'Multi-select' },
    { type: 'chips', label: 'Chips' },
    { type: 'checkbox', label: 'Checkbox' },
    { type: 'file', label: 'File' },
];

const typesWithDataset: ParameterType[] = ['dropdown', 'autocomplete', 'radio-button', 'multi-select'];
const typesWithAllowMultiple: ParameterType[] = ['text', 'numeric', 'date-picker', 'file'];

interface OptionsEditorProps {
    options: SelectOption[];
    onChange: (options: SelectOption[]) => void;
}

const OptionsEditor: React.FC<OptionsEditorProps> = ({ options, onChange }) => {
    const addOption = () => {
        onChange([...options, { label: '', value: '' }]);
    };
    const updateOption = (index: number, key: 'label' | 'value', value: string) => {
        onChange(options.map((opt, i) => (i === index ? { ...opt, [key]: value } : opt)));
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

interface DefaultValueEditorProps {
    param: ParameterConfig;
    options: SelectOption[];
    onChange: (value: unknown) => void;
}

const DefaultValueEditor: React.FC<DefaultValueEditorProps> = ({ param, options, onChange }) => {
    const value = param.defaultValue;
    const tc = param.typeConfig ?? {};
    const listItems: ListItem[] = options.map((o) => ({ label: o.label, value: String(o.value) }));

    switch (param.type) {
        case 'text':
            if (param.allowMultiple) {
                return (
                    <Chips
                        value={(value as string[]) ?? []}
                        onChange={(e: ComponentEvent<string[]>) => onChange(e.value.length ? e.value : undefined)}
                        placeholder="Add value and press Enter"
                    />
                );
            }
            if (tc.multiline) {
                return (
                    <TextArea
                        value={(value as string) ?? ''}
                        onChange={(e) => onChange(e.target.value || undefined)}
                        rows={2}
                        placeholder="Default text"
                    />
                );
            }
            return (
                <TextInput
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(e.target.value || undefined)}
                    placeholder="Default text"
                />
            );

        case 'masked-edit':
            return (
                <TextInput
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(e.target.value || undefined)}
                    placeholder="Default value"
                />
            );

        case 'numeric':
            if (param.allowMultiple) {
                return (
                    <Chips
                        value={((value as number[]) ?? []).map(String)}
                        onChange={(e: ComponentEvent<string[]>) => {
                            const nums = e.value.map(Number).filter((n) => !Number.isNaN(n));
                            onChange(nums.length ? nums : undefined);
                        }}
                        placeholder="Add number and press Enter"
                    />
                );
            }
            return (
                <NumericInput
                    value={(value as number | undefined) ?? undefined}
                    onChange={(e: ComponentEvent<number>) => onChange(e.value ?? undefined)}
                    min={tc.min as number | undefined}
                    max={tc.max as number | undefined}
                    step={tc.step as number | undefined}
                    maxDecimals={tc.decimalPlaces as number | undefined}
                />
            );

        case 'date-picker':
            return (
                <TextInput
                    type="date"
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(e.target.value || undefined)}
                />
            );

        case 'date-range-picker': {
            const range = (value as { fromDate?: string; toDate?: string } | null | undefined) ?? null;
            return (
                <div style={{ display: 'flex', gap: 8 }}>
                    <TextInput
                        type="date"
                        value={range?.fromDate ?? ''}
                        onChange={(e) => {
                            const from = e.target.value || undefined;
                            const to = range?.toDate;
                            if (!from && !to) onChange(undefined);
                            else onChange({ fromDate: from, toDate: to });
                        }}
                        placeholder="From"
                    />
                    <TextInput
                        type="date"
                        value={range?.toDate ?? ''}
                        onChange={(e) => {
                            const to = e.target.value || undefined;
                            const from = range?.fromDate;
                            if (!from && !to) onChange(undefined);
                            else onChange({ fromDate: from, toDate: to });
                        }}
                        placeholder="To"
                    />
                </div>
            );
        }

        case 'dropdown':
        case 'autocomplete':
        case 'radio-button': {
            const items: ListItem[] = [{ value: '', label: '— None —' }, ...listItems];
            return (
                <Dropdown
                    options={items}
                    value={(value as string) ?? ''}
                    onChange={(e: ComponentEvent<string>) => onChange(e.value || undefined)}
                    searchable
                />
            );
        }

        case 'multi-select':
            return (
                <Multiselect
                    options={listItems}
                    value={(value as string[]) ?? []}
                    onChange={(e: ComponentEvent<string[]>) => onChange(e.value.length ? e.value : undefined)}
                />
            );

        case 'chips':
            return (
                <Chips
                    value={(value as string[]) ?? []}
                    onChange={(e: ComponentEvent<string[]>) => onChange(e.value.length ? e.value : undefined)}
                    placeholder="Add value and press Enter"
                />
            );

        case 'checkbox':
            return (
                <Checkbox
                    label="Checked by default"
                    checked={(value as boolean) ?? false}
                    onChange={(e) => onChange(e.target.checked ? true : undefined)}
                />
            );

        case 'file':
            return (
                <div style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>
                    File parameters cannot have a default value.
                </div>
            );

        default:
            return (
                <TextInput
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(e.target.value || undefined)}
                    placeholder="Default value"
                />
            );
    }
};

interface ParameterDesignerProps {
    parameterId: string;
}

type DesignerTab = 'general' | 'values' | 'validation';

export const ParameterDesigner: React.FC<ParameterDesignerProps> = ({ parameterId }) => {
    const { store, parameterPlugins } = useReportBuilderContext();
    const [nameError, setNameError] = useState('');
    const [tab, setTab] = useState<DesignerTab>('general');

    const parameters = useRBStore((s) => s.definition.parameters);
    const datasources = useRBStore((s) => s.definition.datasources);
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

    const updateValidation = useCallback(
        (patch: Partial<ParameterValidation>) => {
            store.setState((prev: ReportBuilderState) => ({
                ...prev,
                definition: {
                    ...prev.definition,
                    parameters: prev.definition.parameters.map((p: ParameterConfig) =>
                        p.id === parameterId
                            ? { ...p, validation: { ...(p.validation ?? {}), ...patch } }
                            : p,
                    ),
                },
            }));
        },
        [store, parameterId],
    );

    if (!param) {
        return <div className="eui-rb-props-pallet-empty">Parameter not found.</div>;
    }

    const tc = param.typeConfig;
    const options: SelectOption[] = (tc.options as SelectOption[]) ?? [];
    const validation = param.validation ?? {};

    const handleNameChange = (value: string) => {
        const existing = parameters.find((p) => p.id !== parameterId && p.name === value);
        setNameError(existing ? 'Name already used' : '');
        updateParam({ name: value });
    };

    const allTypes = [
        ...parameterTypes,
        ...parameterPlugins.map((pl) => ({ type: pl.type as ParameterType, label: pl.name })),
    ];

    const datasetOptions: ListItem[] = useMemo(
        () => [{ value: '', label: '— None —' }, ...datasources.map((d) => ({ value: d.id, label: d.name }))],
        [datasources],
    );

    const canHaveDataset = typesWithDataset.includes(param.type);
    const canHaveAllowMultiple = typesWithAllowMultiple.includes(param.type);

    return (
        <div className="eui-rb-param-designer">
            <div className="eui-rb-param-designer-tabs" role="tablist">
                {(['general', 'values', 'validation'] as DesignerTab[]).map((t) => (
                    <button
                        key={t}
                        role="tab"
                        aria-selected={tab === t}
                        className={classNames('eui-rb-param-designer-tab', { active: tab === t })}
                        onClick={() => setTab(t)}
                    >
                        {t === 'general' ? 'General' : t === 'values' ? 'Values' : 'Validation'}
                    </button>
                ))}
            </div>

            {tab === 'general' && (
                <>
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
                        {nameError && (
                            <span id={`rb-name-err-${parameterId}`} style={{ fontSize: 11, color: 'var(--eui-danger)' }}>
                                {nameError}
                            </span>
                        )}
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
                        {canHaveAllowMultiple && (
                            <Checkbox
                                label="Allow Multiple"
                                checked={param.allowMultiple === true}
                                onChange={(e) => updateParam({ allowMultiple: e.target.checked })}
                            />
                        )}
                    </div>
                    <div className="eui-rb-param-designer-field">
                        <label>Default Value</label>
                        <DefaultValueEditor
                            param={param}
                            options={options}
                            onChange={(v) => updateParam({ defaultValue: v })}
                        />
                    </div>
                </>
            )}

            {tab === 'values' && (
                <>
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
                                            onChange={(e: ComponentEvent<number>) => updateTypeConfig({ [key]: e.value })}
                                        />
                                    </div>
                                ))}
                                <div className="eui-rb-param-designer-field" style={{ flex: '1 1 80px' }}>
                                    <label>Decimal Places</label>
                                    <NumericInput
                                        value={(tc.decimalPlaces as number) ?? undefined}
                                        onChange={(e: ComponentEvent<number>) => updateTypeConfig({ decimalPlaces: e.value })}
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

                    {canHaveDataset && (
                        <div className="eui-rb-param-designer-section">
                            <div className="eui-rb-param-designer-section-title">Values from Dataset</div>
                            <div className="eui-rb-param-designer-field">
                                <label>Dataset</label>
                                <Dropdown
                                    options={datasetOptions}
                                    value={param.datasetId ?? ''}
                                    onChange={(e: ComponentEvent<string>) => updateParam({ datasetId: e.value || undefined })}
                                    size="sm"
                                />
                            </div>
                            {param.datasetId && (
                                <>
                                    <div className="eui-rb-param-designer-field">
                                        <label>Display field</label>
                                        <TextInput
                                            value={param.displayField ?? ''}
                                            onChange={(e) => updateParam({ displayField: e.target.value })}
                                            placeholder="fieldName"
                                        />
                                    </div>
                                    <div className="eui-rb-param-designer-field">
                                        <label>Value field</label>
                                        <TextInput
                                            value={param.valueField ?? ''}
                                            onChange={(e) => updateParam({ valueField: e.target.value })}
                                            placeholder="fieldName (defaults to display field)"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {!param.datasetId &&
                        (param.type === 'dropdown' ||
                            param.type === 'autocomplete' ||
                            param.type === 'radio-button' ||
                            param.type === 'multi-select' ||
                            param.type === 'chips') && (
                            <div className="eui-rb-param-designer-section">
                                <div className="eui-rb-param-designer-section-title">Static Options</div>
                                <OptionsEditor
                                    options={options}
                                    onChange={(opts) => updateTypeConfig({ options: opts })}
                                />
                            </div>
                        )}

                    {param.type === 'dropdown' && (
                        <Checkbox
                            label="Searchable"
                            checked={(tc.searchable as boolean) ?? false}
                            onChange={(e) => updateTypeConfig({ searchable: e.target.checked })}
                        />
                    )}

                    {param.type === 'autocomplete' && (
                        <div className="eui-rb-param-designer-section">
                            <div style={{ display: 'flex', gap: 10 }}>
                                <div className="eui-rb-param-designer-field" style={{ flex: 1 }}>
                                    <label>Min Query Length</label>
                                    <NumericInput
                                        value={(tc.minQueryLength as number) ?? undefined}
                                        onChange={(e: ComponentEvent<number>) => updateTypeConfig({ minQueryLength: e.value })}
                                        min={0}
                                    />
                                </div>
                                <div className="eui-rb-param-designer-field" style={{ flex: 1 }}>
                                    <label>Max Suggestions</label>
                                    <NumericInput
                                        value={(tc.maxSuggestions as number) ?? undefined}
                                        onChange={(e: ComponentEvent<number>) => updateTypeConfig({ maxSuggestions: e.value })}
                                        min={1}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {tab === 'validation' && (
                <>
                    {(param.type === 'text' || param.type === 'masked-edit') && (
                        <div className="eui-rb-param-designer-section">
                            <div className="eui-rb-param-designer-section-title">Text Validations</div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <div className="eui-rb-param-designer-field" style={{ flex: 1 }}>
                                    <label>Min Length</label>
                                    <NumericInput
                                        value={validation.minLength ?? undefined}
                                        onChange={(e: ComponentEvent<number>) => updateValidation({ minLength: e.value })}
                                        min={0}
                                    />
                                </div>
                                <div className="eui-rb-param-designer-field" style={{ flex: 1 }}>
                                    <label>Max Length</label>
                                    <NumericInput
                                        value={validation.maxLength ?? undefined}
                                        onChange={(e: ComponentEvent<number>) => updateValidation({ maxLength: e.value })}
                                        min={0}
                                    />
                                </div>
                            </div>
                            <div className="eui-rb-param-designer-field">
                                <label>Regex Pattern</label>
                                <TextInput
                                    value={validation.regex ?? ''}
                                    onChange={(e) => updateValidation({ regex: e.value || undefined })}
                                    placeholder="e.g. ^[A-Z]{3}\d+$"
                                />
                            </div>
                            <div className="eui-rb-param-designer-field">
                                <label>Regex Error Message</label>
                                <TextInput
                                    value={validation.regexMessage ?? ''}
                                    onChange={(e) => updateValidation({ regexMessage: e.value || undefined })}
                                    placeholder="Must match expected format"
                                />
                            </div>
                            <div className="eui-rb-param-designer-field">
                                <label>Key Filter Regex (blocks disallowed keys while typing)</label>
                                <TextInput
                                    value={validation.keyfilter ?? ''}
                                    onChange={(e) => updateValidation({ keyfilter: e.value || undefined })}
                                    placeholder="e.g. [A-Za-z0-9]"
                                />
                            </div>
                        </div>
                    )}

                    {param.type === 'numeric' && (
                        <div className="eui-rb-param-designer-section">
                            <div className="eui-rb-param-designer-section-title">Numeric Range</div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <div className="eui-rb-param-designer-field" style={{ flex: 1 }}>
                                    <label>Min Value</label>
                                    <NumericInput
                                        value={validation.minValue ?? undefined}
                                        onChange={(e: ComponentEvent<number>) => updateValidation({ minValue: e.value })}
                                    />
                                </div>
                                <div className="eui-rb-param-designer-field" style={{ flex: 1 }}>
                                    <label>Max Value</label>
                                    <NumericInput
                                        value={validation.maxValue ?? undefined}
                                        onChange={(e: ComponentEvent<number>) => updateValidation({ maxValue: e.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {(param.type === 'multi-select' || param.type === 'chips') && (
                        <div className="eui-rb-param-designer-section">
                            <div className="eui-rb-param-designer-section-title">Items Count</div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <div className="eui-rb-param-designer-field" style={{ flex: 1 }}>
                                    <label>Min Items</label>
                                    <NumericInput
                                        value={validation.minItems ?? undefined}
                                        onChange={(e: ComponentEvent<number>) => updateValidation({ minItems: e.value })}
                                        min={0}
                                    />
                                </div>
                                <div className="eui-rb-param-designer-field" style={{ flex: 1 }}>
                                    <label>Max Items</label>
                                    <NumericInput
                                        value={validation.maxItems ?? undefined}
                                        onChange={(e: ComponentEvent<number>) => updateValidation({ maxItems: e.value })}
                                        min={0}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {param.type === 'file' && (
                        <div className="eui-rb-param-designer-section">
                            <div className="eui-rb-param-designer-section-title">File Restrictions</div>
                            <div className="eui-rb-param-designer-field">
                                <label>Allowed File Types (comma-separated)</label>
                                <TextInput
                                    value={validation.allowedFileTypes ?? ''}
                                    onChange={(e) => updateValidation({ allowedFileTypes: e.value || undefined })}
                                    placeholder=".pdf,.csv,image/*"
                                />
                            </div>
                            <div className="eui-rb-param-designer-field">
                                <label>Max File Size (bytes)</label>
                                <NumericInput
                                    value={validation.maxFileSize ?? undefined}
                                    onChange={(e: ComponentEvent<number>) => updateValidation({ maxFileSize: e.value })}
                                    min={0}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
