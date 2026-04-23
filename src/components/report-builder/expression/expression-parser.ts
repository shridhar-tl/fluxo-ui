import type {
    AutocompleteSuggestion,
    BinaryOpNode,
    BuiltInFieldRefNode,
    BuiltinFunction,
    ColGroupRefNode,
    DatasourceRefNode,
    ExpressionContext,
    ExpressionError,
    ExpressionNode,
    ExpressionReturnType,
    ExpressionTypeContext,
    FieldRefNode,
    FunctionCallNode,
    LiteralNode,
    ParameterRefNode,
    RowGroupRefNode,
    RowOrColGroupProperty,
    Token,
    TokenType,
    UnaryOpNode,
    VariableRefNode,
} from './expression-types';

const FORBIDDEN_PATH_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype']);

function safeGetByPath(obj: unknown, path: string): unknown {
    if (obj === null || obj === undefined) return null;
    if (!path) return obj;
    const parts = path.split('.');
    let cur: unknown = obj;
    for (const raw of parts) {
        if (cur === null || cur === undefined) return null;
        if (FORBIDDEN_PATH_SEGMENTS.has(raw)) return null;
        let seg = raw;
        const arrayMatch = seg.match(/^([^\[]+)\[(\d+)\]$/);
        let arrayIdx: number | null = null;
        if (arrayMatch) {
            seg = arrayMatch[1];
            arrayIdx = parseInt(arrayMatch[2], 10);
        }
        if (typeof cur !== 'object') return null;
        if (!Object.prototype.hasOwnProperty.call(cur as object, seg)) return null;
        cur = (cur as Record<string, unknown>)[seg];
        if (arrayIdx !== null) {
            if (!Array.isArray(cur)) return null;
            cur = cur[arrayIdx];
        }
    }
    return cur;
}

// ── Tokenizer ─────────────────────────────────────────────────────────────────

function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    const len = input.length;

    while (i < len) {
        const ch = input[i];

        if (/\s/.test(ch)) { i++; continue; }

        if (ch === '.' && i + 1 < len && /[0-9]/.test(input[i + 1])) {
            const start = i;
            let num = '.';
            i++;
            while (i < len && /[0-9]/.test(input[i])) { num += input[i++]; }
            tokens.push({ type: 'Number', value: num, start, end: i });
            continue;
        }

        if (/[0-9]/.test(ch)) {
            const start = i;
            let num = '';
            while (i < len && /[0-9.]/.test(input[i])) { num += input[i++]; }
            tokens.push({ type: 'Number', value: num, start, end: i });
            continue;
        }

        if (ch === '"' || ch === "'") {
            const start = i;
            const quote = ch;
            let str = '';
            i++;
            while (i < len && input[i] !== quote) {
                if (input[i] === '\\' && i + 1 < len) { str += input[++i]; }
                else { str += input[i]; }
                i++;
            }
            if (i < len) i++;
            tokens.push({ type: 'String', value: str, start, end: i });
            continue;
        }

        if (/[a-zA-Z_]/.test(ch)) {
            const start = i;
            let ident = '';
            while (i < len && /[a-zA-Z0-9_]/.test(input[i])) { ident += input[i++]; }
            tokens.push({ type: 'Identifier', value: ident, start, end: i });
            continue;
        }

        if (ch === '.') { tokens.push({ type: 'Dot', value: '.', start: i, end: i + 1 }); i++; continue; }
        if (ch === ',') { tokens.push({ type: 'Comma', value: ',', start: i, end: i + 1 }); i++; continue; }
        if (ch === '(') { tokens.push({ type: 'LParen', value: '(', start: i, end: i + 1 }); i++; continue; }
        if (ch === ')') { tokens.push({ type: 'RParen', value: ')', start: i, end: i + 1 }); i++; continue; }

        const twoChar = input.slice(i, i + 2);
        if (['==', '!=', '<=', '>=', '&&', '||'].includes(twoChar)) {
            tokens.push({ type: 'Operator', value: twoChar, start: i, end: i + 2 });
            i += 2;
            continue;
        }

        if (['+', '-', '*', '/', '<', '>', '!'].includes(ch)) {
            tokens.push({ type: 'Operator', value: ch, start: i, end: i + 1 });
            i++;
            continue;
        }

        i++;
    }

    tokens.push({ type: 'EOF', value: '', start: len, end: len });
    return tokens;
}

// ── Parser ────────────────────────────────────────────────────────────────────

class Parser {
    private tokens: Token[];
    private pos = 0;
    private errors: ExpressionError[] = [];
    private typeCtx: ExpressionTypeContext;

    constructor(tokens: Token[], typeCtx: ExpressionTypeContext = {}) {
        this.tokens = tokens;
        this.typeCtx = typeCtx;
    }

    private peek(): Token { return this.tokens[this.pos]; }
    private consume(): Token { return this.tokens[this.pos++]; }
    private match(type: TokenType, value?: string): boolean {
        const t = this.peek();
        return t.type === type && (value === undefined || t.value === value);
    }

    parse(): { ast: ExpressionNode | null; errors: ExpressionError[] } {
        if (this.match('EOF')) return { ast: null, errors: [] };
        const ast = this.parseLogicalOr();
        if (!this.match('EOF')) {
            this.errors.push({ message: `Unexpected token: "${this.peek().value}"`, position: this.peek().start });
        }
        return { ast, errors: this.errors };
    }

