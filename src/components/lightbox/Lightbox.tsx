import cn from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './Lightbox.scss';

type LightboxTrigger = 'hover' | 'click';
type LightboxPosition = 'auto' | 'top' | 'bottom' | 'left' | 'right' | 'center';

interface LightboxProps {
    children: React.ReactNode;
    content: React.ReactNode;
    trigger?: LightboxTrigger;
    position?: LightboxPosition;
    width?: string | number;
    height?: string | number;
    zoomOut?: boolean;
    zoomScale?: number;
    zoomWidth?: string | number;
    zoomHeight?: string | number;
    backdrop?: boolean;
    closeOnBackdropClick?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
    className?: string;
    contentClassName?: string;
    hoverDelay?: number;
    hoverCloseDelay?: number;
    disabled?: boolean;
    ariaLabel?: string;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    onOpen?: () => void;
    onClose?: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({
    children,
    content,
    trigger = 'hover',
    position = 'auto',
    width = 400,
    height,
    zoomOut = false,
    zoomScale = 0.5,
    zoomWidth = '100vw',
    zoomHeight = '100vh',
    backdrop = true,
    closeOnBackdropClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    className,
    contentClassName,
    hoverDelay = 300,
    hoverCloseDelay = 200,
    disabled = false,
    ariaLabel,
    header,
    footer,
    onOpen,
    onClose,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const hoverOpenTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const hoverCloseTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const $this = useRef({ onOpen, onClose });
    $this.current = { onOpen, onClose };

    const open = useCallback(() => {
        if (disabled) return;
        setIsOpen(true);
        $this.current.onOpen?.();
    }, [disabled]);

    const close = useCallback(() => {
        setIsOpen(false);
        $this.current.onClose?.();
    }, []);

    const calculatePosition = useCallback(() => {
        if (!triggerRef.current || position === 'center') return;

        const rect = triggerRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const w = typeof width === 'number' ? width : 400;
        const gap = 12;

        let pos = position;
        if (pos === 'auto') {
            const spaceRight = vw - rect.right;
            const spaceLeft = rect.left;
            const spaceBottom = vh - rect.bottom;
            const spaceTop = rect.top;

            if (spaceRight >= w + gap) pos = 'right';
            else if (spaceLeft >= w + gap) pos = 'left';
            else if (spaceBottom >= 300) pos = 'bottom';
            else if (spaceTop >= 300) pos = 'top';
            else pos = 'right';
        }

        const style: React.CSSProperties = {};

        switch (pos) {
            case 'right':
                style.left = rect.right + gap;
                style.top = Math.max(gap, Math.min(rect.top, vh - 400));
                break;
            case 'left':
                style.left = rect.left - w - gap;
                style.top = Math.max(gap, Math.min(rect.top, vh - 400));
                break;
            case 'bottom':
                style.left = Math.max(gap, rect.left);
                style.top = rect.bottom + gap;
                break;
            case 'top':
                style.left = Math.max(gap, rect.left);
                style.top = rect.top - gap;
                style.transform = 'translateY(-100%)';
                break;
        }

        setPopoverStyle(style);
    }, [position, width]);

    useEffect(() => {
        if (isOpen && position !== 'center') {
            calculatePosition();
            const handleResize = () => calculatePosition();
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [isOpen, calculatePosition, position]);

    useEffect(() => {
        if (!isOpen || !closeOnEscape) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, closeOnEscape, close]);

    const handleTriggerMouseEnter = useCallback(() => {
        if (trigger !== 'hover' || disabled) return;
        clearTimeout(hoverCloseTimer.current);
        hoverOpenTimer.current = setTimeout(open, hoverDelay);
    }, [trigger, disabled, open, hoverDelay]);

    const handleTriggerMouseLeave = useCallback(() => {
        if (trigger !== 'hover') return;
        clearTimeout(hoverOpenTimer.current);
        hoverCloseTimer.current = setTimeout(close, hoverCloseDelay);
    }, [trigger, close, hoverCloseDelay]);

    const handlePopoverMouseEnter = useCallback(() => {
        if (trigger !== 'hover') return;
        clearTimeout(hoverCloseTimer.current);
    }, [trigger]);

    const handlePopoverMouseLeave = useCallback(() => {
        if (trigger !== 'hover') return;
        hoverCloseTimer.current = setTimeout(close, hoverCloseDelay);
    }, [trigger, close, hoverCloseDelay]);

    const handleTriggerClick = useCallback(() => {
        if (trigger !== 'click' || disabled) return;
        if (isOpen) close();
        else open();
    }, [trigger, disabled, isOpen, open, close]);

    const handleBackdropClick = useCallback(
        (e: React.MouseEvent) => {
            if (closeOnBackdropClick && e.target === e.currentTarget) close();
        },
        [closeOnBackdropClick, close],
    );

    useEffect(() => {
        return () => {
            clearTimeout(hoverOpenTimer.current);
            clearTimeout(hoverCloseTimer.current);
        };
    }, []);

    const isCenter = position === 'center';

    const renderContent = () => {
        if (!isOpen) return null;

        const sizeStyle: React.CSSProperties = {
            width: isCenter ? undefined : width,
            height: height,
            maxWidth: isCenter ? '90vw' : undefined,
            maxHeight: isCenter ? '90vh' : '80vh',
        };

        const popover = (
            <div
                className={cn('eui-lightbox-overlay', {
                    'eui-lightbox-overlay-backdrop': backdrop && isCenter,
                    'eui-lightbox-overlay-no-backdrop': !backdrop || !isCenter,
                })}
                onClick={isCenter ? handleBackdropClick : undefined}
            >
                <div
                    ref={popoverRef}
                    className={cn('eui-lightbox-popover', {
                        'eui-lightbox-center': isCenter,
                        'eui-lightbox-positioned': !isCenter,
                    }, className)}
                    style={isCenter ? sizeStyle : { ...popoverStyle, ...sizeStyle }}
                    role="dialog"
                    aria-modal={isCenter}
                    aria-label={ariaLabel}
                    onMouseEnter={handlePopoverMouseEnter}
                    onMouseLeave={handlePopoverMouseLeave}
                >
                    {(header || showCloseButton) && (
                        <div className="eui-lightbox-header">
                            <div className="eui-lightbox-header-content">{header}</div>
                            {showCloseButton && (
                                <button
                                    className="eui-lightbox-close"
                                    onClick={close}
                                    type="button"
                                    aria-label="Close"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                    <div className={cn('eui-lightbox-body', contentClassName)}>
                        {zoomOut ? (
                            <div
                                className="eui-lightbox-zoom-container"
                                style={{
                                    width: zoomWidth,
                                    height: zoomHeight,
                                    transform: `scale(${zoomScale})`,
                                    transformOrigin: 'top left',
                                }}
                            >
                                {content}
                            </div>
                        ) : (
                            content
                        )}
                    </div>
                    {footer && <div className="eui-lightbox-footer">{footer}</div>}
                </div>
            </div>
        );

        return createPortal(popover, document.body);
    };

    return (
        <>
            <div
                ref={triggerRef}
                className="eui-lightbox-trigger"
                onMouseEnter={handleTriggerMouseEnter}
                onMouseLeave={handleTriggerMouseLeave}
                onClick={handleTriggerClick}
                role={trigger === 'click' ? 'button' : undefined}
                tabIndex={trigger === 'click' ? 0 : undefined}
                onKeyDown={trigger === 'click' ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTriggerClick(); } } : undefined}
            >
                {children}
            </div>
            {renderContent()}
        </>
    );
};

export { Lightbox };
export type { LightboxProps, LightboxTrigger, LightboxPosition };
