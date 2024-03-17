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
}

export function TourTooltip({ step, targetRect, onNext, onPrev, onSkip, index, total, zIndex = 1002 }: TourTooltipProps) {
    const isFirst = index === 0;
    const isLast = index === total - 1;

    const ref = useRef<HTMLDivElement>(null);
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

    return (
        <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            className="eui-tour-tooltip"
            style={{
                top: position.top + window.scrollY,
                left: position.left + window.scrollX,
                zIndex,
            }}
        >
            <div className="eui-tour-tooltip-inner">
                <button className="eui-tour-tooltip-close" onClick={onSkip} title="Click to close">
                    <span className="sr-only">Close</span>
                    <TimesIcon />
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
                    <div className="eui-tour-tooltip-counter">
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
