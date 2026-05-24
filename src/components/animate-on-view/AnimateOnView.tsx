import cn from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import '../eui-base.scss';
import './AnimateOnView.scss';

type AnimationType =
    | 'fadeIn'
    | 'fadeInUp'
    | 'fadeInDown'
    | 'fadeInLeft'
    | 'fadeInRight'
    | 'zoomIn'
    | 'zoomOut'
    | 'slideUp'
    | 'slideDown'
    | 'slideLeft'
    | 'slideRight'
    | 'flipX'
    | 'flipY'
    | 'rotateIn'
    | 'bounceIn'
    | 'scaleUp';

type AnimationEasing = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';

interface AnimateOnViewProps {
    children: React.ReactNode;
    animation?: AnimationType;
    duration?: number;
    delay?: number;
    easing?: AnimationEasing;
    once?: boolean;
    threshold?: number;
    rootMargin?: string;
    className?: string;
    as?: React.ElementType;
    disabled?: boolean;
    onVisible?: () => void;
    onHidden?: () => void;
    stagger?: number;
    staggerIndex?: number;
}

const AnimateOnView: React.FC<AnimateOnViewProps> = ({
    children,
    animation = 'fadeInUp',
    duration = 600,
    delay = 0,
    easing = 'ease-out',
    once = true,
    threshold = 0.1,
    rootMargin = '0px',
    className,
    as: Tag = 'div',
    disabled = false,
    onVisible,
    onHidden,
    stagger = 0,
    staggerIndex = 0,
}) => {
    const reducedMotion = useReducedMotion();
    const animationDisabled = disabled || reducedMotion;
    const [isVisible, setIsVisible] = useState(animationDisabled);
    const [hasAnimated, setHasAnimated] = useState(animationDisabled);
    const elementRef = useRef<HTMLElement>(null);
    const onVisibleRef = useRef(onVisible);
    const onHiddenRef = useRef(onHidden);

    useEffect(() => {
        onVisibleRef.current = onVisible;
        onHiddenRef.current = onHidden;
    }, [onVisible, onHidden]);

    const handleIntersection = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting) {
                if (once && hasAnimated) return;
                setIsVisible(true);
                setHasAnimated(true);
                onVisibleRef.current?.();
            } else {
                if (!once) {
                    setIsVisible(false);
                    onHiddenRef.current?.();
                }
            }
        },
        [once, hasAnimated],
    );

    useEffect(() => {
        if (animationDisabled) {
            setIsVisible(true);
            setHasAnimated(true);
            onVisibleRef.current?.();
            return;
        }

        const element = elementRef.current;
        if (!element) return;

        if (typeof IntersectionObserver === 'undefined') {
            setIsVisible(true);
            setHasAnimated(true);
            onVisibleRef.current?.();
            return;
        }

        const observer = new IntersectionObserver(handleIntersection, {
            threshold,
            rootMargin,
        });

        observer.observe(element);
        return () => observer.disconnect();
    }, [animationDisabled, threshold, rootMargin, handleIntersection]);

    const effectiveDelay = delay + stagger * staggerIndex;

    const animStyle: React.CSSProperties = {
        animationDuration: `${duration}ms`,
        animationDelay: `${effectiveDelay}ms`,
        animationTimingFunction: easing,
        animationFillMode: 'both',
    };

    if (animationDisabled) {
        return <Tag className={className}>{children}</Tag>;
    }

    return (
        <Tag
            ref={elementRef}
            className={cn(
                'eui-animate-on-view',
                {
                    [`eui-aov-${animation}`]: isVisible,
                    'eui-aov-hidden': !isVisible && !hasAnimated,
                    'eui-aov-visible': isVisible,
                },
                className,
            )}
            style={isVisible ? animStyle : undefined}
        >
            {children}
        </Tag>
    );
};

export { AnimateOnView };
export type { AnimateOnViewProps, AnimationType, AnimationEasing };
