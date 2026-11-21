import React from 'react';
import { PlusIcon, TableIcon, TrashIcon } from '../../../assets/icons';
import { Button } from '../../Button';
import { Checkbox } from '../../Checkbox';
import { Dropdown } from '../../Dropdown';
import { TextInput } from '../../TextInput';
import type { ListItem } from '../../../types';
import type { DatasourceConfigUIProps, DatasourcePlugin } from '../report-builder-types';
import type { DatasetField, DatasetFieldType } from '../report-definition-types';
import { setField } from '../data/value-utils';
import { parseLocalDateText } from './local-dates';

type StaticColumnType = Extract<DatasetFieldType, 'string' | 'number' | 'boolean' | 'date'>;

interface StaticColumn {
    key: string;
    name: string;
    type: StaticColumnType;
}

interface StaticTableConfig {
    columns: StaticColumn[];
    rows: Record<string, unknown>[];
}

const columnTypeOptions: ListItem[] = [
    { value: 'string', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Yes / No' },
    { value: 'date', label: 'Date (yyyy-MM-dd)' },
];

function coerce(value: unknown, type: StaticColumnType): unknown {
    if (value === null || value === undefined || value === '') return null;
    switch (type) {
        case 'number': {
            const n = Number(value);
            return Number.isFinite(n) ? n : null;
        }
        case 'boolean':
            return value === true || value === 'true';
        case 'date':
            return parseLocalDateText(value);
        default:
            return String(value);
    }
}

function omitKey(row: Record<string, unknown>, key: string): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) if (k !== key) setField(out, k, v);
    return out;
}

function toFields(cfg: StaticTableConfig): DatasetField[] {
    return (cfg.columns ?? []).filter((c) => c.name.trim()).map((c) => ({ name: c.name.trim(), type: c.type }));
}

function toRows(cfg: StaticTableConfig): Record<string, unknown>[] {
    const columns = (cfg.columns ?? []).filter((c) => c.name.trim());
    return (cfg.rows ?? []).map((r) => {
        const out: Record<string, unknown> = {};
        for (const c of columns) setField(out, c.name.trim(), coerce(r[c.key], c.type));
        return out;
    });
}

function nextColumnKey(columns: StaticColumn[]): string {
    const used = new Set(columns.map((c) => c.key));
    let n = columns.length + 1;
    while (used.has(`c${n}`)) n += 1;
    return `c${n}`;
}

function duplicateNames(columns: StaticColumn[]): string[] {
    const seen = new Set<string>();
    const dupes = new Set<string>();
    for (const c of columns) {
        const name = c.name.trim();
        if (!name) continue;
        if (seen.has(name)) dupes.add(name);
        seen.add(name);
    }
    return Array.from(dupes);
}

