export { ExpressionEditor } from './ExpressionEditor';
export { builtinFunctions, evaluateExpression, getAutocompleteSuggestions, highlightExpression, interpolateTemplate, parseExpression, safeGetByPath, validateExpression } from './expression-parser';
export { registerFunctions, getRegisteredFunctions, clearRegisteredFunctions } from './function-registry';
export type {
    AutocompleteSuggestion,
    BuiltinFunction,
    CustomFunction,
    ExpressionContext,
    ExpressionError,
    ExpressionNode,
    ExpressionReturnType,
    ExpressionTypeContext,
    FunctionParam,
    SuggestionKind,
} from './expression-types';
