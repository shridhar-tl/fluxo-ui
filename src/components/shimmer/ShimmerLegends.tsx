import classNames from 'classnames';
import React from 'react';
import ShimmerDiv from './ShimmerDiv';

export interface ShimmerLegendProps extends React.HTMLAttributes<HTMLDivElement> {
    count: number;
    className?: string;
    position?: 'bottom' | 'top' | 'left' | 'right';
}

function ShimmerLegends({ count, position = 'top' }: ShimmerLegendProps) {
    return (
        <div
            className={classNames('eui-shimmer-legends', {
                'eui-shimmer-legends-vertical': position === 'left' || position === 'right',
            })}
        >
            {Array.from({ length: count }).map((_, i) => (
                <ShimmerDiv key={i} level={1} className="eui-shimmer-legends-item">
                    <div className="eui-shimmer-legends-icon" />
                    <div className="eui-shimmer-legends-label" />
                </ShimmerDiv>
            ))}
        </div>
    );
}

export default ShimmerLegends;
