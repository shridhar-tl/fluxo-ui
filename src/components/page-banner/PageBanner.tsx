import cn from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ErrorIcon, InfoIcon, SuccessIcon, TimesIcon, WarningIcon } from '../../assets/icons';
import './PageBanner.scss';

type BannerType = 'info' | 'success' | 'warning' | 'error' | 'default';
type BannerPosition = 'top' | 'inline';

interface PageBannerProps {
    type?: BannerType;
    message: React.ReactNode;
    title?: string;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    icon?: React.ReactNode;
    showIcon?: boolean;
    dismissible?: boolean;
    autoDismiss?: number;
    onDismiss?: () => void;
    visible?: boolean;
    position?: BannerPosition;
    pageLevel?: boolean;
    pushContent?: boolean;
    className?: string;
    actions?: React.ReactNode;
    bordered?: boolean;
    restoreFocusOnDismiss?: boolean;
}

const defaultIcons: Record<BannerType, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    info: InfoIcon,
    success: SuccessIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    default: InfoIcon,
};

const ROLE_BY_TYPE: Record<BannerType, 'alert' | 'status'> = {
    error: 'alert',
    warning: 'alert',
    info: 'status',
    success: 'status',
    default: 'status',
};

const ARIA_LIVE_BY_TYPE: Record<BannerType, 'assertive' | 'polite'> = {
    error: 'assertive',
    warning: 'assertive',
    info: 'polite',
    success: 'polite',
    default: 'polite',
};

const EXIT_DURATION_MS = 300;

const prefersReducedMotion = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const PageBanner: React.FC<PageBannerProps> = ({
    type = 'info',
    message,
    title,
    headingLevel = 3,
    icon,
    showIcon = true,
    dismissible = true,
    autoDismiss,
    onDismiss,
    visible = true,
    position: _position = 'inline',
    pageLevel = false,
    pushContent = false,
    className,
    actions,
    bordered = false,
    restoreFocusOnDismiss = true,
}) => {
    const [internalVisible, setInternalVisible] = useState(visible);
    const [animating, setAnimating] = useState(false);
    const [paused, setPaused] = useState(false);
    const dismissTimerRef = useRef<number | null>(null);
    const exitTimerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const remainingRef = useRef<number>(autoDismiss ?? 0);
    const bannerRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const reducedMotionRef = useRef(prefersReducedMotion());
    const HeadingTag = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    const clearDismissTimer = () => {
        if (dismissTimerRef.current !== null) {
            window.clearTimeout(dismissTimerRef.current);
            dismissTimerRef.current = null;
        }
    };

    const finalizeDismiss = useCallback(() => {
        setInternalVisible(false);
        setAnimating(false);
        onDismiss?.();
        if (restoreFocusOnDismiss) {
            previousFocusRef.current?.focus?.();
        }
    }, [onDismiss, restoreFocusOnDismiss]);

    const handleDismissAnimation = useCallback(() => {
        clearDismissTimer();
        if (reducedMotionRef.current) {
            finalizeDismiss();
            return;
        }
        setAnimating(true);
        if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = window.setTimeout(() => {
            exitTimerRef.current = null;
            finalizeDismiss();
        }, EXIT_DURATION_MS);
    }, [finalizeDismiss]);

    useEffect(() => {
        if (visible) {
            setInternalVisible(true);
            setAnimating(false);
            previousFocusRef.current = document.activeElement as HTMLElement | null;
        } else if (internalVisible) {
            handleDismissAnimation();
        }
    }, [visible]);

    useEffect(() => {
        if (!internalVisible || !autoDismiss || autoDismiss <= 0) return;
        remainingRef.current = autoDismiss;
        startTimeRef.current = Date.now();
        if (paused) return;
        dismissTimerRef.current = window.setTimeout(() => {
            handleDismissAnimation();
        }, remainingRef.current);
        return () => {
            clearDismissTimer();
        };
    }, [internalVisible, autoDismiss, paused, handleDismissAnimation]);

    useEffect(() => {
        return () => {
            clearDismissTimer();
            if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
        };
    }, []);

    const handlePause = () => {
        if (!autoDismiss || autoDismiss <= 0) return;
        if (paused) return;
        if (dismissTimerRef.current !== null) {
            const elapsed = Date.now() - startTimeRef.current;
            remainingRef.current = Math.max(0, remainingRef.current - elapsed);
            clearDismissTimer();
        }
        setPaused(true);
    };

    const handleResume = () => {
        if (!autoDismiss || autoDismiss <= 0) return;
        if (!paused) return;
        startTimeRef.current = Date.now();
        setPaused(false);
        if (remainingRef.current > 0) {
            dismissTimerRef.current = window.setTimeout(() => {
                handleDismissAnimation();
            }, remainingRef.current);
        }
    };

    const handleFocusCapture = () => handlePause();
    const handleBlurCapture = (e: React.FocusEvent) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        handleResume();
    };

    const handleDismiss = useCallback(() => {
        handleDismissAnimation();
    }, [handleDismissAnimation]);

    if (!internalVisible) return null;

    const DefaultIcon = defaultIcons[type];
    const displayIcon = icon !== undefined ? icon : (showIcon ? <DefaultIcon /> : null);
    const ariaRole = ROLE_BY_TYPE[type];
    const ariaLive = ARIA_LIVE_BY_TYPE[type];
    const reducedMotion = reducedMotionRef.current;

    const bannerContent = (
        <div
            ref={bannerRef}
            onMouseEnter={handlePause}
            onMouseLeave={handleResume}
            onFocusCapture={handleFocusCapture}
            onBlurCapture={handleBlurCapture}
            className={cn(
                'eui-page-banner',
                `eui-page-banner-${type}`,
                {
                    'eui-page-banner-page-level': pageLevel,
                    'eui-page-banner-push': pushContent && pageLevel,
                    'eui-page-banner-bordered': bordered,
                    'eui-page-banner-entering': !animating && internalVisible && !reducedMotion,
                    'eui-page-banner-exiting': animating && !reducedMotion,
                    'eui-page-banner-no-anim': reducedMotion,
                },
                className,
            )}
            role={ariaRole}
            aria-live={ariaLive}
            aria-atomic="true"
        >
            <div className="eui-page-banner-content">
                {displayIcon && <div className="eui-page-banner-icon" aria-hidden="true">{displayIcon}</div>}
                <div className="eui-page-banner-body">
                    {title && <HeadingTag className="eui-page-banner-title">{title}</HeadingTag>}
                    <div className="eui-page-banner-message">{message}</div>
                </div>
                {actions && <div className="eui-page-banner-actions">{actions}</div>}
                {dismissible && (
                    <button
                        className="eui-page-banner-dismiss"
                        onClick={handleDismiss}
                        aria-label={`Dismiss ${title ?? type} banner`}
                        type="button"
                    >
                        <TimesIcon />
                    </button>
                )}
            </div>
            {autoDismiss && internalVisible && !animating && (
                <div
                    className={cn('eui-page-banner-progress', { 'eui-page-banner-progress-paused': paused })}
                    style={{ animationDuration: `${autoDismiss}ms` }}
                    aria-hidden="true"
                />
            )}
        </div>
    );

    if (pageLevel) {
        return createPortal(bannerContent, document.body);
    }

    return bannerContent;
};

export { PageBanner };
export type { PageBannerProps, BannerType, BannerPosition };
