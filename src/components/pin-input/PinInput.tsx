import cn from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../eui-base.scss';
import './PinInput.scss';

type PinInputVariant = 'box' | 'underline' | 'soft';
type PinInputSize = 'sm' | 'md' | 'lg';
type PinInputType = 'numeric' | 'alphanumeric' | 'password';

interface PinInputProps {
    length?: number;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onComplete?: (value: string) => void;
    type?: PinInputType;
    mask?: boolean;
    variant?: PinInputVariant;
    size?: PinInputSize;
    disabled?: boolean;
    autoFocus?: boolean;
    placeholder?: string;
    groupAfter?: number;
    invalid?: boolean;
    name?: string;
    className?: string;
    ariaLabel?: string;
}

const sanitize = (raw: string, type: PinInputType) => {
    if (type === 'numeric') return raw.replace(/\D/g, '');
    if (type === 'alphanumeric') return raw.replace(/[^a-zA-Z0-9]/g, '');
    return raw;
};

const PinInput: React.FC<PinInputProps> = ({
    length = 6,
    value,
    defaultValue = '',
    onChange,
    onComplete,
    type = 'numeric',
    mask = false,
    variant = 'box',
    size = 'md',
    disabled = false,
    autoFocus = false,
    placeholder = '',
    groupAfter,
    invalid = false,
    name,
    className,
    ariaLabel = 'Verification code',
}) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(() => sanitize(defaultValue, type).slice(0, length));
    const currentValue = isControlled ? sanitize(value!, type).slice(0, length) : internalValue;
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const completionFiredRef = useRef(false);

    const chars = useMemo(() => {
        const out: string[] = Array.from({ length }, (_, i) => currentValue[i] ?? '');
        return out;
    }, [currentValue, length]);

    const setValue = useCallback(
        (next: string) => {
            const cleaned = sanitize(next, type).slice(0, length);
            if (!isControlled) setInternalValue(cleaned);
            onChange?.(cleaned);
            if (cleaned.length === length && !completionFiredRef.current) {
                completionFiredRef.current = true;
                onComplete?.(cleaned);
            }
            if (cleaned.length < length) {
                completionFiredRef.current = false;
            }
        },
        [isControlled, length, onChange, onComplete, type],
    );

    useEffect(() => {
        if (autoFocus) {
            inputsRef.current[0]?.focus();
        }
    }, [autoFocus]);

    const focusIndex = (idx: number) => {
        const clamped = Math.max(0, Math.min(idx, length - 1));
        const node = inputsRef.current[clamped];
        node?.focus();
        node?.select?.();
    };

    const handleChange = (idx: number, raw: string) => {
        const cleaned = sanitize(raw, type);
        if (cleaned.length === 0) {
            const next = chars.slice();
            next[idx] = '';
            setValue(next.join(''));
            return;
        }
        if (cleaned.length === 1) {
            const next = chars.slice();
            next[idx] = cleaned;
            setValue(next.join(''));
            focusIndex(idx + 1);
            return;
        }
        // Multi-char (paste landed in single field): distribute starting at idx
        const next = chars.slice();
        for (let i = 0; i < cleaned.length && idx + i < length; i += 1) {
            next[idx + i] = cleaned[i];
        }
        const combined = next.join('');
        setValue(combined);
        const focusAt = Math.min(idx + cleaned.length, length - 1);
        focusIndex(focusAt);
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;
        if (e.key === 'Backspace') {
            if (chars[idx]) {
                const next = chars.slice();
                next[idx] = '';
                setValue(next.join(''));
                return;
            }
            if (idx > 0) {
                const next = chars.slice();
                next[idx - 1] = '';
                setValue(next.join(''));
                focusIndex(idx - 1);
            }
            e.preventDefault();
            return;
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            focusIndex(idx - 1);
            return;
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            focusIndex(idx + 1);
            return;
        }
        if (e.key === 'Home') {
            e.preventDefault();
            focusIndex(0);
            return;
        }
        if (e.key === 'End') {
            e.preventDefault();
            focusIndex(length - 1);
        }
    };

    const handlePaste = (idx: number, e: React.ClipboardEvent<HTMLInputElement>) => {
        if (disabled) return;
        const pasted = e.clipboardData.getData('text');
        if (!pasted) return;
        e.preventDefault();
        const cleaned = sanitize(pasted, type);
        if (!cleaned) return;
        const next = chars.slice();
        for (let i = 0; i < cleaned.length && idx + i < length; i += 1) {
            next[idx + i] = cleaned[i];
        }
        const combined = next.join('');
        setValue(combined);
        const focusAt = Math.min(idx + cleaned.length, length - 1);
        focusIndex(focusAt);
    };

    const inputMode: React.HTMLAttributes<HTMLInputElement>['inputMode'] =
        type === 'numeric' ? 'numeric' : type === 'alphanumeric' ? 'text' : 'text';

    const visualType = mask || type === 'password' ? 'password' : 'text';

    return (
        <div
            className={cn('eui-pin-input', `eui-pin-input-variant-${variant}`, `eui-pin-input-size-${size}`, className, {
                'eui-pin-input-disabled': disabled,
                'eui-pin-input-invalid': invalid,
            })}
            role="group"
            aria-label={ariaLabel}
        >
            {chars.map((ch, idx) => (
                <React.Fragment key={idx}>
                    <input
                        ref={(el) => {
                            inputsRef.current[idx] = el;
                        }}
                        type={visualType}
                        inputMode={inputMode}
                        autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                        pattern={type === 'numeric' ? '[0-9]*' : undefined}
                        maxLength={1}
                        value={ch}
                        disabled={disabled}
                        placeholder={placeholder}
                        name={name ? `${name}-${idx}` : undefined}
                        aria-label={`${ariaLabel} digit ${idx + 1} of ${length}`}
                        aria-invalid={invalid || undefined}
                        className="eui-pin-input-field"
                        onChange={(e) => handleChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        onPaste={(e) => handlePaste(idx, e)}
                        onFocus={(e) => e.target.select()}
                    />
                    {groupAfter && (idx + 1) % groupAfter === 0 && idx + 1 < length && (
                        <span className="eui-pin-input-separator" aria-hidden="true">-</span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export { PinInput };
export type { PinInputProps, PinInputVariant, PinInputSize, PinInputType };
