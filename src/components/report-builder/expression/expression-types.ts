export type ExpressionReturnType = 'string' | 'number' | 'boolean' | 'any' | 'null';

// ── AST Node Types ────────────────────────────────────────────────────────────

export interface LiteralNode {
    type: 'Literal';
    value: string | number | boolean | null;
    returnType: ExpressionReturnType;
}

export interface DatasourceRefNode {
    type: 'DatasourceRef';
    datasource: string;
    field: string;
    returnType: 'any';
}

export interface ParameterRefNode {
    type: 'ParameterRef';
    parameter: string;
    returnType: 'any';
}

export interface FieldRefNode {
    type: 'FieldRef';
    field: string;
    returnType: 'any';
}

export interface FunctionCallNode {
    type: 'FunctionCall';
    name: string;
    args: ExpressionNode[];
    returnType: ExpressionReturnType;
}

export interface BinaryOpNode {
    type: 'BinaryOp';
    op: string;
    left: ExpressionNode;
    right: ExpressionNode;
    returnType: ExpressionReturnType;
}

export interface UnaryOpNode {
    type: 'UnaryOp';
    op: '!' | '-';
    operand: ExpressionNode;
    returnType: ExpressionReturnType;
}

export type ExpressionNode =
    | LiteralNode
    | DatasourceRefNode
    | ParameterRefNode
    | FieldRefNode
    | FunctionCallNode
    | BinaryOpNode
    | UnaryOpNode;

// ── Token Types ───────────────────────────────────────────────────────────────

export type TokenType =
    | 'Identifier'
    | 'Number'
    | 'String'
    | 'Dot'
    | 'Comma'
    | 'LParen'
    | 'RParen'
    | 'Operator'
    | 'EOF';

export interface Token {
    type: TokenType;
    value: string;
    start: number;
    end: number;
}

// ── Function Definitions ──────────────────────────────────────────────────────

export interface FunctionParam {
    name: string;
    type: ExpressionReturnType | 'any';
    variadic?: boolean;
}

export interface BuiltinFunction {
    name: string;
    description: string;
    params: FunctionParam[];
    returnType: ExpressionReturnType;
    isAsync?: boolean;
}

export interface CustomFunction extends BuiltinFunction {
    fn: (...args: unknown[]) => unknown | Promise<unknown>;
}

// ── Evaluation Context ────────────────────────────────────────────────────────

export interface ExpressionContext {
    datasources?: Record<string, Record<string, unknown>[]>;
    currentRow?: Record<string, unknown>;
    parameters?: Record<string, unknown>;
    customFunctions?: CustomFunction[];
}

// ── Design-time Type Context ──────────────────────────────────────────────────

export interface ExpressionTypeContext {
    expectedReturnType?: ExpressionReturnType;
    availableDatasources?: Record<string, string[]>;
    availableParameters?: string[];
    availableFields?: string[];
    customFunctions?: CustomFunction[];
}

// ── Errors ────────────────────────────────────────────────────────────────────

export interface ExpressionError {
    message: string;
    position?: number;
    length?: number;
}

// ── Autocomplete ──────────────────────────────────────────────────────────────

export type SuggestionKind = 'datasource' | 'field' | 'parameter' | 'function' | 'keyword';

export interface AutocompleteSuggestion {
    label: string;
    kind: SuggestionKind;
    detail?: string;
    insertText?: string;
}
