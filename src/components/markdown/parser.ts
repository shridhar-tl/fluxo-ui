export type InlineNode =
    | { type: 'text'; value: string }
    | { type: 'strong'; children: InlineNode[] }
    | { type: 'em'; children: InlineNode[] }
    | { type: 'del'; children: InlineNode[] }
    | { type: 'code'; value: string }
    | { type: 'link'; href: string; title?: string; children: InlineNode[] }
    | { type: 'image'; src: string; alt: string; title?: string }
    | { type: 'break' };

export type BlockNode =
    | { type: 'heading'; depth: 1 | 2 | 3 | 4 | 5 | 6; children: InlineNode[] }
    | { type: 'paragraph'; children: InlineNode[] }
    | { type: 'blockquote'; children: BlockNode[] }
    | { type: 'list'; ordered: boolean; start?: number; tight: boolean; items: ListItem[] }
    | { type: 'code'; lang?: string; value: string }
    | { type: 'hr' }
    | { type: 'table'; header: TableCell[]; align: (TableAlign | null)[]; rows: TableCell[][] };

export type TableAlign = 'left' | 'center' | 'right';
export type TableCell = InlineNode[];

export interface ListItem {
    checked?: boolean | null;
    children: BlockNode[];
}

export interface ParsedMarkdown {
    blocks: BlockNode[];
}

const MAX_ITER = 100000;

function assertAdvance(prev: number, curr: number, where: string): void {
    if (curr <= prev) {
        throw new Error('Parser failed to advance in ' + where);
    }
}

function splitLines(src: string): string[] {
    return src.replace(/\r\n?/g, '\n').split('\n');
}

const HR_RE = /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/;
const ATX_RE = /^ {0,3}(#{1,6})(?:\s+(.*?))?\s*#*\s*$/;
const FENCE_RE = /^ {0,3}(`{3,}|~{3,})\s*([^`~\s]*)\s*$/;
const OL_RE = /^(\s*)(\d{1,9})([.)])\s+(.*)$/;
const UL_RE = /^(\s*)([-*+])\s+(.*)$/;
const BLOCKQUOTE_RE = /^ {0,3}>\s?(.*)$/;
const TASK_RE = /^\[([ xX])\]\s+(.*)$/;
const TABLE_SEP_RE = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/;

function isBlank(line: string): boolean {
    return /^\s*$/.test(line);
}

export function parseMarkdown(src: string): ParsedMarkdown {
    const lines = splitLines(src);
    const blocks = parseBlocks(lines, 0, lines.length);
    return { blocks };
}

