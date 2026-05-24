import classNames from 'classnames';
import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { BaseComponentProps, ComponentEvent } from '../types';
import { generateId, getComponentClasses, getComponentStyles, splitBaseAndNativeProps } from '../utils';
import './eui-base.scss';
import './MaskedInput.scss';

/**
 * Mask character definitions:
 *   '9' - digit (0-9)
 *   'a' - letter (a-z, A-Z)
 *   '*' - alphanumeric (a-z, A-Z, 0-9)
 *   Any other character - treated as a literal separator
 */
export type MaskedInputPreset = 'phone' | 'phone-us' | 'phone-intl' | 'date' | 'date-us' | 'ssn' | 'credit-card' | 'zip' | 'zip-plus4' | 'time';

const PRESET_MASKS: Record<MaskedInputPreset, string> = {
    'phone': '(999) 999-9999',
    'phone-us': '(999) 999-9999',
    'phone-intl': '+99 999 999 9999',
    'date': '99/99/9999',
    'date-us': '99/99/9999',
    'ssn': '999-99-9999',
    'credit-card': '9999 9999 9999 9999',
    'zip': '99999',
    'zip-plus4': '99999-9999',
    'time': '99:99',
};

const PRESET_DESCRIPTIONS: Record<MaskedInputPreset, string> = {
    'phone': 'Phone number, format: (123) 456-7890',
    'phone-us': 'US phone number, format: (123) 456-7890',
    'phone-intl': 'International phone number, format: +12 345 678 9012',
    'date': 'Date, format: MM/DD/YYYY',
    'date-us': 'Date, format: MM/DD/YYYY',
    'ssn': 'Social Security Number, format: 123-45-6789',
    'credit-card': 'Credit card number, format: 1234 5678 9012 3456',
    'zip': 'ZIP code, format: 12345',
    'zip-plus4': 'ZIP+4 code, format: 12345-6789',
    'time': 'Time, format: HH:MM',
};

export interface MaskedInputProps
    extends BaseComponentProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'value'> {
    /** The mask pattern. Use '9' for digit, 'a' for letter, '*' for alphanumeric, any other char as literal separator. Either mask or preset must be provided */
    mask?: string;
    /** Built-in mask preset that auto-fills mask and a format hint */
    preset?: MaskedInputPreset;
    /** Format hint string (auto-derived from preset). Linked via aria-describedby for SR users */
    formatHint?: string;
    /** Current value (raw unmasked, or masked - component normalises it) */
    value?: string;
    onChange?: (event: ComponentEvent<string>) => void;
    /** Character shown for empty mask slots */
    slotChar?: string;
    placeholder?: string;
    required?: boolean;
    readonly?: boolean;
    autoFocus?: boolean;
    id?: string;
    /** Called with the raw (unmasked) value when it changes */
    onRawChange?: (raw: string, masked: string) => void;
    /** Whether to include literal separator characters in the onChange value */
    includeLiterals?: boolean;
    error?: string | boolean;
    invalid?: boolean;
    helperText?: React.ReactNode;
}

const MASK_DIGIT = '9';
const MASK_LETTER = 'a';
const MASK_ALPHANUMERIC = '*';

function isMaskChar(ch: string): boolean {
    return ch === MASK_DIGIT || ch === MASK_LETTER || ch === MASK_ALPHANUMERIC;
}

function matchesMask(ch: string, maskCh: string): boolean {
    if (maskCh === MASK_DIGIT) return /\d/.test(ch);
    if (maskCh === MASK_LETTER) return /[a-zA-Z]/.test(ch);
    if (maskCh === MASK_ALPHANUMERIC) return /[a-zA-Z0-9]/.test(ch);
    return false;
}

/** Count total editable slots in the mask */
function countSlots(mask: string): number {
    return [...mask].filter(isMaskChar).length;
}

/**
 * Internal state: a fixed-length array of (char | null) for each editable slot.
 * null means the slot is empty.
 */
type SlotArray = (string | null)[];

/** Build display string from slot array and mask */
function applyMask(slots: SlotArray, mask: string, slotChar: string): string {
    let slotIdx = 0;
    let result = '';
    for (let i = 0; i < mask.length; i++) {
        if (isMaskChar(mask[i])) {
            result += slots[slotIdx] ?? slotChar;
            slotIdx++;
        } else {
            result += mask[i];
        }
    }
    return result;
}

