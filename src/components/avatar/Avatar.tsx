import classNames from 'classnames';
import React, { useEffect, useId, useMemo, useState } from 'react';
import Icon from '../Icon';
import '../eui-base.scss';
import './Avatar.scss';

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'rounded' | 'square';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';
export type AvatarStatusPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface AvatarProps {
    src?: string;
    name?: string;
    icon?: IconComponent | React.ReactElement;
    alt?: string;
    shape?: AvatarShape;
    size?: AvatarSize | number;
    status?: AvatarStatus;
    statusPosition?: AvatarStatusPosition;
    colorFromName?: boolean;
    loading?: 'lazy' | 'eager';
    onClick?: (e: React.MouseEvent) => void;
    id?: string;
    className?: string;
    ariaLabel?: string;
}

const sizePxMap: Record<AvatarSize, number> = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
};

const hashCode = (str: string): number => {
    let h = 0;
    for (let i = 0; i < str.length; i += 1) {
        h = (h << 5) - h + str.charCodeAt(i);
        h |= 0;
    }
    return h;
};

const initialsFor = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const colorForName = (name: string): { background: string; color: string } => {
    const hash = Math.abs(hashCode(name));
    const hue = hash % 360;
    return {
        background: `hsl(${hue}, 60%, 65%)`,
        color: '#ffffff',
    };
};

const Avatar: React.FC<AvatarProps> = ({
    src,
    name,
    icon,
    alt,
    shape = 'circle',
    size = 'md',
    status,
    statusPosition = 'bottom-right',
    colorFromName = true,
    loading = 'lazy',
    onClick,
    id,
    className,
    ariaLabel,
}) => {
    const generatedId = useId();
    const avatarId = id ?? `avatar-${generatedId}`;
    const [imageFailed, setImageFailed] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        setImageFailed(false);
        setImageLoaded(false);
    }, [src]);

    const dimension = typeof size === 'number' ? size : sizePxMap[size];
    const initials = name ? initialsFor(name) : '';
    const colorPair = useMemo(
        () => (colorFromName && name ? colorForName(name) : { background: 'var(--eui-bg-hover)', color: 'var(--eui-text)' }),
        [colorFromName, name],
    );

    const dimensionClass =
        typeof size === 'string' ? `eui-avatar-${size}` : 'eui-avatar-custom';

    const renderInner = () => {
        if (src && !imageFailed) {
            return (
                <>
                    {!imageLoaded && <span className="eui-avatar-shimmer" aria-hidden="true" />}
                    <img
                        src={src}
                        alt={alt ?? name ?? ''}
                        loading={loading}
                        className={classNames('eui-avatar-img', { 'eui-avatar-img-loaded': imageLoaded })}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageFailed(true)}
                        draggable={false}
                    />
                </>
            );
        }
        if (initials) {
            return (
                <span className="eui-avatar-initials" aria-hidden="true">
                    {initials}
                </span>
            );
        }
        if (icon) {
            return <Icon icon={icon} className="eui-avatar-icon" aria-hidden="true" />;
        }
        return (
            <svg className="eui-avatar-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.3 0-9 1.6-9 5v1h18v-1c0-3.4-5.7-5-9-5Z"
                    fill="currentColor"
                />
            </svg>
        );
    };

    const customFontSize =
        typeof size === 'number' ? Math.max(10, Math.round(dimension * 0.4)) : undefined;

    const dotPositionClass = `eui-avatar-status-${statusPosition}`;
    const statusLabel = status ? status.charAt(0).toUpperCase() + status.slice(1) : null;

    const baseClasses = classNames(
        'eui-avatar',
        dimensionClass,
        `eui-avatar-shape-${shape}`,
        {
            'eui-avatar-no-image': !src || imageFailed,
            'eui-avatar-clickable': !!onClick,
        },
        className,
    );

    const baseStyle: React.CSSProperties = {
        width: dimension,
        height: dimension,
        fontSize: customFontSize,
    };

    const maskStyle: React.CSSProperties = {
        background: !src || imageFailed ? colorPair.background : undefined,
        color: !src || imageFailed ? colorPair.color : undefined,
    };

    const accessibleLabel = ariaLabel ?? alt ?? name ?? 'Avatar';

    const statusDot = status ? (
        <span className={classNames('eui-avatar-status-dot', `eui-avatar-status-${status}`, dotPositionClass)}>
            <span className="sr-only">{statusLabel}</span>
        </span>
    ) : null;

    const innerContent = (
        <>
            <span className="eui-avatar-mask" style={maskStyle} aria-hidden="true">
                {renderInner()}
            </span>
            {statusDot}
        </>
    );

    if (onClick) {
        return (
            <button
                type="button"
                id={avatarId}
                aria-label={accessibleLabel}
                className={baseClasses}
                style={baseStyle}
                onClick={onClick}
            >
                {innerContent}
            </button>
        );
    }

    return (
        <span
            id={avatarId}
            role={src && !imageFailed ? undefined : 'img'}
            aria-label={src && !imageFailed ? undefined : accessibleLabel}
            className={baseClasses}
            style={baseStyle}
        >
            {innerContent}
        </span>
    );
};

export { Avatar };
export default Avatar;
