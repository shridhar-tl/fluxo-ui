import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import cn from 'classnames';

import { getCustomToneStyle, resolveToneClass } from '../../utils/color-tone';
import '../eui-base.scss';
import './Sparkline.scss';
import {
    buildAreaPath,
    buildLinePath,
    computeDomain,
    createXScale,
    createYScale,
    defaultFormat,
    describeArc,
    nearestIndex,
    normalizeData,
    numericValues,
    piePalette,
    resolveReference,
    splitSegments,
} from './sparkline-geometry';
import type { SparklineColor, SparklineDots, SparklinePointInfo, SparklineProps, SparklineReferenceLine, SparklineTrendColors } from './sparkline-types';
import { SparklineTooltip } from './SparklineTooltip';

const seriesTypes = new Set(['line', 'area', 'bar', 'winloss', 'discrete']);
const barTypes = new Set(['bar', 'winloss', 'discrete']);
const defaultTrend: Required<SparklineTrendColors> = { up: 'success', down: 'danger', flat: 'default' };

type CssVars = React.CSSProperties & Record<`--${string}`, string>;

const dotIndices = (mode: SparklineDots, values: (number | null)[]): Set<number> => {
    const result = new Set<number>();
    const valid = values.map((v, i) => (v === null ? -1 : i)).filter((i) => i >= 0);
    if (!valid.length || mode === 'none') return result;
    const first = valid[0];
    const last = valid[valid.length - 1];
    let minIndex = first;
    let maxIndex = first;
    valid.forEach((i) => {
        if ((values[i] as number) < (values[minIndex] as number)) minIndex = i;
        if ((values[i] as number) > (values[maxIndex] as number)) maxIndex = i;
    });
    if (mode === 'all') valid.forEach((i) => result.add(i));
    if (mode === 'last') result.add(last);
    if (mode === 'first-last' || mode === 'extremes') {
        result.add(first);
        result.add(last);
    }
    if (mode === 'min-max' || mode === 'extremes') {
        result.add(minIndex);
        result.add(maxIndex);
    }
    return result;
};

const pickTrendColor = (values: number[], trend: boolean | SparklineTrendColors | undefined, fallback: SparklineColor): SparklineColor => {
    if (!trend || values.length < 2) return fallback;
    const palette = trend === true ? defaultTrend : { ...defaultTrend, ...trend };
    const delta = values[values.length - 1] - values[0];
    if (delta > 0) return palette.up;
    if (delta < 0) return palette.down;
    return palette.flat;
};

