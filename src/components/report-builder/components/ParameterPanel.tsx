import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import './parameter-panel.scss';
import { Autocomplete } from '../../Autocomplete';
import { Button } from '../../Button';
import { Checkbox } from '../../Checkbox';
import { Chips } from '../../Chips';
import { default as DateRangePicker } from '../../date-range';
import { Dropdown } from '../../Dropdown';
import { FileUpload } from '../../file-upload';
import { MaskedInput } from '../../MaskedInput';
import { Multiselect } from '../../Multiselect';
import { NumericInput } from '../../NumericInput';
import { RadioButtonGroup } from '../../RadioButton';
import { TextArea } from '../../TextArea';
import { TextInput } from '../../TextInput';
import { TimesIcon } from '../../../assets/icons';
import type { ComponentEvent, ListItem } from '../../../types';
import { validateAllParameters } from '../parameter-validation';
import { isKeyFilterAllowed } from '../parameter-validation';
import type { ParameterConfig, SelectOption } from '../report-definition-types';
import { useParameterOptionsContext } from './ParameterOptionsContext';

interface ParameterPanelProps {
    parameters: ParameterConfig[];
    values: Record<string, unknown>;
    onChange: (values: Record<string, unknown>) => void;
    onApply: (values: Record<string, unknown>) => void;
    mode?: 'popover' | 'docked';
    anchorRef?: React.RefObject<HTMLElement | null>;
    isOpen?: boolean;
    onClose?: () => void;
}

function getOptionsForParam(
    param: ParameterConfig,
    ctx: ReturnType<typeof useParameterOptionsContext>,
): SelectOption[] {
    const tc = param.typeConfig ?? {};
    const staticOptions = (tc.options as SelectOption[] | undefined) ?? [];
    const datasetId = param.datasetId ?? (tc.datasourceId as string | undefined);
    const displayField = param.displayField ?? (tc.labelField as string | undefined);
    const valueField = param.valueField ?? (tc.valueField as string | undefined);
    if (ctx && datasetId) {
        return ctx.getOptions(datasetId, displayField, valueField, staticOptions);
    }
    return staticOptions;
}

interface FieldRenderProps {
    param: ParameterConfig;
    value: unknown;
    onChange: (value: unknown) => void;
    errors: string[];
}

