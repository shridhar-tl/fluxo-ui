import classNames from 'classnames';
import React from 'react';
import ShimmerDiv from './ShimmerDiv';
import ShimmerLegends from './ShimmerLegends';

export interface ShimmerPieChartProps extends React.HTMLAttributes<HTMLDivElement> {
    legendPosition?: 'right' | 'left' | 'top' | 'bottom';
    legendsCount?: number;
    className?: string;
    containerClassName?: string;
    doughnut?: boolean;
}

function ShimmerPieChart({ legendsCount, legendPosition, doughnut, containerClassName }: ShimmerPieChartProps) {
    const legends = !!legendsCount && <ShimmerLegends count={legendsCount} position={legendPosition} />;
    const isVertical = legendPosition == 'top' || legendPosition === 'bottom';
    return (
        <div className={classNames('eui-shimmer-pie-chart', { 'eui-shimmer-pie-chart-vertical': isVertical, 'eui-shimmer-pie-chart-horizontal': !isVertical }, containerClassName)}>
            {(legendPosition == 'top' || legendPosition === 'left') && legends}
            <div className="eui-shimmer-pie-chart-circle">
                <ShimmerDiv className="h-full rounded-full">
                    {!!doughnut && <div className="eui-shimmer-pie-chart-doughnut-hole" />}
                </ShimmerDiv>
            </div>
            {(legendPosition == 'right' || legendPosition === 'bottom') && legends}
        </div>
    );
}

export default ShimmerPieChart;