/** Map a mask position to slot index (counts editable slots before pos) */
function maskPosToSlotIdx(mask: string, maskPos: number): number {
    let count = 0;
    for (let i = 0; i < maskPos && i < mask.length; i++) {
        if (isMaskChar(mask[i])) count++;
    }
    return count;
}

/** Shift chars left from fromSlotIdx onward, filling the gap, leaving tail as null */
function shiftLeft(slots: SlotArray, fromSlotIdx: number): SlotArray {
    const newSlots = [...slots];
    for (let i = fromSlotIdx; i < newSlots.length - 1; i++) {
        newSlots[i] = newSlots[i + 1];
    }
    newSlots[newSlots.length - 1] = null;
    return newSlots;
}

/** Clear slots in the range [fromSlotIdx, toSlotIdx) and shift remaining left */
function deleteSlotRange(slots: SlotArray, fromSlotIdx: number, toSlotIdx: number): SlotArray {
    const count = toSlotIdx - fromSlotIdx;
    let newSlots = [...slots];
    for (let i = 0; i < count; i++) {
        newSlots = shiftLeft(newSlots, fromSlotIdx);
    }
    return newSlots;
}

/** Get slot index range covered by a mask selection [selStart, selEnd) */
function selectionToSlotRange(mask: string, selStart: number, selEnd: number): [number, number] {
    let startSi = maskPosToSlotIdx(mask, selStart);
    let endSi = maskPosToSlotIdx(mask, selEnd);
    // if selEnd lands right after a separator that is still inside the range, include it
    // endSi is already exclusive (chars before selEnd), so this is correct
    return [startSi, endSi];
}

/** Map a slot index to its mask position */
function slotIdxToMaskPos(mask: string, slotIdx: number): number {
    let count = 0;
    for (let i = 0; i < mask.length; i++) {
        if (isMaskChar(mask[i])) {
            if (count === slotIdx) return i;
            count++;
        }
    }
    return mask.length;
}

/** Find the next editable slot mask position >= from */
function nextEditablePos(mask: string, from: number): number {
    for (let i = from; i < mask.length; i++) {
        if (isMaskChar(mask[i])) return i;
    }
    return mask.length;
}

/** Find the previous editable slot mask position <= from */
function prevEditablePos(mask: string, from: number): number {
    for (let i = from; i >= 0; i--) {
        if (isMaskChar(mask[i])) return i;
    }
    return -1;
}

/** Parse a value string (masked or raw) into a fixed-length SlotArray */
function parseValue(val: string, mask: string, slotChar: string): SlotArray {
    const total = countSlots(mask);
    const slots: SlotArray = new Array(total).fill(null);

    if (!val) return slots;

    // Walk the mask and value together, extracting chars for editable slots
    let slotIdx = 0;
    let valIdx = 0;

    for (let maskIdx = 0; maskIdx < mask.length && valIdx < val.length && slotIdx < total; maskIdx++) {
        const maskCh = mask[maskIdx];
        const valCh = val[valIdx];

        if (isMaskChar(maskCh)) {
            // This position expects a data char
            if (valCh && valCh !== slotChar && matchesMask(valCh, maskCh)) {
                slots[slotIdx] = valCh;
            }
            // Whether we consumed it or not, advance both
            slotIdx++;
            valIdx++;
        } else {
            // Literal separator - skip it in the value if it matches
            if (valCh === maskCh) {
                valIdx++;
            }
            // If val doesn't have the separator, just advance mask and try again at same valIdx
        }
    }

    return slots;
}

