import cn from 'classnames';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ClockIcon } from '../../assets/icons';
import { useViewport } from '../../hooks/useMobile';
import MobileTimePanel from './MobileTimePanel';
import './time-picker.scss';
import TimePanel from './TimePanel';
import { dateToTime, formatTime, normalizeValue, parseTimeString, TimeValue, timeToDate } from './utils';

type TimePickerSize = 'sm' | 'md' | 'lg';
type TimePickerVariant = 'input' | 'inline';
type TimePickerValueType = 'date' | 'string' | 'object';

type TimePickerValue = Date | string | TimeValue | null;

interface TimePickerProps {
    value?: TimePickerValue;
    defaultValue?: TimePickerValue;
    format12?: boolean;
    showSeconds?: boolean;
    hourStep?: number;
    minuteStep?: number;
    secondStep?: number;
    valueType?: TimePickerValueType;
    size?: TimePickerSize;
    variant?: TimePickerVariant;
    disabled?: boolean;
    readOnly?: boolean;
    clearable?: boolean;
    placeholder?: string;
    showNow?: boolean;
    showConfirm?: boolean;
    autoClose?: boolean;
    className?: string;
    ariaLabel?: string;
    onChange?: (value: TimePickerValue) => void;
    onOpenChange?: (open: boolean) => void;
}

const DEFAULT_TIME: TimeValue = { hours: 12, minutes: 0, seconds: 0 };

