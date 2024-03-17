import cn from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TimesIcon } from '../../assets/icons';
import './PageBanner.scss';

type BannerType = 'info' | 'success' | 'warning' | 'error' | 'default';
type BannerPosition = 'top' | 'inline';

interface PageBannerProps {
    type?: BannerType;
    message: React.ReactNode;
    title?: string;
    icon?: React.ReactNode;
    showIcon?: boolean;
    dismissible?: boolean;
    autoDismiss?: number;
    onDismiss?: () => void;
    visible?: boolean;
    position?: BannerPosition;
    pageLevel?: boolean;
    pushContent?: boolean;
    className?: string;
    actions?: React.ReactNode;
    bordered?: boolean;
}

const defaultIcons: Record<BannerType, React.ReactNode> = {
    info: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
        </svg>
    ),
    success: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    warning: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    error: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    ),
    default: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
        </svg>
    ),
};

const PageBanner: React.FC<PageBannerProps> = ({
    type = 'info',
    message,
    title,
    icon,
    showIcon = true,
    dismissible = true,
    autoDismiss,
    onDismiss,
    visible = true,
    position: _position = 'inline',
    pageLevel = false,
    pushContent = false,
    className,
    actions,
    bordered = false,
}) => {
    const [internalVisible, setInternalVisible] = useState(visible);
    const [animating, setAnimating] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const bannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (visible) {
            setInternalVisible(true);
            setAnimating(false);
        } else {
            handleDismissAnimation();
        }
    }, [visible]);

    useEffect(() => {
        if (!internalVisible || !autoDismiss) return;

        timerRef.current = setTimeout(() => {
            handleDismissAnimation();
        }, autoDismiss);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [internalVisible, autoDismiss]);

    const handleDismissAnimation = useCallback(() => {
        setAnimating(true);
        setTimeout(() => {
            setInternalVisible(false);
            setAnimating(false);
            onDismiss?.();
        }, 300);
    }, [onDismiss]);

    const handleDismiss = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        handleDismissAnimation();
    }, [handleDismissAnimation]);

    if (!internalVisible) return null;

    const displayIcon = icon || (showIcon ? defaultIcons[type] : null);

    const bannerContent = (
        <div
            ref={bannerRef}
            className={cn(
                'eui-page-banner',
                `eui-page-banner-${type}`,
                {
                    'eui-page-banner-page-level': pageLevel,
                    'eui-page-banner-push': pushContent && pageLevel,
                    'eui-page-banner-bordered': bordered,
                    'eui-page-banner-entering': !animating && internalVisible,
                    'eui-page-banner-exiting': animating,
                },
                className,
            )}
            role="alert"
            aria-live="polite"
        >
            <div className="eui-page-banner-content">
                {displayIcon && <div className="eui-page-banner-icon">{displayIcon}</div>}
                <div className="eui-page-banner-body">
                    {title && <div className="eui-page-banner-title">{title}</div>}
                    <div className="eui-page-banner-message">{message}</div>
                </div>
                {actions && <div className="eui-page-banner-actions">{actions}</div>}
                {dismissible && (
                    <button
                        className="eui-page-banner-dismiss"
                        onClick={handleDismiss}
                        aria-label="Dismiss banner"
                        type="button"
                    >
                        <TimesIcon />
                    </button>
                )}
            </div>
            {autoDismiss && internalVisible && !animating && (
                <div
                    className="eui-page-banner-progress"
                    style={{ animationDuration: `${autoDismiss}ms` }}
                />
            )}
        </div>
    );

    if (pageLevel) {
        return createPortal(bannerContent, document.body);
    }

    return bannerContent;
};

export { PageBanner };
export type { PageBannerProps, BannerType, BannerPosition };
