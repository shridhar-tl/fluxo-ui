import classNames from 'classnames';
import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { TimesIcon } from '../../assets/icons';
import './Drawer.scss';

type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    position?: DrawerPosition;
    size?: string;
    backdrop?: boolean;
    pushContent?: boolean;
    closeOnEscape?: boolean;
    closeOnBackdropClick?: boolean;
    className?: string;
    children: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
}

const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const Drawer: React.FC<DrawerProps> = ({
    open,
    onClose,
    position = 'right',
    size = '400px',
    backdrop = true,
    pushContent = false,
    closeOnEscape = true,
    closeOnBackdropClick = true,
    className,
    children,
    header,
    footer,
}) => {
    const drawerRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const $this = useRef<{ onClose: () => void }>({ onClose });
    $this.current.onClose = onClose;

    const handleFocusTrap = useCallback((e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        const drawer = drawerRef.current;
        if (!drawer) return;

        const focusableElements = drawer.querySelectorAll(focusableSelector);
        if (focusableElements.length === 0) {
            e.preventDefault();
            return;
        }

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }, []);

    useEffect(() => {
        if (!open) return;

        previousFocusRef.current = document.activeElement as HTMLElement;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && closeOnEscape) {
                $this.current.onClose();
                return;
            }
            handleFocusTrap(e);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            const focusableElements = drawerRef.current?.querySelectorAll(focusableSelector);
            if (focusableElements && focusableElements.length > 0) {
                (focusableElements[0] as HTMLElement).focus();
            } else {
                drawerRef.current?.focus();
            }
        });

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
            previousFocusRef.current?.focus();
        };
    }, [open, closeOnEscape, handleFocusTrap]);

    useEffect(() => {
        if (!pushContent) return;

        const root = document.getElementById('root') || document.body.firstElementChild as HTMLElement;
        if (!root || !(root instanceof HTMLElement)) return;

        if (open) {
            root.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            const transforms: Record<DrawerPosition, string> = {
                left: `translateX(${size})`,
                right: `translateX(-${size})`,
                top: `translateY(${size})`,
                bottom: `translateY(-${size})`,
            };
            root.style.transform = transforms[position];
        } else {
            root.style.transform = '';
        }

        return () => {
            root.style.transform = '';
            root.style.transition = '';
        };
    }, [open, pushContent, position, size]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    const isHorizontal = position === 'left' || position === 'right';
    const sizeStyle = isHorizontal ? { width: size } : { height: size };

    const drawerContent = (
        <div
            className={classNames('eui-drawer-wrapper', {
                'eui-drawer-open': open,
                'eui-drawer-no-backdrop': !backdrop,
            })}
            onClick={backdrop ? handleBackdropClick : undefined}
        >
            <div
                ref={drawerRef}
                className={classNames(
                    'eui-drawer',
                    `eui-drawer-${position}`,
                    { 'eui-drawer-visible': open },
                    className,
                )}
                style={sizeStyle}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
            >
                {header !== undefined && (
                    <div className="eui-drawer-header">
                        <div className="eui-drawer-header-content">{header}</div>
                        <button
                            className="eui-drawer-close"
                            onClick={onClose}
                            aria-label="Close drawer"
                            type="button"
                        >
                            <TimesIcon />
                        </button>
                    </div>
                )}
                <div className="eui-drawer-body">
                    {header === undefined && (
                        <button
                            className="eui-drawer-close-floating"
                            onClick={onClose}
                            aria-label="Close drawer"
                            type="button"
                        >
                            <TimesIcon />
                        </button>
                    )}
                    {children}
                </div>
                {footer && (
                    <div className="eui-drawer-footer">{footer}</div>
                )}
            </div>
        </div>
    );

    return createPortal(drawerContent, document.body);
};

export { Drawer };
export type { DrawerProps, DrawerPosition };
