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
    path?: string[];
    returnType: 'any';
}

export interface FieldRefNode {
    type: 'FieldRef';
    field: string;
    returnType: 'any';
}

export type RowOrColGroupProperty =
    | { kind: 'key' }
    | { kind: 'keys' }
    | { kind: 'values' }
    | { kind: 'field'; field: string }
    | { kind: 'variable'; name: string };

export interface RowGroupRefNode {
    type: 'RowGroupRef';
    groupName: string;
    property: RowOrColGroupProperty;
    returnType: 'any';
}

export interface ColGroupRefNode {
    type: 'ColGroupRef';
    groupName: string;
    property: RowOrColGroupProperty;
    returnType: 'any';
}

export interface VariableRefNode {
    type: 'VariableRef';
    name: string;
    path?: string[];
    returnType: 'any';
}

export interface BuiltInFieldRefNode {
    type: 'BuiltInFieldRef';
    name: string;
    path?: string[];
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
    | RowGroupRefNode
    | ColGroupRefNode
    | VariableRefNode
    | BuiltInFieldRefNode
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

export interface GroupFrame {
    name: string;
    key?: unknown;
    keys?: unknown[];
    values?: Record<string, unknown>[];
    fields?: Record<string, unknown>;
    variables?: Record<string, unknown>;
}

export interface ExpressionContext {
    datasources?: Record<string, Record<string, unknown>[]>;
    currentRow?: Record<string, unknown>;
    parameters?: Record<string, unknown>;
    customFunctions?: CustomFunction[];
    rowGroups?: Record<string, GroupFrame>;
    colGroups?: Record<string, GroupFrame>;
    variables?: Record<string, unknown>;
    /**
     * Built-in fields are read-only values made available under the `BuiltInFields.*` namespace
     * in expressions. They combine:
     *   1. Values registered via `initReportBuilder({ builtInFields })` (library-wide defaults / host-provided).
     *   2. Values passed to `ReportBuilder` / `ReportViewer` via the `builtInFields` prop (override per-instance).
     * Each entry is either a constant or a zero-arg getter; the engine resolves getters lazily per evaluation.
     */
    builtInFields?: Record<string, unknown>;
}

// ── Design-time Type Context ──────────────────────────────────────────────────

export interface ExpressionTypeContext {
    expectedReturnType?: ExpressionReturnType;
    availableDatasources?: Record<string, string[]>;
    availableParameters?: string[];
    availableFields?: string[];
    availableRowGroups?: string[];
    availableColGroups?: string[];
    availableVariables?: string[];
    availableBuiltInFields?: string[];
    customFunctions?: CustomFunction[];
}

// ── Errors ────────────────────────────────────────────────────────────────────

export interface ExpressionError {
    message: string;
    position?: number;
    length?: number;
}

// ── Autocomplete ──────────────────────────────────────────────────────────────

export type SuggestionKind = 'datasource' | 'field' | 'parameter' | 'function' | 'keyword' | 'builtin';

export interface AutocompleteSuggestion {
    label: string;
    kind: SuggestionKind;
    detail?: string;
    insertText?: string;
}
