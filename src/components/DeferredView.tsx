import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import './DeferredView.scss';

interface DeferredViewProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    placeholder?: React.ReactNode;
    rootMargin?: string;
    threshold?: number;
    keepMounted?: boolean;
    className?: string;
    style?: React.CSSProperties;
    minHeight?: string | number;
}

function DeferredView({ children, placeholder, rootMargin = '0px', threshold = 0, keepMounted = true, className, style, minHeight, ...rest }: DeferredViewProps) {
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const handleIntersection = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                setHasBeenVisible(true);
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        },
        [],
    );

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(handleIntersection, {
            rootMargin,
            threshold,
        });

        observer.observe(el);

        return () => {
            observer.disconnect();
        };
    }, [handleIntersection, rootMargin, threshold]);

    const shouldRender = keepMounted ? hasBeenVisible : isVisible;
    const isLoading = !shouldRender;
    const containerStyle: React.CSSProperties = {
        ...style,
        ...(minHeight !== undefined ? { minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight } : {}),
    };

    return (
        <div
            {...rest}
            ref={sentinelRef}
            className={classNames('eui-deferred-view', className)}
            style={containerStyle}
            aria-busy={isLoading}
            aria-live={isLoading ? 'polite' : undefined}
        >
            {shouldRender ? children : (placeholder ?? <div className="eui-deferred-view-placeholder" />)}
        </div>
    );
}

export { DeferredView };
export type { DeferredViewProps };
