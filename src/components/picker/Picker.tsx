import cn from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import './Picker.scss';

type PickerVariant = 'wheel' | 'flat' | 'compact';

interface PickerOption {
    value: string;
    label: React.ReactNode;
    disabled?: boolean;
}

interface PickerColumn {
    key?: string;
    label?: React.ReactNode;
    options: PickerOption[];
    flex?: number;
}

interface PickerProps {
    columns: PickerColumn[];
    value: string[];
    onChange: (value: string[]) => void;
    itemHeight?: number;
    visibleItems?: number;
    variant?: PickerVariant;
    disabled?: boolean;
    className?: string;
    ariaLabel?: string;
}

const DEFAULT_ITEM_HEIGHT = 36;
const DEFAULT_VISIBLE = 5;

const usePickerColumn = (
    options: PickerOption[],
    value: string,
    onChange: (v: string) => void,
    itemHeight: number,
    disabled: boolean,
) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const isScrollingProgrammaticallyRef = useRef(false);
    const lastEmittedRef = useRef<string>(value);
    const settleTimerRef = useRef<number | null>(null);

    const selectedIndex = useMemo(() => {
        const idx = options.findIndex((o) => o.value === value);
        return idx >= 0 ? idx : 0;
    }, [options, value]);

    const scrollToIndex = useCallback(
        (index: number, smooth = true) => {
            const el = wrapperRef.current;
            if (!el) return;
            const target = index * itemHeight;
            isScrollingProgrammaticallyRef.current = true;
            el.scrollTo({ top: target, behavior: smooth ? 'smooth' : 'auto' });
            window.setTimeout(() => {
                isScrollingProgrammaticallyRef.current = false;
            }, smooth ? 320 : 0);
        },
        [itemHeight],
    );

    useEffect(() => {
        scrollToIndex(selectedIndex, false);
    }, [selectedIndex, scrollToIndex]);

    const handleScroll = () => {
        if (isScrollingProgrammaticallyRef.current) return;
        if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
        const el = wrapperRef.current;
        if (!el) return;
        settleTimerRef.current = window.setTimeout(() => {
            const idx = Math.round(el.scrollTop / itemHeight);
            const clamped = Math.max(0, Math.min(idx, options.length - 1));
            const option = options[clamped];
            if (!option) return;
            if (option.disabled) {
                scrollToIndex(selectedIndex, true);
                return;
            }
            scrollToIndex(clamped, true);
            if (lastEmittedRef.current !== option.value) {
                lastEmittedRef.current = option.value;
                onChange(option.value);
            }
        }, 120);
    };

    useEffect(() => () => {
        if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const dir = e.key === 'ArrowUp' ? -1 : 1;
            let next = selectedIndex + dir;
            while (next >= 0 && next < options.length && options[next].disabled) next += dir;
            if (next < 0 || next >= options.length) return;
            const option = options[next];
            lastEmittedRef.current = option.value;
            onChange(option.value);
            scrollToIndex(next, true);
        }
    };

    return {
        wrapperRef,
        selectedIndex,
        handleScroll,
        handleKeyDown,
        scrollToIndex,
    };
};

