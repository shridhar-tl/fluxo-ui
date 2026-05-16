import cn from 'classnames';
import React from 'react';
import './StepDots.scss';

type StepDotsVariant = 'dot' | 'bar' | 'pill' | 'numbered';
type StepDotsSize = 'sm' | 'md' | 'lg';

interface StepDotsProps {
    count: number;
    activeIndex: number;
    onChange?: (index: number) => void;
    variant?: StepDotsVariant;
    size?: StepDotsSize;
    color?: string;
    inactiveColor?: string;
    interactive?: boolean;
    showLabels?: boolean;
    labelFormatter?: (index: number, total: number) => string;
    className?: string;
    ariaLabel?: string;
}

const StepDots: React.FC<StepDotsProps> = ({
    count,
    activeIndex,
    onChange,
    variant = 'dot',
    size = 'md',
    color,
    inactiveColor,
    interactive = false,
    showLabels = false,
    labelFormatter,
    className,
    ariaLabel = 'Step progress',
}) => {
    const handleClick = (idx: number) => {
        if (!interactive) return;
        onChange?.(idx);
    };

    const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
        if (!interactive) return;
        if (e.key === 'ArrowLeft' && idx > 0) {
            e.preventDefault();
            onChange?.(idx - 1);
        } else if (e.key === 'ArrowRight' && idx < count - 1) {
            e.preventDefault();
            onChange?.(idx + 1);
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChange?.(idx);
        }
    };

    return (
        <div
            className={cn(
                'eui-step-dots',
                `eui-step-dots-variant-${variant}`,
                `eui-step-dots-size-${size}`,
                {
                    'eui-step-dots-interactive': interactive,
                },
                className,
            )}
            role="tablist"
            aria-label={ariaLabel}
        >
            {Array.from({ length: count }, (_, idx) => {
                const isActive = idx === activeIndex;
                const isCompleted = idx < activeIndex;
                const label = labelFormatter ? labelFormatter(idx, count) : `Step ${idx + 1} of ${count}`;
                const style: React.CSSProperties = {};
                if (isActive && color) style.backgroundColor = color;
                if (!isActive && inactiveColor) style.backgroundColor = inactiveColor;
                return (
                    <button
                        key={idx}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-current={isActive ? 'step' : undefined}
                        aria-label={label}
                        tabIndex={interactive ? (isActive ? 0 : -1) : -1}
                        disabled={!interactive}
                        className={cn('eui-step-dot', {
                            'eui-step-dot-active': isActive,
                            'eui-step-dot-completed': isCompleted,
                        })}
                        style={style}
                        onClick={() => handleClick(idx)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                    >
                        {variant === 'numbered' && <span className="eui-step-dot-number">{idx + 1}</span>}
                        {showLabels && variant !== 'numbered' && (
                            <span className="eui-visually-hidden">{label}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export { StepDots };
export type { StepDotsProps, StepDotsVariant, StepDotsSize };
