import cn from 'classnames';
import React, { useCallback, useRef, useState } from 'react';
import '../eui-base.scss';
import './TouchRipple.scss';

type TouchRippleVariant = 'material' | 'subtle' | 'highlight' | 'outline';

interface RippleInstance {
    id: number;
    x: number;
    y: number;
    size: number;
}

interface TouchRippleProps {
    children: React.ReactNode;
    color?: string;
    center?: boolean;
    duration?: number;
    variant?: TouchRippleVariant;
    disabled?: boolean;
    className?: string;
    as?: keyof React.JSX.IntrinsicElements;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    role?: string;
    tabIndex?: number;
    ariaLabel?: string;
    style?: React.CSSProperties;
}

const TouchRipple: React.FC<TouchRippleProps> = ({
    children,
    color,
    center = false,
    duration = 500,
    variant = 'material',
    disabled = false,
    className,
    as,
    onClick,
    role,
    tabIndex,
    ariaLabel,
    style,
}) => {
    const [ripples, setRipples] = useState<RippleInstance[]>([]);
    const idRef = useRef(0);
    const Tag = (as ?? 'div') as React.ElementType;

    const addRipple = useCallback(
        (clientX: number, clientY: number, target: HTMLElement) => {
            if (disabled) return;
            const rect = target.getBoundingClientRect();
            const cx = center ? rect.width / 2 : clientX - rect.left;
            const cy = center ? rect.height / 2 : clientY - rect.top;
            const dx = Math.max(cx, rect.width - cx);
            const dy = Math.max(cy, rect.height - cy);
            const size = 2 * Math.sqrt(dx * dx + dy * dy);
            idRef.current += 1;
            const id = idRef.current;
            setRipples((prev) => [...prev, { id, x: cx, y: cy, size }]);
            window.setTimeout(() => {
                setRipples((prev) => prev.filter((r) => r.id !== id));
            }, duration);
        },
        [center, disabled, duration],
    );

    const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
        const target = e.currentTarget as HTMLElement;
        addRipple(e.clientX, e.clientY, target);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            const target = e.currentTarget as HTMLElement;
            const rect = target.getBoundingClientRect();
            addRipple(rect.left + rect.width / 2, rect.top + rect.height / 2, target);
        }
    };

    return (
        <Tag
            className={cn('eui-touch-ripple', `eui-touch-ripple-variant-${variant}`, className, {
                'eui-touch-ripple-disabled': disabled,
            })}
            onPointerDown={handlePointerDown}
            onKeyDown={handleKeyDown}
            onClick={onClick}
            role={role}
            tabIndex={tabIndex}
            aria-label={ariaLabel}
            aria-disabled={disabled || undefined}
            style={style}
        >
            {children}
            <span className="eui-touch-ripple-overlay" aria-hidden="true">
                {ripples.map((r) => (
                    <span
                        key={r.id}
                        className="eui-touch-ripple-blot"
                        style={{
                            top: r.y,
                            left: r.x,
                            width: r.size,
                            height: r.size,
                            animationDuration: `${duration}ms`,
                            background: color,
                        }}
                    />
                ))}
            </span>
        </Tag>
    );
};

export { TouchRipple };
export type { TouchRippleProps, TouchRippleVariant };
