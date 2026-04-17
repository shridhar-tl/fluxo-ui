import React, { useCallback, useState } from 'react';
import type { DatasourcePlugin, Dataset, DatasetField } from '../../../../components/report-builder';

interface CsvConfig {
    csvText: string;
    hasHeader: boolean;
}

function parseCsv(text: string, hasHeader: boolean): { rows: Record<string, unknown>[]; fields: DatasetField[] } {
    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
    if (lines.length === 0) return { rows: [], fields: [] };

    const splitLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
                else { inQuotes = !inQuotes; }
            } else if (ch === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }
        result.push(current.trim());
        return result;
    };

    const headers = hasHeader ? splitLine(lines[0]) : lines[0].split(',').map((_, i) => `col${i + 1}`);
    const dataLines = hasHeader ? lines.slice(1) : lines;
    const rows = dataLines.map((line) => {
        const values = splitLine(line);
        const row: Record<string, unknown> = {};
        headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
        return row;
    });

    const inferType = (vals: unknown[]): DatasetField['type'] => {
        const sample = vals.filter((v) => v !== '').slice(0, 20);
        if (sample.length === 0) return 'string';
        if (sample.every((v) => !isNaN(Number(v)))) return 'number';
        if (sample.every((v) => ['true', 'false', '1', '0'].includes(String(v).toLowerCase()))) return 'boolean';
        return 'string';
    };

    const fields: DatasetField[] = headers.map((name) => ({
        name,
        type: inferType(rows.map((r) => r[name])),
    }));

    return { rows, fields };
}

const CsvIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
);

const CsvConfigUI: React.FC<{ config: Record<string, unknown>; onChange: (cfg: Record<string, unknown>) => void }> = ({ config, onChange }) => {
    const c = config as unknown as CsvConfig;
    const [preview, setPreview] = useState<string | null>(null);

    const handleValidate = useCallback(() => {
        const { rows } = parseCsv(c.csvText ?? '', c.hasHeader ?? true);
        setPreview(`Parsed ${rows.length} row(s).`);
    }, [c]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--eui-text-muted)' }}>CSV Data</label>
                <textarea
                    value={c.csvText ?? ''}
                    onChange={(e) => onChange({ ...c, csvText: e.target.value })}
                    placeholder={'name,age\nAlice,30\nBob,25'}
                    rows={8}
                    style={{
                        width: '100%', fontFamily: 'monospace', fontSize: 11, padding: '6px 8px',
                        border: '1px solid var(--eui-border-subtle)', borderRadius: 4,
                        background: 'var(--eui-input-bg)', color: 'var(--eui-text)',
                        resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                    }}
                    aria-label="CSV data"
                />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
                <input
                    type="checkbox"
                    checked={c.hasHeader ?? true}
                    onChange={(e) => onChange({ ...c, hasHeader: e.target.checked })}
                    aria-label="First row is header"
                />
                First row is header
            </label>
            {(c.csvText ?? '').trim() && (
                <button
                    onClick={handleValidate}
                    style={{ height: 28, padding: '0 12px', fontSize: 12, border: '1px solid var(--eui-border-subtle)', borderRadius: 4, background: 'var(--eui-bg)', color: 'var(--eui-text)', cursor: 'pointer', alignSelf: 'flex-start' }}
                    aria-label="Validate CSV"
                >
                    Validate
                </button>
            )}
            {preview && <div style={{ fontSize: 11, color: 'var(--eui-text-muted)', fontStyle: 'italic' }}>{preview}</div>}
        </div>
    );
};

export const csvPlugin: DatasourcePlugin = {
    type: 'csv',
    name: 'CSV / Paste Data',
    description: 'Paste or type CSV data directly.',
    icon: CsvIcon as DatasourcePlugin['icon'],
    ConfigUI: CsvConfigUI,
    initialConfig: (): Record<string, unknown> => ({
        csvText: 'name,value\nItem A,100\nItem B,200\nItem C,150',
        hasHeader: true,
    }),
    fetch: async (config): Promise<Dataset> => {
        const c = config as unknown as CsvConfig;
        if (!(c.csvText ?? '').trim()) return { rows: [], fields: [] };
        return parseCsv(c.csvText, c.hasHeader ?? true);
    },
};
