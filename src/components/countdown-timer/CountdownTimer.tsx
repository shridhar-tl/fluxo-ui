import cn from 'classnames';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import './CountdownTimer.scss';

export type CountdownTimerVariant = 'circular' | 'linear' | 'segmented' | 'numeric' | 'rounded-square' | 'triangle';
export type CountdownTimerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type CountdownTimerColor = 'primary' | 'success' | 'warning' | 'danger';

export interface ColorThreshold {
    at: number;
    color: CountdownTimerColor | string;
}

export interface CountdownTimerProps {
    duration: number;
    variant?: CountdownTimerVariant;
    size?: CountdownTimerSize;
    autoStart?: boolean;
    repeat?: boolean;
    countUp?: boolean;
    color?: CountdownTimerColor | string;
    colorThresholds?: ColorThreshold[];
    segmentCount?: number;
    showControls?: boolean;
    pauseOnHover?: boolean;
    disabled?: boolean;
    disabledMessage?: string;
    pulseWhenRunning?: boolean;
    announceInterval?: number;
    announceFinalSeconds?: number;
    announceOnComplete?: boolean;
    announcePoliteness?: 'polite' | 'assertive';
    criticalThreshold?: number;
    onCriticalThreshold?: (remaining: number) => void;
    className?: string;
    style?: React.CSSProperties;
    onComplete?: () => void;
    onTick?: (remaining: number, elapsed: number) => void;
    onPause?: (remaining: number) => void;
    onResume?: (remaining: number) => void;
    onReset?: () => void;
}

export interface CountdownTimerHandle {
    pause: () => void;
    resume: () => void;
    reset: () => void;
    start: () => void;
}

const formatTime = (totalSeconds: number): { display: string; unit: string; hours: number; minutes: number; seconds: number; days: number } => {
    const absSeconds = Math.max(0, Math.round(totalSeconds));
    const days = Math.floor(absSeconds / 86400);
    const hours = Math.floor((absSeconds % 86400) / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const seconds = absSeconds % 60;

    if (days > 0) {
        return { display: `${days}d ${String(hours).padStart(2, '0')}h`, unit: 'remaining', days, hours, minutes, seconds };
    }
    if (hours > 0) {
        return { display: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`, unit: 'hrs', days, hours, minutes, seconds };
    }
    if (minutes > 0) {
        return { display: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`, unit: 'min', days, hours, minutes, seconds };
    }
    return { display: String(seconds), unit: 'sec', days, hours, minutes, seconds };
};

const formatAnnouncementText = (totalSeconds: number): string => {
    const absSeconds = Math.max(0, Math.round(totalSeconds));
    const days = Math.floor(absSeconds / 86400);
    const hours = Math.floor((absSeconds % 86400) / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const seconds = absSeconds % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);

    return `${parts.join(', ')} remaining`;
};

const resolveColor = (
    remaining: number,
    duration: number,
    baseColor: CountdownTimerColor | string,
    thresholds?: ColorThreshold[],
): { colorClass: string; customColor: string | null } => {
    const mapColor = (c: string): { colorClass: string; customColor: string | null } => {
        if (c === 'primary') return { colorClass: '', customColor: null };
        if (c === 'success' || c === 'warning' || c === 'danger') return { colorClass: `eui-countdown-timer-color-${c}`, customColor: null };
        return { colorClass: 'eui-countdown-timer-color-custom', customColor: c };
    };

    if (thresholds && thresholds.length > 0) {
        const pct = duration > 0 ? (remaining / duration) * 100 : 0;
        const sorted = [...thresholds].sort((a, b) => b.at - a.at);
        for (const t of sorted) {
            if (pct <= t.at) {
                return mapColor(t.color);
            }
        }
    }

    return mapColor(baseColor);
};

const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
);

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5v14l11-7L8 5z" />
    </svg>
);

const ResetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </svg>
);

