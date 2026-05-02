import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { AngleLeftIcon, AngleRightIcon, TimesIcon } from '../../assets/icons';
import { Button } from '../Button';
import { Placement } from './types';
import { computeTooltipPosition } from './utils';
import './tour.scss';

export interface TourTooltipProps {
    step: {
        title?: React.ReactNode;
        content: React.ReactNode;
        placement?: Placement;
        selector: string;
    };
    targetRect: DOMRect;
    onNext: () => void;
    onPrev: () => void;
    onSkip: () => void;
    index: number;
    total: number;
    zIndex?: number;
    ariaLabel?: string;
    liveRegionId?: string;
}

const focusableSelector = [
    'button:not([disabled])',
    '[href]:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
].join(',');

export function TourTooltip({
    step,
    targetRect,
    onNext,
    onPrev,
    onSkip,
    index,
    total,
    zIndex = 10052,
    ariaLabel = 'Product tour',
    liveRegionId,
}: TourTooltipProps) {
    const isFirst = index === 0;
    const isLast = index === total - 1;

    const ref = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const [position, setPosition] = useState<{ top: number; left: number; placement: Placement }>({
        top: -9999,
        left: -9999,
        placement: 'bottom',
    });

    useEffect(() => {
        if (!ref.current) return;
        const tooltipRect = ref.current.getBoundingClientRect();
        const pos = computeTooltipPosition(targetRect, { width: tooltipRect.width, height: tooltipRect.height }, step.placement);
        setPosition(pos);
    }, [targetRect, step.placement]);

    useEffect(() => {
        previousFocusRef.current = document.activeElement as HTMLElement | null;
        const focusFrame = requestAnimationFrame(() => {
            const tooltip = ref.current;
            if (!tooltip) return;
            const focusable = tooltip.querySelectorAll<HTMLElement>(focusableSelector);
            if (focusable.length > 0) {
                focusable[0].focus();
            } else {
                tooltip.focus();
            }
        });
        return () => {
            cancelAnimationFrame(focusFrame);
            previousFocusRef.current?.focus?.();
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            const tooltip = ref.current;
            if (!tooltip) return;
            const focusable = Array.from(tooltip.querySelectorAll<HTMLElement>(focusableSelector)).filter(
                (el) => el.tabIndex !== -1,
            );
            if (focusable.length === 0) {
                e.preventDefault();
                tooltip.focus();
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first || !tooltip.contains(document.activeElement)) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last || !tooltip.contains(document.activeElement)) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            aria-describedby={liveRegionId}
            tabIndex={-1}
            className="eui-tour-tooltip"
            style={{
                top: position.top + window.scrollY,
                left: position.left + window.scrollX,
                zIndex,
            }}
        >
            <div className="eui-tour-tooltip-inner">
                <button type="button" className="eui-tour-tooltip-close" onClick={onSkip} aria-label="Close tour">
                    <TimesIcon aria-hidden="true" />
                </button>
                <div className="eui-tour-tooltip-body">
                    {!!step.title && <h2 className="eui-tour-tooltip-title">{step.title}</h2>}
                    {step.content}
                </div>
                <div className="eui-tour-tooltip-footer">
                    <Button
                        leftIcon={AngleLeftIcon}
                        onClick={onPrev}
                        disabled={isFirst}
                        aria-label="Previous step"
                        layout="plain"
                        className={classNames({ 'disabled:opacity-50': isFirst })}
                    />
                    <div className="eui-tour-tooltip-counter" aria-hidden="true">
                        {index + 1} of {total}
                    </div>
                    {!isLast && (
                        <Button
                            leftIcon={AngleRightIcon}
                            onClick={onNext}
                            layout="plain"
                            aria-label="Next step"
                        />
                    )}
                    {isLast && (
                        <button
                            onClick={onSkip}
                            className="eui-tour-tooltip-done"
                            aria-label="Done"
                            type="button"
                        >
                            Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
