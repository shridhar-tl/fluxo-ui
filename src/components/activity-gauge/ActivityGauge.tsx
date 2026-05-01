import classNames from 'classnames';
import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { hideTooltip, showTooltip } from '../tooltip/tooltip-api';
import './ActivityGauge.scss';

export type ActivityGaugeSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ActivityGaugeSeries {
    name: string;
    value: number;
    max?: number;
    color?: string;
}

export interface ActivityGaugeProps {
    series: ActivityGaugeSeries[];
    size?: ActivityGaugeSize | number;
    ringThickness?: number;
    ringGap?: number;
    roundedCaps?: boolean;
    arcStart?: number;
    arcEnd?: number;
    trackColor?: string;
    defaultColors?: string[];
    centerContent?: React.ReactNode;
    centerTitle?: string;
    centerValue?: string | number;
    centerSubLabel?: string;
    legend?: 'bottom' | 'right' | 'none';
    legendPosition?: 'start' | 'center' | 'end';
    interactive?: boolean;
    onSeriesClick?: (index: number) => void;
    animate?: boolean;
    tooltip?: boolean;
    valueFormatter?: (s: { name: string; value: number; max: number }) => string;
    id?: string;
    className?: string;
    ariaLabel?: string;
}

const sizeMap: Record<ActivityGaugeSize, number> = {
    sm: 140,
    md: 200,
    lg: 280,
    xl: 360,
};

const defaultPalette = [
    'var(--eui-primary)',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
    '#3b82f6',
    '#a855f7',
    '#ec4899',
    '#14b8a6',
];

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
        x: cx + r * Math.cos(angleRad),
        y: cy + r * Math.sin(angleRad),
    };
};

const buildArcPath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const delta = endAngle - startAngle;
    if (delta >= 359.999) {
        const top = polarToCartesian(cx, cy, r, 0);
        const bottom = polarToCartesian(cx, cy, r, 180);
        return `M ${top.x} ${top.y} A ${r} ${r} 0 1 1 ${bottom.x} ${bottom.y} A ${r} ${r} 0 1 1 ${top.x} ${top.y}`;
    }
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArc = delta <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
};

