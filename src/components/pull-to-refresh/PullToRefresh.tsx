import cn from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshIcon } from '../../assets/icons';
import '../eui-base.scss';
import './PullToRefresh.scss';

type PullToRefreshVariant = 'spinner' | 'arrow' | 'dots' | 'minimal';

interface PullToRefreshProps {
    onRefresh: () => void | Promise<void>;
    children: React.ReactNode;
    threshold?: number;
    maxPull?: number;
    disabled?: boolean;
    variant?: PullToRefreshVariant;
    refreshingText?: string;
    pullingText?: string;
    releaseText?: string;
    className?: string;
    scrollContainer?: HTMLElement | null;
}

const DRAG_RESISTANCE = 0.5;

const PullToRefresh: React.FC<PullToRefreshProps> = ({
    onRefresh,
    children,
    threshold = 64,
    maxPull = 120,
    disabled = false,
    variant = 'spinner',
    refreshingText = 'Refreshing…',
    pullingText = 'Pull to refresh',
    releaseText = 'Release to refresh',
    className,
    scrollContainer,
}) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [pullY, setPullY] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const draggingRef = useRef(false);
    const startYRef = useRef(0);
    const onRefreshRef = useRef(onRefresh);
    onRefreshRef.current = onRefresh;

    const getScrollTop = useCallback(() => {
        if (scrollContainer) return scrollContainer.scrollTop;
        return wrapperRef.current?.scrollTop ?? 0;
    }, [scrollContainer]);

    const handleTouchStart = useCallback(
        (e: TouchEvent) => {
            if (disabled || refreshing) return;
            if (getScrollTop() > 0) return;
            startYRef.current = e.touches[0].clientY;
            draggingRef.current = true;
        },
        [disabled, refreshing, getScrollTop],
    );

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (!draggingRef.current) return;
            const dy = e.touches[0].clientY - startYRef.current;
            if (dy <= 0) {
                setPullY(0);
                return;
            }
            if (getScrollTop() > 0) {
                draggingRef.current = false;
                setPullY(0);
                return;
            }
            const damped = Math.min(dy * DRAG_RESISTANCE, maxPull);
            setPullY(damped);
            if (dy > 8 && e.cancelable) e.preventDefault();
        },
        [getScrollTop, maxPull],
    );

    const handleTouchEnd = useCallback(async () => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        if (pullY >= threshold && !refreshing) {
            setRefreshing(true);
            setPullY(threshold);
            try {
                await onRefreshRef.current();
            } finally {
                setRefreshing(false);
                setPullY(0);
            }
        } else {
            setPullY(0);
        }
    }, [pullY, threshold, refreshing]);

    useEffect(() => {
        const el = scrollContainer ?? wrapperRef.current;
        if (!el) return;
        el.addEventListener('touchstart', handleTouchStart, { passive: true });
        el.addEventListener('touchmove', handleTouchMove, { passive: false });
        el.addEventListener('touchend', handleTouchEnd);
        el.addEventListener('touchcancel', handleTouchEnd);
        return () => {
            el.removeEventListener('touchstart', handleTouchStart);
            el.removeEventListener('touchmove', handleTouchMove);
            el.removeEventListener('touchend', handleTouchEnd);
            el.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [scrollContainer, handleTouchStart, handleTouchMove, handleTouchEnd]);

    const progress = Math.min(pullY / threshold, 1);
    const showRelease = !refreshing && pullY >= threshold;
    const indicatorLabel = refreshing ? refreshingText : showRelease ? releaseText : pullingText;

    return (
        <div
            ref={wrapperRef}
            className={cn('eui-pull-to-refresh', `eui-pull-to-refresh-variant-${variant}`, className, {
                'eui-pull-to-refresh-refreshing': refreshing,
            })}
        >
            <div
                className="eui-pull-to-refresh-indicator"
                style={{ height: `${pullY}px`, opacity: pullY > 4 ? 1 : 0 }}
                aria-hidden={pullY === 0 && !refreshing}
            >
                <div
                    className="eui-pull-to-refresh-indicator-inner"
                    style={{ opacity: progress }}
                    role={refreshing ? 'status' : undefined}
                    aria-live="polite"
                >
                    {variant === 'dots' ? (
                        <div className={cn('eui-pull-to-refresh-dots', { 'eui-pull-to-refresh-dots-spinning': refreshing })}>
                            <span /><span /><span />
                        </div>
                    ) : variant === 'minimal' ? null : (
                        <div
                            className={cn('eui-pull-to-refresh-spinner', {
                                'eui-pull-to-refresh-spinner-spinning': refreshing,
                                'eui-pull-to-refresh-spinner-arrow-flip': variant === 'arrow' && showRelease,
                            })}
                            style={!refreshing && variant !== 'arrow' ? { transform: `rotate(${progress * 360}deg)` } : undefined}
                        >
                            <RefreshIcon />
                        </div>
                    )}
                    {variant !== 'minimal' && <span className="eui-pull-to-refresh-label">{indicatorLabel}</span>}
                </div>
            </div>
            <div
                className="eui-pull-to-refresh-content"
                style={{ transform: pullY > 0 ? `translateY(${pullY}px)` : undefined, transition: draggingRef.current ? 'none' : 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
                {children}
            </div>
        </div>
    );
};

export { PullToRefresh };
export type { PullToRefreshProps, PullToRefreshVariant };
