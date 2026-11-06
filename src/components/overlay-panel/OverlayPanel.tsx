import classNames from 'classnames';
import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TimesIcon } from '../../assets/icons';
import { useAnchoredPosition, type AnchoredPlacement } from '../../hooks/useAnchoredPosition';
import { useViewport } from '../../hooks/useMobile';
import '../eui-base.scss';
import './overlay-panel.scss';

export type OverlayPanelPlacement = AnchoredPlacement;

export interface OverlayPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children' | 'role'> {
    isOpen: boolean;
    target: HTMLElement | null;
    onClose: () => void;
    children: React.ReactNode;
    title?: React.ReactNode;
    footer?: React.ReactNode;
    placement?: OverlayPanelPlacement;
    width?: string | number;
    maxHeight?: string | number;
    showCloseButton?: boolean;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    autoFocus?: boolean;
    ariaLabel?: string;
}

const toCssSize = (value: string | number | undefined) => (typeof value === 'number' ? `${value}px` : value);

export const OverlayPanel = ({
    isOpen,
    target,
    onClose,
    children,
    title,
    footer,
    placement = 'auto',
    width = '20rem',
    maxHeight = '24rem',
    showCloseButton = true,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    autoFocus = true,
    ariaLabel,
    className,
    style,
    ...nativeProps
}: OverlayPanelProps) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const [isPositioned, setIsPositioned] = useState(false);
    const { calculatePosition } = useAnchoredPosition();
    const { isCompact } = useViewport();
    const titleId = `eui-overlay-panel-title-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

    const reposition = useCallback(() => {
        if (panelRef.current && target && !isCompact) {
            calculatePosition(target, panelRef.current, placement);
            setIsPositioned(true);
        }
    }, [target, placement, isCompact, calculatePosition]);

    useLayoutEffect(() => {
        if (!isOpen) {
            setIsPositioned(false);
            return;
        }
        reposition();
    }, [isOpen, reposition]);

    useEffect(() => {
        if (!isOpen || isCompact) return;

        const panel = panelRef.current;
        const resizeObserver = typeof ResizeObserver !== 'undefined' && panel ? new ResizeObserver(reposition) : null;
        if (resizeObserver && panel) resizeObserver.observe(panel);

        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);

        return () => {
            resizeObserver?.disconnect();
            window.removeEventListener('scroll', reposition, true);
            window.removeEventListener('resize', reposition);
        };
    }, [isOpen, isCompact, reposition]);

    useEffect(() => {
        if (!isOpen || !closeOnOutsideClick) return;

        const handleMouseDown = (e: MouseEvent) => {
            const node = e.target as Node;
            if (panelRef.current?.contains(node) || target?.contains(node)) return;
            onCloseRef.current();
        };

        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [isOpen, closeOnOutsideClick, target]);

    useEffect(() => {
        if (!isOpen || !closeOnEscape) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onCloseRef.current();
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [isOpen, closeOnEscape]);

    useEffect(() => {
        if (!isOpen || !autoFocus) return;

        previousFocusRef.current = document.activeElement as HTMLElement | null;
        panelRef.current?.focus();

        return () => {
            previousFocusRef.current?.focus?.();
        };
    }, [isOpen, autoFocus]);

    useEffect(() => {
        if (!isOpen || !isCompact) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen, isCompact]);

    if (!isOpen || (!target && !isCompact)) {
        return null;
    }

    const panel = (
        <div
            {...nativeProps}
            ref={panelRef}
            role="dialog"
            aria-modal={isCompact || undefined}
            aria-label={title ? undefined : ariaLabel}
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            className={classNames('eui-overlay-panel', className, {
                'eui-overlay-panel-compact': isCompact,
                'eui-overlay-panel-visible': isCompact || isPositioned,
            })}
            style={{ ...style, width: isCompact ? undefined : toCssSize(width) }}
        >
            {(title || showCloseButton) && (
                <div className="eui-overlay-panel-header">
                    {title && (
                        <div id={titleId} className="eui-overlay-panel-title">
                            {title}
                        </div>
                    )}
                    {showCloseButton && (
                        <button type="button" className="eui-overlay-panel-close" onClick={onClose} aria-label="Close">
                            <TimesIcon />
                        </button>
                    )}
                </div>
            )}
            <div className="eui-overlay-panel-body" style={isCompact ? undefined : { maxHeight: toCssSize(maxHeight) }}>
                {children}
            </div>
            {footer && <div className="eui-overlay-panel-footer">{footer}</div>}
        </div>
    );

    if (isCompact) {
        return createPortal(
            <div className="eui-overlay-panel-backdrop" onMouseDown={(e) => e.target === e.currentTarget && closeOnOutsideClick && onClose()}>
                {panel}
            </div>,
            document.body,
        );
    }

    return createPortal(panel, document.body);
};

export default OverlayPanel;
