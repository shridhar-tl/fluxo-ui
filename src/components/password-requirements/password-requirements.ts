export const DEFAULT_ALLOWED_SYMBOLS = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

export interface PasswordRequirementsPolicy {
    minLength?: number;
    maxLength?: number;
    minLowercase?: number;
    minUppercase?: number;
    minDigits?: number;
    minSymbols?: number;
    allowedSymbols?: string;
    forbidWhitespace?: boolean;
    maxConsecutiveRepeat?: number;
    maxConsecutiveSequence?: number;
    requireMatch?: boolean;
    onlyAlphaNumeric?: boolean;
    numericOnly?: boolean;
    customCharSet?: string;
}

export interface PasswordRequirementsRule {
    id: string;
    label: string;
    met: boolean;
    progress?: { current: number; required: number };
    hint?: string;
}

export interface PasswordRequirementsInfo {
    rules: PasswordRequirementsRule[];
    met: PasswordRequirementsRule[];
    unmet: PasswordRequirementsRule[];
    metCount: number;
    totalCount: number;
    allMet: boolean;
}

const isLowercase = (ch: string) => ch >= 'a' && ch <= 'z';
const isUppercase = (ch: string) => ch >= 'A' && ch <= 'Z';
const isDigit = (ch: string) => ch >= '0' && ch <= '9';

const countLowercase = (s: string) => Array.from(s).filter(isLowercase).length;
const countUppercase = (s: string) => Array.from(s).filter(isUppercase).length;
const countDigits = (s: string) => Array.from(s).filter(isDigit).length;
const countSymbols = (s: string, allowed: string) => {
    if (!allowed) return Array.from(s).filter((ch) => !isLowercase(ch) && !isUppercase(ch) && !isDigit(ch)).length;
    return Array.from(s).filter((ch) => allowed.includes(ch)).length;
};

const hasRepeatedRun = (s: string, max: number) => {
    if (max <= 0) return false;
    let run = 1;
    for (let i = 1; i < s.length; i += 1) {
        if (s[i] === s[i - 1]) {
            run += 1;
            if (run > max) return true;
        } else {
            run = 1;
        }
    }
    return false;
};

const hasSequentialRun = (s: string, max: number) => {
    if (max <= 0 || s.length < max) return false;
    const lowered = s.toLowerCase();
    for (let i = 0; i <= lowered.length - max; i += 1) {
        let asc = true;
        let desc = true;
        for (let j = 1; j < max; j += 1) {
            const diff = lowered.charCodeAt(i + j) - lowered.charCodeAt(i + j - 1);
            if (diff !== 1) asc = false;
            if (diff !== -1) desc = false;
        }
        if (asc || desc) return true;
    }
    return false;
};

interface BuildArgs {
    value: string;
    confirm?: string;
    policy?: PasswordRequirementsPolicy;
    labels?: Partial<Record<string, string>>;
    customRules?: Array<{
        id: string;
        label: string;
        test: (value: string, confirm?: string) => boolean;
        hint?: string;
    }>;
}

const fmtList = (chars: string, max = 6): string => {
    const arr = Array.from(chars);
    if (arr.length === 0) return '';
    const head = arr.slice(0, max).join(' ');
    return arr.length > max ? `${head} …` : head;
};

const labelFor = (id: string, fallback: string, labels?: Partial<Record<string, string>>): string => {
    if (labels && labels[id]) return labels[id] as string;
    return fallback;
};

