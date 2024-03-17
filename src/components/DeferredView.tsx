import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import './DeferredView.scss';

interface DeferredViewProps {
    children: React.ReactNode;
    placeholder?: React.ReactNode;
    rootMargin?: string;
    threshold?: number;
    keepMounted?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

function DeferredView({ children, placeholder, rootMargin = '0px', threshold = 0, keepMounted = true, className, style }: DeferredViewProps) {
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

    return (
        <div ref={sentinelRef} className={classNames('eui-deferred-view', className)} style={style}>
            {shouldRender ? children : (placeholder ?? <div className="eui-deferred-view-placeholder" />)}
        </div>
    );
}

export { DeferredView };
export type { DeferredViewProps };
