import {
    type EditResult,
    type Range,
    getSelectedLinesRange,
    indentLines,
    insertBlock,
    mapLines,
    outdentLines,
    replaceSelection,
    toggleLinePrefix,
    toggleWrap,
} from '../editor-core/textareaCommands';

export const toggleBold = (value: string, range: Range): EditResult => toggleWrap(value, range, '**', '**');
export const toggleItalic = (value: string, range: Range): EditResult => toggleWrap(value, range, '*', '*');
export const toggleStrike = (value: string, range: Range): EditResult => toggleWrap(value, range, '~~', '~~');
export const toggleInlineCode = (value: string, range: Range): EditResult => toggleWrap(value, range, '`', '`');

export function setHeading(value: string, range: Range, level: 1 | 2 | 3 | 4 | 5 | 6): EditResult {
    const prefix = '#'.repeat(level) + ' ';
    return mapLines(value, range, (line) => {
        const stripped = line.replace(/^#{1,6}\s+/, '');
        if (line.startsWith(prefix)) return stripped;
        return prefix + stripped;
    });
}

export function clearHeading(value: string, range: Range): EditResult {
    return mapLines(value, range, (line) => line.replace(/^#{1,6}\s+/, ''));
}

export const toggleBlockquote = (value: string, range: Range): EditResult => toggleLinePrefix(value, range, '> ');

export function toggleUnorderedList(value: string, range: Range): EditResult {
    const lineRange = getSelectedLinesRange(value, range);
    const block = value.slice(lineRange.start, lineRange.end);
    const lines = block.split('\n');
    const allHave = lines.every((l) => /^- /.test(l) || l === '');
    const mapped = lines
        .map((l) => {
            if (allHave) return l.replace(/^- /, '');
            if (/^\d+\.\s/.test(l)) return l.replace(/^\d+\.\s/, '- ');
            return '- ' + l;
        })
        .join('\n');
    const newValue = value.slice(0, lineRange.start) + mapped + value.slice(lineRange.end);
    const delta = mapped.length - block.length;
    return {
        value: newValue,
        selection: { start: lineRange.start, end: range.end + delta },
    };
}

export function toggleOrderedList(value: string, range: Range): EditResult {
    const lineRange = getSelectedLinesRange(value, range);
    const block = value.slice(lineRange.start, lineRange.end);
    const lines = block.split('\n');
    const allHave = lines.every((l) => /^\d+\.\s/.test(l) || l === '');
    let n = 0;
    const mapped = lines
        .map((l) => {
            if (allHave) return l.replace(/^\d+\.\s/, '');
            if (/^- /.test(l)) {
                n += 1;
                return n + '. ' + l.slice(2);
            }
            n += 1;
            return n + '. ' + l;
        })
        .join('\n');
    const newValue = value.slice(0, lineRange.start) + mapped + value.slice(lineRange.end);
    const delta = mapped.length - block.length;
    return {
        value: newValue,
        selection: { start: lineRange.start, end: range.end + delta },
    };
}

export const toggleTaskList = (value: string, range: Range): EditResult => {
    const lineRange = getSelectedLinesRange(value, range);
    const block = value.slice(lineRange.start, lineRange.end);
    const lines = block.split('\n');
    const allHave = lines.every((l) => /^- \[[ xX]\] /.test(l) || l === '');
    const mapped = lines
        .map((l) => {
            if (allHave) return l.replace(/^- \[[ xX]\] /, '');
            if (/^- /.test(l)) return '- [ ] ' + l.slice(2);
            return '- [ ] ' + l;
        })
        .join('\n');
    const newValue = value.slice(0, lineRange.start) + mapped + value.slice(lineRange.end);
    const delta = mapped.length - block.length;
    return {
        value: newValue,
        selection: { start: lineRange.start, end: range.end + delta },
    };
};

export function insertCodeBlock(value: string, range: Range, lang = ''): EditResult {
    const selected = value.slice(range.start, range.end);
    const body = selected || 'code';
    const block = '```' + lang + '\n' + body + '\n```';
    return insertBlock(value, range, block);
}

export function insertHorizontalRule(value: string, range: Range): EditResult {
    return insertBlock(value, range, '---');
}

export function insertTable(value: string, range: Range, cols = 3, rows = 2): EditResult {
    const header = '| ' + Array.from({ length: cols }, (_, i) => 'Col ' + (i + 1)).join(' | ') + ' |';
    const sep = '| ' + Array.from({ length: cols }, () => '---').join(' | ') + ' |';
    const bodyRows = Array.from({ length: rows }, () => '| ' + Array.from({ length: cols }, () => '   ').join(' | ') + ' |').join('\n');
    const block = header + '\n' + sep + '\n' + bodyRows;
    return insertBlock(value, range, block);
}

export function insertLink(value: string, range: Range, text: string, url: string): EditResult {
    const label = text || value.slice(range.start, range.end) || 'link';
    return replaceSelection(value, range, '[' + label + '](' + url + ')');
}

export function insertImage(value: string, range: Range, alt: string, url: string): EditResult {
    return replaceSelection(value, range, '![' + alt + '](' + url + ')');
}

export { indentLines as indentMarkdown, outdentLines as outdentMarkdown };

export function continueListOnEnter(value: string, range: Range): EditResult | null {
    if (range.start !== range.end) return null;
    const lineStart = value.lastIndexOf('\n', range.start - 1) + 1;
    const lineEnd = value.indexOf('\n', range.start);
    const currentLine = value.slice(lineStart, lineEnd === -1 ? value.length : lineEnd);

    const ulMatch = currentLine.match(/^(\s*)([-*+])\s(\[[ xX]\]\s)?(.*)$/);
    const olMatch = currentLine.match(/^(\s*)(\d+)([.)])\s(.*)$/);

    if (ulMatch) {
        const indent = ulMatch[1];
        const marker = ulMatch[2];
        const task = ulMatch[3] ? '[ ] ' : '';
        const rest = ulMatch[4];
        if (rest.trim() === '' && !ulMatch[3]) {
            const newValue = value.slice(0, lineStart) + '\n' + value.slice(range.start);
            return { value: newValue, selection: { start: lineStart + 1, end: lineStart + 1 } };
        }
        const insert = '\n' + indent + marker + ' ' + task;
        const newValue = value.slice(0, range.start) + insert + value.slice(range.start);
        const pos = range.start + insert.length;
        return { value: newValue, selection: { start: pos, end: pos } };
    }
    if (olMatch) {
        const indent = olMatch[1];
        const num = parseInt(olMatch[2], 10);
        const punct = olMatch[3];
        const rest = olMatch[4];
        if (rest.trim() === '') {
            const newValue = value.slice(0, lineStart) + '\n' + value.slice(range.start);
            return { value: newValue, selection: { start: lineStart + 1, end: lineStart + 1 } };
        }
        const insert = '\n' + indent + (num + 1) + punct + ' ';
        const newValue = value.slice(0, range.start) + insert + value.slice(range.start);
        const pos = range.start + insert.length;
        return { value: newValue, selection: { start: pos, end: pos } };
    }
    return null;
}