export const buildPasswordRequirements = (args: BuildArgs): PasswordRequirementsInfo => {
    const { value, confirm, policy, labels, customRules } = args;
    const allowedSymbols = policy?.allowedSymbols ?? DEFAULT_ALLOWED_SYMBOLS;
    const rules: PasswordRequirementsRule[] = [];

    if (policy?.minLength != null) {
        const required = policy.minLength;
        const current = value.length;
        rules.push({
            id: 'minLength',
            label: labelFor('minLength', `At least ${required} character${required === 1 ? '' : 's'}`, labels),
            met: current >= required,
            progress: { current, required },
        });
    }

    if (policy?.maxLength != null) {
        const max = policy.maxLength;
        rules.push({
            id: 'maxLength',
            label: labelFor('maxLength', `No more than ${max} characters`, labels),
            met: value.length > 0 && value.length <= max,
            progress: { current: value.length, required: max },
        });
    }

    if (policy?.minLowercase && policy.minLowercase > 0) {
        const required = policy.minLowercase;
        const current = countLowercase(value);
        rules.push({
            id: 'minLowercase',
            label: labelFor(
                'minLowercase',
                required === 1 ? 'At least one lowercase letter (a–z)' : `At least ${required} lowercase letters (a–z)`,
                labels,
            ),
            met: current >= required,
            progress: { current, required },
        });
    }

    if (policy?.minUppercase && policy.minUppercase > 0) {
        const required = policy.minUppercase;
        const current = countUppercase(value);
        rules.push({
            id: 'minUppercase',
            label: labelFor(
                'minUppercase',
                required === 1 ? 'At least one uppercase letter (A–Z)' : `At least ${required} uppercase letters (A–Z)`,
                labels,
            ),
            met: current >= required,
            progress: { current, required },
        });
    }

    if (policy?.minDigits && policy.minDigits > 0) {
        const required = policy.minDigits;
        const current = countDigits(value);
        rules.push({
            id: 'minDigits',
            label: labelFor(
                'minDigits',
                required === 1 ? 'At least one number (0–9)' : `At least ${required} numbers (0–9)`,
                labels,
            ),
            met: current >= required,
            progress: { current, required },
        });
    }

    if (policy?.minSymbols && policy.minSymbols > 0) {
        const required = policy.minSymbols;
        const current = countSymbols(value, allowedSymbols);
        rules.push({
            id: 'minSymbols',
            label: labelFor(
                'minSymbols',
                required === 1
                    ? `At least one symbol (${fmtList(allowedSymbols)})`
                    : `At least ${required} symbols (${fmtList(allowedSymbols)})`,
                labels,
            ),
            met: current >= required,
            progress: { current, required },
            hint: `Allowed: ${allowedSymbols}`,
        });
    }

    if (policy?.forbidWhitespace) {
        rules.push({
            id: 'noWhitespace',
            label: labelFor('noWhitespace', 'No whitespace characters', labels),
            met: value.length > 0 && !/\s/.test(value),
        });
    }

    if (policy?.maxConsecutiveRepeat && policy.maxConsecutiveRepeat > 0) {
        rules.push({
            id: 'noRepeat',
            label: labelFor(
                'noRepeat',
                `No more than ${policy.maxConsecutiveRepeat} of the same character in a row`,
                labels,
            ),
            met: value.length > 0 && !hasRepeatedRun(value, policy.maxConsecutiveRepeat),
        });
    }

    if (policy?.maxConsecutiveSequence && policy.maxConsecutiveSequence > 0) {
        rules.push({
            id: 'noSequence',
            label: labelFor(
                'noSequence',
                `No sequential runs of ${policy.maxConsecutiveSequence}+ characters (e.g. abcd, 1234)`,
                labels,
            ),
            met: value.length > 0 && !hasSequentialRun(value, policy.maxConsecutiveSequence),
        });
    }

    if (policy?.onlyAlphaNumeric) {
        rules.push({
            id: 'alphaNumericOnly',
            label: labelFor('alphaNumericOnly', 'Only letters and numbers', labels),
            met: value.length === 0 ? false : /^[A-Za-z0-9]+$/.test(value),
        });
    }

    if (policy?.numericOnly) {
        rules.push({
            id: 'numericOnly',
            label: labelFor('numericOnly', 'Only digits (0–9)', labels),
            met: value.length === 0 ? false : /^\d+$/.test(value),
        });
    }

    if (policy?.customCharSet) {
        const set = policy.customCharSet;
        const allowed = new Set(Array.from(set));
        const ok = value.length === 0 ? false : Array.from(value).every((ch) => allowed.has(ch));
        rules.push({
            id: 'customCharSet',
            label: labelFor('customCharSet', `Only the allowed characters (${fmtList(set)})`, labels),
            met: ok,
        });
    }

    const wantsMatch = policy?.requireMatch ?? confirm !== undefined;
    if (wantsMatch && confirm !== undefined) {
        rules.push({
            id: 'match',
            label: labelFor('match', 'Passwords match', labels),
            met: value.length > 0 && value === confirm,
        });
    }

    if (customRules) {
        for (const rule of customRules) {
            rules.push({
                id: rule.id,
                label: rule.label,
                met: rule.test(value, confirm),
                hint: rule.hint,
            });
        }
    }

    const met = rules.filter((r) => r.met);
    const unmet = rules.filter((r) => !r.met);

    return {
        rules,
        met,
        unmet,
        metCount: met.length,
        totalCount: rules.length,
        allMet: rules.length > 0 && unmet.length === 0,
    };
};
