export interface Range {
    start: number;
    end: number;
}

export interface EditResult {
    value: string;
    selection: Range;
}

export function wrapSelection(value: string, range: Range, before: string, after: string): EditResult {
    const selected = value.slice(range.start, range.end);
    const newText = before + selected + after;
    const newValue = value.slice(0, range.start) + newText + value.slice(range.end);
    const selStart = range.start + before.length;
    const selEnd = selStart + selected.length;
    return { value: newValue, selection: { start: selStart, end: selEnd } };
}

export function toggleWrap(value: string, range: Range, before: string, after: string): EditResult {
    const selected = value.slice(range.start, range.end);
    const beforeLen = before.length;
    const afterLen = after.length;
    const outer = value.slice(Math.max(0, range.start - beforeLen), range.end + afterLen);
    if (
        range.start >= beforeLen &&
        value.slice(range.start - beforeLen, range.start) === before &&
        value.slice(range.end, range.end + afterLen) === after
    ) {
        const newValue = value.slice(0, range.start - beforeLen) + selected + value.slice(range.end + afterLen);
        return {
            value: newValue,
            selection: { start: range.start - beforeLen, end: range.end - beforeLen },
        };
    }
    if (selected.startsWith(before) && selected.endsWith(after) && selected.length >= beforeLen + afterLen) {
        const inner = selected.slice(beforeLen, selected.length - afterLen);
        const newValue = value.slice(0, range.start) + inner + value.slice(range.end);
        return {
            value: newValue,
            selection: { start: range.start, end: range.start + inner.length },
        };
    }
    void outer;
    return wrapSelection(value, range, before, after);
}

export function replaceSelection(value: string, range: Range, text: string, selectInsert = false): EditResult {
    const newValue = value.slice(0, range.start) + text + value.slice(range.end);
    const end = range.start + text.length;
    return {
        value: newValue,
        selection: selectInsert ? { start: range.start, end } : { start: end, end },
    };
}

export function getLineRange(value: string, pos: number): Range {
    const start = value.lastIndexOf('\n', pos - 1) + 1;
    let end = value.indexOf('\n', pos);
    if (end === -1) end = value.length;
    return { start, end };
}

export function getSelectedLinesRange(value: string, range: Range): Range {
    const start = value.lastIndexOf('\n', range.start - 1) + 1;
    let end = value.indexOf('\n', range.end === range.start ? range.end : range.end - 1);
    if (end === -1) end = value.length;
    return { start, end };
}

export function mapLines(value: string, range: Range, mapper: (line: string, index: number) => string): EditResult {
    const lineRange = getSelectedLinesRange(value, range);
    const block = value.slice(lineRange.start, lineRange.end);
    const lines = block.split('\n');
    const mapped = lines.map(mapper).join('\n');
    const newValue = value.slice(0, lineRange.start) + mapped + value.slice(lineRange.end);
    const delta = mapped.length - block.length;
    return {
        value: newValue,
        selection: { start: lineRange.start, end: range.end + delta },
    };
}

export function toggleLinePrefix(value: string, range: Range, prefix: string): EditResult {
    const lineRange = getSelectedLinesRange(value, range);
    const block = value.slice(lineRange.start, lineRange.end);
    const lines = block.split('\n');
    const allHave = lines.every((l) => l.startsWith(prefix));
    const mapped = lines.map((l) => (allHave ? l.slice(prefix.length) : prefix + l)).join('\n');
    const newValue = value.slice(0, lineRange.start) + mapped + value.slice(lineRange.end);
    const delta = mapped.length - block.length;
    return {
        value: newValue,
        selection: { start: lineRange.start, end: range.end + delta },
    };
}

export function setLinePrefix(value: string, range: Range, prefixRegex: RegExp, prefix: string): EditResult {
    return mapLines(value, range, (line) => {
        const stripped = line.replace(prefixRegex, '');
        return prefix + stripped;
    });
}

export function insertBlock(value: string, range: Range, block: string): EditResult {
    const before = value.slice(0, range.start);
    const after = value.slice(range.end);
    const needsLeadingNl = before.length > 0 && !before.endsWith('\n\n') && !before.endsWith('\n');
    const needsSoftLeadingNl = before.length > 0 && before.endsWith('\n') && !before.endsWith('\n\n');
    const leading = needsLeadingNl ? '\n\n' : needsSoftLeadingNl ? '\n' : '';
    const needsTrailingNl = after.length > 0 && !after.startsWith('\n');
    const trailing = needsTrailingNl ? '\n' : '';
    const text = leading + block + trailing;
    const newValue = before + text + after;
    const selStart = range.start + leading.length;
    const selEnd = selStart + block.length;
    return { value: newValue, selection: { start: selStart, end: selEnd } };
}

export function indentLines(value: string, range: Range, unit = '  '): EditResult {
    return mapLines(value, range, (l) => unit + l);
}

export function outdentLines(value: string, range: Range, unit = '  '): EditResult {
    return mapLines(value, range, (l) => {
        if (l.startsWith(unit)) return l.slice(unit.length);
        if (l.startsWith('\t')) return l.slice(1);
        const match = l.match(/^ {1,2}/);
        if (match) return l.slice(match[0].length);
        return l;
    });
}
