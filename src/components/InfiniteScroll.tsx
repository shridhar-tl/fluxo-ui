import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import './InfiniteScroll.scss';

interface InfiniteScrollProps {
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
}

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
}: InfiniteScrollProps) {
    const sentinelRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);
    const prevScrollHeightRef = useRef<number>(0);
    const [internalLoading, setInternalLoading] = useState(false);

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
    }, [children, inverse, getScrollParent]);

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

    const handleRetry = useCallback(() => {
        if (onRetry) {
            onRetry();
        } else {
            handleLoadMore();
        }
    }, [onRetry, handleLoadMore]);

    const defaultLoader = (
        <div className="eui-is-loader">
            <div className="eui-is-spinner" />
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
                <div aria-live="polite" aria-busy="true" className="eui-is-status">
                    {loader || defaultLoader}
                </div>
            )}
            {error && !loading && (
                <div aria-live="assertive" className="eui-is-status">
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
            ref={containerRef}
            className={classNames('eui-infinite-scroll', { 'eui-is-inverse': inverse }, className)}
        >
            {inverse && sentinel}
            {inverse && statusContent}
            {children}
            {!inverse && sentinel}
            {!inverse && statusContent}
        </div>
    );
}

export { InfiniteScroll };
export type { InfiniteScrollProps };
