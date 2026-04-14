import cn from 'classnames';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    CircleFilledIcon,
    CircleIcon,
    HeartFilledIcon,
    HeartIcon,
    SquareFilledIcon,
    SquareIcon,
    StarFilledIcon,
    StarIcon,
    ThumbUpFilledIcon,
    ThumbUpIcon,
} from '../../assets/icons';
import './Rating.scss';

type RatingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type RatingVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type RatingShape = 'star' | 'heart' | 'circle' | 'square' | 'thumb';
type RatingPrecision = 1 | 0.5 | 0.1;

interface RatingProps {
    value?: number;
    defaultValue?: number;
    count?: number;
    size?: RatingSize;
    variant?: RatingVariant;
    shape?: RatingShape;
    precision?: RatingPrecision;
    readOnly?: boolean;
    disabled?: boolean;
    allowClear?: boolean;
    showValue?: boolean;
    valueFormat?: (value: number, max: number) => React.ReactNode;
    tooltips?: string[];
    labels?: string[];
    icon?: React.ReactNode;
    emptyIcon?: React.ReactNode;
    className?: string;
    ariaLabel?: string;
    onChange?: (value: number) => void;
    onHoverChange?: (value: number) => void;
}

const sizeConfig: Record<RatingSize, number> = {
    xs: 14,
    sm: 18,
    md: 24,
    lg: 32,
    xl: 40,
};

const shapeIconMap: Record<RatingShape, { empty: React.FC<React.SVGProps<SVGSVGElement>>; filled: React.FC<React.SVGProps<SVGSVGElement>> }> = {
    star: { empty: StarIcon, filled: StarFilledIcon },
    heart: { empty: HeartIcon, filled: HeartFilledIcon },
    circle: { empty: CircleIcon, filled: CircleFilledIcon },
    square: { empty: SquareIcon, filled: SquareFilledIcon },
    thumb: { empty: ThumbUpIcon, filled: ThumbUpFilledIcon },
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const snapToPrecision = (v: number, precision: RatingPrecision): number => {
    const inv = 1 / precision;
    return Math.round(v * inv) / inv;
};

const Rating: React.FC<RatingProps> = ({
    value: controlledValue,
    defaultValue = 0,
    count = 5,
    size = 'md',
    variant = 'warning',
    shape = 'star',
    precision = 1,
    readOnly = false,
    disabled = false,
    allowClear = true,
    showValue = false,
    valueFormat,
    tooltips,
    labels,
    icon,
    emptyIcon,
    className,
    ariaLabel,
    onChange,
    onHoverChange,
}) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
    const displayValue = hoverValue !== null ? hoverValue : currentValue;
    const iconSize = sizeConfig[size];
    const interactive = !readOnly && !disabled;

    const { empty: EmptyShape, filled: FilledShape } = shapeIconMap[shape];

    const getValueFromPointer = useCallback(
        (e: React.PointerEvent<HTMLSpanElement>, index: number): number => {
            if (precision === 1) return index + 1;
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
            const raw = index + ratio;
            const snapped = snapToPrecision(raw, precision);
            return Math.max(precision, snapped);
        },
        [precision],
    );

    const commit = useCallback(
        (next: number) => {
            const clamped = clamp(next, 0, count);
            if (controlledValue === undefined) setInternalValue(clamped);
            onChange?.(clamped);
        },
        [controlledValue, count, onChange],
    );

    const handleMove = useCallback(
        (e: React.PointerEvent<HTMLSpanElement>, index: number) => {
            if (!interactive) return;
            const next = getValueFromPointer(e, index);
            setHoverValue(next);
            onHoverChange?.(next);
        },
        [interactive, getValueFromPointer, onHoverChange],
    );

    const handleLeave = useCallback(() => {
        if (!interactive) return;
        setHoverValue(null);
        onHoverChange?.(currentValue);
    }, [interactive, onHoverChange, currentValue]);

    const handleClick = useCallback(
        (e: React.PointerEvent<HTMLSpanElement>, index: number) => {
            if (!interactive) return;
            const next = getValueFromPointer(e, index);
            if (allowClear && precision === 1 && next === currentValue) {
                commit(0);
                return;
            }
            commit(next);
        },
        [interactive, getValueFromPointer, allowClear, precision, currentValue, commit],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!interactive) return;
            let next = currentValue;
            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowUp':
                    next = clamp(currentValue + precision, 0, count);
                    break;
                case 'ArrowLeft':
                case 'ArrowDown':
                    next = clamp(currentValue - precision, 0, count);
                    break;
                case 'Home':
                    next = 0;
                    break;
                case 'End':
                    next = count;
                    break;
                default:
                    return;
            }
            e.preventDefault();
            commit(next);
        },
        [interactive, currentValue, precision, count, commit],
    );

    const items = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

    const activeLabel = useMemo(() => {
        if (!labels) return null;
        const idx = Math.ceil(displayValue) - 1;
        if (idx < 0 || idx >= labels.length) return null;
        return labels[idx];
    }, [labels, displayValue]);

    const renderItem = (index: number) => {
        const fillAmount = clamp(displayValue - index, 0, 1);
        const isFull = fillAmount >= 1;
        const tooltip = tooltips?.[index];

        const full = icon ?? <FilledShape width={iconSize} height={iconSize} />;
        const empty = emptyIcon ?? icon ?? <EmptyShape width={iconSize} height={iconSize} />;

        return (
            <span
                key={index}
                className={cn('eui-rating-item', {
                    'eui-rating-item-full': isFull,
                    'eui-rating-item-partial': fillAmount > 0 && fillAmount < 1,
                })}
                style={{ width: iconSize, height: iconSize }}
                title={tooltip}
                role="presentation"
                onPointerMove={(e) => handleMove(e, index)}
                onPointerDown={(e) => handleClick(e, index)}
            >
                <span className="eui-rating-item-empty">{empty}</span>
                <span className="eui-rating-item-filled" style={{ width: `${fillAmount * 100}%`, height: iconSize }}>
                    {full}
                </span>
            </span>
        );
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                'eui-rating',
                `eui-rating-${size}`,
                `eui-rating-${variant}`,
                `eui-rating-shape-${shape}`,
                {
                    'eui-rating-disabled': disabled,
                    'eui-rating-readonly': readOnly,
                    'eui-rating-interactive': interactive,
                },
                className,
            )}
            role="slider"
            tabIndex={interactive ? 0 : -1}
            aria-label={ariaLabel ?? 'Rating'}
            aria-valuemin={0}
            aria-valuemax={count}
            aria-valuenow={currentValue}
            aria-readonly={readOnly}
            aria-disabled={disabled}
            onKeyDown={handleKeyDown}
            onPointerLeave={handleLeave}
        >
            <div className="eui-rating-items">{items.map(renderItem)}</div>
            {showValue && (
                <span className="eui-rating-value">
                    {valueFormat ? valueFormat(currentValue, count) : `${currentValue} / ${count}`}
                </span>
            )}
            {activeLabel && <span className="eui-rating-label">{activeLabel}</span>}
        </div>
    );
};

export { Rating };
export type { RatingProps, RatingSize, RatingVariant, RatingShape, RatingPrecision };
