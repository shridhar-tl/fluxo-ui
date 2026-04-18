#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const pagesDir = resolve(rootDir, 'src/story/pages');
const componentsDir = resolve(rootDir, 'src/components');

const componentLocationOverrides = {
    'autocomplete-multi': { flat: 'AutocompleteMulti' },
    'fab-speed-dial': { flat: 'Fab' },
    'field-label': { flat: 'FieldLabel' },
    'list-box': { flat: 'ListBox' },
    'masked-input': { flat: 'MaskedInput' },
    'multi-state-checkbox': { flat: 'MultiStateCheckbox' },
    'numeric-input': { flat: 'NumericInput' },
    'progress-bar': { flat: 'ProgressBar' },
    'radio-button': { flat: 'RadioButton' },
    'select-button': { flat: 'SelectButton' },
    'text-input': { flat: 'TextInput' },
    'input-switch': { flat: 'InputSwitch' },
    'input-group': { flat: 'InputGroup' },
    'toggle-button': { flat: 'ToggleButton' },
    'infinite-scroll': { flat: 'InfiniteScroll' },
    'week-day-selector': { subdir: 'week-day-selector', name: 'WeekDaySelector' },
    'date-range-picker': { subdir: 'date-range', name: 'DateRangePicker' },
    'animate-on-view': { subdir: 'animate-on-view', name: 'AnimateOnView' },
    'confirm-popover': { subdir: 'confirm-popover', name: 'ConfirmPopover' },
    'context-menu': { subdir: 'context-menu', name: 'ContextMenu' },
    'countdown-timer': { subdir: 'CountdownTimer', name: 'CountdownTimer' },
    'docked-layout': { subdir: 'docked-layout', name: 'DockedLayout' },
    'drag-drop': { subdir: 'drag-drop', name: 'DragDrop' },
    'file-upload': { subdir: 'file-upload', name: 'FileUpload' },
    'gantt-chart': { subdir: 'gantt-chart', name: 'GanttChart' },
    'html-editor': { subdir: 'html-editor', name: 'HtmlEditor' },
    'image-editor': { subdir: 'image-editor', name: 'ImageEditor' },
    'json-editor': { subdir: 'json-editor', name: 'JsonEditor' },
    'kanban-board': { subdir: 'kanban-board', name: 'KanbanBoard' },
    'menu-nav': { subdir: 'menu-nav', name: 'MenuNav' },
    'notification-center': { subdir: 'notification-center', name: 'NotificationCenter' },
    'page-banner': { subdir: 'page-banner', name: 'PageBanner' },
    'pivot-table': { subdir: 'pivot-table', name: 'PivotTable' },
    'report-builder': { subdir: 'report-builder', name: 'ReportBuilder' },
    'tab-view': { subdir: 'tab-view', name: 'TabView' },
    'time-picker': { subdir: 'time-picker', name: 'TimePicker' },
    'tree-view': { subdir: 'tree-view', name: 'TreeView' },
    'collapsible-panel': { subdir: 'collapsible-panel', name: 'CollapsiblePanel' },
    'canvas-draw': { subdir: 'canvas-draw', name: 'CanvasDraw' },
    'color-picker': { subdir: 'color-picker', name: 'ColorPicker' },
    'diff-viewer': { subdir: 'diff-viewer', name: 'DiffViewer' },
    'services': { utility: true },
    'sortable': { utility: true },
    'store-basic': { utility: true },
    'store-model': { utility: true },
};

const slugToTitle = (slug) =>
    slug.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');

/**
 * Strips single-line and multi-line comments from source, preserving string contents.
 */
const stripComments = (src) => {
    let out = '';
    let i = 0;
    while (i < src.length) {
        if (src[i] === '/' && src[i + 1] === '/') {
            while (i < src.length && src[i] !== '\n') i++;
        } else if (src[i] === '/' && src[i + 1] === '*') {
            i += 2;
            while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
            i += 2;
        } else if (src[i] === "'" || src[i] === '"' || src[i] === '`') {
            const q = src[i];
            out += src[i++];
            while (i < src.length) {
                if (src[i] === '\\') { out += src[i] + src[i + 1]; i += 2; continue; }
                out += src[i];
                if (src[i] === q) { i++; break; }
                i++;
            }
        } else {
            out += src[i++];
        }
    }
    return out;
};

