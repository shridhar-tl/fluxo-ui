import React, { useCallback } from 'react';
import { TrashIcon } from '../../../../assets/icons';
import { Button } from '../../../Button';
import { TextInput } from '../../../TextInput';
import type { VariableConfig } from '../../report-definition-types';

interface Props {
    variables: VariableConfig[] | undefined;
    onChange: (next: VariableConfig[]) => void;
    title?: string;
    description?: string;
}

export const ComponentVariablesEditor: React.FC<Props> = ({ variables, onChange, title = 'Variables', description }) => {
    const list = variables ?? [];

    const addVariable = useCallback(() => {
        onChange([
            ...list,
            {
                id: crypto.randomUUID(),
                name: `var${list.length + 1}`,
                scope: 'component',
            },
        ]);
    }, [list, onChange]);

    const update = useCallback(
        (id: string, patch: Partial<VariableConfig>) => {
            onChange(list.map((v) => (v.id === id ? { ...v, ...patch } : v)));
        },
        [list, onChange],
    );

    const remove = useCallback(
        (id: string) => {
            onChange(list.filter((v) => v.id !== id));
        },
        [list, onChange],
    );

    return (
        <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)' }}>
                    {title} ({list.length})
                </span>
                <Button
                    layout="outlined"
                    size="xs"
                    onClick={addVariable}
                    ariaLabel="Add variable"
                    label="+ Variable"
                />
            </div>
            {description && (
                <div style={{ fontSize: 10, color: 'var(--eui-text-muted)', marginBottom: 6 }}>{description}</div>
            )}
            {list.length === 0 && (
                <div style={{ fontSize: 10, color: 'var(--eui-text-muted)', fontStyle: 'italic' }}>
                    None defined.
                </div>
            )}
            {list.map((v) => (
                <div
                    key={v.id}
                    style={{
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 4,
                        padding: 6,
                        marginBottom: 4,
                        background: 'var(--eui-bg-subtle)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                        <TextInput
                            value={v.name}
                            onChange={(e) => update(v.id, { name: e.value })}
                            placeholder="variableName"
                            size="sm"
                            aria-label="Variable name"
                        />
                        <Button
                            layout="plain"
                            size="xs"
                            variant="danger"
                            onClick={() => remove(v.id)}
                            ariaLabel={`Remove variable ${v.name}`}
                            leftIcon={<TrashIcon aria-hidden="true" />}
                        />
                    </div>
                    <TextInput
                        value={v.defaultValueExpression ?? ''}
                        onChange={(e) => update(v.id, { defaultValueExpression: e.value || undefined })}
                        placeholder="default value or =expression"
                        size="sm"
                        aria-label="Variable default value"
                    />
                </div>
            ))}
        </div>
    );
};
