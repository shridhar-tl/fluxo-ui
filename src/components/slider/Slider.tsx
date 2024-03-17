import cn from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './Slider.scss';

type SliderOrientation = 'horizontal' | 'vertical';
type SliderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SliderVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type SliderLabelPosition = 'top' | 'bottom' | 'left' | 'right';

interface SliderMark {
    value: number;
    label?: string;
}

interface SliderProps {
    value?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    orientation?: SliderOrientation;
    size?: SliderSize;
    variant?: SliderVariant;
    disabled?: boolean;
    range?: boolean;
    rangeValue?: [number, number];
    defaultRangeValue?: [number, number];
    marks?: SliderMark[] | boolean;
    showTooltip?: boolean | 'always';
    tooltipFormat?: (value: number) => string;
    valueFormat?: (value: number) => string;
    showValue?: boolean;
    valuePosition?: SliderLabelPosition;
    snap?: boolean;
    gridStep?: number;
    gridDuration?: number;
    labels?: string[];
    showMinMax?: boolean;
    trackHeight?: number;
    thumbSize?: number;
    filled?: boolean;
    className?: string;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    onChange?: (value: number | [number, number]) => void;
    onChangeEnd?: (value: number | [number, number]) => void;
}

const sizeConfig: Record<SliderSize, { track: number; thumb: number; fontSize: number }> = {
    xs: { track: 2, thumb: 12, fontSize: 10 },
    sm: { track: 4, thumb: 16, fontSize: 11 },
    md: { track: 6, thumb: 20, fontSize: 12 },
    lg: { track: 8, thumb: 24, fontSize: 13 },
    xl: { track: 10, thumb: 28, fontSize: 14 },
};

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

const snapToStep = (val: number, step: number, min: number, max: number): number => {
    const snapped = Math.round((val - min) / step) * step + min;
    return clamp(snapped, min, max);
};

