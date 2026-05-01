import classNames from 'classnames';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import './Knob.scss';

export type KnobSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type KnobVariant = 'solid' | 'gradient' | 'striped' | 'dashed' | 'pie';
export type KnobColorPreset = 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface KnobProps {
    value: number;
    min?: number;
    max?: number;
    size?: KnobSize | number;
    strokeWidth?: number;
    variant?: KnobVariant;
    color?: KnobColorPreset | string;
    gradient?: { from: string; to: string };
    trackColor?: string;
    arcStart?: number;
    arcEnd?: number;
    roundedCaps?: boolean;
    showValue?: boolean;
    valueFormatter?: (v: number) => string;
    unit?: string;
    label?: string;
    subLabel?: string;
    renderCenter?: () => React.ReactNode;
    interactive?: boolean;
    step?: number;
    onChange?: (v: number) => void;
    disabled?: boolean;
    id?: string;
    className?: string;
    ariaLabel?: string;
}

const sizeMap: Record<KnobSize, number> = {
    xs: 56,
    sm: 80,
    md: 112,
    lg: 144,
    xl: 192,
};

const presetColorMap: Record<KnobColorPreset, string> = {
    primary: 'var(--eui-primary)',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
        x: cx + r * Math.cos(angleRad),
        y: cy + r * Math.sin(angleRad),
    };
};

const describePiePath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
};

const resolveColor = (color: KnobProps['color']) => {
    if (!color) return 'var(--eui-primary)';
    if (color in presetColorMap) return presetColorMap[color as KnobColorPreset];
    return color;
};

const getDashArray = (variant: KnobVariant, circumference: number): string | undefined => {
    if (variant === 'striped') {
        const seg = Math.max(4, circumference / 60);
        return `${seg} ${seg / 2}`;
    }
    if (variant === 'dashed') {
        const seg = Math.max(2, circumference / 120);
        return `${seg} ${seg * 2}`;
    }
    return undefined;
};