    private parseLogicalOr(): ExpressionNode {
        let left = this.parseLogicalAnd();
        while (this.match('Operator', '||')) {
            this.consume();
            const right = this.parseLogicalAnd();
            const node: BinaryOpNode = { type: 'BinaryOp', op: '||', left, right, returnType: 'boolean' };
            left = node;
        }
        return left;
    }

    private parseLogicalAnd(): ExpressionNode {
        let left = this.parseEquality();
        while (this.match('Operator', '&&')) {
            this.consume();
            const right = this.parseEquality();
            const node: BinaryOpNode = { type: 'BinaryOp', op: '&&', left, right, returnType: 'boolean' };
            left = node;
        }
        return left;
    }

    private parseEquality(): ExpressionNode {
        let left = this.parseComparison();
        while (this.match('Operator', '==') || this.match('Operator', '!=')) {
            const op = this.consume().value;
            const right = this.parseComparison();
            const node: BinaryOpNode = { type: 'BinaryOp', op, left, right, returnType: 'boolean' };
            left = node;
        }
        return left;
    }

    private parseComparison(): ExpressionNode {
        let left = this.parseAddition();
        while (
            this.match('Operator', '<') || this.match('Operator', '>') ||
            this.match('Operator', '<=') || this.match('Operator', '>=')
        ) {
            const op = this.consume().value;
            const right = this.parseAddition();
            const node: BinaryOpNode = { type: 'BinaryOp', op, left, right, returnType: 'boolean' };
            left = node;
        }
        return left;
    }

    private parseAddition(): ExpressionNode {
        let left = this.parseMultiplication();
        while (this.match('Operator', '+') || this.match('Operator', '-')) {
            const op = this.consume().value;
            const right = this.parseMultiplication();
            const rt: ExpressionReturnType = op === '+' ? 'any' : 'number';
            const node: BinaryOpNode = { type: 'BinaryOp', op, left, right, returnType: rt };
            left = node;
        }
        return left;
    }

    private parseMultiplication(): ExpressionNode {
        let left = this.parseUnary();
        while (this.match('Operator', '*') || this.match('Operator', '/')) {
            const op = this.consume().value;
            const right = this.parseUnary();
            const node: BinaryOpNode = { type: 'BinaryOp', op, left, right, returnType: 'number' };
            left = node;
        }
        return left;
    }

    private parseUnary(): ExpressionNode {
        if (this.match('Operator', '!')) {
            this.consume();
            const operand = this.parseUnary();
            const node: UnaryOpNode = { type: 'UnaryOp', op: '!', operand, returnType: 'boolean' };
            return node;
        }
        if (this.match('Operator', '-')) {
            this.consume();
            const operand = this.parseUnary();
            const node: UnaryOpNode = { type: 'UnaryOp', op: '-', operand, returnType: 'number' };
            return node;
        }
        return this.parsePrimary();
    }

    private parsePrimary(): ExpressionNode {
        const t = this.peek();

        if (t.type === 'Number') {
            this.consume();
            const node: LiteralNode = { type: 'Literal', value: parseFloat(t.value), returnType: 'number' };
            return node;
        }

        if (t.type === 'String') {
            this.consume();
            const node: LiteralNode = { type: 'Literal', value: t.value, returnType: 'string' };
            return node;
        }

        if (t.type === 'Identifier') {
            if (t.value === 'true') {
                this.consume();
                return { type: 'Literal', value: true, returnType: 'boolean' };
            }
            if (t.value === 'false') {
                this.consume();
                return { type: 'Literal', value: false, returnType: 'boolean' };
            }
            if (t.value === 'null') {
                this.consume();
                return { type: 'Literal', value: null, returnType: 'null' };
            }
            return this.parseIdentifierOrCall();
        }

        if (t.type === 'LParen') {
            this.consume();
            const expr = this.parseLogicalOr();
            if (!this.match('RParen')) {
                this.errors.push({ message: 'Expected ")"', position: this.peek().start });
            } else {
                this.consume();
            }
            return expr;
        }

        this.errors.push({ message: `Unexpected token: "${t.value}"`, position: t.start });
        this.consume();
        return { type: 'Literal', value: null, returnType: 'null' };
    }

