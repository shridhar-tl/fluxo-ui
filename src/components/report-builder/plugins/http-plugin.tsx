import React from 'react';
import { PlusIcon, TrashIcon, WebsiteIcon } from '../../../assets/icons';
import { Button } from '../../Button';
import { Dropdown } from '../../Dropdown';
import { TextArea } from '../../TextArea';
import { TextInput } from '../../TextInput';
import type { ListItem } from '../../../types';
import { inferFieldsFromRows } from '../dataset-schema';
import { getValue } from '../data/value-utils';
import type { DatasourceConfigUIProps, DatasourcePlugin } from '../report-builder-types';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpDatasourceRequest {
    method: HttpMethod;
    url: string;
    headers: Record<string, string>;
    body?: string;
    signal: AbortSignal;
}

export interface HttpDatasourceOptions {
    /**
     * Performs the request and resolves with the parsed response body. Use it to route calls through
     * an authenticated client or a proxy. Defaults to `window.fetch` with a JSON response.
     */
    request?: (request: HttpDatasourceRequest) => Promise<unknown>;
    name?: string;
    description?: string;
}

interface KeyValue {
    name: string;
    value: string;
}

interface HttpDatasourceConfig {
    method: HttpMethod;
    url: string;
    query: KeyValue[];
    headers: KeyValue[];
    body?: string;
    resultPath?: string;
}

const methodOptions: ListItem[] = (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as HttpMethod[]).map((m) => ({ value: m, label: m }));
const allowedUrlPattern = /^(https?:\/\/|\/)/i;

async function defaultRequest(req: HttpDatasourceRequest): Promise<unknown> {
    const resp = await fetch(req.url, { method: req.method, headers: req.headers, body: req.body, signal: req.signal });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    return resp.json();
}

function toRows(data: unknown): Record<string, unknown>[] {
    if (Array.isArray(data)) return data.map((r) => (r !== null && typeof r === 'object' ? r as Record<string, unknown> : { value: r }));
    if (data !== null && typeof data === 'object') return [data as Record<string, unknown>];
    return data === undefined || data === null ? [] : [{ value: data }];
}

const KeyValueEditor: React.FC<{ items: KeyValue[]; onChange: (items: KeyValue[]) => void; label: string }> = ({ items, onChange, label }) => (
    <div className="eui-rb-list-editor">
        {items.map((item, i) => (
            <div key={i} className="eui-rb-list-editor-row">
                <div className="eui-rb-list-editor-grow">
                    <TextInput value={item.name} onChange={(e) => onChange(items.map((x, idx) => (idx === i ? { ...x, name: e.value } : x)))} placeholder="Name" size="sm" aria-label={`${label} ${i + 1} name`} />
                </div>
                <div className="eui-rb-list-editor-grow">
                    <TextInput value={item.value} onChange={(e) => onChange(items.map((x, idx) => (idx === i ? { ...x, value: e.value } : x)))} placeholder="Value or {{ expression }}" size="sm" aria-label={`${label} ${i + 1} value`} />
                </div>
                <Button layout="plain" size="xs" onClick={() => onChange(items.filter((_, idx) => idx !== i))} ariaLabel={`Remove ${label} ${i + 1}`} leftIcon={<TrashIcon aria-hidden="true" />} />
            </div>
        ))}
        <Button layout="plain" size="xs" onClick={() => onChange([...items, { name: '', value: '' }])} leftIcon={<PlusIcon aria-hidden="true" />} label={`Add ${label.toLowerCase()}`} />
    </div>
);

