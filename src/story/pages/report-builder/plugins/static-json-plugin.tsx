import React, { useState } from 'react';
import type { DatasourcePlugin, DatasetField } from '../../../../components/report-builder';

function inferFields(data: unknown[]): DatasetField[] {
    if (!data.length) return [];
    const sample = data[0];
    if (typeof sample !== 'object' || sample === null) return [{ name: 'value', type: 'string' }];

    return Object.entries(sample as Record<string, unknown>).map(([key, val]): DatasetField => {
        if (Array.isArray(val)) {
            return { name: key, type: 'array', children: inferFields(val) };
        }
        if (val instanceof Date || (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val))) {
            return { name: key, type: 'date' };
        }
        const t = typeof val;
        return { name: key, type: t === 'number' ? 'number' : t === 'boolean' ? 'boolean' : t === 'object' ? 'object' : 'string' };
    });
}

const StaticJsonConfigUI: React.FC<{ config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }> = ({ config, onChange }) => {
    const [error, setError] = useState('');
    const raw = (config.json as string) ?? '[]';

    const handleChange = (value: string) => {
        try {
            JSON.parse(value);
            setError('');
        } catch {
            setError('Invalid JSON');
        }
        onChange({ ...config, json: value });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 11, color: 'var(--eui-text-muted)', fontWeight: 500 }}>JSON Data (array)</label>
            <textarea
                value={raw}
                onChange={(e) => handleChange(e.target.value)}
                rows={8}
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
                aria-describedby={error ? 'sjp-error' : undefined}
            />
            {error && <span id="sjp-error" style={{ fontSize: 11, color: 'var(--eui-danger)' }}>{error}</span>}
        </div>
    );
};

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
        const raw = (config.json as string) ?? '[]';
        let parsed: unknown;
        try {
            parsed = JSON.parse(raw);
        } catch {
            return { rows: [], fields: [] };
        }
        const rows = Array.isArray(parsed) ? parsed as Record<string, unknown>[] : [parsed as Record<string, unknown>];
        return { rows, fields: inferFields(rows) };
    },
};
