import classNames from 'classnames';
import ShimmerDiv from './ShimmerDiv';
import './shimmer.scss';

interface SkeletonAvatarProps {
    size?: string;
    shape?: 'circle' | 'square';
    className?: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export default function SkeletonAvatar({
    size = '2.5rem',
    shape = 'circle',
    className,
    level = 2,
}: SkeletonAvatarProps) {
    return (
        <ShimmerDiv
            level={level}
            className={classNames('eui-skeleton-avatar', className)}
            style={{
                width: size,
                height: size,
                borderRadius: shape === 'circle' ? '50%' : 'var(--eui-radius-md)',
                flexShrink: 0,
            }}
        >
            {null}
        </ShimmerDiv>
    );
}
