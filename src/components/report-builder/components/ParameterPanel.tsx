import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '../../Button';
import { Checkbox } from '../../Checkbox';
import { Chips } from '../../Chips';
import { default as DateRangePicker } from '../../date-range';
import { Dropdown } from '../../Dropdown';
import { MaskedInput } from '../../MaskedInput';
import { Multiselect } from '../../Multiselect';
import { NumericInput } from '../../NumericInput';
import { RadioButtonGroup } from '../../RadioButton';
import { TextArea } from '../../TextArea';
import { TextInput } from '../../TextInput';
import { TimesIcon } from '../../../assets/icons';
import type { ComponentEvent } from '../../../types';
import type { ParameterConfig } from '../report-definition-types';

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

function ParameterField({ param, value, onChange }: {
    param: ParameterConfig;
    value: unknown;
    onChange: (value: unknown) => void;
}) {
    const tc = param.typeConfig;

    if (param.hidden === true) return null;

    const label = (
        <label htmlFor={`rb-runtime-param-${param.id}`} style={{ fontSize: 12, fontWeight: 500, color: 'var(--eui-text)' }}>
            {param.label}
            {param.mandatory && <span style={{ color: 'var(--eui-danger)', marginLeft: 2 }}>*</span>}
        </label>
    );

    const disabled = param.readOnly === true;

    let input: React.ReactNode;

    switch (param.type) {
        case 'text':
            input = tc.multiline ? (
                <TextArea
                    id={`rb-runtime-param-${param.id}`}
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={(tc.placeholder as string) ?? ''}
                    disabled={disabled}
                    rows={3}
                />
            ) : (
                <TextInput
                    id={`rb-runtime-param-${param.id}`}
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={(tc.placeholder as string) ?? ''}
                    disabled={disabled}
                />
            );
            break;

        case 'masked-edit':
            input = (
                <MaskedInput
                    id={`rb-runtime-param-${param.id}`}
                    value={(value as string) ?? ''}
                    onChange={(e: ComponentEvent<string>) => onChange(e.value)}
                    mask={(tc.mask as string) ?? ''}
                    disabled={disabled}
                />
            );
            break;

        case 'numeric':
            input = (
                <NumericInput
                    id={`rb-runtime-param-${param.id}`}
                    value={(value as number) ?? undefined}
                    onChange={(e: ComponentEvent<number>) => onChange(e.value)}
                    min={tc.min as number | undefined}
                    max={tc.max as number | undefined}
                    step={tc.step as number | undefined}
                    maxDecimals={tc.decimalPlaces as number | undefined}
                    disabled={disabled}
                />
            );
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
                />
            );
            break;

        case 'date-range-picker':
            input = (
                <DateRangePicker
                    value={value as any ?? null}
                    onChange={(v) => onChange(v)}
                    disabled={disabled}
                />
            );
            break;

        case 'dropdown': {
            const opts = ((tc.options as Array<{ label: string; value: unknown }>) ?? []).map((o) => ({
                label: o.label,
                value: String(o.value),
            }));
            input = (
                <Dropdown
                    id={`rb-runtime-param-${param.id}`}
                    options={opts}
                    value={(value as string) ?? ''}
                    onChange={(e: ComponentEvent<string>) => onChange(e.value)}
                    searchable={(tc.searchable as boolean) ?? false}
                    disabled={disabled}
                />
            );
            break;
        }

        case 'radio-button': {
            const opts = (tc.options as Array<{ label: string; value: unknown }>) ?? [];
            input = (
                <RadioButtonGroup
                    name={`rb-runtime-param-${param.id}`}
                    items={opts.map((o) => ({ label: o.label, value: String(o.value), disabled }))}
                    value={(value as string) ?? ''}
                    onChange={(e: ComponentEvent<string>) => onChange(e.value)}
                />
            );
            break;
        }

        case 'multi-select': {
            const opts = ((tc.options as Array<{ label: string; value: unknown }>) ?? []).map((o) => ({
                label: o.label,
                value: String(o.value),
            }));
            input = (
                <Multiselect
                    id={`rb-runtime-param-${param.id}`}
                    options={opts}
                    value={(value as string[]) ?? []}
                    onChange={(e: ComponentEvent<string[]>) => onChange(e.value)}
                    disabled={disabled}
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

        default:
            input = (
                <TextInput
                    id={`rb-runtime-param-${param.id}`}
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                />
            );
    }

    return (
        <div className="eui-rb-param-panel-field" style={{ flex: `0 0 ${(param.width ?? 1) * 100}%`, maxWidth: `${(param.width ?? 1) * 100}%`, minWidth: 120 }}>
            {param.type !== 'checkbox' && label}
            {input}
            {param.description && (
                <div className="description">{param.description}</div>
            )}
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

    useEffect(() => {
        setLocalValues(values);
    }, [values]);

    const handleChange = useCallback((id: string, value: unknown) => {
        setLocalValues((prev) => {
            const next = { ...prev, [id]: value };
            onChange(next);
            return next;
        });
    }, [onChange]);

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
                            onChange={(v) => handleChange(param.id, v)}
                        />
                    ))}
                </div>
            </div>
            <div className="eui-rb-param-panel-footer">
                <Button onClick={() => onApply(localValues)} variant="primary">
                    Apply / Run Report
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
