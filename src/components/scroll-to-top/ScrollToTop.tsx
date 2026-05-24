import classNames from 'classnames';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronUpIcon } from '../../assets/icons';
import Icon from '../Icon';
import '../eui-base.scss';
import './ScrollToTop.scss';

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

export type ScrollToTopPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
export type ScrollToTopSize = 'sm' | 'md' | 'lg' | 'xl';
export type ScrollToTopVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type ScrollToTopLayout = 'solid' | 'outlined' | 'glass';
export type ScrollToTopMode = 'fixed' | 'inline';

export interface ScrollToTopProps {
    target?: HTMLElement | string;
    showAfter?: number;
    position?: ScrollToTopPosition;
    offset?: { x?: number; y?: number };
    size?: ScrollToTopSize;
    variant?: ScrollToTopVariant;
    layout?: ScrollToTopLayout;
    color?: string;
    gradient?: { from: string; to: string; angle?: number };
    icon?: IconComponent | React.ReactElement;
    label?: string;
    showProgress?: boolean;
    progressColor?: string;
    mode?: ScrollToTopMode;
    behavior?: ScrollToTopBehavior;
    onClick?: () => void;
    id?: string;
    className?: string;
    ariaLabel?: string;
}

export type ScrollToTopBehavior = 'smooth' | 'auto';

const sizeMap: Record<ScrollToTopSize, number> = {
    sm: 36,
    md: 44,
    lg: 52,
    xl: 60,
};

const isPageRootElement = (el: HTMLElement): boolean =>
    el === document.body || el === document.documentElement;

const resolveTarget = (target: ScrollToTopProps['target']): Window | HTMLElement => {
    if (!target) return window;
    if (typeof target === 'string') {
        const el = document.querySelector(target);
        if (el instanceof HTMLElement) {
            if (isPageRootElement(el)) return window;
            return el;
        }
        return window;
    }
    if (isPageRootElement(target)) return window;
    return target;
};

const getScrollTop = (target: Window | HTMLElement) => {
    if (target instanceof Window) {
        return window.scrollY || document.documentElement.scrollTop;
    }
    return target.scrollTop;
};

const getScrollMax = (target: Window | HTMLElement) => {
    if (target instanceof Window) {
        const doc = document.documentElement;
        return Math.max(0, doc.scrollHeight - doc.clientHeight);
    }
    return Math.max(0, target.scrollHeight - target.clientHeight);
};

const ScrollToTop: React.FC<ScrollToTopProps> = ({
    target,
    showAfter = 200,
    position = 'bottom-right',
    offset,
    size = 'md',
    variant = 'primary',
    layout = 'solid',
    color,
    gradient,
    icon,
    label,
    showProgress = false,
    progressColor,
    mode = 'fixed',
    behavior = 'smooth',
    onClick,
    id,
    className,
    ariaLabel,
}) => {
    const generatedId = useId();
    const buttonId = id ?? `scroll-top-${generatedId}`;
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const [reducedMotion, setReducedMotion] = useState(false);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mq.matches);
        const handler = (ev: MediaQueryListEvent) => setReducedMotion(ev.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        const el = resolveTarget(target);
        const scrollTarget: EventTarget = el;

        const update = () => {
            const top = getScrollTop(el);
            const max = getScrollMax(el);
            setVisible(top > showAfter);
            setProgress(max > 0 ? Math.min(1, Math.max(0, top / max)) : 0);
        };

        const onScroll = () => {
            if (rafRef.current != null) return;
            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null;
                update();
            });
        };

        update();
        scrollTarget.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            scrollTarget.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        };
    }, [target, showAfter]);

    const handleClick = useCallback(() => {
        const el = resolveTarget(target);
        const effectiveBehavior: ScrollBehavior = reducedMotion ? 'auto' : (behavior ?? 'smooth');
        if (el instanceof Window) {
            window.scrollTo({ top: 0, behavior: effectiveBehavior });
        } else {
            el.scrollTo({ top: 0, behavior: effectiveBehavior });
        }
        onClick?.();
    }, [target, reducedMotion, behavior, onClick]);

    const dimension = sizeMap[size];
    const offsetX = offset?.x ?? 24;
    const offsetY = offset?.y ?? 24;

    const positionStyles = useMemo<React.CSSProperties>(() => {
        if (mode === 'inline') return {};
        const styles: React.CSSProperties = { position: 'fixed', zIndex: 60 };
        switch (position) {
            case 'bottom-right':
                styles.right = offsetX;
                styles.bottom = offsetY;
                break;
            case 'bottom-left':
                styles.left = offsetX;
                styles.bottom = offsetY;
                break;
            case 'top-right':
                styles.right = offsetX;
                styles.top = offsetY;
                break;
            case 'top-left':
                styles.left = offsetX;
                styles.top = offsetY;
                break;
        }
        return styles;
    }, [mode, position, offsetX, offsetY]);

    const customStyles = useMemo<React.CSSProperties>(() => {
        const styles: React.CSSProperties = {};
        if (gradient) {
            styles.background = `linear-gradient(${gradient.angle ?? 135}deg, ${gradient.from}, ${gradient.to})`;
            styles.color = '#ffffff';
            styles.borderColor = 'transparent';
        } else if (color) {
            if (layout === 'outlined') {
                styles.color = color;
                styles.borderColor = color;
            } else {
                styles.background = color;
                styles.color = '#ffffff';
                styles.borderColor = 'transparent';
            }
        }
        return styles;
    }, [color, gradient, layout]);

    const ringRadius = (dimension - 6) / 2;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringOffset = ringCircumference * (1 - progress);

    return (
        <button
            id={buttonId}
            type="button"
            aria-label={ariaLabel ?? 'Scroll to top'}
            aria-hidden={!visible || undefined}
            tabIndex={visible ? 0 : -1}
            onClick={handleClick}
            className={classNames(
                'eui-scroll-to-top',
                `eui-scroll-to-top-${size}`,
                `eui-scroll-to-top-variant-${variant}`,
                `eui-scroll-to-top-layout-${layout}`,
                `eui-scroll-to-top-position-${position}`,
                {
                    'eui-scroll-to-top-visible': visible,
                    'eui-scroll-to-top-with-label': !!label,
                    'eui-scroll-to-top-reduced-motion': reducedMotion,
                    'eui-scroll-to-top-inline': mode === 'inline',
                },
                className,
            )}
            style={{
                ...positionStyles,
                ...customStyles,
                width: label ? undefined : dimension,
                height: label ? undefined : dimension,
                minHeight: dimension,
            }}
        >
            {showProgress && (
                <svg
                    className="eui-scroll-to-top-ring"
                    width={dimension}
                    height={dimension}
                    viewBox={`0 0 ${dimension} ${dimension}`}
                    aria-hidden="true"
                >
                    <circle
                        cx={dimension / 2}
                        cy={dimension / 2}
                        r={ringRadius}
                        fill="none"
                        stroke={progressColor ?? 'rgba(255,255,255,0.25)'}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringOffset}
                        transform={`rotate(-90 ${dimension / 2} ${dimension / 2})`}
                    />
                </svg>
            )}
            <Icon icon={icon ?? ChevronUpIcon} className="eui-scroll-to-top-icon" aria-hidden="true" />
            {label && <span className="eui-scroll-to-top-label">{label}</span>}
        </button>
    );
};

export { ScrollToTop };
export default ScrollToTop;