const TimePicker: React.FC<TimePickerProps> = ({
    value: controlledValue,
    defaultValue,
    format12 = false,
    showSeconds = false,
    hourStep = 1,
    minuteStep = 1,
    secondStep = 1,
    valueType = 'string',
    size = 'md',
    variant = 'input',
    disabled = false,
    readOnly = false,
    clearable = true,
    placeholder = 'Select time',
    showNow = true,
    showConfirm = false,
    autoClose,
    className,
    ariaLabel,
    onChange,
    onOpenChange,
}) => {
    const [internal, setInternal] = useState<TimeValue | null>(() => normalizeValue(defaultValue));
    const [draft, setDraft] = useState<TimeValue | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [popStyle, setPopStyle] = useState<React.CSSProperties>();
    const [inputText, setInputText] = useState('');
    const triggerRef = useRef<HTMLDivElement>(null);
    const popRef = useRef<HTMLDivElement>(null);
    const { isCompact, isMobile, isTablet } = useViewport();

    const normalizedControlled = useMemo(() => normalizeValue(controlledValue), [controlledValue]);
    const current = controlledValue !== undefined ? normalizedControlled : internal;
    const interactive = !disabled && !readOnly;
    const effectiveAutoClose = autoClose ?? !showConfirm;

    useEffect(() => {
        setInputText(current ? formatTime(current, format12, showSeconds) : '');
    }, [current, format12, showSeconds]);

    const emit = useCallback(
        (next: TimeValue | null) => {
            if (controlledValue === undefined) setInternal(next);
            if (!onChange) return;
            if (next === null) {
                onChange(null);
                return;
            }
            if (valueType === 'date') onChange(timeToDate(next));
            else if (valueType === 'object') onChange(next);
            else onChange(formatTime(next, format12, showSeconds));
        },
        [controlledValue, onChange, valueType, format12, showSeconds],
    );

    const computePosition = useCallback(() => {
        if (!triggerRef.current || !popRef.current) return;
        const t = triggerRef.current.getBoundingClientRect();
        const p = popRef.current.getBoundingClientRect();
        const padding = 4;
        let top = t.bottom + padding;
        let left = t.left;
        if (top + p.height > window.innerHeight) {
            top = Math.max(padding, t.top - p.height - padding);
        }
        if (left + p.width > window.innerWidth) {
            left = Math.max(padding, window.innerWidth - p.width - padding);
        }
        setPopStyle({ top: `${top + window.scrollY}px`, left: `${left + window.scrollX}px` });
    }, []);

    useLayoutEffect(() => {
        if (isOpen && !isCompact) computePosition();
    }, [isOpen, computePosition, isCompact]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closePopover(false);
        };
        document.addEventListener('keydown', onKey);
        if (isCompact) {
            const previousOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.removeEventListener('keydown', onKey);
                document.body.style.overflow = previousOverflow;
            };
        }
        const onResize = () => computePosition();
        const onClickOutside = (e: MouseEvent) => {
            if (
                popRef.current &&
                !popRef.current.contains(e.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node)
            ) {
                closePopover(false);
            }
        };
        window.addEventListener('resize', onResize);
        document.addEventListener('scroll', onResize, true);
        document.addEventListener('mousedown', onClickOutside);
        return () => {
            window.removeEventListener('resize', onResize);
            document.removeEventListener('scroll', onResize, true);
            document.removeEventListener('mousedown', onClickOutside);
            document.removeEventListener('keydown', onKey);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, computePosition, isCompact]);

    const openPopover = () => {
        if (!interactive || isOpen) return;
        setDraft(current ?? DEFAULT_TIME);
        setIsOpen(true);
        onOpenChange?.(true);
    };

    const closePopover = (commit: boolean) => {
        if (commit && draft) emit(draft);
        setIsOpen(false);
        setDraft(null);
        onOpenChange?.(false);
    };

    const handlePanelChange = (next: TimeValue) => {
        setDraft(next);
        if (effectiveAutoClose && !showConfirm) {
            emit(next);
        }
    };

    const handleNow = () => {
        const now = dateToTime(new Date());
        setDraft(now);
        emit(now);
        if (effectiveAutoClose) closePopover(false);
    };

    const handleConfirm = () => closePopover(true);

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        emit(null);
        setInputText('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setInputText(text);
        const parsed = parseTimeString(text);
        if (parsed) emit(parsed);
    };

    const handleInputBlur = () => {
        if (!inputText) {
            emit(null);
            return;
        }
        if (current) setInputText(formatTime(current, format12, showSeconds));
    };

    if (variant === 'inline') {
        return (
            <div className={cn('eui-time-picker eui-time-picker-inline', className)}>
                <TimePanel
                    value={current ?? DEFAULT_TIME}
                    format12={format12}
                    showSeconds={showSeconds}
                    hourStep={hourStep}
                    minuteStep={minuteStep}
                    secondStep={secondStep}
                    onChange={(next) => emit(next)}
                    onNow={showNow ? () => emit(dateToTime(new Date())) : undefined}
                    showFooter={showNow}
                />
            </div>
        );
    }

    return (
        <div
            ref={triggerRef}
            className={cn(
                'eui-time-picker',
                `eui-time-picker-${size}`,
                {
                    'eui-time-picker-disabled': disabled,
                    'eui-time-picker-readonly': readOnly,
                    'eui-time-picker-open': isOpen,
                },
                className,
            )}
            onClick={() => openPopover()}
        >
            <ClockIcon className="eui-time-picker-icon" width={16} height={16} />
            <input
                type="text"
                className="eui-time-picker-input"
                value={inputText}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                aria-label={ariaLabel ?? placeholder}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onClick={(e) => {
                    e.stopPropagation();
                    openPopover();
                }}
            />
            {clearable && current && interactive && (
                <button
                    type="button"
                    className="eui-time-picker-clear"
                    onClick={handleClear}
                    aria-label="Clear"
                >
                    ×
                </button>
            )}
            {isOpen &&
                createPortal(
                    isCompact ? (
                        <div
                            className={cn('eui-time-picker-backdrop', {
                                'eui-time-picker-backdrop-mobile': isMobile,
                                'eui-time-picker-backdrop-tablet': isTablet,
                            })}
                            onClick={() => closePopover(false)}
                        >
                            <div
                                ref={popRef}
                                className={cn('eui-time-picker-popover', 'eui-time-picker-popover-mobile', {
                                    'eui-time-picker-popover-mobile-mobile': isMobile,
                                    'eui-time-picker-popover-mobile-tablet': isTablet,
                                })}
                                role="dialog"
                                aria-label="Pick time"
                                aria-modal="true"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MobileTimePanel
                                    value={draft ?? current ?? DEFAULT_TIME}
                                    format12={format12}
                                    showSeconds={showSeconds}
                                    hourStep={hourStep}
                                    minuteStep={minuteStep}
                                    secondStep={secondStep}
                                    onChange={handlePanelChange}
                                    onNow={showNow ? handleNow : undefined}
                                    onConfirm={showConfirm ? handleConfirm : undefined}
                                    showFooter={showNow || showConfirm}
                                />
                            </div>
                        </div>
                    ) : (
                        <div
                            ref={popRef}
                            className={cn('eui-time-picker-popover', { 'eui-time-picker-popover-hidden': !popStyle })}
                            style={popStyle}
                            role="dialog"
                        >
                            <TimePanel
                                value={draft ?? current ?? DEFAULT_TIME}
                                format12={format12}
                                showSeconds={showSeconds}
                                hourStep={hourStep}
                                minuteStep={minuteStep}
                                secondStep={secondStep}
                                onChange={handlePanelChange}
                                onNow={showNow ? handleNow : undefined}
                                onConfirm={showConfirm ? handleConfirm : undefined}
                                showFooter={showNow || showConfirm}
                            />
                        </div>
                    ),
                    document.body,
                )}
        </div>
    );
};

export { TimePicker };
export type { TimePickerProps, TimePickerSize, TimePickerVariant, TimePickerValueType, TimePickerValue };
