import cn from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TimesIcon } from '../../assets/icons';
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

const focusableSelector = [
    'button:not([disabled])',
    '[href]:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
].join(',');

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
    ariaLabel = 'Preview',
    header,
    footer,
    onOpen,
    onClose,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const mouseDownTargetRef = useRef<EventTarget | null>(null);
    const hoverOpenTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const hoverCloseTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const onOpenRef = useRef(onOpen);
    const onCloseRef = useRef(onClose);
    onOpenRef.current = onOpen;
    onCloseRef.current = onClose;

    const open = useCallback(() => {
        if (disabled) return;
        previousFocusRef.current = document.activeElement as HTMLElement | null;
        setIsOpen(true);
        onOpenRef.current?.();
    }, [disabled]);

    const close = useCallback(() => {
        setIsOpen(false);
        onCloseRef.current?.();
        previousFocusRef.current?.focus?.();
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
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        switch (pos) {
            case 'right':
                style.left = rect.right + gap + scrollX;
                style.top = Math.max(gap, Math.min(rect.top, vh - 400)) + scrollY;
                break;
            case 'left':
                style.left = rect.left - w - gap + scrollX;
                style.top = Math.max(gap, Math.min(rect.top, vh - 400)) + scrollY;
                break;
            case 'bottom':
                style.left = Math.max(gap, rect.left) + scrollX;
                style.top = rect.bottom + gap + scrollY;
                break;
            case 'top':
                style.left = Math.max(gap, rect.left) + scrollX;
                style.top = rect.top + scrollY;
                style.transform = 'translateY(-100%)';
                break;
        }

        setPopoverStyle(style);
    }, [position, width]);

    useEffect(() => {
        if (!isOpen || position === 'center') return;
        calculatePosition();
        const handleReposition = () => calculatePosition();
        window.addEventListener('resize', handleReposition);
        window.addEventListener('scroll', handleReposition, true);
        return () => {
            window.removeEventListener('resize', handleReposition);
            window.removeEventListener('scroll', handleReposition, true);
        };
    }, [isOpen, calculatePosition, position]);

    useEffect(() => {
        if (!isOpen || !closeOnEscape) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, closeOnEscape, close]);

    useEffect(() => {
        if (!isOpen) return;
        const focusFrame = requestAnimationFrame(() => {
            const popover = popoverRef.current;
            if (!popover) return;
            const focusable = popover.querySelectorAll<HTMLElement>(focusableSelector);
            if (focusable.length > 0) focusable[0].focus();
            else popover.focus();
        });

        const handleFocusTrap = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            const popover = popoverRef.current;
            if (!popover) return;
            const focusable = Array.from(popover.querySelectorAll<HTMLElement>(focusableSelector)).filter(
                (el) => el.tabIndex !== -1,
            );
            if (focusable.length === 0) {
                e.preventDefault();
                popover.focus();
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first || !popover.contains(document.activeElement)) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last || !popover.contains(document.activeElement)) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener('keydown', handleFocusTrap);
        return () => {
            cancelAnimationFrame(focusFrame);
            document.removeEventListener('keydown', handleFocusTrap);
        };
    }, [isOpen]);

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

    const handleTriggerFocus = useCallback(() => {
        if (trigger !== 'hover' || disabled) return;
        clearTimeout(hoverCloseTimer.current);
        open();
    }, [trigger, disabled, open]);

    const handleTriggerBlur = useCallback((e: React.FocusEvent) => {
        if (trigger !== 'hover') return;
        if (popoverRef.current?.contains(e.relatedTarget as Node)) return;
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

    const handleBackdropMouseDown = useCallback((e: React.MouseEvent) => {
        mouseDownTargetRef.current = e.target;
    }, []);

    const handleBackdropMouseUp = useCallback(
        (e: React.MouseEvent) => {
            if (!closeOnBackdropClick) return;
            if (e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget) {
                close();
            }
            mouseDownTargetRef.current = null;
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

        const scaledBodyHeight = zoomOut
            ? `calc(${typeof zoomHeight === 'number' ? `${zoomHeight}px` : zoomHeight} * ${zoomScale})`
            : undefined;

        const sizeStyle: React.CSSProperties = {
            width: isCenter ? undefined : width,
            height: height,
            maxWidth: isCenter ? '90vw' : undefined,
            maxHeight: isCenter ? '90vh' : '80vh',
        };

        const popoverPanel = (
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
                tabIndex={-1}
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
                                aria-label="Close preview"
                            >
                                <TimesIcon aria-hidden="true" />
                            </button>
                        )}
                    </div>
                )}
                <div
                    className={cn('eui-lightbox-body', { 'eui-lightbox-body-zoom': zoomOut }, contentClassName)}
                    style={zoomOut ? { height: scaledBodyHeight } : undefined}
                >
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
        );

        if (!isCenter) {
            return createPortal(popoverPanel, document.body);
        }

        const overlay = (
            <div
                className={cn('eui-lightbox-overlay', {
                    'eui-lightbox-overlay-backdrop': backdrop,
                    'eui-lightbox-overlay-no-backdrop': !backdrop,
                })}
                onMouseDown={handleBackdropMouseDown}
                onMouseUp={handleBackdropMouseUp}
            >
                {popoverPanel}
            </div>
        );

        return createPortal(overlay, document.body);
    };

    return (
        <>
            <div
                ref={triggerRef}
                className="eui-lightbox-trigger"
                onMouseEnter={handleTriggerMouseEnter}
                onMouseLeave={handleTriggerMouseLeave}
                onFocus={handleTriggerFocus}
                onBlur={handleTriggerBlur}
                onClick={handleTriggerClick}
                role={trigger === 'click' ? 'button' : undefined}
                tabIndex={trigger === 'click' || trigger === 'hover' ? 0 : undefined}
                aria-haspopup={trigger === 'click' ? 'dialog' : undefined}
                aria-expanded={trigger === 'click' ? isOpen : undefined}
                onKeyDown={(e) => {
                    if (trigger === 'click' && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleTriggerClick();
                    } else if (trigger === 'hover' && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        if (isOpen) close();
                        else open();
                    }
                }}
            >
                {children}
            </div>
            {renderContent()}
        </>
    );
};

export { Lightbox };
export type { LightboxProps, LightboxTrigger, LightboxPosition };