const HttpConfigUI: React.FC<DatasourceConfigUIProps> = ({ datasourceId, config, onChange }) => {
    const cfg = config as unknown as HttpDatasourceConfig;
    const set = (patch: Partial<HttpDatasourceConfig>) => onChange({ ...cfg, ...patch } as unknown as Record<string, unknown>);
    const id = (s: string) => `rb-http-${s}-${datasourceId}`;

    return (
        <div className="eui-rb-plugin-config">
            <div className="eui-rb-list-editor-row">
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label" htmlFor={id('method')}>Method</label>
                    <Dropdown id={id('method')} options={methodOptions} value={cfg.method} onChange={(e) => set({ method: e.value as HttpMethod })} size="sm" />
                </div>
                <div className="eui-rb-prop-field eui-rb-list-editor-grow">
                    <label className="eui-rb-prop-field-label" htmlFor={id('url')}>URL</label>
                    <TextInput id={id('url')} value={cfg.url} onChange={(e) => set({ url: e.value })} placeholder="https://api.example.com/items/{{ Parameters.id }}" size="sm" />
                </div>
            </div>
            <div className="eui-rb-derived-section-label">Query parameters</div>
            <KeyValueEditor items={cfg.query ?? []} onChange={(query) => set({ query })} label="Query parameter" />
            <div className="eui-rb-derived-section-label">Headers</div>
            <KeyValueEditor items={cfg.headers ?? []} onChange={(headers) => set({ headers })} label="Header" />
            {cfg.method !== 'GET' && (
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label" htmlFor={id('body')}>Body</label>
                    <TextArea id={id('body')} value={cfg.body ?? ''} onChange={(e) => set({ body: e.value || undefined })} rows={4} placeholder={'{ "from": "{{ Parameters.from }}" }'} />
                </div>
            )}
            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label" htmlFor={id('path')}>Rows are at path (optional)</label>
                <TextInput id={id('path')} value={cfg.resultPath ?? ''} onChange={(e) => set({ resultPath: e.value || undefined })} placeholder="e.g. data.items" size="sm" />
            </div>
            <span className="eui-rb-ds-config-hint">{'Use {{ expression }} anywhere to insert parameter values, e.g. {{ Parameters.project }}.'}</span>
        </div>
    );
};

export function createHttpDatasourcePlugin(options: HttpDatasourceOptions = {}): DatasourcePlugin {
    const request = options.request ?? defaultRequest;
    return {
        type: 'http',
        name: options.name ?? 'HTTP / REST',
        description: options.description ?? 'Fetch JSON from a web API. URL, headers and body accept {{ expressions }}.',
        icon: WebsiteIcon,
        category: 'Online',
        initialConfig: () => ({ method: 'GET', url: '', query: [], headers: [] }),
        ConfigUI: HttpConfigUI,
        describe: (config) => {
            const cfg = config as unknown as HttpDatasourceConfig;
            return cfg.url ? `${cfg.method} ${cfg.url}` : 'No URL configured';
        },
        fetch: async (config, context) => {
            const cfg = config as unknown as HttpDatasourceConfig;
            const baseUrl = (await context.interpolate(cfg.url ?? '')).trim();
            if (!baseUrl) throw new Error('Enter the URL to fetch.');
            if (!allowedUrlPattern.test(baseUrl)) throw new Error('Only http, https and relative URLs are allowed.');
            const query: string[] = [];
            for (const q of cfg.query ?? []) {
                if (!q.name.trim()) continue;
                query.push(`${encodeURIComponent(q.name.trim())}=${encodeURIComponent(await context.interpolate(q.value ?? ''))}`);
            }
            const url = query.length > 0 ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${query.join('&')}` : baseUrl;
            const headers: Record<string, string> = {};
            for (const h of cfg.headers ?? []) {
                if (h.name.trim()) headers[h.name.trim()] = await context.interpolate(h.value ?? '');
            }
            const body = cfg.method !== 'GET' && cfg.body ? await context.interpolate(cfg.body, (v) => JSON.stringify(v ?? null).replace(/^"|"$/g, '')) : undefined;
            const data = await request({ method: cfg.method, url, headers, body, signal: context.signal });
            const rows = toRows(cfg.resultPath ? getValue(data, cfg.resultPath) : data);
            return { rows, fields: inferFieldsFromRows(rows) };
        },
    };
}
