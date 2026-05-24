import classNames from 'classnames';
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { ChevronDownIcon } from '../../assets/icons';
import Icon from '../Icon';
import '../eui-base.scss';
import './StickyScroll.scss';

export type StickyScrollBehavior = 'smooth' | 'auto';

export interface StickyScrollHandle {
    scrollToBottom: (behavior?: StickyScrollBehavior) => void;
    isPinned: () => boolean;
    getElement: () => HTMLDivElement | null;
}

export interface StickyScrollProps {
    children: React.ReactNode;
    threshold?: number;
    initialPinned?: boolean;
    behavior?: StickyScrollBehavior;
    showJumpButton?: boolean;
    jumpButtonLabel?: string;
    maxHeight?: number | string;
    height?: number | string;
    onPinnedChange?: (pinned: boolean) => void;
    className?: string;
    contentClassName?: string;
    id?: string;
    ariaLabel?: string;
    role?: string;
}

const toCssSize = (value: number | string | undefined): string | undefined => {
    if (value === undefined) return undefined;
    return typeof value === 'number' ? `${value}px` : value;
};

const distanceFromBottom = (el: HTMLElement): number =>
    el.scrollHeight - el.clientHeight - el.scrollTop;

const StickyScroll = forwardRef<StickyScrollHandle, StickyScrollProps>(
    (
        {
            children,
            threshold = 48,
            initialPinned = true,
            behavior = 'smooth',
            showJumpButton = true,
            jumpButtonLabel,
            maxHeight,
            height,
            onPinnedChange,
            className,
            contentClassName,
            id,
            ariaLabel,
            role,
        },
        ref,
    ) => {
        const containerRef = useRef<HTMLDivElement | null>(null);
        const contentRef = useRef<HTMLDivElement | null>(null);
        const pinnedRef = useRef<boolean>(initialPinned);
        const reducedMotionRef = useRef<boolean>(false);
        const [pinned, setPinned] = useState<boolean>(initialPinned);

        useEffect(() => {
            if (typeof window === 'undefined' || !window.matchMedia) return;
            const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
            reducedMotionRef.current = mq.matches;
            const handler = (ev: MediaQueryListEvent): void => {
                reducedMotionRef.current = ev.matches;
            };
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        }, []);

        const applyPinned = useCallback(
            (next: boolean): void => {
                if (pinnedRef.current === next) return;
                pinnedRef.current = next;
                setPinned(next);
                onPinnedChange?.(next);
            },
            [onPinnedChange],
        );

        const scrollToBottom = useCallback(
            (overrideBehavior?: StickyScrollBehavior): void => {
                const el = containerRef.current;
                if (!el) return;
                const effective: ScrollBehavior = reducedMotionRef.current
                    ? 'auto'
                    : overrideBehavior ?? behavior;
                el.scrollTo({ top: el.scrollHeight, behavior: effective });
                applyPinned(true);
            },
            [behavior, applyPinned],
        );

        const handleScroll = useCallback((): void => {
            const el = containerRef.current;
            if (!el) return;
            applyPinned(distanceFromBottom(el) <= threshold);
        }, [threshold, applyPinned]);

        useLayoutEffect(() => {
            const el = containerRef.current;
            if (!el) return;
            if (initialPinned) {
                el.scrollTop = el.scrollHeight;
            }
        }, [initialPinned]);

        useEffect(() => {
            const container = containerRef.current;
            const content = contentRef.current;
            if (!container || !content || typeof ResizeObserver === 'undefined') return;
            const observer = new ResizeObserver(() => {
                if (pinnedRef.current) {
                    container.scrollTop = container.scrollHeight;
                }
            });
            observer.observe(content);
            return () => observer.disconnect();
        }, []);

        useImperativeHandle(
            ref,
            () => ({
                scrollToBottom,
                isPinned: () => pinnedRef.current,
                getElement: () => containerRef.current,
            }),
            [scrollToBottom],
        );

        const containerStyle = useMemo<React.CSSProperties>(
            () => ({
                maxHeight: toCssSize(maxHeight),
                height: toCssSize(height),
            }),
            [maxHeight, height],
        );

        return (
            <div className={classNames('eui-sticky-scroll', className)}>
                <div
                    ref={containerRef}
                    id={id}
                    role={role}
                    aria-label={ariaLabel}
                    className="eui-sticky-scroll-viewport"
                    style={containerStyle}
                    onScroll={handleScroll}
                >
                    <div ref={contentRef} className={classNames('eui-sticky-scroll-content', contentClassName)}>
                        {children}
                    </div>
                </div>
                {showJumpButton && (
                    <button
                        type="button"
                        aria-label={jumpButtonLabel ?? 'Jump to latest'}
                        aria-hidden={pinned || undefined}
                        tabIndex={pinned ? -1 : 0}
                        onClick={() => scrollToBottom()}
                        className={classNames('eui-sticky-scroll-jump', {
                            'eui-sticky-scroll-jump-visible': !pinned,
                            'eui-sticky-scroll-jump-with-label': !!jumpButtonLabel,
                        })}
                    >
                        <Icon icon={ChevronDownIcon} className="eui-sticky-scroll-jump-icon" aria-hidden="true" />
                        {jumpButtonLabel && <span className="eui-sticky-scroll-jump-label">{jumpButtonLabel}</span>}
                    </button>
                )}
            </div>
        );
    },
);

StickyScroll.displayName = 'StickyScroll';

export { StickyScroll };
export default StickyScroll;