/** Build emit value from slots */
function buildEmitValue(slots: SlotArray, mask: string, slotChar: string, includeLiterals: boolean): string {
    if (includeLiterals) {
        return applyMask(slots, mask, slotChar);
    }
    return slots.filter((s) => s !== null).join('');
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
    (
        {
            mask: maskProp,
            preset,
            formatHint,
            value = '',
            onChange,
            onRawChange,
            slotChar = '_',
            placeholder,
            required = false,
            readonly = false,
            autoFocus = false,
            id,
            disabled = false,
            className,
            name,
            args,
            includeLiterals = true,
            error,
            invalid,
            helperText,
            'aria-describedby': ariaDescribedBy,
            ...rest
        },
        ref,
    ) => {
        const { styleProps: baseProps, nativeProps } = splitBaseAndNativeProps(rest);
        const mask = maskProp || (preset ? PRESET_MASKS[preset] : '');
        if (!mask) {
            throw new Error('MaskedInput requires either a "mask" or "preset" prop');
        }
        const resolvedFormatHint = formatHint || (preset ? PRESET_DESCRIPTIONS[preset] : undefined);

        const [inputId] = useState(id || generateId());
        const internalRef = useRef<HTMLInputElement>(null);
        const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef;
        const liveRegionRef = useRef<HTMLSpanElement>(null);

        const totalSlots = countSlots(mask);

        const [slots, setSlots] = useState<SlotArray>(() => parseValue(value, mask, slotChar));
        const [rejectMessage, setRejectMessage] = useState<string>('');
        const rejectTimerRef = useRef<number | null>(null);

        const announceReject = useCallback((maskCh: string) => {
            const expectedLabel =
                maskCh === MASK_DIGIT
                    ? 'a digit'
                    : maskCh === MASK_LETTER
                        ? 'a letter'
                        : 'a letter or digit';
            const msg = `Expected ${expectedLabel}`;
            setRejectMessage(msg);
            if (rejectTimerRef.current !== null) {
                window.clearTimeout(rejectTimerRef.current);
            }
            rejectTimerRef.current = window.setTimeout(() => setRejectMessage(''), 1500);
        }, []);

        useEffect(() => {
            return () => {
                if (rejectTimerRef.current !== null) {
                    window.clearTimeout(rejectTimerRef.current);
                }
            };
        }, []);

        // Track the last value we emitted so we don't re-parse our own emissions
        const lastEmittedRef = useRef<string>('');

        // Sync external value changes (only when value changes from outside)
        useEffect(() => {
            if (value === lastEmittedRef.current) return;
            setSlots(parseValue(value, mask, slotChar));
        }, [value, mask, slotChar]);

        const maskedValue = applyMask(slots, mask, slotChar);

        const emitChange = useCallback(
            (newSlots: SlotArray, e?: React.SyntheticEvent) => {
                const raw = newSlots.filter((s) => s !== null).join('');
                const masked = applyMask(newSlots, mask, slotChar);
                const emitValue = buildEmitValue(newSlots, mask, slotChar, includeLiterals);

                lastEmittedRef.current = emitValue;
                onRawChange?.(raw, masked);
                onChange?.({ event: e, value: emitValue, name, args });
            },
            [mask, slotChar, includeLiterals, onChange, onRawChange, name, args],
        );

        const setCursorTo = useCallback(
            (maskPos: number) => {
                requestAnimationFrame(() => {
                    inputRef.current?.setSelectionRange(maskPos, maskPos);
                });
            },
            [inputRef],
        );

        const handleKeyDown = useCallback(
            (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (disabled || readonly) return;

                const input = inputRef.current!;
                const cursorPos = input.selectionStart ?? 0;
                const selEnd = input.selectionEnd ?? cursorPos;
                const hasSelection = selEnd > cursorPos;

                if (e.key === 'Backspace') {
                    e.preventDefault();
                    if (hasSelection) {
                        const [fromSi, toSi] = selectionToSlotRange(mask, cursorPos, selEnd);
                        if (fromSi >= toSi) return;
                        const newSlots = deleteSlotRange(slots, fromSi, toSi);
                        setSlots(newSlots);
                        emitChange(newSlots, e);
                        setCursorTo(slotIdxToMaskPos(mask, fromSi));
                    } else {
                        const maskPos = prevEditablePos(mask, cursorPos - 1);
                        if (maskPos < 0) return;
                        const si = maskPosToSlotIdx(mask, maskPos);
                        const newSlots = shiftLeft(slots, si);
                        setSlots(newSlots);
                        emitChange(newSlots, e);
                        setCursorTo(maskPos);
                    }
                } else if (e.key === 'Delete') {
                    e.preventDefault();
                    if (hasSelection) {
                        const [fromSi, toSi] = selectionToSlotRange(mask, cursorPos, selEnd);
                        if (fromSi >= toSi) return;
                        const newSlots = deleteSlotRange(slots, fromSi, toSi);
                        setSlots(newSlots);
                        emitChange(newSlots, e);
                        setCursorTo(slotIdxToMaskPos(mask, fromSi));
                    } else {
                        const maskPos = nextEditablePos(mask, cursorPos);
                        if (maskPos >= mask.length) return;
                        const si = maskPosToSlotIdx(mask, maskPos);
                        const newSlots = shiftLeft(slots, si);
                        setSlots(newSlots);
                        emitChange(newSlots, e);
                        setCursorTo(maskPos);
                    }
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prev = prevEditablePos(mask, cursorPos - 1);
                    if (prev >= 0) setCursorTo(prev);
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    const next = nextEditablePos(mask, cursorPos + 1);
                    setCursorTo(next);
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    setCursorTo(nextEditablePos(mask, 0));
                } else if (e.key === 'End') {
                    e.preventDefault();
                    // Move to just after the last filled slot
                    let lastFilledMaskPos = -1;
                    let si = 0;
                    for (let i = 0; i < mask.length; i++) {
                        if (isMaskChar(mask[i])) {
                            if (slots[si] !== null) lastFilledMaskPos = i;
                            si++;
                        }
                    }
                    const endPos = lastFilledMaskPos >= 0 ? nextEditablePos(mask, lastFilledMaskPos + 1) : nextEditablePos(mask, 0);
                    setCursorTo(endPos);
                }
            },
            [disabled, readonly, mask, slots, inputRef, emitChange, setCursorTo],
        );

        const handleKeyDown_char = useCallback(
            (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (disabled || readonly) return;

                const ch = e.key;
                if (ch.length !== 1) return; // not a printable char
                if (e.ctrlKey || e.metaKey || e.altKey) return;

                e.preventDefault();

                const input = inputRef.current!;
                const cursorPos = input.selectionStart ?? 0;
                const selEnd = input.selectionEnd ?? cursorPos;
                const hasSelection = selEnd > cursorPos;

                // If there's a selection, delete it first then type into that position
                let workingSlots = slots;
                let insertMaskPos = cursorPos;
                if (hasSelection) {
                    const [fromSi, toSi] = selectionToSlotRange(mask, cursorPos, selEnd);
                    if (fromSi < toSi) {
                        workingSlots = deleteSlotRange(slots, fromSi, toSi);
                    }
                    insertMaskPos = slotIdxToMaskPos(mask, fromSi);
                }

                // Find the next editable slot at or after insert position
                const maskPos = nextEditablePos(mask, insertMaskPos);
                if (maskPos >= mask.length) return;

                if (!matchesMask(ch, mask[maskPos])) {
                    announceReject(mask[maskPos]);
                    return;
                }

                const si = maskPosToSlotIdx(mask, maskPos);
                const newSlots = [...workingSlots];
                newSlots[si] = ch;
                setSlots(newSlots);
                emitChange(newSlots, e);

                // Move cursor to next editable slot after this one
                const nextPos = nextEditablePos(mask, maskPos + 1);
                setCursorTo(nextPos);
            },
            [disabled, readonly, mask, slots, inputRef, emitChange, setCursorTo, announceReject],
        );

        const handleKeyDownCombined = useCallback(
            (e: React.KeyboardEvent<HTMLInputElement>) => {
                // Handle navigation / delete keys first
                if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'].includes(e.key)) {
                    handleKeyDown(e);
                } else {
                    handleKeyDown_char(e);
                }
            },
            [handleKeyDown, handleKeyDown_char],
        );

        const handleFocus = useCallback(
            (e: React.FocusEvent<HTMLInputElement>) => {
                // Move cursor to the first empty slot
                for (let si = 0; si < totalSlots; si++) {
                    if (slots[si] === null) {
                        const maskPos = slotIdxToMaskPos(mask, si);
                        requestAnimationFrame(() => e.target.setSelectionRange(maskPos, maskPos));
                        return;
                    }
                }
                // All filled — put cursor at end
                requestAnimationFrame(() => e.target.setSelectionRange(mask.length, mask.length));
            },
            [mask, slots, totalSlots],
        );

        const handleClick = useCallback(
            (e: React.MouseEvent<HTMLInputElement>) => {
                const input = e.currentTarget;
                const clicked = input.selectionStart ?? 0;
                // Snap to nearest editable slot
                const next = nextEditablePos(mask, clicked);
                const prev = prevEditablePos(mask, clicked - 1);
                let snap: number;
                if (next < mask.length && (prev < 0 || next - clicked <= clicked - prev)) {
                    snap = next;
                } else if (prev >= 0) {
                    snap = prev + 1;
                } else {
                    snap = next < mask.length ? next : mask.length;
                }
                requestAnimationFrame(() => input.setSelectionRange(snap, snap));
            },
            [mask],
        );

        const handlePaste = useCallback(
            (e: React.ClipboardEvent<HTMLInputElement>) => {
                e.preventDefault();
                if (disabled || readonly) return;

                const pasted = e.clipboardData.getData('text');
                const input = inputRef.current!;
                const cursorPos = input.selectionStart ?? 0;

                const newSlots = [...slots];
                let maskPos = nextEditablePos(mask, cursorPos);

                for (const ch of pasted) {
                    if (maskPos >= mask.length) break;
                    if (matchesMask(ch, mask[maskPos])) {
                        const si = maskPosToSlotIdx(mask, maskPos);
                        newSlots[si] = ch;
                        maskPos = nextEditablePos(mask, maskPos + 1);
                    }
                }

                setSlots(newSlots);
                emitChange(newSlots, e);
                setCursorTo(maskPos);
            },
            [disabled, readonly, mask, slots, inputRef, emitChange, setCursorTo],
        );

        const errorMessage = typeof error === 'string' ? error : undefined;
        const hasError = invalid === true || error === true || (typeof error === 'string' && error.length > 0);
        const helperId = helperText ? `${inputId}-helper` : undefined;
        const errorId = errorMessage ? `${inputId}-error` : undefined;
        const formatId = resolvedFormatHint ? `${inputId}-format` : undefined;
        const liveId = `${inputId}-live`;
        const describedBy = [ariaDescribedBy, formatId, helperId, errorId].filter(Boolean).join(' ') || undefined;
        const ariaInvalid = hasError
            ? 'true'
            : (required && slots.every((s) => s === null) ? 'true' : 'false');

        const componentClasses = getComponentClasses(
            { ...baseProps, disabled, className: classNames(className, { 'eui-masked-input-error': hasError }) },
            classNames('eui-masked-input', {
                'eui-masked-input-readonly': readonly,
                'eui-masked-input-disabled': disabled,
            }),
        );

        const componentStyles = getComponentStyles({ ...baseProps, disabled });
        delete componentStyles.padding;
        delete componentStyles.height;
        delete componentStyles.fontSize;

        return (
            <span className="eui-masked-input-wrap-outer">
                <input
                    {...nativeProps}
                    ref={inputRef}
                    id={inputId}
                    name={name}
                    type="text"
                    value={maskedValue}
                    onChange={(e) => {
                        nativeProps.onChange?.(e);
                    }}
                    onKeyDown={(e) => {
                        nativeProps.onKeyDown?.(e);
                        handleKeyDownCombined(e);
                    }}
                    onFocus={(e) => {
                        nativeProps.onFocus?.(e);
                        handleFocus(e);
                    }}
                    onClick={(e) => {
                        nativeProps.onClick?.(e);
                        handleClick(e);
                    }}
                    onPaste={(e) => {
                        nativeProps.onPaste?.(e);
                        handlePaste(e);
                    }}
                    placeholder={placeholder ?? mask}
                    required={required}
                    readOnly={readonly || disabled}
                    autoFocus={autoFocus}
                    disabled={disabled}
                    className={componentClasses}
                    style={{ ...nativeProps.style, ...componentStyles }}
                    aria-invalid={ariaInvalid}
                    aria-required={required}
                    aria-describedby={describedBy}
                    aria-errormessage={errorId}
                    autoComplete="off"
                    spellCheck={false}
                />
                {resolvedFormatHint && (
                    <span id={formatId} className="eui-masked-input-format-hint">
                        {resolvedFormatHint}
                    </span>
                )}
                {helperText && !errorMessage && (
                    <span id={helperId} className="eui-masked-input-helper">
                        {helperText}
                    </span>
                )}
                {errorMessage && (
                    <span id={errorId} className="eui-masked-input-error-message" role="alert">
                        {errorMessage}
                    </span>
                )}
                <span ref={liveRegionRef} id={liveId} className="eui-visually-hidden" aria-live="polite" role="status">
                    {rejectMessage}
                </span>
            </span>
        );
    },
);

MaskedInput.displayName = 'MaskedInput';