const ActivityGauge: React.FC<ActivityGaugeProps> = ({
    series,
    size = 'md',
    ringThickness,
    ringGap = 6,
    roundedCaps = true,
    arcStart = 0,
    arcEnd = 360,
    trackColor,
    defaultColors,
    centerContent,
    centerTitle,
    centerValue,
    centerSubLabel,
    legend = 'bottom',
    legendPosition = 'center',
    interactive = false,
    onSeriesClick,
    animate = true,
    tooltip = true,
    valueFormatter,
    id,
    className,
    ariaLabel,
}) => {
    const generatedId = useId();
    const gaugeId = id ?? `gauge-${generatedId}`;

    const [highlighted, setHighlighted] = useState<number | null>(null);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [animationProgress, setAnimationProgress] = useState(animate ? 0 : 1);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mq.matches);
        const handler = (ev: MediaQueryListEvent) => setReducedMotion(ev.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        if (!animate || reducedMotion) {
            setAnimationProgress(1);
            return;
        }
        setAnimationProgress(0);
        let raf = 0;
        const start = performance.now();
        const duration = 800;
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setAnimationProgress(eased);
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [animate, reducedMotion, series.length]);

    const dimension = typeof size === 'number' ? size : sizeMap[size];
    const palette = defaultColors && defaultColors.length > 0 ? defaultColors : defaultPalette;
    const computedThickness = ringThickness ?? Math.max(8, Math.round(dimension * 0.07));
    const cx = dimension / 2;
    const cy = dimension / 2;
    const trackColorResolved = trackColor ?? 'var(--eui-border-subtle)';
    const sweep = Math.max(1, Math.min(360, arcEnd - arcStart));

    const outerRadius = dimension / 2 - computedThickness / 2 - 4;

    const formatValue = useCallback(
        (s: ActivityGaugeSeries) => {
            const max = s.max ?? 100;
            if (valueFormatter) return valueFormatter({ name: s.name, value: s.value, max });
            const pct = max === 0 ? 0 : Math.round((s.value / max) * 100);
            return `${s.name}: ${s.value}/${max} (${pct}%)`;
        },
        [valueFormatter],
    );

    const ariaSummary = useMemo(() => {
        if (ariaLabel) return ariaLabel;
        return series.map((s) => formatValue(s)).join(', ');
    }, [ariaLabel, series, formatValue]);

    const onRingEnter = (e: React.MouseEvent, index: number) => {
        if (interactive) setHighlighted(index);
        if (tooltip) showTooltip(e, formatValue(series[index]));
    };

    const onRingLeave = () => {
        if (interactive) setHighlighted(null);
        if (tooltip) hideTooltip({ timeout: 0 });
    };

    const onLegendKey = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (interactive) setHighlighted((prev) => (prev === index ? null : index));
            onSeriesClick?.(index);
        }
    };

    const renderCenter = () => {
        if (centerContent) return centerContent;
        if (centerTitle == null && centerValue == null && centerSubLabel == null) return null;
        return (
            <div className="eui-activity-gauge-center-default">
                {centerTitle && <div className="eui-activity-gauge-center-title">{centerTitle}</div>}
                {centerValue != null && <div className="eui-activity-gauge-center-value">{centerValue}</div>}
                {centerSubLabel && <div className="eui-activity-gauge-center-sublabel">{centerSubLabel}</div>}
            </div>
        );
    };

    const orientation = legend === 'right' ? 'horizontal' : 'vertical';

    return (
        <div
            id={gaugeId}
            role="img"
            aria-label={ariaSummary}
            className={classNames(
                'eui-activity-gauge',
                `eui-activity-gauge-legend-${legend}`,
                `eui-activity-gauge-legend-pos-${legendPosition}`,
                {
                    'eui-activity-gauge-interactive': interactive,
                },
                className,
            )}
            data-orientation={orientation}
        >
            <div className="eui-activity-gauge-chart-wrapper" style={{ width: dimension, height: dimension }}>
                <svg
                    width={dimension}
                    height={dimension}
                    viewBox={`0 0 ${dimension} ${dimension}`}
                    className="eui-activity-gauge-svg"
                    aria-hidden={Boolean(centerContent || centerTitle)}
                    style={{ overflow: 'visible' }}
                >
                    {series.map((s, i) => {
                        const max = s.max ?? 100;
                        const safeValue = Math.max(0, Math.min(s.value, max));
                        const ratio = max === 0 ? 0 : safeValue / max;
                        const seriesColor = s.color || palette[i % palette.length];
                        const radius = outerRadius - i * (computedThickness + ringGap);
                        if (radius <= computedThickness) return null;

                        const sweepFilled = sweep * ratio * animationProgress;
                        const trackPath = buildArcPath(cx, cy, radius, arcStart, arcStart + sweep);
                        const fillPath =
                            sweepFilled > 0 ? buildArcPath(cx, cy, radius, arcStart, arcStart + sweepFilled) : null;
                        const isFullTrack = sweep >= 359.999;
                        const isFullFill = sweepFilled >= 359.999;
                        const trackLinecap = roundedCaps && !isFullTrack ? 'round' : 'butt';
                        const fillLinecap = roundedCaps && !isFullFill ? 'round' : 'butt';

                        const isDimmed = highlighted !== null && highlighted !== i;

                        return (
                            <g
                                key={i}
                                className="eui-activity-gauge-ring"
                                style={{ opacity: isDimmed ? 0.3 : 1, transition: reducedMotion ? 'none' : 'opacity 200ms ease' }}
                                onMouseEnter={(e) => onRingEnter(e, i)}
                                onMouseLeave={onRingLeave}
                                onMouseMove={(e) => tooltip && showTooltip(e, formatValue(s))}
                                onClick={() => onSeriesClick?.(i)}
                                tabIndex={interactive ? 0 : -1}
                                onFocus={() => interactive && setHighlighted(i)}
                                onBlur={() => interactive && setHighlighted(null)}
                            >
                                <title>{formatValue(s)}</title>
                                <path
                                    d={trackPath}
                                    fill="none"
                                    stroke={trackColorResolved}
                                    strokeWidth={computedThickness}
                                    strokeLinecap={trackLinecap}
                                />
                                {fillPath && (
                                    <path
                                        d={fillPath}
                                        fill="none"
                                        stroke={seriesColor}
                                        strokeWidth={computedThickness}
                                        strokeLinecap={fillLinecap}
                                    />
                                )}
                            </g>
                        );
                    })}
                </svg>
                <div className="eui-activity-gauge-center" aria-hidden="true">
                    {renderCenter()}
                </div>
            </div>

            {legend !== 'none' && (
                <ul
                    className="eui-activity-gauge-legend"
                    role="list"
                    aria-label={`${series.length} series`}
                >
                    {series.map((s, i) => {
                        const max = s.max ?? 100;
                        const seriesColor = s.color || palette[i % palette.length];
                        const isActive = highlighted === i;
                        const pct = max === 0 ? 0 : Math.round((s.value / max) * 100);
                        return (
                            <li key={i} className="eui-activity-gauge-legend-item">
                                <button
                                    type="button"
                                    className={classNames('eui-activity-gauge-legend-button', {
                                        'eui-activity-gauge-legend-active': isActive,
                                    })}
                                    aria-pressed={interactive ? isActive : undefined}
                                    onClick={() => {
                                        if (interactive) setHighlighted((prev) => (prev === i ? null : i));
                                        onSeriesClick?.(i);
                                    }}
                                    onMouseEnter={() => interactive && setHighlighted(i)}
                                    onMouseLeave={() => interactive && setHighlighted(null)}
                                    onKeyDown={(e) => onLegendKey(e, i)}
                                >
                                    <span className="eui-activity-gauge-legend-dot" style={{ background: seriesColor }} />
                                    <span className="eui-activity-gauge-legend-name">{s.name}</span>
                                    <span className="eui-activity-gauge-legend-value">
                                        {s.value}
                                        <span className="eui-activity-gauge-legend-divider">/</span>
                                        {max}
                                    </span>
                                    <span className="eui-activity-gauge-legend-pct">{pct}%</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export { ActivityGauge };
export default ActivityGauge;