const Knob: React.FC<KnobProps> = ({
    value,
    min = 0,
    max = 100,
    size = 'md',
    strokeWidth,
    variant = 'solid',
    color = 'primary',
    gradient,
    trackColor,
    arcStart = 0,
    arcEnd = 360,
    roundedCaps = true,
    showValue = true,
    valueFormatter,
    unit,
    label,
    subLabel,
    renderCenter,
    interactive = false,
    step = 1,
    onChange,
    disabled = false,
    id,
    className,
    ariaLabel,
}) => {
    const generatedId = useId();
    const knobId = id ?? `knob-${generatedId}`;
    const gradientId = `${knobId}-grad`;

    const svgRef = useRef<SVGSVGElement>(null);
    const dragRef = useRef<{ active: boolean; pointerId: number | null }>({ active: false, pointerId: null });

    const dimension = typeof size === 'number' ? size : sizeMap[size];
    const computedStroke = strokeWidth ?? Math.max(4, Math.round(dimension * 0.1));
    const radius = (dimension - computedStroke) / 2;
    const cx = dimension / 2;
    const cy = dimension / 2;

    const safeStart = arcStart;
    const safeEnd = arcEnd;
    const sweep = Math.max(0, Math.min(360, safeEnd - safeStart));
    const fullCircumference = 2 * Math.PI * radius;
    const arcLength = (fullCircumference * sweep) / 360;

    const safeValue = clamp(Number.isFinite(value) ? value : min, min, max);
    const ratio = max === min ? 0 : (safeValue - min) / (max - min);
    const filledLength = ratio * arcLength;

    const trackColorResolved = trackColor ?? 'var(--eui-border-subtle)';
    const fillColor = resolveColor(color);

    const dashArray = useMemo(() => getDashArray(variant, fullCircumference), [variant, fullCircumference]);

    const arcStrokeForVariant = (() => {
        if (variant === 'gradient') return `url(#${gradientId})`;
        return fillColor;
    })();

    const trackPathProps = useMemo(() => {
        if (sweep >= 360) {
            return { circle: true } as const;
        }
        const start = polarToCartesian(cx, cy, radius, safeStart);
        const end = polarToCartesian(cx, cy, radius, safeEnd);
        const largeArc = sweep <= 180 ? 0 : 1;
        const d = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
        return { circle: false, d } as const;
    }, [cx, cy, radius, sweep, safeStart, safeEnd]);

    const filledPathProps = useMemo(() => {
        if (sweep >= 360) {
            return { circle: true } as const;
        }
        const start = polarToCartesian(cx, cy, radius, safeStart);
        const filledSweep = sweep * ratio;
        const filledEndAngle = safeStart + filledSweep;
        const end = polarToCartesian(cx, cy, radius, filledEndAngle);
        const largeArc = filledSweep <= 180 ? 0 : 1;
        const d = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
        return { circle: false, d } as const;
    }, [cx, cy, radius, sweep, safeStart, ratio]);

    const piePath = useMemo(() => {
        if (variant !== 'pie') return null;
        const filledSweep = sweep * ratio;
        if (filledSweep <= 0) return '';
        return describePiePath(cx, cy, radius + computedStroke / 2, safeStart, safeStart + filledSweep);
    }, [variant, sweep, ratio, cx, cy, radius, computedStroke, safeStart]);

    const formattedValue = useMemo(() => {
        if (valueFormatter) return valueFormatter(safeValue);
        const rounded = step >= 1 ? Math.round(safeValue) : Math.round(safeValue * 100) / 100;
        return String(rounded);
    }, [valueFormatter, safeValue, step]);

    const angleFromPoint = useCallback(
        (clientX: number, clientY: number) => {
            const svg = svgRef.current;
            if (!svg) return safeStart;
            const rect = svg.getBoundingClientRect();
            const px = clientX - rect.left;
            const py = clientY - rect.top;
            const dx = px - cx * (rect.width / dimension);
            const dy = py - cy * (rect.height / dimension);
            let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
            if (deg < 0) deg += 360;
            return deg;
        },
        [cx, cy, dimension, safeStart],
    );

    const valueFromAngle = useCallback(
        (angleDeg: number) => {
            let normalized = angleDeg - safeStart;
            while (normalized < 0) normalized += 360;
            while (normalized > 360) normalized -= 360;
            const clampedToSweep = clamp(normalized, 0, sweep);
            const r = clampedToSweep / sweep;
            const raw = min + r * (max - min);
            const snapped = Math.round(raw / step) * step;
            return clamp(snapped, min, max);
        },
        [safeStart, sweep, min, max, step],
    );

    const handlePointerDown = useCallback(
        (e: React.PointerEvent<SVGSVGElement>) => {
            if (!interactive || disabled) return;
            const svg = svgRef.current;
            if (!svg) return;
            try {
                svg.setPointerCapture(e.pointerId);
            } catch {
                // ignore
            }
            dragRef.current = { active: true, pointerId: e.pointerId };
            const angle = angleFromPoint(e.clientX, e.clientY);
            const next = valueFromAngle(angle);
            onChange?.(next);
        },
        [interactive, disabled, angleFromPoint, valueFromAngle, onChange],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent<SVGSVGElement>) => {
            if (!dragRef.current.active) return;
            if (dragRef.current.pointerId !== e.pointerId) return;
            const angle = angleFromPoint(e.clientX, e.clientY);
            const next = valueFromAngle(angle);
            onChange?.(next);
        },
        [angleFromPoint, valueFromAngle, onChange],
    );

    const endDrag = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
        if (!dragRef.current.active) return;
        try {
            svgRef.current?.releasePointerCapture(e.pointerId);
        } catch {
            // ignore
        }
        dragRef.current = { active: false, pointerId: null };
    }, []);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<SVGSVGElement>) => {
            if (!interactive || disabled) return;
            const stepUp = (multiplier: number) => {
                e.preventDefault();
                const next = clamp(safeValue + step * multiplier, min, max);
                onChange?.(next);
            };
            switch (e.key) {
                case 'ArrowUp':
                case 'ArrowRight':
                    stepUp(1);
                    break;
                case 'ArrowDown':
                case 'ArrowLeft':
                    stepUp(-1);
                    break;
                case 'PageUp':
                    stepUp(10);
                    break;
                case 'PageDown':
                    stepUp(-10);
                    break;
                case 'Home':
                    e.preventDefault();
                    onChange?.(min);
                    break;
                case 'End':
                    e.preventDefault();
                    onChange?.(max);
                    break;
                default:
                    break;
            }
        },
        [interactive, disabled, safeValue, step, min, max, onChange],
    );

    const [reducedMotion, setReducedMotion] = useState(false);
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mq.matches);
        const handler = (ev: MediaQueryListEvent) => setReducedMotion(ev.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const ariaProps = interactive
        ? {
              role: 'slider' as const,
              tabIndex: disabled ? -1 : 0,
              'aria-valuenow': Math.round(safeValue),
              'aria-valuemin': min,
              'aria-valuemax': max,
              'aria-valuetext': `${formattedValue}${unit ? ' ' + unit : ''}`,
              'aria-label': ariaLabel ?? label ?? 'Knob value',
              'aria-disabled': disabled || undefined,
          }
        : {
              role: 'img' as const,
              'aria-roledescription': 'progress',
              'aria-label': ariaLabel ?? label ?? `${formattedValue}${unit ? ' ' + unit : ''} of ${max}`,
          };

    const displayCenter = renderCenter ? (
        renderCenter()
    ) : (
        <>
            {label && <div className="eui-knob-label">{label}</div>}
            {showValue && (
                <div className="eui-knob-value">
                    <span className="eui-knob-value-text">{formattedValue}</span>
                    {unit && <span className="eui-knob-value-unit">{unit}</span>}
                </div>
            )}
            {subLabel && <div className="eui-knob-sublabel">{subLabel}</div>}
        </>
    );

    const renderTrack = () => {
        if (sweep >= 360) {
            return (
                <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="none"
                    stroke={trackColorResolved}
                    strokeWidth={computedStroke}
                />
            );
        }
        return (
            <path
                d={trackPathProps.d}
                fill="none"
                stroke={trackColorResolved}
                strokeWidth={computedStroke}
                strokeLinecap={roundedCaps ? 'round' : 'butt'}
            />
        );
    };

    const renderArc = () => {
        if (variant === 'pie') {
            return (
                <>
                    <circle cx={cx} cy={cy} r={radius + computedStroke / 2} fill={trackColorResolved} opacity={0.35} />
                    {piePath && <path d={piePath} fill={fillColor} />}
                </>
            );
        }

        const transitionStyle: React.CSSProperties = reducedMotion
            ? {}
            : { transition: 'stroke-dashoffset 300ms ease, d 300ms ease' };

        if (sweep >= 360) {
            const dashOffset = fullCircumference - filledLength;
            return (
                <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="none"
                    stroke={arcStrokeForVariant}
                    strokeWidth={computedStroke}
                    strokeDasharray={dashArray ?? `${fullCircumference}`}
                    strokeDashoffset={dashArray ? 0 : dashOffset}
                    strokeLinecap={roundedCaps ? 'round' : 'butt'}
                    style={transitionStyle}
                    transform={`rotate(${safeStart - 90} ${cx} ${cy})`}
                />
            );
        }

        return (
            <path
                d={filledPathProps.d}
                fill="none"
                stroke={arcStrokeForVariant}
                strokeWidth={computedStroke}
                strokeDasharray={dashArray}
                strokeLinecap={roundedCaps ? 'round' : 'butt'}
                style={transitionStyle}
            />
        );
    };

    return (
        <div
            id={knobId}
            className={classNames('eui-knob', `eui-knob-${typeof size === 'string' ? size : 'custom'}`, {
                'eui-knob-disabled': disabled,
                'eui-knob-interactive': interactive,
            }, className)}
            style={{ width: dimension, height: dimension }}
        >
            <svg
                ref={svgRef}
                width={dimension}
                height={dimension}
                viewBox={`0 0 ${dimension} ${dimension}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={handleKeyDown}
                {...ariaProps}
            >
                {variant === 'gradient' && gradient && (
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={gradient.from} />
                            <stop offset="100%" stopColor={gradient.to} />
                        </linearGradient>
                    </defs>
                )}
                {variant === 'gradient' && !gradient && (
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={fillColor} stopOpacity={0.6} />
                            <stop offset="100%" stopColor={fillColor} />
                        </linearGradient>
                    </defs>
                )}
                {renderTrack()}
                {renderArc()}
            </svg>
            <div className="eui-knob-center" aria-hidden="true">
                {displayCenter}
            </div>
        </div>
    );
};

export { Knob };
export default Knob;
