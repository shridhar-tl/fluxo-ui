import React, { useCallback, useId, useMemo, useRef, useState } from 'react';

import classNames from 'classnames';

import '../../eui-base.scss';
import './expression-editor.scss';
import { BookOpenIcon } from '../../../assets/icons';
import { OverlayPanel } from '../../overlay-panel/OverlayPanel';
import { expressionFunctions } from './builtin-functions';
import {
    getAutocompleteSuggestions,
    highlightExpression,
    validateExpression,
} from './expression-parser';
import type { AutocompleteSuggestion, BuiltinFunction, ExpressionReturnType, ExpressionTypeContext } from './expression-types';
import { FunctionReference } from './FunctionReference';
import { FunctionSignature } from './FunctionSignature';

const kindLabels: Record<string, string> = {
    function: 'fn',
    datasource: 'ds',
    field: 'fd',
    parameter: 'p',
    keyword: 'kw',
    builtin: 'bi',
};

interface ActiveCall {
    name: string;
    argIndex: number;
}

function findActiveCall(text: string): ActiveCall | null {
    const stack: ActiveCall[] = [];
    let quote: string | null = null;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quote) {
            if (ch === quote) quote = null;
            continue;
        }
        if (ch === '"' || ch === '\'') quote = ch;
        else if (ch === '(') stack.push({ name: /([A-Za-z_]\w*)\s*$/.exec(text.slice(0, i))?.[1] ?? '', argIndex: 0 });
        else if (ch === ',' && stack.length > 0) stack[stack.length - 1].argIndex += 1;
        else if (ch === ')') stack.pop();
    }
    return stack.length > 0 ? stack[stack.length - 1] : null;
}

function activeParamOf(fn: BuiltinFunction, argIndex: number): BuiltinFunction['params'][number] | undefined {
    const variadicIndex = fn.params.findIndex((p) => p.variadic);
    return fn.params[variadicIndex >= 0 && argIndex >= variadicIndex ? variadicIndex : argIndex];
}

interface ExpressionEditorProps {
    value: string;
    onChange: (value: string) => void;
    typeContext?: ExpressionTypeContext;
    expectedReturnType?: ExpressionReturnType;
    placeholder?: string;
    multiline?: boolean;
    readOnly?: boolean;
    className?: string;
    id?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
}

