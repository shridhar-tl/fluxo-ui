import React, { useCallback } from 'react';
import { Dropdown } from '../../Dropdown';
import { TextInput } from '../../TextInput';
import { TextArea } from '../../TextArea';
import type { ComponentEvent, ListItem } from '../../../types/index';
import { useReportBuilderContext, useRBStore } from '../report-builder-context';
import type { ReportBuilderState } from '../report-builder-types';
import type { VariableConfig, VariableScope } from '../report-definition-types';

interface Props {
    variableId: string;
}

const scopeOptions: ListItem[] = [
    { value: 'global', label: 'Global (whole report)' },
    { value: 'component', label: 'Component (only inside one component)' },
];

export const VariableDesigner: React.FC<Props> = ({ variableId }) => {
    const { store } = useReportBuilderContext();
    const variables = useRBStore((s) => s.definition.variables ?? [], true);
    const variable = variables.find((v) => v.id === variableId);

    const update = useCallback(
        (patch: Partial<VariableConfig>) => {
            store.setState((prev: ReportBuilderState) => ({
                ...prev,
                definition: {
                    ...prev.definition,
                    variables: (prev.definition.variables ?? []).map((v) =>
                        v.id === variableId ? { ...v, ...patch } : v,
                    ),
                },
            }));
        },
        [store, variableId],
    );

    if (!variable) {
        return (
            <div className="eui-rb-props-pallet-empty">
                <span>Variable not found</span>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', display: 'block', marginBottom: 4 }}>
                    Name
                </label>
                <TextInput
                    value={variable.name}
                    onChange={(e) => update({ name: e.value })}
                    placeholder="variableName"
                    aria-label="Variable name"
                    size="sm"
                />
                <div style={{ fontSize: 10, color: 'var(--eui-text-muted)', marginTop: 4 }}>
                    Read in expressions as <code>Variables.{variable.name || 'name'}</code>
                </div>
            </div>

            <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', display: 'block', marginBottom: 4 }}>
                    Scope
                </label>
                <Dropdown
                    options={scopeOptions}
                    value={variable.scope}
                    onChange={(e: ComponentEvent<string>) => update({ scope: (e.value as VariableScope) || 'global' })}
                    aria-label="Variable scope"
                />
                <div style={{ fontSize: 10, color: 'var(--eui-text-muted)', marginTop: 4 }}>
                    Global variables live on the report. Component-scoped variables are still defined here for now and live alongside global variables; in a future iteration they will be authored on each component.
                </div>
            </div>

            <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', display: 'block', marginBottom: 4 }}>
                    Description
                </label>
                <TextArea
                    value={variable.description ?? ''}
                    onChange={(e) => update({ description: e.target.value || undefined })}
                    rows={2}
                    placeholder="What this variable represents (optional)"
                    aria-label="Variable description"
                />
            </div>

            <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', display: 'block', marginBottom: 4 }}>
                    Default Value
                </label>
                <TextInput
                    value={variable.defaultValueExpression ?? ''}
                    onChange={(e) => update({ defaultValueExpression: e.value || undefined })}
                    placeholder="literal value or =expression"
                    aria-label="Default value or expression"
                    size="sm"
                />
                <div style={{ fontSize: 10, color: 'var(--eui-text-muted)', marginTop: 4 }}>
                    Prefix with <code>=</code> for an expression. Leave blank to start undefined.
                </div>
            </div>
        </div>
    );
};
