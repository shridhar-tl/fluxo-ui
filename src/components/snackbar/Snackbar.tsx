import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { icons } from './constants';
import { SnackbarItemProps, SnackbarType } from './types';

function getAnimClass(animation: string, position: string, exit: boolean): string {
    if (animation === 'slide') {
        const isTop = position.startsWith('top');
        if (exit) return isTop ? 'eui-snackbar-anim-slide-top-exit' : 'eui-snackbar-anim-slide-bottom-exit';
        return isTop ? 'eui-snackbar-anim-slide-top-enter' : 'eui-snackbar-anim-slide-bottom-enter';
    }
    return `eui-snackbar-anim-${animation}-${exit ? 'exit' : 'enter'}`;
}

const ROLE_BY_TYPE: Record<SnackbarType, 'alert' | 'status'> = {
    error: 'alert',
    warning: 'status',
    info: 'status',
    success: 'status',
};

const ARIA_LIVE_BY_TYPE: Record<SnackbarType, 'assertive' | 'polite'> = {
    error: 'assertive',
    warning: 'polite',
    info: 'polite',
    success: 'polite',
};

const FALLBACK_ICON = icons.info;
const EXIT_DURATION_MS = 300;

const prefersReducedMotion = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

function SnackbarItem({ data, onRemove }: SnackbarItemProps) {
    const { id, message, title, options } = data;
    const {
        type,
        timeout,
        animation,
        showCloseButton,
        onClick,
        onClose,
        customIcon,
        position,
        variant = 'soft',
        size = 'md',
    } = options;
    const [hoverPaused, setHoverPaused] = useState(false);
    const [focusPaused, setFocusPaused] = useState(false);
    const [exit, setExit] = useState(false);
    const removingRef = useRef(false);
    const reducedMotionRef = useRef(prefersReducedMotion());
    const timerStartRef = useRef<number>(0);
    const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const remainingRef = useRef<number>(typeof timeout === 'number' && timeout > 0 ? timeout : 0);

    const paused = hoverPaused || focusPaused;
    const progressDuration = typeof timeout === 'number' && timeout > 0 ? timeout : 0;

    const removeSelf = useCallback(
        (manual: boolean) => {
            if (removingRef.current) return;
            removingRef.current = true;
            if (timerIdRef.current !== null) {
                clearTimeout(timerIdRef.current);
                timerIdRef.current = null;
            }
            setExit(true);
            const exitDelay = reducedMotionRef.current ? 0 : EXIT_DURATION_MS;
            const finalize = () => {
                onRemove(id);
                if (onClose) onClose(manual);
            };
            if (exitDelay === 0) {
                finalize();
            } else {
                window.setTimeout(finalize, exitDelay);
            }
        },
        [id, onClose, onRemove],
    );

    useEffect(() => {
        return () => {
            if (timerIdRef.current !== null) {
                clearTimeout(timerIdRef.current);
                timerIdRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (progressDuration <= 0) return;
        if (paused) {
            if (timerIdRef.current !== null) {
                const elapsed = Date.now() - timerStartRef.current;
                remainingRef.current = Math.max(0, remainingRef.current - elapsed);
                clearTimeout(timerIdRef.current);
                timerIdRef.current = null;
            }
            return;
        }
        if (removingRef.current) return;
        if (timerIdRef.current !== null) return;
        timerStartRef.current = Date.now();
        timerIdRef.current = setTimeout(() => {
            timerIdRef.current = null;
            if (!removingRef.current) {
                removeSelf(false);
            }
        }, remainingRef.current);
    }, [paused, progressDuration, removeSelf]);

    const handleMouseEnter = () => setHoverPaused(true);
    const handleMouseLeave = () => setHoverPaused(false);

    const handleFocusCapture = () => setFocusPaused(true);
    const handleBlurCapture = (e: React.FocusEvent) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setFocusPaused(false);
    };

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        removeSelf(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            removeSelf(true);
        }
    };

    const Icon = customIcon ?? icons[type] ?? FALLBACK_ICON;
    const isSingleLine = variant === 'minimal' || variant === 'pill';
    const typeClass = `eui-snackbar-t-${type}`;
    const variantClass = `eui-snackbar-v-${variant}`;
    const sizeClass = `eui-snackbar-size-${size}`;
    const ariaRole = ROLE_BY_TYPE[type] ?? 'status';
    const ariaLive = ARIA_LIVE_BY_TYPE[type] ?? 'polite';
    const enterAnim = reducedMotionRef.current ? '' : getAnimClass(animation, position, false);
    const exitAnim = reducedMotionRef.current ? '' : getAnimClass(animation, position, true);
    const animClass = exit ? exitAnim : enterAnim;
    const closeLabel = `Close ${title || 'notification'}`;

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocusCapture={handleFocusCapture}
            onBlurCapture={handleBlurCapture}
            onKeyDown={handleKeyDown}
            onClick={onClick}
            role={ariaRole}
            aria-live={ariaLive}
            aria-atomic="true"
            className={classNames('eui-snackbar', variantClass, sizeClass, typeClass, animClass)}
        >
            <div className="eui-snackbar-body">
                <div className="eui-snackbar-icon" aria-hidden="true">
                    <Icon />
                </div>
                <div className="eui-snackbar-content">
                    {!isSingleLine && <div className="eui-snackbar-title">{title}</div>}
                    <div className="eui-snackbar-message">{message}</div>
                </div>
                {(showCloseButton || timeout === 0 || timeout === null) && (
                    <button
                        type="button"
                        onClick={handleClose}
                        className="eui-snackbar-close"
                        aria-label={closeLabel}
                    >
                        <svg viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M10 8.586l4.95-4.95 1.414 1.414L11.414 10l4.95 4.95-1.414 1.414L10 11.414l-4.95 4.95-1.414-1.414L8.586 10l-4.95-4.95L5.05 3.636z" />
                        </svg>
                    </button>
                )}
            </div>
            {progressDuration > 0 && (
                <div className="eui-snackbar-progress" aria-hidden="true">
                    <div
                        className={classNames('eui-snackbar-progress-bar', {
                            'eui-snackbar-progress-bar-paused': paused,
                        })}
                        style={{ animationDuration: `${progressDuration}ms` }}
                    />
                </div>
            )}
        </div>
    );
}

export default SnackbarItem;
