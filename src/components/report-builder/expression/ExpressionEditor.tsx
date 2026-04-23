import classNames from 'classnames';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import './expression-editor.scss';
import {
    getAutocompleteSuggestions,
    highlightExpression,
    validateExpression,
} from './expression-parser';
import type { AutocompleteSuggestion, ExpressionReturnType, ExpressionTypeContext } from './expression-types';

const kindLabels: Record<string, string> = {
    function: 'fn',
    datasource: 'ds',
    field: 'fd',
    parameter: 'p',
    keyword: 'kw',
    builtin: 'bi',
};

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

    const effectiveTypeCtx = useMemo((): ExpressionTypeContext => ({
        ...typeContext,
        expectedReturnType: expectedReturnType ?? typeContext?.expectedReturnType,
    }), [typeContext, expectedReturnType]);

    const errors = useMemo(() => {
        if (!value.trim()) return [];
        return validateExpression(value, effectiveTypeCtx);
    }, [value, effectiveTypeCtx]);

    const highlighted = useMemo(() => highlightExpression(value), [value]);

    const suggestions = useMemo(() => {
        if (!showSuggestions) return [];
        return getAutocompleteSuggestions(value, cursorPos, effectiveTypeCtx);
    }, [showSuggestions, value, cursorPos, effectiveTypeCtx]);

    useEffect(() => {
        if (suggestions.length === 0) setSelectedIdx(0);
        else setSelectedIdx(0);
    }, [suggestions.length]);

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
                    applySuggestion(suggestions[selectedIdx]);
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
        [showSuggestions, suggestions, selectedIdx, applySuggestion],
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newValue = e.target.value;
            const pos = e.target.selectionStart ?? newValue.length;
            onChange(newValue);
            setCursorPos(pos);
            setShowSuggestions(newValue.trim().length > 0);
        },
        [onChange],
    );

    const handleSelect = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        setCursorPos((e.target as HTMLTextAreaElement).selectionStart ?? 0);
    }, []);

    const handleFocus = useCallback(() => {
        if (value.trim().length > 0) setShowSuggestions(true);
    }, [value]);

    const handleBlur = useCallback((e: React.FocusEvent) => {
        if (dropdownRef.current?.contains(e.relatedTarget as Node)) return;
        setTimeout(() => setShowSuggestions(false), 150);
    }, []);

    const errorId = `${inputId}-error`;
    const hasError = errors.length > 0;

    return (
        <div className={classNames('eui-expr-editor', className)}>
            <div
                className={classNames('eui-expr-editor-container', {
                    'has-error': hasError,
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
            </div>

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
                            className={classNames('eui-expr-editor-suggestion', { selected: i === selectedIdx })}
                            role="option"
                            aria-selected={i === selectedIdx}
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
