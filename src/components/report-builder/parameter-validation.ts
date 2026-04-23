import type { ParameterConfig, ParameterValidation } from './report-definition-types';

const MAX_REGEX_LENGTH = 500;
const compiledRegexCache = new Map<string, RegExp | null>();

export function compileSafeRegex(pattern: string | undefined, flags = ''): RegExp | null {
    if (!pattern) return null;
    if (pattern.length > MAX_REGEX_LENGTH) return null;
    const cacheKey = `${flags}::${pattern}`;
    if (compiledRegexCache.has(cacheKey)) return compiledRegexCache.get(cacheKey)!;
    try {
        const rx = new RegExp(pattern, flags);
        compiledRegexCache.set(cacheKey, rx);
        return rx;
    } catch {
        compiledRegexCache.set(cacheKey, null);
        return null;
    }
}

export function isKeyFilterAllowed(
    pattern: string | undefined,
    key: string,
): boolean {
    if (!pattern) return true;
    if (key.length !== 1) return true;
    const rx = compileSafeRegex(pattern);
    if (!rx) return true;
    return rx.test(key);
}

function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
}

export function validateParameterValue(
    param: ParameterConfig,
    value: unknown,
): string[] {
    const errors: string[] = [];

    if (param.mandatory && isEmpty(value)) {
        errors.push(`${param.label || param.name} is required`);
        return errors;
    }

    if (isEmpty(value)) return errors;

    const v: ParameterValidation = param.validation ?? {};
    const tc = param.typeConfig ?? {};

    if (param.type === 'text' || param.type === 'masked-edit') {
        const str = String(value);
        const minLen = v.minLength ?? (tc.minLength as number | undefined);
        const maxLen = v.maxLength ?? (tc.maxLength as number | undefined);
        if (minLen !== undefined && str.length < minLen) {
            errors.push(`${param.label} must be at least ${minLen} characters`);
        }
        if (maxLen !== undefined && str.length > maxLen) {
            errors.push(`${param.label} must be at most ${maxLen} characters`);
        }
        if (v.regex) {
            const rx = compileSafeRegex(v.regex);
            if (rx && !rx.test(str)) {
                errors.push(v.regexMessage || `${param.label} format is invalid`);
            } else if (!rx && v.regex) {
                errors.push(`${param.label}: invalid validation pattern configured`);
            }
        }
    }

    if (param.type === 'numeric') {
        const num = Number(value);
        if (Number.isNaN(num)) {
            errors.push(`${param.label} must be a valid number`);
        } else {
            const min = v.minValue ?? (tc.min as number | undefined);
            const max = v.maxValue ?? (tc.max as number | undefined);
            if (min !== undefined && num < min) {
                errors.push(`${param.label} must be ≥ ${min}`);
            }
            if (max !== undefined && num > max) {
                errors.push(`${param.label} must be ≤ ${max}`);
            }
        }
    }

    if (param.type === 'multi-select' || param.type === 'chips') {
        const arr = Array.isArray(value) ? value : [];
        const minItems = v.minItems ?? (tc.minItems as number | undefined);
        const maxItems = v.maxItems ?? (tc.maxItems as number | undefined);
        if (minItems !== undefined && arr.length < minItems) {
            errors.push(`${param.label} must have at least ${minItems} items`);
        }
        if (maxItems !== undefined && arr.length > maxItems) {
            errors.push(`${param.label} must have at most ${maxItems} items`);
        }
    }

    if (param.type === 'file') {
        const files = Array.isArray(value) ? value : [value];
        for (const f of files) {
            if (!(f instanceof File)) continue;
            if (v.maxFileSize !== undefined && f.size > v.maxFileSize) {
                errors.push(`${param.label}: "${f.name}" exceeds max size of ${formatBytes(v.maxFileSize)}`);
            }
            if (v.allowedFileTypes && !matchesFileType(f, v.allowedFileTypes)) {
                errors.push(`${param.label}: "${f.name}" is not an allowed file type`);
            }
        }
    }

    return errors;
}

export function validateAllParameters(
    parameters: ParameterConfig[],
    values: Record<string, unknown>,
): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (const p of parameters) {
        if (p.hidden === true) continue;
        const errs = validateParameterValue(p, values[p.id]);
        if (errs.length > 0) result[p.id] = errs;
    }
    return result;
}

function matchesFileType(file: File, accept: string): boolean {
    const list = accept.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (list.length === 0) return true;
    const name = file.name.toLowerCase();
    const mime = file.type.toLowerCase();
    return list.some((t) => {
        if (t.startsWith('.')) return name.endsWith(t);
        if (t.endsWith('/*')) return mime.startsWith(t.slice(0, -1));
        return mime === t;
    });
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
