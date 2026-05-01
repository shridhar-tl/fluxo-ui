export interface PasswordPolicy {
    minLength?: number;
    targetLength?: number;
    requireLowercase?: boolean;
    requireUppercase?: boolean;
    requireDigit?: boolean;
    requireSymbol?: boolean;
    forbidSequences?: boolean;
    forbidRepeats?: boolean;
    forbidCommon?: boolean;
}

export interface PasswordAllowedChars {
    lowercase?: boolean;
    uppercase?: boolean;
    digits?: boolean;
    symbols?: boolean | string;
}

export interface PasswordStrengthThresholds {
    fair?: number;
    good?: number;
    strong?: number;
}

export type PasswordStrengthTier = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthInfo {
    score: number;
    tier: PasswordStrengthTier;
    satisfied: string[];
    failing: string[];
    nextTip: string | null;
    allTips: string[];
}

export interface PasswordRule {
    id: string;
    weight: number;
    test: (value: string) => boolean;
    hint: (value: string) => string;
}

export const DEFAULT_COMMON_PASSWORDS: string[] = [
    'password', 'password1', 'passw0rd', '123456', '12345678', '1234567890', 'qwerty', 'qwerty123', 'abc123', 'admin', 'admin123',
    'letmein', 'welcome', 'monkey', 'login', 'iloveyou', 'master', 'sunshine', 'princess', 'football', 'baseball', 'dragon',
    'shadow', 'superman', 'batman', 'starwars', 'computer', 'samsung', 'qazwsx', 'trustno1', 'access', 'flower', 'hello',
    'pass', 'pass123', 'p@ssword', 'p@ssw0rd', 'qwerty1', 'q1w2e3r4', 'asdfghjkl', '111111', '000000', '123123', '654321',
    'changeme', 'default', 'guest', 'temppass', 'temp123',
];

const isLowercase = (ch: string) => ch >= 'a' && ch <= 'z';
const isUppercase = (ch: string) => ch >= 'A' && ch <= 'Z';
const isDigit = (ch: string) => ch >= '0' && ch <= '9';

const charClassesIn = (value: string) => {
    let lower = false;
    let upper = false;
    let digit = false;
    let symbol = false;
    for (const ch of value) {
        if (isLowercase(ch)) lower = true;
        else if (isUppercase(ch)) upper = true;
        else if (isDigit(ch)) digit = true;
        else symbol = true;
    }
    return { lower, upper, digit, symbol };
};

const hasSequentialRun = (value: string, runLength = 4): boolean => {
    if (value.length < runLength) return false;
    const lowered = value.toLowerCase();
    for (let i = 0; i <= lowered.length - runLength; i += 1) {
        let asc = true;
        let desc = true;
        for (let j = 1; j < runLength; j += 1) {
            const diff = lowered.charCodeAt(i + j) - lowered.charCodeAt(i + j - 1);
            if (diff !== 1) asc = false;
            if (diff !== -1) desc = false;
        }
        if (asc || desc) return true;
    }
    return false;
};

const hasRepeats = (value: string): boolean => /(.)\1\1/.test(value);

const isCommonPassword = (value: string, list: Set<string>): boolean => {
    if (!value) return false;
    return list.has(value.toLowerCase());
};

const tierFor = (score: number, thresholds: Required<PasswordStrengthThresholds>): PasswordStrengthTier => {
    if (score >= thresholds.strong) return 'strong';
    if (score >= thresholds.good) return 'good';
    if (score >= thresholds.fair) return 'fair';
    return 'weak';
};

interface ComputeArgs {
    value: string;
    policy?: PasswordPolicy;
    allowedChars?: PasswordAllowedChars;
    customRules?: PasswordRule[];
    commonPasswords?: string[];
    useDefaultBlocklist?: boolean;
    thresholds?: PasswordStrengthThresholds;
}

const resolvedPolicy = (policy?: PasswordPolicy): Required<PasswordPolicy> => ({
    minLength: policy?.minLength ?? 8,
    targetLength: policy?.targetLength ?? 14,
    requireLowercase: policy?.requireLowercase ?? true,
    requireUppercase: policy?.requireUppercase ?? true,
    requireDigit: policy?.requireDigit ?? true,
    requireSymbol: policy?.requireSymbol ?? false,
    forbidSequences: policy?.forbidSequences ?? true,
    forbidRepeats: policy?.forbidRepeats ?? true,
    forbidCommon: policy?.forbidCommon ?? true,
});

const resolvedAllowed = (allowed?: PasswordAllowedChars): { lowercase: boolean; uppercase: boolean; digits: boolean; symbols: boolean } => ({
    lowercase: allowed?.lowercase ?? true,
    uppercase: allowed?.uppercase ?? true,
    digits: allowed?.digits ?? true,
    symbols: allowed?.symbols === undefined ? true : Boolean(allowed.symbols),
});

const resolvedThresholds = (thresholds?: PasswordStrengthThresholds): Required<PasswordStrengthThresholds> => ({
    fair: thresholds?.fair ?? 40,
    good: thresholds?.good ?? 65,
    strong: thresholds?.strong ?? 85,
});

