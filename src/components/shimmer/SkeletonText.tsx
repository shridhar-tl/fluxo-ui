import classNames from 'classnames';
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
}

export default function SkeletonText({
    lines = 3,
    lineHeight = '0.75rem',
    lineSpacing = '0.625rem',
    lastLineWidth = '60%',
    className,
    animated = true,
    level = 2,
}: SkeletonTextProps) {
    return (
        <div className={classNames('eui-skeleton-text', className)} style={{ gap: lineSpacing }}>
            {Array.from({ length: lines }, (_, i) => {
                const isLast = i === lines - 1 && lines > 1;
                const lineEl = (
                    <div
                        key={i}
                        className="eui-skeleton-text-line"
                        style={{
                            height: lineHeight,
                            width: isLast ? lastLineWidth : '100%',
                        }}
                    />
                );
                return animated ? (
                    <ShimmerDiv key={i} level={level} className="eui-skeleton-text-line-wrap" style={{ width: isLast ? lastLineWidth : '100%', height: lineHeight }}>
                        {null}
                    </ShimmerDiv>
                ) : (
                    lineEl
                );
            })}
        </div>
    );
}
