import classNames from 'classnames';
import ShimmerDiv from './ShimmerDiv';
import '../eui-base.scss';
import './shimmer.scss';

interface SkeletonImageProps {
    width?: string;
    height?: string;
    aspectRatio?: string;
    borderRadius?: string;
    className?: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export default function SkeletonImage({
    width = '100%',
    height,
    aspectRatio = '16/9',
    borderRadius = 'var(--eui-radius-md)',
    className,
    level = 2,
}: SkeletonImageProps) {
    return (
        <ShimmerDiv
            level={level}
            className={classNames('eui-skeleton-image', className)}
            style={{
                width,
                height: height || undefined,
                aspectRatio: height ? undefined : aspectRatio,
                borderRadius,
            }}
        >
            <svg
                className="eui-skeleton-image-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
            >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
            </svg>
        </ShimmerDiv>
    );
}
