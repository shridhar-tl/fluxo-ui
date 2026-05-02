import React, { useEffect, useId, useState } from 'react';
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
    ariaLabel?: string;
    interactiveHighlight?: boolean;
    onMissingStep?: (stepIndex: number, step: TourStep) => void;
}

function StepTour({
    steps,
    isOpen,
    onClose,
    initialStep = 0,
    zIndex = 10050,
    ariaLabel = 'Product tour',
    interactiveHighlight = false,
    onMissingStep,
}: StepTourProps) {
    const sortedSteps = React.useMemo(() => [...steps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [steps]);
    const [current, setCurrent] = useState<number>(initialStep);
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
    const generatedId = useId();
    const safeId = generatedId.replace(/[^a-zA-Z0-9_-]/g, '');
    const liveRegionId = `eui-tour-live-${safeId}`;
    const [liveMessage, setLiveMessage] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        if (initialStep >= 0 && initialStep < sortedSteps.length) {
            setCurrent(initialStep);
        }
    }, [initialStep, isOpen, sortedSteps.length]);

    useEffect(() => {
        if (!isOpen) return;

        function updateRect() {
            const step = sortedSteps[current];
            if (!step) return setHighlightRect(null);
            const el = document.querySelector(step.selector);
            if (!el || !(el instanceof HTMLElement)) {
                setHighlightRect(null);
                onMissingStep?.(current, step);
                if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
                    console.warn(`[StepTour] Step ${current} selector "${step.selector}" did not match any element.`);
                }
                return;
            }
            ensurePartiallyVisible(el);
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
                setHighlightRect(null);
                onMissingStep?.(current, step);
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
    }, [current, sortedSteps, isOpen, onMissingStep]);

    useEffect(() => {
        if (!isOpen) return;
        const step = sortedSteps[current];
        if (!step) return;
        const titleStr = typeof step.title === 'string' ? step.title : '';
        const message = `Step ${current + 1} of ${sortedSteps.length}${titleStr ? `: ${titleStr}` : ''}`;
        setLiveMessage('');
        const t = window.setTimeout(() => setLiveMessage(message), 30);
        return () => window.clearTimeout(t);
    }, [current, isOpen, sortedSteps]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

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
            {highlightRect && <HighlightOverlay rect={highlightRect} zIndex={zIndex + 1} interactive={interactiveHighlight} />}
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
                    ariaLabel={ariaLabel}
                    liveRegionId={liveRegionId}
                />
            )}
            <div
                id={liveRegionId}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="eui-visually-hidden"
            >
                {liveMessage}
            </div>
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

export const Backdrop: React.FC<BackdropProps> = ({ visible, highlightRect, zIndex = 10050 }) => {
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
    interactive?: boolean;
}

function HighlightOverlay({ rect, zIndex = 10051, interactive = false }: HighlightOverlayProps) {
    return (
        <div
            className="eui-tour-highlight"
            aria-hidden="true"
            style={{
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                height: rect.height,
                zIndex,
                pointerEvents: interactive ? 'none' : undefined,
            }}
        />
    );
}