function ParameterField({ param, value, onChange, errors }: FieldRenderProps) {
    const tc = param.typeConfig ?? {};
    const optCtx = useParameterOptionsContext();

    if (param.hidden === true) return null;

    const label = (
        <label htmlFor={`rb-runtime-param-${param.id}`} className="eui-rb-param-field-label">
            {param.label}
            {param.mandatory && <span className="eui-rb-param-mandatory-mark"> *</span>}
        </label>
    );

    const disabled = param.readOnly === true;
    const keyfilter = param.validation?.keyfilter;
    const handleKeyDown = keyfilter
        ? (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              if (e.ctrlKey || e.metaKey || e.altKey) return;
              if (e.key.length === 1 && !isKeyFilterAllowed(keyfilter, e.key)) {
                  e.preventDefault();
              }
          }
        : undefined;

    const options = getOptionsForParam(param, optCtx);
    const listItems: ListItem[] = options.map((o) => ({ label: o.label, value: String(o.value) }));

    const hasError = errors.length > 0;
    const errorNode = hasError ? (
        <div id={`rb-runtime-param-${param.id}-err`} className="eui-rb-param-error" role="alert">
            {errors.map((err, i) => <div key={i}>{err}</div>)}
        </div>
    ) : null;

    const commonAria = {
        'aria-invalid': hasError,
        'aria-describedby': hasError ? `rb-runtime-param-${param.id}-err` : undefined,
    } as const;

    let input: React.ReactNode;

    switch (param.type) {
        case 'text': {
            if (param.allowMultiple) {
                input = (
                    <Chips
                        id={`rb-runtime-param-${param.id}`}
                        value={(value as string[]) ?? []}
                        onChange={(e: ComponentEvent<string[]>) => onChange(e.value)}
                        disabled={disabled}
                        {...commonAria}
                    />
                );
            } else if (tc.multiline) {
                input = (
                    <TextArea
                        id={`rb-runtime-param-${param.id}`}
                        value={(value as string) ?? ''}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={(tc.placeholder as string) ?? ''}
                        disabled={disabled}
                        rows={3}
                        {...commonAria}
                    />
                );
            } else {
                input = (
                    <TextInput
                        id={`rb-runtime-param-${param.id}`}
                        value={(value as string) ?? ''}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={(tc.placeholder as string) ?? ''}
                        disabled={disabled}
                        {...commonAria}
                    />
                );
            }
            break;
        }

        case 'masked-edit':
            input = (
                <MaskedInput
                    id={`rb-runtime-param-${param.id}`}
                    value={(value as string) ?? ''}
                    onChange={(e: ComponentEvent<string>) => onChange(e.value)}
                    mask={(tc.mask as string) ?? ''}
                    disabled={disabled}
                    {...commonAria}
                />
            );
            break;

        case 'numeric':
            if (param.allowMultiple) {
                input = (
                    <Chips
                        id={`rb-runtime-param-${param.id}`}
                        value={((value as number[]) ?? []).map(String)}
                        onChange={(e: ComponentEvent<string[]>) => {
                            const nums = e.value.map(Number).filter((n) => !Number.isNaN(n));
                            onChange(nums);
                        }}
                        disabled={disabled}
                        {...commonAria}
                    />
                );
            } else {
                input = (
                    <NumericInput
                        id={`rb-runtime-param-${param.id}`}
                        value={(value as number) ?? undefined}
                        onChange={(e: ComponentEvent<number | undefined>) => onChange(e.value)}
                        min={tc.min as number | undefined}
                        max={tc.max as number | undefined}
                        step={tc.step as number | undefined}
                        maxDecimals={tc.decimalPlaces as number | undefined}
                        disabled={disabled}
                        {...commonAria}
                    />
                );
            }
            break;

        case 'date-picker':
            input = (
                <TextInput
                    id={`rb-runtime-param-${param.id}`}
                    type="date"
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    min={(tc.minDate as string) ?? undefined}
                    max={(tc.maxDate as string) ?? undefined}
                    disabled={disabled}
                    {...commonAria}
                />
            );
            break;

        case 'date-range-picker':
            input = (
                <DateRangePicker
                    value={(value as any) ?? null}
                    onChange={(v) => onChange(v)}
                    disabled={disabled}
                />
            );
            break;

        case 'dropdown': {
            input = (
                <Dropdown
                    id={`rb-runtime-param-${param.id}`}
                    options={listItems}
                    value={(value as string) ?? ''}
                    onChange={(e: ComponentEvent<string>) => onChange(e.value)}
                    searchable={(tc.searchable as boolean) ?? false}
                    disabled={disabled}
                    {...commonAria}
                />
            );
            break;
        }

        case 'autocomplete': {
            const maxSuggestions = (tc.maxSuggestions as number | undefined) ?? 10;
            const minQueryLength = (tc.minQueryLength as number | undefined) ?? 1;
            input = (
                <Autocomplete
                    id={`rb-runtime-param-${param.id}`}
                    items={listItems}
                    value={(value as string) ?? ''}
                    onChange={(e: ComponentEvent<string>) => onChange(e.value)}
                    onSelect={(e) => onChange(e.value)}
                    maxSuggestions={maxSuggestions}
                    minLength={minQueryLength}
                    disabled={disabled}
                    {...commonAria}
                />
            );
            break;
        }

        case 'radio-button': {
            input = (
                <RadioButtonGroup
                    name={`rb-runtime-param-${param.id}`}
                    items={listItems.map((o) => ({ label: o.label, value: o.value, disabled }))}
                    value={(value as string) ?? ''}
                    onChange={(e: ComponentEvent<string>) => onChange(e.value)}
                />
            );
            break;
        }

        case 'multi-select': {
            input = (
                <Multiselect
                    id={`rb-runtime-param-${param.id}`}
                    options={listItems}
                    value={(value as string[]) ?? []}
                    onChange={(e: ComponentEvent<string[]>) => onChange(e.value)}
                    disabled={disabled}
                    {...commonAria}
                />
            );
            break;
        }

        case 'chips': {
            input = (
                <Chips
                    id={`rb-runtime-param-${param.id}`}
                    value={(value as string[]) ?? []}
                    onChange={(e: ComponentEvent<string[]>) => onChange(e.value)}
                    disabled={disabled}
                    {...commonAria}
                />
            );
            break;
        }

        case 'checkbox':
            input = (
                <Checkbox
                    id={`rb-runtime-param-${param.id}`}
                    label={param.label}
                    checked={(value as boolean) ?? false}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                />
            );
            break;

        case 'file': {
            input = (
                <FileUpload
                    accept={param.validation?.allowedFileTypes ?? (tc.allowedFileTypes as string | undefined)}
                    multiple={param.allowMultiple === true}
                    maxFileSize={param.validation?.maxFileSize}
                    maxFiles={param.allowMultiple ? undefined : 1}
                    disabled={disabled}
                    onFilesSelect={(files) => {
                        if (param.allowMultiple) onChange(files);
                        else onChange(files[0] ?? null);
                    }}
                    onFileRemove={() => {
                        if (param.allowMultiple) {
                            onChange([]);
                        } else {
                            onChange(null);
                        }
                    }}
                />
            );
            break;
        }

        default:
            input = (
                <TextInput
                    id={`rb-runtime-param-${param.id}`}
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    {...commonAria}
                />
            );
    }

    const widthPct = Math.max(0.1, Math.min(1, param.width ?? 1)) * 100;
    return (
        <div
            className="eui-rb-param-panel-field"
            style={{
                flex: `1 1 calc(${widthPct}% - 12px)`,
                maxWidth: '100%',
            }}
            data-param-type={param.type}
        >
            {param.type !== 'checkbox' && label}
            {input}
            {param.description && <div className="description">{param.description}</div>}
            {errorNode}
        </div>
    );
}

