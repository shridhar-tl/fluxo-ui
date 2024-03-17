import type { JsonValue, JsonValueType } from './json-editor-types';

const urlPattern = /^((https?:\/\/)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

const jsonChars = ['{', '[', '"', "'"];

export function getValueType(value: JsonValue): JsonValueType {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value as JsonValueType;
}

export function isUrl(value: string): boolean {
    return urlPattern.test(value?.trim());
}

export function parseInputValue(text: string, currentType?: JsonValueType): JsonValue {
    const trimmed = text.trim();

    if (trimmed === 'null') return null;
    if (trimmed === 'undefined') return undefined;
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;

    if (currentType === 'number') {
        const num = Number(trimmed);
        if (trimmed && !isNaN(num)) return num;
    }

    const firstChar = trimmed[0];
    if (jsonChars.includes(firstChar)) {
        try {
            return JSON.parse(trimmed) as JsonValue;
        } catch {
            // not valid JSON
        }
    }

    const num = Number(trimmed);
    if (trimmed && !isNaN(num)) return num;

    return text;
}

export function getDefaultValueForType(type: JsonValueType): JsonValue {
    switch (type) {
        case 'string': return '';
        case 'number': return 0;
        case 'boolean': return false;
        case 'null': return null;
        case 'undefined': return undefined;
        case 'object': return {};
        case 'array': return [];
        default: return null;
    }
}

export function convertValueToType(currentValue: JsonValue, newType: JsonValueType): JsonValue {
    const currentType = getValueType(currentValue);
    if (currentType === newType) return currentValue;

    switch (newType) {
        case 'string': {
            if (currentValue === null) return 'null';
            if (currentValue === undefined) return 'undefined';
            if (typeof currentValue === 'boolean' || typeof currentValue === 'number') return String(currentValue);
            if (Array.isArray(currentValue) || typeof currentValue === 'object') return JSON.stringify(currentValue);
            return String(currentValue);
        }
        case 'number': {
            if (typeof currentValue === 'string') {
                const num = Number(currentValue);
                if (!isNaN(num)) return num;
            }
            if (typeof currentValue === 'boolean') return currentValue ? 1 : 0;
            return 0;
        }
        case 'boolean': {
            if (typeof currentValue === 'string') {
                if (currentValue === 'true' || currentValue === '1') return true;
                if (currentValue === 'false' || currentValue === '0' || currentValue === '') return false;
                return currentValue.length > 0;
            }
            if (typeof currentValue === 'number') return currentValue !== 0;
            return false;
        }
        case 'null': return null;
        case 'undefined': return undefined;
        case 'object': {
            if (typeof currentValue === 'string') {
                try {
                    const parsed = JSON.parse(currentValue);
                    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as JsonValue;
                } catch { /* ignore */ }
            }
            if (Array.isArray(currentValue)) {
                const obj: Record<string, JsonValue> = {};
                currentValue.forEach((item, i) => { obj[String(i)] = item; });
                return obj;
            }
            return {};
        }
        case 'array': {
            if (typeof currentValue === 'string') {
                try {
                    const parsed = JSON.parse(currentValue);
                    if (Array.isArray(parsed)) return parsed as JsonValue;
                } catch { /* ignore */ }
            }
            if (currentValue && typeof currentValue === 'object' && !Array.isArray(currentValue)) {
                return Object.values(currentValue);
            }
            return [];
        }
        default: return getDefaultValueForType(newType);
    }
}

export function getDisplayString(value: JsonValue): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return JSON.stringify(value);
}

export function copyToClipboard(value: JsonValue): void {
    const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    navigator.clipboard.writeText(text);
}

export function countItems(value: JsonValue): number {
    if (Array.isArray(value)) return value.length;
    if (value !== null && typeof value === 'object') return Object.keys(value).length;
    return 0;
}

export function doesNodeMatch(key: string | number | undefined, value: JsonValue, query: string): boolean {
    if (!query) return true;
    const q = query.toLowerCase();

    if (key !== undefined && String(key).toLowerCase().includes(q)) return true;

    if (value === null) return 'null'.includes(q);
    if (value === undefined) return 'undefined'.includes(q);
    if (typeof value === 'string') return value.toLowerCase().includes(q);
    if (typeof value === 'number' || typeof value === 'boolean') return String(value).toLowerCase().includes(q);

    if (Array.isArray(value)) {
        return value.some((item, i) => doesNodeMatch(i, item, query));
    }
    if (typeof value === 'object') {
        return Object.keys(value).some(k => doesNodeMatch(k, value[k], query));
    }
    return false;
}

export function sortObjectKeys(obj: Record<string, JsonValue>): Record<string, JsonValue> {
    const sorted: Record<string, JsonValue> = {};
    Object.keys(obj).sort().forEach(key => {
        sorted[key] = obj[key];
    });
    return sorted;
}
