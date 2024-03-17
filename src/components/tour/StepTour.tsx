import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { ensurePartiallyVisible } from '../../utils/layout';
import { TourTooltip } from './TourTooltip';
import { TourStep } from './types';

interface StepTourProps {
    steps: TourStep[];
    isOpen: boolean;
    onClose: () => void;
    initialStep?: number;
    zIndex?: number;
    className?: string;
}

function StepTour({ steps, isOpen, onClose, initialStep = 0, zIndex = 1000 }: StepTourProps) {
    const sortedSteps = React.useMemo(() => [...steps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [steps]);
    const [current, setCurrent] = useState<number>(initialStep);
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        function updateRect() {
            const step = sortedSteps[current];
            if (!step) return setHighlightRect(null);
            const el = document.querySelector(step.selector);
            if (!el || !(el instanceof HTMLElement)) {
                setHighlightRect(null);
                return;
            }
            ensurePartiallyVisible(el);
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
                setHighlightRect(null);
                return;
            }
            setHighlightRect(rect);
        }
        updateRect();
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect, true);
        return () => {
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect, true);
        };
    }, [current, sortedSteps, isOpen]);

    if (!isOpen || !sortedSteps.length) return null;

    const step = sortedSteps[current];
    const onNext = () => {
        if (step.onNext) step.onNext();
        if (current < sortedSteps.length - 1) setCurrent((c) => c + 1);
        else onClose();
    };
    const onPrev = () => {
        if (step.onPrev) step.onPrev();
        if (current > 0) setCurrent((c) => c - 1);
    };
    const onSkip = () => {
        if (step.onSkip) step.onSkip();
        onClose();
    };

    return ReactDOM.createPortal(
        <>
            <Backdrop visible={!!highlightRect} zIndex={zIndex} highlightRect={highlightRect} />
            {highlightRect && <HighlightOverlay rect={highlightRect} zIndex={zIndex + 1} />}
            {highlightRect && (
                <TourTooltip
                    step={step}
                    targetRect={highlightRect}
                    onNext={onNext}
                    onPrev={onPrev}
                    onSkip={onSkip}
                    index={current}
                    total={sortedSteps.length}
                    zIndex={zIndex + 2}
                />
            )}
        </>,
        document.body
    );
}

export default StepTour;

interface BackdropProps {
    visible: boolean;
    highlightRect: DOMRect | null;
    zIndex?: number;
}

export const Backdrop: React.FC<BackdropProps> = ({ visible, highlightRect, zIndex = 1000 }) => {
    if (!visible || !highlightRect) return null;

    const { top, left, width, height } = highlightRect;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const topClamped = top + scrollY;
    const leftClamped = left + scrollX;

    return (
        <div
            aria-hidden="true"
            className="eui-tour-backdrop"
            style={{
                zIndex,
                clipPath: `polygon(
          0% 0%, 100% 0%, 100% 100%, 0% 100%,
          0% 0%,
          0% ${topClamped}px,
          ${leftClamped}px ${topClamped}px,
          ${leftClamped}px ${topClamped + height}px,
          ${leftClamped + width}px ${topClamped + height}px,
          ${leftClamped + width}px ${topClamped}px,
          ${leftClamped}px ${topClamped}px,
          0% ${topClamped}px
        )`,
            }}
        />
    );
};

interface HighlightOverlayProps {
    rect: DOMRect;
    zIndex?: number;
}

function HighlightOverlay({ rect, zIndex = 1001 }: HighlightOverlayProps) {
    return (
        <div
            className="eui-tour-highlight"
            style={{
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                height: rect.height,
                zIndex,
            }}
        />
    );
}
