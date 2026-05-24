import classNames from 'classnames';
import ShimmerDiv from './ShimmerDiv';
import '../eui-base.scss';
import './shimmer.scss';

interface SkeletonButtonProps {
    width?: string;
    height?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const sizeMap = {
    sm: { width: '4rem', height: '1.75rem' },
    md: { width: '6rem', height: '2.25rem' },
    lg: { width: '8rem', height: '2.75rem' },
};

export default function SkeletonButton({
    width,
    height,
    size = 'md',
    className,
    level = 2,
}: SkeletonButtonProps) {
    const dims = sizeMap[size];
    return (
        <ShimmerDiv
            level={level}
            className={classNames('eui-skeleton-button', className)}
            style={{
                width: width || dims.width,
                height: height || dims.height,
                borderRadius: 'var(--eui-radius-md)',
            }}
        >
            {null}
        </ShimmerDiv>
    );
}