const StaticTableConfigUI: React.FC<DatasourceConfigUIProps> = ({ config, onChange }) => {
    const cfg = config as unknown as StaticTableConfig;
    const columns = cfg.columns ?? [];
    const rows = cfg.rows ?? [];
    const set = (patch: Partial<StaticTableConfig>) => onChange({ ...cfg, ...patch } as unknown as Record<string, unknown>);

    const dupes = duplicateNames(columns);

    const renameColumn = (i: number, name: string) =>
        set({ columns: columns.map((c, idx) => (idx === i ? { ...c, name } : c)) });

    const removeColumn = (i: number) => {
        const key = columns[i].key;
        set({
            columns: columns.filter((_, idx) => idx !== i),
            rows: rows.map((r) => omitKey(r, key)),
        });
    };

    const setCell = (rowIndex: number, column: string, value: unknown) =>
        set({ rows: rows.map((r, idx) => (idx === rowIndex ? { ...r, [column]: value } : r)) });

    return (
        <div className="eui-rb-plugin-config">
            <div className="eui-rb-derived-section-label">Columns</div>
            <div className="eui-rb-list-editor">
                {columns.map((c, i) => (
                    <div key={c.key} className="eui-rb-list-editor-row">
                        <div className="eui-rb-list-editor-grow">
                            <TextInput value={c.name} onChange={(e) => renameColumn(i, e.value)} placeholder="Column name" size="sm" aria-label={`Column ${i + 1} name`} />
                        </div>
                        <div className="eui-rb-list-editor-grow">
                            <Dropdown options={columnTypeOptions} value={c.type} onChange={(e) => set({ columns: columns.map((x, idx) => (idx === i ? { ...x, type: e.value as StaticColumnType } : x)) })} size="sm" ariaLabel={`Column ${i + 1} type`} />
                        </div>
                        <Button layout="plain" size="xs" onClick={() => removeColumn(i)} ariaLabel={`Remove column ${i + 1}`} leftIcon={<TrashIcon aria-hidden="true" />} />
                    </div>
                ))}
                {dupes.length > 0 && (
                    <span className="eui-rb-ds-config-error" role="alert">
                        Column names must be unique: {dupes.join(', ')}
                    </span>
                )}
                {columns.some((c) => !c.name.trim()) && (
                    <span className="eui-rb-ds-config-error" role="alert">
                        Every column needs a name. Columns without a name are left out of the data.
                    </span>
                )}
                <Button layout="plain" size="xs" onClick={() => set({ columns: [...columns, { key: nextColumnKey(columns), name: `column${columns.length + 1}`, type: 'string' }] })} leftIcon={<PlusIcon aria-hidden="true" />} label="Add column" />
            </div>

            {columns.length > 0 && (
                <>
                    <div className="eui-rb-derived-section-label">Rows ({rows.length})</div>
                    <div className="eui-rb-static-grid" role="table" aria-label="Static data">
                        <div className="eui-rb-static-grid-row eui-rb-static-grid-head" role="row">
                            {columns.map((c) => <div key={c.key} role="columnheader" className="eui-rb-static-grid-cell">{c.name}</div>)}
                            <div className="eui-rb-static-grid-action" aria-hidden="true" />
                        </div>
                        {rows.map((r, ri) => (
                            <div key={ri} className="eui-rb-static-grid-row" role="row">
                                {columns.map((c) => (
                                    <div key={c.key} role="cell" className="eui-rb-static-grid-cell">
                                        {c.type === 'boolean' ? (
                                            <Checkbox checked={r[c.key] === true || r[c.key] === 'true'} onChange={(e) => setCell(ri, c.key, e.value)} aria-label={`Row ${ri + 1} ${c.name}`} />
                                        ) : (
                                            <TextInput
                                                value={r[c.key] === null || r[c.key] === undefined ? '' : String(r[c.key])}
                                                onChange={(e) => setCell(ri, c.key, e.value)}
                                                size="sm"
                                                type={c.type === 'number' ? 'number' : c.type === 'date' ? 'date' : 'text'}
                                                aria-label={`Row ${ri + 1} ${c.name}`}
                                            />
                                        )}
                                    </div>
                                ))}
                                <div className="eui-rb-static-grid-action">
                                    <Button layout="plain" size="xs" onClick={() => set({ rows: rows.filter((_, idx) => idx !== ri) })} ariaLabel={`Remove row ${ri + 1}`} leftIcon={<TrashIcon aria-hidden="true" />} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button layout="plain" size="xs" onClick={() => set({ rows: [...rows, {}] })} leftIcon={<PlusIcon aria-hidden="true" />} label="Add row" />
                </>
            )}
        </div>
    );
};

export function createStaticDatasourcePlugin(): DatasourcePlugin {
    return {
        type: 'static-table',
        name: 'Static table',
        description: 'Type rows in by hand: lookup tables, targets, labels and other fixed values.',
        icon: TableIcon,
        category: 'Static data',
        initialConfig: () => ({ columns: [{ key: 'c1', name: 'name', type: 'string' }, { key: 'c2', name: 'value', type: 'number' }], rows: [] }),
        ConfigUI: StaticTableConfigUI,
        describe: (config) => {
            const cfg = config as unknown as StaticTableConfig;
            return `${cfg.columns?.length ?? 0} columns · ${cfg.rows?.length ?? 0} rows`;
        },
        fetch: async (config) => {
            const cfg = config as unknown as StaticTableConfig;
            return { rows: toRows(cfg), fields: toFields(cfg) };
        },
        inferSchema: (config) => toFields(config as unknown as StaticTableConfig),
    };
}