const CircularVariant: React.FC<{
    remaining: number;
    duration: number;
    size: CountdownTimerSize;
    colorClass: string;
    customColor: string | null;
}> = ({ remaining, duration, size, colorClass, customColor }) => {
    const sizePx: Record<CountdownTimerSize, number> = { xs: 64, sm: 88, md: 120, lg: 160, xl: 200 };
    const strokeWidths: Record<CountdownTimerSize, number> = { xs: 4, sm: 5, md: 6, lg: 8, xl: 10 };

    const diameter = sizePx[size];
    const strokeWidth = strokeWidths[size];
    const radius = (diameter - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = duration > 0 ? remaining / duration : 0;
    const offset = circumference * (1 - progress);
    const cx = diameter / 2;

    const { display, unit } = formatTime(remaining);
    const strokeStyle: React.CSSProperties = {};
    if (customColor) strokeStyle.stroke = customColor;

    return (
        <div className="eui-countdown-timer-ring-wrap">
            <svg className="eui-countdown-timer-svg" viewBox={`0 0 ${diameter} ${diameter}`} aria-hidden="true">
                <circle className="eui-countdown-timer-track" cx={cx} cy={cx} r={radius} strokeWidth={strokeWidth} />
                <circle
                    className={cn('eui-countdown-timer-progress-arc', colorClass)}
                    cx={cx} cy={cx} r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={strokeStyle}
                />
            </svg>
            <div className="eui-countdown-timer-center">
                <span className="eui-countdown-timer-time">{display}</span>
                <span className="eui-countdown-timer-unit">{unit}</span>
            </div>
        </div>
    );
};

const RoundedSquareVariant: React.FC<{
    remaining: number;
    duration: number;
    size: CountdownTimerSize;
    colorClass: string;
    customColor: string | null;
}> = ({ remaining, duration, size, colorClass, customColor }) => {
    const sizePx: Record<CountdownTimerSize, number> = { xs: 64, sm: 88, md: 120, lg: 160, xl: 200 };
    const strokeWidths: Record<CountdownTimerSize, number> = { xs: 4, sm: 5, md: 6, lg: 8, xl: 10 };
    const radii: Record<CountdownTimerSize, number> = { xs: 10, sm: 14, md: 18, lg: 24, xl: 30 };

    const diameter = sizePx[size];
    const strokeWidth = strokeWidths[size];
    const rx = radii[size];
    const half = strokeWidth / 2;
    const w = diameter - strokeWidth;
    const h = diameter - strokeWidth;
    const perimeter = 2 * (w + h) - (8 - 2 * Math.PI) * rx;
    const progress = duration > 0 ? remaining / duration : 0;
    const offset = perimeter * (1 - progress);

    const { display, unit } = formatTime(remaining);
    const strokeStyle: React.CSSProperties = {};
    if (customColor) strokeStyle.stroke = customColor;

    return (
        <div className="eui-countdown-timer-ring-wrap">
            <svg className="eui-countdown-timer-svg" viewBox={`0 0 ${diameter} ${diameter}`} aria-hidden="true">
                <rect
                    className="eui-countdown-timer-track"
                    x={half} y={half} width={w} height={h} rx={rx}
                    strokeWidth={strokeWidth}
                />
                <rect
                    className={cn('eui-countdown-timer-progress-arc', colorClass)}
                    x={half} y={half} width={w} height={h} rx={rx}
                    strokeWidth={strokeWidth}
                    strokeDasharray={perimeter}
                    strokeDashoffset={offset}
                    style={strokeStyle}
                />
            </svg>
            <div className="eui-countdown-timer-center">
                <span className="eui-countdown-timer-time">{display}</span>
                <span className="eui-countdown-timer-unit">{unit}</span>
            </div>
        </div>
    );
};

const TriangleVariant: React.FC<{
    remaining: number;
    duration: number;
    size: CountdownTimerSize;
    colorClass: string;
    customColor: string | null;
}> = ({ remaining, duration, size, colorClass, customColor }) => {
    const sizePx: Record<CountdownTimerSize, number> = { xs: 64, sm: 88, md: 120, lg: 160, xl: 200 };
    const strokeWidths: Record<CountdownTimerSize, number> = { xs: 3, sm: 4, md: 5, lg: 7, xl: 9 };

    const svgSize = sizePx[size];
    const strokeWidth = strokeWidths[size];
    const pad = strokeWidth + 2;

    const cx = svgSize / 2;
    const top = { x: cx, y: pad };
    const bottomLeft = { x: pad, y: svgSize - pad };
    const bottomRight = { x: svgSize - pad, y: svgSize - pad };

    const sideLen = Math.sqrt(Math.pow(top.x - bottomLeft.x, 2) + Math.pow(top.y - bottomLeft.y, 2));
    const bottomLen = bottomRight.x - bottomLeft.x;
    const perimeter = 2 * sideLen + bottomLen;

    const progress = duration > 0 ? remaining / duration : 0;
    const offset = perimeter * (1 - progress);

    const points = `${top.x},${top.y} ${bottomLeft.x},${bottomLeft.y} ${bottomRight.x},${bottomRight.y}`;
    const { display, unit } = formatTime(remaining);
    const strokeStyle: React.CSSProperties = {};
    if (customColor) strokeStyle.stroke = customColor;

    const textY = (top.y + bottomLeft.y + bottomRight.y) / 3;

    return (
        <div className="eui-countdown-timer-ring-wrap">
            <svg className="eui-countdown-timer-svg" viewBox={`0 0 ${svgSize} ${svgSize}`} aria-hidden="true">
                <polygon
                    className="eui-countdown-timer-track"
                    points={points}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                />
                <polygon
                    className={cn('eui-countdown-timer-progress-arc', colorClass)}
                    points={points}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    strokeDasharray={perimeter}
                    strokeDashoffset={offset}
                    style={strokeStyle}
                />
            </svg>
            <div className="eui-countdown-timer-center" style={{ marginTop: `${(textY / svgSize) * 10}%` }}>
                <span className="eui-countdown-timer-time">{display}</span>
                <span className="eui-countdown-timer-unit">{unit}</span>
            </div>
        </div>
    );
};

const LinearVariant: React.FC<{
    remaining: number;
    duration: number;
    colorClass: string;
    customColor: string | null;
}> = ({ remaining, duration, colorClass, customColor }) => {
    const progress = duration > 0 ? (remaining / duration) * 100 : 0;
    const { display } = formatTime(remaining);

    const fillStyle: React.CSSProperties = { width: `${progress}%` };
    if (customColor) fillStyle.background = customColor;

    return (
        <>
            <div className="eui-countdown-timer-linear-header">
                <span className="eui-countdown-timer-time">{display}</span>
                <span style={{ fontSize: '11px', color: 'var(--eui-text-muted)' }}>{Math.round(progress)}%</span>
            </div>
            <div className="eui-countdown-timer-bar-track">
                <div className={cn('eui-countdown-timer-bar-fill', colorClass)} style={fillStyle} />
            </div>
        </>
    );
};

const segSizePx: Record<CountdownTimerSize, number> = { xs: 10, sm: 14, md: 18, lg: 24, xl: 30 };
const segGapPx: Record<CountdownTimerSize, number> = { xs: 2, sm: 3, md: 3, lg: 4, xl: 4 };

const SegmentedVariant: React.FC<{
    remaining: number;
    duration: number;
    segmentCount: number;
    size: CountdownTimerSize;
    colorClass: string;
    customColor: string | null;
}> = ({ remaining, duration, segmentCount, size, colorClass, customColor }) => {
    const filledCount = duration > 0 ? Math.ceil((remaining / duration) * segmentCount) : 0;
    const { display } = formatTime(remaining);
    const px = segSizePx[size];
    const gap = segGapPx[size];

    const filledStyle: React.CSSProperties = {};
    if (customColor) filledStyle.background = customColor;

    return (
        <>
            <div
                className="eui-countdown-timer-seg-track"
                style={{ gridTemplateColumns: `repeat(${segmentCount}, ${px}px)`, gap }}
            >
                {Array.from({ length: segmentCount }, (_, i) => {
                    const filled = i < filledCount;
                    return (
                        <div
                            key={i}
                            className={cn('eui-countdown-timer-seg', colorClass, {
                                'eui-countdown-timer-seg-empty': !filled,
                            })}
                            style={filled && customColor ? filledStyle : undefined}
                        />
                    );
                })}
            </div>
            <div className="eui-countdown-timer-time">{display}</div>
        </>
    );
};

const NumericVariant: React.FC<{
    remaining: number;
    colorClass: string;
    customColor: string | null;
}> = ({ remaining, colorClass, customColor }) => {
    const { days, hours, minutes, seconds } = formatTime(remaining);

    const digitStyle: React.CSSProperties = {};
    if (customColor) digitStyle.color = customColor;

    const showDays = days > 0;
    const showHours = hours > 0 || days > 0;

    return (
        <div className={cn('eui-countdown-timer-digits', colorClass)} style={digitStyle}>
            {showDays && (
                <>
                    <span className="eui-countdown-timer-digit-group">
                        <span>{String(days).padStart(2, '0')}</span>
                        <span className="eui-countdown-timer-digit-label">d</span>
                    </span>
                    <span className="eui-countdown-timer-colon">:</span>
                </>
            )}
            {showHours && (
                <>
                    <span className="eui-countdown-timer-digit-group">
                        <span>{String(hours).padStart(2, '0')}</span>
                        <span className="eui-countdown-timer-digit-label">h</span>
                    </span>
                    <span className="eui-countdown-timer-colon">:</span>
                </>
            )}
            <span className="eui-countdown-timer-digit-group">
                <span>{String(minutes).padStart(2, '0')}</span>
                <span className="eui-countdown-timer-digit-label">m</span>
            </span>
            <span className="eui-countdown-timer-colon">:</span>
            <span className="eui-countdown-timer-digit-group">
                <span>{String(seconds).padStart(2, '0')}</span>
                <span className="eui-countdown-timer-digit-label">s</span>
            </span>
        </div>
    );
};

export const CountdownTimer = React.forwardRef<CountdownTimerHandle, CountdownTimerProps>(
    (
        {
            duration,
            variant = 'circular',
            size = 'md',
            autoStart = true,
            repeat = false,
            countUp = false,
            color = 'primary',
            colorThresholds,
            segmentCount = 20,
            showControls = true,
            pauseOnHover = false,
            disabled = false,
            disabledMessage = 'Off',
            pulseWhenRunning = false,
            announceInterval,
            announceFinalSeconds,
            announceOnComplete = false,
            announcePoliteness = 'polite',
            criticalThreshold,
            onCriticalThreshold,
            className,
            style,
            onComplete,
            onTick,
            onPause,
            onResume,
            onReset,
        },
        ref,
    ) => {
        const [remaining, setRemaining] = useState(countUp ? 0 : duration);
        const [running, setRunning] = useState(autoStart && !disabled);
        const [completed, setCompleted] = useState(false);
        const [hovering, setHovering] = useState(false);
        const [announcement, setAnnouncement] = useState('');

        const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
        const remainingRef = useRef(countUp ? 0 : duration);
        const runningRef = useRef(autoStart && !disabled);
        const lastIntervalAnnounceRef = useRef<number | null>(null);
        const criticalFiredRef = useRef<boolean>(false);
        const onCriticalThresholdRef = useRef(onCriticalThreshold);

        useEffect(() => {
            onCriticalThresholdRef.current = onCriticalThreshold;
        }, [onCriticalThreshold]);

        const clearTimer = useCallback(() => {
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }, []);

        const handleComplete = useCallback(() => {
            clearTimer();
            setRunning(false);
            runningRef.current = false;
            setCompleted(true);
            if (announceOnComplete) {
                setAnnouncement('Timer complete');
            }
            onComplete?.();
            if (repeat) {
                const resetVal = countUp ? 0 : duration;
                remainingRef.current = resetVal;
                setRemaining(resetVal);
                setCompleted(false);
                lastIntervalAnnounceRef.current = null;
                criticalFiredRef.current = false;
            }
        }, [clearTimer, onComplete, repeat, countUp, duration, announceOnComplete]);

        const startTicking = useCallback(() => {
            clearTimer();
            intervalRef.current = setInterval(() => {
                const current = remainingRef.current;
                const next = countUp ? current + 1 : current - 1;
                const done = countUp ? next >= duration : next <= 0;
                const clamped = countUp ? Math.min(next, duration) : Math.max(next, 0);

                remainingRef.current = clamped;
                setRemaining(clamped);
                onTick?.(countUp ? duration - clamped : clamped, countUp ? clamped : duration - clamped);

                if (done) handleComplete();
            }, 1000);
        }, [clearTimer, countUp, duration, handleComplete, onTick]);

        useEffect(() => {
            if (running && !disabled) {
                if (pauseOnHover && hovering) {
                    clearTimer();
                } else {
                    startTicking();
                }
            } else {
                clearTimer();
            }
            return clearTimer;
        }, [running, disabled, hovering, pauseOnHover, startTicking, clearTimer]);

        useEffect(() => {
            const resetVal = countUp ? 0 : duration;
            remainingRef.current = resetVal;
            setRemaining(resetVal);
            setCompleted(false);
            lastIntervalAnnounceRef.current = null;
            criticalFiredRef.current = false;
            if (autoStart && !disabled) {
                setRunning(true);
                runningRef.current = true;
            }
        }, [duration]);

        useEffect(() => {
            if (!running || disabled) return;
            const remainingSec = countUp ? duration - remaining : remaining;

            if (criticalThreshold !== undefined && remainingSec > 0 && remainingSec <= criticalThreshold && !criticalFiredRef.current) {
                criticalFiredRef.current = true;
                onCriticalThresholdRef.current?.(remainingSec);
            }

            if (announceFinalSeconds !== undefined && remainingSec > 0 && remainingSec <= announceFinalSeconds) {
                setAnnouncement(formatAnnouncementText(remainingSec));
                return;
            }

            if (announceInterval !== undefined && announceInterval > 0 && remainingSec > 0 && remainingSec % announceInterval === 0) {
                if (lastIntervalAnnounceRef.current !== remainingSec) {
                    lastIntervalAnnounceRef.current = remainingSec;
                    setAnnouncement(formatAnnouncementText(remainingSec));
                }
            }
        }, [remaining, running, disabled, countUp, duration, announceInterval, announceFinalSeconds, criticalThreshold]);

        const pause = useCallback(() => {
            if (!runningRef.current) return;
            runningRef.current = false;
            setRunning(false);
            onPause?.(remainingRef.current);
        }, [onPause]);

        const resume = useCallback(() => {
            if (runningRef.current || completed) return;
            runningRef.current = true;
            setRunning(true);
            setCompleted(false);
            onResume?.(remainingRef.current);
        }, [completed, onResume]);

        const reset = useCallback(() => {
            clearTimer();
            const resetVal = countUp ? 0 : duration;
            remainingRef.current = resetVal;
            setRemaining(resetVal);
            setCompleted(false);
            lastIntervalAnnounceRef.current = null;
            criticalFiredRef.current = false;
            setAnnouncement('');
            if (autoStart) {
                runningRef.current = true;
                setRunning(true);
            } else {
                runningRef.current = false;
                setRunning(false);
            }
            onReset?.();
        }, [clearTimer, countUp, duration, autoStart, onReset]);

        const start = useCallback(() => {
            if (runningRef.current) return;
            runningRef.current = true;
            setRunning(true);
            setCompleted(false);
        }, []);

        useImperativeHandle(ref, () => ({ pause, resume, reset, start }), [pause, resume, reset, start]);

        const effectiveRemaining = countUp ? duration - remaining : remaining;
        const { colorClass, customColor } = resolveColor(effectiveRemaining, duration, color, colorThresholds);

        const rootStyle: React.CSSProperties = useMemo(() => {
            const base: React.CSSProperties = { ...style, width: variant === 'linear' ? '100%' : undefined };
            if (customColor) (base as Record<string, string>)['--eui-timer-custom-color'] = customColor;
            return base;
        }, [style, variant, customColor]);

        const isLinear = variant === 'linear';
        const isCircularFamily = variant === 'circular' || variant === 'rounded-square' || variant === 'triangle';

        const announcerEnabled = announceInterval !== undefined || announceFinalSeconds !== undefined || announceOnComplete;

        return (
            <div
                className={cn(
                    'eui-countdown-timer',
                    `eui-countdown-timer-${size}`,
                    `eui-countdown-timer-${variant}`,
                    colorClass,
                    {
                        'eui-countdown-timer-circular': isCircularFamily,
                        'eui-countdown-timer-disabled': disabled,
                        'eui-countdown-timer-disabled-overlay': disabled,
                        'eui-countdown-timer-completed': completed,
                        'eui-countdown-timer-pulse': pulseWhenRunning && running,
                    },
                    className,
                )}
                style={rootStyle}
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                role="timer"
                aria-label={`Countdown timer: ${formatAnnouncementText(effectiveRemaining)}`}
                aria-live="off"
            >
                {disabled && (
                    <div className="eui-countdown-timer-disabled-badge">
                        <span>{disabledMessage}</span>
                    </div>
                )}

                {variant === 'circular' && (
                    <CircularVariant remaining={remaining} duration={duration} size={size} colorClass={colorClass} customColor={customColor} />
                )}

                {variant === 'rounded-square' && (
                    <RoundedSquareVariant remaining={remaining} duration={duration} size={size} colorClass={colorClass} customColor={customColor} />
                )}

                {variant === 'triangle' && (
                    <TriangleVariant remaining={remaining} duration={duration} size={size} colorClass={colorClass} customColor={customColor} />
                )}

                {isLinear && (
                    <LinearVariant remaining={remaining} duration={duration} colorClass={colorClass} customColor={customColor} />
                )}

                {variant === 'segmented' && (
                    <SegmentedVariant
                        remaining={remaining}
                        duration={duration}
                        segmentCount={segmentCount}
                        size={size}
                        colorClass={colorClass}
                        customColor={customColor}
                    />
                )}

                {variant === 'numeric' && (
                    <NumericVariant remaining={remaining} colorClass={colorClass} customColor={customColor} />
                )}

                {showControls && !disabled && (
                    <div className="eui-countdown-timer-controls">
                        <button
                            type="button"
                            className="eui-countdown-timer-btn"
                            onClick={running ? pause : resume}
                            aria-label={running ? 'Pause timer' : 'Resume timer'}
                            title={running ? 'Pause' : 'Resume'}
                        >
                            {running ? <PauseIcon /> : <PlayIcon />}
                        </button>
                        <button
                            type="button"
                            className="eui-countdown-timer-btn"
                            onClick={reset}
                            aria-label="Reset timer"
                            title="Reset"
                        >
                            <ResetIcon />
                        </button>
                    </div>
                )}

                {announcerEnabled && (
                    <div
                        className="eui-countdown-timer-sr-only"
                        aria-live={announcePoliteness}
                        aria-atomic="true"
                        role="status"
                    >
                        {announcement}
                    </div>
                )}
            </div>
        );
    },
);

CountdownTimer.displayName = 'CountdownTimer';
