import React, { useMemo, useState } from 'react';
import type { DatasourcePlugin, DatasetField } from '../../../../components/report-builder';
import { inferFieldsFromRows, parseJsonRows } from '../../../../components/report-builder';

const StaticJsonConfigUI: React.FC<{ config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }> = ({ config, onChange }) => {
    const raw = (config.json as string) ?? '[]';
    const rows = useMemo(() => parseJsonRows(raw), [raw]);
    const [editing, setEditing] = useState(() => rows.length === 0);
    const [draft, setDraft] = useState(raw);
    const [error, setError] = useState('');

    const sampleRow = rows[0] ?? null;

    const openEditor = (): void => {
        setDraft(raw);
        setError('');
        setEditing(true);
    };

    const save = (): void => {
        try {
            JSON.parse(draft);
            setError('');
        } catch {
            setError('Invalid JSON — fix the syntax or cancel.');
            return;
        }
        onChange({ ...config, json: draft });
        setEditing(false);
    };

    const cancel = (): void => {
        setDraft(raw);
        setError('');
        setEditing(rows.length === 0);
    };

    if (editing) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 11, color: 'var(--eui-text-muted)', fontWeight: 500 }}>JSON Data (array)</label>
                <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={10}
                    style={{
                        width: '100%',
                        fontFamily: 'monospace',
                        fontSize: 11,
                        padding: '8px',
                        border: `1px solid ${error ? 'var(--eui-danger)' : 'var(--eui-border-subtle)'}`,
                        borderRadius: 4,
                        background: 'var(--eui-input-bg)',
                        color: 'var(--eui-text)',
                        resize: 'vertical',
                        outline: 'none',
                    }}
                    aria-label="JSON data"
                    aria-invalid={!!error}
                />
                {error && <span style={{ fontSize: 11, color: 'var(--eui-danger)' }}>{error}</span>}
                <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" onClick={save} style={btnStyle('primary')}>Save</button>
                    {rows.length > 0 && (
                        <button type="button" onClick={cancel} style={btnStyle()}>Cancel</button>
                    )}
                </div>
            </div>
        );
    }

    const sampleKeys = sampleRow && typeof sampleRow === 'object' ? Object.keys(sampleRow) : [];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div
                style={{
                    padding: '10px 12px',
                    background: 'var(--eui-bg-subtle)',
                    border: '1px solid var(--eui-border-subtle)',
                    borderRadius: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                    <strong style={{ fontSize: 12, color: 'var(--eui-text)' }}>
                        {rows.length} row{rows.length === 1 ? '' : 's'}
                    </strong>
                    {sampleKeys.length > 0 && (
                        <span style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>
                            {sampleKeys.length} field{sampleKeys.length === 1 ? '' : 's'}
                        </span>
                    )}
                </div>
                {sampleKeys.length > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--eui-text-muted)', lineHeight: 1.6 }}>
                        Fields: {sampleKeys.slice(0, 8).join(', ')}
                        {sampleKeys.length > 8 ? `, +${sampleKeys.length - 8} more` : ''}
                    </div>
                )}
            </div>
            <button type="button" onClick={openEditor} style={btnStyle()} aria-label="Edit JSON data">
                Edit JSON…
            </button>
            <p style={{ fontSize: 11, color: 'var(--eui-text-muted)', fontStyle: 'italic', margin: 0 }}>
                Full field list is in the Datasource Explorer — click to expand.
            </p>
        </div>
    );
};

function btnStyle(variant?: 'primary'): React.CSSProperties {
    const isPrimary = variant === 'primary';
    return {
        height: 28,
        padding: '0 12px',
        fontSize: 12,
        fontWeight: 500,
        border: '1px solid var(--eui-border-subtle)',
        borderRadius: 4,
        background: isPrimary ? 'var(--eui-primary)' : 'var(--eui-bg)',
        color: isPrimary ? 'var(--eui-primary-contrast)' : 'var(--eui-text)',
        cursor: 'pointer',
        alignSelf: 'flex-start',
    };
}

export const staticJsonPlugin: DatasourcePlugin = {
    type: 'static-json',
    name: 'Static JSON',
    description: 'Paste or type JSON directly. Useful for testing with nested data.',
    icon: (() => (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 3h2v2H5v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 0 0-2-2H0v-2h1a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2m14 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5h-2V3h2M12 15a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1m-4 0a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1m8 0a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1z"/>
        </svg>
    )) as unknown as DatasourcePlugin['icon'],
    initialConfig: () => ({ json: '[]' }),
    ConfigUI: StaticJsonConfigUI,
    fetch: async (config) => {
        const rows = parseJsonRows((config.json as string) ?? '[]');
        return { rows, fields: inferFieldsFromRows(rows) };
    },
    inferSchema: (config): DatasetField[] => {
        const rows = parseJsonRows((config.json as string) ?? '[]');
        return inferFieldsFromRows(rows);
    },
};