    private parseIdentifierOrCall(): ExpressionNode {
        const nameToken = this.consume();
        const firstName = nameToken.value;

        if (this.match('Dot')) {
            this.consume();
            if (firstName === 'Datasources') {
                const dsToken = this.consume();
                if (this.match('Dot')) {
                    this.consume();
                    const fieldToken = this.consume();
                    const node: DatasourceRefNode = {
                        type: 'DatasourceRef',
                        datasource: dsToken.value,
                        field: fieldToken.value,
                        returnType: 'any',
                    };
                    return node;
                }
                return { type: 'DatasourceRef', datasource: dsToken.value, field: '', returnType: 'any' };
            }

            if (firstName === 'Parameters') {
                const paramToken = this.consume();
                const path: string[] = [];
                while (this.match('Dot')) {
                    this.consume();
                    const next = this.consume();
                    if (next.type === 'Identifier') path.push(next.value);
                    else break;
                }
                const node: ParameterRefNode = {
                    type: 'ParameterRef',
                    parameter: paramToken.value,
                    path: path.length > 0 ? path : undefined,
                    returnType: 'any',
                };
                return node;
            }

            if (firstName === 'Field') {
                const fieldToken = this.consume();
                const node: FieldRefNode = {
                    type: 'FieldRef',
                    field: fieldToken.value,
                    returnType: 'any',
                };
                return node;
            }

            if (firstName === 'Variables') {
                const varToken = this.consume();
                const path: string[] = [];
                while (this.match('Dot')) {
                    this.consume();
                    const next = this.consume();
                    if (next.type === 'Identifier') path.push(next.value);
                    else break;
                }
                const node: VariableRefNode = {
                    type: 'VariableRef',
                    name: varToken.value,
                    path: path.length > 0 ? path : undefined,
                    returnType: 'any',
                };
                return node;
            }

            if (firstName === 'BuiltInFields') {
                const fieldToken = this.consume();
                const path: string[] = [];
                while (this.match('Dot')) {
                    this.consume();
                    const next = this.consume();
                    if (next.type === 'Identifier') path.push(next.value);
                    else break;
                }
                const node: BuiltInFieldRefNode = {
                    type: 'BuiltInFieldRef',
                    name: fieldToken.value,
                    path: path.length > 0 ? path : undefined,
                    returnType: 'any',
                };
                return node;
            }

            this.errors.push({ message: `Unknown namespace: "${firstName}"`, position: nameToken.start });
            return { type: 'Literal', value: null, returnType: 'null' };
        }

        if (this.match('LParen')) {
            this.consume();
            const args: ExpressionNode[] = [];
            if (!this.match('RParen')) {
                args.push(this.parseLogicalOr());
                while (this.match('Comma')) {
                    this.consume();
                    args.push(this.parseLogicalOr());
                }
            }
            if (!this.match('RParen')) {
                this.errors.push({ message: 'Expected ")" after function arguments', position: this.peek().start });
            } else {
                this.consume();
            }

            if (firstName === 'RowGroup' || firstName === 'ColGroup') {
                return this.buildGroupRefNode(firstName, args, nameToken.start);
            }

            const sig = builtinFunctions.find((f) => f.name.toLowerCase() === firstName.toLowerCase()) ??
                this.typeCtx.customFunctions?.find((f) => f.name.toLowerCase() === firstName.toLowerCase());

            const node: FunctionCallNode = {
                type: 'FunctionCall',
                name: firstName,
                args,
                returnType: sig?.returnType ?? 'any',
            };
            return node;
        }

        this.errors.push({ message: `Unknown identifier: "${firstName}"`, position: nameToken.start });
        return { type: 'Literal', value: null, returnType: 'null' };
    }

    private buildGroupRefNode(
        kind: 'RowGroup' | 'ColGroup',
        args: ExpressionNode[],
        startPos: number,
    ): ExpressionNode {
        if (args.length === 0 || args[0].type !== 'Literal' || typeof args[0].value !== 'string') {
            this.errors.push({
                message: `${kind}() requires a string group name as its first argument`,
                position: startPos,
            });
            return { type: 'Literal', value: null, returnType: 'null' };
        }
        const groupName = String(args[0].value);

        let property: RowOrColGroupProperty = { kind: 'key' };

        if (this.match('Dot')) {
            this.consume();
            const propToken = this.consume();
            const propName = propToken.value;
            if (propName === 'key') property = { kind: 'key' };
            else if (propName === 'keys') property = { kind: 'keys' };
            else if (propName === 'values') property = { kind: 'values' };
            else if (propName === 'Fields') {
                if (this.match('Dot')) {
                    this.consume();
                    const fieldToken = this.consume();
                    property = { kind: 'field', field: fieldToken.value };
                } else {
                    property = { kind: 'field', field: '' };
                }
            } else if (propName === 'Variables') {
                if (this.match('Dot')) {
                    this.consume();
                    const varToken = this.consume();
                    property = { kind: 'variable', name: varToken.value };
                } else {
                    property = { kind: 'variable', name: '' };
                }
            } else {
                this.errors.push({
                    message: `Unknown ${kind} property: ${propName}`,
                    position: propToken.start,
                });
            }
        }

        if (kind === 'RowGroup') {
            const node: RowGroupRefNode = {
                type: 'RowGroupRef',
                groupName,
                property,
                returnType: 'any',
            };
            return node;
        } else {
            const node: ColGroupRefNode = {
                type: 'ColGroupRef',
                groupName,
                property,
                returnType: 'any',
            };
            return node;
        }
    }
}

// ── Built-in Functions ────────────────────────────────────────────────────────

