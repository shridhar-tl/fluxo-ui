import classNames from 'classnames';
import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { TimesIcon } from '../assets/icons';
import './eui-base.scss';
import './Modal.scss';

interface ModalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role' | 'children' | 'title'> {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullScreen';
    closeOnBackdrop?: boolean;
    initialFocus?: React.RefObject<HTMLElement>;
    ariaLabel?: string;
}

const FOCUSABLE_SELECTOR =
    'button:not([disabled]):not([tabindex="-1"]),[href]:not([tabindex="-1"]),input:not([disabled]):not([type="hidden"]):not([tabindex="-1"]),select:not([disabled]):not([tabindex="-1"]),textarea:not([disabled]):not([tabindex="-1"]),[tabindex]:not([tabindex="-1"]):not([disabled])';

const getFocusable = (root: HTMLElement | null): HTMLElement[] => {
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
    );
};

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
    closeOnBackdrop = true,
    initialFocus,
    ariaLabel,
    ...rest
}) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const previousOverflowRef = useRef<string>('');
    const reactId = useId();
    const titleId = title ? `modal-title-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}` : undefined;
    const $this = useRef<{ onClose: () => void }>({ onClose });
    $this.current.onClose = onClose;

    useEffect(() => {
        if (!isOpen) return;

        previousFocusRef.current = document.activeElement as HTMLElement | null;
        previousOverflowRef.current = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const inertSiblings: Array<{ el: Element; hadInert: boolean; prevAriaHidden: string | null }> = [];
        if (document.body) {
            Array.from(document.body.children).forEach((child) => {
                if (child === overlayRef.current?.parentElement || child.contains(overlayRef.current)) return;
                if (child === overlayRef.current) return;
                const el = child as HTMLElement;
                const hadInert = (el as { inert?: boolean }).inert === true;
                const prevAriaHidden = el.getAttribute('aria-hidden');
                (el as { inert?: boolean }).inert = true;
                el.setAttribute('aria-hidden', 'true');
                inertSiblings.push({ el, hadInert, prevAriaHidden });
            });
        }

        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                $this.current.onClose?.();
                return;
            }
            if (event.key === 'Tab' && modalRef.current) {
                const focusables = getFocusable(modalRef.current);
                if (focusables.length === 0) {
                    event.preventDefault();
                    modalRef.current.focus();
                    return;
                }
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                const active = document.activeElement as HTMLElement | null;
                if (event.shiftKey) {
                    if (active === first || !modalRef.current.contains(active)) {
                        event.preventDefault();
                        last.focus();
                    }
                } else if (active === last || !modalRef.current.contains(active)) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKey);

        const focusTimer = window.setTimeout(() => {
            if (initialFocus?.current) {
                initialFocus.current.focus();
                return;
            }
            const focusables = getFocusable(modalRef.current);
            if (focusables.length > 0) {
                focusables[0].focus();
            } else {
                modalRef.current?.focus();
            }
        }, 0);

        return () => {
            document.removeEventListener('keydown', handleKey);
            window.clearTimeout(focusTimer);
            document.body.style.overflow = previousOverflowRef.current;

            inertSiblings.forEach(({ el, hadInert, prevAriaHidden }) => {
                if (!hadInert) (el as { inert?: boolean }).inert = false;
                if (prevAriaHidden === null) el.removeAttribute('aria-hidden');
                else el.setAttribute('aria-hidden', prevAriaHidden);
            });

            const prevFocus = previousFocusRef.current;
            if (prevFocus && document.contains(prevFocus)) {
                prevFocus.focus();
            }
        };
    }, [isOpen, initialFocus]);

    const handleBackdropMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        // Track mousedown source so drag-out doesn't trigger close
        if (event.target === overlayRef.current) {
            (overlayRef.current as HTMLElement & { _mouseDownOnBackdrop?: boolean })._mouseDownOnBackdrop = true;
        } else {
            (overlayRef.current as HTMLElement & { _mouseDownOnBackdrop?: boolean })._mouseDownOnBackdrop = false;
        }
    };

    const handleBackdropMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
        const downOnBackdrop = (overlayRef.current as HTMLElement & { _mouseDownOnBackdrop?: boolean })?._mouseDownOnBackdrop;
        if (closeOnBackdrop && event.target === overlayRef.current && downOnBackdrop) {
            onClose();
        }
        if (overlayRef.current) {
            (overlayRef.current as HTMLElement & { _mouseDownOnBackdrop?: boolean })._mouseDownOnBackdrop = false;
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div
            ref={overlayRef}
            className="eui-modal-overlay"
            onMouseDown={handleBackdropMouseDown}
            onMouseUp={handleBackdropMouseUp}
        >
            <div
                {...rest}
                ref={modalRef}
                className={classNames('eui-modal', `eui-modal-${size}`, rest.className)}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-label={!titleId ? ariaLabel : undefined}
                tabIndex={-1}
            >
                {title && (
                    <div className="eui-modal-header">
                        <h3 id={titleId} className="eui-modal-title">
                            {title}
                        </h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="eui-modal-close"
                            aria-label="Close modal"
                        >
                            <TimesIcon />
                        </button>
                    </div>
                )}
                <div className={classNames('eui-modal-body', { 'eui-modal-body-no-title': !title })}>
                    {!title && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="eui-modal-close-floating"
                            aria-label="Close modal"
                        >
                            <TimesIcon />
                        </button>
                    )}
                    {children}
                </div>
                {footer && (
                    <div className="eui-modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export { Modal };
