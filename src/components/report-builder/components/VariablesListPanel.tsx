import React from 'react';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon } from '../../../assets/icons';
import { Button } from '../../Button';
import { useReportBuilderContext, useRBStore } from '../report-builder-context';
import type { ReportBuilderState } from '../report-builder-types';
import type { VariableConfig } from '../report-definition-types';

export const VariablesListPanel: React.FC = () => {
    const { store } = useReportBuilderContext();
    const variables = useRBStore((s) => s.definition.variables ?? [], true);
    const selectedItemId = useRBStore((s) => s.selectedItemId);
    const selectedItemType = useRBStore((s) => s.selectedItemType);

    const addVariable = () => {
        const newVar: VariableConfig = {
            id: crypto.randomUUID(),
            name: `variable${variables.length + 1}`,
            scope: 'global',
        };
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                variables: [...(prev.definition.variables ?? []), newVar],
            },
            selectedItemId: newVar.id,
            selectedItemType: 'variable',
        }));
    };

    const selectVariable = (id: string) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            selectedItemId: id,
            selectedItemType: 'variable',
        }));
    };

    const deleteVariable = (id: string) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                variables: (prev.definition.variables ?? []).filter((v) => v.id !== id),
            },
            selectedItemId: prev.selectedItemId === id ? null : prev.selectedItemId,
            selectedItemType: prev.selectedItemId === id ? 'none' : prev.selectedItemType,
        }));
    };

    const moveVariable = (id: string, direction: -1 | 1) => {
        store.setState((prev: ReportBuilderState) => {
            const list = prev.definition.variables ?? [];
            const idx = list.findIndex((v) => v.id === id);
            const target = idx + direction;
            if (idx < 0 || target < 0 || target >= list.length) return prev;
            const next = [...list];
            [next[idx], next[target]] = [next[target], next[idx]];
            return {
                ...prev,
                definition: { ...prev.definition, variables: next },
            };
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="eui-rb-ds-explorer-add-row">
                <span>{variables.length} variable{variables.length !== 1 ? 's' : ''}</span>
                <Button
                    layout="outlined"
                    size="xs"
                    onClick={addVariable}
                    ariaLabel="Add variable"
                    title="Add variable"
                    leftIcon={<PlusIcon aria-hidden="true" />}
                    label="Add"
                />
            </div>

            {variables.length === 0 ? (
                <div className="eui-rb-ds-explorer-empty">
                    <p>No variables yet.<br />Click "Add" to create one.</p>
                </div>
            ) : (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {variables.map((variable, index) => {
                        const isSelected = selectedItemType === 'variable' && selectedItemId === variable.id;
                        const isFirst = index === 0;
                        const isLast = index === variables.length - 1;
                        return (
                            <div
                                key={variable.id}
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
                                onClick={() => selectVariable(variable.id)}
                                onKeyDown={(e) => { if (e.key === 'Enter') selectVariable(variable.id); }}
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--eui-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {variable.name}
                                    </div>
                                    <div style={{ fontSize: 10, color: 'var(--eui-text-muted)' }}>
                                        {variable.scope === 'global' ? 'Global' : 'Component'}
                                        {variable.defaultValueExpression ? ' · default set' : ''}
                                    </div>
                                </div>
                                <Button
                                    layout="plain"
                                    size="xs"
                                    className="eui-rb-panel-action-btn"
                                    onClick={(e) => { e.stopPropagation(); moveVariable(variable.id, -1); }}
                                    ariaLabel={`Move ${variable.name} up`}
                                    title="Move up"
                                    disabled={isFirst}
                                    leftIcon={<ChevronUpIcon aria-hidden="true" />}
                                />
                                <Button
                                    layout="plain"
                                    size="xs"
                                    className="eui-rb-panel-action-btn"
                                    onClick={(e) => { e.stopPropagation(); moveVariable(variable.id, 1); }}
                                    ariaLabel={`Move ${variable.name} down`}
                                    title="Move down"
                                    disabled={isLast}
                                    leftIcon={<ChevronDownIcon aria-hidden="true" />}
                                />
                                <Button
                                    layout="plain"
                                    size="xs"
                                    className="eui-rb-panel-action-btn"
                                    onClick={(e) => { e.stopPropagation(); deleteVariable(variable.id); }}
                                    ariaLabel={`Delete ${variable.name}`}
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
