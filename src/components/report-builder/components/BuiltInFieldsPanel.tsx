import React, { useMemo } from 'react';
import { useReportBuilderContext } from '../report-builder-context';

function groupByGroup<T extends { group?: string }>(items: T[]): Record<string, T[]> {
    const out: Record<string, T[]> = {};
    for (const item of items) {
        const key = item.group ?? 'General';
        if (!out[key]) out[key] = [];
        out[key].push(item);
    }
    return out;
}

export const BuiltInFieldsPanel: React.FC = () => {
    const { builtInFields } = useReportBuilderContext();
    const groups = useMemo(() => groupByGroup(builtInFields), [builtInFields]);
    const groupKeys = useMemo(() => Object.keys(groups).sort(), [groups]);

    if (builtInFields.length === 0) {
        return (
            <div className="eui-rb-panel">
                <div style={{ padding: 12, fontSize: 12, color: 'var(--eui-text-muted)', fontStyle: 'italic' }}>
                    No fields available.
                </div>
            </div>
        );
    }

    return (
        <div className="eui-rb-panel">
            <div style={{ overflowY: 'auto', flex: 1 }}>
                {groupKeys.map((groupName) => (
                    <div key={groupName} style={{ marginBottom: 6 }}>
                        <div
                            style={{
                                padding: '6px 12px',
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                color: 'var(--eui-text-muted)',
                                background: 'var(--eui-bg-subtle)',
                                borderTop: '1px solid var(--eui-border-subtle)',
                                borderBottom: '1px solid var(--eui-border-subtle)',
                            }}
                        >
                            {groupName}
                        </div>
                        {groups[groupName].map((field) => (
                            <div
                                key={field.name}
                                style={{
                                    padding: '8px 12px',
                                    borderBottom: '1px solid var(--eui-border-subtle)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                    <code style={{ fontSize: 12, fontWeight: 600, color: 'var(--eui-text)' }}>
                                        {field.name}
                                    </code>
                                    {field.label && field.label !== field.name && (
                                        <span style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>{field.label}</span>
                                    )}
                                </div>
                                {field.description && (
                                    <div style={{ fontSize: 11, color: 'var(--eui-text-muted)', marginTop: 2, lineHeight: 1.4 }}>
                                        {field.description}
                                    </div>
                                )}
                                <div style={{ fontSize: 10, color: 'var(--eui-text-muted)', marginTop: 4, fontFamily: 'Menlo, Consolas, monospace' }}>
                                    BuiltInFields.{field.name}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

BuiltInFieldsPanel.displayName = 'BuiltInFieldsPanel';
