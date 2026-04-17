import React from 'react';
import type { DatasourcePlugin, DatasetField } from '../../../../components/report-builder';

function inferFields(data: unknown[]): DatasetField[] {
    if (!data.length) return [];
    const sample = data[0];
    if (typeof sample !== 'object' || sample === null) return [{ name: 'value', type: 'string' }];
    return Object.entries(sample as Record<string, unknown>).map(([key, val]): DatasetField => {
        if (Array.isArray(val)) return { name: key, type: 'array', children: inferFields(val) };
        const t = typeof val;
        return { name: key, type: t === 'number' ? 'number' : t === 'boolean' ? 'boolean' : t === 'object' ? 'object' : 'string' };
    });
}

const HttpConfigUI: React.FC<{ config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }> = ({ config, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 11, color: 'var(--eui-text-muted)', fontWeight: 500 }}>URL</label>
        <input
            type="url"
            value={(config.url as string) ?? ''}
            onChange={(e) => onChange({ ...config, url: e.target.value })}
            placeholder="https://api.example.com/data"
            style={{
                width: '100%',
                height: 30,
                padding: '0 8px',
                border: '1px solid var(--eui-border-subtle)',
                borderRadius: 4,
                background: 'var(--eui-input-bg)',
                color: 'var(--eui-text)',
                fontSize: 12,
                outline: 'none',
            }}
            aria-label="API URL"
        />
        <label style={{ fontSize: 11, color: 'var(--eui-text-muted)', fontWeight: 500 }}>JSON Path (optional, e.g. data.items)</label>
        <input
            type="text"
            value={(config.jsonPath as string) ?? ''}
            onChange={(e) => onChange({ ...config, jsonPath: e.target.value })}
            placeholder="Leave blank to use root array"
            style={{
                width: '100%',
                height: 30,
                padding: '0 8px',
                border: '1px solid var(--eui-border-subtle)',
                borderRadius: 4,
                background: 'var(--eui-input-bg)',
                color: 'var(--eui-text)',
                fontSize: 12,
                outline: 'none',
            }}
            aria-label="JSON path"
        />
    </div>
);

function getByPath(obj: unknown, path: string): unknown {
    if (!path) return obj;
    return path.split('.').reduce((cur, key) => (cur && typeof cur === 'object' ? (cur as Record<string, unknown>)[key] : undefined), obj);
}

export const httpPlugin: DatasourcePlugin = {
    type: 'http',
    name: 'HTTP / REST',
    description: 'Fetch JSON from a URL. Returns the root array or a specified JSON path.',
    icon: (() => (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
    )) as unknown as DatasourcePlugin['icon'],
    initialConfig: () => ({ url: '', jsonPath: '' }),
    ConfigUI: HttpConfigUI,
    fetch: async (config) => {
        const url = (config.url as string)?.trim();
        if (!url) return { rows: [], fields: [] };
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        const json: unknown = await resp.json();
        const data = getByPath(json, (config.jsonPath as string) ?? '');
        const rows = Array.isArray(data) ? data as Record<string, unknown>[] : [data as Record<string, unknown>];
        return { rows, fields: inferFields(rows) };
    },
};
