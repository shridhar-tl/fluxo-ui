import cn from 'classnames';
import React, { useCallback, useMemo, useRef } from 'react';
import './WeekDaySelector.scss';

type WeekDayShape = 'rounded' | 'squared' | 'circle';
type WeekDaySpacing = 'spaced' | 'joined';
type WeekDaySize = 'sm' | 'md' | 'lg';
type WeekDayVariant = 'default' | 'primary' | 'success' | 'danger';
type WeekDayFill = 'solid' | 'outlined' | 'subtle';

interface BaseProps {
    shape?: WeekDayShape;
    spacing?: WeekDaySpacing;
    size?: WeekDaySize;
    variant?: WeekDayVariant;
    fill?: WeekDayFill;
    firstDayOfWeek?: number;
    labels?: string[];
    disabledDays?: number[];
    disabled?: boolean;
    className?: string;
    ariaLabel?: string;
}

interface SingleProps extends BaseProps {
    multiple?: false;
    value?: number | null;
    defaultValue?: number | null;
    onChange?: (value: number | null) => void;
}

interface MultiProps extends BaseProps {
    multiple: true;
    value?: number[];
    defaultValue?: number[];
    onChange?: (value: number[]) => void;
}

type WeekDaySelectorProps = SingleProps | MultiProps;

const DEFAULT_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const rotate = <T,>(arr: T[], n: number): T[] => [...arr.slice(n), ...arr.slice(0, n)];

const WeekDaySelector: React.FC<WeekDaySelectorProps> = (props) => {
    const {
        shape = 'rounded',
        spacing = 'spaced',
        size = 'md',
        variant = 'primary',
        fill = 'solid',
        firstDayOfWeek = 0,
        labels = DEFAULT_LABELS,
        disabledDays,
        disabled = false,
        className,
        ariaLabel = 'Weekday selector',
    } = props;

    const isMultiple = props.multiple === true;

    const [internal, setInternal] = React.useState<number[] | number | null>(() => {
        if (isMultiple) {
            const p = props as MultiProps;
            return p.defaultValue ?? [];
        }
        const p = props as SingleProps;
        return p.defaultValue ?? null;
    });

    const controlled = isMultiple
        ? (props as MultiProps).value !== undefined
        : (props as SingleProps).value !== undefined;

    const current: number[] | number | null = controlled
        ? (isMultiple ? (props as MultiProps).value! : (props as SingleProps).value!)
        : internal;

    const orderedDays = useMemo(() => {
        const days = [0, 1, 2, 3, 4, 5, 6];
        return rotate(days, firstDayOfWeek % 7);
    }, [firstDayOfWeek]);

    const orderedLabels = useMemo(() => rotate(labels, firstDayOfWeek % 7), [labels, firstDayOfWeek]);

    const disabledSet = useMemo(() => new Set(disabledDays ?? []), [disabledDays]);

    const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

    const isSelected = useCallback(
        (day: number): boolean => {
            if (isMultiple) return Array.isArray(current) && current.includes(day);
            return current === day;
        },
        [current, isMultiple],
    );

    const handleSelect = useCallback(
        (day: number) => {
            if (isMultiple) {
                const arr = Array.isArray(current) ? current : [];
                const next = arr.includes(day) ? arr.filter((d) => d !== day) : [...arr, day].sort();
                if (!controlled) setInternal(next);
                (props as MultiProps).onChange?.(next);
            } else {
                const next = current === day ? null : day;
                if (!controlled) setInternal(next);
                (props as SingleProps).onChange?.(next);
            }
        },
        [current, isMultiple, controlled, props],
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const next = (idx + 1) % 7;
            buttonsRef.current[next]?.focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = (idx - 1 + 7) % 7;
            buttonsRef.current[prev]?.focus();
        } else if (e.key === 'Home') {
            e.preventDefault();
            buttonsRef.current[0]?.focus();
        } else if (e.key === 'End') {
            e.preventDefault();
            buttonsRef.current[6]?.focus();
        }
    };

    return (
        <div
            role={isMultiple ? 'group' : 'radiogroup'}
            aria-label={ariaLabel}
            className={cn(
                'eui-wds',
                `eui-wds-shape-${shape}`,
                `eui-wds-${spacing}`,
                `eui-wds-size-${size}`,
                `eui-wds-variant-${variant}`,
                `eui-wds-fill-${fill}`,
                className,
            )}
        >
            {orderedDays.map((day, idx) => {
                const selected = isSelected(day);
                const itemDisabled = disabled || disabledSet.has(day);
                return (
                    <button
                        key={day}
                        ref={(el) => {
                            buttonsRef.current[idx] = el;
                        }}
                        type="button"
                        className={cn('eui-wds-item', { 'eui-wds-item-selected': selected })}
                        disabled={itemDisabled}
                        onClick={() => handleSelect(day)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        role={isMultiple ? 'checkbox' : 'radio'}
                        aria-checked={selected}
                        aria-label={orderedLabels[idx]}
                        tabIndex={isMultiple ? 0 : selected || (current === null && idx === 0) ? 0 : -1}
                    >
                        {orderedLabels[idx]}
                    </button>
                );
            })}
        </div>
    );
};

export { WeekDaySelector };
export type { WeekDaySelectorProps, WeekDayShape, WeekDaySpacing, WeekDaySize, WeekDayVariant, WeekDayFill };