function parseBlocks(lines: string[], from: number, to: number): BlockNode[] {
    const out: BlockNode[] = [];
    let i = from;
    let iter = 0;
    while (i < to) {
        if (++iter > MAX_ITER) break;
        const prev = i;
        const line = lines[i];

        if (isBlank(line)) {
            i += 1;
            continue;
        }

        if (HR_RE.test(line)) {
            out.push({ type: 'hr' });
            i += 1;
            continue;
        }

        const atx = line.match(ATX_RE);
        if (atx) {
            const depth = atx[1].length as 1 | 2 | 3 | 4 | 5 | 6;
            const text = atx[2] ?? '';
            out.push({ type: 'heading', depth, children: parseInline(text) });
            i += 1;
            continue;
        }

        const fence = line.match(FENCE_RE);
        if (fence) {
            const marker = fence[1];
            const lang = fence[2] || undefined;
            const body: string[] = [];
            i += 1;
            while (i < to) {
                const cur = lines[i];
                if (cur.trim().startsWith(marker[0].repeat(marker.length)) && /^\s*[`~]{3,}\s*$/.test(cur)) {
                    i += 1;
                    break;
                }
                body.push(cur);
                i += 1;
            }
            out.push({ type: 'code', lang, value: body.join('\n') });
            continue;
        }

        if (/^ {4,}\S/.test(line) && out.length === 0) {
            const body: string[] = [];
            while (i < to && (/^ {4}/.test(lines[i]) || isBlank(lines[i]))) {
                body.push(lines[i].replace(/^ {4}/, ''));
                i += 1;
            }
            while (body.length && isBlank(body[body.length - 1])) body.pop();
            out.push({ type: 'code', value: body.join('\n') });
            continue;
        }

        if (BLOCKQUOTE_RE.test(line)) {
            const body: string[] = [];
            while (i < to) {
                const m = lines[i].match(BLOCKQUOTE_RE);
                if (m) {
                    body.push(m[1]);
                    i += 1;
                } else if (!isBlank(lines[i]) && out.length > 0) {
                    body.push(lines[i]);
                    i += 1;
                } else {
                    break;
                }
            }
            out.push({ type: 'blockquote', children: parseBlocks(body, 0, body.length) });
            continue;
        }

        if (UL_RE.test(line) || OL_RE.test(line)) {
            const list = parseList(lines, i, to);
            out.push(list.node);
            i = list.next;
            continue;
        }

        if (i + 1 < to && line.includes('|') && TABLE_SEP_RE.test(lines[i + 1]) && lines[i + 1].includes('|')) {
            const tbl = parseTable(lines, i, to);
            if (tbl) {
                out.push(tbl.node);
                i = tbl.next;
                continue;
            }
        }

        const paraLines: string[] = [line];
        i += 1;
        while (i < to) {
            const cur = lines[i];
            if (
                isBlank(cur) ||
                HR_RE.test(cur) ||
                ATX_RE.test(cur) ||
                FENCE_RE.test(cur) ||
                BLOCKQUOTE_RE.test(cur) ||
                UL_RE.test(cur) ||
                OL_RE.test(cur)
            )
                break;
            paraLines.push(cur);
            i += 1;
        }
        const text = paraLines.join('\n').trim();
        if (text) out.push({ type: 'paragraph', children: parseInline(text) });
        assertAdvance(prev, i, 'parseBlocks');
    }
    return out;
}

interface ListParseResult {
    node: BlockNode;
    next: number;
}

function parseList(lines: string[], from: number, to: number): ListParseResult {
    const firstLine = lines[from];
    const firstOl = firstLine.match(OL_RE);
    const firstUl = firstLine.match(UL_RE);
    const ordered = Boolean(firstOl);
    const baseIndent = ordered ? firstOl![1].length : firstUl![1].length;
    const start = ordered ? parseInt(firstOl![2], 10) : undefined;
    const items: ListItem[] = [];
    let i = from;
    let tight = true;
    let iter = 0;

    const matchItem = (line: string): RegExpMatchArray | null => {
        const olm = line.match(OL_RE);
        if (olm && olm[1].length === baseIndent && ordered) return olm;
        const ulm = line.match(UL_RE);
        if (ulm && ulm[1].length === baseIndent && !ordered) return ulm;
        return null;
    };

    while (i < to) {
        if (++iter > MAX_ITER) break;
        const prev = i;
        const line = lines[i];
        const m = matchItem(line);
        if (!m) break;

        const contentIndent = ordered
            ? m[1].length + m[2].length + m[3].length + 1
            : m[1].length + m[2].length + 1;
        const firstContent = ordered ? m[4] : m[3];

        const itemLines: string[] = [firstContent];
        i += 1;
        let sawBlank = false;
        while (i < to) {
            const cur = lines[i];
            if (isBlank(cur)) {
                const next = i + 1 < to ? lines[i + 1] : '';
                const nextIsItem = next ? matchItem(next) : null;
                const nextIsIndented = next.length >= contentIndent && !isBlank(next);
                if (nextIsItem || (!nextIsIndented && !matchItem(next || ''))) {
                    if (nextIsItem) sawBlank = true;
                    break;
                }
                itemLines.push('');
                sawBlank = true;
                i += 1;
                continue;
            }
            if (matchItem(cur)) break;
            if (cur.length >= contentIndent && /^\s/.test(cur)) {
                itemLines.push(cur.slice(contentIndent));
                i += 1;
                continue;
            }
            if (HR_RE.test(cur) || ATX_RE.test(cur) || FENCE_RE.test(cur)) break;
            itemLines.push(cur);
            i += 1;
        }

        if (sawBlank) tight = false;

        let checked: boolean | null | undefined;
        if (itemLines.length > 0) {
            const tm = itemLines[0].match(TASK_RE);
            if (tm) {
                checked = tm[1].toLowerCase() === 'x';
                itemLines[0] = tm[2];
            }
        }

        const children = parseBlocks(itemLines, 0, itemLines.length);
        items.push({ checked, children });
        assertAdvance(prev, i, 'parseList');
    }

    return {
        node: { type: 'list', ordered, start, tight, items },
        next: i,
    };
}

interface TableParseResult {
    node: BlockNode;
    next: number;
}

function splitTableRow(line: string): string[] {
    let s = line.trim();
    if (s.startsWith('|')) s = s.slice(1);
    if (s.endsWith('|')) s = s.slice(0, -1);
    const cells: string[] = [];
    let buf = '';
    let escape = false;
    for (let i = 0; i < s.length; i += 1) {
        const ch = s[i];
        if (escape) {
            buf += ch;
            escape = false;
            continue;
        }
        if (ch === '\\') {
            escape = true;
            buf += ch;
            continue;
        }
        if (ch === '|') {
            cells.push(buf.trim());
            buf = '';
            continue;
        }
        buf += ch;
    }
    cells.push(buf.trim());
    return cells;
}

function parseTable(lines: string[], from: number, to: number): TableParseResult | null {
    const headerLine = lines[from];
    const sepLine = lines[from + 1];
    const header = splitTableRow(headerLine);
    const sepCells = splitTableRow(sepLine);
    if (header.length === 0 || header.length !== sepCells.length) return null;
    const align: (TableAlign | null)[] = sepCells.map((c) => {
        const left = c.startsWith(':');
        const right = c.endsWith(':');
        if (left && right) return 'center';
        if (right) return 'right';
        if (left) return 'left';
        return null;
    });

    const rows: TableCell[][] = [];
    let i = from + 2;
    let iter = 0;
    while (i < to) {
        if (++iter > MAX_ITER) break;
        const line = lines[i];
        if (isBlank(line) || !line.includes('|')) break;
        const cells = splitTableRow(line);
        const row: TableCell[] = [];
        for (let c = 0; c < header.length; c += 1) {
            row.push(parseInline(cells[c] ?? ''));
        }
        rows.push(row);
        i += 1;
    }

    return {
        node: {
            type: 'table',
            header: header.map((h) => parseInline(h)),
            align,
            rows,
        },
        next: i,
    };
}

export function parseInline(src: string): InlineNode[] {
    const nodes: InlineNode[] = [];
    let i = 0;
    let buf = '';
    const flush = () => {
        if (buf) {
            nodes.push({ type: 'text', value: buf });
            buf = '';
        }
    };
    let iter = 0;
    while (i < src.length) {
        if (++iter > MAX_ITER) break;
        const prev = i;
        const ch = src[i];

        if (ch === '\\' && i + 1 < src.length) {
            buf += src[i + 1];
            i += 2;
            continue;
        }

        if (ch === '\n') {
            const prevChars = src.slice(Math.max(0, i - 2), i);
            if (prevChars.endsWith('  ')) {
                buf = buf.slice(0, -2);
                flush();
                nodes.push({ type: 'break' });
            } else {
                buf += ' ';
            }
            i += 1;
            continue;
        }

        if (ch === '`') {
            let runLen = 1;
            while (src[i + runLen] === '`') runLen += 1;
            const run = '`'.repeat(runLen);
            const endIdx = src.indexOf(run, i + runLen);
            if (endIdx !== -1) {
                const codeText = src.slice(i + runLen, endIdx).replace(/^\s+|\s+$/g, '');
                flush();
                nodes.push({ type: 'code', value: codeText });
                i = endIdx + runLen;
                continue;
            }
        }

        if (ch === '!' && src[i + 1] === '[') {
            const parsed = parseLinkLike(src, i + 1);
            if (parsed) {
                flush();
                nodes.push({ type: 'image', alt: plainText(parsed.label), src: parsed.url, title: parsed.title });
                i = parsed.next;
                continue;
            }
        }

        if (ch === '[') {
            const parsed = parseLinkLike(src, i);
            if (parsed) {
                flush();
                nodes.push({
                    type: 'link',
                    href: parsed.url,
                    title: parsed.title,
                    children: parseInline(parsed.label),
                });
                i = parsed.next;
                continue;
            }
        }

        if (ch === '<') {
            const match = src.slice(i).match(/^<((?:https?|mailto):[^\s>]+)>/);
            if (match) {
                flush();
                const href = match[1];
                nodes.push({
                    type: 'link',
                    href,
                    children: [{ type: 'text', value: href.replace(/^mailto:/, '') }],
                });
                i += match[0].length;
                continue;
            }
        }

        if ((ch === '*' || ch === '_') && src[i + 1] === ch) {
            const marker = ch + ch;
            const end = findEmphasisEnd(src, i + 2, marker);
            if (end !== -1) {
                flush();
                nodes.push({ type: 'strong', children: parseInline(src.slice(i + 2, end)) });
                i = end + 2;
                continue;
            }
        }

        if (ch === '*' || ch === '_') {
            if (ch === '_') {
                const prevCh = src[i - 1] ?? ' ';
                const nextCh = src[i + 1] ?? ' ';
                if (/\w/.test(prevCh) && /\w/.test(nextCh)) {
                    buf += ch;
                    i += 1;
                    continue;
                }
            }
            const end = findEmphasisEnd(src, i + 1, ch);
            if (end !== -1) {
                flush();
                nodes.push({ type: 'em', children: parseInline(src.slice(i + 1, end)) });
                i = end + 1;
                continue;
            }
        }

        if (ch === '~' && src[i + 1] === '~') {
            const end = src.indexOf('~~', i + 2);
            if (end !== -1) {
                flush();
                nodes.push({ type: 'del', children: parseInline(src.slice(i + 2, end)) });
                i = end + 2;
                continue;
            }
        }

        buf += ch;
        i += 1;
        assertAdvance(prev, i, 'parseInline');
    }
    flush();
    return nodes;
}

function findEmphasisEnd(src: string, from: number, marker: string): number {
    let i = from;
    let iter = 0;
    while (i < src.length) {
        if (++iter > MAX_ITER) return -1;
        if (src[i] === '\\') {
            i += 2;
            continue;
        }
        if (src[i] === '`') {
            const endTick = src.indexOf('`', i + 1);
            if (endTick === -1) return -1;
            i = endTick + 1;
            continue;
        }
        if (src.startsWith(marker, i)) return i;
        i += 1;
    }
    return -1;
}

interface LinkLikeParse {
    label: string;
    url: string;
    title?: string;
    next: number;
}

function parseLinkLike(src: string, from: number): LinkLikeParse | null {
    if (src[from] !== '[') return null;
    let i = from + 1;
    let depth = 1;
    let iter = 0;
    const labelStart = i;
    while (i < src.length) {
        if (++iter > MAX_ITER) return null;
        const ch = src[i];
        if (ch === '\\') {
            i += 2;
            continue;
        }
        if (ch === '[') depth += 1;
        if (ch === ']') {
            depth -= 1;
            if (depth === 0) break;
        }
        i += 1;
    }
    if (depth !== 0) return null;
    const label = src.slice(labelStart, i);
    i += 1;
    if (src[i] !== '(') return null;
    i += 1;
    let url = '';
    let title: string | undefined;
    if (src[i] === '<') {
        i += 1;
        const end = src.indexOf('>', i);
        if (end === -1) return null;
        url = src.slice(i, end);
        i = end + 1;
    } else {
        let urlIter = 0;
        while (i < src.length && src[i] !== ')' && src[i] !== ' ' && src[i] !== '\t') {
            if (++urlIter > MAX_ITER) return null;
            url += src[i];
            i += 1;
        }
    }
    while (src[i] === ' ' || src[i] === '\t') i += 1;
    if (src[i] === '"' || src[i] === "'") {
        const quote = src[i];
        i += 1;
        const end = src.indexOf(quote, i);
        if (end === -1) return null;
        title = src.slice(i, end);
        i = end + 1;
        while (src[i] === ' ' || src[i] === '\t') i += 1;
    }
    if (src[i] !== ')') return null;
    i += 1;
    return { label, url, title, next: i };
}

function plainText(src: string): string {
    return src.replace(/[*_`~\\]/g, '');
}