export const builtinFunctions: BuiltinFunction[] = [
    { name: 'Sum', description: 'Sum(values) or Sum(rows, "field") — sums a numeric array or a field across rows', params: [{ name: 'values', type: 'any' }, { name: 'field', type: 'string' }], returnType: 'number' },
    { name: 'Count', description: 'Count(values) or Count(rows, "field") — counts non-null occurrences', params: [{ name: 'values', type: 'any' }, { name: 'field', type: 'string' }], returnType: 'number' },
    { name: 'Avg', description: 'Avg(values) or Avg(rows, "field") — average of numeric values', params: [{ name: 'values', type: 'any' }, { name: 'field', type: 'string' }], returnType: 'number' },
    { name: 'Min', description: 'Min(values) or Min(rows, "field") — minimum value', params: [{ name: 'values', type: 'any' }, { name: 'field', type: 'string' }], returnType: 'number' },
    { name: 'Max', description: 'Max(values) or Max(rows, "field") — maximum value', params: [{ name: 'values', type: 'any' }, { name: 'field', type: 'string' }], returnType: 'number' },
    { name: 'IIf', description: 'Conditional: IIf(condition, trueValue, falseValue)', params: [{ name: 'condition', type: 'boolean' }, { name: 'trueValue', type: 'any' }, { name: 'falseValue', type: 'any' }], returnType: 'any' },
    { name: 'Switch', description: 'Switch(value, case1, result1, ...)', params: [{ name: 'args', type: 'any', variadic: true }], returnType: 'any' },
    { name: 'Concat', description: 'Concatenate strings', params: [{ name: 'args', type: 'any', variadic: true }], returnType: 'string' },
    { name: 'Upper', description: 'Convert to uppercase', params: [{ name: 'value', type: 'string' }], returnType: 'string' },
    { name: 'Lower', description: 'Convert to lowercase', params: [{ name: 'value', type: 'string' }], returnType: 'string' },
    { name: 'Trim', description: 'Trim whitespace', params: [{ name: 'value', type: 'string' }], returnType: 'string' },
    { name: 'Len', description: 'String length', params: [{ name: 'value', type: 'string' }], returnType: 'number' },
    { name: 'Mid', description: 'Mid(str, start, length)', params: [{ name: 'value', type: 'string' }, { name: 'start', type: 'number' }, { name: 'length', type: 'number' }], returnType: 'string' },
    { name: 'Replace', description: 'Replace(str, find, replace)', params: [{ name: 'value', type: 'string' }, { name: 'find', type: 'string' }, { name: 'replace', type: 'string' }], returnType: 'string' },
    { name: 'StartsWith', description: 'StartsWith(str, prefix)', params: [{ name: 'value', type: 'string' }, { name: 'prefix', type: 'string' }], returnType: 'boolean' },
    { name: 'EndsWith', description: 'EndsWith(str, suffix)', params: [{ name: 'value', type: 'string' }, { name: 'suffix', type: 'string' }], returnType: 'boolean' },
    { name: 'Contains', description: 'Contains(str, substr)', params: [{ name: 'value', type: 'string' }, { name: 'substr', type: 'string' }], returnType: 'boolean' },
    { name: 'Round', description: 'Round(number, decimals)', params: [{ name: 'value', type: 'number' }, { name: 'decimals', type: 'number' }], returnType: 'number' },
    { name: 'Abs', description: 'Absolute value', params: [{ name: 'value', type: 'number' }], returnType: 'number' },
    { name: 'Floor', description: 'Floor of a number', params: [{ name: 'value', type: 'number' }], returnType: 'number' },
    { name: 'Ceil', description: 'Ceiling of a number', params: [{ name: 'value', type: 'number' }], returnType: 'number' },
    { name: 'Now', description: 'Current date/time', params: [], returnType: 'string' },
    { name: 'Today', description: 'Current date', params: [], returnType: 'string' },
    { name: 'DateAdd', description: 'DateAdd(unit, amount, date)', params: [{ name: 'unit', type: 'string' }, { name: 'amount', type: 'number' }, { name: 'date', type: 'string' }], returnType: 'string' },
    { name: 'DateDiff', description: 'DateDiff(unit, date1, date2)', params: [{ name: 'unit', type: 'string' }, { name: 'date1', type: 'string' }, { name: 'date2', type: 'string' }], returnType: 'number' },
    { name: 'FormatDate', description: 'FormatDate(date, format)', params: [{ name: 'date', type: 'string' }, { name: 'format', type: 'string' }], returnType: 'string' },
    { name: 'ToString', description: 'Convert to string', params: [{ name: 'value', type: 'any' }], returnType: 'string' },
    { name: 'ToNumber', description: 'Convert to number', params: [{ name: 'value', type: 'any' }], returnType: 'number' },
    { name: 'IsNull', description: 'IsNull(value)', params: [{ name: 'value', type: 'any' }], returnType: 'boolean' },
    { name: 'IsEmpty', description: 'IsEmpty(value)', params: [{ name: 'value', type: 'any' }], returnType: 'boolean' },
    { name: 'Coalesce', description: 'Return first non-null value', params: [{ name: 'args', type: 'any', variadic: true }], returnType: 'any' },
    { name: 'Field', description: "Field('a.b.c') — safely read a nested field path from current row", params: [{ name: 'path', type: 'string' }], returnType: 'any' },
    { name: 'IfNull', description: 'IfNull(value, fallback) — returns fallback when value is null/undefined', params: [{ name: 'value', type: 'any' }, { name: 'fallback', type: 'any' }], returnType: 'any' },
    { name: 'InList', description: 'InList(value, array) — true if value is in the array', params: [{ name: 'value', type: 'any' }, { name: 'list', type: 'any' }], returnType: 'boolean' },
    { name: 'Between', description: 'Between(value, min, max) — true when min <= value <= max', params: [{ name: 'value', type: 'any' }, { name: 'min', type: 'any' }, { name: 'max', type: 'any' }], returnType: 'boolean' },
    { name: 'Length', description: 'Length of a string or array', params: [{ name: 'value', type: 'any' }], returnType: 'number' },
    { name: 'Any', description: 'Any(array) — true if array has at least one item', params: [{ name: 'value', type: 'any' }], returnType: 'boolean' },
    { name: 'All', description: 'All(array, truthy?) — true if every item is truthy', params: [{ name: 'value', type: 'any' }], returnType: 'boolean' },
    { name: 'FormatNumber', description: 'FormatNumber(value, decimals?, thousandsSep?) — 1234.5 → "1,234.50"', params: [{ name: 'value', type: 'any' }, { name: 'decimals', type: 'number' }, { name: 'thousandsSep', type: 'string' }], returnType: 'string' },
    { name: 'FormatCurrency', description: "FormatCurrency(value, symbol='$', decimals=2)", params: [{ name: 'value', type: 'any' }, { name: 'symbol', type: 'string' }, { name: 'decimals', type: 'number' }], returnType: 'string' },
    { name: 'FormatPercent', description: 'FormatPercent(value, decimals=0) — 0.25 → "25%"', params: [{ name: 'value', type: 'any' }, { name: 'decimals', type: 'number' }], returnType: 'string' },
    { name: 'PadLeft', description: 'PadLeft(value, length, char=" ")', params: [{ name: 'value', type: 'any' }, { name: 'length', type: 'number' }, { name: 'char', type: 'string' }], returnType: 'string' },
    { name: 'PadRight', description: 'PadRight(value, length, char=" ")', params: [{ name: 'value', type: 'any' }, { name: 'length', type: 'number' }, { name: 'char', type: 'string' }], returnType: 'string' },
    { name: 'Year', description: 'Year of a date string', params: [{ name: 'date', type: 'string' }], returnType: 'number' },
    { name: 'Month', description: 'Month (1-12) of a date string', params: [{ name: 'date', type: 'string' }], returnType: 'number' },
    { name: 'Day', description: 'Day-of-month (1-31)', params: [{ name: 'date', type: 'string' }], returnType: 'number' },
    { name: 'WeekDay', description: 'WeekDay(date) — 0=Sun..6=Sat', params: [{ name: 'date', type: 'string' }], returnType: 'number' },
    { name: 'Not', description: 'Logical NOT', params: [{ name: 'value', type: 'boolean' }], returnType: 'boolean' },
];

