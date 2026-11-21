import React, { useMemo, useState } from 'react';
import { FileIcon } from '../../../assets/icons';
import { Button } from '../../Button';
import { Dropdown } from '../../Dropdown';
import { FileUpload } from '../../file-upload';
import { TextArea } from '../../TextArea';
import type { ListItem } from '../../../types';
import { inferFieldsFromRows } from '../dataset-schema';
import { setField } from '../data/value-utils';
import type { DatasourceConfigUIProps, DatasourcePlugin } from '../report-builder-types';
import { parseDelimitedText } from './delimited-text';
import { parseLocalDateText, toLocalDateText } from './local-dates';

export interface ParsedTable {
    name: string;
    rows: Record<string, unknown>[];
}

export interface FileParser {
    id: string;
    label: string;
    /** Lower-case extensions including the dot, e.g. `.xlsx`. */
    extensions: string[];
    parse: (file: File) => Promise<ParsedTable[]>;
}

export interface FileDatasourceOptions {
    /** Additional parsers, e.g. an Excel parser. A parser with the id of a built-in one replaces it. */
    parsers?: FileParser[];
    /** Maximum number of rows kept per table. Rows are stored inside the report definition. */
    maxRows?: number;
    maxFileSize?: number;
}

const schemaSampleSize = 200;

interface StoredTable extends ParsedTable {
    dateFields?: string[];
}

interface FileDatasourceConfig {
    fileName?: string;
    parserId?: string;
    tables: StoredTable[];
    tableName?: string;
}

function toStoredTable(table: ParsedTable): StoredTable {
    const dateFields = new Set<string>();
    const rows = table.rows.map((row) => {
        let copy: Record<string, unknown> | null = null;
        for (const [key, value] of Object.entries(row)) {
            if (!(value instanceof Date)) continue;
            copy ??= { ...row };
            dateFields.add(key);
            setField(copy, key, Number.isNaN(value.getTime()) ? null : toLocalDateText(value));
        }
        return copy ?? row;
    });
    return dateFields.size > 0 ? { name: table.name, rows, dateFields: Array.from(dateFields) } : { name: table.name, rows };
}

function reviveRows(table: StoredTable): Record<string, unknown>[] {
    const dateFields = table.dateFields ?? [];
    if (dateFields.length === 0) return table.rows;
    return table.rows.map((row) => {
        const copy: Record<string, unknown> = { ...row };
        for (const key of dateFields) {
            if (Object.prototype.hasOwnProperty.call(row, key)) setField(copy, key, parseLocalDateText(row[key]));
        }
        return copy;
    });
}

function parseJsonTables(text: string, name: string): ParsedTable[] {
    const parsed: unknown = JSON.parse(text);
    if (Array.isArray(parsed)) return [{ name, rows: parsed.map((r) => (r !== null && typeof r === 'object' ? r as Record<string, unknown> : { value: r })) }];
    if (parsed && typeof parsed === 'object') {
        const entries = Object.entries(parsed as Record<string, unknown>).filter(([, v]) => Array.isArray(v));
        if (entries.length > 0) {
            return entries.map(([key, v]) => ({ name: key, rows: (v as unknown[]).map((r) => (r !== null && typeof r === 'object' ? r as Record<string, unknown> : { value: r })) }));
        }
        return [{ name, rows: [parsed as Record<string, unknown>] }];
    }
    throw new Error('The JSON must be an array of rows or an object containing arrays of rows.');
}

const builtInParsers: FileParser[] = [
    {
        id: 'csv',
        label: 'CSV',
        extensions: ['.csv', '.txt'],
        parse: async (file) => [{ name: file.name, rows: parseDelimitedText(await file.text()) }],
    },
    {
        id: 'tsv',
        label: 'TSV',
        extensions: ['.tsv', '.tab'],
        parse: async (file) => [{ name: file.name, rows: parseDelimitedText(await file.text(), { delimiter: '\t' }) }],
    },
    {
        id: 'json',
        label: 'JSON',
        extensions: ['.json'],
        parse: async (file) => parseJsonTables(await file.text(), file.name),
    },
];

function extensionOf(name: string): string {
    const idx = name.lastIndexOf('.');
    return idx === -1 ? '' : name.slice(idx).toLowerCase();
}

function selectedTable(cfg: FileDatasourceConfig): StoredTable | undefined {
    const tables = cfg.tables ?? [];
    return tables.find((t) => t.name === cfg.tableName) ?? tables[0];
}

function selectedRowCount(cfg: FileDatasourceConfig): number {
    return selectedTable(cfg)?.rows.length ?? 0;
}

function selectedRows(cfg: FileDatasourceConfig): Record<string, unknown>[] {
    const table = selectedTable(cfg);
    return table ? reviveRows(table) : [];
}

function limitTables(tables: ParsedTable[], maxRows: number): { tables: StoredTable[]; truncated: boolean } {
    let truncated = false;
    const limited = tables.map((t) => {
        if (t.rows.length <= maxRows) return toStoredTable(t);
        truncated = true;
        return toStoredTable({ ...t, rows: t.rows.slice(0, maxRows) });
    });
    return { tables: limited, truncated };
}