const ParameterForm: React.FC<ParameterPanelProps> = ({
    parameters,
    values,
    onChange,
    onApply,
}) => {
    const [localValues, setLocalValues] = useState<Record<string, unknown>>(values);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [showErrors, setShowErrors] = useState(false);

    useEffect(() => {
        setLocalValues(values);
    }, [values]);

    const handleChange = useCallback(
        (id: string, value: unknown) => {
            setLocalValues((prev) => {
                const next = { ...prev, [id]: value };
                if (showErrors) {
                    setErrors(validateAllParameters(parameters, next));
                }
                return next;
            });
        },
        [parameters, showErrors],
    );

    const handleApply = useCallback(() => {
        const errs = validateAllParameters(parameters, localValues);
        setErrors(errs);
        setShowErrors(true);
        if (Object.keys(errs).length > 0) return;
        onChange(localValues);
        onApply(localValues);
    }, [parameters, localValues, onChange, onApply]);

    const visibleParams = useMemo(
        () => parameters.filter((p) => p.hidden !== true),
        [parameters],
    );

    return (
        <>
            <div className="eui-rb-param-panel-form">
                <div className="eui-rb-param-panel-row">
                    {visibleParams.map((param) => (
                        <ParameterField
                            key={param.id}
                            param={param}
                            value={localValues[param.id]}
                            errors={errors[param.id] ?? []}
                            onChange={(v) => handleChange(param.id, v)}
                        />
                    ))}
                </div>
            </div>
            <div className="eui-rb-param-panel-footer">
                <Button onClick={handleApply} variant="primary" size="sm">
                    Apply
                </Button>
            </div>
        </>
    );
};

export const ParameterPanel: React.FC<ParameterPanelProps> = (props) => {
    const { mode = 'docked', anchorRef, isOpen, onClose } = props;
    const panelRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (mode !== 'popover' || !isOpen || !anchorRef?.current) return;

        const updatePos = () => {
            const anchor = anchorRef.current;
            if (!anchor) return;
            const rect = anchor.getBoundingClientRect();
            setPos({
                top: rect.bottom + window.scrollY + 6,
                left: rect.left + window.scrollX,
            });
        };

        updatePos();
        window.addEventListener('scroll', updatePos, { capture: true });
        window.addEventListener('resize', updatePos);
        return () => {
            window.removeEventListener('scroll', updatePos, { capture: true });
            window.removeEventListener('resize', updatePos);
        };
    }, [mode, isOpen, anchorRef]);

    useEffect(() => {
        if (mode !== 'popover' || !isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose?.();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [mode, isOpen, onClose]);

    if (mode === 'popover') {
        if (!isOpen) return null;
        return ReactDOM.createPortal(
            <div
                ref={panelRef}
                className="eui-rb-param-popover"
                style={{ top: pos.top, left: pos.left }}
                role="dialog"
                aria-label="Report Parameters"
                aria-modal="true"
            >
                <div className="eui-rb-param-popover-header">
                    <span className="eui-rb-param-popover-header-title">Parameters</span>
                    <button
                        className="eui-rb-param-popover-close"
                        onClick={onClose}
                        aria-label="Close parameters"
                    >
                        <TimesIcon aria-hidden="true" />
                    </button>
                </div>
                <ParameterForm {...props} />
            </div>,
            document.body,
        );
    }

    return (
        <div className="eui-rb-param-panel" role="region" aria-label="Report Parameters">
            <ParameterForm {...props} />
        </div>
    );
};