const PickerColumnInner: React.FC<{
    column: PickerColumn;
    value: string;
    onChange: (v: string) => void;
    itemHeight: number;
    visibleItems: number;
    disabled: boolean;
    variant: PickerVariant;
}> = ({ column, value, onChange, itemHeight, visibleItems, disabled, variant }) => {
    const { wrapperRef, selectedIndex, handleScroll, handleKeyDown, scrollToIndex } = usePickerColumn(
        column.options,
        value,
        onChange,
        itemHeight,
        disabled,
    );

    const padding = ((visibleItems - 1) / 2) * itemHeight;

    return (
        <div className="eui-picker-column" style={{ flex: column.flex ?? 1 }}>
            <div
                ref={wrapperRef}
                className={cn('eui-picker-column-scroller', {
                    'eui-picker-column-scroller-disabled': disabled,
                })}
                style={{ height: `${visibleItems * itemHeight}px` }}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                tabIndex={disabled ? -1 : 0}
                role="listbox"
                aria-orientation="vertical"
                aria-label={typeof column.label === 'string' ? column.label : undefined}
                aria-activedescendant={`eui-picker-option-${column.key ?? 'col'}-${selectedIndex}`}
            >
                <div className="eui-picker-column-track" style={{ paddingTop: padding, paddingBottom: padding }}>
                    {column.options.map((option, idx) => {
                        const distance = Math.abs(idx - selectedIndex);
                        const isSelected = idx === selectedIndex;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                id={`eui-picker-option-${column.key ?? 'col'}-${idx}`}
                                role="option"
                                aria-selected={isSelected}
                                disabled={option.disabled || disabled}
                                className={cn('eui-picker-option', {
                                    'eui-picker-option-selected': isSelected,
                                    'eui-picker-option-disabled': option.disabled,
                                })}
                                style={{
                                    height: itemHeight,
                                    opacity:
                                        option.disabled
                                            ? 0.35
                                            : variant === 'wheel'
                                                ? Math.max(1 - distance * 0.22, 0.3)
                                                : isSelected ? 1 : 0.7,
                                    transform: variant === 'wheel' ? `scale(${Math.max(1 - distance * 0.06, 0.78)})` : undefined,
                                }}
                                onClick={() => {
                                    if (option.disabled) return;
                                    onChange(option.value);
                                    scrollToIndex(idx, true);
                                }}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const Picker: React.FC<PickerProps> = ({
    columns,
    value,
    onChange,
    itemHeight = DEFAULT_ITEM_HEIGHT,
    visibleItems = DEFAULT_VISIBLE,
    variant = 'wheel',
    disabled = false,
    className,
    ariaLabel,
}) => {
    const handleColumnChange = (colIdx: number, v: string) => {
        const next = [...value];
        next[colIdx] = v;
        onChange(next);
    };

    const hasLabels = columns.some((c) => c.label != null);
    const totalHeight = visibleItems * itemHeight;
    const indicatorTop = ((visibleItems - 1) / 2) * itemHeight;

    return (
        <div
            className={cn('eui-picker', `eui-picker-variant-${variant}`, className, {
                'eui-picker-disabled': disabled,
                'eui-picker-has-labels': hasLabels,
            })}
            role="group"
            aria-label={ariaLabel ?? 'Picker'}
            style={{
                ['--eui-picker-item-height' as never]: `${itemHeight}px`,
                ['--eui-picker-total-height' as never]: `${totalHeight}px`,
                ['--eui-picker-indicator-top' as never]: `${indicatorTop}px`,
            }}
        >
            {hasLabels && (
                <div className="eui-picker-labels" aria-hidden="true">
                    {columns.map((column, idx) => (
                        <div
                            key={column.key ?? `label-${idx}`}
                            className="eui-picker-label-cell"
                            style={{ flex: column.flex ?? 1 }}
                        >
                            {column.label ?? ''}
                        </div>
                    ))}
                </div>
            )}
            <div className="eui-picker-viewport">
                <div className="eui-picker-indicator" aria-hidden="true" />
                <div className="eui-picker-mask eui-picker-mask-top" aria-hidden="true" />
                <div className="eui-picker-mask eui-picker-mask-bottom" aria-hidden="true" />
                <div className="eui-picker-columns">
                    {columns.map((column, idx) => (
                        <PickerColumnInner
                            key={column.key ?? idx}
                            column={column}
                            value={value[idx] ?? column.options[0]?.value ?? ''}
                            onChange={(v) => handleColumnChange(idx, v)}
                            itemHeight={itemHeight}
                            visibleItems={visibleItems}
                            disabled={disabled}
                            variant={variant}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export { Picker };
export type { PickerProps, PickerColumn, PickerOption, PickerVariant };
