import { setField } from '../data/value-utils';

export interface DelimitedParseOptions {
    delimiter?: string;
    hasHeader?: boolean;
    inferTypes?: boolean;
}

const candidateDelimiters = [',', '\t', ';', '|'];
const numberPattern = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?(?:[eE][-+]?\d+)?$/;

export function detectDelimiter(text: string): string {
    const sample = text.split(/\r?\n/).slice(0, 5).join('\n');
    let best = ',';
    let bestCount = 0;
    for (const d of candidateDelimiters) {
        const count = sample.split(d).length - 1;
        if (count > bestCount) {
            best = d;
            bestCount = count;
        }
    }
    return best;
}

export function splitDelimited(text: string, delimiter: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inQuotes) {
            if (ch === '"') {
                if (text[i + 1] === '"') {
                    cell += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                cell += ch;
            }
            continue;
        }
        if (ch === '"') {
            inQuotes = true;
        } else if (ch === delimiter) {
            row.push(cell);
            cell = '';
        } else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && text[i + 1] === '\n') i++;
            row.push(cell);
            rows.push(row);
            row = [];
            cell = '';
        } else {
            cell += ch;
        }
    }
    if (cell !== '' || row.length > 0) {
        row.push(cell);
        rows.push(row);
    }
    return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

export function coerceCellValue(raw: string): unknown {
    const value = raw.trim();
    if (value === '') return null;
    const lower = value.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
    if (numberPattern.test(value) && /\d/.test(value)) {
        const n = Number(value.replace(/,/g, ''));
        if (Number.isFinite(n)) return n;
    }
    return value;
}

function uniqueHeaders(headers: string[]): string[] {
    const seen = new Map<string, number>();
    return headers.map((h, i) => {
        const base = h.trim() || `column${i + 1}`;
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        return count === 0 ? base : `${base}_${count + 1}`;
    });
}

export function parseDelimitedText(text: string, options: DelimitedParseOptions = {}): Record<string, unknown>[] {
    if (!text.trim()) return [];
    const delimiter = options.delimiter || detectDelimiter(text);
    const matrix = splitDelimited(text, delimiter);
    if (matrix.length === 0) return [];
    const hasHeader = options.hasHeader !== false;
    const width = matrix.reduce((max, r) => Math.max(max, r.length), 0);
    const headers = uniqueHeaders(hasHeader ? matrix[0] : Array.from({ length: width }, (_, i) => `column${i + 1}`));
    const body = hasHeader ? matrix.slice(1) : matrix;
    const infer = options.inferTypes !== false;
    return body.map((cells) => {
        const row: Record<string, unknown> = {};
        headers.forEach((h, i) => {
            const raw = cells[i] ?? '';
            setField(row, h, infer ? coerceCellValue(raw) : raw);
        });
        return row;
    });
}

export function rowsToDelimitedText(rows: Record<string, unknown>[], delimiter = ','): string {
    if (rows.length === 0) return '';
    const headers = Array.from(rows.reduce((set, r) => {
        for (const k of Object.keys(r)) set.add(k);
        return set;
    }, new Set<string>()));
    const escape = (v: unknown): string => {
        if (v === null || v === undefined) return '';
        const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
        return /["\n\r]/.test(s) || s.includes(delimiter) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [headers.map(escape).join(delimiter), ...rows.map((r) => headers.map((h) => escape(r[h])).join(delimiter))].join('\n');
}
