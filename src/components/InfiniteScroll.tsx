import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import './InfiniteScroll.scss';

interface InfiniteScrollProps extends React.HTMLAttributes<HTMLDivElement> {
    loadMore: () => Promise<void>;
    hasMore: boolean;
    isLoading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    threshold?: number;
    loader?: React.ReactNode;
    endMessage?: React.ReactNode;
    errorMessage?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
    scrollableTarget?: string | HTMLElement;
    inverse?: boolean;
    endAnnouncement?: string;
}

const DEFAULT_END_ANNOUNCEMENT = 'You have reached the end of the list.';
const INVERSE_STABILIZATION_WINDOW_MS = 1500;

function InfiniteScroll({
    loadMore,
    hasMore,
    isLoading = false,
    error = null,
    onRetry,
    threshold = 200,
    loader,
    endMessage,
    errorMessage,
    className,
    children,
    scrollableTarget,
    inverse = false,
    endAnnouncement,
    ...rest
}: InfiniteScrollProps) {
    const sentinelRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);
    const prevScrollHeightRef = useRef<number>(0);
    const stabilizingRef = useRef<{ active: boolean; baseHeight: number; deadlineId: ReturnType<typeof setTimeout> | null }>({
        active: false,
        baseHeight: 0,
        deadlineId: null,
    });
    const [internalLoading, setInternalLoading] = useState(false);
    const [hasAnnouncedEnd, setHasAnnouncedEnd] = useState(false);

    const loading = isLoading || internalLoading;

    const getScrollParent = useCallback((): HTMLElement | null => {
        if (!scrollableTarget) return null;
        if (typeof scrollableTarget === 'string') {
            return document.getElementById(scrollableTarget);
        }
        return scrollableTarget;
    }, [scrollableTarget]);

    const handleLoadMore = useCallback(async () => {
        if (loadingRef.current || !hasMore || error) return;
        loadingRef.current = true;
        setInternalLoading(true);

        const scrollParent = getScrollParent() || containerRef.current;
        if (inverse && scrollParent) {
            prevScrollHeightRef.current = scrollParent.scrollHeight;
        }

        try {
            await loadMore();
        } finally {
            loadingRef.current = false;
            setInternalLoading(false);
        }
    }, [loadMore, hasMore, error, inverse, getScrollParent]);

    useEffect(() => {
        if (!inverse) return;
        const scrollParent = getScrollParent() || containerRef.current;
        if (!scrollParent || prevScrollHeightRef.current === 0) return;

        const newScrollHeight = scrollParent.scrollHeight;
        const diff = newScrollHeight - prevScrollHeightRef.current;
        if (diff > 0) {
            scrollParent.scrollTop += diff;
        }
        prevScrollHeightRef.current = 0;

        const stabilizing = stabilizingRef.current;
        if (stabilizing.deadlineId !== null) clearTimeout(stabilizing.deadlineId);
        stabilizing.active = true;
        stabilizing.baseHeight = newScrollHeight;
        stabilizing.deadlineId = setTimeout(() => {
            stabilizing.active = false;
            stabilizing.deadlineId = null;
        }, INVERSE_STABILIZATION_WINDOW_MS);
    }, [children, inverse, getScrollParent]);

    useEffect(() => {
        if (!inverse) return;
        const scrollParent = getScrollParent() || containerRef.current;
        if (!scrollParent) return;

        const observer = new ResizeObserver(() => {
            const stabilizing = stabilizingRef.current;
            if (!stabilizing.active) return;
            const currentHeight = scrollParent.scrollHeight;
            const diff = currentHeight - stabilizing.baseHeight;
            if (diff > 0) {
                scrollParent.scrollTop += diff;
                stabilizing.baseHeight = currentHeight;
            }
        });

        observer.observe(scrollParent);

        return () => {
            observer.disconnect();
        };
    }, [inverse, getScrollParent]);

    useEffect(() => {
        return () => {
            const stabilizing = stabilizingRef.current;
            if (stabilizing.deadlineId !== null) {
                clearTimeout(stabilizing.deadlineId);
                stabilizing.deadlineId = null;
            }
        };
    }, []);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const root = getScrollParent() || null;

        const rootMargin = inverse
            ? `${threshold}px 0px 0px 0px`
            : `0px 0px ${threshold}px 0px`;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && hasMore && !loadingRef.current && !error) {
                    handleLoadMore();
                }
            },
            { root, rootMargin, threshold: 0 },
        );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [hasMore, error, threshold, inverse, handleLoadMore, getScrollParent]);

    useEffect(() => {
        if (hasMore) {
            if (hasAnnouncedEnd) setHasAnnouncedEnd(false);
            return;
        }
        if (!hasAnnouncedEnd && !loading && !error) {
            setHasAnnouncedEnd(true);
        }
    }, [hasMore, loading, error, hasAnnouncedEnd]);

    const handleRetry = useCallback(() => {
        if (onRetry) {
            onRetry();
        } else {
            handleLoadMore();
        }
    }, [onRetry, handleLoadMore]);

    const defaultLoader = (
        <div className="eui-is-loader">
            <div className="eui-is-spinner" aria-hidden="true" />
            <span className="eui-is-loader-text">Loading...</span>
        </div>
    );

    const defaultErrorMessage = (
        <div className="eui-is-error">
            <span className="eui-is-error-text">{error}</span>
            <button type="button" className="eui-is-retry-btn" onClick={handleRetry}>
                Retry
            </button>
        </div>
    );

    const defaultEndMessage = (
        <div className="eui-is-end">
            <span className="eui-is-end-text">No more items to load</span>
        </div>
    );

    const sentinel = <div ref={sentinelRef} className="eui-is-sentinel" aria-hidden="true" />;

    const statusContent = (
        <>
            {loading && (
                <div aria-busy="true" className="eui-is-status">
                    {loader || defaultLoader}
                </div>
            )}
            {error && !loading && (
                <div role="alert" className="eui-is-status">
                    {errorMessage || defaultErrorMessage}
                </div>
            )}
            {!hasMore && !loading && !error && (
                <div className="eui-is-status">
                    {endMessage !== undefined ? endMessage : defaultEndMessage}
                </div>
            )}
        </>
    );

    return (
        <div
            {...rest}
            ref={containerRef}
            className={classNames('eui-infinite-scroll', { 'eui-is-inverse': inverse }, className)}
        >
            {inverse && sentinel}
            {inverse && statusContent}
            {children}
            {!inverse && sentinel}
            {!inverse && statusContent}
            <div
                className="eui-is-sr-only"
                aria-live="polite"
                aria-atomic="true"
                role="status"
            >
                {loading ? 'Loading more items' : ''}
                {hasAnnouncedEnd ? (endAnnouncement || DEFAULT_END_ANNOUNCEMENT) : ''}
            </div>
        </div>
    );
}

export { InfiniteScroll };
export type { InfiniteScrollProps };
