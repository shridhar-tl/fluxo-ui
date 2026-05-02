import classNames from 'classnames';
import { useMemo } from 'react';
import ShimmerDiv from './ShimmerDiv';
import './shimmer.scss';

interface SkeletonTextProps {
    lines?: number;
    lineHeight?: string;
    lineSpacing?: string;
    lastLineWidth?: string;
    className?: string;
    animated?: boolean;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    animation?: 'shimmer' | 'pulse';
    loadingLabel?: string;
}

export default function SkeletonText({
    lines = 3,
    lineHeight = '0.75rem',
    lineSpacing = '0.625rem',
    lastLineWidth = '60%',
    className,
    animated = true,
    level = 2,
    animation = 'shimmer',
    loadingLabel,
}: SkeletonTextProps) {
    const lineElements = useMemo(
        () =>
            Array.from({ length: lines }, (_, i) => {
                const isLast = i === lines - 1 && lines > 1;
                return (
                    <div
                        key={i}
                        className="eui-skeleton-text-line"
                        style={{
                            height: lineHeight,
                            width: isLast ? lastLineWidth : '100%',
                        }}
                    />
                );
            }),
        [lines, lineHeight, lastLineWidth],
    );

    if (!animated) {
        return (
            <div
                className={classNames('eui-skeleton-text', className)}
                style={{ gap: lineSpacing }}
                role="status"
                aria-busy="true"
                aria-live="polite"
            >
                {loadingLabel && <span className="eui-visually-hidden">{loadingLabel}</span>}
                {lineElements}
            </div>
        );
    }

    return (
        <ShimmerDiv
            level={level}
            animation={animation}
            loadingLabel={loadingLabel}
            className={classNames('eui-skeleton-text', className)}
            style={{ gap: lineSpacing, display: 'flex', flexDirection: 'column' }}
        >
            {lineElements}
        </ShimmerDiv>
    );
}