const Sparkline = forwardRef<HTMLSpanElement, SparklineProps>(
    (
        {
            data,
            type = 'line',
            width = 120,
            height = 32,
            color = 'primary',
            negativeColor,
            trendColors,
            strokeWidth = 1.75,
            curve = 'smooth',
            fill,
            fillOpacity,
            dots = 'last',
            dotRadius = 2.5,
            minColor,
            maxColor,
            referenceLine,
            band,
            min,
            max,
            threshold = 0,
            barGap = 0.25,
            barRadius = 1,
            connectNulls = false,
            target,
            ranges,
            colors,
            innerRadius = 0,
            animate = true,
            animationDuration = 700,
            interactive = true,
            showCursor = true,
            formatValue,
            renderTooltip,
            onPointHover,
            onPointClick,
            ariaLabel,
            valueLabel,
            className,
            style,
            onKeyDown,
            onFocus,
            onBlur,
            ...rest
        },
        ref,
    ) => {
        const wrapperRef = useRef<HTMLSpanElement | null>(null);
        const [svgElement, setSvgElement] = useState<SVGSVGElement | null>(null);
        const [measuredWidth, setMeasuredWidth] = useState(0);
        const [active, setActive] = useState<number | null>(null);
        const activeRef = useRef<number | null>(null);
        const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
        const gradientId = `eui-spark-grad-${uid}`;
        const tooltipId = `eui-spark-tip-${uid}`;
        const fluid = typeof width === 'string';

        const setRefs = useCallback(
            (node: HTMLSpanElement | null) => {
                wrapperRef.current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) ref.current = node;
            },
            [ref],
        );

        useEffect(() => {
            const node = wrapperRef.current;
            if (!fluid || !node) return;
            setMeasuredWidth(node.clientWidth);
            if (typeof ResizeObserver === 'undefined') return;
            const observer = new ResizeObserver((entries) => {
                const next = Math.floor(entries[0]?.contentRect.width ?? 0);
                setMeasuredWidth((prev) => (prev === next ? prev : next));
            });
            observer.observe(node);
            return () => observer.disconnect();
        }, [fluid]);

        const items = useMemo(() => normalizeData(data), [data]);
        const values = useMemo(() => numericValues(items), [items]);
        const rawValues = useMemo(() => items.map((d) => d.value), [items]);
        const w = fluid ? measuredWidth : (width as number);
        const h = height;
        const format = useCallback((value: number, index: number) => (formatValue ? formatValue(value, index) : defaultFormat(value)), [formatValue]);

        const effectiveColor = pickTrendColor(values, trendColors, color);
        const reference = useMemo<SparklineReferenceLine | null>(
            () => (referenceLine === undefined ? null : typeof referenceLine === 'object' ? referenceLine : { value: referenceLine }),
            [referenceLine],
        );
        const isBar = barTypes.has(type);
        const isSeries = seriesTypes.has(type);
        const effectiveFill = fill ?? (type === 'area' ? 'gradient' : 'none');

        const geometry = useMemo(() => {
            const pad = Math.max(strokeWidth, dotRadius + 0.5, 1) + 0.5;
            const left = isBar ? 0 : pad;
            const right = isBar ? w : w - pad;
            const top = pad;
            const bottom = h - pad;
            const extras: number[] = [];
            let refValue: number | null = null;
            if (reference) {
                refValue = resolveReference(reference.value, values);
                extras.push(refValue);
            }
            if (band) extras.push(band.from, band.to);
            if (isBar || effectiveFill !== 'none') {
                if (type === 'bar' || type === 'area') extras.push(0);
            }
            const domain = computeDomain(values, extras, min, max);
            const y = createYScale(domain, top, bottom);
            const n = items.length;
            const step = n > 0 ? (right - left) / n : 0;
            const x = isBar ? (i: number) => left + step * (i + 0.5) : createXScale(n, left, right);
            const baselineY = y(Math.min(domain.max, Math.max(domain.min, 0)));
            return { pad, left, right, top, bottom, domain, y, x, step, baselineY, refValue };
        }, [strokeWidth, dotRadius, isBar, w, h, reference, values, band, effectiveFill, type, min, max, items.length]);

        const firstValid = rawValues.findIndex((v) => v !== null);
        const lastValid = rawValues.length - 1 - [...rawValues].reverse().findIndex((v) => v !== null);
        const hasValues = values.length > 0;

        const pointInfo = useCallback(
            (index: number): SparklinePointInfo => ({ index, value: items[index]?.value ?? null, label: items[index]?.label }),
            [items],
        );

        const updateActive = useCallback(
            (index: number | null) => {
                if (activeRef.current === index) return;
                activeRef.current = index;
                setActive(index);
                onPointHover?.(index === null ? null : pointInfo(index));
            },
            [onPointHover, pointInfo],
        );

        useEffect(() => {
            if (active === null) return;
            const onPointerDown = (event: PointerEvent) => {
                if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) updateActive(null);
            };
            document.addEventListener('pointerdown', onPointerDown);
            return () => document.removeEventListener('pointerdown', onPointerDown);
        }, [active, updateActive]);

        const stepIndex = (from: number, direction: 1 | -1): number => {
            let i = from + direction;
            while (i >= 0 && i < items.length) {
                if (items[i].value !== null) return i;
                i += direction;
            }
            return from;
        };

        const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
            if (!interactive || !hasValues) return;
            if (type === 'bullet') {
                updateActive(firstValid);
                return;
            }
            if (!isSeries) return;
            const rect = event.currentTarget.getBoundingClientRect();
            const index = nearestIndex(items, geometry.x, event.clientX - rect.left);
            updateActive(index >= 0 ? index : null);
        };

        const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || !interactive || !hasValues) return;
            if (event.key === 'Escape') {
                if (active === null) return;
                event.preventDefault();
                updateActive(null);
                return;
            }
            const pinned = type === 'bullet';
            const current = active ?? (pinned ? firstValid : lastValid);
            let next: number;
            if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = pinned ? firstValid : stepIndex(current, 1);
            else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = pinned ? firstValid : stepIndex(current, -1);
            else if (event.key === 'Home') next = firstValid;
            else if (event.key === 'End') next = pinned ? firstValid : lastValid;
            else if ((event.key === 'Enter' || event.key === ' ') && active !== null) {
                event.preventDefault();
                onPointClick?.(pointInfo(active));
                return;
            } else return;
            event.preventDefault();
            updateActive(next);
        };

        const handleClick = () => {
            if (active !== null) onPointClick?.(pointInfo(active));
        };

        const total = useMemo(() => values.reduce((sum, v) => sum + Math.max(0, v), 0), [values]);

        const pieSlices = useMemo(() => {
            if (type !== 'pie' || total <= 0) return [];
            const cx = w / 2;
            const cy = h / 2;
            const outer = Math.max(1, Math.min(w, h) / 2 - 1);
            const inner = outer * Math.min(0.9, Math.max(0, innerRadius));
            let angle = 0;
            return items.map((item, index) => {
                const v = Math.max(0, item.value ?? 0);
                const sweep = (v / total) * Math.PI * 2;
                const start = angle;
                angle += sweep;
                const mid = start + sweep / 2;
                const anchorR = inner > 0 ? (inner + outer) / 2 : outer * 0.6;
                return {
                    index,
                    path: v > 0 ? describeArc(cx, cy, outer, inner, start, angle) : '',
                    color: item.color ?? colors?.[index % colors.length] ?? piePalette[index % piePalette.length],
                    anchor: { x: cx + anchorR * Math.sin(mid), y: cy - anchorR * Math.cos(mid) },
                };
            });
        }, [type, total, w, h, innerRadius, items, colors]);

        const bullet = useMemo(() => {
            if (type !== 'bullet') return null;
            const value = values[0] ?? 0;
            const scaleMax = Math.max(max ?? 0, value, target ?? 0, ...(ranges ?? []), 1);
            const sx = (v: number) => (Math.max(0, v) / scaleMax) * w;
            const sortedRanges = [...(ranges ?? [])].sort((a, b) => b - a);
            return { value, sx, sortedRanges };
        }, [type, values, max, target, ranges, w]);

        const anchor = useMemo(() => {
            if (active === null || items[active]?.value === null || items[active] === undefined) return null;
            if (type === 'pie') return pieSlices[active]?.anchor ?? null;
            if (type === 'bullet' && bullet) return { x: bullet.sx(bullet.value), y: h / 2 - h * 0.2 };
            if (type === 'winloss') {
                const v = items[active].value as number;
                return { x: geometry.x(active), y: v >= 0 ? geometry.top : h / 2 };
            }
            return { x: geometry.x(active), y: geometry.y(items[active].value as number) };
        }, [active, items, type, pieSlices, bullet, h, geometry]);

        const activeText = (() => {
            if (active === null || items[active]?.value === null || items[active] === undefined) return '';
            const value = items[active].value as number;
            const label = items[active].label ?? `${valueLabel ? `${valueLabel} ` : ''}point ${active + 1} of ${items.length}`;
            if (type === 'pie' && total > 0) return `${label}: ${format(value, active)} (${Math.round((value / total) * 100)}%)`;
            if (type === 'bullet' && target !== undefined) return `${label}: ${format(value, active)}, target ${format(target, active)}`;
            return `${label}: ${format(value, active)}`;
        })();

        const summary = (() => {
            if (ariaLabel) return ariaLabel;
            if (!hasValues) return 'Sparkline with no data';
            const lo = Math.min(...values);
            const hi = Math.max(...values);
            const prefix = valueLabel ? `${valueLabel} ` : '';
            if (type === 'pie') return `${prefix}pie chart with ${values.length} slices, total ${format(total, 0)}`;
            if (type === 'bullet') return `${prefix}bullet chart, value ${format(values[0], 0)}${target !== undefined ? `, target ${format(target, 0)}` : ''}`;
            return `${prefix}${type} sparkline, ${values.length} points, from ${format(values[0], firstValid)} to ${format(values[values.length - 1], lastValid)}, low ${format(lo, 0)}, high ${format(hi, 0)}`;
        })();

        const dotSet = useMemo(() => (type === 'line' || type === 'area' ? dotIndices(dots, rawValues) : new Set<number>()), [type, dots, rawValues]);
        const minIndex = hasValues ? rawValues.indexOf(Math.min(...values)) : -1;
        const maxIndex = hasValues ? rawValues.indexOf(Math.max(...values)) : -1;

        const renderSeries = () => {
            const { x, y, baselineY, step, top, bottom } = geometry;
            if (type === 'line' || type === 'area') {
                const segments = splitSegments(items, connectNulls, x, y);
                return (
                    <>
                        {effectiveFill !== 'none' &&
                            segments.map((segment, i) => (
                                <path
                                    key={`a${i}`}
                                    className="eui-sparkline-area"
                                    d={buildAreaPath(segment, curve, baselineY)}
                                    fill={effectiveFill === 'gradient' ? `url(#${gradientId})` : 'currentColor'}
                                    fillOpacity={effectiveFill === 'solid' ? (fillOpacity ?? 0.18) : undefined}
                                />
                            ))}
                        {segments.map((segment, i) => (
                            <path
                                key={`l${i}`}
                                className="eui-sparkline-line"
                                d={buildLinePath(segment, curve)}
                                pathLength={1}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        ))}
                        {[...dotSet].map((index) => {
                            const value = items[index].value as number;
                            const dotClass = cn('eui-sparkline-dot', {
                                'eui-sparkline-dot-min': (dots === 'min-max' || dots === 'extremes') && index === minIndex,
                                'eui-sparkline-dot-max': (dots === 'min-max' || dots === 'extremes') && index === maxIndex,
                            });
                            return <circle key={`d${index}`} className={dotClass} cx={x(index)} cy={y(value)} r={dotRadius} />;
                        })}
                    </>
                );
            }
            const barWidth = Math.max(1, step * (1 - Math.min(0.9, Math.max(0, barGap))));
            if (type === 'bar') {
                return items.map((item, index) => {
                    if (item.value === null) return null;
                    const yValue = y(item.value);
                    const yTop = Math.min(yValue, baselineY);
                    const barHeight = Math.max(1, Math.abs(baselineY - yValue));
                    const negative = item.value < threshold;
                    return (
                        <rect
                            key={index}
                            className={cn('eui-sparkline-bar', {
                                'eui-sparkline-bar-negative': negative,
                                'eui-sparkline-bar-down': item.value < 0,
                                'eui-sparkline-bar-dim': active !== null && active !== index,
                            })}
                            x={x(index) - barWidth / 2}
                            y={yTop}
                            width={barWidth}
                            height={barHeight}
                            rx={Math.min(barRadius, barWidth / 2)}
                            style={item.color ? { fill: item.color } : undefined}
                        />
                    );
                });
            }
            if (type === 'winloss') {
                const mid = h / 2;
                return items.map((item, index) => {
                    if (item.value === null) return null;
                    const cls = item.value > 0 ? 'eui-sparkline-win' : item.value < 0 ? 'eui-sparkline-loss' : 'eui-sparkline-draw';
                    const barTop = item.value > 0 ? top : item.value < 0 ? mid + 1 : mid - 1;
                    const barHeight = item.value === 0 ? 2 : mid - top - 1;
                    return (
                        <rect
                            key={index}
                            className={cn('eui-sparkline-bar', cls, {
                                'eui-sparkline-bar-down': item.value < 0,
                                'eui-sparkline-bar-dim': active !== null && active !== index,
                            })}
                            x={x(index) - barWidth / 2}
                            y={barTop}
                            width={barWidth}
                            height={Math.max(1, barHeight)}
                            rx={Math.min(barRadius, barWidth / 2)}
                            style={item.color ? { fill: item.color } : undefined}
                        />
                    );
                });
            }
            const tick = Math.max(3, (bottom - top) * 0.35);
            const tickWidth = Math.max(1, Math.min(barWidth, 2.5));
            return items.map((item, index) => {
                if (item.value === null) return null;
                const cy = y(item.value);
                const yTop = Math.max(top, Math.min(bottom - tick, cy - tick / 2));
                return (
                    <rect
                        key={index}
                        className={cn('eui-sparkline-tick', {
                            'eui-sparkline-bar-negative': item.value < threshold,
                            'eui-sparkline-bar-dim': active !== null && active !== index,
                        })}
                        x={x(index) - tickWidth / 2}
                        y={yTop}
                        width={tickWidth}
                        height={tick}
                        style={item.color ? { fill: item.color } : undefined}
                    />
                );
            });
        };

        const renderBullet = () => {
            if (!bullet) return null;
            const shades = [0.12, 0.2, 0.3, 0.4];
            const barH = h * 0.4;
            return (
                <>
                    {bullet.sortedRanges.map((range, i) => (
                        <rect
                            key={`r${i}`}
                            className="eui-sparkline-range"
                            x={0}
                            y={0}
                            width={bullet.sx(range)}
                            height={h}
                            fillOpacity={shades[Math.min(shades.length - 1, i)]}
                        />
                    ))}
                    {bullet.sortedRanges.length === 0 && <rect className="eui-sparkline-range" x={0} y={0} width={w} height={h} fillOpacity={0.12} />}
                    <rect className="eui-sparkline-bullet-bar" x={0} y={(h - barH) / 2} width={bullet.sx(bullet.value)} height={barH} />
                    {target !== undefined && (
                        <rect className="eui-sparkline-target" x={Math.min(w - 2, Math.max(0, bullet.sx(target) - 1))} y={h * 0.15} width={2} height={h * 0.7} />
                    )}
                </>
            );
        };

        const renderPie = () => {
            if (total <= 0) {
                const r = Math.max(1, Math.min(w, h) / 2 - 1);
                return <circle className="eui-sparkline-pie-empty" cx={w / 2} cy={h / 2} r={r} />;
            }
            return pieSlices.map((slice) =>
                slice.path ? (
                    <path
                        key={slice.index}
                        className={cn('eui-sparkline-slice', { 'eui-sparkline-slice-dim': active !== null && active !== slice.index })}
                        d={slice.path}
                        style={{ fill: slice.color }}
                        onPointerEnter={() => interactive && updateActive(slice.index)}
                    />
                ) : null,
            );
        };

        const renderOverlays = () => {
            const { y, top, bottom, refValue } = geometry;
            return (
                <>
                    {band && (
                        <rect
                            className="eui-sparkline-band"
                            x={0}
                            width={w}
                            y={Math.min(y(band.from), y(band.to))}
                            height={Math.max(1, Math.abs(y(band.from) - y(band.to)))}
                            style={band.color ? { fill: band.color, fillOpacity: 1 } : undefined}
                        />
                    )}
                    {reference && refValue !== null && (
                        <line
                            className={cn('eui-sparkline-reference', { 'eui-sparkline-reference-solid': reference.dashed === false })}
                            x1={0}
                            x2={w}
                            y1={y(refValue)}
                            y2={y(refValue)}
                            style={reference.color ? { stroke: reference.color } : undefined}
                        >
                            {reference.label && <title>{reference.label}</title>}
                        </line>
                    )}
                    {interactive && showCursor && active !== null && isSeries && items[active]?.value !== null && (
                        <line className="eui-sparkline-cursor" x1={geometry.x(active)} x2={geometry.x(active)} y1={top - geometry.pad + 0.5} y2={bottom + geometry.pad - 0.5} />
                    )}
                </>
            );
        };

        const renderActiveDot = () => {
            if (!interactive || active === null || (type !== 'line' && type !== 'area')) return null;
            const value = items[active]?.value;
            if (value === null || value === undefined) return null;
            return <circle className="eui-sparkline-active-dot" cx={geometry.x(active)} cy={geometry.y(value)} r={dotRadius + 1.5} />;
        };

        const styleVars: CssVars = {
            ...(getCustomToneStyle(effectiveColor) as CssVars),
            '--eui-sparkline-duration': `${animationDuration}ms`,
            ...(negativeColor ? { '--eui-sparkline-negative': negativeColor } : null),
            ...(minColor ? { '--eui-sparkline-min': minColor } : null),
            ...(maxColor ? { '--eui-sparkline-max': maxColor } : null),
            ...(fluid ? { width: width as string } : { width: `${w}px` }),
            height: `${h}px`,
            ...style,
        };

        const tooltipContent = active !== null && renderTooltip ? renderTooltip(pointInfo(active)) : activeText;

        return (
            <span
                ref={setRefs}
                {...rest}
                role={interactive ? 'group' : 'img'}
                aria-roledescription={interactive ? 'sparkline' : undefined}
                aria-label={summary}
                aria-describedby={interactive && anchor ? tooltipId : undefined}
                tabIndex={interactive && hasValues ? 0 : undefined}
                className={cn(
                    'eui-sparkline',
                    `eui-sparkline-${type}`,
                    resolveToneClass('eui-sparkline', effectiveColor),
                    {
                        'eui-sparkline-animate': animate,
                        'eui-sparkline-interactive': interactive && hasValues,
                        'eui-sparkline-clickable': Boolean(onPointClick),
                    },
                    className,
                )}
                style={styleVars}
                onKeyDown={handleKeyDown}
                onFocus={(event) => {
                    onFocus?.(event);
                    if (interactive && hasValues && event.target === event.currentTarget && active === null) updateActive(type === 'bullet' ? firstValid : lastValid);
                }}
                onBlur={(event) => {
                    onBlur?.(event);
                    if (!event.currentTarget.contains(event.relatedTarget as Node)) updateActive(null);
                }}
            >
                {w > 0 && (
                    <svg
                        ref={setSvgElement}
                        className="eui-sparkline-svg"
                        width={w}
                        height={h}
                        viewBox={`0 0 ${w} ${h}`}
                        aria-hidden="true"
                        focusable="false"
                        onPointerMove={handlePointerMove}
                        onPointerDown={handlePointerMove}
                        onPointerLeave={(event) => {
                            if (event.pointerType === 'mouse') updateActive(null);
                        }}
                        onClick={handleClick}
                    >
                        {effectiveFill === 'gradient' && (
                            <defs>
                                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="currentColor" stopOpacity={fillOpacity ?? 0.35} />
                                    <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                        )}
                        {isSeries && renderOverlays()}
                        {isSeries && renderSeries()}
                        {type === 'bullet' && renderBullet()}
                        {type === 'pie' && renderPie()}
                        {renderActiveDot()}
                    </svg>
                )}
                {interactive && (
                    <span className="eui-visually-hidden" aria-live="polite" aria-atomic="true">
                        {activeText}
                    </span>
                )}
                {interactive && (
                    <SparklineTooltip svg={svgElement} anchor={anchor} id={tooltipId}>
                        {tooltipContent}
                    </SparklineTooltip>
                )}
            </span>
        );
    },
);

Sparkline.displayName = 'Sparkline';

export { Sparkline };