// ── Evaluator ─────────────────────────────────────────────────────────────────

function extractNumericArray(values: unknown, field?: unknown): number[] {
    if (!Array.isArray(values)) return [];
    if (typeof field === 'string' && field.length > 0) {
        const out: number[] = [];
        for (const row of values) {
            if (row && typeof row === 'object' && field in (row as Record<string, unknown>)) {
                const v = (row as Record<string, unknown>)[field];
                const n = Number(v);
                if (Number.isFinite(n)) out.push(n);
            }
        }
        return out;
    }
    const out: number[] = [];
    for (const v of values) {
        const n = Number(v);
        if (Number.isFinite(n)) out.push(n);
    }
    return out;
}

const builtinImpls: Record<string, (...args: unknown[]) => unknown> = {
    Sum: (values: unknown, field?: unknown) => {
        const nums = extractNumericArray(values, field);
        return nums.reduce((a, b) => a + b, 0);
    },
    Count: (values: unknown, field?: unknown) => {
        if (!Array.isArray(values)) return 0;
        if (typeof field === 'string' && field.length > 0) {
            return values.filter((r) => r && typeof r === 'object' && (r as Record<string, unknown>)[field] !== null && (r as Record<string, unknown>)[field] !== undefined).length;
        }
        return values.length;
    },
    Avg: (values: unknown, field?: unknown) => {
        const nums = extractNumericArray(values, field);
        return nums.length === 0 ? 0 : nums.reduce((a, b) => a + b, 0) / nums.length;
    },
    Min: (values: unknown, field?: unknown) => {
        const nums = extractNumericArray(values, field);
        return nums.length === 0 ? 0 : Math.min(...nums);
    },
    Max: (values: unknown, field?: unknown) => {
        const nums = extractNumericArray(values, field);
        return nums.length === 0 ? 0 : Math.max(...nums);
    },
    IIf: (cond: unknown, trueVal: unknown, falseVal: unknown) => (cond ? trueVal : falseVal),
    Switch: (...args: unknown[]) => {
        const val = args[0];
        for (let i = 1; i < args.length - 1; i += 2) {
            if (val === args[i]) return args[i + 1];
        }
        return args.length % 2 === 0 ? args[args.length - 1] : null;
    },
    Concat: (...args: unknown[]) => args.map(String).join(''),
    Upper: (v: unknown) => String(v ?? '').toUpperCase(),
    Lower: (v: unknown) => String(v ?? '').toLowerCase(),
    Trim: (v: unknown) => String(v ?? '').trim(),
    Len: (v: unknown) => String(v ?? '').length,
    Mid: (v: unknown, start: unknown, len: unknown) => String(v ?? '').slice(Number(start) - 1, Number(start) - 1 + Number(len)),
    Replace: (v: unknown, find: unknown, rep: unknown) => String(v ?? '').split(String(find)).join(String(rep)),
    StartsWith: (v: unknown, prefix: unknown) => String(v ?? '').startsWith(String(prefix)),
    EndsWith: (v: unknown, suffix: unknown) => String(v ?? '').endsWith(String(suffix)),
    Contains: (v: unknown, sub: unknown) => String(v ?? '').includes(String(sub)),
    Round: (v: unknown, d: unknown) => Number(Math.round(Number(`${v}e${d ?? 0}`)) + `e-${d ?? 0}`),
    Abs: (v: unknown) => Math.abs(Number(v)),
    Floor: (v: unknown) => Math.floor(Number(v)),
    Ceil: (v: unknown) => Math.ceil(Number(v)),
    Now: () => new Date().toISOString(),
    Today: () => new Date().toISOString().slice(0, 10),
    DateAdd: (unit: unknown, amount: unknown, date: unknown) => {
        const d = new Date(String(date));
        const n = Number(amount);
        switch (String(unit).toLowerCase()) {
            case 'day': case 'd': d.setDate(d.getDate() + n); break;
            case 'month': case 'm': d.setMonth(d.getMonth() + n); break;
            case 'year': case 'y': d.setFullYear(d.getFullYear() + n); break;
            case 'hour': case 'h': d.setHours(d.getHours() + n); break;
            default: break;
        }
        return d.toISOString();
    },
    DateDiff: (unit: unknown, d1: unknown, d2: unknown) => {
        const ms = new Date(String(d2)).getTime() - new Date(String(d1)).getTime();
        switch (String(unit).toLowerCase()) {
            case 'day': case 'd': return Math.floor(ms / 86400000);
            case 'hour': case 'h': return Math.floor(ms / 3600000);
            default: return ms;
        }
    },
    FormatDate: (date: unknown, fmt: unknown) => {
        const d = new Date(String(date));
        return String(fmt)
            .replace('YYYY', d.getFullYear().toString())
            .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
            .replace('DD', String(d.getDate()).padStart(2, '0'));
    },
    ToString: (v: unknown) => String(v ?? ''),
    ToNumber: (v: unknown) => Number(v),
    IsNull: (v: unknown) => v === null || v === undefined,
    IsEmpty: (v: unknown) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0),
    Coalesce: (...args: unknown[]) => args.find((a) => a !== null && a !== undefined) ?? null,
    IfNull: (v: unknown, fallback: unknown) => (v === null || v === undefined ? fallback : v),
    InList: (v: unknown, list: unknown) => {
        if (!Array.isArray(list)) return false;
        for (const x of list) {
            if (x === v) return true;
            if (String(x) === String(v)) return true;
        }
        return false;
    },
    Between: (v: unknown, min: unknown, max: unknown) => {
        if (v === null || v === undefined) return false;
        if (typeof v === 'number' && typeof min === 'number' && typeof max === 'number') {
            return v >= min && v <= max;
        }
        const sv = String(v);
        return sv >= String(min) && sv <= String(max);
    },
    Length: (v: unknown) => {
        if (v === null || v === undefined) return 0;
        if (Array.isArray(v)) return v.length;
        return String(v).length;
    },
    Any: (v: unknown) => Array.isArray(v) && v.length > 0,
    All: (v: unknown) => Array.isArray(v) && v.length > 0 && v.every(Boolean),
    FormatNumber: (v: unknown, decimals: unknown, sep: unknown) => {
        const n = Number(v);
        if (!Number.isFinite(n)) return '';
        const d = typeof decimals === 'number' ? Math.max(0, Math.min(10, decimals)) : 2;
        const thousands = typeof sep === 'string' ? sep : ',';
        const [intPart, fracPart] = n.toFixed(d).split('.');
        const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
        return fracPart ? `${withSep}.${fracPart}` : withSep;
    },
    FormatCurrency: (v: unknown, symbol: unknown, decimals: unknown) => {
        const n = Number(v);
        if (!Number.isFinite(n)) return '';
        const s = typeof symbol === 'string' ? symbol : '$';
        const d = typeof decimals === 'number' ? Math.max(0, Math.min(10, decimals)) : 2;
        const [intPart, fracPart] = n.toFixed(d).split('.');
        const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const body = fracPart ? `${withSep}.${fracPart}` : withSep;
        return n < 0 ? `-${s}${body.slice(1)}` : `${s}${body}`;
    },
    FormatPercent: (v: unknown, decimals: unknown) => {
        const n = Number(v);
        if (!Number.isFinite(n)) return '';
        const d = typeof decimals === 'number' ? Math.max(0, Math.min(10, decimals)) : 0;
        return `${(n * 100).toFixed(d)}%`;
    },
    PadLeft: (v: unknown, len: unknown, char: unknown) => {
        const str = String(v ?? '');
        const n = Number(len);
        if (!Number.isFinite(n) || n <= str.length) return str;
        const c = typeof char === 'string' && char.length > 0 ? char[0] : ' ';
        return c.repeat(n - str.length) + str;
    },
    PadRight: (v: unknown, len: unknown, char: unknown) => {
        const str = String(v ?? '');
        const n = Number(len);
        if (!Number.isFinite(n) || n <= str.length) return str;
        const c = typeof char === 'string' && char.length > 0 ? char[0] : ' ';
        return str + c.repeat(n - str.length);
    },
    Year: (v: unknown) => {
        const d = new Date(String(v));
        return Number.isNaN(d.getTime()) ? 0 : d.getFullYear();
    },
    Month: (v: unknown) => {
        const d = new Date(String(v));
        return Number.isNaN(d.getTime()) ? 0 : d.getMonth() + 1;
    },
    Day: (v: unknown) => {
        const d = new Date(String(v));
        return Number.isNaN(d.getTime()) ? 0 : d.getDate();
    },
    WeekDay: (v: unknown) => {
        const d = new Date(String(v));
        return Number.isNaN(d.getTime()) ? 0 : d.getDay();
    },
    Not: (v: unknown) => !v,
};

