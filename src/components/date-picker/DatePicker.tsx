import React, { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { createPortal } from 'react-dom';

import cn from 'classnames';
import { endOfMonth, startOfDay, startOfMonth, startOfYear } from 'date-fns';

import { CalendarIcon, TimesIcon } from '../../assets/icons';
import { useAnchoredPosition, type AnchoredPlacement } from '../../hooks/useAnchoredPosition';
import { useViewport } from '../../hooks/useMobile';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/body-scroll-lock';
import { pushLayer } from '../../utils/layer-stack';
import { renderIcon } from '../../utils/render-icon';
import '../eui-base.scss';
import './DatePicker.scss';
import type { DatePickerGranularity, DatePickerPlacement, DatePickerPreset, DatePickerProps } from './date-picker-types';
import { createDisabledMatcher, formatDisplay, parseInput, toIsoDate } from './date-picker-utils';
import { DatePickerCalendar } from './DatePickerCalendar';

const placementMap: Record<DatePickerPlacement, AnchoredPlacement> = {
    'bottom-start': 'bottomLeft',
    'bottom-end': 'bottomRight',
    'top-start': 'topLeft',
    'top-end': 'topRight',
};

const flipMap: Record<DatePickerPlacement, DatePickerPlacement> = {
    'bottom-start': 'top-start',
    'bottom-end': 'top-end',
    'top-start': 'bottom-start',
    'top-end': 'bottom-end',
};

const focusableSelector = 'button:not([disabled]):not([tabindex="-1"]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const resolvePreset = (preset: DatePickerPreset): Date => startOfDay(typeof preset.value === 'function' ? preset.value() : preset.value);

const normalizeToGranularity = (date: Date, granularity: DatePickerGranularity): Date => {
    if (granularity === 'month') return startOfMonth(date);
    if (granularity === 'year') return startOfYear(date);
    return startOfDay(date);
};

const isVisible = (element: HTMLElement): boolean => element.getClientRects().length > 0;

const tabbablesIn = (root: HTMLElement): HTMLElement[] => Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(isVisible);

const nextTabbableAfter = (anchor: HTMLElement, exclude: HTMLElement | null): HTMLElement | null =>
    tabbablesIn(document.body).find(
        (element) =>
            !anchor.contains(element) &&
            !exclude?.contains(element) &&
            Boolean(anchor.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING),
    ) ?? null;

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
    (
        {
            value: controlledValue,
            defaultValue = null,
            onChange,
            format,
            formatDate,
            parseDate,
            locale,
            firstDayOfWeek = 0,
            placeholder,
            size = 'md',
            variant = 'input',
            granularity = 'day',
            minDate,
            maxDate,
            disabledDates,
            disabledDaysOfWeek,
            highlightedDates,
            showWeekNumbers = false,
            showOutsideDays = true,
            fixedWeeks = true,
            numberOfMonths = 1,
            yearRange,
            presets,
            showTodayButton = false,
            todayLabel = 'Today',
            clearable = true,
            clearLabel = 'Clear date',
            closeOnSelect = true,
            editable = true,
            readOnly = false,
            disabled = false,
            required = false,
            status,
            fullWidth = false,
            icon,
            iconPosition = 'start',
            placement = 'bottom-start',
            responsive = true,
            open: controlledOpen,
            defaultOpen = false,
            onOpenChange,
            renderDay,
            dayClassName,
            name,
            id,
            ariaLabel,
            ariaDescribedBy,
            autoFocus,
            className,
            popoverClassName,
            style,
            onFocus,
            onBlur,
        },
        ref,
    ) => {
        const [internalValue, setInternalValue] = useState<Date | null>(defaultValue ? startOfDay(defaultValue) : null);
        const [internalOpen, setInternalOpen] = useState(defaultOpen);
        const [inputText, setInputText] = useState('');
        const [invalidText, setInvalidText] = useState(false);
        const [positioned, setPositioned] = useState(false);
        const [focusCalendar, setFocusCalendar] = useState(false);
        const triggerRef = useRef<HTMLDivElement>(null);
        const inputRef = useRef<HTMLInputElement | null>(null);
        const popoverRef = useRef<HTMLDivElement>(null);
        const { calculatePosition } = useAnchoredPosition();
        const { isCompact } = useViewport();
        const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
        const popoverId = `eui-dp-pop-${uid}`;
        const inputId = id ?? `eui-dp-input-${uid}`;

        const value = controlledValue !== undefined ? (controlledValue ? startOfDay(controlledValue) : null) : internalValue;
        const isOpen = controlledOpen ?? internalOpen;
        const interactive = !disabled && !readOnly;
        const asModal = responsive && isCompact;

        const isDisabled = useMemo(
            () => createDisabledMatcher(minDate, maxDate, disabledDates, disabledDaysOfWeek),
            [minDate, maxDate, disabledDates, disabledDaysOfWeek],
        );

        const displayPattern = format ?? (granularity === 'month' ? 'MMMM yyyy' : granularity === 'year' ? 'yyyy' : undefined);
        const display = useCallback(
            (date: Date) => (formatDate ? formatDate(date) : formatDisplay(date, displayPattern, locale)),
            [formatDate, displayPattern, locale],
        );
        const isPeriodDisabled = useCallback(
            (date: Date) => {
                if (granularity === 'day') return isDisabled(date);
                if (granularity === 'month') {
                    return Boolean((minDate && endOfMonth(date) < startOfDay(minDate)) || (maxDate && date > startOfDay(maxDate)));
                }
                const year = date.getFullYear();
                const minYear = yearRange?.[0] ?? minDate?.getFullYear();
                const maxYear = yearRange?.[1] ?? maxDate?.getFullYear();
                return (minYear !== undefined && year < minYear) || (maxYear !== undefined && year > maxYear);
            },
            [granularity, isDisabled, minDate, maxDate, yearRange],
        );
        const resolvedPlaceholder = placeholder ?? (granularity === 'month' ? 'Select month' : granularity === 'year' ? 'Select year' : 'Select date');

        const valueTime = value ? value.getTime() : null;

        useEffect(() => {
            setInputText(valueTime !== null ? display(new Date(valueTime)) : '');
            setInvalidText(false);
        }, [valueTime, display]);

        const setRefs = useCallback(
            (node: HTMLInputElement | null) => {
                inputRef.current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) ref.current = node;
            },
            [ref],
        );

        const setOpen = useCallback(
            (next: boolean) => {
                if (controlledOpen === undefined) setInternalOpen(next);
                onOpenChange?.(next);
            },
            [controlledOpen, onOpenChange],
        );

        const commit = useCallback(
            (date: Date | null) => {
                const normalized = date ? startOfDay(date) : null;
                if (controlledValue === undefined) setInternalValue(normalized);
                onChange?.(normalized);
            },
            [controlledValue, onChange],
        );

        const close = useCallback(
            (restoreFocus = true) => {
                setOpen(false);
                setFocusCalendar(false);
                if (restoreFocus) inputRef.current?.focus();
            },
            [setOpen],
        );

        const openPicker = (moveFocus: boolean) => {
            if (!interactive || isOpen) return;
            setPositioned(false);
            setFocusCalendar(moveFocus);
            setOpen(true);
        };

        const focusActiveDay = () => {
            popoverRef.current?.querySelector<HTMLElement>('[data-eui-dp-focus="true"]')?.focus();
        };

        const reposition = useCallback(() => {
            const trigger = triggerRef.current;
            const popover = popoverRef.current;
            if (!trigger || !popover) return;
            const triggerRect = trigger.getBoundingClientRect();
            const popoverHeight = popover.offsetHeight;
            const wantsBottom = placement.startsWith('bottom');
            const spaceBelow = window.innerHeight - triggerRect.bottom;
            const spaceAbove = triggerRect.top;
            let effective = placement;
            if (wantsBottom && spaceBelow < popoverHeight + 8 && spaceAbove > spaceBelow) effective = flipMap[placement];
            if (!wantsBottom && spaceAbove < popoverHeight + 8 && spaceBelow > spaceAbove) effective = flipMap[placement];
            calculatePosition(trigger, popover, placementMap[effective]);
            setPositioned(true);
        }, [placement, calculatePosition]);

        useLayoutEffect(() => {
            if (isOpen && !asModal && variant === 'input') reposition();
        }, [isOpen, asModal, variant, reposition]);

        useEffect(() => {
            if (!isOpen || variant !== 'input') return;
            const releaseLayer = pushLayer({ current: () => close(true) });
            const onPointerDown = (event: PointerEvent) => {
                const target = event.target as Node;
                if (popoverRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
                close(false);
            };
            const onKeyDown = (event: KeyboardEvent) => {
                if (event.key !== 'Tab' || !asModal) return;
                const pop = popoverRef.current;
                if (!pop) return;
                const items = Array.from(pop.querySelectorAll<HTMLElement>(focusableSelector));
                if (!items.length) return;
                const first = items[0];
                const last = items[items.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            };
            document.addEventListener('pointerdown', onPointerDown);
            document.addEventListener('keydown', onKeyDown);
            if (asModal) {
                lockBodyScroll();
                return () => {
                    releaseLayer();
                    document.removeEventListener('pointerdown', onPointerDown);
                    document.removeEventListener('keydown', onKeyDown);
                    unlockBodyScroll();
                };
            }
            window.addEventListener('resize', reposition);
            window.addEventListener('scroll', reposition, true);
            return () => {
                releaseLayer();
                document.removeEventListener('pointerdown', onPointerDown);
                document.removeEventListener('keydown', onKeyDown);
                window.removeEventListener('resize', reposition);
                window.removeEventListener('scroll', reposition, true);
            };
        }, [isOpen, asModal, variant, close, reposition]);

        const handleSelect = (date: Date) => {
            commit(date);
            if (variant === 'input' && closeOnSelect) close(true);
        };

        const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            commit(null);
            setInputText('');
            inputRef.current?.focus();
        };

        const applyText = (text: string) => {
            if (!text.trim()) {
                if (value) commit(null);
                setInvalidText(false);
                return true;
            }
            if (value && text === display(value)) {
                setInvalidText(false);
                return true;
            }
            const parsed = parseDate ? parseDate(text) : parseInput(text, displayPattern, locale);
            const normalized = parsed ? normalizeToGranularity(parsed, granularity) : null;
            if (normalized && !isPeriodDisabled(normalized)) {
                if (value && value.getTime() === normalized.getTime()) setInputText(display(value));
                else commit(normalized);
                setInvalidText(false);
                return true;
            }
            setInvalidText(true);
            return false;
        };

        const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                if (isOpen) focusActiveDay();
                else openPicker(true);
            } else if (event.key === 'Tab' && !event.shiftKey && isOpen && !asModal) {
                const pop = popoverRef.current;
                const first = pop ? tabbablesIn(pop)[0] : undefined;
                if (!first) return;
                event.preventDefault();
                first.focus();
            } else if (event.key === 'Enter') {
                if (editable && !readOnly) applyText(inputText);
            }
        };

        const isInsidePicker = (node: Node) => Boolean(popoverRef.current?.contains(node) || triggerRef.current?.contains(node));

        const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
            onBlur?.(event);
            const next = event.relatedTarget;
            if (isOpen && !asModal && next && !isInsidePicker(next)) close(false);
            if (!editable || readOnly) return;
            if (!applyText(inputText) && value) {
                setInputText(display(value));
                setInvalidText(false);
            }
        };

        const handlePopoverBlur = (event: React.FocusEvent<HTMLDivElement>) => {
            const next = event.relatedTarget;
            if (!next || isInsidePicker(next)) return;
            close(false);
        };

        const handlePopoverKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key !== 'Tab') return;
            const pop = popoverRef.current;
            const trigger = triggerRef.current;
            if (!pop || !trigger) return;
            const items = tabbablesIn(pop);
            if (!items.length) return;
            if (event.shiftKey && document.activeElement === items[0]) {
                event.preventDefault();
                inputRef.current?.focus();
            } else if (!event.shiftKey && document.activeElement === items[items.length - 1]) {
                event.preventDefault();
                const following = nextTabbableAfter(trigger, pop);
                if (following) {
                    close(false);
                    following.focus();
                } else {
                    close(true);
                }
            }
        };

        const todayDisabled = isDisabled(startOfDay(new Date()));

        const panel = (
            <div className={cn('eui-dp-panel', { 'eui-dp-panel-presets': presets?.length })}>
                {presets && presets.length > 0 && (
                    <div className="eui-dp-presets" role="group" aria-label="Quick select">
                        {presets.map((preset) => {
                            const date = resolvePreset(preset);
                            const presetDisabled = isDisabled(date);
                            const active = value !== null && value.getTime() === date.getTime();
                            return (
                                <button
                                    type="button"
                                    key={preset.label}
                                    className={cn('eui-dp-preset', { 'eui-dp-preset-active': active })}
                                    disabled={presetDisabled}
                                    aria-pressed={active}
                                    onClick={() => handleSelect(date)}
                                >
                                    {preset.label}
                                </button>
                            );
                        })}
                    </div>
                )}
                <div className="eui-dp-main">
                    <DatePickerCalendar
                        value={value}
                        onSelect={handleSelect}
                        locale={locale}
                        firstDayOfWeek={firstDayOfWeek}
                        minDate={minDate}
                        maxDate={maxDate}
                        isDisabled={isDisabled}
                        highlightedDates={highlightedDates}
                        showWeekNumbers={showWeekNumbers}
                        showOutsideDays={showOutsideDays}
                        fixedWeeks={fixedWeeks}
                        numberOfMonths={asModal ? 1 : numberOfMonths}
                        granularity={granularity}
                        yearRange={yearRange}
                        renderDay={renderDay}
                        dayClassName={dayClassName}
                        autoFocus={variant === 'input' && isOpen && (asModal || (focusCalendar && positioned))}
                    />
                    {(showTodayButton || (clearable && variant === 'inline')) && (
                        <div className="eui-dp-footer">
                            {showTodayButton && (
                                <button
                                    type="button"
                                    className="eui-dp-footer-btn eui-dp-footer-primary"
                                    disabled={todayDisabled || !interactive}
                                    onClick={() => handleSelect(new Date())}
                                >
                                    {todayLabel}
                                </button>
                            )}
                            {clearable && value && interactive && (
                                <button type="button" className="eui-dp-footer-btn" onClick={() => commit(null)}>
                                    {clearLabel}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );

        if (variant === 'inline') {
            return (
                <div
                    className={cn('eui-date-picker-inline', `eui-date-picker-${size}`, { 'eui-date-picker-disabled': disabled }, className)}
                    style={style}
                    aria-label={ariaLabel}
                    aria-disabled={disabled || undefined}
                    role="group"
                    inert={disabled || readOnly ? true : undefined}
                >
                    {panel}
                    {name && <input type="hidden" name={name} value={value ? toIsoDate(value) : ''} />}
                </div>
            );
        }

        const iconNode = icon === false ? null : renderIcon(icon ?? CalendarIcon, 'eui-date-picker-icon');
        const showClear = clearable && value !== null && interactive;
        const hasError = status === 'error' || invalidText;

        return (
            <div
                ref={triggerRef}
                className={cn(
                    'eui-date-picker',
                    `eui-date-picker-${size}`,
                    {
                        'eui-date-picker-full': fullWidth,
                        'eui-date-picker-open': isOpen,
                        'eui-date-picker-disabled': disabled,
                        'eui-date-picker-readonly': readOnly,
                        'eui-date-picker-error': hasError,
                        [`eui-date-picker-${status}`]: status && status !== 'error',
                        'eui-date-picker-icon-end': iconPosition === 'end',
                    },
                    className,
                )}
                style={style}
                onClick={() => {
                    if (!editable) openPicker(true);
                }}
            >
                {iconPosition === 'start' && iconNode}
                <input
                    ref={setRefs}
                    id={inputId}
                    type="text"
                    className="eui-date-picker-input"
                    value={inputText}
                    placeholder={resolvedPlaceholder}
                    disabled={disabled}
                    readOnly={readOnly || !editable}
                    required={required}
                    autoFocus={autoFocus}
                    autoComplete="off"
                    inputMode={editable ? 'text' : 'none'}
                    aria-label={ariaLabel ?? resolvedPlaceholder}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={hasError || undefined}
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                    aria-controls={isOpen ? popoverId : undefined}
                    onChange={(event) => {
                        setInputText(event.target.value);
                        if (invalidText) setInvalidText(false);
                    }}
                    onFocus={onFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    onClick={(event) => {
                        event.stopPropagation();
                        openPicker(!editable);
                    }}
                />
                {showClear && (
                    <button type="button" className="eui-date-picker-clear" onClick={handleClear} aria-label={clearLabel}>
                        <TimesIcon aria-hidden="true" />
                    </button>
                )}
                {iconPosition === 'end' && (
                    <button
                        type="button"
                        className="eui-date-picker-toggle"
                        onClick={(event) => {
                            event.stopPropagation();
                            if (isOpen) close(true);
                            else openPicker(true);
                        }}
                        disabled={!interactive}
                        aria-label={isOpen ? 'Close calendar' : 'Open calendar'}
                        tabIndex={-1}
                    >
                        {iconNode}
                    </button>
                )}
                {name && <input type="hidden" name={name} value={value ? toIsoDate(value) : ''} />}
                {isOpen &&
                    typeof document !== 'undefined' &&
                    createPortal(
                        asModal ? (
                            <div className="eui-dp-backdrop">
                                <div
                                    id={popoverId}
                                    ref={popoverRef}
                                    role="dialog"
                                    aria-modal="true"
                                    aria-label={ariaLabel ?? resolvedPlaceholder}
                                    className={cn('eui-dp-popover', 'eui-dp-sheet', popoverClassName)}
                                >
                                    {panel}
                                </div>
                            </div>
                        ) : (
                            <div
                                id={popoverId}
                                ref={popoverRef}
                                role="dialog"
                                aria-modal="false"
                                aria-label={ariaLabel ?? resolvedPlaceholder}
                                className={cn('eui-dp-popover', { 'eui-dp-popover-hidden': !positioned }, popoverClassName)}
                                onBlur={handlePopoverBlur}
                                onKeyDown={handlePopoverKeyDown}
                            >
                                {panel}
                            </div>
                        ),
                        document.body,
                    )}
            </div>
        );
    },
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
