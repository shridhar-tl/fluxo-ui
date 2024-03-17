import classNames from 'classnames';
import React, { useMemo } from 'react';
import ShimmerDiv from './ShimmerDiv';
import ShimmerLegends from './ShimmerLegends';

export interface ShimmerBarChartProps extends React.HTMLAttributes<HTMLDivElement> {
    barWidth?: number;
    count?: number;
    order?: 'asc' | 'desc' | 'random';
    legendsCount?: number;
    className?: string;
    legendPosition?: 'bottom' | 'top';
    showYAxis?: boolean;
}

const generateHeights = (barCount: number, order: 'asc' | 'desc' | 'random') => {
    const minH = 15;
    const maxH = 95;
    const heights: number[] = [];

    if (order === 'asc') {
        const step = barCount > 1 ? (maxH - minH) / (barCount - 1) : 0;
        for (let i = 0; i < barCount; i++) {
            heights.push(minH + step * i);
        }
    } else if (order === 'desc') {
        const step = barCount > 1 ? (maxH - minH) / (barCount - 1) : 0;
        for (let i = 0; i < barCount; i++) {
            heights.push(maxH - step * i);
        }
    } else {
        const presets = [65, 40, 85, 30, 72, 55, 90, 45, 60, 35];
        for (let i = 0; i < barCount; i++) {
            heights.push(presets[i % presets.length]);
        }
    }
    return heights;
};

function ShimmerBarChart({
    legendsCount = 0,
    count = 0,
    order = 'random',
    className,
    legendPosition = 'top',
    showYAxis = true,
    ...rest
}: ShimmerBarChartProps) {
    const barCount = count && count > 0 ? count : 6;
    const heights = useMemo(() => generateHeights(barCount, order), [barCount, order]);
    const legends = legendsCount > 0 && <ShimmerLegends count={legendsCount} position={legendPosition} />;

    return (
        <div className={classNames('eui-shimmer-bar-chart', className)} style={{ paddingLeft: showYAxis ? '3rem' : 0 }} {...rest}>
            {legendPosition === 'top' && legends}
            <div className="eui-shimmer-bar-chart-axis">
                {showYAxis && (
                    <div className="eui-shimmer-bar-chart-y-labels">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <ShimmerDiv key={i} level={2} className="eui-shimmer-bar-chart-y-label" />
                        ))}
                    </div>
                )}
                <div className="eui-shimmer-bar-chart-bars">
                    {heights.map((height, index) => (
                        <ShimmerDiv key={index} level={3} className="eui-shimmer-bar-chart-bar" style={{ height: `${height}%` }} />
                    ))}
                </div>
            </div>
            <div className="eui-shimmer-bar-chart-x-labels">
                {heights.map((_, index) => (
                    <ShimmerDiv key={index} level={2} className="eui-shimmer-bar-chart-x-label" />
                ))}
            </div>
            {legendPosition === 'bottom' && legends}
        </div>
    );
}

export default ShimmerBarChart;
