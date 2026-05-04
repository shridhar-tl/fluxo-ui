import classNames from 'classnames';
import React from 'react';
import { chatIcon } from '../icons';
import './chat-launcher.scss';

export type ChatLauncherVariant = 'icon' | 'morph' | 'beacon' | 'pulsar' | 'expand' | 'bar' | 'spark';
export type ChatLauncherAlign = 'bottomRight' | 'bottomLeft';

export interface ChatLauncherProps {
    variant?: ChatLauncherVariant;
    imageUrl?: string;
    text?: string;
    bgColor?: string;
    secBgColor?: string;
    fontColor?: string;
    align?: ChatLauncherAlign;
    spacingCorner?: string;
    spacingBottom?: string;
    showTooltip?: boolean;
    tooltipText?: string;
    icon?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    buttonOnMobile?: boolean;
    autoAnimate?: boolean;
    onClick: () => void;
}

function isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
}

export function ChatLauncher(props: ChatLauncherProps) {
    const {
        variant = 'spark',
        imageUrl,
        text = 'Live Chat',
        bgColor,
        secBgColor,
        fontColor,
        align = 'bottomRight',
        spacingCorner,
        spacingBottom,
        showTooltip,
        tooltipText = 'We are online!',
        icon,
        className,
        style,
        buttonOnMobile,
        autoAnimate = true,
        onClick,
    } = props;

    const isLeft = align === 'bottomLeft';
    const positionStyle: React.CSSProperties = {
        bottom: spacingBottom,
        [isLeft ? 'left' : 'right']: spacingCorner,
    } as React.CSSProperties;

    const colorVars: React.CSSProperties = {
        ['--euic-launcher-bg' as any]: bgColor,
        ['--euic-launcher-bg2' as any]: secBgColor,
        ['--euic-launcher-fg' as any]: fontColor,
    };
    const merged: React.CSSProperties = { ...positionStyle, ...colorVars, ...style };
    const positionClass = isLeft ? 'eui-chat-pos-left' : 'eui-chat-pos-right';
    const baseCls = `eui-chat-launcher ${positionClass}`;

    const renderIcon = () => {
        if (icon) return icon;
        if (imageUrl) {
            const isSvg = imageUrl.toLowerCase().endsWith('.svg');
            return <img src={imageUrl} alt={text} className={isSvg ? 'eui-chat-launcher-svg' : 'eui-chat-launcher-img'} />;
        }
        return chatIcon;
    };

    const useIconVariant = variant === 'icon' || (buttonOnMobile && isMobile());

    if (useIconVariant) {
        const isSvg = imageUrl && imageUrl.toLowerCase().endsWith('.svg');
        return (
            <div
                className={classNames(baseCls, 'eui-chat-icon-btn', { 'eui-chat-icon-btn-bordered': !imageUrl || isSvg }, className)}
                style={merged}
                onClick={onClick}
                role="button"
                tabIndex={0}
                aria-label={text}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onClick();
                    }
                }}
            >
                {showTooltip && <LauncherTooltip text={tooltipText} isLeft={isLeft} />}
                {renderIcon()}
            </div>
        );
    }

    if (variant === 'morph') {
        return (
            <div className={classNames(baseCls, 'eui-chat-morph', className)} style={merged} onClick={onClick} role="button" tabIndex={0} aria-label={text}>
                <div className="eui-chat-morph-glow" />
                <div className="eui-chat-morph-shimmer" />
                <div className="eui-chat-morph-icon">{renderIcon()}</div>
            </div>
        );
    }

    if (variant === 'beacon') {
        return (
            <div className={classNames(baseCls, 'eui-chat-beacon', className)} style={merged} onClick={onClick} role="button" tabIndex={0} aria-label={text}>
                <div className="eui-chat-beacon-track">
                    <div className="eui-chat-beacon-icon">{renderIcon()}</div>
                    <span className="eui-chat-beacon-label">{text}</span>
                    <span className="eui-chat-beacon-status">
                        <span className="eui-chat-beacon-wave" />
                    </span>
                </div>
            </div>
        );
    }

    if (variant === 'pulsar') {
        return (
            <div className={classNames(baseCls, 'eui-chat-pulsar', className)} style={merged} onClick={onClick} role="button" tabIndex={0} aria-label={text}>
                <span className="eui-chat-pulsar-ring eui-chat-pulsar-ring-1" />
                <span className="eui-chat-pulsar-ring eui-chat-pulsar-ring-2" />
                <span className="eui-chat-pulsar-ring eui-chat-pulsar-ring-3" />
                <div className="eui-chat-pulsar-orbit">
                    <span className="eui-chat-pulsar-dot" />
                </div>
                <div className="eui-chat-pulsar-core">
                    <div className="eui-chat-pulsar-icon">{renderIcon()}</div>
                </div>
            </div>
        );
    }

    if (variant === 'expand' || variant === 'bar') {
        return <ExpandLauncher {...props} renderIcon={renderIcon} merged={merged} positionClass={positionClass} autoAnimate={autoAnimate} />;
    }

    return (
        <div className={classNames(baseCls, 'eui-chat-spark', className)} style={merged} onClick={onClick} role="button" tabIndex={0} aria-label={text}>
            <div className="eui-chat-spark-arc" />
            <div className="eui-chat-spark-inner">
                <div className="eui-chat-spark-icon">{renderIcon()}</div>
                <span className="eui-chat-spark-label">{text}</span>
            </div>
        </div>
    );
}

function LauncherTooltip({ text, isLeft }: { text: string; isLeft: boolean }) {
    const [show, setShow] = React.useState(true);
    if (!show) return null;
    return (
        <div className={'eui-chat-launcher-tooltip ' + (isLeft ? 'eui-chat-tip-left' : 'eui-chat-tip-right')}>
            <span>{text}</span>
            <button
                type="button"
                className="eui-chat-launcher-tooltip-close"
                onClick={(e) => {
                    e.stopPropagation();
                    setShow(false);
                }}
                aria-label="Dismiss"
            >
                ×
            </button>
        </div>
    );
}

interface ExpandLauncherProps extends ChatLauncherProps {
    renderIcon: () => React.ReactNode;
    merged: React.CSSProperties;
    positionClass: string;
}

function ExpandLauncher({ text = 'Live Chat', renderIcon, merged, positionClass, onClick, className, autoAnimate }: ExpandLauncherProps) {
    const textRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (!autoAnimate) return;
        const handle = setInterval(() => {
            textRef.current?.classList.remove('eui-chat-expand-collapsed');
            setTimeout(() => textRef.current?.classList.add('eui-chat-expand-collapsed'), 7000);
        }, 35000);
        return () => clearInterval(handle);
    }, [autoAnimate]);

    return (
        <div className={classNames('eui-chat-launcher eui-chat-expand', positionClass, className)} style={merged} onClick={onClick} role="button" tabIndex={0} aria-label={text}>
            <div ref={textRef} className="eui-chat-expand-text eui-chat-expand-collapsed">
                <div className="eui-chat-expand-label">
                    <p>{text}</p>
                </div>
            </div>
            <div className="eui-chat-expand-icon-wrap">
                <div className="eui-chat-expand-icon-inner">{renderIcon()}</div>
            </div>
        </div>
    );
}

export default ChatLauncher;