export const ExpressionEditor: React.FC<ExpressionEditorProps> = ({
    value,
    onChange,
    typeContext,
    expectedReturnType,
    placeholder = 'Enter expression...',
    multiline = false,
    readOnly = false,
    className,
    id: externalId,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
}) => {
    const generatedId = useId();
    const inputId = externalId ?? generatedId;
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [cursorPos, setCursorPos] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [focused, setFocused] = useState(false);
    const [referenceOpen, setReferenceOpen] = useState(false);
    const [referenceButton, setReferenceButton] = useState<HTMLButtonElement | null>(null);

    const effectiveTypeCtx = useMemo((): ExpressionTypeContext => ({
        ...typeContext,
        expectedReturnType: expectedReturnType ?? typeContext?.expectedReturnType,
    }), [typeContext, expectedReturnType]);

    const errors = useMemo(() => {
        if (!value.trim()) return [];
        return validateExpression(value, effectiveTypeCtx);
    }, [value, effectiveTypeCtx]);

    const highlighted = useMemo(() => highlightExpression(value), [value]);

    const functions = useMemo(() => expressionFunctions(effectiveTypeCtx.customFunctions), [effectiveTypeCtx.customFunctions]);

    const signatureHelp = useMemo(() => {
        if (!focused || readOnly) return null;
        const call = findActiveCall(value.slice(0, cursorPos));
        const name = call?.name.toLowerCase();
        const fn = name ? functions.find((f) => f.name.toLowerCase() === name) : undefined;
        if (!call || !fn) return null;
        return { fn, argIndex: call.argIndex, param: activeParamOf(fn, call.argIndex) };
    }, [focused, readOnly, value, cursorPos, functions]);

    const suggestions = useMemo(() => {
        if (!showSuggestions) return [];
        return getAutocompleteSuggestions(value, cursorPos, effectiveTypeCtx);
    }, [showSuggestions, value, cursorPos, effectiveTypeCtx]);

    const activeIdx = selectedIdx < suggestions.length ? selectedIdx : 0;

    const applySuggestion = useCallback(
        (suggestion: AutocompleteSuggestion) => {
            const insertText = suggestion.insertText ?? suggestion.label;
            const before = value.slice(0, cursorPos);
            const after = value.slice(cursorPos);
            const lastDot = before.lastIndexOf('.');
            const lastWordStart = before.search(/[\w.]+$/);
            const prefix = before.slice(0, lastWordStart < 0 ? before.length : lastWordStart);

            const partial = before.slice(lastDot + 1);
            const isAfterDot = lastDot >= 0 && before.slice(lastDot + 1) === partial;

            let newValue: string;
            if (isAfterDot && ['datasource', 'field', 'parameter'].includes(suggestion.kind)) {
                newValue = prefix + insertText + after;
            } else {
                const identStart = before.search(/\w+$/);
                const base = identStart >= 0 ? before.slice(0, identStart) : before;
                newValue = base + insertText + after;
            }

            onChange(newValue);
            setShowSuggestions(false);
            const newCursor = newValue.length - after.length;
            requestAnimationFrame(() => {
                if (inputRef.current) {
                    inputRef.current.selectionStart = newCursor;
                    inputRef.current.selectionEnd = newCursor;
                    inputRef.current.focus();
                }
            });
        },
        [value, cursorPos, onChange],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (showSuggestions && suggestions.length > 0) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIdx((i) => (i + 1) % suggestions.length);
                    return;
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIdx((i) => (i - 1 + suggestions.length) % suggestions.length);
                    return;
                }
                if (e.key === 'Enter' || e.key === 'Tab') {
                    e.preventDefault();
                    applySuggestion(suggestions[activeIdx]);
                    return;
                }
                if (e.key === 'Escape') {
                    e.preventDefault();
                    setShowSuggestions(false);
                    return;
                }
            } else if (e.key === 'Escape') {
                setShowSuggestions(false);
            }
        },
        [showSuggestions, suggestions, activeIdx, applySuggestion],
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newValue = e.target.value;
            const pos = e.target.selectionStart ?? newValue.length;
            onChange(newValue);
            setCursorPos(pos);
            setSelectedIdx(0);
            setShowSuggestions(newValue.trim().length > 0);
        },
        [onChange],
    );

    const handleSelect = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        setCursorPos((e.target as HTMLTextAreaElement).selectionStart ?? 0);
    }, []);

    const handleFocus = useCallback(() => {
        setFocused(true);
        if (value.trim().length > 0) setShowSuggestions(true);
    }, [value]);

    const handleBlur = useCallback((e: React.FocusEvent) => {
        setFocused(false);
        if (dropdownRef.current?.contains(e.relatedTarget as Node)) return;
        setTimeout(() => setShowSuggestions(false), 150);
    }, []);

    const closeReference = useCallback(() => setReferenceOpen(false), []);

    const insertFunction = useCallback(
        (fn: BuiltinFunction) => {
            const call = fn.params.length === 0 ? `${fn.name}()` : `${fn.name}(`;
            const newValue = value.slice(0, cursorPos) + call + value.slice(cursorPos);
            const newCursor = cursorPos + call.length;
            onChange(newValue);
            setCursorPos(newCursor);
            setReferenceOpen(false);
            requestAnimationFrame(() => {
                if (!inputRef.current) return;
                inputRef.current.focus();
                inputRef.current.selectionStart = newCursor;
                inputRef.current.selectionEnd = newCursor;
            });
        },
        [value, cursorPos, onChange],
    );

    const errorId = `${inputId}-error`;
    const hasError = errors.length > 0;

    return (
        <div className={classNames('eui-expr-editor', className)}>
            <div
                className={classNames('eui-expr-editor-container', {
                    'has-error': hasError,
                    'has-reference': !readOnly,
                    multiline,
                })}
            >
                <div
                    className="eui-expr-editor-highlight"
                    aria-hidden="true"
                    style={multiline ? undefined : { whiteSpace: 'pre', overflowX: 'hidden' }}
                >
                    {highlighted.map((part, i) => (
                        <span key={i} className={part.className}>{part.text}</span>
                    ))}
                    {'\u00A0'}
                </div>
                <textarea
                    ref={inputRef}
                    id={inputId}
                    className={classNames('eui-expr-editor-input', { multiline })}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onSelect={handleSelect}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    rows={multiline ? 4 : 1}
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledBy}
                    aria-describedby={classNames(ariaDescribedBy, { [errorId]: hasError }) || undefined}
                    aria-invalid={hasError || undefined}
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions && suggestions.length > 0}
                    aria-controls={showSuggestions ? `${inputId}-suggestions` : undefined}
                    style={{
                        caretColor: 'var(--eui-text)',
                        color: 'transparent',
                        height: multiline ? undefined : 34,
                        minHeight: multiline ? 80 : 34,
                    }}
                />
                {!readOnly && (
                    <button
                        ref={setReferenceButton}
                        type="button"
                        className={classNames('eui-expr-editor-reference-btn', { active: referenceOpen })}
                        onClick={() => setReferenceOpen((v) => !v)}
                        aria-label="Function reference"
                        aria-haspopup="dialog"
                        aria-expanded={referenceOpen}
                        title="Function reference: every function you can use, with its parameters"
                    >
                        <BookOpenIcon aria-hidden="true" />
                    </button>
                )}
            </div>

            {signatureHelp && (
                <div className="eui-expr-editor-signature" role="status">
                    <FunctionSignature fn={signatureHelp.fn} activeParam={signatureHelp.argIndex} />
                    {signatureHelp.param?.description && (
                        <div className="eui-expr-editor-signature-param">
                            <strong>{signatureHelp.param.name}</strong>: {signatureHelp.param.description}
                        </div>
                    )}
                </div>
            )}

            {referenceOpen && (
                <OverlayPanel
                    isOpen={referenceOpen}
                    target={referenceButton}
                    onClose={closeReference}
                    title="Functions"
                    placement="auto"
                    width="26rem"
                    maxHeight="34rem"
                    className="eui-expr-fn-panel"
                >
                    <FunctionReference functions={functions} onInsert={insertFunction} autoFocusSearch />
                </OverlayPanel>
            )}

            {hasError && (
                <div className="eui-expr-editor-error" id={errorId} role="alert">
                    {errors[0].message}
                </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="eui-expr-editor-dropdown"
                    id={`${inputId}-suggestions`}
                    role="listbox"
                    aria-label="Suggestions"
                >
                    {suggestions.map((s, i) => (
                        <div
                            key={`${s.kind}-${s.label}`}
                            className={classNames('eui-expr-editor-suggestion', { selected: i === activeIdx })}
                            role="option"
                            aria-selected={i === activeIdx}
                            onMouseDown={(e) => { e.preventDefault(); applySuggestion(s); }}
                            onMouseEnter={() => setSelectedIdx(i)}
                        >
                            <div
                                className={classNames('eui-expr-editor-suggestion-icon', `kind-${s.kind}`)}
                                aria-hidden="true"
                            >
                                {kindLabels[s.kind]}
                            </div>
                            <span className="eui-expr-editor-suggestion-label">{s.label}</span>
                            {s.detail && (
                                <span className="eui-expr-editor-suggestion-detail">{s.detail}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

ExpressionEditor.displayName = 'ExpressionEditor';