const Slider: React.FC<SliderProps> = ({
    value: controlledValue,
    defaultValue = 0,
    min = 0,
    max = 100,
    step = 1,
    orientation = 'horizontal',
    size = 'md',
    variant = 'primary',
    disabled = false,
    range = false,
    rangeValue: controlledRangeValue,
    defaultRangeValue,
    marks,
    showTooltip = false,
    tooltipFormat,
    valueFormat,
    showValue = false,
    valuePosition = 'top',
    snap = false,
    gridStep,
    gridDuration = 150,
    labels,
    showMinMax = false,
    trackHeight,
    thumbSize,
    filled = true,
    className,
    ariaLabel,
    ariaLabelledBy,
    onChange,
    onChangeEnd,
}) => {
    const effectiveStep = gridStep || step;
    const effectiveMin = labels ? 0 : min;
    const effectiveMax = labels ? labels.length - 1 : max;
    const effectiveSnap = snap || !!gridStep || !!labels;

    const [internalValue, setInternalValue] = useState(defaultValue);
    const [internalRangeValue, setInternalRangeValue] = useState<[number, number]>(
        defaultRangeValue || [effectiveMin, effectiveMax],
    );
    const [dragging, setDragging] = useState<null | 'single' | 'low' | 'high'>(null);
    const [hoveredThumb, setHoveredThumb] = useState<null | 'single' | 'low' | 'high'>(null);

    const trackRef = useRef<HTMLDivElement>(null);
    const animFrameRef = useRef<number>(0);
    const $this = useRef({ onChange, onChangeEnd });
    $this.current = { onChange, onChangeEnd };

    const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
    const currentRangeValue = controlledRangeValue || internalRangeValue;

    const isHorizontal = orientation === 'horizontal';
    const config = sizeConfig[size];
    const effectiveTrackHeight = trackHeight || config.track;
    const effectiveThumbSize = thumbSize || config.thumb;

    const formatValue = useCallback(
        (v: number): string => {
            if (labels && v >= 0 && v < labels.length) return labels[Math.round(v)];
            if (valueFormat) return valueFormat(v);
            if (tooltipFormat) return tooltipFormat(v);
            return String(v);
        },
        [labels, valueFormat, tooltipFormat],
    );

    const getPercentage = useCallback(
        (v: number) => ((v - effectiveMin) / (effectiveMax - effectiveMin)) * 100,
        [effectiveMin, effectiveMax],
    );

    const getValueFromPosition = useCallback(
        (clientX: number, clientY: number): number => {
            const track = trackRef.current;
            if (!track) return effectiveMin;

            const rect = track.getBoundingClientRect();
            let ratio: number;

            if (isHorizontal) {
                ratio = (clientX - rect.left) / rect.width;
            } else {
                ratio = 1 - (clientY - rect.top) / rect.height;
            }

            ratio = clamp(ratio, 0, 1);
            let val = effectiveMin + ratio * (effectiveMax - effectiveMin);

            if (effectiveSnap) {
                val = snapToStep(val, effectiveStep, effectiveMin, effectiveMax);
            }

            return val;
        },
        [isHorizontal, effectiveMin, effectiveMax, effectiveStep, effectiveSnap],
    );

    const computedMarks = useMemo((): SliderMark[] => {
        if (!marks) return [];
        if (Array.isArray(marks)) return marks;
        if (labels) {
            return labels.map((label, i) => ({ value: i, label }));
        }
        const result: SliderMark[] = [];
        for (let v = effectiveMin; v <= effectiveMax; v += effectiveStep) {
            result.push({ value: v, label: String(v) });
        }
        return result;
    }, [marks, labels, effectiveMin, effectiveMax, effectiveStep]);

    const handlePointerDown = useCallback(
        (e: React.PointerEvent, thumb: 'single' | 'low' | 'high') => {
            if (disabled) return;
            e.preventDefault();
            e.stopPropagation();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            setDragging(thumb);
        },
        [disabled],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!dragging || disabled) return;

            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = requestAnimationFrame(() => {
                const newVal = getValueFromPosition(e.clientX, e.clientY);

                if (range) {
                    setInternalRangeValue((prev) => {
                        const controlled = controlledRangeValue || prev;
                        let next: [number, number];
                        if (dragging === 'low') {
                            next = [Math.min(newVal, controlled[1]), controlled[1]];
                        } else {
                            next = [controlled[0], Math.max(newVal, controlled[0])];
                        }
                        $this.current.onChange?.(next);
                        return next;
                    });
                } else {
                    setInternalValue(newVal);
                    $this.current.onChange?.(newVal);
                }
            });
        },
        [dragging, disabled, range, getValueFromPosition, controlledRangeValue],
    );

    const handlePointerUp = useCallback(() => {
        if (!dragging) return;
        setDragging(null);

        if (range) {
            $this.current.onChangeEnd?.(controlledRangeValue || internalRangeValue);
        } else {
            $this.current.onChangeEnd?.(controlledValue !== undefined ? controlledValue : internalValue);
        }
    }, [dragging, range, controlledRangeValue, internalRangeValue, controlledValue, internalValue]);

    const handleTrackClick = useCallback(
        (e: React.MouseEvent) => {
            if (disabled) return;
            const newVal = getValueFromPosition(e.clientX, e.clientY);

            if (range) {
                const [low, high] = controlledRangeValue || internalRangeValue;
                const distLow = Math.abs(newVal - low);
                const distHigh = Math.abs(newVal - high);
                const next: [number, number] =
                    distLow <= distHigh ? [newVal, high] : [low, newVal];
                const sorted: [number, number] = [Math.min(...next), Math.max(...next)];
                setInternalRangeValue(sorted);
                onChange?.(sorted);
                onChangeEnd?.(sorted);
            } else {
                setInternalValue(newVal);
                onChange?.(newVal);
                onChangeEnd?.(newVal);
            }
        },
        [disabled, range, getValueFromPosition, controlledRangeValue, internalRangeValue, onChange, onChangeEnd],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent, thumb: 'single' | 'low' | 'high') => {
            if (disabled) return;

            let delta = 0;
            const bigStep = effectiveStep * 10;

            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowUp':
                    delta = effectiveStep;
                    break;
                case 'ArrowLeft':
                case 'ArrowDown':
                    delta = -effectiveStep;
                    break;
                case 'PageUp':
                    delta = bigStep;
                    break;
                case 'PageDown':
                    delta = -bigStep;
                    break;
                case 'Home':
                    delta = effectiveMin - effectiveMax;
                    break;
                case 'End':
                    delta = effectiveMax - effectiveMin;
                    break;
                default:
                    return;
            }

            e.preventDefault();

            if (range) {
                setInternalRangeValue((prev) => {
                    const controlled = controlledRangeValue || prev;
                    let next: [number, number];
                    if (thumb === 'low') {
                        const newLow = clamp(controlled[0] + delta, effectiveMin, controlled[1]);
                        next = [newLow, controlled[1]];
                    } else {
                        const newHigh = clamp(controlled[1] + delta, controlled[0], effectiveMax);
                        next = [controlled[0], newHigh];
                    }
                    onChange?.(next);
                    onChangeEnd?.(next);
                    return next;
                });
            } else {
                const newVal = clamp(
                    (controlledValue !== undefined ? controlledValue : internalValue) + delta,
                    effectiveMin,
                    effectiveMax,
                );
                setInternalValue(newVal);
                onChange?.(newVal);
                onChangeEnd?.(newVal);
            }
        },
        [disabled, effectiveStep, effectiveMin, effectiveMax, range, controlledRangeValue, controlledValue, internalValue, onChange, onChangeEnd],
    );

    useEffect(() => {
        return () => cancelAnimationFrame(animFrameRef.current);
    }, []);

    const shouldShowTooltip = (thumb: 'single' | 'low' | 'high') => {
        if (showTooltip === 'always') return true;
        if (showTooltip && (dragging === thumb || hoveredThumb === thumb)) return true;
        return false;
    };

    const renderThumb = (val: number, thumb: 'single' | 'low' | 'high') => {
        const pct = getPercentage(val);
        const posStyle: React.CSSProperties = isHorizontal
            ? { left: `${pct}%` }
            : { bottom: `${pct}%` };

        return (
            <div
                className={cn('eui-slider-thumb', {
                    'eui-slider-thumb-active': dragging === thumb,
                })}
                style={{
                    ...posStyle,
                    width: effectiveThumbSize,
                    height: effectiveThumbSize,
                    transition: dragging ? 'none' : `all ${gridDuration}ms ease`,
                }}
                role="slider"
                tabIndex={disabled ? -1 : 0}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                aria-valuemin={effectiveMin}
                aria-valuemax={effectiveMax}
                aria-valuenow={val}
                aria-valuetext={formatValue(val)}
                aria-orientation={orientation}
                aria-disabled={disabled}
                onPointerDown={(e) => handlePointerDown(e, thumb)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onKeyDown={(e) => handleKeyDown(e, thumb)}
                onMouseEnter={() => setHoveredThumb(thumb)}
                onMouseLeave={() => setHoveredThumb(null)}
            >
                {shouldShowTooltip(thumb) && (
                    <div className="eui-slider-tooltip">{formatValue(val)}</div>
                )}
            </div>
        );
    };

    const renderFill = () => {
        if (!filled) return null;

        let style: React.CSSProperties;
        const transition = dragging ? 'none' : `all ${gridDuration}ms ease`;

        if (range) {
            const lowPct = getPercentage(currentRangeValue[0]);
            const highPct = getPercentage(currentRangeValue[1]);
            style = isHorizontal
                ? { left: `${lowPct}%`, width: `${highPct - lowPct}%`, transition }
                : { bottom: `${lowPct}%`, height: `${highPct - lowPct}%`, transition };
        } else {
            const pct = getPercentage(currentValue);
            style = isHorizontal
                ? { left: '0%', width: `${pct}%`, transition }
                : { bottom: '0%', height: `${pct}%`, transition };
        }

        return <div className="eui-slider-fill" style={style} />;
    };

    const renderMarks = () => {
        if (computedMarks.length === 0) return null;

        return (
            <div className="eui-slider-marks">
                {computedMarks.map((mark) => {
                    const pct = getPercentage(mark.value);
                    const posStyle: React.CSSProperties = isHorizontal
                        ? { left: `${pct}%` }
                        : { bottom: `${pct}%` };

                    const isActive = range
                        ? mark.value >= currentRangeValue[0] && mark.value <= currentRangeValue[1]
                        : mark.value <= currentValue;

                    return (
                        <div
                            key={mark.value}
                            className={cn('eui-slider-mark', { 'eui-slider-mark-active': isActive })}
                            style={posStyle}
                        >
                            <div className="eui-slider-mark-dot" />
                            {mark.label && <span className="eui-slider-mark-label">{mark.label}</span>}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderValueDisplay = () => {
        if (!showValue) return null;
        const displayVal = range
            ? `${formatValue(currentRangeValue[0])} – ${formatValue(currentRangeValue[1])}`
            : formatValue(currentValue);

        return <span className={cn('eui-slider-value', `eui-slider-value-${valuePosition}`)}>{displayVal}</span>;
    };

    return (
        <div
            className={cn(
                'eui-slider',
                `eui-slider-${orientation}`,
                `eui-slider-${size}`,
                `eui-slider-${variant}`,
                {
                    'eui-slider-disabled': disabled,
                    'eui-slider-dragging': !!dragging,
                    'eui-slider-has-marks': computedMarks.length > 0,
                },
                className,
            )}
            style={{ fontSize: config.fontSize }}
        >
            {(showValue && (valuePosition === 'top' || valuePosition === 'left')) && renderValueDisplay()}

            <div className="eui-slider-container">
                {showMinMax && (
                    <span className="eui-slider-minmax eui-slider-min">{formatValue(effectiveMin)}</span>
                )}

                <div
                    ref={trackRef}
                    className="eui-slider-track"
                    style={
                        isHorizontal
                            ? { height: effectiveTrackHeight }
                            : { width: effectiveTrackHeight }
                    }
                    onClick={handleTrackClick}
                >
                    {renderFill()}
                    {renderMarks()}

                    {range ? (
                        <>
                            {renderThumb(currentRangeValue[0], 'low')}
                            {renderThumb(currentRangeValue[1], 'high')}
                        </>
                    ) : (
                        renderThumb(currentValue, 'single')
                    )}
                </div>

                {showMinMax && (
                    <span className="eui-slider-minmax eui-slider-max">{formatValue(effectiveMax)}</span>
                )}
            </div>

            {(showValue && (valuePosition === 'bottom' || valuePosition === 'right')) && renderValueDisplay()}
        </div>
    );
};

export { Slider };
export type { SliderProps, SliderMark, SliderOrientation, SliderSize, SliderVariant, SliderLabelPosition };
