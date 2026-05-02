import classNames from 'classnames';
import React from 'react';
import './shimmer.scss';

interface ShimmerDivProps extends React.HTMLAttributes<HTMLDivElement> {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    animation?: 'shimmer' | 'pulse';
    loadingLabel?: string;
    repeat?: number;
    gap?: string | number;
}

function ShimmerDiv({
    className,
    level = 2,
    animation = 'shimmer',
    loadingLabel,
    repeat,
    gap,
    children,
    style,
    ...rest
}: ShimmerDivProps) {
    if (typeof repeat === 'number' && repeat > 1) {
        const wrapperStyle: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'column',
            gap: typeof gap === 'number' ? `${gap}px` : (gap ?? '0.5rem'),
            ...style,
        };
        return (
            <div
                className={classNames('eui-shimmer-repeat', className)}
                style={wrapperStyle}
                role="status"
                aria-busy="true"
                aria-live="polite"
                {...rest}
            >
                {loadingLabel && <span className="eui-visually-hidden">{loadingLabel}</span>}
                {Array.from({ length: repeat }, (_, i) => (
                    <div
                        key={i}
                        className={classNames('eui-shimmer', `eui-shimmer-level-${level}`, {
                            'eui-shimmer-anim-pulse': animation === 'pulse',
                        })}
                    >
                        {children}
                        {animation === 'shimmer' && <div className="eui-shimmer-overlay" />}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div
            className={classNames(
                'eui-shimmer',
                `eui-shimmer-level-${level}`,
                { 'eui-shimmer-anim-pulse': animation === 'pulse' },
                className,
            )}
            role="status"
            aria-busy="true"
            aria-live="polite"
            style={style}
            {...rest}
        >
            {loadingLabel && <span className="eui-visually-hidden">{loadingLabel}</span>}
            {children}
            {animation === 'shimmer' && <div className="eui-shimmer-overlay" aria-hidden="true" />}
        </div>
    );
}

export default ShimmerDiv;
