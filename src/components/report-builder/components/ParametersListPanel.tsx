import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon } from '../../../assets/icons';
import { Button } from '../../Button';
import { useReportBuilderContext, useRBStore } from '../report-builder-context';
import type { ReportBuilderState } from '../report-builder-types';
import type { ParameterConfig, ParameterType } from '../report-definition-types';

const paramTypeLabels: Record<string, string> = {
    text: 'Text',
    'masked-edit': 'Masked Edit',
    numeric: 'Numeric',
    'date-picker': 'Date Picker',
    'date-range-picker': 'Date Range',
    dropdown: 'Dropdown',
    autocomplete: 'Autocomplete',
    'radio-button': 'Radio Button',
    'multi-select': 'Multi-select',
    chips: 'Chips',
    checkbox: 'Checkbox',
    file: 'File',
};

const builtInTypes: Array<{ type: ParameterType; label: string }> = [
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

export const ParametersListPanel: React.FC = () => {
    const { store, parameterPlugins } = useReportBuilderContext();
    const parameters = useRBStore((s) => s.definition.parameters);
    const selectedItemId = useRBStore((s) => s.selectedItemId);
    const addBtnRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

    const allTypes = [
        ...builtInTypes,
        ...parameterPlugins.map((pl) => ({ type: pl.type as ParameterType, label: pl.name })),
    ];

    useEffect(() => {
        if (!pickerOpen) return;
        const updatePos = () => {
            const anchor = addBtnRef.current;
            if (!anchor) return;
            const rect = anchor.getBoundingClientRect();
            setMenuPos({
                top: rect.bottom + window.scrollY + 4,
                left: rect.right + window.scrollX - 200,
            });
        };
        updatePos();
        window.addEventListener('scroll', updatePos, { capture: true });
        window.addEventListener('resize', updatePos);
        return () => {
            window.removeEventListener('scroll', updatePos, { capture: true });
            window.removeEventListener('resize', updatePos);
        };
    }, [pickerOpen]);

    useEffect(() => {
        if (!pickerOpen) return;
        const handleOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (menuRef.current?.contains(target)) return;
            if (addBtnRef.current?.contains(target)) return;
            setPickerOpen(false);
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setPickerOpen(false);
        };
        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('keydown', handleKey);
        };
    }, [pickerOpen]);

    const addParameter = (type: ParameterType) => {
        const typeLabel = allTypes.find((t) => t.type === type)?.label ?? 'Parameter';
        const newParam: ParameterConfig = {
            id: crypto.randomUUID(),
            name: `parameter${parameters.length + 1}`,
            type,
            label: `${typeLabel} ${parameters.length + 1}`,
            mandatory: false,
            typeConfig: {},
            width: 1,
        };
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                parameters: [...prev.definition.parameters, newParam],
            },
            selectedItemId: newParam.id,
            selectedItemType: 'parameter',
        }));
        setPickerOpen(false);
    };

    const selectParameter = (id: string) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            selectedItemId: id,
            selectedItemType: 'parameter',
        }));
    };

    const deleteParameter = (id: string) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                parameters: prev.definition.parameters.filter((p: ParameterConfig) => p.id !== id),
            },
            selectedItemId: prev.selectedItemId === id ? null : prev.selectedItemId,
            selectedItemType: prev.selectedItemId === id ? 'none' : prev.selectedItemType,
        }));
    };

    const moveParameter = (id: string, direction: -1 | 1) => {
        store.setState((prev: ReportBuilderState) => {
            const list = prev.definition.parameters;
            const idx = list.findIndex((p: ParameterConfig) => p.id === id);
            const target = idx + direction;
            if (idx < 0 || target < 0 || target >= list.length) return prev;
            const next = [...list];
            [next[idx], next[target]] = [next[target], next[idx]];
            return {
                ...prev,
                definition: { ...prev.definition, parameters: next },
            };
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="eui-rb-ds-explorer-add-row">
                <span>{parameters.length} parameter{parameters.length !== 1 ? 's' : ''}</span>
                <div ref={addBtnRef} style={{ position: 'relative' }}>
                    <Button
                        layout="outlined"
                        size="xs"
                        onClick={() => setPickerOpen((v) => !v)}
                        ariaLabel="Add parameter"
                        title="Add parameter"
                        leftIcon={<PlusIcon aria-hidden="true" />}
                        label="Add"
                        aria-haspopup="menu"
                        aria-expanded={pickerOpen}
                    />
                </div>
            </div>
            {pickerOpen && ReactDOM.createPortal(
                <div
                    ref={menuRef}
                    role="menu"
                    aria-label="Add parameter type"
                    style={{
                        position: 'absolute',
                        top: menuPos.top,
                        left: menuPos.left,
                        width: 200,
                        maxHeight: 320,
                        overflowY: 'auto',
                        background: 'var(--eui-bg)',
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 6,
                        boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                        zIndex: 10050,
                        padding: 4,
                    }}
                >
                    <div style={{
                        padding: '6px 10px 4px',
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--eui-text-muted)',
                    }}>
                        Pick a Type
                    </div>
                    {allTypes.map(({ type, label }) => (
                        <button
                            key={type}
                            role="menuitem"
                            onClick={() => addParameter(type)}
                            style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                padding: '6px 10px',
                                fontSize: 12,
                                background: 'transparent',
                                border: 'none',
                                borderRadius: 4,
                                color: 'var(--eui-text)',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--eui-bg-subtle)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                        >
                            {label}
                        </button>
                    ))}
                </div>,
                document.body,
            )}

            {parameters.length === 0 ? (
                <div className="eui-rb-ds-explorer-empty">
                    <p>No parameters yet.<br />Click "Add" to create one.</p>
                </div>
            ) : (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {parameters.map((param, index) => {
                        const isSelected = selectedItemId === param.id;
                        const isFirst = index === 0;
                        const isLast = index === parameters.length - 1;
                        return (
                            <div
                                key={param.id}
                                role="button"
                                tabIndex={0}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '6px 12px',
                                    cursor: 'pointer',
                                    background: isSelected ? 'var(--eui-primary-soft)' : 'transparent',
                                    borderLeft: isSelected ? '3px solid var(--eui-primary)' : '3px solid transparent',
                                    transition: 'background 0.1s',
                                }}
                                onClick={() => selectParameter(param.id)}
                                onKeyDown={(e) => { if (e.key === 'Enter') selectParameter(param.id); }}
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--eui-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {param.label}
                                    </div>
                                    <div style={{ fontSize: 10, color: 'var(--eui-text-muted)' }}>
                                        {param.name} · {paramTypeLabels[param.type] ?? param.type}
                                        {param.mandatory && ' · Required'}
                                    </div>
                                </div>
                                <Button
                                    layout="plain"
                                    size="xs"
                                    className="eui-rb-panel-action-btn"
                                    onClick={(e) => { e.stopPropagation(); moveParameter(param.id, -1); }}
                                    ariaLabel={`Move ${param.label} up`}
                                    title="Move up"
                                    disabled={isFirst}
                                    leftIcon={<ChevronUpIcon aria-hidden="true" />}
                                />
                                <Button
                                    layout="plain"
                                    size="xs"
                                    className="eui-rb-panel-action-btn"
                                    onClick={(e) => { e.stopPropagation(); moveParameter(param.id, 1); }}
                                    ariaLabel={`Move ${param.label} down`}
                                    title="Move down"
                                    disabled={isLast}
                                    leftIcon={<ChevronDownIcon aria-hidden="true" />}
                                />
                                <Button
                                    layout="plain"
                                    size="xs"
                                    className="eui-rb-panel-action-btn"
                                    onClick={(e) => { e.stopPropagation(); deleteParameter(param.id); }}
                                    ariaLabel={`Delete ${param.label}`}
                                    title="Delete"
                                    leftIcon={<TrashIcon aria-hidden="true" />}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
