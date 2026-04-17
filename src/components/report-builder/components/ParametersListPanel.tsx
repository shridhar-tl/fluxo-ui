import React from 'react';
import { PlusIcon, TrashIcon } from '../../../assets/icons';
import { Button } from '../../Button';
import { useReportBuilderContext, useRBStore } from '../report-builder-context';
import type { ReportBuilderState } from '../report-builder-types';
import type { ParameterConfig } from '../report-definition-types';

const paramTypeLabels: Record<string, string> = {
    text: 'Text',
    'masked-edit': 'Masked Edit',
    numeric: 'Numeric',
    'date-picker': 'Date Picker',
    'date-range-picker': 'Date Range',
    dropdown: 'Dropdown',
    'radio-button': 'Radio Button',
    'multi-select': 'Multi-select',
    chips: 'Chips',
    checkbox: 'Checkbox',
};

export const ParametersListPanel: React.FC = () => {
    const { store } = useReportBuilderContext();
    const parameters = useRBStore((s) => s.definition.parameters);
    const selectedItemId = useRBStore((s) => s.selectedItemId);

    const addParameter = () => {
        const newParam: ParameterConfig = {
            id: crypto.randomUUID(),
            name: `parameter${parameters.length + 1}`,
            type: 'text',
            label: `Parameter ${parameters.length + 1}`,
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="eui-rb-ds-explorer-add-row">
                <span>{parameters.length} parameter{parameters.length !== 1 ? 's' : ''}</span>
                <Button
                    layout="outlined"
                    size="xs"
                    onClick={addParameter}
                    ariaLabel="Add parameter"
                    title="Add parameter"
                    leftIcon={<PlusIcon aria-hidden="true" />}
                    label="Add"
                />
            </div>

            {parameters.length === 0 ? (
                <div className="eui-rb-ds-explorer-empty">
                    <p>No parameters yet.<br />Click "Add" to create one.</p>
                </div>
            ) : (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {parameters.map((param) => {
                        const isSelected = selectedItemId === param.id;
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
