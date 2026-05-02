import classNames from 'classnames';
import React from 'react';
import ShimmerDiv from './ShimmerDiv';
import './shimmer.scss';

interface SkeletonLineProps {
    width?: string | number;
    height?: string | number;
    radius?: string | number;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    animation?: 'shimmer' | 'pulse';
    animated?: boolean;
    className?: string;
    loadingLabel?: string;
}

const sizeOf = (v: string | number | undefined): string | undefined =>
    typeof v === 'number' ? `${v}px` : v;

export const SkeletonLine: React.FC<SkeletonLineProps> = ({
    width = '100%',
    height = '0.75rem',
    radius = '4px',
    level = 2,
    animation = 'shimmer',
    animated = true,
    className,
    loadingLabel,
}) => {
    const style: React.CSSProperties = {
        width: sizeOf(width),
        height: sizeOf(height),
        borderRadius: sizeOf(radius),
    };
    if (!animated) {
        return (
            <div
                className={classNames('eui-skeleton-line', className)}
                style={style}
                role="status"
                aria-busy="true"
                aria-live="polite"
            >
                {loadingLabel && <span className="eui-visually-hidden">{loadingLabel}</span>}
            </div>
        );
    }
    return (
        <ShimmerDiv
            level={level}
            animation={animation}
            loadingLabel={loadingLabel}
            className={classNames('eui-skeleton-line', className)}
            style={style}
        />
    );
};

interface SkeletonRectProps extends SkeletonLineProps {
    width?: string | number;
    height?: string | number;
}

export const SkeletonRect: React.FC<SkeletonRectProps> = ({
    width = '100%',
    height = '4rem',
    radius = '6px',
    level = 2,
    animation = 'shimmer',
    animated = true,
    className,
    loadingLabel,
}) => (
    <SkeletonLine
        width={width}
        height={height}
        radius={radius}
        level={level}
        animation={animation}
        animated={animated}
        className={classNames('eui-skeleton-rect', className)}
        loadingLabel={loadingLabel}
    />
);

export const Skeleton = {
    Line: SkeletonLine,
    Rect: SkeletonRect,
};

export default Skeleton;