/**
 * Extracts the balanced brace block starting at the first { after `startIdx`.
 */
const extractBlock = (src, startIdx) => {
    let i = src.indexOf('{', startIdx);
    if (i === -1) return null;
    const start = i;
    let depth = 0;
    while (i < src.length) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') { depth--; if (depth === 0) break; }
        i++;
    }
    return src.slice(start, i + 1);
};

/**
 * Converts a TypeScript object literal (the kind used in PropsTable) to a plain JS object.
 * Single-pass char-by-char tokenizer — key quoting is done inline to avoid regex
 * accidentally matching inside string values.
 */
const parseTsPropsObject = (raw) => {
    const src = stripComments(raw);
    let out = '';
    let i = 0;

    const readSingleQuoted = () => {
        let s = '';
        while (i < src.length) {
            if (src[i] === '\\') {
                if (src[i + 1] === "'") { s += "'"; i += 2; }
                else { s += src[i] + src[i + 1]; i += 2; }
            } else if (src[i] === "'") { i++; break; }
            else { s += src[i++]; }
        }
        return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, '\\n');
    };

    const readDoubleQuoted = () => {
        let s = '';
        while (i < src.length) {
            if (src[i] === '\\') { s += src[i] + src[i + 1]; i += 2; }
            else if (src[i] === '"') { i++; break; }
            else { s += src[i++]; }
        }
        return s;
    };

    const readTemplateLiteral = () => {
        let s = '';
        while (i < src.length && src[i] !== '`') {
            if (src[i] === '\\') { s += src[i] + src[i + 1]; i += 2; }
            else if (src[i] === '$' && src[i + 1] === '{') {
                let d = 1; i += 2;
                while (i < src.length && d > 0) { if (src[i]==='{') d++; else if (src[i]==='}') d--; i++; }
                s += '...';
            } else { s += src[i++]; }
        }
        i++; // closing `
        return s.replace(/"/g, '\\"').replace(/\r?\n/g, '\\n');
    };

    // Track whether the immediately preceding non-whitespace structural char
    // was { or , so we know when to quote an upcoming identifier as an object key.
    let afterDelimiter = false;

    while (i < src.length) {
        const ch = src[i];

        if (ch === "'") {
            i++;
            out += '"' + readSingleQuoted() + '"';
            afterDelimiter = false;
        } else if (ch === '"') {
            i++;
            out += '"' + readDoubleQuoted() + '"';
            afterDelimiter = false;
        } else if (ch === '`') {
            i++;
            out += '"' + readTemplateLiteral() + '"';
            afterDelimiter = false;
        } else if (ch === '{' || ch === ',') {
            out += ch; i++;
            afterDelimiter = true;
        } else if (ch === '}' || ch === ']' || ch === '[') {
            out += ch; i++;
            afterDelimiter = false;
        } else if (ch === ':') {
            out += ch; i++;
            afterDelimiter = false;
        } else if (afterDelimiter && /[a-zA-Z_$]/.test(ch)) {
            // Unquoted object key — read it and wrap in double quotes
            let key = '';
            while (i < src.length && /[a-zA-Z0-9_$.]/.test(src[i])) key += src[i++];
            // Skip whitespace before the colon
            while (i < src.length && (src[i] === ' ' || src[i] === '\t' || src[i] === '\n' || src[i] === '\r')) i++;
            if (src[i] === ':') {
                out += '"' + key + '"';
                afterDelimiter = false;
            } else {
                // Not actually a key (e.g. identifier in a value like `true`, `null`, type names)
                out += key;
                afterDelimiter = false;
            }
        } else if (ch === 'u' && src.slice(i, i + 9) === 'undefined') {
            out += 'null'; i += 9;
            afterDelimiter = false;
        } else if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
            out += ch; i++;
            // whitespace doesn't change afterDelimiter
        } else {
            out += ch; i++;
            if (!/\s/.test(ch)) afterDelimiter = false;
        }
    }

    // Remove trailing commas before } or ]
    const result = out.replace(/,(\s*[}\]])/g, '$1');

    try {
        return JSON.parse(result);
    } catch (e) {
        const pos = parseInt(e.message.match(/position (\d+)/)?.[1] || 0);
        const ctx = result.slice(Math.max(0, pos - 80), pos + 80);
        throw new Error(`JSON.parse failed: ${e.message}\nContext: ${ctx}`);
    }
};

