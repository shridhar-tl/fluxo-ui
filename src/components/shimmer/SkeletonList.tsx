import classNames from 'classnames';
import { useMemo } from 'react';
import SkeletonAvatar from './SkeletonAvatar';
import SkeletonText from './SkeletonText';
import { SkeletonLine, SkeletonRect } from './Skeleton';
import '../eui-base.scss';
import './shimmer.scss';

type SkeletonListVariant =
    | 'simple'
    | 'avatar-text'
    | 'avatar-two-line'
    | 'thumbnail'
    | 'two-line-action'
    | 'card-stack'
    | 'chat'
    | 'comment'
    | 'media';

interface SkeletonListProps {
    rows?: number;
    variant?: SkeletonListVariant;
    showDivider?: boolean;
    rowHeight?: string | number;
    avatarSize?: string;
    avatarShape?: 'circle' | 'square';
    gap?: string | number;
    padding?: string | number;
    animated?: boolean;
    animation?: 'shimmer' | 'pulse';
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    className?: string;
    loadingLabel?: string;
}

const toCss = (v: string | number | undefined): string | undefined =>
    typeof v === 'number' ? `${v}px` : v;

export default function SkeletonList({
    rows = 5,
    variant = 'avatar-two-line',
    showDivider = true,
    rowHeight,
    avatarSize = '2.5rem',
    avatarShape = 'circle',
    gap = '0.75rem',
    padding = '0.75rem 1rem',
    animated = true,
    animation = 'shimmer',
    level = 2,
    className,
    loadingLabel = 'Loading list',
}: SkeletonListProps) {
    const items = useMemo(() => {
        return Array.from({ length: rows }, (_, i) => {
            const key = i;
            switch (variant) {
                case 'simple':
                    return (
                        <div key={key} className="eui-skeleton-list-row">
                            <SkeletonLine
                                width="100%"
                                height={toCss(rowHeight) ?? '1rem'}
                                animated={animated}
                                animation={animation}
                                level={level}
                            />
                        </div>
                    );
                case 'avatar-text':
                    return (
                        <div key={key} className="eui-skeleton-list-row">
                            <SkeletonAvatar size={avatarSize} shape={avatarShape} level={level} />
                            <div className="eui-skeleton-list-row-body">
                                <SkeletonLine width="70%" height="0.875rem" animated={animated} animation={animation} level={level} />
                            </div>
                        </div>
                    );
                case 'avatar-two-line':
                    return (
                        <div key={key} className="eui-skeleton-list-row">
                            <SkeletonAvatar size={avatarSize} shape={avatarShape} level={level} />
                            <div className="eui-skeleton-list-row-body">
                                <SkeletonLine width="60%" height="0.875rem" animated={animated} animation={animation} level={level} />
                                <SkeletonLine width="40%" height="0.75rem" animated={animated} animation={animation} level={level} />
                            </div>
                            <SkeletonLine width="2.5rem" height="0.75rem" animated={animated} animation={animation} level={level} />
                        </div>
                    );
                case 'thumbnail':
                    return (
                        <div key={key} className="eui-skeleton-list-row">
                            <SkeletonRect width="3.5rem" height="3.5rem" radius="8px" animated={animated} animation={animation} level={level} />
                            <div className="eui-skeleton-list-row-body">
                                <SkeletonLine width="80%" height="0.875rem" animated={animated} animation={animation} level={level} />
                                <SkeletonLine width="55%" height="0.75rem" animated={animated} animation={animation} level={level} />
                            </div>
                        </div>
                    );
                case 'two-line-action':
                    return (
                        <div key={key} className="eui-skeleton-list-row">
                            <div className="eui-skeleton-list-row-body">
                                <SkeletonLine width="65%" height="0.875rem" animated={animated} animation={animation} level={level} />
                                <SkeletonLine width="45%" height="0.75rem" animated={animated} animation={animation} level={level} />
                            </div>
                            <SkeletonRect width="3.5rem" height="1.75rem" radius="999px" animated={animated} animation={animation} level={level} />
                        </div>
                    );
                case 'card-stack':
                    return (
                        <div key={key} className="eui-skeleton-list-card">
                            <SkeletonRect width="100%" height="9rem" radius="10px" animated={animated} animation={animation} level={level} />
                            <div className="eui-skeleton-list-card-body">
                                <SkeletonLine width="60%" height="1rem" animated={animated} animation={animation} level={level} />
                                <SkeletonText lines={2} lineHeight="0.75rem" lastLineWidth="40%" animated={animated} animation={animation} level={level} />
                            </div>
                        </div>
                    );
                case 'chat': {
                    const alignRight = i % 2 === 1;
                    return (
                        <div key={key} className={classNames('eui-skeleton-list-chat-row', { 'eui-skeleton-list-chat-row-right': alignRight })}>
                            {!alignRight && <SkeletonAvatar size="2rem" shape="circle" level={level} />}
                            <SkeletonRect
                                width={alignRight ? '55%' : '65%'}
                                height="2.25rem"
                                radius="14px"
                                animated={animated}
                                animation={animation}
                                level={level}
                            />
                            {alignRight && <SkeletonAvatar size="2rem" shape="circle" level={level} />}
                        </div>
                    );
                }
                case 'comment':
                    return (
                        <div key={key} className="eui-skeleton-list-row">
                            <SkeletonAvatar size="2rem" shape="circle" level={level} />
                            <div className="eui-skeleton-list-row-body">
                                <SkeletonLine width="35%" height="0.75rem" animated={animated} animation={animation} level={level} />
                                <SkeletonText lines={2} lineHeight="0.75rem" lastLineWidth="50%" animated={animated} animation={animation} level={level} />
                            </div>
                        </div>
                    );
                case 'media':
                    return (
                        <div key={key} className="eui-skeleton-list-media">
                            <SkeletonRect width="100%" height="0" radius="8px" className="eui-skeleton-list-media-image" animated={animated} animation={animation} level={level} />
                            <SkeletonLine width="80%" height="0.875rem" animated={animated} animation={animation} level={level} />
                            <SkeletonLine width="50%" height="0.75rem" animated={animated} animation={animation} level={level} />
                        </div>
                    );
                default:
                    return null;
            }
        });
    }, [rows, variant, rowHeight, avatarSize, avatarShape, animated, animation, level]);

    const isCardVariant = variant === 'card-stack' || variant === 'media';

    return (
        <div
            className={classNames(
                'eui-skeleton-list',
                `eui-skeleton-list-variant-${variant}`,
                {
                    'eui-skeleton-list-divider': showDivider && !isCardVariant,
                    'eui-skeleton-list-cards': isCardVariant,
                },
                className,
            )}
            style={{
                gap: toCss(gap),
                padding: toCss(padding),
            }}
            role="status"
            aria-busy="true"
            aria-live="polite"
        >
            <span className="eui-visually-hidden">{loadingLabel}</span>
            {items}
        </div>
    );
}

export type { SkeletonListProps, SkeletonListVariant };