export function createFileDatasourcePlugin(options: FileDatasourceOptions = {}): DatasourcePlugin {
    const maxRows = options.maxRows ?? 50000;
    const parsers = [
        ...(options.parsers ?? []),
        ...builtInParsers.filter((b) => !(options.parsers ?? []).some((p) => p.id === b.id)),
    ];
    const accept = Array.from(new Set(parsers.flatMap((p) => p.extensions))).join(',');
    const formats = parsers.map((p) => p.label).join(', ');

    const ConfigUI: React.FC<DatasourceConfigUIProps> = ({ datasourceId, config, onChange }) => {
        const cfg = config as unknown as FileDatasourceConfig;
        const [status, setStatus] = useState<{ error: string | null; info: string | null; busy: boolean }>({ error: null, info: null, busy: false });
        const [pasted, setPasted] = useState('');
        const tables = useMemo(() => cfg.tables ?? [], [cfg.tables]);
        const tableOptions: ListItem[] = useMemo(() => tables.map((t) => ({ value: t.name, label: `${t.name} (${t.rows.length} rows)` })), [tables]);

        const apply = (next: ParsedTable[], fileName: string, parserId: string) => {
            const { tables: limited, truncated } = limitTables(next, maxRows);
            onChange({ ...cfg, tables: limited, fileName, parserId, tableName: limited[0]?.name } as unknown as Record<string, unknown>);
            setStatus({
                busy: false,
                error: null,
                info: truncated ? `Only the first ${maxRows} rows of each table were kept.` : `Loaded ${limited.reduce((n, t) => n + t.rows.length, 0)} rows.`,
            });
        };

        const handleFiles = async (files: File[]) => {
            const file = files[0];
            if (!file) return;
            const ext = extensionOf(file.name);
            const parser = parsers.find((p) => p.extensions.includes(ext));
            if (!parser) {
                setStatus({ busy: false, info: null, error: `Unsupported file type. Supported formats: ${formats}.` });
                return;
            }
            setStatus({ busy: true, info: null, error: null });
            try {
                apply(await parser.parse(file), file.name, parser.id);
            } catch (err) {
                setStatus({ busy: false, info: null, error: err instanceof Error ? err.message : String(err) });
            }
        };

        const handlePaste = () => {
            const text = pasted.trim();
            if (!text) return;
            try {
                const isJson = text.startsWith('[') || text.startsWith('{');
                apply(isJson ? parseJsonTables(text, 'Pasted data') : [{ name: 'Pasted data', rows: parseDelimitedText(text) }], 'Pasted data', isJson ? 'json' : 'csv');
                setPasted('');
            } catch (err) {
                setStatus({ busy: false, info: null, error: err instanceof Error ? err.message : String(err) });
            }
        };

        return (
            <div className="eui-rb-plugin-config">
                {cfg.fileName && (
                    <div className="eui-rb-ds-config-summary">
                        {cfg.fileName} · {selectedRowCount(cfg)} rows
                    </div>
                )}
                <FileUpload
                    accept={accept}
                    maxFiles={1}
                    maxFileSize={options.maxFileSize}
                    showPreview={false}
                    disabled={status.busy}
                    onFilesSelect={handleFiles}
                    dropzoneContent={<span>Drop a file here or click to choose ({formats})</span>}
                />
                {tables.length > 1 && (
                    <div className="eui-rb-prop-field">
                        <label className="eui-rb-prop-field-label" htmlFor={`rb-file-table-${datasourceId}`}>Table / sheet</label>
                        <Dropdown
                            id={`rb-file-table-${datasourceId}`}
                            options={tableOptions}
                            value={cfg.tableName ?? tables[0]?.name}
                            onChange={(e) => onChange({ ...cfg, tableName: e.value } as unknown as Record<string, unknown>)}
                            size="sm"
                        />
                    </div>
                )}
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label" htmlFor={`rb-file-paste-${datasourceId}`}>Or paste CSV / JSON</label>
                    <TextArea
                        id={`rb-file-paste-${datasourceId}`}
                        value={pasted}
                        onChange={(e) => setPasted(e.value)}
                        rows={4}
                        placeholder={'name,points\nStory A,5'}
                    />
                    <div className="eui-rb-ds-config-actions">
                        <Button size="sm" layout="outlined" onClick={handlePaste} disabled={!pasted.trim()} label="Use pasted data" />
                    </div>
                </div>
                <div aria-live="polite">
                    {status.busy && <span className="eui-rb-ds-config-hint">Reading file…</span>}
                    {status.info && <span className="eui-rb-ds-config-hint">{status.info}</span>}
                    {status.error && <span className="eui-rb-ds-config-error">{status.error}</span>}
                </div>
            </div>
        );
    };

    return {
        type: 'file',
        name: 'File / pasted data',
        description: `Upload or paste data (${formats}). The data is saved with the report.`,
        icon: FileIcon,
        category: 'Static data',
        initialConfig: () => ({ tables: [] }),
        ConfigUI,
        describe: (config) => {
            const cfg = config as unknown as FileDatasourceConfig;
            return cfg.fileName ? `${cfg.fileName} · ${selectedRowCount(cfg)} rows` : 'No file loaded yet';
        },
        fetch: async (config) => {
            const rows = selectedRows(config as unknown as FileDatasourceConfig);
            return { rows, fields: inferFieldsFromRows(rows) };
        },
        inferSchema: (config) => {
            const table = selectedTable(config as unknown as FileDatasourceConfig);
            return table ? inferFieldsFromRows(reviveRows({ ...table, rows: table.rows.slice(0, schemaSampleSize) })) : [];
        },
    };
}