/**
 * Finds all `const *[Pp]rops* = { ... }` declarations in source.
 */
const extractPropsObjects = (src) => {
    const results = [];
    const clean = stripComments(src);
    const declRe = /const\s+(\w*[Pp]rops\w*)\s*(?::[^=\n]+)?\s*=\s*\{/g;
    let m;
    while ((m = declRe.exec(clean)) !== null) {
        const varName = m[1];
        try {
            const raw = extractBlock(clean, m.index + m[0].length - 1);
            if (!raw) continue;
            const parsed = parseTsPropsObject(raw);
            if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                results.push({ varName, parsed });
            }
        } catch (e) {
            results.push({ varName, error: e.message });
        }
    }
    return results;
};

const resolveOutputPath = (storyDir) => {
    const override = componentLocationOverrides[storyDir];

    if (override?.utility) {
        return { path: join(pagesDir, storyDir, `${storyDir}.props.json`), name: slugToTitle(storyDir) };
    }
    if (override?.subdir) {
        const dir = join(componentsDir, override.subdir);
        if (existsSync(dir)) return { path: join(dir, `${override.name}.props.json`), name: override.name };
    }
    if (override?.flat) {
        return { path: join(componentsDir, `${override.flat}.props.json`), name: override.flat };
    }

    const subdirPath = join(componentsDir, storyDir);
    if (existsSync(subdirPath) && statSync(subdirPath).isDirectory()) {
        const name = slugToTitle(storyDir);
        return { path: join(subdirPath, `${name}.props.json`), name };
    }

    const name = slugToTitle(storyDir);
    if (existsSync(join(componentsDir, `${name}.tsx`))) {
        return { path: join(componentsDir, `${name}.props.json`), name };
    }

    return { path: join(pagesDir, storyDir, `${storyDir}.props.json`), name };
};

const main = () => {
    const dirs = readdirSync(pagesDir).filter((d) => statSync(join(pagesDir, d)).isDirectory());
    let written = 0;
    let failed = 0;

    for (const dir of dirs) {
        const pageFiles = readdirSync(join(pagesDir, dir)).filter((f) => f.endsWith('Page.tsx'));
        if (pageFiles.length === 0) continue;

        const allProps = {};
        const errors = [];

        for (const pageFile of pageFiles) {
            const src = readFileSync(join(pagesDir, dir, pageFile), 'utf-8');
            const extracted = extractPropsObjects(src);
            for (const item of extracted) {
                if (item.error) {
                    errors.push(`${pageFile}::${item.varName}: ${item.error}`);
                    failed++;
                } else {
                    allProps[item.varName] = item.parsed;
                }
            }
        }

        if (Object.keys(allProps).length === 0) {
            if (errors.length > 0) {
                for (const e of errors) console.warn(`  [FAIL] ${dir}/${e}`);
            }
            continue;
        }

        const { path: outPath, name } = resolveOutputPath(dir);
        const output = {
            component: name,
            generatedFrom: `src/story/pages/${dir}/`,
            props: allProps,
        };

        writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');
        const relPath = outPath.replace(rootDir, '').replace(/\\/g, '/');
        const vars = Object.keys(allProps).join(', ');
        const errSuffix = errors.length ? ` (${errors.length} parse errors skipped)` : '';
        console.log(`  [OK] ${relPath} — ${vars}${errSuffix}`);
        for (const e of errors) console.warn(`       [SKIP] ${e.split('\n')[0]}`);
        written++;
    }

    console.log(`\nDone. Written: ${written}, Hard failures: ${failed}`);
};

main();