export const computePasswordStrength = (args: ComputeArgs): PasswordStrengthInfo => {
    const policy = resolvedPolicy(args.policy);
    const allowed = resolvedAllowed(args.allowedChars);
    const thresholds = resolvedThresholds(args.thresholds);
    const value = args.value || '';

    const satisfied: string[] = [];
    const failing: string[] = [];
    const criticalTips: string[] = [];
    const classTips: string[] = [];
    const patternTips: string[] = [];
    const customTips: string[] = [];
    const softTips: string[] = [];

    if (value.length === 0) {
        return {
            score: 0,
            tier: 'weak',
            satisfied,
            failing,
            nextTip: null,
            allTips: [],
        };
    }

    const blocklistEntries = new Set<string>();
    if (args.useDefaultBlocklist !== false) {
        for (const entry of DEFAULT_COMMON_PASSWORDS) blocklistEntries.add(entry);
    }
    if (args.commonPasswords) for (const entry of args.commonPasswords) blocklistEntries.add(entry.toLowerCase());

    const classes = charClassesIn(value);
    const lengthBonus = Math.min(1, Math.max(0, (value.length - policy.minLength) / Math.max(1, policy.targetLength - policy.minLength)));
    const baseLength = Math.min(1, value.length / policy.minLength);

    let score = 0;
    score += baseLength * 30;
    score += lengthBonus * 20;

    let classCount = 0;
    if (allowed.lowercase) classCount += 1;
    if (allowed.uppercase) classCount += 1;
    if (allowed.digits) classCount += 1;
    if (allowed.symbols) classCount += 1;
    const classWeight = classCount > 0 ? 30 / classCount : 0;

    const lengthRuleId = 'minLength';
    const belowMin = value.length < policy.minLength;
    if (!belowMin) satisfied.push(lengthRuleId);
    else {
        failing.push(lengthRuleId);
        const remaining = policy.minLength - value.length;
        criticalTips.push(`Add ${remaining} more character${remaining === 1 ? '' : 's'} to reach the minimum length.`);
    }

    if (allowed.lowercase && policy.requireLowercase) {
        if (classes.lower) {
            satisfied.push('lowercase');
            score += classWeight;
        } else {
            failing.push('lowercase');
            classTips.push('Add a lowercase letter (a–z).');
        }
    } else if (allowed.lowercase && classes.lower) {
        score += classWeight * 0.5;
    }

    if (allowed.uppercase && policy.requireUppercase) {
        if (classes.upper) {
            satisfied.push('uppercase');
            score += classWeight;
        } else {
            failing.push('uppercase');
            classTips.push('Add an uppercase letter (A–Z).');
        }
    } else if (allowed.uppercase && classes.upper) {
        score += classWeight * 0.5;
    }

    if (allowed.digits && policy.requireDigit) {
        if (classes.digit) {
            satisfied.push('digit');
            score += classWeight;
        } else {
            failing.push('digit');
            classTips.push('Add a number (0–9).');
        }
    } else if (allowed.digits && classes.digit) {
        score += classWeight * 0.5;
    }

    if (allowed.symbols && policy.requireSymbol) {
        if (classes.symbol) {
            satisfied.push('symbol');
            score += classWeight;
        } else {
            failing.push('symbol');
            classTips.push('Add a symbol (e.g. !@#$%) to make it stronger.');
        }
    } else if (allowed.symbols && classes.symbol) {
        score += classWeight * 0.5;
    } else if (!allowed.symbols && classes.symbol) {
        criticalTips.push('Symbols are not allowed in this field — remove them.');
        score -= 10;
    }

    if (policy.forbidSequences && hasSequentialRun(value, 4)) {
        failing.push('noSequence');
        patternTips.push('Avoid sequential patterns like "abcd" or "1234".');
        score -= 12;
    } else if (policy.forbidSequences) {
        satisfied.push('noSequence');
    }

    if (policy.forbidRepeats && hasRepeats(value)) {
        failing.push('noRepeat');
        patternTips.push('Avoid repeating the same character three or more times.');
        score -= 8;
    } else if (policy.forbidRepeats) {
        satisfied.push('noRepeat');
    }

    if (policy.forbidCommon && isCommonPassword(value, blocklistEntries)) {
        failing.push('uncommon');
        criticalTips.push('This is a very common password — choose something unique.');
        score -= 30;
    } else if (policy.forbidCommon) {
        satisfied.push('uncommon');
    }

    if (args.customRules) {
        for (const rule of args.customRules) {
            if (rule.test(value)) {
                satisfied.push(rule.id);
                score += rule.weight;
            } else {
                failing.push(rule.id);
                const hint = rule.hint(value);
                if (hint) customTips.push(hint);
            }
        }
    }

    if (!belowMin) {
        const optionalLowerMissing = allowed.lowercase && !policy.requireLowercase && !classes.lower;
        const optionalUpperMissing = allowed.uppercase && !policy.requireUppercase && !classes.upper;
        const optionalDigitMissing = allowed.digits && !policy.requireDigit && !classes.digit;
        const optionalSymbolMissing = allowed.symbols && !policy.requireSymbol && !classes.symbol;

        if (optionalSymbolMissing) {
            softTips.push('Mix in a symbol (e.g. !@#$%) for a stronger password.');
        }
        if (optionalDigitMissing) {
            softTips.push('Mix in a number (0–9) for a stronger password.');
        }
        if (optionalUpperMissing) {
            softTips.push('Mix in an uppercase letter (A–Z) for a stronger password.');
        }
        if (optionalLowerMissing) {
            softTips.push('Mix in a lowercase letter (a–z) for a stronger password.');
        }

        if (value.length < policy.targetLength) {
            const remaining = policy.targetLength - value.length;
            softTips.push(`Add ${remaining} more character${remaining === 1 ? '' : 's'} to make it even stronger.`);
        }
    }

    score = Math.max(0, Math.min(100, Math.round(score)));
    const tier = tierFor(score, thresholds);

    const allTips = [...criticalTips, ...classTips, ...patternTips, ...customTips, ...softTips];

    return {
        score,
        tier,
        satisfied,
        failing,
        nextTip: allTips[0] ?? null,
        allTips,
    };
};

export const tierLabels: Record<PasswordStrengthTier, string> = {
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
};
