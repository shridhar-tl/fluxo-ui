import classNames from 'classnames';
import ShimmerDiv from './ShimmerDiv';
import SkeletonText from './SkeletonText';
import SkeletonAvatar from './SkeletonAvatar';
import SkeletonButton from './SkeletonButton';
import '../eui-base.scss';
import './shimmer.scss';

interface SkeletonCardProps {
    showImage?: boolean;
    showAvatar?: boolean;
    showTitle?: boolean;
    showDescription?: boolean;
    showActions?: boolean;
    imageHeight?: string;
    titleLines?: number;
    descriptionLines?: number;
    actionCount?: number;
    className?: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export default function SkeletonCard({
    showImage = true,
    showAvatar = false,
    showTitle = true,
    showDescription = true,
    showActions = false,
    imageHeight = '12rem',
    titleLines = 1,
    descriptionLines = 3,
    actionCount = 2,
    className,
    level = 2,
}: SkeletonCardProps) {
    return (
        <div className={classNames('eui-skeleton-card', className)}>
            {showImage && (
                <ShimmerDiv
                    level={level}
                    className="eui-skeleton-card-image"
                    style={{ height: imageHeight }}
                >
                    {null}
                </ShimmerDiv>
            )}
            <div className="eui-skeleton-card-body">
                {showAvatar && (
                    <div className="eui-skeleton-card-header">
                        <SkeletonAvatar size="2.5rem" level={level} />
                        <div className="eui-skeleton-card-header-text">
                            <ShimmerDiv level={level} style={{ width: '40%', height: '0.75rem', borderRadius: 'var(--eui-radius-sm)' }}>{null}</ShimmerDiv>
                            <ShimmerDiv level={level} style={{ width: '25%', height: '0.625rem', borderRadius: 'var(--eui-radius-sm)' }}>{null}</ShimmerDiv>
                        </div>
                    </div>
                )}
                {showTitle && (
                    <SkeletonText lines={titleLines} lineHeight="1rem" lastLineWidth="75%" level={level} />
                )}
                {showDescription && (
                    <SkeletonText lines={descriptionLines} lineHeight="0.75rem" level={level} />
                )}
                {showActions && (
                    <div className="eui-skeleton-card-actions">
                        {Array.from({ length: actionCount }, (_, i) => (
                            <SkeletonButton key={i} size="sm" level={level} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