function fieldFunctionImpl(path: unknown, ctx: ExpressionContext): unknown {
    if (typeof path !== 'string') return null;
    if (!ctx.currentRow) return null;
    return safeGetByPath(ctx.currentRow, path);
}

function readGroupProperty(frame: import('./expression-types').GroupFrame | undefined, property: RowOrColGroupProperty): unknown {
    if (!frame) return null;
    switch (property.kind) {
        case 'key': return frame.key ?? null;
        case 'keys': return frame.keys ?? null;
        case 'values': return frame.values ?? null;
        case 'field':
            if (!frame.fields) return null;
            return safeGetByPath(frame.fields, property.field);
        case 'variable':
            if (!frame.variables) return null;
            return Object.prototype.hasOwnProperty.call(frame.variables, property.name)
                ? frame.variables[property.name]
                : null;
    }
}

async function evalNode(node: ExpressionNode, ctx: ExpressionContext): Promise<unknown> {
    switch (node.type) {
        case 'Literal': return node.value;

        case 'DatasourceRef': {
            const ds = ctx.datasources?.[node.datasource];
            if (!ds) return null;
            if (!node.field) return ds;
            return ds.map((row) => row[node.field]);
        }

        case 'ParameterRef': {
            const base = ctx.parameters?.[node.parameter] ?? null;
            if (!node.path || node.path.length === 0) return base;
            return safeGetByPath(base, node.path.join('.'));
        }

        case 'FieldRef':
            if (!ctx.currentRow) return null;
            return safeGetByPath(ctx.currentRow, node.field);

        case 'RowGroupRef':
            return readGroupProperty(ctx.rowGroups?.[node.groupName], node.property);

        case 'ColGroupRef':
            return readGroupProperty(ctx.colGroups?.[node.groupName], node.property);

        case 'VariableRef': {
            if (!ctx.variables) return null;
            const base = Object.prototype.hasOwnProperty.call(ctx.variables, node.name)
                ? ctx.variables[node.name]
                : null;
            if (!node.path || node.path.length === 0) return base;
            return safeGetByPath(base, node.path.join('.'));
        }

        case 'BuiltInFieldRef': {
            if (!ctx.builtInFields) return null;
            if (!Object.prototype.hasOwnProperty.call(ctx.builtInFields, node.name)) return null;
            let base = ctx.builtInFields[node.name];
            if (typeof base === 'function') {
                try {
                    base = (base as () => unknown)();
                    if (base && typeof (base as { then?: unknown }).then === 'function') {
                        base = await (base as Promise<unknown>);
                    }
                } catch {
                    return null;
                }
            }
            if (!node.path || node.path.length === 0) return base;
            return safeGetByPath(base, node.path.join('.'));
        }

        case 'UnaryOp': {
            const val = await evalNode(node.operand, ctx);
            if (node.op === '!') return !val;
            if (node.op === '-') return -Number(val);
            return val;
        }

        case 'BinaryOp': {
            const l = await evalNode(node.left, ctx);
            const r = await evalNode(node.right, ctx);
            switch (node.op) {
                case '+': return typeof l === 'string' || typeof r === 'string' ? String(l) + String(r) : Number(l) + Number(r);
                case '-': return Number(l) - Number(r);
                case '*': return Number(l) * Number(r);
                case '/': return Number(l) / Number(r);
                case '==': return l === r;
                case '!=': return l !== r;
                case '<': return (l as number) < (r as number);
                case '>': return (l as number) > (r as number);
                case '<=': return (l as number) <= (r as number);
                case '>=': return (l as number) >= (r as number);
                case '&&': return l && r;
                case '||': return l || r;
                default: return null;
            }
        }

        case 'FunctionCall': {
            const args = await Promise.all(node.args.map((a) => evalNode(a, ctx)));
            if (node.name === 'Field' || node.name.toLowerCase() === 'field') {
                return fieldFunctionImpl(args[0], ctx);
            }
            const custom = ctx.customFunctions?.find((f) => f.name.toLowerCase() === node.name.toLowerCase());
            if (custom) return await Promise.resolve(custom.fn(...args));
            const builtin = builtinImpls[node.name] ?? builtinImpls[
                Object.keys(builtinImpls).find((k) => k.toLowerCase() === node.name.toLowerCase()) ?? ''
            ];
            if (builtin) return builtin(...args);
            throw new Error(`Unknown function: ${node.name}`);
        }
    }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function parseExpression(
    input: string,
    typeCtx?: ExpressionTypeContext,
): { ast: ExpressionNode | null; errors: ExpressionError[] } {
    const tokens = tokenize(input.trim());
    const parser = new Parser(tokens, typeCtx);
    return parser.parse();
}

export async function evaluateExpression(
    input: string,
    ctx: ExpressionContext = {},
): Promise<{ result: unknown; error: string | null }> {
    try {
        const { ast, errors } = parseExpression(input);
        if (errors.length > 0) return { result: null, error: errors[0].message };
        if (!ast) return { result: null, error: null };
        const result = await evalNode(ast, ctx);
        return { result, error: null };
    } catch (e) {
        return { result: null, error: e instanceof Error ? e.message : String(e) };
    }
}

export function validateExpression(
    input: string,
    typeCtx: ExpressionTypeContext = {},
): ExpressionError[] {
    const { errors, ast } = parseExpression(input.trim(), typeCtx);
    if (ast && typeCtx.expectedReturnType && typeCtx.expectedReturnType !== 'any') {
        const actualType = ast.returnType;
        if (actualType !== 'any' && actualType !== typeCtx.expectedReturnType) {
            errors.push({
                message: `Expected ${typeCtx.expectedReturnType} but expression returns ${actualType}`,
            });
        }
    }
    return errors;
}

export function getAutocompleteSuggestions(
    input: string,
    cursorPos: number,
    typeCtx: ExpressionTypeContext = {},
): AutocompleteSuggestion[] {
    const before = input.slice(0, cursorPos);
    const suggestions: AutocompleteSuggestion[] = [];

    const datasourcesMatch = before.match(/Datasources\.(\w*)$/);
    if (datasourcesMatch) {
        const partial = datasourcesMatch[1].toLowerCase();
        const dsNames = Object.keys(typeCtx.availableDatasources ?? {});
        for (const name of dsNames) {
            if (name.toLowerCase().startsWith(partial)) {
                suggestions.push({ label: name, kind: 'datasource', detail: 'Datasource' });
            }
        }
        return suggestions;
    }

    const dsFieldMatch = before.match(/Datasources\.(\w+)\.(\w*)$/);
    if (dsFieldMatch) {
        const dsName = dsFieldMatch[1];
        const partial = dsFieldMatch[2].toLowerCase();
        const fields = typeCtx.availableDatasources?.[dsName] ?? [];
        for (const f of fields) {
            if (f.toLowerCase().startsWith(partial)) {
                suggestions.push({ label: f, kind: 'field', detail: `${dsName} field` });
            }
        }
        return suggestions;
    }

    const paramMatch = before.match(/Parameters\.(\w*)$/);
    if (paramMatch) {
        const partial = paramMatch[1].toLowerCase();
        for (const p of typeCtx.availableParameters ?? []) {
            if (p.toLowerCase().startsWith(partial)) {
                suggestions.push({ label: p, kind: 'parameter', detail: 'Parameter' });
            }
        }
        return suggestions;
    }

    const fieldMatch = before.match(/Field\.(\w*)$/);
    if (fieldMatch) {
        const partial = fieldMatch[1].toLowerCase();
        for (const f of typeCtx.availableFields ?? []) {
            if (f.toLowerCase().startsWith(partial)) {
                suggestions.push({ label: f, kind: 'field', detail: 'Row field' });
            }
        }
        return suggestions;
    }

    const varMatch = before.match(/Variables\.(\w*)$/);
    if (varMatch) {
        const partial = varMatch[1].toLowerCase();
        for (const v of typeCtx.availableVariables ?? []) {
            if (v.toLowerCase().startsWith(partial)) {
                suggestions.push({ label: v, kind: 'parameter', detail: 'Variable' });
            }
        }
        return suggestions;
    }

    const builtInMatch = before.match(/BuiltInFields\.(\w*)$/);
    if (builtInMatch) {
        const partial = builtInMatch[1].toLowerCase();
        for (const b of typeCtx.availableBuiltInFields ?? []) {
            if (b.toLowerCase().startsWith(partial)) {
                suggestions.push({ label: b, kind: 'builtin', detail: 'Built-in field' });
            }
        }
        return suggestions;
    }

    const identMatch = before.match(/(?:^|[^.\w])(\w+)$/);
    const partial = identMatch?.[1]?.toLowerCase() ?? '';
    if (partial.length > 0) {
        const namespaces = ['Datasources', 'Parameters', 'Field', 'Variables', 'BuiltInFields'];
        for (const ns of namespaces) {
            if (ns.toLowerCase().startsWith(partial)) {
                suggestions.push({ label: ns, kind: 'keyword', insertText: `${ns}.` });
            }
        }
        const groupFns = ['RowGroup', 'ColGroup'];
        for (const fn of groupFns) {
            if (fn.toLowerCase().startsWith(partial)) {
                suggestions.push({ label: fn, kind: 'function', detail: `${fn}('name') — group context`, insertText: `${fn}('')` });
            }
        }
        const allFns = [...builtinFunctions, ...(typeCtx.customFunctions ?? [])];
        for (const fn of allFns) {
            if (fn.name.toLowerCase().startsWith(partial)) {
                const paramStr = fn.params.map((p) => p.name).join(', ');
                suggestions.push({
                    label: fn.name,
                    kind: 'function',
                    detail: fn.description,
                    insertText: `${fn.name}(${paramStr})`,
                });
            }
        }
        for (const kw of ['true', 'false', 'null']) {
            if (kw.startsWith(partial)) {
                suggestions.push({ label: kw, kind: 'keyword' });
            }
        }
    }

    return suggestions;
}

export function highlightExpression(input: string): Array<{ text: string; className: string }> {
    const tokens = tokenize(input);
    const parts: Array<{ text: string; className: string }> = [];
    let lastEnd = 0;

    for (const token of tokens) {
        if (token.type === 'EOF') break;
        if (token.start > lastEnd) {
            parts.push({ text: input.slice(lastEnd, token.start), className: 'eui-expr-plain' });
        }
        let className = 'eui-expr-plain';
        if (token.type === 'Number') className = 'eui-expr-number';
        else if (token.type === 'String') className = 'eui-expr-string';
        else if (token.type === 'Operator') className = 'eui-expr-operator';
        else if (token.type === 'Identifier') {
            if (['true', 'false', 'null'].includes(token.value)) className = 'eui-expr-keyword';
            else if (['Datasources', 'Parameters', 'Field', 'Variables', 'BuiltInFields', 'RowGroup', 'ColGroup'].includes(token.value)) className = 'eui-expr-namespace';
            else if (builtinFunctions.some((f) => f.name === token.value)) className = 'eui-expr-function';
            else className = 'eui-expr-identifier';
        }
        const text = token.type === 'String' ? `"${token.value}"` : token.value;
        parts.push({ text, className });
        lastEnd = token.end;
    }

    if (lastEnd < input.length) {
        parts.push({ text: input.slice(lastEnd), className: 'eui-expr-plain' });
    }

    return parts;
}
